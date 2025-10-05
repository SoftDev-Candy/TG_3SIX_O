/**
 * Profile Panel - Slide-up panel showing user profile
 * Matches the LiveDelaysPanel design
 */

'use client';

import { useState } from 'react';
import { X, Trophy, Star, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import Link from 'next/link';

interface User {
  id: string;
  username: string;
  email: string;
  points: number;
  level?: number;
}

interface ProfilePanelProps {
  user: User | null;
  onClose: () => void;
}

// User level system
const USER_LEVELS = [
  { level: 1, min: 0, max: 49, title: 'New Reporter', color: 'gray' },
  { level: 2, min: 50, max: 149, title: 'Active Reporter', color: 'blue' },
  { level: 3, min: 150, max: 299, title: 'Trusted Reporter', color: 'green' },
  { level: 4, min: 300, max: 599, title: 'Expert Reporter', color: 'purple' },
  { level: 5, min: 600, max: 999, title: 'Elite Reporter', color: 'yellow' },
  { level: 6, min: 1000, max: Infinity, title: 'Transit Guardian', color: 'red' },
];

export default function ProfilePanel({ user, onClose }: ProfilePanelProps) {
  if (!user) {
    return (
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="absolute bottom-20 left-0 right-0 bg-white/95 backdrop-blur-sm rounded-t-3xl shadow-2xl z-[1001] max-h-[70vh] overflow-hidden mx-4"
      >
        <div className="p-4 border-b border-gray-200 flex items-center justify-between shrink-0">
          <h2 className="font-bold text-lg">Profile</h2>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-sm btn-circle"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 text-center">
          <div className="text-6xl mb-4">👤</div>
          <h3 className="text-xl font-bold mb-2">Sign In Required</h3>
          <p className="text-gray-600 mb-6">
            Sign in to view your profile and track your contributions
          </p>
          <div className="flex gap-3 justify-center">
            <Link href="/login">
              <Button className="bg-indigo-600 hover:bg-indigo-700">
                Sign In
              </Button>
            </Link>
            <Link href="/signup">
              <Button variant="outline">Create Account</Button>
            </Link>
          </div>
        </div>
      </motion.div>
    );
  }

  // Calculate level
  const currentLevel = USER_LEVELS.find(
    (l) => user.points >= l.min && user.points <= l.max
  ) || USER_LEVELS[0];
  
  const nextLevel = USER_LEVELS.find((l) => l.min > user.points);
  const progress = nextLevel
    ? ((user.points - currentLevel.min) / (nextLevel.min - currentLevel.min)) * 100
    : 100;

  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      className="absolute bottom-20 left-0 right-0 bg-white/95 backdrop-blur-sm rounded-t-3xl shadow-2xl z-[1001] max-h-[70vh] overflow-hidden flex flex-col mx-4"
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between shrink-0">
        <h2 className="font-bold text-lg">My Profile</h2>
        <button
          onClick={onClose}
          className="btn btn-ghost btn-sm btn-circle"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content - Scrollable */}
      <div className="overflow-y-auto flex-1 p-4 space-y-4">
        {/* User Info Card */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl">{user.username}</CardTitle>
                <p className="text-sm text-gray-600 mt-1">{user.email}</p>
              </div>
              <Link href="/profile">
                <Button variant="outline" size="sm">
                  Full Profile
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Level Badge */}
            <div className="flex items-center gap-3">
              <Trophy className="w-8 h-8 text-yellow-500" />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-lg">{currentLevel.title}</span>
                  <span className="text-sm text-gray-600">Level {currentLevel.level}</span>
                </div>
                <Progress value={progress} className="h-2" />
                {nextLevel && (
                  <p className="text-xs text-gray-500 mt-1">
                    {nextLevel.min - user.points} points to {nextLevel.title}
                  </p>
                )}
              </div>
            </div>

            {/* Points Balance */}
            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg p-4 border border-indigo-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-indigo-600" />
                  <span className="text-sm font-medium text-gray-700">Total Points</span>
                </div>
                <span className="text-2xl font-bold text-indigo-600">
                  {user.points}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="text-center">
            <CardContent className="pt-4 pb-3">
              <div className="text-2xl font-bold text-gray-900">12</div>
              <div className="text-xs text-gray-600 mt-1">Reports</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-4 pb-3">
              <div className="text-2xl font-bold text-gray-900">8</div>
              <div className="text-xs text-gray-600 mt-1">Verified</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-4 pb-3">
              <div className="text-2xl font-bold text-gray-900">85%</div>
              <div className="text-xs text-gray-600 mt-1">Accuracy</div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="space-y-2">
          <Link href="/profile">
            <Button variant="outline" className="w-full justify-start">
              <TrendingUp className="w-4 h-4 mr-2" />
              View Full Profile & Stats
            </Button>
          </Link>
          <Link href="/rewards">
            <Button variant="outline" className="w-full justify-start">
              <Star className="w-4 h-4 mr-2" />
              Redeem Points for Rewards
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
