// scripts/sync-daily-stats.js
// Script pour synchroniser les stats Cloudflare vers Supabase
// Usage: node scripts/sync-daily-stats.js

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Configuration depuis les variables d'environnement
const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const ZONE_ID = process.env.ZONE_ID;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

// Vérifier que toutes les variables sont présentes
if (!CLOUDFLARE_API_TOKEN || !ZONE_ID || !SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Variables d\'environnement manquantes:');
  if (!CLOUDFLARE_API_TOKEN) console.error('  - CLOUDFLARE_API_TOKEN');
  if (!ZONE_ID) console.error('  - ZONE_ID');
  if (!SUPABASE_URL) console.error('  - SUPABASE_URL');
  if (!SUPABASE_SERVICE_KEY) console.error('  - SUPABASE_SERVICE_KEY');
  process.exit(1);
}

// Initialiser Supabase avec la service key
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Fonction utilitaire pour convertir bytes en MB
function bytesToMB(bytes) {
  return Math.round((bytes / (1024 * 1024)) * 100) / 100; // 2 décimales
}

// Fonction principale
async function syncDailyStats() {
  console.log('🔄 Synchronisation des statistiques quotidiennes...\n');
  
  try {
    // 1. Récupérer les données des 7 derniers jours depuis Cloudflare
    const stats = await fetchCloudflareStats();
    console.log(`📊 ${stats.length} jours récupérés depuis Cloudflare`);
    
    // 2. Traiter et insérer chaque jour
    let insertedCount = 0;
    let updatedCount = 0;
    
    for (const dayStat of stats) {
      const result = await upsertDayStats(dayStat);
      if (result.inserted) insertedCount++;
      if (result.updated) updatedCount++;
    }
    
    console.log(`✅ Synchronisation terminée:`);
    console.log(`   • ${insertedCount} nouveaux jours ajoutés`);
    console.log(`   • ${updatedCount} jours mis à jour`);
    
  } catch (error) {
    console.error('❌ Erreur durant la synchronisation:', error.message);
    process.exit(1);
  }
}

// Récupérer les stats depuis Cloudflare
async function fetchCloudflareStats() {
  // Récupérer les 7 derniers jours
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 7);
  
  const startDateStr = startDate.toISOString().split('T')[0];
  const endDateStr = endDate.toISOString().split('T')[0];
  
  console.log(`📅 Récupération période: ${startDateStr} à ${endDateStr}`);
  
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
  
  const data = await response.json();
  
  if (data.errors) {
    throw new Error(`GraphQL Errors: ${JSON.stringify(data.errors)}`);
  }
  
  if (!data.data?.viewer?.zones?.[0]) {
    throw new Error('Aucune zone trouvée dans la réponse Cloudflare');
  }
  
  const rawStats = data.data.viewer.zones[0].httpRequests1dGroups;
  
  // Transformer les données au format de notre table
  return rawStats.map(day => ({
    date: day.dimensions.date,
    requests: day.sum.requests,
    page_views: day.sum.pageViews,
    cache_percent: day.sum.requests > 0 ? 
      Math.round((day.sum.cachedRequests / day.sum.requests) * 1000) / 10 : 0, // 1 décimale
    data_served_mb: bytesToMB(day.sum.bytes),
    cache_data_mb: bytesToMB(day.sum.cachedBytes)
  }));
}

// Insérer ou mettre à jour un jour dans Supabase
async function upsertDayStats(dayStats) {
  console.log(`📝 Traitement du ${dayStats.date}...`);
  
  // Vérifier si le jour existe déjà
  const { data: existing } = await supabase
    .from('daily_stats')
    .select('id')
    .eq('date', dayStats.date)
    .single();
  
  if (existing) {
    // Mettre à jour
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
      throw new Error(`Erreur mise à jour ${dayStats.date}: ${error.message}`);
    }
    
    console.log(`   ✏️  Mis à jour: ${dayStats.page_views} vues, ${dayStats.cache_percent}% cache`);
    return { updated: true, inserted: false };
    
  } else {
    // Insérer nouveau
    const { error } = await supabase
      .from('daily_stats')
      .insert([dayStats]);
    
    if (error) {
      throw new Error(`Erreur insertion ${dayStats.date}: ${error.message}`);
    }
    
    console.log(`   ➕ Ajouté: ${dayStats.page_views} vues, ${dayStats.cache_percent}% cache`);
    return { updated: false, inserted: true };
  }
}

