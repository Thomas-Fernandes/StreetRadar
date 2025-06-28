/**
 * Hook to fetch visitor statistics from Supabase
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

        // Fetch page views for this month
        const { data: monthlyViews, error: monthlyError } = await supabase
          .from('page_views')
          .select('session_id')
          .gte('created_at', startOfMonth.toISOString());

        if (monthlyError) throw monthlyError;

        // Fetch page views for this week
        const { data: weeklyViews, error: weeklyError } = await supabase
          .from('page_views')
          .select('session_id')
          .gte('created_at', startOfWeek.toISOString());

        if (weeklyError) throw weeklyError;

        // Count unique visitors
        const uniqueMonthlyVisitors = new Set(monthlyViews?.map(v => v.session_id) || []).size;
        const uniqueWeeklyVisitors = new Set(weeklyViews?.map(v => v.session_id) || []).size;

        setStats({
          thisMonth: uniqueMonthlyVisitors,
          thisWeek: uniqueWeeklyVisitors,
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