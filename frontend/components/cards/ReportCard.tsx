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
  
  // Determine if report is in "verifying" state (pending with upvotes)
  const isVerifying = report.status === 'pending' && report.upvotes > 0;
  const statusDisplay = isVerifying 
    ? { icon: AlertCircle, color: 'text-blue-600', label: `Verifying` }
    : statusConfig[report.status];
  
  // Show vote count for verified reports too
  const showVoteCount = (report.status === 'verified' || report.status === 'resolved') && report.upvotes > 0;
  
  // Calculate total points for resolved reports (if it's the user's own report)
  const totalPointsEarned = isOwnReport && report.status === 'resolved'
    ? 1 + report.upvotes + 2 // base + upvotes + verification bonus
    : null;

  const handleImageError = (imageUrl: string) => {
    setImageError(prev => new Set([...prev, imageUrl]));
  };

  if (compact) {
    return (
      <Card className={cn(
        "w-full transition-all",
        isOwnReport && "ring-2 ring-blue-500 bg-blue-50/30"
      )}>
        <CardContent className="px-3 py-2">
          {/* Header */}
          <div className="flex items-center gap-2 pb-2 mb-2 border-b border-gray-200">
            <span className="text-xl">{transportIcons[report.transportType]}</span>
            <div className="flex-1">
              <div className="font-semibold text-sm">Line {report.line}</div>
              {report.vehicleNumber && (
                <div className="text-[10px] text-gray-500">#{report.vehicleNumber}</div>
              )}
            </div>
            <div className="flex items-center gap-2">
              {isOwnReport && (
                <Badge className="bg-blue-600 text-white text-[9px] px-1.5 py-0.5">
                  Your Report
                </Badge>
              )}
              <Badge className={cn('text-[10px] px-1.5 py-0.5', severityConfig[report.severity].color)}>
                {severityConfig[report.severity].label.toUpperCase()}
              </Badge>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-gray-700 mb-2 leading-relaxed">
            {report.description}
          </p>

          {/* Footer */}
          <div className="pt-2 border-t border-gray-100 space-y-2">
            {/* Row 1: Location + Time */}
            <div className="flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-1 text-gray-600">
                <MapPin className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">
                  {report.location.stopName || report.location.address}
                </span>
              </div>
              <span className="text-gray-500 whitespace-nowrap flex-shrink-0">
                {formatDistanceToNow(new Date(report.reportedAt), { addSuffix: true }).replace('about ', '')}
              </span>
            </div>
            
            {/* Row 2: Vote buttons + Status/Points */}
            <div className="flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-2">
                {showVoting && !isOwnReport && report.status === 'pending' && (
                  <CompactVoteButtons
                    reportId={report.id}
                    voteStats={voteStats}
                    onVote={onVote}
                  />
                )}
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <statusDisplay.icon className={cn('h-3 w-3', statusDisplay.color)} />
                <span className={statusDisplay.color}>{statusDisplay.label}</span>
                {totalPointsEarned ? (
                  <span className="font-semibold text-green-700">{totalPointsEarned} pts</span>
                ) : (isVerifying || showVoteCount) && (
                  <span className="font-semibold text-green-700">+{report.upvotes}</span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn(
      "w-full transition-all",
      isOwnReport && "ring-2 ring-blue-500 bg-blue-50/30"
    )}>
      <CardContent className="p-6">
        {isOwnReport && (
          <div className="flex items-center gap-1 mb-4">
            <Badge className="bg-blue-600 text-white text-xs px-2 py-1">
              Your Report
            </Badge>
          </div>
        )}
        <div className="flex gap-4">
          {/* Voting Column (Desktop) */}
          {showVoting && !isOwnReport && report.status === 'pending' && (
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
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="font-medium">
                        Line {report.line}
                      </Badge>
                      {report.vehicleNumber && (
                        <Badge variant="secondary" className="text-xs">
                          Vehicle #{report.vehicleNumber}
                        </Badge>
                      )}
                    </div>
                    <Badge className={severityConfig[report.severity].color}>
                      {severityConfig[report.severity].label}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <statusDisplay.icon className={cn('h-4 w-4', statusDisplay.color)} />
                      <span className={statusDisplay.color}>{statusDisplay.label}</span>
                      {totalPointsEarned ? (
                        <span className="font-semibold text-green-700">{totalPointsEarned} pts earned</span>
                      ) : (isVerifying || showVoteCount) && (
                        <span className="font-semibold text-green-700">+{report.upvotes}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Mobile Voting */}
              {showVoting && !isOwnReport && report.status === 'pending' && (
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
