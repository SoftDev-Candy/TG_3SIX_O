# TG-3SIX-O Frontend (Travel Guardian 360)

Modern Next.js frontend for the TG-3SIX-O public transport delay reporting system.

## Tech Stack

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety
- **TailwindCSS** - Styling
- **shadcn/ui** - UI components
- **Leaflet** - Interactive maps
- **React Query** - Server state management
- **Zustand** - Client state management
- **React Hook Form + Zod** - Form validation

## Prerequisites

- Node.js 18+ 
- npm/yarn/pnpm
- Running Fastify API backend (port 3001)
- Running C++ routing engine

## Getting Started

1. **Install dependencies:**

```bash
npm install
```

2. **Configure environment variables:**

```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:
- `NEXT_PUBLIC_API_URL` - Fastify API URL (default: http://localhost:3001)
- `NEXT_PUBLIC_SSE_URL` - SSE endpoint for real-time updates
- `NEXT_PUBLIC_MAP_TOKEN` - Optional Mapbox token (leave empty for OpenStreetMap)

3. **Run development server:**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Project Structure

```
frontend/
├── app/                    # Next.js app directory
│   ├── (auth)/            # Authentication pages
│   ├── (dashboard)/       # Main app pages
│   └── api/               # API routes
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── map/              # Map components
│   ├── forms/            # Form components
│   └── layouts/          # Layout components
├── lib/                  # Utilities
│   ├── api-client.ts     # API wrapper
│   ├── sse-client.ts     # SSE connection handler
│   └── utils.ts          # Helper functions
└── types/                # TypeScript types
```

## Key Features

- 🚦 **Real-time delay reporting** - Users can report transit delays with location, photos, and details
- 🎯 **Points system** - Earn points for contributing verified reports
- 🗺️ **Interactive map** - View active delays on a live map
- 🔄 **Live updates** - SSE-powered real-time incident updates
- 🚌 **Route planning** - Find optimal routes avoiding delays
- 🏆 **Leaderboard** - Community rankings based on contributions

## Development

```bash
# Run dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint

# Type check
npx tsc --noEmit
```

## API Integration

This frontend connects to the Fastify API layer which communicates with the C++ routing engine:

```
User → Next.js Frontend → Fastify API → C++ Routing Engine
```

See `/docs/plans/nextjs-frontend-plan.md` for detailed architecture documentation.

## Contributing

See the main project README for contribution guidelines.
