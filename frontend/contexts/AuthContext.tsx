'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { apiClient } from '@/lib/api-client';
import type { User } from '@/types';

// Hackathon fallback: Works without backend
// Controlled via NEXT_PUBLIC_MOCK_AUTH_ENABLED in .env.local
const MOCK_AUTH_ENABLED = process.env.NEXT_PUBLIC_MOCK_AUTH_ENABLED === 'true';
const MOCK_USER_KEY = 'mock_user_data';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginWithUsername: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateUserPoints: (pointsToAdd: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check for mock user first (hackathon fallback)
        if (MOCK_AUTH_ENABLED && typeof window !== 'undefined') {
          const mockUserData = localStorage.getItem(MOCK_USER_KEY);
          if (mockUserData) {
            const mockUser = JSON.parse(mockUserData);
            setUser(mockUser);
            console.log('🎭 Using mock authentication for demo');
            setIsLoading(false);
            return;
          }
        }

        // Try real backend authentication
        const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
        
        if (token) {
          // Verify token and get user data
          const result = await apiClient.getCurrentUser();
          if (result.success && result.data) {
            setUser(result.data);
          } else {
            // Token is invalid, clear it
            apiClient.setToken(null);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        
        // Fallback to mock auth if backend is down
        if (MOCK_AUTH_ENABLED && typeof window !== 'undefined') {
          const mockUserData = localStorage.getItem(MOCK_USER_KEY);
          if (mockUserData) {
            const mockUser = JSON.parse(mockUserData);
            setUser(mockUser);
            console.log('🎭 Backend unavailable, using mock authentication');
          }
        } else {
          apiClient.setToken(null);
        }
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const result = await apiClient.login(email, password);
      
      if (result.success && result.data) {
        apiClient.setToken(result.data.token);
        setUser(result.data.user);
        return { success: true };
      } else {
        // Backend returned error - try mock auth fallback
        if (MOCK_AUTH_ENABLED) {
          const mockUser: User = {
            id: 'demo-user-' + Date.now(),
            email: email,
            username: email.split('@')[0],
            points: 150,
            level: 3,
            createdAt: new Date().toISOString(),
          };
          
          if (typeof window !== 'undefined') {
            localStorage.setItem(MOCK_USER_KEY, JSON.stringify(mockUser));
          }
          
          setUser(mockUser);
          console.log('🎭 Mock login successful for demo (backend unavailable)');
          return { success: true };
        }
        return { success: false, error: result.error || 'Login failed' };
      }
    } catch (error) {
      // Unexpected error - also try mock auth fallback
      if (MOCK_AUTH_ENABLED) {
        const mockUser: User = {
          id: 'demo-user-' + Date.now(),
          email: email,
          username: email.split('@')[0],
          points: 150,
          level: 3,
          createdAt: new Date().toISOString(),
        };
        
        if (typeof window !== 'undefined') {
          localStorage.setItem(MOCK_USER_KEY, JSON.stringify(mockUser));
        }
        
        setUser(mockUser);
        console.log('🎭 Mock login successful for demo');
        return { success: true };
      }
      
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'An unexpected error occurred' 
      };
    }
  };

  const loginWithUsername = async (username: string, password: string) => {
    try {
      const result = await apiClient.loginWithUsername(username, password);
      
      if (result.success && result.data) {
        apiClient.setToken(result.data.token);
        setUser(result.data.user);
        return { success: true };
      } else {
        // Backend returned error - try mock auth fallback
        if (MOCK_AUTH_ENABLED) {
          const mockUser: User = {
            id: 'demo-user-' + Date.now(),
            email: username + '@demo.com',
            username: username,
            points: 150,
            level: 3,
            createdAt: new Date().toISOString(),
          };
          
          if (typeof window !== 'undefined') {
            localStorage.setItem(MOCK_USER_KEY, JSON.stringify(mockUser));
          }
          
          setUser(mockUser);
          console.log('🎭 Mock login successful for demo (backend unavailable)');
          return { success: true };
        }
        return { success: false, error: result.error || 'Login failed' };
      }
    } catch (error) {
      // Unexpected error - also try mock auth fallback
      if (MOCK_AUTH_ENABLED) {
        const mockUser: User = {
          id: 'demo-user-' + Date.now(),
          email: username + '@demo.com',
          username: username,
          points: 150,
          level: 3,
          createdAt: new Date().toISOString(),
        };
        
        if (typeof window !== 'undefined') {
          localStorage.setItem(MOCK_USER_KEY, JSON.stringify(mockUser));
        }
        
        setUser(mockUser);
        console.log('🎭 Mock login successful for demo');
        return { success: true };
      }
      
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'An unexpected error occurred' 
      };
    }
  };

  const register = async (email: string, username: string, password: string) => {
    try {
      const result = await apiClient.register(email, username, password);
      
      if (result.success && result.data) {
        apiClient.setToken(result.data.token);
        setUser(result.data.user);
        return { success: true };
      } else {
        // Backend returned error - try mock auth fallback
        if (MOCK_AUTH_ENABLED) {
          const mockUser: User = {
            id: 'demo-user-' + Date.now(),
            email: email,
            username: username,
            points: 0,
            level: 1,
            createdAt: new Date().toISOString(),
          };
          
          if (typeof window !== 'undefined') {
            localStorage.setItem(MOCK_USER_KEY, JSON.stringify(mockUser));
          }
          
          setUser(mockUser);
          console.log('🎭 Mock registration successful for demo (backend unavailable)');
          return { success: true };
        }
        return { success: false, error: result.error || 'Registration failed' };
      }
    } catch (error) {
      // Unexpected error - also try mock auth fallback
      if (MOCK_AUTH_ENABLED) {
        const mockUser: User = {
          id: 'demo-user-' + Date.now(),
          email: email,
          username: username,
          points: 0,
          level: 1,
          createdAt: new Date().toISOString(),
        };
        
        if (typeof window !== 'undefined') {
          localStorage.setItem(MOCK_USER_KEY, JSON.stringify(mockUser));
        }
        
        setUser(mockUser);
        console.log('🎭 Mock registration successful for demo');
        return { success: true };
      }
      
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'An unexpected error occurred' 
      };
    }
  };

  const logout = async () => {
    try {
      await apiClient.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      apiClient.setToken(null);
      
      // Clear mock user data
      if (MOCK_AUTH_ENABLED && typeof window !== 'undefined') {
        localStorage.removeItem(MOCK_USER_KEY);
      }
    }
  };

  const refreshUser = async () => {
    try {
      const result = await apiClient.getCurrentUser();
      if (result.success && result.data) {
        setUser(result.data);
      }
    } catch (error) {
      console.error('User refresh error:', error);
    }
  };

  const updateUserPoints = (pointsToAdd: number) => {
    if (!user) return;
    
    const updatedUser = {
      ...user,
      points: user.points + pointsToAdd,
    };
    
    setUser(updatedUser);
    
    // Update localStorage if using mock auth
    if (MOCK_AUTH_ENABLED && typeof window !== 'undefined') {
      localStorage.setItem(MOCK_USER_KEY, JSON.stringify(updatedUser));
    }
    
    console.log(`💰 Points updated: ${user.points} → ${updatedUser.points} (+${pointsToAdd})`);
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    loginWithUsername,
    register,
    logout,
    refreshUser,
    updateUserPoints,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
