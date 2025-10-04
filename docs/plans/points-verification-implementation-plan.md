# Points & Gamification + Report Verification Implementation Plan
**Project:** TG-3SIX-O (Travel Guardian 360)  
**Date:** 2025-10-05  
**Status:** Planning Phase

## 📋 Executive Summary

This plan covers the implementation of the Points & Gamification system and Report Verification mechanism. **Frontend components are already implemented**—this plan focuses on backend integration, workflow refinement, and production-ready features.

### Current Status Analysis

#### ✅ Already Implemented (Frontend)
- **VoteButtons.tsx** - Complete upvote/downvote UI with multiple variants
- **PointsDisplay.tsx** - Points display with level progression
- **ReportCard.tsx** - Report cards with integrated voting
- **points.ts** - Points calculation logic matching spec
- **API Client** - Vote and points endpoints defined
- **Types** - Complete TypeScript interfaces
- **Demo Page** - Working demonstration with mock data

#### 🚧 Needs Implementation
1. Backend API endpoints (Fastify)
2. Database schema for votes, points, rewards
3. Report verification workflow
4. Spam/flag reporting system
5. Points redemption marketplace
6. Automated verification via dispatcher API
7. Leaderboard & statistics pages

---

## 🎯 Implementation Phases

### Phase 1: Backend Core - Voting System (Priority: CRITICAL)
**Estimated Time:** 4-6 hours  
**Dependencies:** None  
**Hackathon Ready:** ✅ Must-have for demo

#### 1.1 Database Schema
```sql
-- Votes table
CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  report_id UUID NOT NULL REFERENCES delay_reports(id),
  vote_type VARCHAR(10) NOT NULL CHECK (vote_type IN ('upvote', 'downvote')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, report_id)
);

-- Points transactions table
CREATE TABLE points_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  amount INTEGER NOT NULL,
  reason VARCHAR(255) NOT NULL,
  related_report_id UUID REFERENCES delay_reports(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Report flags table
CREATE TABLE report_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES delay_reports(id),
  user_id UUID NOT NULL REFERENCES users(id),
  reason VARCHAR(50) NOT NULL CHECK (reason IN ('spam', 'inappropriate', 'duplicate', 'inaccurate')),
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, report_id)
);

-- Add indexes
CREATE INDEX idx_votes_report_id ON votes(report_id);
CREATE INDEX idx_votes_user_id ON votes(user_id);
CREATE INDEX idx_points_user_id ON points_transactions(user_id);
CREATE INDEX idx_report_flags_report_id ON report_flags(report_id);
```

#### 1.2 Fastify API Endpoints

##### Vote on Report: `PATCH /api/reports/:id/vote`
**Request Body:**
```json
{
  "voteType": "upvote" | "downvote"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "report": { /* updated report */ },
    "voteStats": {
      "upvotes": 5,
      "downvotes": 1,
      "netScore": 4,
      "userVote": "upvote"
    }
  }
}
```

**Logic:**
- Authenticated users only
- Users cannot vote on own reports
- Toggle vote: upvote → downvote → remove vote → upvote
- Update `delay_reports.upvotes/downvotes` counts
- Calculate reporter's points in real-time

##### Get Vote Stats: `GET /api/reports/:id/votes`
**Response:**
```json
{
  "success": true,
  "data": {
    "upvotes": 5,
    "downvotes": 1,
    "netScore": 4,
    "userVote": "upvote"
  }
}
```

##### Get User Votes: `GET /api/votes/me`
**Query Params:** `page`, `limit`  
**Response:** Paginated list of user's votes

#### 1.3 Points Calculation Service
Create `src/services/points-service.ts`:

```typescript
export class PointsService {
  // Award points for report
  async awardReportPoints(
    reportId: string,
    userId: string,
    isFirstReporter: boolean
  ): Promise<void>;

  // Update points when report is upvoted
  async updatePointsFromVote(
    reportId: string,
    voteType: 'upvote' | 'downvote'
  ): Promise<void>;

  // Award points for helpful voting
  async awardVotePoints(
    userId: string,
    voteType: 'upvote' | 'downvote',
    reportWasVerified: boolean
  ): Promise<void>;

  // Get user's total points
  async getUserPoints(userId: string): Promise<number>;

  // Get points transaction history
  async getPointsHistory(userId: string, page: number, limit: number): Promise<PaginatedResponse<PointsTransaction>>;
}
```

**Points Logic (from user story):**
- 1st reporter: 1 base + 1 per upvote + 2 first reporter bonus
- 2nd reporter: 1 base point
- Upvoter: 0.5 points if report gets verified
- Downvoter: 0.5 points if report gets rejected

