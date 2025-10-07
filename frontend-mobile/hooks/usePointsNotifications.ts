/**
 * Points notification hook
 * Shows toast notifications when user earns points
 */

import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';
import { useAuth } from '@/contexts/AuthContext';

interface PointsEvent {
  amount: number;
  reason: string;
  showConfetti?: boolean;
}

export function usePointsNotifications() {
  const { user } = useAuth();
  const previousPoints = useRef<number>(user?.points || 0);

  useEffect(() => {
    if (!user) return;

    const currentPoints = user.points;
    const pointsDiff = currentPoints - previousPoints.current;

    // Only show notification if points increased
    if (pointsDiff > 0) {
      console.log(`🎉 Points increased by ${pointsDiff}!`);
      previousPoints.current = currentPoints;
    }
  }, [user?.points]);

  const showPointsToast = ({ amount, reason, showConfetti = false }: PointsEvent) => {
    // Determine emoji based on amount
    let emoji = '🎉';
    if (amount >= 5) emoji = '🏆';
    else if (amount >= 2) emoji = '⭐';
    else if (amount >= 1) emoji = '👍';

    toast.success(`+${amount} point${amount !== 1 ? 's' : ''}! ${emoji}`, {
      description: reason,
      duration: 4000,
    });

    if (showConfetti) {
      confetti({
        particleCount: amount >= 5 ? 150 : 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  };

  const showVerificationToast = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#10b981', '#3b82f6', '#f59e0b'],
    });

    toast.success('+2 bonus points! Report Verified! ✅', {
      description: 'Your report was confirmed by the community',
      duration: 5000,
      className: 'font-semibold',
    });
  };

  const showResolutionToast = (commutersHelped: number) => {
    confetti({
      particleCount: 50,
      spread: 50,
      origin: { y: 0.6 },
    });

    toast.success('Mission Complete! 🏆', {
      description: `Your report helped ${commutersHelped} commuters!`,
      duration: 5000,
    });
  };

  return {
    showPointsToast,
    showVerificationToast,
    showResolutionToast,
  };
}
