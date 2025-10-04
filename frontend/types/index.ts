// User types
export interface User {
  id: string;
  email: string;
  username: string;
  points: number;
  level: number;
  createdAt: string;
}

// Location types
export interface Location {
  lat: number;
  lng: number;
  stopId?: string;
  stopName?: string;
  address?: string;
}

// Delay Report types
export type TransportType = 'bus' | 'train' | 'metro' | 'tram';
export type Severity = 'minor' | 'moderate' | 'severe';
export type ReportStatus = 'pending' | 'verified' | 'resolved' | 'rejected';
export type DelayCategory = 
  | 'mechanical' 
  | 'signal' 
  | 'weather' 
  | 'accident' 
  | 'crowding' 
  | 'staff_shortage'
  | 'other';

export interface DelayReport {
  id: string;
  userId: string;
  user?: {
    username: string;
    avatar?: string;
  };
  location: Location;
  transportType: TransportType;
  line: string;
  severity: Severity;
  category: DelayCategory;
  description: string;
  estimatedDelay: number; // minutes
  photos?: string[];
  status: ReportStatus;
  upvotes: number;
  downvotes: number;
  reportedAt: string;
  resolvedAt?: string;
  verifiedBy?: string[];
}

// Route types
export interface RouteSegment {
  id: string;
  from: Location;
  to: Location;
  mode: TransportType | 'walk';
  line?: string;
  duration: number; // minutes
  distance: number; // meters
  impactedByIncidents: string[];
}

export interface Route {
  id: string;
  origin: Location;
  destination: Location;
  segments: RouteSegment[];
  baselineDuration: number;
  adjustedDuration: number;
  totalDistance: number;
  affectedByIncidents: string[]; // incident IDs
  calculatedAt: string;
}

// Points & Gamification
export interface PointsTransaction {
  id: string;
  userId: string;
  amount: number;
  reason: string;
  relatedReportId?: string;
  createdAt: string;
}

export interface Reward {
  id: string;
  title: string;
  description: string;
  pointsCost: number;
  partnerName: string;
  couponCode?: string;
  expiresAt?: string;
  imageUrl?: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// Form types
export interface CreateReportInput {
  location: Location;
  transportType: TransportType;
  line: string;
  severity: Severity;
  category: DelayCategory;
  description: string;
  estimatedDelay: number;
  photos?: File[];
}

export interface RouteSearchInput {
  origin: Location;
  destination: Location;
  departureTime?: string;
  arriveBy?: boolean;
  avoidIncidents?: boolean;
}

// SSE Event types
export interface SSEDelayUpdate {
  type: 'new_report' | 'report_verified' | 'report_resolved' | 'report_updated';
  report: DelayReport;
}

export interface SSERouteUpdate {
  type: 'route_affected' | 'route_clear';
  routeId: string;
  affectedSegments: string[];
  newDuration?: number;
}
