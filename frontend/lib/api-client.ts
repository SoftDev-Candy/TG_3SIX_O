import type {
  User,
  DelayReport,
  Route,
  CreateReportInput,
  RouteSearchInput,
  ApiResponse,
  PaginatedResponse,
  PointsTransaction,
  Reward,
  Vote,
  VoteStats,
  Offer,
  Redemption,
  OfferCategory,
} from '@/types';
import { getMockReports, addMockReport } from './mock-data';
import { recordVote, hasUserVoted } from './vote-tracker';
import { mockOffers, getMockRedemptions, addMockRedemption, seedMockRedemptions } from './mock-offers';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const MOCK_DATA_ENABLED = process.env.NEXT_PUBLIC_MOCK_AUTH_ENABLED === 'true';

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    // Load token from localStorage if available
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token');
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || 'An error occurred',
        };
      }

      return {
        success: true,
        data: data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('auth_token', token);
      } else {
        localStorage.removeItem('auth_token');
      }
    }
  }

  // Auth endpoints
  async register(email: string, username: string, password: string) {
    return this.request<{ user: User; token: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, username, password }),
    });
  }

  async login(email: string, password: string) {
    return this.request<{ user: User; token: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async loginWithUsername(username: string, password: string) {
    return this.request<{ user: User; token: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  }

  async logout() {
    const result = await this.request('/api/auth/logout', { method: 'POST' });
    this.setToken(null);
    return result;
  }

  async getCurrentUser() {
    return this.request<User>('/api/auth/me');
  }

  // Report endpoints
  async createReport(input: CreateReportInput, currentUserId?: string) {
    const formData = new FormData();
    
    // Append non-file fields
    Object.entries(input).forEach(([key, value]) => {
      if (key === 'photos') return;
      if (key === 'location') {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, String(value));
      }
    });

    // Append photos
    if (input.photos) {
      input.photos.forEach((photo) => {
        formData.append('photos', photo);
      });
    }

    const result = await this.request<DelayReport>('/api/reports', {
      method: 'POST',
      body: formData,
      headers: {}, // Let browser set Content-Type for FormData
    });
    
    // Fallback to mock report creation if backend unavailable
    if (!result.success && MOCK_DATA_ENABLED) {
      // Get stored mock user data
      const mockUserData = typeof window !== 'undefined' ? localStorage.getItem('mock_user_data') : null;
      const mockUser = mockUserData ? JSON.parse(mockUserData) : null;
      
      const mockReport: DelayReport = {
        id: 'mock-report-' + Date.now(),
        userId: currentUserId || mockUser?.id || 'demo-user-' + Date.now(),
        user: {
          username: mockUser?.username || 'You',
          avatar: undefined,
        },
        location: input.location,
        transportType: input.transportType,
        line: input.line,
        vehicleNumber: input.vehicleNumber,
        severity: input.severity,
        category: input.category,
        description: input.description,
        photos: [],
        status: 'pending',
        upvotes: 0,
        downvotes: 0,
        reportedAt: new Date().toISOString(),
      };
      
      addMockReport(mockReport);
      console.log('🎭 Mock report created (backend unavailable)');
      
      return {
        success: true,
        data: mockReport,
      };
    }
    
    return result;
  }

  async getReports(filters?: {
    transportType?: string;
    severity?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const params = new URLSearchParams(filters as Record<string, string>);
    const result = await this.request<PaginatedResponse<DelayReport>>(
      `/api/reports?${params.toString()}`
    );
    
    // Fallback to mock data if backend unavailable
    if (!result.success && MOCK_DATA_ENABLED) {
      const mockReports = getMockReports();
      console.log('🎭 Using mock reports data (backend unavailable)');
      return {
        success: true,
        data: {
          items: mockReports,
          total: mockReports.length,
          page: 1,
          limit: 50,
          hasMore: false,
        },
      };
    }
    
    return result;
  }

  async getReport(id: string) {
    return this.request<DelayReport>(`/api/reports/${id}`);
  }

  async voteReport(id: string, voteType: 'upvote' | 'downvote') {
    const result = await this.request<{ report: DelayReport; voteStats: VoteStats }>(`/api/reports/${id}/vote`, {
      method: 'PATCH',
      body: JSON.stringify({ voteType }),
    });
    
    // Fallback to mock vote if backend unavailable
    if (!result.success && MOCK_DATA_ENABLED) {
      const existingVote = hasUserVoted(id);
      
      // Record/toggle the vote in localStorage
      recordVote(id, voteType);
      
      // Check new vote state after toggle
      const newVoteState = hasUserVoted(id);
      
      console.log('🎭 Mock vote action (backend unavailable)');
      return {
        success: true,
        data: {
          report: {} as DelayReport,
          voteStats: {
            upvotes: newVoteState === 'upvote' ? 1 : 0,
            downvotes: newVoteState === 'downvote' ? 1 : 0,
            userVote: newVoteState,
          },
        },
      };
    }
    
    // Record vote in tracker if successful (for persistence)
    if (result.success && MOCK_DATA_ENABLED) {
      recordVote(id, voteType);
    }
    
    return result;
  }

  async getReportVoteStats(id: string) {
    return this.request<VoteStats>(`/api/reports/${id}/votes`);
  }

  async getUserVotes(userId?: string) {
    const endpoint = userId ? `/api/votes/user/${userId}` : '/api/votes/me';
    return this.request<PaginatedResponse<Vote>>(endpoint);
  }

  async deleteReport(id: string) {
    return this.request(`/api/reports/${id}`, { method: 'DELETE' });
  }

  // User endpoints
  async getUserProfile(id: string) {
    return this.request<User>(`/api/users/${id}`);
  }

  async updateProfile(data: Partial<User>) {
    return this.request<User>('/api/users/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async getLeaderboard(limit = 10) {
    return this.request<User[]>(`/api/users/leaderboard?limit=${limit}`);
  }

  // Route endpoints
  async calculateRoute(input: RouteSearchInput) {
    return this.request<Route>('/api/routes/calculate', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  async getSavedRoutes() {
    return this.request<Route[]>('/api/routes/saved');
  }

  async saveRoute(routeId: string) {
    return this.request<Route>('/api/routes/saved', {
      method: 'POST',
      body: JSON.stringify({ routeId }),
    });
  }

  async deleteSavedRoute(routeId: string) {
    return this.request(`/api/routes/saved/${routeId}`, { method: 'DELETE' });
  }

  // Points endpoints
  async getPointsHistory(page = 1, limit = 20) {
    return this.request<PaginatedResponse<PointsTransaction>>(
      `/api/points/history?page=${page}&limit=${limit}`
    );
  }

  async getAvailableRewards() {
    return this.request<Reward[]>('/api/points/rewards');
  }

  async redeemReward(rewardId: string) {
    return this.request<{ couponCode: string }>('/api/points/redeem', {
      method: 'POST',
      body: JSON.stringify({ rewardId }),
    });
  }

  // Offers & Redemptions endpoints
  async getOffers(category?: OfferCategory) {
    const result = await this.request<Offer[]>(
      category ? `/api/offers?category=${category}` : '/api/offers'
    );

    // Fallback to mock data if backend unavailable
    if (!result.success && MOCK_DATA_ENABLED) {
      console.log('🎁 Using mock offers (backend unavailable)');
      const filteredOffers = category 
        ? mockOffers.filter(o => o.category === category)
        : mockOffers;
      return {
        success: true,
        data: filteredOffers,
      };
    }

    return result;
  }

  async getOffer(offerId: string) {
    const result = await this.request<Offer>(`/api/offers/${offerId}`);

    // Fallback to mock data
    if (!result.success && MOCK_DATA_ENABLED) {
      const offer = mockOffers.find(o => o.id === offerId);
      if (offer) {
        return { success: true, data: offer };
      }
    }

    return result;
  }

  async redeemOffer(offerId: string, userId: string) {
    const result = await this.request<Redemption>(`/api/offers/${offerId}/redeem`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });

    // Fallback to mock redemption
    if (!result.success && MOCK_DATA_ENABLED) {
      console.log('🎁 Mock redemption (backend unavailable)');
      const offer = mockOffers.find(o => o.id === offerId);
      if (offer) {
        const redemption = addMockRedemption(userId, offer);
        return { success: true, data: redemption };
      }
      return { success: false, error: 'Offer not found' };
    }

    return result;
  }

  async getUserRedemptions(userId?: string) {
    const endpoint = userId ? `/api/users/${userId}/redemptions` : '/api/users/me/redemptions';
    const result = await this.request<Redemption[]>(endpoint);

    // Fallback to mock data
    if (!result.success && MOCK_DATA_ENABLED) {
      console.log('🎁 Using mock redemptions (backend unavailable)');
      // Ensure we have a userId
      const mockUserId = userId || 'mock-user-1';
      
      // Seed demo redemptions if none exist
      const existingRedemptions = getMockRedemptions(mockUserId);
      if (existingRedemptions.length === 0) {
        seedMockRedemptions(mockUserId);
      }
      
      return {
        success: true,
        data: getMockRedemptions(mockUserId),
      };
    }

    return result;
  }

  async getRedemption(redemptionId: string) {
    const result = await this.request<Redemption>(`/api/redemptions/${redemptionId}`);

    // Fallback to mock data
    if (!result.success && MOCK_DATA_ENABLED) {
      const allRedemptions = getMockRedemptions('mock-user-1'); // would need userId
      const redemption = allRedemptions.find(r => r.id === redemptionId);
      if (redemption) {
        return { success: true, data: redemption };
      }
    }

    return result;
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
