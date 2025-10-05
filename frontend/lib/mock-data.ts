// Mock data for hackathon/demo mode when backend is unavailable
import type { DelayReport, User } from '@/types';

// Mock users for reports
export const mockUsers: User[] = [
  {
    id: 'user-1',
    email: 'anna@krakow.com',
    username: 'anna_transit',
    points: 450,
    level: 5,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'user-2',
    email: 'marek@krakow.com',
    username: 'marek_commuter',
    points: 280,
    level: 4,
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'user-3',
    email: 'zofia@krakow.com',
    username: 'zofia_daily',
    points: 180,
    level: 3,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// Mock delay reports
export const mockReports: DelayReport[] = [
  {
    id: 'report-1',
    userId: 'user-1',
    user: {
      username: 'anna_transit',
      avatar: undefined,
    },
    location: {
      lat: 50.0614,
      lng: 19.9372,
      address: 'Main Square, Kraków',
      stopName: 'Rynek Główny',
    },
    transportType: 'tram',
    line: '8',
    vehicleNumber: 'NG2341',
    severity: 'moderate',
    category: 'mechanical',
    description: 'Tram door malfunction causing delays. Maintenance crew on site.',
    photos: [],
    status: 'verified',
    upvotes: 12,
    downvotes: 1,
    reportedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(), // 45 min ago
    verifiedBy: ['user-2', 'user-3'],
  },
  {
    id: 'report-2',
    userId: 'user-2',
    user: {
      username: 'marek_commuter',
      avatar: undefined,
    },
    location: {
      lat: 50.067472,
      lng: 19.991694,
      address: 'Tauron Arena, Kraków',
      stopName: 'Tauron Arena',
    },
    transportType: 'tram',
    line: '52',
    vehicleNumber: 'EU1889',
    severity: 'severe',
    category: 'signal',
    description: 'Signal failure at intersection. Multiple trams backed up in both directions.',
    photos: [],
    status: 'verified',
    upvotes: 24,
    downvotes: 0,
    reportedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 min ago
    verifiedBy: ['user-1', 'user-3'],
  },
  {
    id: 'report-3',
    userId: 'user-3',
    user: {
      username: 'zofia_daily',
      avatar: undefined,
    },
    location: {
      lat: 50.0778,
      lng: 19.8956,
      address: 'AGH University, Kraków',
      stopName: 'AGH Dworzec',
    },
    transportType: 'bus',
    line: '194',
    vehicleNumber: 'EY3983',
    severity: 'minor',
    category: 'crowding',
    description: 'Bus extremely crowded during morning rush. Standing room only.',
    photos: [],
    status: 'pending',
    upvotes: 5,
    downvotes: 0,
    reportedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 min ago
  },
  {
    id: 'report-4',
    userId: 'user-1',
    user: {
      username: 'anna_transit',
      avatar: undefined,
    },
    location: {
      lat: 50.0677,
      lng: 19.9445,
      address: 'Kraków Główny Station',
      stopName: 'Dworzec Główny',
    },
    transportType: 'train',
    line: 'S1',
    vehicleNumber: undefined,
    severity: 'moderate',
    category: 'weather',
    description: 'Train delayed due to heavy rain affecting track conditions. 15-20 min delay expected.',
    photos: [],
    status: 'verified',
    upvotes: 18,
    downvotes: 2,
    reportedAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(), // 1 hour ago
    verifiedBy: ['user-2'],
  },
  {
    id: 'report-5',
    userId: 'user-2',
    user: {
      username: 'marek_commuter',
      avatar: undefined,
    },
    location: {
      lat: 50.0547,
      lng: 19.9447,
      address: 'Wawel Castle area',
      stopName: 'Wawel',
    },
    transportType: 'tram',
    line: '18',
    vehicleNumber: 'NG3456',
    severity: 'minor',
    category: 'crowding',
    description: 'Tram very crowded with tourists. Multiple trams passing full.',
    photos: [],
    status: 'pending',
    upvotes: 3,
    downvotes: 0,
    reportedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(), // 10 min ago
  },
];

// Track user-submitted reports in memory
let userSubmittedReports: DelayReport[] = [];

export function addMockReport(report: DelayReport): DelayReport {
  userSubmittedReports.unshift(report);
  return report;
}

export function getMockReports(): DelayReport[] {
  return [...userSubmittedReports, ...mockReports];
}

export function clearMockReports(): void {
  userSubmittedReports = [];
}
