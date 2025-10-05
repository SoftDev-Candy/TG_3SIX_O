'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in Leaflet with Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface DelayIncident {
  id: string;
  lat: number;
  lng: number;
  type: 'tram' | 'bus' | 'train';
  line: string;
  vehicleNumber?: string;
  description: string;
  severity: 'minor' | 'moderate' | 'severe';
  category?: string;
  reportedBy?: string;
  reportedAt?: string;
  upvotes?: number;
}

interface LeafletMapProps {
  className?: string;
  incidents?: DelayIncident[];
  currentUserId?: string;
}

export default function LeafletMap({ className = '', incidents = [], currentUserId }: LeafletMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const incidentMarkersRef = useRef<L.Marker[]>([]);

  // Helper function for transport icons
  const getTransportIcon = (type: string) => {
    switch(type) {
      case 'bus': return '🚌';
      case 'tram': return '🚊';
      case 'train': return '🚆';
      default: return '🚌';
    }
  };

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Initialize map centered on Kraków (Tauron Arena area)
    const map = L.map(mapRef.current, {
      center: [50.067472, 19.991694], // Tauron Arena, Kraków
      zoom: 13,
      zoomControl: false, // We'll add custom controls
    });

    // Grayscale base map for professional appearance (CartoDB Light)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '© CartoDB © OpenStreetMap contributors',
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map);

    // Add zoom control to bottom-right (mobile-friendly position)
    L.control.zoom({
      position: 'bottomright'
    }).addTo(map);

    // Sample public transport delay markers (will be replaced with real data)
    const sampleDelays = [
      { lat: 50.0675, lng: 19.9452, severity: 'severe', type: 'bus', description: 'Bus 52 - 15min delay', line: '52' },
      { lat: 50.0619, lng: 19.9368, severity: 'moderate', type: 'tram', description: 'Tram 8 - 8min delay', line: '8' },
      { lat: 50.0686, lng: 19.9469, severity: 'minor', type: 'train', description: 'Train to Wieliczka - 3min delay', line: 'SKA' },
      { lat: 50.0693, lng: 19.9534, severity: 'moderate', type: 'tram', description: 'Tram 10 - 5min delay', line: '10' },
      { lat: 50.0650, lng: 19.9413, severity: 'severe', type: 'tram', description: 'Tram 4 - 12min delay', line: '4' },
      { lat: 50.0657, lng: 19.9191, severity: 'minor', type: 'bus', description: 'Bus 173 - 2min delay', line: '173' },
      // Tauron Arena Tram 52 marker hidden - will show when user reports it
      // { lat: 50.067472, lng: 19.991694, severity: 'moderate', type: 'tram', description: 'Tram 52 - 7min delay', line: '52' },
    ];

    // Add delay markers with light mode colors only
    sampleDelays.forEach(delay => {
      // Severity colors (Map UI Specification)
      const getSeverityColor = (severity: string) => {
        switch(severity) {
          case 'severe': return '#DC2626';    // Red-600
          case 'minor': return '#16A34A';     // Green-600
          default: return '#16A34A';
        }
      };
      
      const color = getSeverityColor(delay.severity);

      // Size hierarchy based on severity (Map UI Specification)
      const getMarkerSize = (severity: string) => {
        switch(severity) {
          case 'severe': return { size: 32, fontSize: 16, border: 3, iconSize: 40 };
          case 'moderate': return { size: 28, fontSize: 14, border: 2, iconSize: 36 };
          case 'minor': return { size: 24, fontSize: 12, border: 2, iconSize: 32 };
          default: return { size: 24, fontSize: 12, border: 2, iconSize: 32 };
        }
      };
      
      const markerConfig = getMarkerSize(delay.severity);
      const shadowColor = color.replace('#', '');
      
      // Pulse animation for severe delays
      const pulseAnimation = delay.severity === 'severe' 
        ? 'animation: pulse-severe 2s ease-in-out infinite;' 
        : '';
      
      const icon = L.divIcon({
        className: 'custom-delay-marker',
        html: `
          <style>
            @keyframes pulse-severe {
              0%, 100% { transform: scale(1); opacity: 1; }
              50% { transform: scale(1.15); opacity: 0.8; }
            }
          </style>
          <div style="
            background-color: ${color};
            width: ${markerConfig.size}px;
            height: ${markerConfig.size}px;
            border-radius: 8px;
            border: ${markerConfig.border}px solid #FFFFFF;
            box-shadow: 0 4px 12px rgba(${parseInt(shadowColor.slice(0,2), 16)}, ${parseInt(shadowColor.slice(2,4), 16)}, ${parseInt(shadowColor.slice(4,6), 16)}, 0.4);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: ${markerConfig.fontSize}px;
            color: white;
            font-weight: bold;
            ${pulseAnimation}
          ">${getTransportIcon(delay.type)}</div>
        `,
        iconSize: [markerConfig.iconSize, markerConfig.iconSize],
        iconAnchor: [markerConfig.iconSize / 2, markerConfig.iconSize / 2],
      });

      const timeAgo = delay.reportedAt 
        ? new Date(delay.reportedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        : '';
      
      const marker = L.marker([delay.lat, delay.lng], { icon })
        .addTo(map)
        .bindPopup(`
          <div style="font-size: 13px; min-width: 220px; max-width: 280px;">
            <!-- Header -->
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px; padding-bottom: 8px; border-bottom: 1px solid #E5E7EB;">
              <span style="font-size: 18px;">${getTransportIcon(delay.type)}</span>
              <div style="flex: 1;">
                <div style="font-weight: bold; font-size: 15px;">Line ${delay.line}</div>
                ${delay.vehicleNumber ? `<div style="font-size: 11px; color: #6B7280;">#${delay.vehicleNumber}</div>` : ''}
              </div>
              <div style="display: flex; align-items: center; gap: 4px;">
                <span style="color: ${color}; font-size: 10px;">●</span>
                <span style="color: ${color}; font-weight: bold; text-transform: uppercase; font-size: 10px;">${delay.severity}</span>
              </div>
            </div>
            
            <!-- Description -->
            <div style="margin-bottom: 8px; color: #374151; line-height: 1.4;">${delay.description}</div>
            
            <!-- Footer -->
            <div style="display: flex; justify-content: space-between; align-items: center; font-size: 11px; color: #6B7280; padding-top: 6px; border-top: 1px solid #F3F4F6;">
              ${delay.reportedBy ? `<div>👤 ${delay.reportedBy}</div>` : '<div></div>'}
              <div style="display: flex; gap: 8px; align-items: center;">
                ${delay.upvotes ? `<span>👍 ${delay.upvotes}</span>` : ''}
                ${timeAgo ? `<span>🕒 ${timeAgo}</span>` : ''}
              </div>
            </div>
          </div>
        `);
      
      incidentMarkersRef.current.push(marker);
    });

    // Load transit routes from city-specific files (tram + bus)
    Promise.all([
      fetch('/data/cities/krakow/krakow-tram.json').then(res => res.json()),
      fetch('/data/cities/krakow/krakow-bus.json').then(res => res.json())
    ])
      .then(([tramData, busData]) => {
        // Merge tram and bus routes
        const allRoutes = [...tramData.routes, ...busData.routes];
        
        const transitRoutes = allRoutes.map((route: any) => ({
          id: route.id,
          line: route.lineNumber,
          type: route.transportType,
          color: route.color,
          stops: route.stops, // Include stop data
          path: route.path.coordinates.map((coord: [number, number]) => [coord[1], coord[0]] as [number, number]) // Swap lng,lat to lat,lng for Leaflet
        }));

        console.log(`Loaded ${tramData.routes.length} tram routes + ${busData.routes.length} bus routes`);

        // Render routes and stops
        renderTransitRoutes(transitRoutes, map, sampleDelays);
        renderStopMarkers(transitRoutes, map);
      })
      .catch(err => {
        console.error('Failed to load transit routes:', err);
      });

    mapInstanceRef.current = map;

    // Cleanup function
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Function to render transit routes on map
  function renderTransitRoutes(
    transitRoutes: Array<{id: string, line: string, type: string, color: string, stops?: any[], path: [number, number][]}>, 
    map: L.Map,
    delays: Array<{line: string, severity: string}>
  ) {
    // Map UI Specification colors
    const MAP_COLORS = {
      routeNormal: '#6B7280',    // Gray-500
      routeDelayed: '#EF4444',   // Red-500
      routeSelected: '#3B82F6',  // Blue-500
    };
    
    const MAP_OPACITY = {
      routeNormal: 0.3,
      routeDelayed: 0.7,
      routeHover: 0.9,
    };
    
    const MAP_WEIGHTS = {
      routeNormal: 2,
      routeDelayed: 3,
      routeHover: 5,
    };
    
    // Check if route has any delays
    const hasDelays = (lineNumber: string) => {
      return delays.some(delay => delay.line === lineNumber);
    };

    // Render transit route polylines
    transitRoutes.forEach(route => {
      const routeHasDelays = hasDelays(route.line);
      
      // Apply unified color scheme (gray for normal, red for delayed)
      const routeColor = routeHasDelays ? MAP_COLORS.routeDelayed : MAP_COLORS.routeNormal;
      const routeOpacity = routeHasDelays ? MAP_OPACITY.routeDelayed : MAP_OPACITY.routeNormal;
      const routeWeight = routeHasDelays ? MAP_WEIGHTS.routeDelayed : MAP_WEIGHTS.routeNormal;
      
      const polyline = L.polyline(route.path, {
        color: routeColor,
        weight: routeWeight,
        opacity: routeOpacity,
        smoothFactor: 1,
      }).addTo(map);

      // Add popup on click
      const statusBadge = routeHasDelays 
        ? '<span style="background: #FEE2E2; color: #991B1B; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600;">HAS DELAYS</span>'
        : '<span style="background: #D1FAE5; color: #065F46; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600;">NORMAL</span>';
      
      polyline.bindPopup(`
        <div style="font-size: 14px;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
            <span style="font-size: 18px;">${getTransportIcon(route.type)}</span>
            <strong style="text-transform: capitalize;">${route.type} Line ${route.line}</strong>
          </div>
          ${statusBadge}
          <div style="height: 3px; background-color: ${routeColor}; border-radius: 2px; margin: 8px 0;"></div>
          <div style="font-size: 12px; color: #666;">${routeHasDelays ? 'Experiencing delays' : 'Operating normally'}</div>
        </div>
      `);

      // Smooth hover transitions (Map UI Specification)
      polyline.on('mouseover', function(this: L.Polyline) {
        this.setStyle({ 
          weight: MAP_WEIGHTS.routeHover, 
          opacity: MAP_OPACITY.routeHover 
        });
      });
      polyline.on('mouseout', function(this: L.Polyline) {
        this.setStyle({ 
          weight: routeWeight, 
          opacity: routeOpacity 
        });
      });
    });
  }

  // Function to render stop markers on map
  function renderStopMarkers(
    transitRoutes: Array<{id: string, line: string, type: string, stops?: any[]}>,
    map: L.Map
  ) {
    // Map UI Specification - subtle stop markers
    const STOP_COLORS = {
      normal: '#9CA3AF',      // Gray-400
      hover: '#374151',       // Gray-700
      border: '#FFFFFF',
    };
    
    // Collect all unique stops (avoid duplicates at major intersections)
    const stopsMap = new Map();
    
    transitRoutes.forEach(route => {
      if (!route.stops) return;
      
      route.stops.forEach((stop: any) => {
        if (!stopsMap.has(stop.stopId)) {
          stopsMap.set(stop.stopId, {
            ...stop,
            routes: [route.line]
          });
        } else {
          // Add this route to the stop's route list
          const existingStop = stopsMap.get(stop.stopId);
          if (!existingStop.routes.includes(route.line)) {
            existingStop.routes.push(route.line);
          }
        }
      });
    });
    
    // Render each unique stop
    stopsMap.forEach((stop) => {
      // Create circle marker
      const circle = L.circleMarker([stop.lat, stop.lng], {
        radius: 5,
        fillColor: STOP_COLORS.normal,
        color: STOP_COLORS.border,
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8,
      }).addTo(map);
      
      // Popup with stop info
      const routeList = stop.routes.sort((a: string, b: string) => {
        // Sort numerically
        const aNum = parseInt(a);
        const bNum = parseInt(b);
        if (!isNaN(aNum) && !isNaN(bNum)) return aNum - bNum;
        return a.localeCompare(b);
      }).join(', ');
      
      circle.bindPopup(`
        <div style="font-size: 13px; min-width: 160px;">
          <div style="font-weight: 600; margin-bottom: 6px; color: #111827;">
            ${stop.name}
          </div>
          <div style="font-size: 11px; color: #6B7280; margin-bottom: 4px;">
            🚋 Lines: ${routeList}
          </div>
          <div style="font-size: 10px; color: #9CA3AF;">
            ${stop.routes.length} route${stop.routes.length > 1 ? 's' : ''}
          </div>
        </div>
      `);
      
      // Tooltip on hover (show stop name without clicking)
      circle.bindTooltip(stop.name, {
        permanent: false,
        direction: 'top',
        offset: [0, -8],
        opacity: 0.9,
        className: 'stop-tooltip'
      });
      
      // Hover effects
      circle.on('mouseover', function(this: L.CircleMarker) {
        this.setStyle({
          fillColor: STOP_COLORS.hover,
          radius: 7,
          fillOpacity: 1
        });
      });
      
      circle.on('mouseout', function(this: L.CircleMarker) {
        this.setStyle({
          fillColor: STOP_COLORS.normal,
          radius: 5,
          fillOpacity: 0.8
        });
      });
    });
  }

  // Handle dynamic incident updates (when new reports are added)
  useEffect(() => {
    if (!mapInstanceRef.current || incidents.length === 0) return;
    
    const map = mapInstanceRef.current;
    
    // Clear existing incident markers
    incidentMarkersRef.current.forEach(marker => marker.remove());
    incidentMarkersRef.current = [];
    
    // Add incident markers from reports
    incidents.forEach((incident) => {
      const markerConfig = {
        minor: { color: '#F59E0B', iconSize: 32, fontSize: 16 },
        moderate: { color: '#EF4444', iconSize: 36, fontSize: 18 },
        severe: { color: '#DC2626', iconSize: 40, fontSize: 20 },
      }[incident.severity];
      
      const color = markerConfig.color;
      
      // Check if this is the user's own report
      const isOwnReport = incident.reportedBy === currentUserId;
      const borderColor = isOwnReport ? '#2563EB' : 'white'; // Blue for own reports
      const borderWidth = isOwnReport ? '3px' : '2px'; // Thicker border for own reports
      
      const pulseAnimation = `
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.05); }
        }
        animation: pulse 2s ease-in-out infinite;
      `;
      
      const icon = L.divIcon({
        className: '', // Remove default Leaflet marker styles
        html: `
          <div style="
            background-color: ${color};
            width: ${markerConfig.iconSize}px;
            height: ${markerConfig.iconSize}px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
            border: ${borderWidth} solid ${borderColor};
            font-size: ${markerConfig.fontSize}px;
            color: white;
            font-weight: bold;
            ${pulseAnimation}
          ">${getTransportIcon(incident.type)}</div>
        `,
        iconSize: [markerConfig.iconSize, markerConfig.iconSize],
        iconAnchor: [markerConfig.iconSize / 2, markerConfig.iconSize / 2],
      });
      
      const timeAgo = incident.reportedAt 
        ? new Date(incident.reportedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        : '';
      
      const marker = L.marker([incident.lat, incident.lng], { icon })
        .addTo(map)
        .bindPopup(`
          <div style="font-size: 13px; min-width: 220px; max-width: 280px;">
            <!-- Header -->
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px; padding-bottom: 8px; border-bottom: 1px solid #E5E7EB;">
              <span style="font-size: 18px;">${getTransportIcon(incident.type)}</span>
              <div style="flex: 1;">
                <div style="font-weight: bold; font-size: 15px;">Line ${incident.line}</div>
                ${incident.vehicleNumber ? `<div style="font-size: 11px; color: #6B7280;">#${incident.vehicleNumber}</div>` : ''}
              </div>
              <div style="display: flex; align-items: center; gap: 4px;">
                <span style="color: ${color}; font-size: 10px;">●</span>
                <span style="color: ${color}; font-weight: bold; text-transform: uppercase; font-size: 10px;">${incident.severity}</span>
              </div>
            </div>
            
            <!-- Description -->
            <div style="margin-bottom: 8px; color: #374151; line-height: 1.4;">${incident.description}</div>
            
            <!-- Footer -->
            <div style="display: flex; justify-content: space-between; align-items: center; font-size: 11px; color: #6B7280; padding-top: 6px; border-top: 1px solid #F3F4F6;">
              ${incident.reportedBy ? `<div>👤 ${incident.reportedBy}</div>` : '<div></div>'}
              <div style="display: flex; gap: 8px; align-items: center;">
                ${incident.upvotes ? `<span>👍 ${incident.upvotes}</span>` : ''}
                ${timeAgo ? `<span>🕒 ${timeAgo}</span>` : ''}
              </div>
            </div>
          </div>
        `);
      
      incidentMarkersRef.current.push(marker);
    });
  }, [incidents]);

  return (
    <div 
      ref={mapRef} 
      className={`w-full h-full ${className}`}
      style={{ minHeight: '100vh' }}
    />
  );
}
