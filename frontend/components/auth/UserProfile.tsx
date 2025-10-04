'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  User, 
  Mail, 
  Calendar, 
  Star, 
  Trophy, 
  LogOut,
  Settings
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface UserProfileProps {
  variant?: 'full' | 'compact' | 'mini';
  showLogout?: boolean;
  className?: string;
}

export function UserProfile({ 
  variant = 'full', 
  showLogout = true,
  className = '' 
}: UserProfileProps) {
  const { user, logout, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return null;
  }

  const getUserLevel = (points: number) => {
    if (points >= 1000) return { level: 'Guardian Elite', color: 'bg-purple-100 text-purple-800' };
    if (points >= 500) return { level: 'Senior Guardian', color: 'bg-blue-100 text-blue-800' };
    if (points >= 200) return { level: 'Guardian', color: 'bg-green-100 text-green-800' };
    if (points >= 50) return { level: 'Reporter', color: 'bg-yellow-100 text-yellow-800' };
    return { level: 'New User', color: 'bg-gray-100 text-gray-800' };
  };

  const userLevel = getUserLevel(user.points);

  if (variant === 'mini') {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <Avatar className="h-8 w-8">
          <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.username}`} />
          <AvatarFallback>
            {user.username.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="text-sm font-medium">{user.username}</span>
          <span className="text-xs text-gray-500">{user.points} pts</span>
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <Card className={`w-full max-w-sm ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.username}`} />
              <AvatarFallback>
                {user.username.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user.username}
              </p>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className={userLevel.color}>
                  {userLevel.level}
                </Badge>
                <span className="text-xs text-gray-500 flex items-center">
                  <Star className="h-3 w-3 mr-1" />
                  {user.points}
                </span>
              </div>
            </div>
            {showLogout && (
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="h-8 w-8 p-0"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Full variant
  return (
    <Card className={`w-full max-w-md ${className}`}>
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.username}`} />
            <AvatarFallback className="text-lg">
              {user.username.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>
        <CardTitle className="text-xl">{user.username}</CardTitle>
        <CardDescription className="flex items-center justify-center space-x-2">
          <Mail className="h-4 w-4" />
          <span>{user.email}</span>
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* User Level & Points */}
        <div className="text-center space-y-2">
          <Badge className={`${userLevel.color} text-sm px-3 py-1`}>
            <Trophy className="h-4 w-4 mr-1" />
            {userLevel.level}
          </Badge>
          <div className="flex items-center justify-center space-x-1">
            <Star className="h-5 w-5 text-yellow-500" />
            <span className="text-2xl font-bold">{user.points}</span>
            <span className="text-sm text-gray-500">points</span>
          </div>
        </div>

        {/* Member Since */}
        <div className="flex items-center justify-center text-sm text-gray-500">
          <Calendar className="h-4 w-4 mr-2" />
          <span>
            Member since {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col space-y-2 pt-4">
          <Button variant="outline" className="w-full">
            <Settings className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
          {showLogout && (
            <Button 
              variant="outline" 
              className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={logout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
