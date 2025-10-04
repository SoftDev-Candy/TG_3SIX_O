# Fastify Routing Service - Quick Start Guide
**For Backend Implementation**

## 📁 Files to Create

### 1. Backend Project Structure
```
backend/
├── src/
│   ├── server.ts              ← Fastify app entry point
│   ├── routes/
│   │   └── routing.ts         ← Route handlers
│   ├── services/
│   │   ├── routing-service.ts ← Service interface
│   │   ├── mock-routing.ts    ← Mock implementation (hackathon)
│   │   └── cpp-routing.ts     ← C++ integration (future)
│   └── types/
│       └── index.ts           ← Shared types
├── data/
│   └── krakow.json            ← Symlink to /data/krakow.json
├── package.json
└── tsconfig.json
```

---

## 🚀 Quick Implementation

### Step 1: Initialize Backend
```bash
cd TG_3SIX_O
mkdir -p backend/src/{routes,services,types}
cd backend
npm init -y
npm install fastify @fastify/cors
npm install -D typescript @types/node tsx
ln -s ../data data  # Symlink to shared data
```

### Step 2: Create Service Interface
**`src/services/routing-service.ts`**
```typescript
import type { RouteSearchInput, Route } from '../types';

export interface RoutingProvider {
  calculateRoute(input: RouteSearchInput): Promise<Route>;
  getTransitNetwork(): Promise<any>;
}

// Mock implementation for hackathon
export class MockRoutingProvider implements RoutingProvider {
  private network: any;
  
  constructor() {
    this.network = require('../../data/krakow.json');
  }
  
  async calculateRoute(input: RouteSearchInput): Promise<Route> {
    // Simple mock: Find direct route or return dummy data
    return {
      routeId: `route-${Date.now()}`,
      origin: input.origin,
      destination: input.destination,
      segments: [
        {
          id: 'seg-1',
          mode: 'tram',
          line: '52',
          from: input.origin,
          to: input.destination,
          duration: 15,
          distance: 2000,
          path: [[input.origin.lng, input.origin.lat], [input.destination.lng, input.destination.lat]],
          impactedByIncidents: []
        }
      ],
      baselineDuration: 15,
      adjustedDuration: 15,
      totalDistance: 2000,
      affectedByIncidents: [],
      calculatedAt: new Date().toISOString()
    };
  }
  
  async getTransitNetwork(): Promise<any> {
    return this.network;
  }
}

// Export singleton
export const routingService = new MockRoutingProvider();
```

### Step 3: Create Route Handlers
**`src/routes/routing.ts`**
```typescript
import { FastifyPluginAsync } from 'fastify';
import { routingService } from '../services/routing-service';
import type { RouteSearchInput } from '../types';

export const routingRoutes: FastifyPluginAsync = async (fastify) => {
  
  // Calculate route
  fastify.post<{ Body: RouteSearchInput }>('/api/routes/calculate', async (request, reply) => {
    try {
      const route = await routingService.calculateRoute(request.body);
      return { success: true, data: route };
    } catch (error) {
      reply.status(500);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Route calculation failed' 
      };
    }
  });

  // Get transit network
  fastify.get('/api/routes/network', async (request, reply) => {
    try {
      const network = await routingService.getTransitNetwork();
      return { success: true, data: network };
    } catch (error) {
      reply.status(500);
      return { 
        success: false, 
        error: 'Failed to load transit network' 
      };
    }
  });
};
```

### Step 4: Create Fastify Server
**`src/server.ts`**
```typescript
import Fastify from 'fastify';
import cors from '@fastify/cors';
import { routingRoutes } from './routes/routing';

const fastify = Fastify({
  logger: true
});

// Enable CORS for frontend
fastify.register(cors, {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000'
});

// Register routes
fastify.register(routingRoutes);

// Health check
fastify.get('/health', async () => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

// Start server
const start = async () => {
  try {
    const port = parseInt(process.env.PORT || '3001');
    await fastify.listen({ port, host: '0.0.0.0' });
    console.log(`🚀 Fastify server running on port ${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
```

### Step 5: Add Scripts to package.json
```json
{
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js"
  }
}
```

### Step 6: Create Types
**`src/types/index.ts`**
```typescript
// Copy from frontend/types/index.ts
// Or import: import type { ... } from '../../frontend/types';

export interface RouteSearchInput {
  origin: { lat: number; lng: number; stopId?: string };
  destination: { lat: number; lng: number; stopId?: string };
  departureTime?: string;
  avoidIncidents?: boolean;
  transportTypes?: string[];
}

export interface Route {
  routeId: string;
  origin: any;
  destination: any;
  segments: RouteSegment[];
  baselineDuration: number;
  adjustedDuration: number;
  totalDistance: number;
  affectedByIncidents: string[];
  calculatedAt: string;
}

export interface RouteSegment {
  id: string;
  mode: string;
  line?: string;
  from: any;
  to: any;
  duration: number;
  distance: number;
  path: [number, number][];
  impactedByIncidents: string[];
}
```

---

## 🧪 Testing

### Start Backend
```bash
cd backend
npm run dev
```

### Test Endpoints
```bash
# Health check
curl http://localhost:3001/health

# Get transit network
curl http://localhost:3001/api/routes/network

# Calculate route
curl -X POST http://localhost:3001/api/routes/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "origin": {"lat": 50.067472, "lng": 19.991694, "stopId": "tauron-arena"},
    "destination": {"lat": 50.0619, "lng": 19.9368, "stopId": "main-square"}
  }'
```

---

## 🔄 Frontend Integration

**Frontend already configured!** `api-client.ts` has:
```typescript
async calculateRoute(input: RouteSearchInput) {
  return this.request<Route>('/api/routes/calculate', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}
```

Just start both servers:
```bash
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend  
cd frontend && npm run dev
```

---

## 🎯 Next Steps

1. ✅ Implement mock routing (done in this guide)
2. **Later:** Enhance mock to use krakow.json for realistic routes
3. **Later:** Add incident integration (fetch delays from DB)
4. **Post-hackathon:** Create `cpp-routing.ts` for C++ integration

---

## 🚀 C++ Integration (Future)

When ready, create `src/services/cpp-routing.ts`:

```typescript
import { spawn } from 'child_process';
import type { RoutingProvider, RouteSearchInput, Route } from '../types';

export class CppRoutingProvider implements RoutingProvider {
  private network: any;
  
  constructor() {
    this.network = require('../../data/krakow.json');
  }
  
  async calculateRoute(input: RouteSearchInput): Promise<Route> {
    return new Promise((resolve, reject) => {
      const cppProcess = spawn('./path/to/routing_engine', [
        '--origin', JSON.stringify(input.origin),
        '--destination', JSON.stringify(input.destination),
        '--network', './data/krakow.json'
      ]);
      
      let output = '';
      cppProcess.stdout.on('data', (data) => {
        output += data.toString();
      });
      
      cppProcess.on('close', (code) => {
        if (code === 0) {
          resolve(JSON.parse(output));
        } else {
          reject(new Error('C++ routing engine failed'));
        }
      });
    });
  }
  
  async getTransitNetwork(): Promise<any> {
    return this.network;
  }
}
```

Then swap in `routing-service.ts`:
```typescript
const provider = process.env.ROUTING_PROVIDER || 'mock';
export const routingService = provider === 'cpp' 
  ? new CppRoutingProvider() 
  : new MockRoutingProvider();
```

---

**Time to implement:** 30-45 minutes  
**Ready for demo:** Immediately with mock data  
**Production-ready:** After C++ integration
