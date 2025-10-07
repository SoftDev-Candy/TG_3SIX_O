// Mock location data for Kraków (Phase 1 MVP)
// Used for location autosuggest in delay reporting

export interface MockLocation {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  type: 'transit_hub' | 'landmark' | 'district' | 'university' | 'venue';
  lines: string[];
}

export const mockLocations: MockLocation[] = [
  // Major Transit Hubs
  { 
    id: 'dworzec-glowny',
    name: 'Dworzec Główny', 
    address: 'Dworzec Główny, Kraków', 
    lat: 50.0675,
    lng: 19.9452,
    type: 'transit_hub',
    lines: ['All trains', '2', '4', '5', '8', '10', '20', '50']
  },
  { 
    id: 'galeria-krakowska',
    name: 'Galeria Krakowska', 
    address: 'ul. Pawia 5, Kraków', 
    lat: 50.0686,
    lng: 19.9469,
    type: 'transit_hub',
    lines: ['4', '5', '10', '20', '52']
  },
  { 
    id: 'rondo-mogilskie',
    name: 'Rondo Mogilskie', 
    address: 'Rondo Mogilskie, Kraków', 
    lat: 50.0693,
    lng: 19.9534,
    type: 'transit_hub',
    lines: ['3', '9', '10', '24', '52']
  },
  
  // Popular Locations
  { 
    id: 'teatr-slowackiego',
    name: 'Teatr Słowackiego', 
    address: 'pl. św. Ducha 1, Kraków', 
    lat: 50.0650,
    lng: 19.9413,
    type: 'landmark',
    lines: ['2', '4', '14', '18', '20']
  },
  { 
    id: 'wawel',
    name: 'Wawel', 
    address: 'Wawel 5, Kraków', 
    lat: 50.0544,
    lng: 19.9356,
    type: 'landmark',
    lines: ['8', '10', '18']
  },
  { 
    id: 'main-square',
    name: 'Rynek Główny', 
    address: 'Rynek Główny, Kraków', 
    lat: 50.0619,
    lng: 19.9368,
    type: 'landmark',
    lines: ['1', '6', '8', '13', '18']
  },
  { 
    id: 'tauron-arena',
    name: 'Tauron Arena', 
    address: 'al. Pokoju 1, Kraków', 
    lat: 50.067472,
    lng: 19.991694,
    type: 'venue',
    lines: ['4', '10', '14', '18', '44', '52']
  },
  
  // Districts
  { 
    id: 'krowodrza',
    name: 'Krowodrza', 
    address: 'Krowodrza, Kraków', 
    lat: 50.0824,
    lng: 19.9126,
    type: 'district',
    lines: ['4', '5', '10', '44', '52', '164']
  },
  { 
    id: 'podgorze',
    name: 'Podgórze', 
    address: 'Podgórze, Kraków', 
    lat: 50.0341,
    lng: 19.9496,
    type: 'district',
    lines: ['6', '8', '10', '13', '23']
  },
  { 
    id: 'nowa-huta',
    name: 'Nowa Huta', 
    address: 'Nowa Huta, Kraków', 
    lat: 50.0691,
    lng: 20.0400,
    type: 'district',
    lines: ['4', '10', '15', '16', '22']
  },
  
  // University Area
  { 
    id: 'agh',
    name: 'AGH University', 
    address: 'al. Mickiewicza 30, Kraków', 
    lat: 50.0657,
    lng: 19.9191,
    type: 'university',
    lines: ['15', '18', '50', '173', '501']
  },
];

/**
 * Search locations by query string
 * Returns max 5 results, sorted by relevance
 */
export function searchLocations(query: string): MockLocation[] {
  if (!query || query.trim().length === 0) {
    return [];
  }

  const lowerQuery = query.toLowerCase().trim();
  
  // Score each location based on match quality
  const scored = mockLocations.map(location => {
    const nameLower = location.name.toLowerCase();
    const addressLower = location.address.toLowerCase();
    
    let score = 0;
    
    // Exact match (highest priority)
    if (nameLower === lowerQuery || addressLower === lowerQuery) {
      score = 1000;
    }
    // Starts with query (high priority)
    else if (nameLower.startsWith(lowerQuery) || addressLower.startsWith(lowerQuery)) {
      score = 500;
    }
    // Contains query (medium priority)
    else if (nameLower.includes(lowerQuery) || addressLower.includes(lowerQuery)) {
      score = 100;
    }
    
    return { location, score };
  });
  
  // Filter out non-matches and sort by score
  return scored
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(item => item.location);
}

/**
 * Get icon emoji for location type
 */
export function getLocationIcon(type: MockLocation['type']): string {
  const icons: Record<MockLocation['type'], string> = {
    transit_hub: '🚉',
    landmark: '🏛️',
    district: '🏘️',
    university: '🎓',
    venue: '🏟️',
  };
  return icons[type] || '📍';
}
