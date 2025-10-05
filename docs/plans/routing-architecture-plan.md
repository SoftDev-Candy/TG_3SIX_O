# Routing Architecture Plan
**Project:** TG-3SIX-O (Travel Guardian 360)  
**Date:** 2025-10-05  
**Status:** Planning Phase

## 🎯 Architecture Overview

```
┌─────────────┐
│   Frontend  │
│  (Next.js)  │
└──────┬──────┘
       │ HTTP/REST
       ▼
┌─────────────────────────┐
│    Fastify API Server   │
│  ┌───────────────────┐  │
│  │ Routing Service   │  │
│  │  ┌─────┐  ┌────┐ │  │
│  │  │Mock │  │C++ │ │  │ ← Swappable implementations
│  │  └─────┘  └────┘ │  │
│  └───────────────────┘  │
└─────────┬───────────────┘
          │
          ▼
    ┌──────────────┐
    │ krakow.json  │  ← Transit network data
    └──────────────┘
```

**Key Principle:** Fastify is the **single API gateway**. Frontend never talks directly to C++.

---

## 📁 File Structure

```
TG_3SIX_O/
├── data/
│   └── krakow.json              ← Shared transit network data
│
├── frontend/
│   ├── lib/
│   │   └── api-client.ts        ← Already has calculateRoute()
│   ├── components/
│   │   └── map/
│   │       └── LeafletMap.tsx   ← Add polyline rendering
│   └── public/
│       └── data/
│           └── krakow.json      ← Copy for client-side access
│
├── backend/ (to be created)
│   ├── src/
│   │   ├── routes/
│   │   │   └── routing.ts       ← Fastify route handlers
│   │   ├── services/
│   │   │   ├── routing-service.ts    ← Service abstraction
│   │   │   ├── mock-routing.ts       ← Mock implementation (hackathon)
│   │   ├── types/
│   │   │   └── index.ts         ← Shared types
│   │   └── server.ts            ← Fastify server entry
│   ├── data/
│   │   └── krakow.json          ← Symlink or copy
│   └── package.json
│
└── src/ (C++ routing engine)
    ├── dijkstra.cpp
    └── TransitDNA.cpp           ← Graph algorithms
```

---

## 🚀 API Endpoints

### 1. Calculate Route
**POST `/api/routes/calculate`**

**Request:**
```json
{
  "origin": {
    "lat": 50.067472,
    "lng": 19.991694,
    "stopId": "tauron-arena"
  },
  "destination": {
    "lat": 50.0619,
    "lng": 19.9368,
    "stopId": "main-square"
  },
  "departureTime": "2025-10-05T10:00:00Z",
  "avoidIncidents": true,
  "transportTypes": ["tram", "bus"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "routeId": "route-abc123",
    "origin": { "lat": 50.067472, "lng": 19.991694, "stopName": "Tauron Arena" },
    "destination": { "lat": 50.0619, "lng": 19.9368, "stopName": "Rynek Główny" },
    "segments": [
      {
        "id": "seg-1",
        "mode": "tram",
        "line": "52",
        "from": {
          "stopId": "tauron-arena",
          "stopName": "Tauron Arena",
          "lat": 50.067472,
          "lng": 19.991694
        },
        "to": {
          "stopId": "dworzec-glowny",
          "stopName": "Dworzec Główny",
          "lat": 50.0675,
          "lng": 19.9452
        },
        "duration": 8,
        "distance": 1200,
        "path": [
          [19.991694, 50.067472],
          [19.975, 50.068],
          [19.9452, 50.0675]
        ],
        "impactedByIncidents": ["incident-123"]
      },
      {
        "id": "seg-2",
        "mode": "walk",
        "from": { "stopName": "Dworzec Główny", "lat": 50.0675, "lng": 19.9452 },
        "to": { "stopName": "Rynek Główny", "lat": 50.0619, "lng": 19.9368 },
        "duration": 5,
        "distance": 400,
        "path": [[19.9452, 50.0675], [19.9368, 50.0619]]
      }
    ],
    "baselineDuration": 13,
    "adjustedDuration": 18,
    "totalDistance": 1600,
    "affectedByIncidents": ["incident-123"],
    "calculatedAt": "2025-10-05T01:27:00Z"
  }
}
```

