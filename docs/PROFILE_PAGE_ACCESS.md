# Profile Page Access in Mock Auth Mode

## ✅ Status: WORKING

The Profile page is **fully functional** in hackathon mock authentication mode.

## How It Works

### 1. Mock Authentication Setup
- **Environment Variable:** `NEXT_PUBLIC_MOCK_AUTH_ENABLED=true` (already set in `.env.local`)
- **Auto-fallback:** When backend is unavailable, creates mock user automatically on login

### 2. Accessing Profile Page

**Step 1: Login (even with mock credentials)**
- Navigate to `/login`
- Enter ANY email/password (e.g., `demo@test.com` / `password`)
- Backend unavailable → Mock user created automatically
- Console shows: `🎭 Mock login successful for demo`

**Step 2: Access Profile**
- Once logged in, navigate to `/profile`
- Or click "Profile" in the navigation bar
- Page loads with your mock user data

### 3. Mock User Data
When you log in with mock auth, you get:
```typescript
{
  id: 'demo-user-[timestamp]',
  email: '[your-email]',
  username: '[email-before-@]',
  points: 150,          // Starting points
  level: 3,             // Starting level
  createdAt: '[now]'
}
```

## Profile Page Features

### 4 Tabs Available:
1. **Overview** - Stats, account info, level progression
2. **Activity** - Recent reports, votes, points earned
3. **Achievements** - Badges and progress
4. **Rewards** - Active coupons, redemption marketplace

### Mock Data Included:
- ✅ Mock statistics (12 reports, 8 verified, 85% accuracy)
- ✅ Mock achievements (3 earned, 1 locked)
- ✅ Mock activity timeline
- ✅ Mock redemptions (if you've redeemed offers)

## How Profile Page Protects Routes

```typescript
// Profile page uses RequireAuth wrapper
<RequireAuth>
  {/* Page content */}
</RequireAuth>

// RequireAuth checks:
// 1. Is user loading? → Show loading spinner
// 2. Is user authenticated? → Show page
// 3. Not authenticated? → Redirect to /login
```

## Same Pattern Used By:
- ✅ `/profile` - Profile page
- ✅ `/rewards` - Rewards marketplace
- ✅ Any future auth-required pages

## Other Pages Use OptionalAuth:
- ✅ `/map` - Works for guests and authenticated users
- ✅ Dashboard layout - Available to all

## Testing Profile Page

### Quick Test Flow:
```bash
# 1. Start dev server
npm run dev

# 2. Open browser
http://localhost:3000

# 3. Navigate to login
http://localhost:3000/login

# 4. Enter any credentials
Email: demo@test.com
Password: anything

# 5. Check console for
🎭 Mock login successful for demo

# 6. Navigate to profile
http://localhost:3000/profile

# Result: Profile page loads with mock user data!
```

## Troubleshooting

### "Redirecting to login" issue?
**Solution:** Make sure you've logged in first. Mock auth still requires the login flow to create the mock user.

### No mock user created?
**Check:**
1. `.env.local` has `NEXT_PUBLIC_MOCK_AUTH_ENABLED=true`
2. Restart dev server after changing .env.local
3. Clear localStorage and try again: `localStorage.clear()`

### Profile shows loading forever?
**Check console for:**
- Auth initialization messages
- Any errors in AuthContext

### Profile data looks wrong?
**Mock data locations:**
- User stats: Hardcoded in profile page (lines 92-99)
- Redemptions: Loaded from `mock-offers.ts` via API client
- Achievements: Hardcoded in profile page (lines 107-112)

## For Hackathon Demo

### Recommended Demo Flow:
1. **Start logged in** (do mock login before presenting)
2. **Show map** with delays
3. **Submit report** → Earn points
4. **Go to profile** → Show points increased
5. **Go to rewards** → Redeem offer
6. **Back to profile** → Show redemption in history

### Pro Tips:
- Keep browser devtools closed during demo (hide console logs)
- Test the complete flow before presenting
- Have Profile page already loaded in a tab for quick access
- The mock user persists in localStorage between refreshes

---

## Summary

✅ **Profile page works perfectly in mock auth mode**  
✅ **Just requires a mock login first (any credentials)**  
✅ **All features functional with realistic mock data**  
✅ **Ready for hackathon demonstration**

No changes needed - the page is production-ready for your demo!
