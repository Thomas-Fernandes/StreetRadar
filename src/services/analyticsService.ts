/**
 * Analytics service for tracking user interactions in StreetRadar
 */

import { supabase, PageView, MapInteraction } from '@/lib/supabase';

class AnalyticsService {
  private sessionId: string;

  constructor() {
    // Generate a session ID that persists during the browser session
    this.sessionId = this.getOrCreateSessionId();
  }

  /**
   * Get or create a session ID for this browser session
   */
  private getOrCreateSessionId(): string {
    if (typeof window === 'undefined') return 'server';
    
    let sessionId = sessionStorage.getItem('streetradar_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2)}`;
      sessionStorage.setItem('streetradar_session_id', sessionId);
    }
    return sessionId;
  }

  /**
   * Get user agent safely
   */
  private getUserAgent(): string {
    if (typeof window === 'undefined') return 'server';
    return navigator.userAgent;
  }

  /**
   * Track a page view
   */
  async trackPageView(pagePath: string): Promise<void> {
    try {
      const pageView: PageView = {
        page_path: pagePath,
        user_agent: this.getUserAgent(),
        referrer: typeof window !== 'undefined' ? document.referrer : undefined,
        session_id: this.sessionId,
      };

      const { error } = await supabase
        .from('page_views')
        .insert([pageView]);

      if (error) {
        console.error('Error tracking page view:', error);
      }
    } catch (error) {
      console.error('Failed to track page view:', error);
    }
  }

  /**
   * Track a map interaction
   */
  async trackMapInteraction(
    interactionType: MapInteraction['interaction_type'],
    options: {
      provider?: MapInteraction['provider'];
      latitude?: number;
      longitude?: number;
      zoomLevel?: number;
    } = {}
  ): Promise<void> {
    try {
      const interaction: MapInteraction = {
        interaction_type: interactionType,
        provider: options.provider,
        latitude: options.latitude,
        longitude: options.longitude,
        zoom_level: options.zoomLevel,
        session_id: this.sessionId,
        user_agent: this.getUserAgent(),
      };

      const { error } = await supabase
        .from('map_interactions')
        .insert([interaction]);

      if (error) {
        console.error('Error tracking map interaction:', error);
      }
    } catch (error) {
      console.error('Failed to track map interaction:', error);
    }
  }

  /**
   * Track layer toggle
   */
  async trackLayerToggle(provider: MapInteraction['provider'], enabled: boolean): Promise<void> {
    await this.trackMapInteraction('layer_toggle', { 
      provider: provider,
    });
  }

  /**
   * Track map click
   */
  async trackMapClick(latitude: number, longitude: number, zoomLevel: number): Promise<void> {
    await this.trackMapInteraction('click', {
      latitude,
      longitude,
      zoomLevel,
    });
  }

  /**
   * Track PegCat drop
   */
  async trackPegcatDrop(latitude: number, longitude: number, zoomLevel: number): Promise<void> {
    await this.trackMapInteraction('pegcat_drop', {
      latitude,
      longitude,
      zoomLevel,
    });
  }

  /**
   * Get analytics data (for the analytics page)
   */
  async getAnalyticsData() {
    try {
      // Get page views in the last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: pageViews, error: pageViewsError } = await supabase
        .from('page_views')
        .select('*')
        .gte('created_at', thirtyDaysAgo.toISOString());

      if (pageViewsError) throw pageViewsError;

      // Get map interactions in the last 30 days
      const { data: mapInteractions, error: mapInteractionsError } = await supabase
        .from('map_interactions')
        .select('*')
        .gte('created_at', thirtyDaysAgo.toISOString());

      if (mapInteractionsError) throw mapInteractionsError;

      // Calculate statistics
      const totalVisitors = new Set(pageViews?.map(pv => pv.session_id)).size;
      const totalPageViews = pageViews?.length || 0;
      const totalMapInteractions = mapInteractions?.length || 0;

      // Provider popularity
      const providerStats = mapInteractions
        ?.filter(mi => mi.interaction_type === 'layer_toggle' && mi.provider)
        .reduce((acc, mi) => {
          acc[mi.provider!] = (acc[mi.provider!] || 0) + 1;
          return acc;
        }, {} as Record<string, number>) || {};

      // Daily visitors
      const dailyVisitors = pageViews
        ?.reduce((acc, pv) => {
          const date = new Date(pv.created_at!).toISOString().split('T')[0];
          if (!acc[date]) acc[date] = new Set();
          acc[date].add(pv.session_id);
          return acc;
        }, {} as Record<string, Set<string>>) || {};

      const dailyVisitorsCount = Object.entries(dailyVisitors).map(([date, sessions]) => ({
        date,
        visitors: sessions.size,
      }));

      return {
        totalVisitors,
        totalPageViews,
        totalMapInteractions,
        providerStats,
        dailyVisitors: dailyVisitorsCount,
      };
    } catch (error) {
      console.error('Failed to get analytics data:', error);
      return null;
    }
  }
}

// Export a singleton instance
export const analytics = new AnalyticsService();