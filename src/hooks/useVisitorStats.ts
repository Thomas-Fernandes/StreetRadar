/**
 * Hook to fetch visitor statistics from the daily_stats table (populated by Cloudflare sync)
 */

'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface VisitorStats {
  thisMonth: number;
  thisWeek: number;
  loading: boolean;
  error: string | null;
}

export function useVisitorStats(): VisitorStats {
  const [stats, setStats] = useState<VisitorStats>({
    thisMonth: 0,
    thisWeek: 0,
    loading: true,
    error: null
  });

  useEffect(() => {
    async function fetchStats() {
      try {
        const now = new Date();
        
        // Calculate dates
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday as start of week
        startOfWeek.setHours(0, 0, 0, 0);

        // Format dates for SQL
        const monthStart = startOfMonth.toISOString().split('T')[0];
        const weekStart = startOfWeek.toISOString().split('T')[0];

        // Fetch monthly stats
        const { data: monthlyData, error: monthlyError } = await supabase
          .from('daily_stats')
          .select('page_views')
          .gte('date', monthStart);

        if (monthlyError) throw monthlyError;

        // Fetch weekly stats
        const { data: weeklyData, error: weeklyError } = await supabase
          .from('daily_stats')
          .select('page_views')
          .gte('date', weekStart);

        if (weeklyError) throw weeklyError;

        // Sum page views
        const monthlyTotal = monthlyData?.reduce((sum, day) => sum + day.page_views, 0) || 0;
        const weeklyTotal = weeklyData?.reduce((sum, day) => sum + day.page_views, 0) || 0;

        setStats({
          thisMonth: monthlyTotal,
          thisWeek: weeklyTotal,
          loading: false,
          error: null
        });
      } catch (error) {
        console.error('Error fetching visitor stats:', error);
        setStats(prev => ({
          ...prev,
          loading: false,
          error: 'Failed to load stats'
        }));
      }
    }

    fetchStats();
  }, []);

  return stats;
}