### 2. Get Transit Network
**GET `/api/routes/network`**

**Response:**
```json
{
  "success": true,
  "data": {
    "type": "FeatureCollection",
    "metadata": {
      "city": "Kraków",
      "lastUpdated": "2025-10-05"
    },
    "features": [/* GeoJSON features */]
  }
}
```

### 3. Get Active Incidents (Integration)
**GET `/api/routes/incidents`**

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "incident-123",
      "affectedLines": ["52"],
      "affectedStops": ["tauron-arena", "rondo-mogilskie"],
      "severity": "moderate",
      "delayMinutes": 7
    }
  ]
}
```

---

## 📦 Data Structure: krakow.json

```json
{
  "type": "FeatureCollection",
  "metadata": {
    "city": "Kraków",
    "country": "Poland",
    "lastUpdated": "2025-10-05",
    "source": "TG-3SIX-O Hackathon Demo",
    "routeCount": 7
  },
  "routes": [
    {
      "id": "tram-52",
      "lineNumber": "52",
      "transportType": "tram",
      "name": "Os. Piastów - Czerwone Maki P+R",
      "color": "#E63946",
      "stops": [
        {
          "stopId": "tauron-arena",
          "name": "Tauron Arena",
          "lat": 50.067472,
          "lng": 19.991694,
          "order": 10
        },
        {
          "stopId": "rondo-mogilskie",
          "name": "Rondo Mogilskie",
          "lat": 50.0693,
          "lng": 19.9534,
          "order": 11
        }
      ],
      "path": {
        "type": "LineString",
        "coordinates": [
          [19.991694, 50.067472],
          [19.975, 50.068],
          [19.9534, 50.0693]
        ]
      }
    }
  ]
}
```

---

## 🗺️ Realistic Path Generation Strategy

### Hybrid Approach (RECOMMENDED)
**Time:** 1 hour | **Accuracy:** 85-95% | **Complexity:** Medium

#### Method by Transport Type

**1. Trams & Buses → OSRM Routing API**
- Use `http://router.project-osrm.org/route/v1/driving/...`
- ~75-80% accurate for trams (follows streets trams use)
- ~95% accurate for buses (same roads as cars)
- Fast, free, no setup required

**2. Trains → Overpass API**
- Use `https://overpass-api.de/api/interpreter`
- 100% accurate (actual railway tracks from OpenStreetMap)
- Queries OSM relations for train lines
- Returns exact track geometry

#### Why This Works
- Most Kraków trams run on streets alongside traffic ✅
- OSRM `driving` profile follows these streets ✅
- Trains need dedicated tracks (use Overpass) ✅
- Result: Demo-quality paths without self-hosting OSRM

#### Implementation Script
Create `/scripts/generate-realistic-paths.ts`:
- Detects transport type
- Routes trams/buses through OSRM
- Routes trains through Overpass API
- Updates krakow.json with realistic coordinates
- Run once, commit the updated file

---

## 🛠️ Implementation Phases

### Phase 0: Generate Realistic Paths (NEW - Do First!)
**Time:** 1 hour  
**Priority:** CRITICAL for demo

#### 0.1 Create Path Generation Script
- [x] Install dependencies (`tsx` for TypeScript execution)
- [x] Create `/scripts/generate-realistic-paths.ts`
- [x] Implement OSRM path fetching for trams/buses
- [x] Implement Overpass API for trains
- [x] Add error handling and fallbacks
- [x] Create `/scripts/README.md` with usage instructions

#### 0.2 Run Script & Update Data
- [ ] Execute: `npx tsx scripts/generate-realistic-paths.ts`
- [ ] Verify realistic paths in krakow.json (should see 100-300 points per route)
- [ ] Test on map (routes should follow streets now!)
- [ ] Commit updated krakow.json

**To run now:**
```bash
cd /home/bdh/Development/TG_3SIX_O
npx tsx scripts/generate-realistic-paths.ts
```

---

### Phase 1: Data & Mock Service
**Time:** 2-3 hours  
**Priority:** CRITICAL for demo

