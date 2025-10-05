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
  onResolved: (reportId: string) => void;
  enabled?: boolean;
}

export function useSimulatedEngagement({
  reportId,
  onUpvote,
  onVerified,
  onResolved,
  enabled = true,
}: SimulatedEngagementOptions) {
  const timersRef = useRef<NodeJS.Timeout[]>([]);

  useEffect(() => {
    if (!enabled || !reportId) {
      console.log('⏸️ Simulated engagement disabled or no reportId');
      return;
    }

    console.log(`🎬 Starting simulated engagement for report ${reportId}`);

    // Fixed 6 upvotes before resolution
    const totalUpvotesNeeded = 6;
    console.log(`📊 Target: ${totalUpvotesNeeded} total upvotes before resolution`);
    const timers: NodeJS.Timeout[] = [];
    
    // First upvote after 3 seconds
    const timer1 = setTimeout(() => {
      console.log('📈 Simulated upvote #1');
      onUpvote(reportId);
      toast.success('+1 point! Someone upvoted your report 👍', {
        duration: 2000,
      });
    }, 3000);
    timers.push(timer1);

    // Second upvote after 6 seconds
    const timer2 = setTimeout(() => {
      console.log('📈 Simulated upvote #2');
      onUpvote(reportId);
      toast.success('+1 point! 👍', {
        duration: 2000,
      });
    }, 6000);
    timers.push(timer2);

    // Third upvote after 9 seconds (triggers verification)
    const timer3 = setTimeout(() => {
      console.log('📈 Simulated upvote #3 - VERIFICATION!');
      onUpvote(reportId);
      
      // Small delay to let upvote register, then verify (no separate upvote toast)
      setTimeout(() => {
        onVerified(reportId);
        
        toast.success(`✅ Report Verified! +3 points total`, {
          duration: 2500,
        });
      }, 500);
    }, 9000);
    timers.push(timer3);

    // Additional upvotes (4th, 5th, etc.) every 2.5 seconds until we reach totalUpvotesNeeded
    let currentUpvotes = 3;
    let nextUpvoteDelay = 11500; // Start 2.5 seconds after verification
    
    while (currentUpvotes < totalUpvotesNeeded) {
      currentUpvotes++;
      const upvoteNum = currentUpvotes;
      
      const timer = setTimeout(() => {
        console.log(`📈 Simulated upvote #${upvoteNum}`);
        onUpvote(reportId);
        toast.success('+1 point! 👍', {
          duration: 1500,
        });
      }, nextUpvoteDelay);
      timers.push(timer);
      nextUpvoteDelay += 2500; // 2.5 seconds between each upvote
    }

    // Resolution after reaching target upvotes (6th upvote)
    const resolutionDelay = nextUpvoteDelay + 2000;
    console.log(`⏰ Resolution scheduled in ${resolutionDelay}ms (${resolutionDelay/1000}s)`);
    
    const resolutionTimer = setTimeout(() => {
      console.log(`🎊 RESOLVED! Report completed with ${totalUpvotesNeeded} upvotes`);
      onResolved(reportId);
      
      // Epic celebration with confetti
      confetti({
        particleCount: 150,
        spread: 90,
        origin: { y: 0.6 },
        colors: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'],
      });

      const totalPoints = 1 + totalUpvotesNeeded + 2; // base + upvotes + verification bonus
      
      toast.success(`🎊 Report Resolved! Total: ${totalPoints} points earned!`, {
        duration: 5000,
        className: 'text-lg font-semibold',
      });
    }, nextUpvoteDelay + 2000); // 2 seconds after last upvote
    timers.push(resolutionTimer);

    timersRef.current = timers;

    // Cleanup function
    return () => {
      console.log(`🧹 Cleaning up ${timersRef.current.length} timers for report ${reportId}`);
      timersRef.current.forEach(timer => clearTimeout(timer));
      timersRef.current = [];
    };
  }, [reportId, onUpvote, onVerified, onResolved, enabled]);

  // Manual cleanup method
  const cleanup = () => {
    timersRef.current.forEach(timer => clearTimeout(timer));
    timersRef.current = [];
  };

  return { cleanup };
}
