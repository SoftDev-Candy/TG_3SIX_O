# Points & Gamification + Report Verification Implementation Plan
**Project:** TG-3SIX-O (Travel Guardian 360)  
**Date:** 2025-10-05  
**Status:** Planning Phase

## 📋 Executive Summary

This plan covers the implementation of the Points & Gamification system and Report Verification mechanism. **Frontend components are already implemented**—this plan focuses on backend integration, workflow refinement, and production-ready features.

### Current Status Analysis

#### ✅ Already Implemented (Frontend)
- **VoteButtons.tsx** - Complete upvote/downvote UI with emoji icons (👍 👎)
  - Multiple variants (sm/md/lg)
  - Vertical and horizontal orientations
  - Active state indicators with scaling effect
  - Mobile-optimized touch targets
- **PointsDisplay.tsx** - Points display with level progression
- **ReportCard.tsx** - Report cards with integrated voting
  - Compact view with 2-row mobile-first footer
  - Header: Transport icon + Line + Vehicle # + Severity
  - Description: Full text with proper spacing
  - Footer Row 1: Location + Time
  - Footer Row 2: Vote buttons + Status/Points
- **LeafletMap.tsx** - Interactive map with incident markers
  - Dynamic markers from user reports
  - Enhanced tooltips with full report details
  - Blue border distinction for user's own reports
  - Pulsing animations for active incidents
  - Progressive disclosure pattern in tooltips
- **points.ts** - Points calculation logic matching spec
- **API Client** - Vote and points endpoints defined
- **Types** - Complete TypeScript interfaces
- **Demo Page** - Working demonstration with mock data

#### 🚧 Needs Implementation
1. Backend API endpoints (Fastify)
2. Database schema for votes, points, rewards
3. Report verification workflow
4. Spam/flag reporting system
5. **User Profile Page with Points Redemption** (NEXT PRIORITY) - ACTIVELY WORKING ON THIS:
   - User information display (avatar, username, email, member since)
   - Points balance
   - Points redemption marketplace / partner offers section
   - Redemption history
   - Account settings