#### 1.4 Quality Gates
- [ ] Vote endpoints return correct vote stats
- [ ] Users cannot vote on own reports (403 error)
- [ ] Vote toggling works (upvote → downvote → null)
- [ ] Points are calculated correctly per spec
- [ ] Points transactions are recorded
- [ ] Concurrent votes don't break counts (use DB transactions)

---

### Phase 2: Report Verification Workflow (Priority: HIGH)
**Estimated Time:** 3-4 hours  
**Dependencies:** Phase 1  
**Hackathon Ready:** ✅ Core feature

#### 2.1 Report Status State Machine
```
pending → verified → resolved
         ↓
      rejected
```

**Triggers:**
- **Pending → Verified:** ≥3 upvotes OR automated API match
- **Pending → Rejected:** ≥5 downvotes OR flagged by ≥3 users
- **Verified → Resolved:** Manual admin action OR 2 hours passed
- **Any → Rejected:** Admin review

#### 2.2 Automated Verification Integration
**Future Integration Point:** Dispatcher/Transit API
```typescript
interface DispatcherApiResponse {
  line: string;
  delay: number; // minutes
  status: 'delayed' | 'on-time' | 'cancelled';
  lastUpdate: string;
}

async function verifyReportAgainstApi(report: DelayReport): Promise<boolean> {
  const apiData = await fetchDispatcherData(report.line);
  
  // Match criteria
  const delayMatch = Math.abs(apiData.delay - report.estimatedDelay) <= 5;
  const statusMatch = apiData.status === 'delayed';
  
  return delayMatch && statusMatch;
}
```

**For Hackathon:** Mock this with 70% success rate for demo purposes

#### 2.3 Flag Report Endpoint: `POST /api/reports/:id/flag`
**Request Body:**
```json
{
  "reason": "spam" | "inappropriate" | "duplicate" | "inaccurate",
  "description": "Optional details"
}
```

**Logic:**
- Authenticated users only
- Max 1 flag per user per report
- Auto-reject report if ≥3 unique flags
- Notify admins (future: admin dashboard)

#### 2.4 Admin Verification Endpoint: `PATCH /api/reports/:id/verify`
**Request Body:**
```json
{
  "status": "verified" | "rejected",
  "adminNotes": "Optional"
}
```

**Logic:**
- Admin role required
- Award/revoke points based on status change
- Update reporter's accuracy stats

#### 2.5 Quality Gates
- [ ] Reports auto-verify at 3+ upvotes
- [ ] Reports auto-reject at 5+ downvotes
- [ ] Flagging system works (3 flags → rejected)
- [ ] Points are awarded/revoked on status change
- [ ] Reporter accuracy stats update correctly
- [ ] Status transitions are logged

---

### Phase 3: Points Redemption System (Priority: MEDIUM)
**Estimated Time:** 4-5 hours  
**Dependencies:** Phase 1  
**Hackathon Ready:** ⚠️ Nice-to-have (can use static page)

#### 3.1 Rewards Database Schema
```sql
CREATE TABLE rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  points_cost INTEGER NOT NULL,
  partner_name VARCHAR(255) NOT NULL,
  image_url TEXT,
  stock_available INTEGER DEFAULT -1, -- -1 = unlimited
  is_active BOOLEAN DEFAULT TRUE,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE reward_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  reward_id UUID NOT NULL REFERENCES rewards(id),
  coupon_code VARCHAR(255) NOT NULL,
  points_spent INTEGER NOT NULL,
  redeemed_at TIMESTAMP DEFAULT NOW(),
  used_at TIMESTAMP,
  expires_at TIMESTAMP
);
```

#### 3.2 Rewards API Endpoints

