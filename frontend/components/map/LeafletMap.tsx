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

    // Add transit route polylines
    // TODO: Load from /data/krakow.json in production
    const transitRoutes = [
      {
        id: 'tram-52',
        line: '52',
        type: 'tram',
        color: '#E63946',
        path: [
          [50.0955, 19.9087], [50.0850, 19.9150], [50.0750, 19.9350],
          [50.0686, 19.9469], [50.0675, 19.9452], [50.0693, 19.9534],
          [50.068, 19.975], [50.067472, 19.991694], [50.062, 20.015], [50.0580, 20.0350]
        ]
      },
      {
        id: 'tram-4',
        line: '4',
        type: 'tram',
        color: '#457B9D',
        path: [
          [50.0890, 19.8950], [50.0750, 19.9200], [50.0686, 19.9469],
          [50.0650, 19.9413], [50.0619, 19.9368], [50.0700, 19.9600],
          [50.0850, 20.0000], [50.0950, 20.0500]
        ]
      },
      {
        id: 'tram-8',
        line: '8',
        type: 'tram',
        color: '#F1A208',
        path: [
          [50.0590, 19.9150], [50.0560, 19.9250], [50.0544, 19.9356],
          [50.0619, 19.9368], [50.0675, 19.9452], [50.0500, 19.9600],
          [50.0300, 19.9750], [50.0050, 19.9900]
        ]
      },
      {
        id: 'tram-10',
        line: '10',
        type: 'tram',
        color: '#2A9D8F',
        path: [
          [50.0150, 19.9350], [50.0544, 19.9356], [50.0620, 19.9400],
          [50.0675, 19.9452], [50.0693, 19.9534], [50.0750, 19.9800],
          [50.0800, 20.0200], [50.0850, 20.0600]
        ]
      },
      {
        id: 'bus-52',
        line: '52',
        type: 'bus',
        color: '#264653',
        path: [
          [50.0850, 19.9150], [50.0700, 19.9300], [50.0675, 19.9452],
          [50.0619, 19.9368], [50.0450, 19.9200], [50.0300, 19.9000], [50.0200, 19.8900]
        ]
      },
      {
        id: 'bus-173',
        line: '173',
        type: 'bus',
        color: '#6A4C93',
        path: [
          [50.0955, 19.9087], [50.0850, 19.9150], [50.0750, 19.9180], [50.0657, 19.9191]
        ]
      },
      {
        id: 'train-ska',
        line: 'SKA',
        type: 'train',
        color: '#E76F51',
        path: [
          [50.0675, 19.9452], [50.0686, 19.9469], [50.0650, 19.9700],
          [50.0500, 20.0000], [50.0200, 20.0300], [49.9830, 20.0640]
        ]
      }
    ];

    // Render transit route polylines
    transitRoutes.forEach(route => {
      const polyline = L.polyline(route.path, {
        color: route.color,
        weight: 3,
        opacity: 0.6,
        smoothFactor: 1,
      }).addTo(map);

      // Icon for popup
      const getTransportIcon = (type: string) => {
        switch(type) {
          case 'bus': return '🚌';
          case 'tram': return '🚋';
          case 'train': return '🚆';
          default: return '🚌';
        }
      };

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
      polyline.on('mouseover', function() {
        this.setStyle({ weight: 5, opacity: 0.9 });
      });
      polyline.on('mouseout', function() {
        this.setStyle({ weight: 3, opacity: 0.6 });
      });
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

  return (
    <div 
      ref={mapRef} 
      className={`w-full h-full ${className}`}
      style={{ minHeight: '100vh' }}
    />
  );
}
