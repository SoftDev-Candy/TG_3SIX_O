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

interface LeafletMapProps {
  className?: string;
}

export default function LeafletMap({ className = '' }: LeafletMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Initialize map centered on Kraków (Tauron Arena area)
    const map = L.map(mapRef.current, {
      center: [50.067472, 19.991694], // Tauron Arena, Kraków
      zoom: 13,
      zoomControl: false, // We'll add custom controls
    });

    // Force light mode tiles during development
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
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
      { lat: 50.067472, lng: 19.991694, severity: 'moderate', type: 'tram', description: 'Tram 52 - 7min delay', line: '52' },
    ];

    // Add delay markers with light mode colors only
    sampleDelays.forEach(delay => {
      // Severity colors for light mode only (during development)
      const getSeverityColor = (severity: string) => {
        switch(severity) {
          case 'severe': return '#ef4444';
          case 'moderate': return '#f59e0b';
          case 'minor': return '#22c55e';
          default: return '#22c55e';
        }
      };
      
      const color = getSeverityColor(delay.severity);
      
      // Simplified transport type icons for public transit focus
      const getTransportIcon = (type: string) => {
        switch(type) {
          case 'bus': return '🚌';
          case 'tram': return '🚊';
          case 'train': return '🚆';
          case 'metro': return '🚇';
          default: return '🚌';
        }
      };

      const icon = L.divIcon({
        className: 'custom-delay-marker',
        html: `<div style="
          background-color: ${color};
          width: 24px;
          height: 24px;
          border-radius: 6px;
          border: 2px solid white;
          box-shadow: 0 2px 6px rgba(0,0,0,0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          color: white;
          font-weight: bold;
        ">${getTransportIcon(delay.type)}</div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      L.marker([delay.lat, delay.lng], { icon })
        .addTo(map)
        .bindPopup(`
          <div style="font-size: 14px; min-width: 200px;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
              <span style="font-size: 16px;">${getTransportIcon(delay.type)}</span>
              <strong>Line ${delay.line}</strong>
            </div>
            <div style="margin-bottom: 4px;">${delay.description}</div>
            <div style="display: flex; align-items: center; gap: 4px;">
              <span style="color: ${color}; font-size: 12px;">●</span>
              <span style="color: ${color}; font-weight: bold; text-transform: uppercase; font-size: 12px;">${delay.severity}</span>
            </div>
          </div>
        `);
    });

    // Load transit routes from krakow.json (with realistic paths!)
    fetch('/data/krakow.json')
      .then(res => res.json())
      .then(data => {
        const transitRoutes = data.routes.map((route: any) => ({
          id: route.id,
          line: route.lineNumber,
          type: route.transportType,
          color: route.color,
          path: route.path.coordinates.map((coord: [number, number]) => [coord[1], coord[0]] as [number, number]) // Swap lng,lat to lat,lng for Leaflet
        }));

        renderTransitRoutes(transitRoutes, map);
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
  function renderTransitRoutes(transitRoutes: Array<{id: string, line: string, type: string, color: string, path: [number, number][]}>, map: L.Map) {
    // Icon for popup
    const getTransportIcon = (type: string) => {
      switch(type) {
        case 'bus': return '🚌';
        case 'tram': return '🚋';
        case 'train': return '🚆';
        default: return '🚌';
      }
    };

    // Render transit route polylines
    transitRoutes.forEach(route => {
      const polyline = L.polyline(route.path, {
        color: route.color,
        weight: 3,
        opacity: 0.6,
        smoothFactor: 1,
      }).addTo(map);

      // Add popup on click
      polyline.bindPopup(`
        <div style="font-size: 14px;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
            <span style="font-size: 18px;">${getTransportIcon(route.type)}</span>
            <strong style="text-transform: capitalize;">${route.type} Line ${route.line}</strong>
          </div>
          <div style="height: 3px; background-color: ${route.color}; border-radius: 2px; margin: 8px 0;"></div>
          <div style="font-size: 12px; color: #666;">Click to view route details</div>
        </div>
      `);

      // Highlight on hover
      polyline.on('mouseover', function(this: L.Polyline) {
        this.setStyle({ weight: 5, opacity: 0.9 });
      });
      polyline.on('mouseout', function(this: L.Polyline) {
        this.setStyle({ weight: 3, opacity: 0.6 });
      });
    });
  }

  return (
    <div 
      ref={mapRef} 
      className={`w-full h-full ${className}`}
      style={{ minHeight: '100vh' }}
    />
  );
}
