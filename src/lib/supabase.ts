/**
 * Supabase client configuration for StreetRadar analytics
 */

import { createClient } from '@supabase/supabase-js';

// Check that environment variables are present
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// TypeScript interfaces for our tables
export interface PageView {
  id?: string;
  created_at?: string;
  page_path: string;
  user_agent?: string;
  country?: string;
  city?: string;
  referrer?: string;
  session_id?: string;
}

export interface MapInteraction {
  id?: string;
  created_at?: string;
  interaction_type: 'click' | 'layer_toggle' | 'zoom' | 'pan' | 'pegcat_drop';
  provider?: 'google' | 'bing' | 'yandex' | 'apple';
  latitude?: number;
  longitude?: number;
  zoom_level?: number;
  session_id?: string;
  user_agent?: string;
}