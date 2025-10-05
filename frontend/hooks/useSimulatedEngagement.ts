/**
 * Simulated engagement hook for hackathon demo
 * Auto-generates upvotes on user's reports to showcase the gamification flow
 */

import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

interface SimulatedEngagementOptions {
  reportId: string;
  onUpvote: (reportId: string) => void;
  onVerified: (reportId: string) => void;
  enabled?: boolean;
}

export function useSimulatedEngagement({
  reportId,
  onUpvote,
  onVerified,
  enabled = true,
}: SimulatedEngagementOptions) {
  const timersRef = useRef<NodeJS.Timeout[]>([]);

  useEffect(() => {
    if (!enabled || !reportId) return;

    console.log(`🎬 Starting simulated engagement for report ${reportId}`);

    // First upvote after 5 seconds
    const timer1 = setTimeout(() => {
      console.log('📈 Simulated upvote #1');
      onUpvote(reportId);
      toast.success('+1 point! Someone upvoted your report 👍', {
        description: 'Your community is engaged!',
        duration: 3000,
      });
    }, 5000);

    // Second upvote after 10 seconds
    const timer2 = setTimeout(() => {
      console.log('📈 Simulated upvote #2');
      onUpvote(reportId);
      toast.success('+1 point! 👍', {
        description: 'Another commuter confirmed your report',
        duration: 3000,
      });
    }, 10000);

    // Third upvote after 15 seconds (triggers verification)
    const timer3 = setTimeout(() => {
      console.log('📈 Simulated upvote #3 - VERIFICATION!');
      onUpvote(reportId);
      
      // Small delay to let upvote register, then verify
      setTimeout(() => {
        onVerified(reportId);
        
        // Big celebration with confetti
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#10b981', '#3b82f6', '#f59e0b'],
        });

        toast.success('+2 bonus points! Report Verified! ✅', {
          description: 'Your report was confirmed by the community',
          duration: 5000,
          className: 'text-lg font-semibold',
        });
      }, 500);
    }, 15000);

    timersRef.current = [timer1, timer2, timer3];

    // Cleanup function
    return () => {
      console.log('🧹 Cleaning up simulated engagement timers');
      timersRef.current.forEach(timer => clearTimeout(timer));
      timersRef.current = [];
    };
  }, [reportId, onUpvote, onVerified, enabled]);

  // Manual cleanup method
  const cleanup = () => {
    timersRef.current.forEach(timer => clearTimeout(timer));
    timersRef.current = [];
  };

  return { cleanup };
}
