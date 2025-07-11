// scripts/sync-daily-stats.ts
// Script to synchronize Cloudflare stats to Supabase
// Usage: npx tsx scripts/sync-daily-stats.ts

import 'dotenv/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Types for Cloudflare GraphQL response
interface CloudflareStatsResponse {
  data: {
    viewer: {
      zones: Array<{
        httpRequests1dGroups: Array<{
          dimensions: {
            date: string;
          };
          sum: {
            requests: number;
            pageViews: number;
            cachedRequests: number;
            bytes: number;
            cachedBytes: number;
          };
        }>;
      }>;
    };
  };
  errors?: Array<{ message: string }>;
}

// Type for our processed daily stats
interface DayStats {
  date: string;
  requests: number;
  page_views: number;
  cache_percent: number;
  data_served_mb: number;
  cache_data_mb: number;
}

// Type for upsert operation result
interface UpsertResult {
  inserted: boolean;
  updated: boolean;
}

// Configuration from environment variables
const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const ZONE_ID = process.env.ZONE_ID;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

// Check that all variables are present
if (!CLOUDFLARE_API_TOKEN || !ZONE_ID || !SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing environment variables:');
  if (!CLOUDFLARE_API_TOKEN) console.error('  - CLOUDFLARE_API_TOKEN');
  if (!ZONE_ID) console.error('  - ZONE_ID');
  if (!SUPABASE_URL) console.error('  - SUPABASE_URL');
  if (!SUPABASE_SERVICE_KEY) console.error('  - SUPABASE_SERVICE_KEY');
  process.exit(1);
}

// Initialize Supabase with the service key
const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Utility function to convert bytes to MB
function bytesToMB(bytes: number): number {
  return Math.round((bytes / (1024 * 1024)) * 100) / 100; // 2 decimal places
}

// Main function
async function syncDailyStats(): Promise<void> {
  console.log('🔄 Synchronizing daily statistics...\n');
  
  try {
    // 1. Fetch data from the last 7 days from Cloudflare
    const stats = await fetchCloudflareStats();
    console.log(`📊 ${stats.length} days fetched from Cloudflare`);
    
    // 2. Process and insert each day
    let insertedCount = 0;
    let updatedCount = 0;
    
    for (const dayStat of stats) {
      const result = await upsertDayStats(dayStat);
      if (result.inserted) insertedCount++;
      if (result.updated) updatedCount++;
    }
    
    console.log(`✅ Synchronization completed:`);
    console.log(`   • ${insertedCount} new days added`);
    console.log(`   • ${updatedCount} days updated`);
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Error during synchronization:', errorMessage);
    process.exit(1);
  }
}

// Fetch stats from Cloudflare
async function fetchCloudflareStats(): Promise<DayStats[]> {
  // Fetch the last 7 days
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 7);
  
  const startDateStr = startDate.toISOString().split('T')[0];
  const endDateStr = endDate.toISOString().split('T')[0];
  
  console.log(`📅 Fetching period: ${startDateStr} to ${endDateStr}`);
  
  const query = `
    query {
      viewer {
        zones(filter: { zoneTag: "${ZONE_ID}" }) {
          httpRequests1dGroups(
            filter: {
              date_geq: "${startDateStr}",
              date_leq: "${endDateStr}"
            }
            limit: 7
            orderBy: [date_ASC]
          ) {
            dimensions {
              date
            }
            sum {
              requests
              pageViews
              cachedRequests
              bytes
              cachedBytes
            }
          }
        }
      }
    }
  `;
  
  const response = await fetch('https://api.cloudflare.com/client/v4/graphql', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query })
  });
  
  if (!response.ok) {
    throw new Error(`Cloudflare API Error: ${response.status} ${response.statusText}`);
  }
  
  const data: CloudflareStatsResponse = await response.json();
  
  if (data.errors) {
    throw new Error(`GraphQL Errors: ${JSON.stringify(data.errors)}`);
  }
  
  if (!data.data?.viewer?.zones?.[0]) {
    throw new Error('No zone found in Cloudflare response');
  }
  
  const rawStats = data.data.viewer.zones[0].httpRequests1dGroups;
  
  // Transform data to our table format
  return rawStats.map(day => ({
    date: day.dimensions.date,
    requests: day.sum.requests,
    page_views: day.sum.pageViews,
    cache_percent: day.sum.requests > 0 ? 
      Math.round((day.sum.cachedRequests / day.sum.requests) * 1000) / 10 : 0, // 1 decimal place
    data_served_mb: bytesToMB(day.sum.bytes),
    cache_data_mb: bytesToMB(day.sum.cachedBytes)
  }));
}

// Insert or update a day in Supabase
async function upsertDayStats(dayStats: DayStats): Promise<UpsertResult> {
  console.log(`📝 Processing ${dayStats.date}...`);
  
  // Check if the day already exists
  const { data: existing } = await supabase
    .from('daily_stats')
    .select('id')
    .eq('date', dayStats.date)
    .single();
  
  if (existing) {
    // Update
    const { error } = await supabase
      .from('daily_stats')
      .update({
        requests: dayStats.requests,
        page_views: dayStats.page_views,
        cache_percent: dayStats.cache_percent,
        data_served_mb: dayStats.data_served_mb,
        cache_data_mb: dayStats.cache_data_mb
      })
      .eq('date', dayStats.date);
    
    if (error) {
      throw new Error(`Update error ${dayStats.date}: ${error.message}`);
    }
    
    console.log(`   ✏️  Updated: ${dayStats.page_views} views, ${dayStats.cache_percent}% cache`);
    return { updated: true, inserted: false };
    
  } else {
    // Insert new
    const { error } = await supabase
      .from('daily_stats')
      .insert([dayStats]);
    
    if (error) {
      throw new Error(`Insert error ${dayStats.date}: ${error.message}`);
    }
    
    console.log(`   ➕ Added: ${dayStats.page_views} views, ${dayStats.cache_percent}% cache`);
    return { updated: false, inserted: true };
  }
}

// Launch synchronization
if (require.main === module) {
  syncDailyStats();
} 