#### 1.1 Create krakow.json
- [x] Define 5-7 key routes (Tram 4, 8, 10, 52, Bus 52, 173, Train SKA)
- [x] Add major stops (Tauron Arena, Dworzec, Rynek, etc.)
- [ ] ~~Create realistic path coordinates~~ (Done by Phase 0 script!)
- [x] GeoJSON LineString format

#### 1.2 Scaffold Fastify Backend
- [ ] Initialize Fastify project in `/backend`
- [ ] Create routing service abstraction
- [ ] Implement mock routing provider
- [ ] Mock calculates simple A→B routes using krakow.json
- [ ] CORS setup for frontend communication

#### 1.3 Frontend: Polyline Rendering
- [ ] Add route polylines to LeafletMap component
- [ ] Color-code by transport type
- [ ] Animated route visualization
- [ ] Incident markers on affected segments

---

### Phase 2: Integration with Incidents (Later)
**Time:** 1-2 hours  
**Priority:** HIGH

- [ ] Fetch active delay reports from database
- [ ] Match incidents to transit routes
- [ ] Adjust route durations based on delays
- [ ] Highlight affected segments on map

---

### Phase 3: C++ Routing Engine (Post-Hackathon)
**Time:** 4-6 hours  
**Priority:** LOW (production feature)

#### 3.1 C++ Integration Options

**Option A: Child Process**
```typescript
import { spawn } from 'child_process';

async calculateRoute(input: RouteSearchInput): Promise<Route> {
  const cpp = spawn('./routing_engine', [
    '--origin', JSON.stringify(input.origin),
    '--destination', JSON.stringify(input.destination),
    '--network', './data/krakow.json',
    '--incidents', JSON.stringify(incidents)
  ]);
  
  // Parse stdout JSON
  return parseCppOutput(cpp.stdout);
}
```

**Option B: FFI (node-ffi-napi)**
```typescript
import ffi from 'ffi-napi';

const routingLib = ffi.Library('./routing_engine.so', {
  'calculate_route': ['string', ['string', 'string', 'string']]
});

async calculateRoute(input: RouteSearchInput): Promise<Route> {
  const result = routingLib.calculate_route(
    JSON.stringify(input.origin),
    JSON.stringify(input.destination),
    JSON.stringify(network)
  );
  return JSON.parse(result);
}
```

**Recommendation:** Start with **Option A** (child process) - simpler, safer.

---

## 🎨 Frontend: Map Polyline Rendering

### LeafletMap Component Updates

```typescript
// Add to LeafletMap.tsx
interface RoutePolyline {
  routeId: string;
  line: string;
  transportType: TransportType;
  path: [number, number][];
  color: string;
}

// Render polylines
routes.forEach(route => {
  const polyline = L.polyline(route.path, {
    color: route.color,
    weight: 4,
    opacity: 0.7,
  }).addTo(map);
  
  polyline.bindPopup(`
    <strong>${getTransportIcon(route.transportType)} Line ${route.line}</strong>
  `);
});
```

### Route Visualization Features
- [ ] Color-coded by transport type (tram=red, bus=blue, train=green)
- [ ] Dashed lines for affected routes
- [ ] Animated route highlighting on hover
- [ ] Click route to see details

---

## 🔒 Service Abstraction Pattern

```typescript
// services/routing-service.ts
export interface RoutingProvider {
  calculateRoute(input: RouteSearchInput): Promise<Route>;
  getTransitNetwork(): Promise<TransitNetwork>;
}

// Mock implementation (Phase 1)
class MockRoutingProvider implements RoutingProvider {
  private network: TransitNetwork;
  
  constructor() {
    this.network = require('../../data/krakow.json');
  }
  
  async calculateRoute(input: RouteSearchInput): Promise<Route> {
    // Simple pathfinding: Find direct route or single transfer
    const directRoute = this.findDirectRoute(input.origin, input.destination);
    if (directRoute) return directRoute;
    
    const transferRoute = this.findTransferRoute(input.origin, input.destination);
    return transferRoute;
  }
  
  async getTransitNetwork(): Promise<TransitNetwork> {
    return this.network;
  }
}

// C++ implementation (Phase 3)
class CppRoutingProvider implements RoutingProvider {
  async calculateRoute(input: RouteSearchInput): Promise<Route> {
    // Spawn C++ process with Dijkstra algorithm
    const incidents = await getActiveIncidents();
    return callCppEngine(input, this.network, incidents);
  }
  
  async getTransitNetwork(): Promise<TransitNetwork> {
    return require('../../data/krakow.json');
  }
}

// Factory pattern
export function createRoutingService(): RoutingProvider {
  const provider = process.env.ROUTING_PROVIDER || 'mock';
  
  switch (provider) {
    case 'cpp':
      return new CppRoutingProvider();
    case 'mock':
    default:
      return new MockRoutingProvider();
  }
}
```

