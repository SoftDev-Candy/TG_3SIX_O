'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, TrendingUp, Users, Clock } from 'lucide-react';

export default function MapPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Delays</p>
              <p className="text-2xl font-bold mt-1">—</p>
            </div>
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Reports Today</p>
              <p className="text-2xl font-bold mt-1">—</p>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-500" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Users</p>
              <p className="text-2xl font-bold mt-1">—</p>
            </div>
            <Users className="w-8 h-8 text-green-500" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Response</p>
              <p className="text-2xl font-bold mt-1">—</p>
            </div>
            <Clock className="w-8 h-8 text-purple-500" />
          </div>
        </Card>
      </div>

      {/* Map Container */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Live Delay Map</h2>
          <div className="flex gap-2">
            <Badge>🚌 Bus</Badge>
            <Badge>🚊 Train</Badge>
            <Badge>🚇 Metro</Badge>
          </div>
        </div>
        
        {/* Placeholder for map - will integrate Leaflet later */}
        <div className="w-full h-[500px] bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">🗺️</div>
            <h3 className="text-lg font-semibold mb-2">Interactive Map Coming Soon</h3>
            <p className="text-gray-600 mb-4">
              Leaflet integration with real-time delay markers
            </p>
            <Button>View Demo Data</Button>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Minor</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span>Moderate</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span>Severe</span>
          </div>
        </div>
      </Card>

      {/* Recent Reports */}
      <Card className="p-6 mt-6">
        <h3 className="text-lg font-bold mb-4">Recent Reports</h3>
        <div className="space-y-3">
          <div className="text-center text-gray-500 py-8">
            <p>No recent reports</p>
            <Button className="mt-4" variant="outline">
              Report a Delay
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
