'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { UserProfile } from '@/components/auth/UserProfile';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { CompactRedemptionHistory } from '@/components/rewards/RedemptionHistory';
import { apiClient } from '@/lib/api-client';
import { Redemption } from '@/types';
import { 
  User, 
  Trophy, 
  Star, 
  Calendar,
  MapPin,
  FileText,
  TrendingUp,
  Award,
  Settings,
  Gift,
  Sparkles
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [loadingRedemptions, setLoadingRedemptions] = useState(false);

  useEffect(() => {
    if (user) {
      loadRedemptions();
    }
  }, [user]);

  const loadRedemptions = async () => {
    if (!user) return;
    
    setLoadingRedemptions(true);
    try {
      const result = await apiClient.getUserRedemptions(user.id);
      if (result.success && result.data) {
        setRedemptions(result.data);
      }
    } catch (error) {
      console.error('Failed to load redemptions:', error);
    } finally {
      setLoadingRedemptions(false);
    }
  };

  // Calculate user level and progress
  const getUserLevelInfo = (points: number) => {
    const levels = [
      { name: 'New Reporter', min: 0, max: 49, color: 'bg-gray-100 text-gray-800' },
      { name: 'Reporter', min: 50, max: 199, color: 'bg-yellow-100 text-yellow-800' },
      { name: 'Guardian', min: 200, max: 499, color: 'bg-green-100 text-green-800' },
      { name: 'Senior Guardian', min: 500, max: 999, color: 'bg-blue-100 text-blue-800' },
      { name: 'Guardian Elite', min: 1000, max: 1999, color: 'bg-purple-100 text-purple-800' },
      { name: 'Transit Guardian', min: 2000, max: Infinity, color: 'bg-indigo-100 text-indigo-800' },
    ];

    const currentLevel = levels.find(level => points >= level.min && points <= level.max) || levels[0];
    const nextLevel = levels.find(level => level.min > points);
    
    const progress = nextLevel 
      ? ((points - currentLevel.min) / (nextLevel.min - currentLevel.min)) * 100
      : 100;

    return {
      current: currentLevel,
      next: nextLevel,
      progress: Math.min(progress, 100),
      pointsToNext: nextLevel ? nextLevel.min - points : 0,
    };
  };

  // Show login prompt if not authenticated (like map page does)
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="text-6xl mb-4">👤</div>
            <h2 className="text-2xl font-bold text-gray-900">Profile</h2>
            <p className="text-gray-600">Sign in to view your profile and track your contributions</p>
            <div className="flex gap-3 justify-center mt-6">
              <Link href="/login">
                <Button className="bg-indigo-600 hover:bg-indigo-700">
                  Sign In
                </Button>
              </Link>
              <Link href="/signup">
                <Button variant="outline">
                  Create Account
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const levelInfo = getUserLevelInfo(user.points);

  // Mock data for demonstration - would come from API
  const stats = {
    totalReports: 12,
    verifiedReports: 8,
    helpfulVotes: 45,
    accuracyRate: 85,
    joinDate: user.createdAt,
    lastActive: new Date().toISOString(),
  };

  // Redemption stats
  const activeRedemptions = redemptions.filter(r => r.status === 'active').length;
  const totalPointsSpent = redemptions.reduce((sum, r) => sum + r.pointsSpent, 0);

  const recentActivity = [
    { type: 'report', description: 'Reported delay on Bus Line 42', points: 3, date: '2 hours ago' },
    { type: 'vote', description: 'Received upvote on Metro Red Line report', points: 1, date: '5 hours ago' },
    { type: 'verification', description: 'Report verified by community', points: 2, date: '1 day ago' },
  ];

  const achievements = [
    { name: 'First Reporter', description: 'Submit your first delay report', earned: true, date: '2 weeks ago' },
    { name: 'Community Helper', description: 'Receive 10 helpful votes', earned: true, date: '1 week ago' },
    { name: 'Accuracy Expert', description: 'Maintain 80%+ accuracy rate', earned: true, date: '3 days ago' },
    { name: 'Transit Guardian', description: 'Reach 1000 points', earned: false, date: null },
  ];

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
            <p className="text-gray-600">Manage your account and view your contributions</p>
          </div>
          <Button variant="outline" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Edit Profile
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Card */}
          <div className="lg:col-span-1">
            <UserProfile variant="full" showLogout={true} />
            
            {/* Level Progress */}
            <Card className="mt-4">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Level Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Badge className={levelInfo.current.color}>
                    {levelInfo.current.name}
                  </Badge>
                  {levelInfo.next && (
                    <span className="text-sm text-gray-500">
                      {levelInfo.pointsToNext} pts to {levelInfo.next.name}
                    </span>
                  )}
                </div>
                <Progress value={levelInfo.progress} className="h-2" />
                <p className="text-xs text-gray-500 text-center">
                  {user.points} / {levelInfo.next?.min || 'Max'} points
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Tabs */}
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
                <TabsTrigger value="achievements">Achievements</TabsTrigger>
                <TabsTrigger value="rewards">Rewards</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-4">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <FileText className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                      <div className="text-2xl font-bold">{stats.totalReports}</div>
                      <div className="text-xs text-gray-500">Total Reports</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <Trophy className="h-8 w-8 mx-auto mb-2 text-green-600" />
                      <div className="text-2xl font-bold">{stats.verifiedReports}</div>
                      <div className="text-xs text-gray-500">Verified</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <Star className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
                      <div className="text-2xl font-bold">{stats.helpfulVotes}</div>
                      <div className="text-xs text-gray-500">Helpful Votes</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <TrendingUp className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                      <div className="text-2xl font-bold">{stats.accuracyRate}%</div>
                      <div className="text-xs text-gray-500">Accuracy</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Account Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Account Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between py-2 border-b">
                      <span className="text-sm text-gray-600">Member Since</span>
                      <span className="text-sm font-medium">
                        {formatDistanceToNow(new Date(stats.joinDate), { addSuffix: true })}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b">
                      <span className="text-sm text-gray-600">Last Active</span>
                      <span className="text-sm font-medium">
                        {formatDistanceToNow(new Date(stats.lastActive), { addSuffix: true })}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm text-gray-600">Current Level</span>
                      <Badge className={levelInfo.current.color}>
                        {levelInfo.current.name}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Activity Tab */}
              <TabsContent value="activity" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>Your latest contributions and earned points</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentActivity.map((activity, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            {activity.type === 'report' && <FileText className="h-5 w-5 text-blue-600" />}
                            {activity.type === 'vote' && <Star className="h-5 w-5 text-yellow-600" />}
                            {activity.type === 'verification' && <Trophy className="h-5 w-5 text-green-600" />}
                            <div>
                              <p className="text-sm font-medium">{activity.description}</p>
                              <p className="text-xs text-gray-500">{activity.date}</p>
                            </div>
                          </div>
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            +{activity.points} pts
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Achievements Tab */}
              <TabsContent value="achievements" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5" />
                      Achievements
                    </CardTitle>
                    <CardDescription>Unlock badges by contributing to the community</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4">
                      {achievements.map((achievement, index) => (
                        <div 
                          key={index} 
                          className={`flex items-center gap-4 p-4 rounded-lg border ${
                            achievement.earned 
                              ? 'bg-green-50 border-green-200' 
                              : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <div className={`p-2 rounded-full ${
                            achievement.earned ? 'bg-green-100' : 'bg-gray-100'
                          }`}>
                            <Award className={`h-6 w-6 ${
                              achievement.earned ? 'text-green-600' : 'text-gray-400'
                            }`} />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium">{achievement.name}</h4>
                            <p className="text-sm text-gray-600">{achievement.description}</p>
                            {achievement.earned && achievement.date && (
                              <p className="text-xs text-green-600 mt-1">Earned {achievement.date}</p>
                            )}
                          </div>
                          {achievement.earned && (
                            <Badge className="bg-green-100 text-green-800">Earned</Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Rewards Tab */}
              <TabsContent value="rewards" className="space-y-4">
                {/* Rewards Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <Star className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
                      <div className="text-2xl font-bold">{user.points}</div>
                      <div className="text-xs text-gray-500">Available Points</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <Gift className="h-8 w-8 mx-auto mb-2 text-green-600" />
                      <div className="text-2xl font-bold">{activeRedemptions}</div>
                      <div className="text-xs text-gray-500">Active Coupons</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <Sparkles className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                      <div className="text-2xl font-bold">{totalPointsSpent}</div>
                      <div className="text-xs text-gray-500">Points Redeemed</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Active Coupons */}
                {loadingRedemptions ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    </CardContent>
                  </Card>
                ) : (
                  <CompactRedemptionHistory redemptions={redemptions} />
                )}

                {/* Browse More Offers CTA */}
                <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      <div className="h-16 w-16 rounded-full bg-white flex items-center justify-center flex-shrink-0">
                        <Gift className="h-8 w-8 text-blue-600" />
                      </div>
                      <div className="flex-1 text-center sm:text-left">
                        <h3 className="font-semibold text-lg mb-1">Discover More Rewards</h3>
                        <p className="text-sm text-gray-600">
                          Browse exclusive offers from our partners and redeem your points
                        </p>
                      </div>
                      <Link href="/rewards">
                        <Button className="bg-blue-600 hover:bg-blue-700 whitespace-nowrap">
                          <Sparkles className="h-4 w-4 mr-2" />
                          View Marketplace
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>

                {/* Points History Preview */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Recent Points Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {redemptions.slice(0, 3).map((redemption) => (
                        <div key={redemption.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <Gift className="h-5 w-5 text-blue-600" />
                            <div>
                              <p className="text-sm font-medium">Redeemed {redemption.offer.title}</p>
                              <p className="text-xs text-gray-500">
                                {formatDistanceToNow(new Date(redemption.redeemedAt), { addSuffix: true })}
                              </p>
                            </div>
                          </div>
                          <Badge variant="secondary" className="bg-red-100 text-red-800">
                            -{redemption.pointsSpent} pts
                          </Badge>
                        </div>
                      ))}
                      {redemptions.length === 0 && (
                        <div className="text-center py-8">
                          <Gift className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                          <p className="text-sm text-gray-500">No redemptions yet</p>
                          <p className="text-xs text-gray-400">Start earning and redeeming points!</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
  );
}
