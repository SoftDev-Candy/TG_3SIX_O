'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import ReportDelayForm from '@/components/forms/ReportDelayForm';
import ReportCard from '@/components/cards/ReportCard';
import { DetailedPointsCard } from '@/components/ui/PointsDisplay';
import { CreateReportInput, DelayReport, VoteStats } from '@/types';
import { calculateReportPoints } from '@/lib/points';

// Mock data for demonstration
const mockReports: (DelayReport & { voteStats: VoteStats })[] = [
  {
    id: '1',
    userId: 'user2',
    user: { username: 'transit_watcher', avatar: undefined },
    location: {
      lat: 52.5200,
      lng: 13.4050,
      stopName: 'Alexanderplatz',
      address: 'Alexanderplatz, Berlin, Germany',
    },
    transportType: 'metro',
    line: 'U2',
    severity: 'moderate',
    category: 'mechanical',
    description: 'Train stopped between stations due to technical issues. Passengers are being informed about delays. Estimated 20-minute delay.',
    estimatedDelay: 20,
    photos: [],
    status: 'verified',
    upvotes: 8,
    downvotes: 1,
    reportedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(), // 45 minutes ago
    verifiedBy: ['user3', 'user4'],
    voteStats: {
      upvotes: 8,
      downvotes: 1,
      userVote: null,
      netScore: 7,
    },
  },
  {
    id: '2',
    userId: 'user3',
    user: { username: 'commuter_pro' },
    location: {
      lat: 52.5170,
      lng: 13.3888,
      stopName: 'Brandenburg Gate',
      address: 'Brandenburg Gate, Berlin, Germany',
    },
    transportType: 'bus',
    line: '100',
    severity: 'severe',
    category: 'accident',
    description: 'Bus involved in minor traffic accident. Emergency services on scene. Route is completely blocked.',
    estimatedDelay: 45,
    photos: [],
    status: 'pending',
    upvotes: 3,
    downvotes: 0,
    reportedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 minutes ago
    voteStats: {
      upvotes: 3,
      downvotes: 0,
      userVote: 'upvote',
      netScore: 3,
    },
  },
];

export default function DemoPage() {
  const [reports, setReports] = useState(mockReports);
  const [showForm, setShowForm] = useState(false);
  const [userPoints, setUserPoints] = useState(47);
  const [recentPoints, setRecentPoints] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitReport = async (data: CreateReportInput) => {
    setIsSubmitting(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Create new report
    const newReport: DelayReport & { voteStats: VoteStats } = {
      id: `report_${Date.now()}`,
      userId: 'current_user',
      user: { username: 'you' },
      location: data.location,
      transportType: data.transportType,
      line: data.line,
      severity: data.severity,
      category: data.category,
      description: data.description,
      estimatedDelay: data.estimatedDelay,
      photos: data.photos?.map(file => URL.createObjectURL(file)),
      status: 'pending',
      upvotes: 0,
      downvotes: 0,
      reportedAt: new Date().toISOString(),
      voteStats: {
        upvotes: 0,
        downvotes: 0,
        userVote: null,
        netScore: 0,
      },
    };

    // Add to reports list
    setReports(prev => [newReport, ...prev]);
    
    // Award points for submission
    const pointsEarned = calculateReportPoints(newReport, true, 0, false);
    setUserPoints(prev => prev + pointsEarned.total);
    setRecentPoints(pointsEarned.total);
    
    setShowForm(false);
    setIsSubmitting(false);
  };

  const handleVote = async (reportId: string, voteType: 'upvote' | 'downvote') => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setReports(prev => prev.map(report => {
      if (report.id === reportId) {
        const currentVote = report.voteStats.userVote;
        let newUpvotes = report.voteStats.upvotes;
        let newDownvotes = report.voteStats.downvotes;
        let newUserVote: 'upvote' | 'downvote' | null = voteType;

        // Handle vote logic
        if (currentVote === voteType) {
          // Remove vote
          newUserVote = null;
          if (voteType === 'upvote') newUpvotes--;
          else newDownvotes--;
        } else {
          // Add or change vote
          if (currentVote === 'upvote') newUpvotes--;
          if (currentVote === 'downvote') newDownvotes--;
          
          if (voteType === 'upvote') newUpvotes++;
          else newDownvotes++;
        }

        return {
          ...report,
          upvotes: newUpvotes,
          downvotes: newDownvotes,
          voteStats: {
            upvotes: newUpvotes,
            downvotes: newDownvotes,
            userVote: newUserVote,
            netScore: newUpvotes - newDownvotes,
          },
        };
      }
      return report;
    }));
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">
            User Submission & Upvoting Demo
          </h1>
          <p className="text-gray-600">
            Experience the delay reporting and community voting system
          </p>
        </div>

        {/* User Points Display */}
        <DetailedPointsCard totalPoints={userPoints} recentPoints={recentPoints} />

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
          <Button
            onClick={() => setShowForm(!showForm)}
            size="lg"
            className="flex-1 sm:flex-none"
          >
            {showForm ? 'Cancel Report' : 'Report New Delay'}
          </Button>
          <Button
            variant="outline"
            onClick={() => setRecentPoints(0)}
            size="lg"
            className="flex-1 sm:flex-none"
          >
            Clear Recent Points
          </Button>
        </div>

        {/* Report Form */}
        {showForm && (
          <div className="animate-in slide-in-from-top-4 duration-300">
            <ReportDelayForm
              onSubmit={handleSubmitReport}
              isSubmitting={isSubmitting}
              initialLocation={{
                lat: 52.5200,
                lng: 13.4050,
                address: 'Berlin, Germany',
              }}
            />
          </div>
        )}

        <Separator />

        {/* Reports List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Recent Reports</h2>
            <Badge variant="secondary">
              {reports.length} active reports
            </Badge>
          </div>

          <div className="space-y-4">
            {reports.map((report) => (
              <div key={report.id} className="animate-in fade-in-50 duration-300">
                <ReportCard
                  report={report}
                  voteStats={report.voteStats}
                  onVote={handleVote}
                  currentUserId="current_user"
                  showVoting={true}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Demo Instructions */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900 text-lg">
              🎯 Demo Instructions
            </CardTitle>
          </CardHeader>
          <CardContent className="text-blue-800 space-y-2">
            <p><strong>Try these features:</strong></p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Click &quot;Report New Delay&quot; to submit a new report and earn points</li>
              <li>Use the upvote/downvote buttons on existing reports</li>
              <li>Notice how your points increase when you submit reports</li>
              <li>See how vote counts update in real-time</li>
              <li>Observe the mobile-first responsive design</li>
            </ul>
            <p className="text-xs mt-3 text-blue-600">
              <strong>Note:</strong> This is a demo with mock data. In production, this would connect to the Fastify API backend.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