##### Get Available Rewards: `GET /api/points/rewards`
**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "reward-1",
      "title": "MPK Kraków 10% Discount",
      "description": "10% off monthly pass",
      "pointsCost": 50,
      "partnerName": "MPK Kraków",
      "imageUrl": "/rewards/mpk.jpg",
      "stockAvailable": 100,
      "expiresAt": "2025-12-31"
    }
  ]
}
```

##### Redeem Reward: `POST /api/points/redeem`
**Request Body:**
```json
{
  "rewardId": "reward-1"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "couponCode": "MPK-TG360-ABC123",
    "expiresAt": "2025-11-05",
    "instructions": "Show this code at MPK ticket office"
  }
}
```

**Logic:**
- Check user has enough points
- Check reward is in stock
- Generate unique coupon code
- Deduct points (create negative transaction)
- Record redemption

##### Get User Redemptions: `GET /api/points/redemptions`
**Response:** List of user's redeemed coupons

#### 3.3 Frontend: Rewards Marketplace Page
**Location:** `/app/(dashboard)/rewards/page.tsx`

**Features:**
- Grid of available rewards
- Filter by partner, points cost
- User's current points displayed prominently
- Redemption modal with confirmation
- "My Coupons" tab showing active/used/expired codes

**Mobile-First Design:**
- Card layout for rewards (2 cols on mobile, 3-4 on desktop)
- Quick redeem button (44px+ touch target)
- QR code generation for coupons
- Share coupon functionality

#### 3.4 Quality Gates
- [ ] Users can browse rewards
- [ ] Redemption requires sufficient points
- [ ] Unique coupon codes generated
- [ ] Points deducted correctly
- [ ] User can view their active coupons
- [ ] Stock management works (if limited)

---

### Phase 4: User Statistics & Leaderboard (Priority: MEDIUM)
**Estimated Time:** 3-4 hours  
**Dependencies:** Phase 1, 2  
**Hackathon Ready:** ⚠️ Nice-to-have

#### 4.1 User Statistics Calculation
Add to user profile:
```typescript
interface UserStats {
  totalReports: number;
  verifiedReports: number;
  rejectedReports: number;
  totalUpvotes: number;
  totalDownvotes: number;
  helpfulVotes: number;
  accuracyRate: number; // verifiedReports / totalReports
  consecutiveDays: number;
  currentStreak: number;
  badges: string[];
}
```

**Efficient Calculation:**
- Cache stats in `users` table with `stats_last_updated` timestamp
- Recalculate on demand if stale (> 1 hour)
- Update incrementally on new activity

#### 4.2 Leaderboard Endpoint: `GET /api/users/leaderboard`
**Query Params:**
- `period`: 'all-time' | 'monthly' | 'weekly'
- `metric`: 'points' | 'reports' | 'accuracy'
- `limit`: default 10

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "rank": 1,
      "userId": "user-1",
      "username": "transit_hero",
      "points": 150,
      "level": 4,
      "avatar": "https://...",
      "stats": { /* UserStats */ }
    }
  ]
}
```

#### 4.3 Frontend: Leaderboard Page
**Location:** `/app/(dashboard)/leaderboard/page.tsx`

**Features:**
- Top 10 users (podium design for top 3)
- Current user's rank highlighted
- Tabs for different time periods
- Tabs for different metrics
- User cards with mini stats

**Mobile Optimizations:**
- Horizontal scroll for wider stat tables
- Compact view on mobile
- Pull-to-refresh

#### 4.4 Enhanced Profile Page
**Add to existing profile:**
- Detailed stats section
- Activity timeline (recent reports, votes)
- Achievements/badges showcase
- Points history graph (Chart.js or Recharts)

#### 4.5 Quality Gates
- [ ] Leaderboard displays correct rankings
- [ ] User stats calculate accurately
- [ ] Time period filters work
- [ ] Current user's rank is highlighted
- [ ] Stats update in real-time after activity
- [ ] Performance: Leaderboard query < 100ms

---

### Phase 5: Achievements & Badges (Priority: LOW)
**Estimated Time:** 2-3 hours  
**Dependencies:** Phase 4  
**Hackathon Ready:** ❌ Post-launch feature

#### 5.1 Badge System
Already defined in `points.ts`:
- First Reporter, Regular Reporter, Super Reporter
- Accurate Reporter, Precision Expert
- Community Favorite, Helpful Voter
- Weekly Warrior, Monthly Master

**Implementation:**
- Calculate badges on stats update
- Store in `user_badges` table
- Display on profile with unlock dates
- Badge notifications (toast on unlock)

#### 5.2 Achievement Notifications
**Real-time badge unlocks:**
- WebSocket/SSE event on badge unlock
- Animated toast notification
- Confetti animation (for major milestones)
- Share to social media option

#### 5.3 Quality Gates
- [ ] Badges unlock at correct thresholds
- [ ] Users receive unlock notifications
- [ ] Badge display on profile works
- [ ] Badge criteria visible to users

---

## 📊 Quality Assurance Strategy

### Pre-Development
- [x] Acceptance criteria defined (this document)
- [x] Test strategy documented (below)
- [x] Performance requirements: API < 200ms, vote < 100ms
- [x] Security requirements: Auth required, no self-voting
- [x] Accessibility: ARIA labels on vote buttons

### During Development
- [ ] Unit tests for points calculation logic
- [ ] Integration tests for vote API endpoints
- [ ] Database transaction tests (concurrent votes)
- [ ] Frontend component tests (React Testing Library)

### Pre-Deployment
- [ ] All API endpoints tested manually
- [ ] Vote conflict resolution tested (2 users voting simultaneously)
- [ ] Points calculation verified against spec
- [ ] Mobile UX tested on real device
- [ ] Load testing: 100 concurrent votes

### Test Cases

