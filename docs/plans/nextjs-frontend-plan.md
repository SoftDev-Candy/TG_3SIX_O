# Next.js Frontend Plan - TG-3SIX-O (Travel Guardian 360)
## Public Transport Delay Reporting System

## Overview
A modern Next.js frontend that enables users to report public transportation delays, view real-time disruption information, and earn points for contributing to the community.

## 🚨 CRITICAL: Mobile-First Design Priority
**This application MUST be designed mobile-first.** The primary use case is on-the-go travelers using mobile devices. All UI components, layouts, and features should prioritize:
- Mobile usability and touch interactions
- Performance on mobile networks and devices
- One-handed operation where possible
- Quick access to key features (report delays, view map)
- Optimized for smaller screens first, then scale up to desktop
- Mobile-optimized forms and input methods
- Location services and camera integration

Desktop views are secondary enhancements.

## Architecture
```
User → Next.js Frontend → Fastify API → C++ Routing Engine
```

---

## Tech Stack

### Core Framework
- **Next.js 15+** (App Router)
- **React 18+**
- **TypeScript**

### UI/UX
- **TailwindCSS** - Styling
- **shadcn/ui** - Component library
- **Lucide React** - Icons
- **Framer Motion** - Animations

### Maps & Geolocation
- **Leaflet** or **Mapbox GL JS** - Interactive maps
- **React Leaflet** - React integration
- Browser Geolocation API

### State Management
- **Zustand** or **React Context** - Global state
- **TanStack Query (React Query)** - Server state & caching

### Real-time Updates
- **Server-Sent Events (SSE)** - Live delay updates
- **WebSocket** (optional fallback)

### Forms & Validation
- **React Hook Form** - Form management
- **Zod** - Schema validation

---

## Key Features

### 1. User Authentication & Profiles
- [ ] Sign up / Login (email, social auth)
- [ ] User profile with points balance
- [ ] Contribution history

### 2. Delay Reporting
- [ ] Quick report form (location, line, severity, description)
- [ ] Photo/video upload
- [ ] Auto-detect user location
- [ ] Suggest nearby transit stops
- [ ] Category tags (mechanical, signal, weather, etc.)
- [ ] Estimated delay duration input

### 3. Points & Gamification
- [ ] Points awarded for:
  - Submitting verified reports
  - First reporter bonus
  - Report accuracy (verified by other users)
  - Helpful upvotes
  - basic algorithm: 1st user gets 1 point and 1 additional point for each upvote, 2nd user gets 1 point 
- [ ] Point redemption system (future)
  - Points can be used to purchase discounts or other rewards with partners (coupon codes)

### 4. Report Verification System
- [ ] User upvote/downvote mechanism
- [ ] Verification by multiple users
- [ ] Automated verification via dispatcher API data
- [ ] Report status: Pending → Verified → Resolved
- [ ] Flag inappropriate/spam reports

### 5. Real-time Delay Dashboard
- [ ] Live map showing active disruptions
- [ ] Color-coded severity indicators
- [ ] Filter by transport type (bus, train, metro)
- [ ] Filter by severity (minor, moderate, severe)
- [ ] Timeline view of reported delays
- [ ] Route impact analysis

### 6. Route Planning Integration
- [ ] Search origin → destination
- [ ] Display routes avoiding active delays
- [ ] Show baseline vs adjusted travel time
- [ ] Alternative route suggestions
- [ ] Save frequent routes

### 7. Notifications
- [ ] Push notifications for delays on saved routes
- [ ] Email digests
- [ ] In-app notification center
- [ ] Alert preferences (severity threshold)

### 8. Historical Data & Predictions
- [ ] View past delay patterns
- [ ] Predicted delays based on ML/historical data
- [ ] "Reliability score" for routes/lines

---

## Page Structure

```
/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── signup/
│   ├── (dashboard)/
│   │   ├── page.tsx              # Home dashboard
│   │   ├── report/
│   │   │   └── page.tsx          # Report delay form
│   │   ├── map/
│   │   │   └── page.tsx          # Interactive delay map
│   │   ├── routes/
│   │   │   └── page.tsx          # Route planner
│   │   ├── profile/
│   │   │   └── page.tsx          # User profile & points
│   │   ├── leaderboard/
│   │   │   └── page.tsx          # Community leaderboard
│   │   └── history/
│   │       └── page.tsx          # Personal contributions
│   └── api/                      # API routes (proxy to Fastify)
│       ├── auth/
│       ├── reports/
│       └── sse/                  # SSE endpoint
├── components/
│   ├── ui/                       # shadcn/ui components
│   ├── map/
│   ├── forms/
│   ├── cards/
│   └── layouts/
├── lib/
│   ├── api-client.ts             # API wrapper
│   ├── sse-client.ts             # SSE connection handler
│   └── utils.ts
└── types/
    └── index.ts
```

