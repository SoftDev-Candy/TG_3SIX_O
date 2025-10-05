// Shared types for backend
export interface User {
  id: string;
  email: string;
  username: string;
  passwordHash: string;
  points: number;
  level: number;
  totalReports: number;
  verifiedReports: number;
  rejectedReports: number;
  totalUpvotes: number;
  totalDownvotes: number;
  createdAt: string;
  updatedAt: string;
}

export interface DelayReport {
  id: string;
  userId: string;
  transportType: 'bus' | 'tram' | 'train' | 'metro';
  line: string;
  vehicleNumber?: string;
  location: {
    lat: number;
    lng: number;
    address?: string;
    stopId?: string;
  };
  severity: 'minor' | 'moderate' | 'severe';
  issueCategory: 'mechanical' | 'signal' | 'weather' | 'accident' | 'crowding' | 'other';
  description: string;
  photos: string[];
  status: 'pending' | 'verified' | 'rejected' | 'resolved';
  upvotes: number;
  downvotes: number;
  reporterOrder?: number; // 1st, 2nd, 3rd reporter for same incident
  createdAt: string;
  updatedAt: string;
}

export interface Vote {
  id: string;
  userId: string;
  reportId: string;
  voteType: 'upvote' | 'downvote';
  createdAt: string;
  updatedAt: string;
}

export interface PointsTransaction {
  id: string;
  userId: string;
  amount: number;
  reason: string;
  relatedReportId?: string;
  createdAt: string;
}

export interface ReportFlag {
  id: string;
  reportId: string;
  userId: string;
  reason: 'spam' | 'inappropriate' | 'duplicate' | 'inaccurate';
  description?: string;
  createdAt: string;
}

export interface Reward {
  id: string;
  title: string;
  description: string;
  pointsCost: number;
  partnerName: string;
  imageUrl?: string;
  stockAvailable: number; // -1 = unlimited
  isActive: boolean;
  expiresAt?: string;
  createdAt: string;
}

export interface RewardRedemption {
  id: string;
  userId: string;
  rewardId: string;
  couponCode: string;
  pointsSpent: number;
  redeemedAt: string;
  usedAt?: string;
  expiresAt?: string;
}

export interface VoteStats {
  upvotes: number;
  downvotes: number;
  netScore: number;
  userVote?: 'upvote' | 'downvote' | null;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface CreateReportInput {
  transportType: 'bus' | 'tram' | 'train' | 'metro';
  line: string;
  vehicleNumber?: string;
  location: {
    lat: number;
    lng: number;
    address?: string;
    stopId?: string;
  };
  severity: 'minor' | 'moderate' | 'severe';
  issueCategory: 'mechanical' | 'signal' | 'weather' | 'accident' | 'crowding' | 'other';
  description: string;
}

export interface LoginRequest {
  email?: string;
  username?: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
}
