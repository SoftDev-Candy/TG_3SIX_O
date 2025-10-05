/**
 * Simulates community activity on other reports
 * Makes the app feel alive with random upvotes happening
 */

import { useEffect, useRef } from 'react';
import type { DelayReport } from '@/types';

interface CommunityActivityOptions {
  reports: DelayReport[];
  currentUserId?: string;
  onUpvote: (reportId: string) => void;
  onVerified: (reportId: string) => void;
  enabled?: boolean;
}

export function useCommunityActivity({
  reports,
  currentUserId,
  onUpvote,
  onVerified,
  enabled = true,
}: CommunityActivityOptions) {
  const timersRef = useRef<NodeJS.Timeout[]>([]);

  useEffect(() => {
    if (!enabled || reports.length === 0) {
      return;
    }

    console.log('🌐 Starting community activity simulation');
    const timers: NodeJS.Timeout[] = [];

    // Filter out user's own reports and already resolved reports
    const eligibleReports = reports.filter(
      r => r.userId !== currentUserId && r.status !== 'resolved'
    );

    if (eligibleReports.length === 0) {
      console.log('No eligible reports for community activity');
      return;
    }

    // Schedule random community upvotes on different reports
    const intervals = [7000, 12000, 18000, 25000, 33000]; // Different timing for variety
    
    intervals.forEach((delay, index) => {
      const timer = setTimeout(() => {
        // Pick a random eligible report
        const randomIndex = Math.floor(Math.random() * eligibleReports.length);
        const report = eligibleReports[randomIndex];
        
        if (report) {
          onUpvote(report.id);
          console.log(`👥 Community upvoted report ${report.id.substring(0, 8)}...`);
        }
      }, delay);
      
      timers.push(timer);
    });

    timersRef.current = timers;

    return () => {
      console.log(`🧹 Cleaning up ${timersRef.current.length} community activity timers`);
      timersRef.current.forEach(timer => clearTimeout(timer));
      timersRef.current = [];
    };
  }, [reports.length, currentUserId, onUpvote, enabled]); // Re-run when reports count changes

  return null;
}