---

## Data Models (Frontend Types)

### User
```typescript
interface User {
  id: string;
  email: string;
  username: string;
  points: number;
  level: number;
  badges: Badge[];
  createdAt: string;
}
```

### DelayReport
```typescript
interface DelayReport {
  id: string;
  userId: string;
  location: {
    lat: number;
    lng: number;
    stopId?: string;
    stopName?: string;
  };
  transportType: 'bus' | 'train' | 'metro' | 'tram';
  line: string;
  severity: 'minor' | 'moderate' | 'severe';
  category: string;
  description: string;
  estimatedDelay: number; // minutes
  photos?: string[];
  status: 'pending' | 'verified' | 'resolved' | 'rejected';
  upvotes: number;
  downvotes: number;
  reportedAt: string;
  resolvedAt?: string;
}
```

### Route
```typescript
interface Route {
  id: string;
  origin: Location;
  destination: Location;
  segments: RouteSegment[];
  baselineDuration: number;
  adjustedDuration: number;
  affectedByIncidents: string[]; // incident IDs
}
```

---

## API Integration (Fastify Endpoints)

### Authentication
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/logout`

### Reports
- `POST /api/reports` - Submit new report
- `GET /api/reports` - List reports (with filters)
- `GET /api/reports/:id` - Get single report
- `PATCH /api/reports/:id/vote` - Upvote/downvote
- `DELETE /api/reports/:id` - Delete own report

### Users
- `GET /api/users/:id` - User profile
- `GET /api/users/leaderboard` - Top contributors
- `PATCH /api/users/me` - Update profile

### Routes
- `POST /api/routes/calculate` - Calculate optimal route
- `GET /api/routes/saved` - User's saved routes
- `POST /api/routes/saved` - Save a route

### Real-time
- `GET /api/sse/delays` - SSE stream for live updates

### Points
- `GET /api/points/history` - Points transaction history
- `GET /api/points/challenges` - Active challenges

---

## Development Phases

### Phase 1: Foundation (Week 1-2)
- [ ] Initialize Next.js project with TypeScript
- [ ] Set up TailwindCSS + shadcn/ui
- [ ] Create base layout and navigation
- [ ] Implement authentication pages
- [ ] Set up API client wrapper

### Phase 2: Core Reporting (Week 3-4)
- [ ] Build delay report form
- [ ] Implement map component with location selection
- [ ] Photo upload functionality
- [ ] Connect to Fastify API
- [ ] Display submitted reports on dashboard

### Phase 3: Real-time Features (Week 5)
- [ ] SSE integration for live updates
- [ ] Interactive map with live incidents
- [ ] Real-time notification system
- [ ] Auto-refresh mechanisms

### Phase 4: Gamification (Week 6-7)
- [ ] Points system UI
- [ ] User profile with badges
- [ ] Leaderboard
- [ ] Report verification voting
- [ ] Achievement notifications

### Phase 5: Route Planning (Week 8)
- [ ] Route search interface
- [ ] Display routes with delay impact
- [ ] Alternative route suggestions
- [ ] Save/favorite routes

### Phase 6: Polish & Optimization (Week 9-10)
- [ ] Performance optimization
- [ ] Mobile responsiveness
- [ ] Progressive Web App (PWA) setup
- [ ] Error handling improvements
- [ ] Loading states & skeletons
- [ ] E2E testing

---

## Performance Considerations

1. **Code Splitting**: Use Next.js dynamic imports for map components
2. **Image Optimization**: Next.js Image component for user uploads
3. **Caching**: React Query for aggressive caching of route data
4. **SSR/ISR**: Use Static Site Generation where possible
5. **Bundle Size**: Tree-shake unused UI components

---

## Security

- [ ] CSRF protection
- [ ] Rate limiting (client-side throttling)
- [ ] Input sanitization
- [ ] Secure file uploads
- [ ] Content Security Policy headers

---

## Accessibility

- [ ] ARIA labels
- [ ] Keyboard navigation
- [ ] Screen reader support
- [ ] High contrast mode
- [ ] Focus indicators

---

## Testing Strategy

- **Unit Tests**: Jest + React Testing Library
- **Integration Tests**: API mocking with MSW
- **E2E Tests**: Playwright
- **Visual Regression**: Chromatic (optional)

---

## Deployment

- **Platform**: Vercel (recommended for Next.js)
- **Environment Variables**:
  - `NEXT_PUBLIC_API_URL` - Fastify API base URL
  - `NEXT_PUBLIC_MAP_TOKEN` - Mapbox access token
  - `NEXT_PUBLIC_SSE_URL` - SSE endpoint

---

## Future Enhancements

- Push notifications (PWA)
- Offline support
- Multi-language support (i18n)
- Dark mode
- AI-powered delay predictions
- Social sharing of reports
- Integration with official transit APIs
