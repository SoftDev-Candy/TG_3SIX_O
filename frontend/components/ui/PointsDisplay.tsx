'use client';

import { Star, TrendingUp, Award, Zap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { formatPoints, getUserLevel } from '@/lib/points';
import { cn } from '@/lib/utils';

interface PointsDisplayProps {
  totalPoints: number;
  recentPoints?: number;
  showLevel?: boolean;
  showProgress?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'compact' | 'detailed';
}

export default function PointsDisplay({
  totalPoints,
  recentPoints,
  showLevel = true,
  showProgress = true,
  size = 'md',
  variant = 'default',
}: PointsDisplayProps) {
  const levelInfo = getUserLevel(totalPoints);

  const sizeClasses = {
    sm: {
      points: 'text-lg font-bold',
      label: 'text-xs',
      icon: 'h-4 w-4',
      card: 'p-3',
    },
    md: {
      points: 'text-2xl font-bold',
      label: 'text-sm',
      icon: 'h-5 w-5',
      card: 'p-4',
    },
    lg: {
      points: 'text-3xl font-bold',
      label: 'text-base',
      icon: 'h-6 w-6',
      card: 'p-6',
    },
  };

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          <Star className={cn('text-yellow-500', sizeClasses[size].icon)} />
          <span className={sizeClasses[size].points}>
            {formatPoints(totalPoints)}
          </span>
        </div>
        {recentPoints && recentPoints > 0 && (
          <Badge variant="secondary" className="text-green-600">
            +{formatPoints(recentPoints)}
          </Badge>
        )}
      </div>
    );
  }

  if (variant === 'detailed') {
    return (
      <Card>
        <CardContent className={sizeClasses[size].card}>
          <div className="space-y-4">
            {/* Points Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Star className={cn('text-yellow-500', sizeClasses[size].icon)} />
                <div>
                  <div className={cn('text-gray-900', sizeClasses[size].points)}>
                    {formatPoints(totalPoints)}
                  </div>
                  <div className={cn('text-gray-500', sizeClasses[size].label)}>
                    Total Points
                  </div>
                </div>
              </div>
              {recentPoints && recentPoints > 0 && (
                <div className="text-right">
                  <div className="flex items-center gap-1 text-green-600">
                    <TrendingUp className="h-4 w-4" />
                    <span className="font-medium">+{formatPoints(recentPoints)}</span>
                  </div>
                  <div className={cn('text-gray-500', sizeClasses[size].label)}>
                    Recent
                  </div>
                </div>
              )}
            </div>

            {/* Level Info */}
            {showLevel && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Award className={cn('text-blue-500', sizeClasses[size].icon)} />
                    <div>
                      <div className={cn('font-medium text-gray-900', sizeClasses[size].label)}>
                        Level {levelInfo.level}
                      </div>
                      <div className={cn('text-gray-500', sizeClasses[size].label)}>
                        {levelInfo.title}
                      </div>
                    </div>
                  </div>
                  {levelInfo.level < 6 && (
                    <div className={cn('text-gray-500 text-right', sizeClasses[size].label)}>
                      {levelInfo.nextLevelPoints - totalPoints} to next level
                    </div>
                  )}
                </div>

                {/* Progress Bar */}
                {showProgress && levelInfo.level < 6 && (
                  <div className="space-y-1">
                    <Progress value={levelInfo.progress} className="h-2" />
                    <div className={cn('text-gray-500 text-center', sizeClasses[size].label)}>
                      {Math.round(levelInfo.progress)}% to Level {levelInfo.level + 1}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Default variant
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        <Star className={cn('text-yellow-500', sizeClasses[size].icon)} />
        <div>
          <div className={cn('text-gray-900', sizeClasses[size].points)}>
            {formatPoints(totalPoints)}
          </div>
          <div className={cn('text-gray-500', sizeClasses[size].label)}>
            Points
          </div>
        </div>
      </div>

      {showLevel && (
        <div className="flex items-center gap-2">
          <Award className={cn('text-blue-500', sizeClasses[size].icon)} />
          <div>
            <div className={cn('font-medium text-gray-900', sizeClasses[size].label)}>
              Level {levelInfo.level}
            </div>
            <div className={cn('text-gray-500', sizeClasses[size].label)}>
              {levelInfo.title}
            </div>
          </div>
        </div>
      )}

      {recentPoints && recentPoints > 0 && (
        <Badge variant="secondary" className="text-green-600 flex items-center gap-1">
          <Zap className="h-3 w-3" />
          +{formatPoints(recentPoints)}
        </Badge>
      )}
    </div>
  );
}

// Specialized components for common use cases
export function CompactPoints({ totalPoints, recentPoints }: Pick<PointsDisplayProps, 'totalPoints' | 'recentPoints'>) {
  return (
    <PointsDisplay
      totalPoints={totalPoints}
      recentPoints={recentPoints}
      variant="compact"
      size="sm"
      showLevel={false}
      showProgress={false}
    />
  );
}

export function DetailedPointsCard({ totalPoints, recentPoints }: Pick<PointsDisplayProps, 'totalPoints' | 'recentPoints'>) {
  return (
    <PointsDisplay
      totalPoints={totalPoints}
      recentPoints={recentPoints}
      variant="detailed"
      size="md"
      showLevel={true}
      showProgress={true}
    />
  );
}
