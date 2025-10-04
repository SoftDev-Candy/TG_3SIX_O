'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { 
  AlertCircle, 
  TrendingUp, 
  Users, 
  Clock,
  Plus,
  Filter,
  Search,
  Menu,
  X
} from 'lucide-react';

// Dynamically import Leaflet map to avoid SSR issues
const LeafletMap = dynamic(() => import('@/components/map/LeafletMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gradient-to-br from-blue-100 to-green-100 flex items-center justify-center">
      <div className="text-center p-4">
        <div className="text-6xl mb-4">🗺️</div>
        <h3 className="text-lg font-semibold mb-2">Loading Map...</h3>
        <p className="text-gray-600">Initializing Leaflet</p>
      </div>
    </div>
  ),
});

export default function MapPage() {
  const [showStats, setShowStats] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Full Viewport Leaflet Map */}
      <LeafletMap className="absolute inset-0" />

      {/* Floating Controls - Mobile First */}
      
      {/* Top Left: Stats Toggle */}
      <div className="absolute top-4 left-4 z-[1000]">
        <Button
          variant="outline"
          size="icon"
          className="bg-white/95 backdrop-blur-sm shadow-xl border-2 border-white/50 hover:bg-white"
          onClick={() => setShowStats(!showStats)}
        >
          <TrendingUp className="w-4 h-4" />
        </Button>
      </div>

      {/* Top Right: Filter (Theme toggle hidden during development) */}
      <div className="absolute top-4 right-4 z-[1000]">
        <Button
          variant="outline"
          size="icon"
          className="bg-white/95 backdrop-blur-sm shadow-xl border-2 border-white/50 hover:bg-white"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter className="w-4 h-4" />
        </Button>
      </div>

      {/* Bottom Right: Report Delay FAB */}
      <div className="absolute bottom-20 right-4 z-[1000]">
        <Button
          size="lg"
          className="rounded-full w-14 h-14 shadow-2xl bg-emerald-600 hover:bg-emerald-700 border-2 border-white/30"
        >
          <Plus className="w-6 h-6" />
        </Button>
      </div>

      {/* Transport Type Filter - Bottom Center */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-[1000]">
        <div className="flex gap-1 bg-white/95 backdrop-blur-sm rounded-full p-2 shadow-xl border-2 border-white/50">
          <Badge variant="secondary" className="cursor-pointer hover:bg-gray-200 text-xs">🚌 Bus</Badge>
          <Badge variant="secondary" className="cursor-pointer hover:bg-gray-200 text-xs">🚊 Tram</Badge>
          <Badge variant="secondary" className="cursor-pointer hover:bg-gray-200 text-xs">🚆 Train</Badge>
          <Badge variant="secondary" className="cursor-pointer hover:bg-gray-200 text-xs">🚇 Metro</Badge>
        </div>
      </div>

      {/* Severity Legend - Bottom Left */}
      <div className="absolute bottom-4 left-4 z-[1000]">
        <div className="bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-xl border-2 border-white/50">
          <div className="flex flex-col gap-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Minor</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span>Moderate</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span>Severe</span>
            </div>
          </div>
        </div>
      </div>

      {/* Expandable Stats Panel */}
      {showStats && (
        <div className="absolute top-16 left-4 right-4 z-[1001] md:left-4 md:right-auto md:w-80">
          <Card className="bg-white/95 backdrop-blur-sm shadow-lg">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Live Stats</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowStats(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-500">—</div>
                  <div className="text-xs text-gray-600">Active Delays</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-500">—</div>
                  <div className="text-xs text-gray-600">Reports Today</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-500">—</div>
                  <div className="text-xs text-gray-600">Active Users</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-500">—</div>
                  <div className="text-xs text-gray-600">Avg Response</div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Expandable Filters Panel */}
      {showFilters && (
        <div className="absolute top-16 right-4 left-4 z-[1001] md:left-auto md:w-80">
          <Card className="bg-white/95 backdrop-blur-sm shadow-lg">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Filters</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowFilters(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium">Transport Type</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    <Badge variant="outline" className="cursor-pointer">All</Badge>
                    <Badge variant="outline" className="cursor-pointer">🚌 Bus</Badge>
                    <Badge variant="outline" className="cursor-pointer">🚊 Tram</Badge>
                    <Badge variant="outline" className="cursor-pointer">🚆 Train</Badge>
                    <Badge variant="outline" className="cursor-pointer">🚇 Metro</Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Severity</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    <Badge variant="outline" className="cursor-pointer">All</Badge>
                    <Badge variant="outline" className="cursor-pointer">Minor</Badge>
                    <Badge variant="outline" className="cursor-pointer">Moderate</Badge>
                    <Badge variant="outline" className="cursor-pointer">Severe</Badge>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