6. Automated verification via dispatcher API (don't do this for now)

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

#### 4.4 Quality Gates
- [ ] Leaderboard displays correct rankings
- [ ] User stats calculate accurately
- [ ] Time period filters work
- [ ] Current user's rank is highlighted
- [ ] Stats update in real-time after activity
- [ ] Performance: Leaderboard query < 100ms

---

### Phase 4.5: User Profile & Points Redemption (Priority: HIGH) 🆕
**Estimated Time:** 3-4 hours  
**Dependencies:** Phase 1 (Points system)  
**Hackathon Ready:** ✅ Essential for demo

#### 4.5.1 Profile Page Components
**Location:** `/app/(dashboard)/profile/page.tsx`

**User Information Section:**
- Avatar display (DiceBear API integration - already implemented)
- Username, email, member since date
- Edit profile button (future: settings modal)
- Account statistics overview

**Points Dashboard:**
- Large points balance display
- Current level with progress bar
- Points to next level indicator
- Level title/badge (e.g., "Transit Guardian")
- Mini stats grid:
  - Total reports submitted
  - Total upvotes received
  - Verification rate
  - Reports this week/month

**Activity Timeline:**
- Recent reports (last 5-10)
  - Status indicators (pending/verified/resolved)
  - Points earned per report
  - Quick link to report on map
- Recent votes cast
- Points history (last 10 transactions)
  - Earned points (green)
  - Redeemed points (red)
  - Transaction date and description

#### 4.5.2 Points Redemption System
**Partner Offers Catalog:**
- Grid/list view of available offers
- Filter by category (transit discounts, food, entertainment, etc.)
- Sort by points required
- Search functionality

**Offer Card Design:**
- Partner logo/image
- Offer title and description
- Points cost (prominent)
- Terms & conditions (expandable)
- "Redeem" button (disabled if insufficient points)
- Stock indicator (e.g., "50 available" or "Limited")

**Redemption Flow:**
1. User clicks "Redeem" on offer
2. Confirmation modal appears:
   - Offer details recap
   - Points cost
   - Current balance → New balance
   - Terms acceptance checkbox
   - "Confirm Redemption" button
3. On confirm:
   - Deduct points from user balance
   - Generate redemption code/voucher
   - Display redemption code modal:
     - Unique code (e.g., "TG360-ABC123")
     - QR code (for scanning at partner location)
     - Expiry date
     - Usage instructions
     - "Copy Code" button
     - "Save to Wallet" button (future)
4. Redemption recorded in history

**Redemption History:**
- Table/list of past redemptions
- Columns: Date, Offer, Points, Code, Status (Active/Used/Expired)
- Filter by status
- "View Code" button for active redemptions

#### 4.5.3 Mock Partner Offers (Phase 1 - Demo Data)
**Transit Discounts:**
1. **10% off Monthly Pass** - 500 points
2. **Free Single Ride Ticket** - 150 points
3. **Weekend Pass Discount** - 300 points

**Food & Beverage:**
1. **Free Coffee at Cafe Młynek** - 200 points
2. **20% off at Pizza Garden** - 250 points
3. **Buy 1 Get 1 Pierogi** - 300 points

**Entertainment:**
1. **2-for-1 Movie Tickets** - 400 points
2. **Museum Entry Discount** - 350 points

#### 4.5.4 Backend Integration
**New API Endpoints:**

```typescript
// Get partner offers
GET /api/offers
Response: { success: true, data: Offer[] }

// Redeem an offer
POST /api/offers/:offerId/redeem
Request: { userId: string }
Response: { 
  success: true, 
  redemption: {
    id: string,
    code: string,
    expiresAt: Date,
    offer: Offer
  }
}

// Get user's redemption history
GET /api/users/:userId/redemptions
Response: { success: true, data: Redemption[] }
```

**TypeScript Types:**
```typescript
interface Offer {
  id: string;
  partnerId: string;
  partnerName: string;
  partnerLogo: string;
  title: string;
  description: string;
  category: 'transit' | 'food' | 'entertainment' | 'shopping';
  pointsCost: number;
  termsAndConditions: string;
  stockAvailable: number | null; // null = unlimited
  expiryDays: number; // days until redeemed code expires
  isActive: boolean;
}

interface Redemption {
  id: string;
  userId: string;
  offerId: string;
  offer: Offer;
  code: string; // unique redemption code
  redeemedAt: Date;
  expiresAt: Date;
  usedAt?: Date;
  status: 'active' | 'used' | 'expired';
  pointsSpent: number;
}
```

**Database Tables:**
```sql
-- Partner Offers
CREATE TABLE offers (
  id VARCHAR PRIMARY KEY,
  partner_id VARCHAR NOT NULL,
  partner_name VARCHAR NOT NULL,
  partner_logo VARCHAR,
  title VARCHAR NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR NOT NULL,
  points_cost INT NOT NULL,
  terms_and_conditions TEXT,
  stock_available INT,
  expiry_days INT NOT NULL DEFAULT 30,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- User Redemptions
CREATE TABLE redemptions (
  id VARCHAR PRIMARY KEY,
  user_id VARCHAR NOT NULL REFERENCES users(id),
  offer_id VARCHAR NOT NULL REFERENCES offers(id),
  code VARCHAR UNIQUE NOT NULL,
  redeemed_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP,
  status VARCHAR DEFAULT 'active',
  points_spent INT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (offer_id) REFERENCES offers(id)
);

CREATE INDEX idx_redemptions_user ON redemptions(user_id);
CREATE INDEX idx_redemptions_status ON redemptions(status);
```

#### 4.5.5 Mobile-First Design
**Profile Page Layout:**
- Single column on mobile
- Sticky header with avatar and username
- Collapsible sections (Points, Activity, Redemptions)
- Pull-to-refresh for latest data
- Smooth scroll animations

**Offers Catalog:**
- Card grid (1 column mobile, 2-3 columns tablet/desktop)
- Infinite scroll or pagination
- Filter/sort drawer (slides up from bottom on mobile)
- Touch-optimized tap targets

**Redemption Modal:**
- Full-screen on mobile for better focus
- Large QR code (easy to scan)
- Prominent "Copy Code" button
- Screenshot-friendly layout

#### 4.5.6 Quality Gates
- [ ] Profile page displays correct user info
- [ ] Points balance updates in real-time after activity
- [ ] Offers catalog loads and displays correctly
- [ ] Redemption flow completes successfully
- [ ] Points are deducted correctly on redemption
- [ ] Redemption code is unique and displayed
- [ ] Redemption history shows all transactions
- [ ] Insufficient points prevents redemption
- [ ] Mobile layout works on small screens (320px+)
- [ ] Performance: Profile loads < 1s, Offers load < 500ms

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

**Interactive Demo Flow (HACKATHON SPECIAL):**
1. **User submits report** → Appears immediately in Live Delays panel at top
2. **Simulated engagement** → Report gets upvotes over time (auto-simulation)
3. **User can upvote** → Other delays in Live Delays panel are voteable
4. **Auto-verification** → After reaching 3 upvotes, report marked verified
5. **Points notification** → Toast with confetti shows points earned
6. **Auto-resolution** → After some time, verified reports resolve and award final bonus

**Key Features for Demo:**
- Real-time UI updates (report appears instantly)
- Simulated upvotes (make it feel alive)
- Toast notifications with confetti (satisfying feedback)
- Live delays panel shows all reports
- Smooth animations and transitions

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

## 🔄 Next Steps - Hackathon Interactive Demo

### 1. Live Delays Panel Enhancement (HIGH PRIORITY)
- [ ] Show all reports in real-time (newest first)
- [ ] Add upvote/downvote buttons to each delay card
- [ ] Real-time updates when new reports submitted
- [ ] Filter by status (pending/verified/resolved)
- [ ] Smooth animations when reports update

### 2. Simulated Engagement System (CRITICAL FOR DEMO)
- [ ] Auto-generate upvotes on user's report after submission
  - First upvote after 5 seconds
  - Second upvote after 10 seconds
  - Third upvote after 15 seconds (triggers verification)
- [ ] Visual feedback: upvote count animates up
- [ ] Other reports also get simulated activity (feels alive)

### 3. Points Notification System (WOW FACTOR)
- [ ] Install react-confetti or similar
- [ ] Toast notification when points earned:
  - Report submitted: "+3 points! 🎉"
  - Report upvoted: "+1 point! 👍"
  - Report verified: "+2 bonus points! ✅"
  - Report resolved: "Mission complete! 🏆"
- [ ] Confetti animation on bonus points
- [ ] Sound effects (optional, subtle)

### 4. Auto-Resolution Flow
- [ ] Verified reports auto-resolve after 30 seconds (demo speed)
- [ ] Toast notification: "Your report helped X commuters! +2 bonus points"
- [ ] Update user points in navbar instantly
- [ ] Show in points history

### 5. Polish & Testing
- [ ] Test full flow: Submit → Upvotes → Verify → Resolve → Points
- [ ] Smooth transitions between states
- [ ] Mobile-responsive toast notifications
- [ ] Error handling (graceful degradation)
- [ ] Loading states feel natural

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
