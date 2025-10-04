'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import ReportDelayForm from '@/components/forms/ReportDelayForm';
import { UserProfile } from '@/components/auth/UserProfile';
import { useAuth } from '@/contexts/AuthContext';
import { 
  AlertCircle, 
  Clock,
  Filter,
  Menu,
  X,
  Home,
  BarChart3,
  Crosshair,
  Activity,
  UserCircle,
  User
} from 'lucide-react';

// Dynamically import Leaflet map to avoid SSR issues
const LeafletMap = dynamic(() => import('@/components/map/LeafletMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-base-200">
      <div className="text-center p-4">
        <span className="loading loading-spinner loading-lg text-primary"></span>
        <h3 className="text-lg font-semibold mt-4">Loading Map...</h3>
        <p className="text-base-content/60 mt-2">Initializing Leaflet</p>
      </div>
    </div>
  ),
});

export default function MapPage() {
  const [showStats, setShowStats] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [activeTab, setActiveTab] = useState('map');
  const { user, isAuthenticated } = useAuth();

  const handleReportSubmit = async (data: any) => {
    // TODO: Implement report submission to API
    console.log('Report submitted:', data);
    setShowReportModal(false);
  };

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Full Viewport Leaflet Map */}
      <LeafletMap className="absolute inset-0" />
      
      {/* Map Overlay for better button visibility */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/20 to-transparent" />
      </div>

      {/* Top Controls - My Location (disabled for now) */}
      {/* <div className="absolute top-4 right-4 z-[1000]">
        <button 
          className="btn btn-sm bg-base-100/90 backdrop-blur-sm border-base-300 hover:bg-base-100 shadow-lg"
          onClick={() => {
            console.log('Center map on user location');
          }}
        >
          <Crosshair className="w-4 h-4" />
          <span className="hidden sm:inline">My Location</span>
        </button>
      </div> */}

      {/* Mobile Navigation Menu - Slide up from bottom */}
      {showMobileMenu && (
        <div className="absolute bottom-20 left-0 right-0 z-[1001] animate-in slide-in-from-bottom duration-300">
          <div className="card bg-base-100/95 backdrop-blur-sm shadow-2xl mx-4 rounded-t-2xl">
            <div className="card-body p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="card-title text-lg">Navigation</h3>
                <button 
                  className="btn btn-ghost btn-sm btn-circle"
                  onClick={() => {
                    setShowMobileMenu(false);
                    setActiveTab('map');
                  }}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <nav className="grid grid-cols-2 gap-3">
                <Link
                  href="/dashboard"
                  className="btn btn-outline justify-start"
                  onClick={() => setShowMobileMenu(false)}
                >
                  <Home className="w-5 h-5" />
                  Dashboard
                </Link>
                <Link
                  href="/profile"
                  className="btn btn-outline justify-start"
                  onClick={() => setShowMobileMenu(false)}
                >
                  <User className="w-5 h-5" />
                  Profile
                </Link>
                <Link
                  href="/history"
                  className="btn btn-outline justify-start"
                  onClick={() => setShowMobileMenu(false)}
                >
                  <Clock className="w-5 h-5" />
                  History
                </Link>
                <button
                  className="btn btn-outline justify-start"
                  onClick={() => {
                    setShowFilters(!showFilters);
                    setShowMobileMenu(false);
                  }}
                >
                  <Filter className="w-5 h-5" />
                  Filters
                </button>
              </nav>
              
              {/* Transport Type Quick Filters */}
              <div className="mt-4 pt-4 border-t border-base-300">
                <h4 className="text-sm font-medium mb-3">Quick Filters</h4>
                <div className="grid grid-cols-4 gap-2">
                  <button className="btn btn-outline btn-sm flex-col h-auto py-3">
                    <span className="text-lg mb-1">🚌</span>
                    <span className="text-xs">Bus</span>
                  </button>
                  <button className="btn btn-outline btn-sm flex-col h-auto py-3">
                    <span className="text-lg mb-1">🚊</span>
                    <span className="text-xs">Tram</span>
                  </button>
                  <button className="btn btn-outline btn-sm flex-col h-auto py-3">
                    <span className="text-lg mb-1">🚆</span>
                    <span className="text-xs">Train</span>
                  </button>
                  <button className="btn btn-outline btn-sm flex-col h-auto py-3">
                    <span className="text-lg mb-1">🚇</span>
                    <span className="text-xs">Metro</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BOTTOM NAVIGATION BAR - Custom Mobile-First Design */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-2xl z-[1000] safe-area-inset-bottom">
        <div className="flex items-center justify-around px-2 py-3 max-w-screen-xl mx-auto">
          
          {/* Menu Button */}
          <button 
            className={`flex flex-col items-center justify-center min-w-[64px] h-16 rounded-xl transition-all ${
              activeTab === 'menu' 
                ? 'bg-blue-100 text-blue-600' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
            onClick={() => {
              setActiveTab('menu');
              setShowMobileMenu(!showMobileMenu);
            }}
          >
            <Menu className="w-6 h-6 mb-1" />
            <span className="text-xs font-medium">Menu</span>
          </button>

          {/* Report Button - Prominent */}
          <button 
            className={`flex flex-col items-center justify-center min-w-[80px] h-16 rounded-xl transition-all font-bold ${
              activeTab === 'report'
                ? 'bg-red-700 text-white scale-105'
                : 'bg-red-600 text-white hover:bg-red-700 hover:scale-105'
            } shadow-lg`}
            onClick={() => {
              setActiveTab('report');
              setShowReportModal(true);
            }}
          >
            <AlertCircle className="w-7 h-7 mb-1" />
            <span className="text-xs font-bold">Report</span>
          </button>

          {/* Delays/Stats Button */}
          <button 
            className={`flex flex-col items-center justify-center min-w-[64px] h-16 rounded-xl transition-all ${
              activeTab === 'delays'
                ? 'bg-blue-100 text-blue-600'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
            onClick={() => {
              setActiveTab('delays');
              setShowStats(!showStats);
            }}
          >
            <Activity className="w-6 h-6 mb-1" />
            <span className="text-xs font-medium">Delays</span>
          </button>

          {/* Profile Button */}
          <button 
            className={`flex flex-col items-center justify-center min-w-[64px] h-16 rounded-xl transition-all ${
              activeTab === 'profile'
                ? 'bg-blue-100 text-blue-600'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
            onClick={() => {
              setActiveTab('profile');
              if (isAuthenticated) {
                // TODO: Show profile panel
                console.log('Show profile');
              } else {
                window.location.href = '/login';
              }
            }}
          >
            <UserCircle className="w-6 h-6 mb-1" />
            <span className="text-xs font-medium">
              {isAuthenticated ? 'Profile' : 'Login'}
            </span>
          </button>
        </div>
      </div>

      {/* Report Modal - Above Navbar */}
      {showReportModal && (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowReportModal(false)}
          />
          
          {/* Modal Content */}
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h3 className="font-bold text-lg">Report Transit Delay</h3>
              <button 
                className="btn btn-sm btn-circle btn-ghost"
                onClick={() => setShowReportModal(false)}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6">
              <ReportDelayForm 
                onSubmit={handleReportSubmit}
                isSubmitting={false}
              />
            </div>
          </div>
        </div>
      )}

      {/* Delays/Stats Panel - Slide up from bottom */}
      {showStats && (
        <div className="absolute bottom-20 left-0 right-0 z-[1001] animate-in slide-in-from-bottom duration-300">
          <div className="card bg-base-100/95 backdrop-blur-sm shadow-2xl mx-4 rounded-t-2xl">
            <div className="card-body p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="card-title">Live Delays & Stats</h3>
                <button 
                  className="btn btn-ghost btn-sm btn-circle"
                  onClick={() => {
                    setShowStats(false);
                    setActiveTab('map');
                  }}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="stat bg-error/10 rounded-lg border border-error/20 p-3">
                  <div className="stat-value text-2xl text-error">12</div>
                  <div className="stat-desc">Active Delays</div>
                </div>
                <div className="stat bg-info/10 rounded-lg border border-info/20 p-3">
                  <div className="stat-value text-2xl text-info">47</div>
                  <div className="stat-desc">Reports Today</div>
                </div>
                <div className="stat bg-success/10 rounded-lg border border-success/20 p-3">
                  <div className="stat-value text-2xl text-success">234</div>
                  <div className="stat-desc">Active Users</div>
                </div>
                <div className="stat bg-secondary/10 rounded-lg border border-secondary/20 p-3">
                  <div className="stat-value text-2xl text-secondary">3.2m</div>
                  <div className="stat-desc">Avg Response</div>
                </div>
              </div>
              
              {/* Severity Legend */}
              <div className="divider my-2"></div>
              <div>
                <h4 className="text-sm font-medium mb-3">Severity Levels</h4>
                <div className="flex justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-success rounded-full"></div>
                    <span>Minor (1-5m)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-warning rounded-full"></div>
                    <span>Moderate (5-15m)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-error rounded-full"></div>
                    <span>Severe (15m+)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters Panel */}
      {showFilters && (
        <div className="absolute top-20 right-4 left-4 z-[1001] md:left-auto md:w-72 animate-in fade-in duration-200">
          <div className="card bg-base-100/95 backdrop-blur-sm shadow-lg">
            <div className="card-body p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="card-title text-sm">Filters</h3>
                <button 
                  className="btn btn-ghost btn-xs btn-circle"
                  onClick={() => setShowFilters(false)}
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="label label-text text-xs font-medium">Transport Type</label>
                  <div className="flex flex-wrap gap-1">
                    <span className="badge badge-outline cursor-pointer hover:badge-primary">All</span>
                    <span className="badge badge-outline cursor-pointer hover:badge-primary">🚌 Bus</span>
                    <span className="badge badge-outline cursor-pointer hover:badge-primary">🚊 Tram</span>
                    <span className="badge badge-outline cursor-pointer hover:badge-primary">🚆 Train</span>
                    <span className="badge badge-outline cursor-pointer hover:badge-primary">🚇 Metro</span>
                  </div>
                </div>
                
                <div>
                  <label className="label label-text text-xs font-medium">Severity</label>
                  <div className="flex flex-wrap gap-1">
                    <span className="badge badge-outline cursor-pointer hover:badge-primary">All</span>
                    <span className="badge badge-success badge-outline cursor-pointer">Minor</span>
                    <span className="badge badge-warning badge-outline cursor-pointer">Moderate</span>
                    <span className="badge badge-error badge-outline cursor-pointer">Severe</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
