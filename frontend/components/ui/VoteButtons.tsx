'use client';

import { useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { VoteStats } from '@/types';
import { cn } from '@/lib/utils';

interface VoteButtonsProps {
  reportId: string;
  voteStats: VoteStats;
  onVote: (reportId: string, voteType: 'upvote' | 'downvote') => Promise<void>;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  orientation?: 'vertical' | 'horizontal';
  showCount?: boolean;
}

export default function VoteButtons({
  reportId,
  voteStats,
  onVote,
  disabled = false,
  size = 'md',
  orientation = 'vertical',
  showCount = true,
}: VoteButtonsProps) {
  const [isVoting, setIsVoting] = useState(false);

  const handleVote = async (voteType: 'upvote' | 'downvote') => {
    if (disabled || isVoting) return;

    setIsVoting(true);
    try {
      await onVote(reportId, voteType);
    } catch (error) {
      console.error('Failed to vote:', error);
    } finally {
      setIsVoting(false);
    }
  };

  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
  };

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const containerClasses = cn(
    'flex items-center gap-1',
    orientation === 'vertical' ? 'flex-col' : 'flex-row'
  );

  const upvoteActive = voteStats.userVote === 'upvote';
  const downvoteActive = voteStats.userVote === 'downvote';

  return (
    <div className={containerClasses}>
      {/* Upvote Button */}
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          sizeClasses[size],
          'p-0 rounded-full transition-all duration-200',
          upvoteActive
            ? 'bg-green-100 text-green-600 hover:bg-green-200'
            : 'text-gray-500 hover:text-green-600 hover:bg-green-50',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
        onClick={() => handleVote('upvote')}
        disabled={disabled || isVoting}
        aria-label={`Upvote report (${voteStats.upvotes} upvotes)`}
      >
        <ChevronUp className={cn(iconSizes[size], upvoteActive && 'stroke-2')} />
      </Button>

      {/* Vote Count */}
      {showCount && (
        <div className={cn(
          'font-medium text-center min-w-8',
          textSizes[size],
          voteStats.netScore > 0 && 'text-green-600',
          voteStats.netScore < 0 && 'text-red-600',
          voteStats.netScore === 0 && 'text-gray-500'
        )}>
          {voteStats.netScore > 0 ? `+${voteStats.netScore}` : voteStats.netScore}
        </div>
      )}

      {/* Downvote Button */}
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          sizeClasses[size],
          'p-0 rounded-full transition-all duration-200',
          downvoteActive
            ? 'bg-red-100 text-red-600 hover:bg-red-200'
            : 'text-gray-500 hover:text-red-600 hover:bg-red-50',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
        onClick={() => handleVote('downvote')}
        disabled={disabled || isVoting}
        aria-label={`Downvote report (${voteStats.downvotes} downvotes)`}
      >
        <ChevronDown className={cn(iconSizes[size], downvoteActive && 'stroke-2')} />
      </Button>
    </div>
  );
}

// Compact horizontal version for mobile
export function CompactVoteButtons({
  reportId,
  voteStats,
  onVote,
  disabled = false,
}: Omit<VoteButtonsProps, 'size' | 'orientation' | 'showCount'>) {
  return (
    <VoteButtons
      reportId={reportId}
      voteStats={voteStats}
      onVote={onVote}
      disabled={disabled}
      size="sm"
      orientation="horizontal"
      showCount={true}
    />
  );
}

// Large vertical version for desktop
export function LargeVoteButtons({
  reportId,
  voteStats,
  onVote,
  disabled = false,
}: Omit<VoteButtonsProps, 'size' | 'orientation' | 'showCount'>) {
  return (
    <VoteButtons
      reportId={reportId}
      voteStats={voteStats}
      onVote={onVote}
      disabled={disabled}
      size="lg"
      orientation="vertical"
      showCount={true}
    />
  );
}
