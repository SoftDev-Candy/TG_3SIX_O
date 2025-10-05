/**
 * Generate Realistic Transit Route Paths
 * 
 * Hybrid approach:
 * - Trams & Buses: Use OSRM driving routing (follows streets)
 * - Trains: Use Overpass API (actual railway tracks)
 * 
 * Run once to update krakow.json with realistic paths
 */

import * as fs from 'fs';
import * as path from 'path';

interface Stop {
  stopId: string;
  name: string;
  lat: number;
  lng: number;
  order: number;
}

interface Route {
  id: string;
  lineNumber: string;
  transportType: 'tram' | 'bus' | 'train';
  name: string;
  color: string;
  stops: Stop[];
  path: {
    type: string;
    coordinates: [number, number][];
  };
}

interface KrakowData {
  type: string;
  metadata: any;
  routes: Route[];
}

// Load krakow.json
const krakowDataPath = path.join(__dirname, '../data/krakow.json');
const krakowData: KrakowData = JSON.parse(fs.readFileSync(krakowDataPath, 'utf-8'));

/**
 * Get realistic path using OSRM (for trams/buses on streets)
 */
async function getOSRMPath(stops: Stop[]): Promise<[number, number][]> {
  // Format coordinates as "lng,lat;lng,lat;..."
  const coords = stops.map(s => `${s.lng},${s.lat}`).join(';');
  
  const url = `http://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`;
  
  try {
    console.log(`    Fetching OSRM route...`);
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`OSRM API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
      throw new Error(`OSRM routing failed: ${data.code || 'No routes found'}`);
    }
    
    const coordinates = data.routes[0].geometry.coordinates;
    console.log(`    ✓ Got ${coordinates.length} coordinate points`);
    
    return coordinates;
  } catch (error) {
    console.error(`    ✗ OSRM failed:`, error.message);
    console.log(`    → Falling back to straight line between stops`);
    return stops.map(s => [s.lng, s.lat]);
  }
}

/**
 * Get train tracks using Overpass API (actual railway geometry from OSM)
 */
async function getTrainTracksFromOverpass(route: Route): Promise<[number, number][]> {
  // Try to find the train relation in OSM
  // For Kraków-Wieliczka line, we'll search for railway relations
  
  const query = `
    [out:json][timeout:25];
    (
      way["railway"="rail"]["name"~"Kraków|Wieliczka",i](49.9,19.8,50.2,20.2);
      relation["route"="train"]["name"~"Kraków|Wieliczka",i](49.9,19.8,50.2,20.2);
    );
    out geom;
  `;
  
  const url = `https://overpass-api.de/api/interpreter`;
  
  try {
    console.log(`    Fetching train tracks from Overpass API...`);
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `data=${encodeURIComponent(query)}`
    });
    
    if (!response.ok) {
      throw new Error(`Overpass API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.elements || data.elements.length === 0) {
      throw new Error('No railway tracks found');
    }
    
    // Extract coordinates from ways
    const coordinates: [number, number][] = [];
    
    for (const element of data.elements) {
      if (element.type === 'way' && element.geometry) {
        element.geometry.forEach((node: any) => {
          coordinates.push([node.lon, node.lat]);
        });
      }
    }
    
    if (coordinates.length > 0) {
      console.log(`    ✓ Got ${coordinates.length} track points from OSM`);
      return coordinates;
    }
    
    throw new Error('No coordinates extracted from OSM data');
    
  } catch (error) {
    console.error(`    ✗ Overpass failed:`, error.message);
    console.log(`    → Falling back to OSRM driving route`);
    return await getOSRMPath(route.stops);
  }
}

/**
 * Generate realistic path for a single route
 */
async function generateRealisticPath(route: Route): Promise<[number, number][]> {
  console.log(`\n📍 Processing ${route.transportType.toUpperCase()} Line ${route.lineNumber}`);
  console.log(`   ${route.name}`);
  console.log(`   Stops: ${route.stops.length}`);
  
  if (route.transportType === 'train') {
    // Use Overpass API for trains (actual tracks)
    return await getTrainTracksFromOverpass(route);
  } else {
    // Use OSRM for trams/buses (street routing)
    return await getOSRMPath(route.stops);
  }
}

/**
 * Main function - process all routes
 */
async function main() {
  console.log('🚀 Generating realistic transit route paths...\n');
  console.log(`Found ${krakowData.routes.length} routes to process\n`);
  console.log('═'.repeat(60));
  
  let successCount = 0;
  let fallbackCount = 0;
  
  for (const route of krakowData.routes) {
    try {
      const originalPoints = route.path.coordinates.length;
      
      // Generate realistic path
      const realisticPath = await generateRealisticPath(route);
      
      // Update the route's path
      route.path.coordinates = realisticPath;
      
      const improvement = realisticPath.length - originalPoints;
      console.log(`   📊 Path updated: ${originalPoints} → ${realisticPath.length} points (+${improvement})`);
      
      if (realisticPath.length > originalPoints + 10) {
        successCount++;
        console.log(`   ✅ Success: Realistic street-following path generated`);
      } else {
        fallbackCount++;
        console.log(`   ⚠️  Fallback: Using simplified path`);
      }
      
      // Be respectful to free APIs - rate limit
      await new Promise(resolve => setTimeout(resolve, 1500));
      
    } catch (error) {
      console.error(`   ❌ Error processing route:`, error.message);
      fallbackCount++;
    }
  }
  
  console.log('\n' + '═'.repeat(60));
  console.log('\n📊 Summary:');
  console.log(`   ✅ Realistic paths: ${successCount}`);
  console.log(`   ⚠️  Fallback paths: ${fallbackCount}`);
  console.log(`   📁 Total routes: ${krakowData.routes.length}`);
  
  // Save updated krakow.json
  console.log('\n💾 Saving updated krakow.json...');
  fs.writeFileSync(
    krakowDataPath,
    JSON.stringify(krakowData, null, 2),
    'utf-8'
  );
  
  console.log('✅ Done! krakow.json has been updated with realistic paths.\n');
  console.log('🗺️  Refresh your map to see routes following actual streets!\n');
}

// Run the script
main().catch(error => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});
