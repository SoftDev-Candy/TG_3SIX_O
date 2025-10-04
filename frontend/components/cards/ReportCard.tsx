'use client';

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { MapPin, Clock, User, Camera, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import VoteButtons, { CompactVoteButtons } from '@/components/ui/VoteButtons';
import { DelayReport, VoteStats } from '@/types';
import { cn } from '@/lib/utils';

interface ReportCardProps {
  report: DelayReport;
  voteStats: VoteStats;
  onVote: (reportId: string, voteType: 'upvote' | 'downvote') => Promise<void>;
  onImageClick?: (imageUrl: string) => void;
  compact?: boolean;
  showVoting?: boolean;
  currentUserId?: string;
}

const transportIcons = {
  bus: '🚌',
  tram: '🚋',
  train: '🚆',
  metro: '🚇',
  ferry: '⛴️',
};

const severityConfig = {
  minor: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', label: 'Minor' },
  moderate: { color: 'bg-orange-100 text-orange-800 border-orange-200', label: 'Moderate' },
  severe: { color: 'bg-red-100 text-red-800 border-red-200', label: 'Severe' },
};

const statusConfig = {
  pending: { icon: AlertCircle, color: 'text-yellow-600', label: 'Pending' },
  verified: { icon: CheckCircle, color: 'text-green-600', label: 'Verified' },
  resolved: { icon: CheckCircle, color: 'text-blue-600', label: 'Resolved' },
  rejected: { icon: XCircle, color: 'text-red-600', label: 'Rejected' },
};

export default function ReportCard({
  report,
  voteStats,
  onVote,
  onImageClick,
  compact = false,
  showVoting = true,
  currentUserId,
}: ReportCardProps) {
  const [imageError, setImageError] = useState<Set<string>>(new Set());

  const isOwnReport = currentUserId === report.userId;
  const StatusIcon = statusConfig[report.status].icon;

  const handleImageError = (imageUrl: string) => {
    setImageError(prev => new Set([...prev, imageUrl]));
  };

  if (compact) {
    return (
      <Card className="w-full">
        <CardContent className="p-4">
          <div className="flex gap-3">
            {/* Transport Icon & Line */}
            <div className="flex-shrink-0 text-center">
              <div className="text-2xl mb-1">
                {transportIcons[report.transportType]}
              </div>
              <Badge variant="outline" className="text-xs px-1 py-0">
                {report.line}
              </Badge>
            </div>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className={cn('text-xs', severityConfig[report.severity].color)}>
                    {severityConfig[report.severity].label}
                  </Badge>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="h-3 w-3" />
                    {report.estimatedDelay}min
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <StatusIcon className={cn('h-3 w-3', statusConfig[report.status].color)} />
                  {statusConfig[report.status].label}
                </div>
              </div>

              <p className="text-sm text-gray-700 line-clamp-2 mb-2">
                {report.description}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <MapPin className="h-3 w-3" />
                  <span className="truncate">
                    {report.location.stopName || report.location.address || 'Unknown location'}
                  </span>
                </div>
                <span className="text-xs text-gray-500 flex-shrink-0">
                  {formatDistanceToNow(new Date(report.reportedAt), { addSuffix: true })}
                </span>
              </div>
            </div>

            {/* Voting */}
            {showVoting && !isOwnReport && (
              <div className="flex-shrink-0">
                <CompactVoteButtons
                  reportId={report.id}
                  voteStats={voteStats}
                  onVote={onVote}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="flex gap-4">
          {/* Voting Column (Desktop) */}
          {showVoting && !isOwnReport && (
            <div className="hidden sm:block flex-shrink-0">
              <VoteButtons
                reportId={report.id}
                voteStats={voteStats}
                onVote={onVote}
                size="md"
                orientation="vertical"
              />
            </div>
          )}

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="text-3xl">
                  {transportIcons[report.transportType]}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="font-medium">
                      {report.line}
                    </Badge>
                    <Badge className={severityConfig[report.severity].color}>
                      {severityConfig[report.severity].label}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {report.estimatedDelay} min delay
                    </div>
                    <div className="flex items-center gap-1">
                      <StatusIcon className={cn('h-4 w-4', statusConfig[report.status].color)} />
                      {statusConfig[report.status].label}
                    </div>
                  </div>
                </div>
              </div>

              {/* Mobile Voting */}
              {showVoting && !isOwnReport && (
                <div className="sm:hidden">
                  <CompactVoteButtons
                    reportId={report.id}
                    voteStats={voteStats}
                    onVote={onVote}
                  />
                </div>
              )}
            </div>

            {/* Description */}
            <p className="text-gray-700 mb-4 leading-relaxed">
              {report.description}
            </p>

            {/* Photos */}
            {report.photos && report.photos.length > 0 && (
              <div className="mb-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {report.photos.slice(0, 3).map((photo, index) => (
                    <div key={index} className="relative">
                      {!imageError.has(photo) ? (
                        <img
                          src={photo}
                          alt={`Report photo ${index + 1}`}
                          className="w-full h-24 sm:h-32 object-cover rounded-lg border cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => onImageClick?.(photo)}
                          onError={() => handleImageError(photo)}
                        />
                      ) : (
                        <div className="w-full h-24 sm:h-32 bg-gray-100 rounded-lg border flex items-center justify-center">
                          <Camera className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                      {index === 2 && report.photos!.length > 3 && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center text-white font-medium">
                          +{report.photos!.length - 3} more
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  {report.user?.avatar ? (
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={report.user.avatar} />
                      <AvatarFallback>
                        {report.user.username?.[0]?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <User className="h-4 w-4" />
                  )}
                  <span>{report.user?.username || 'Anonymous'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span className="truncate max-w-32 sm:max-w-none">
                    {report.location.stopName || report.location.address || 'Unknown location'}
                  </span>
                </div>
              </div>
              <span>
                {formatDistanceToNow(new Date(report.reportedAt), { addSuffix: true })}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
