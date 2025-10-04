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
