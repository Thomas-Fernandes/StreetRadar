/**
 * AnalyticsTracker.tsx
 * 
 * Component that automatically tracks page views and route changes
 */

'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { analytics } from '@/services/analyticsService';

export default function AnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    // Track page view when component mounts or pathname changes
    analytics.trackPageView(pathname);
  }, [pathname]);

  // This component renders nothing
  return null;
}