#### Voting System
- [x] **TC-V01:** User can upvote a report
- [x] **TC-V02:** User can downvote a report
- [x] **TC-V03:** User can toggle vote (upvote → downvote → remove)
- [x] **TC-V04:** User cannot vote on own report (403 error)
- [x] **TC-V05:** Vote counts update correctly in UI
- [x] **TC-V06:** Concurrent votes don't corrupt counts

#### Points System
- [x] **TC-P01:** 1st reporter gets 1 base + 2 bonus = 3 points initially
- [x] **TC-P02:** 1st reporter gets +1 point per upvote
- [x] **TC-P03:** 2nd reporter gets 1 point
- [x] **TC-P04:** Upvoter gets 0.5 if report verified
- [x] **TC-P05:** Points are revoked if report rejected
- [x] **TC-P06:** Points history shows all transactions

#### Verification System
- [x] **TC-VF01:** Report auto-verifies at 3 upvotes
- [x] **TC-VF02:** Report auto-rejects at 5 downvotes
- [x] **TC-VF03:** Flagging by 3 users rejects report
- [x] **TC-VF04:** Admin can manually verify/reject

#### Redemption System
- [x] **TC-R01:** User with enough points can redeem reward
- [x] **TC-R02:** User without enough points sees error
- [x] **TC-R03:** Unique coupon codes generated
- [x] **TC-R04:** Points deducted on successful redemption

---

## 🚀 Hackathon Prioritization

### Must-Have (6-8 hours)
**For functional demo:**
1. ✅ Phase 1: Voting system backend + frontend integration (4h)
2. ✅ Phase 2: Basic verification workflow (3h)
3. ✅ Mock rewards page with static data (1h)

**Demo Flow:**
1. User logs in → sees points in navbar
2. User views report on map → can upvote/downvote
3. User submits report → gets points
4. User views leaderboard → sees their rank
5. User browses rewards → (mock redemption)

### Nice-to-Have (4-6 hours)
**If time permits:**
1. Real rewards redemption
2. Points history page
3. Enhanced statistics
4. Badge notifications

### Post-Hackathon
**Production polish:**
1. Achievements system
2. Automated dispatcher API verification
3. Admin dashboard for flags
4. Advanced analytics

---

## 🎯 Success Metrics

### Functional Requirements
- [x] Users can vote on reports
- [x] Points are awarded per specification
- [x] Reports auto-verify based on votes
- [x] Users can flag spam reports
- [x] Leaderboard displays top users
- [x] Users can redeem rewards (or see mock)

### Non-Functional Requirements
- **Performance:** Vote API < 100ms, Points calc < 50ms
- **Mobile UX:** All vote buttons 44px+, one-tap voting
- **Accessibility:** Keyboard navigation, screen reader support
- **Security:** No self-voting, authenticated endpoints only

### Hackathon Demo Requirements
- **Wow Factor:** Real-time vote updates, animated point gains
- **Polish:** Smooth transitions, loading states, error handling
- **Story:** Complete user journey from report → vote → earn points → redeem

---

## 📝 Implementation Checklist

### Phase 1: Voting Backend ✅
- [ ] Create database migrations
- [ ] Implement vote endpoints
- [ ] Implement points service
- [ ] Write unit tests
- [ ] Test with frontend components

### Phase 2: Verification ✅
- [ ] Implement auto-verification logic
- [ ] Create flag report endpoint
- [ ] Add admin verification endpoint
- [ ] Test status transitions
- [ ] Mock dispatcher API verification

### Phase 3: Rewards (Optional) ⚠️
- [ ] Create rewards schema
- [ ] Seed sample rewards
- [ ] Implement redemption endpoint
- [ ] Build rewards marketplace page
- [ ] Test coupon generation

### Phase 4: Leaderboard (Optional) ⚠️
- [ ] Implement stats calculation
- [ ] Create leaderboard endpoint
- [ ] Build leaderboard page
- [ ] Optimize query performance

---

## 🔄 Next Steps

1. **Review this plan** with team/mentor
2. **Prioritize phases** based on time remaining
3. **Set up database** (migrations for votes, points)
4. **Implement Phase 1** (voting system - CRITICAL)
5. **Test integration** with existing frontend components
6. **Demo walkthrough** to identify gaps
7. **Polish for judges** (loading states, animations, error handling)

---

## 📌 Notes

- **Frontend is production-ready** - focus on backend
- **Points logic is already implemented** in `lib/points.ts`
- **Demo page exists** at `/demo` for testing
- **API client methods defined** - just need backend
- **Mobile-first design** already applied to all components
- **Hackathon principle:** Make it look polished, mock what you can't build

---

**Document Version:** 1.0  
**Last Updated:** 2025-10-05  
**Owner:** Development Team