// Lancer la synchronisation
if (require.main === module) {
  syncDailyStats();
}

// Fonction utilitaire pour convertir bytes en MB
function bytesToMB(bytes) {
  return Math.round((bytes / (1024 * 1024)) * 100) / 100; // 2 décimales
}

// Fonction principale
async function syncDailyStats() {
  console.log('🔄 Synchronisation des statistiques quotidiennes...\n');
  
  try {
    // 1. Récupérer les données des 7 derniers jours depuis Cloudflare
    const stats = await fetchCloudflareStats();
    console.log(`📊 ${stats.length} jours récupérés depuis Cloudflare`);
    
    // 2. Traiter et insérer chaque jour
    let insertedCount = 0;
    let updatedCount = 0;
    
    for (const dayStat of stats) {
      const result = await upsertDayStats(dayStat);
      if (result.inserted) insertedCount++;
      if (result.updated) updatedCount++;
    }
    
    console.log(`✅ Synchronisation terminée:`);
    console.log(`   • ${insertedCount} nouveaux jours ajoutés`);
    console.log(`   • ${updatedCount} jours mis à jour`);
    
  } catch (error) {
    console.error('❌ Erreur durant la synchronisation:', error.message);
    process.exit(1);
  }
}

// Récupérer les stats depuis Cloudflare
async function fetchCloudflareStats() {
  // Récupérer les 7 derniers jours
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 7);
  
  const startDateStr = startDate.toISOString().split('T')[0];
  const endDateStr = endDate.toISOString().split('T')[0];
  
  console.log(`📅 Récupération période: ${startDateStr} à ${endDateStr}`);
  
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
  
  const data = await response.json();
  
  if (data.errors) {
    throw new Error(`GraphQL Errors: ${JSON.stringify(data.errors)}`);
  }
  
  if (!data.data?.viewer?.zones?.[0]) {
    throw new Error('Aucune zone trouvée dans la réponse Cloudflare');
  }
  
  const rawStats = data.data.viewer.zones[0].httpRequests1dGroups;
  
  // Transformer les données au format de notre table
  return rawStats.map(day => ({
    date: day.dimensions.date,
    requests: day.sum.requests,
    page_views: day.sum.pageViews,
    cache_percent: day.sum.requests > 0 ? 
      Math.round((day.sum.cachedRequests / day.sum.requests) * 1000) / 10 : 0, // 1 décimale
    data_served_mb: bytesToMB(day.sum.bytes),
    cache_data_mb: bytesToMB(day.sum.cachedBytes)
  }));
}

// Insérer ou mettre à jour un jour dans Supabase
async function upsertDayStats(dayStats) {
  console.log(`📝 Traitement du ${dayStats.date}...`);
  
  // Vérifier si le jour existe déjà
  const { data: existing } = await supabase
    .from('daily_stats')
    .select('id')
    .eq('date', dayStats.date)
    .single();
  
  if (existing) {
    // Mettre à jour
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
      throw new Error(`Erreur mise à jour ${dayStats.date}: ${error.message}`);
    }
    
    console.log(`   ✏️  Mis à jour: ${dayStats.page_views} vues, ${dayStats.cache_percent}% cache`);
    return { updated: true, inserted: false };
    
  } else {
    // Insérer nouveau
    const { error } = await supabase
      .from('daily_stats')
      .insert([dayStats]);
    
    if (error) {
      throw new Error(`Erreur insertion ${dayStats.date}: ${error.message}`);
    }
    
    console.log(`   ➕ Ajouté: ${dayStats.page_views} vues, ${dayStats.cache_percent}% cache`);
    return { updated: false, inserted: true };
  }
}

// Lancer la synchronisation
if (require.main === module) {
  syncDailyStats();
}