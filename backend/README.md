# Travel Guardian 360 - Backend API

Fastify-based backend API for the TG-3SIX-O (Travel Guardian 360) transit delay reporting platform.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env` and update values:
```bash
cp .env.example .env
```

### 3. Start Development Server
```bash
npm run dev
```

The API will be available at `http://localhost:3001`

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login with email/username
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

### Reports
- `POST /api/reports` - Create delay report
- `GET /api/reports` - List reports (with filters)
- `GET /api/reports/:id` - Get single report
- `PATCH /api/reports/:id/vote` - Vote on report (upvote/downvote)
- `GET /api/reports/:id/votes` - Get vote stats
- `POST /api/reports/:id/flag` - Flag report as spam/inappropriate
- `DELETE /api/reports/:id` - Delete own report

### Points & Rewards
- `GET /api/points/history` - Get points transaction history
- `GET /api/points/rewards` - List available rewards
- `POST /api/points/redeem` - Redeem reward with points
- `GET /api/points/redemptions` - Get user's redemptions

### Users
- `GET /api/users/:id` - Get user profile
- `PATCH /api/users/me` - Update own profile
- `GET /api/users/leaderboard` - Get top users by points
- `GET /api/votes/me` - Get current user's votes
- `GET /api/votes/user/:userId` - Get user's votes

### System
- `GET /health` - Health check
- `GET /` - API info

## 🎮 Points System Logic

### Report Submission
- **1st reporter**: 1 base point + 2 first reporter bonus = **3 points**
- **2nd+ reporter**: 1 base point

### Upvotes
- **1st reporter only**: +1 point per upvote

### Verification
- **Reporter**: +2 bonus points when report is verified
- **Helpful voters**: +0.5 points for correct vote (upvote on verified, downvote on rejected)

### Rejection
- **Reporter**: All points from that report are revoked
- Points cannot go below 0

## 🔄 Verification Workflow

### Auto-Verification Triggers
- **Verified**: ≥3 upvotes
- **Rejected**: ≥5 downvotes OR ≥3 flags

### Report Status Flow
```
pending → verified → resolved
         ↓
      rejected
```

## 💾 Data Storage

Currently using **in-memory storage** for hackathon demo.

For production, migrate to PostgreSQL/MongoDB:
- See `src/storage/data-store.ts` for data structure
- Database schema documented in `/docs/plans/points-verification-implementation-plan.md`

## 🧪 Testing Endpoints

### Register User
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@example.com",
    "username": "demouser",
    "password": "password123"
  }'
```

### Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@example.com",
    "password": "password123"
  }'
```

### Create Report (requires auth token)
```bash
curl -X POST http://localhost:3001/api/reports \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "transportType": "tram",
    "line": "52",
    "location": {
      "lat": 50.067472,
      "lng": 19.991694,
      "address": "Tauron Arena, Kraków"
    },
    "severity": "moderate",
    "issueCategory": "mechanical",
    "estimatedDelay": 15,
    "description": "Tram stopped due to mechanical issue"
  }'
```

### Vote on Report
```bash
curl -X PATCH http://localhost:3001/api/reports/REPORT_ID/vote \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "voteType": "upvote"
  }'
```

## 🏗️ Architecture

```
backend/
├── src/
│   ├── server.ts              # Main server entry point
│   ├── routes/                # API route handlers
│   │   ├── auth.ts           # Authentication endpoints
│   │   ├── reports.ts        # Report CRUD + voting
│   │   ├── points.ts         # Points & rewards
│   │   └── users.ts          # User profiles & leaderboard
│   ├── services/             # Business logic
│   │   ├── points-service.ts        # Points calculation
│   │   └── verification-service.ts  # Auto-verification
│   ├── storage/              # Data layer
│   │   └── data-store.ts    # In-memory store (replace with DB)
│   ├── utils/                # Utilities
│   │   └── auth.ts          # Auth helpers
│   └── types/                # TypeScript types
│       └── index.ts
├── package.json
├── tsconfig.json
└── .env
```

## 🔐 Security Notes

⚠️ **Hackathon Implementation** - Not production-ready:
- Using simple base64 tokens (replace with proper JWT)
- In-memory storage (data lost on restart)
- No rate limiting
- No input sanitization beyond basic validation

For production:
- Implement proper JWT with @fastify/jwt
- Add database with proper indexes
- Add rate limiting with @fastify/rate-limit
- Add input validation with @fastify/schema
- Add HTTPS/TLS
- Add API key authentication for sensitive endpoints

## 📝 Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server (requires build)

## 🌍 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3001` |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:3000` |
| `JWT_SECRET` | JWT secret key | `(required)` |
| `NODE_ENV` | Environment | `development` |
| `HOST` | Server host | `0.0.0.0` |

## 📞 Support

For hackathon support, check `/docs/plans/` for implementation details.

---

**Version**: 1.0.0  
**Last Updated**: 2025-10-05  
**Status**: Demo-ready for hackathon 🎉