---

## 🧪 Testing Strategy

### Mock Service Testing
```typescript
describe('MockRoutingProvider', () => {
  it('should find direct route between two stops', async () => {
    const route = await routingService.calculateRoute({
      origin: { lat: 50.067472, lng: 19.991694, stopId: 'tauron-arena' },
      destination: { lat: 50.0693, lng: 19.9534, stopId: 'rondo-mogilskie' }
    });
    
    expect(route.segments).toHaveLength(1);
    expect(route.segments[0].line).toBe('52');
    expect(route.segments[0].mode).toBe('tram');
  });
  
  it('should include delay adjustments from incidents', async () => {
    const route = await routingService.calculateRoute({
      origin: { stopId: 'tauron-arena' },
      destination: { stopId: 'rondo-mogilskie' },
      avoidIncidents: false
    });
    
    expect(route.adjustedDuration).toBeGreaterThan(route.baselineDuration);
  });
});
```

---

## 🎯 Hackathon Demo Flow

1. **User opens map** → See all transit routes as colored polylines
2. **User taps origin/destination** → Request route via API
3. **Fastify returns route** → Mock service calculates path
4. **Map highlights route** → Animated polyline with segments
5. **Route shows delays** → Red segments for affected areas
6. **User sees ETA** → "18 min (5 min delay on Tram 52)"

---

## 🚧 Implementation Priorities

### Must-Have (Hackathon)
1. ✅ Create `krakow.json` with 5-7 routes
2. ✅ Scaffold Fastify routing API
3. ✅ Mock routing service (simple pathfinding)
4. ✅ Polyline rendering on map
5. ✅ Incident integration (show delays on routes)

### Nice-to-Have
- Alternative routes (suggest 2-3 options)
- Walking directions between stops
- Real-time ETA updates
- Route saving/favorites

### Post-Hackathon
- C++ routing engine integration
- GTFS data import from MPK Kraków
- Route optimization algorithms
- Multi-modal routing (bike, car, etc.)

---

## 🔧 Configuration

### Environment Variables
```bash
# .env (backend)
PORT=3001
NODE_ENV=development
ROUTING_PROVIDER=mock  # 'mock' | 'cpp'
CPP_ROUTING_ENGINE_PATH=/path/to/routing_engine
TRANSIT_DATA_PATH=./data/krakow.json
```

### package.json Scripts
```json
{
  "scripts": {
    "dev:backend": "cd backend && npm run dev",
    "dev:frontend": "cd frontend && npm run dev",
    "build:data": "cp data/krakow.json backend/data/ && cp data/krakow.json frontend/public/data/",
    "dev": "concurrently \"npm run dev:backend\" \"npm run dev:frontend\""
  }
}
```

---

## 📊 Success Metrics

### Functional
- [ ] API returns valid routes in < 200ms
- [ ] Map renders 5-7 transit routes as polylines
- [ ] Routes update based on active incidents
- [ ] Frontend ↔ Fastify communication works

### Non-Functional
- [ ] Clean service abstraction (easy to swap mock→cpp)
- [ ] Type-safe API contracts
- [ ] Error handling for invalid routes
- [ ] Mobile-optimized route visualization

---

## 🎬 Next Steps

1. **Create krakow.json** with realistic Kraków transit data
2. **Scaffold Fastify backend** with routing service
3. **Update LeafletMap** to render polylines
4. **Test end-to-end** flow: Frontend → API → Map
5. **Integrate with incidents** (delay reports affect routes)

---

**Document Version:** 1.0  
**Last Updated:** 2025-10-05  
**Owner:** Development Team
