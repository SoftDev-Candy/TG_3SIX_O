# 🎭 Mock Auth Fallback - Test Checklist

## ✅ Test Scenario: Backend OFF, Frontend ONLY

### Pre-Test Setup
- [x] Frontend started: `npm run dev` in `/frontend`
- [ ] Backend STOPPED (ensure port 3001 is free)
- [ ] Open browser: http://localhost:3000
- [ ] Open browser console (F12) to see logs

---

## 🧪 Test Steps

### Test 1: Login with Mock Auth
1. **Navigate to login page:** http://localhost:3000/login
2. **Enter ANY credentials:**
   - Email: `demo@hackathon.com`
   - Password: `password123`
3. **Click "Sign in"**

**Expected Results:**
- ✅ Login succeeds (no error)
- ✅ Redirects to `/map`
- ✅ Console shows: `🎭 Mock login successful for demo`
- ✅ User appears logged in (profile in navbar)

---

### Test 2: User Persistence
1. **After successful login**
2. **Refresh the page** (F5 or Ctrl+R)

**Expected Results:**
- ✅ User stays logged in
- ✅ No re-authentication required
- ✅ Console shows: `🎭 Using mock authentication for demo`
- ✅ Profile still visible in navbar

---

### Test 3: Submit a Report
1. **Click "Report" button** (bottom navbar)
2. **Click "⚡ Quick Fill"** button
3. **Verify form is populated**
4. **Click "Submit Report"**

**Expected Results:**
- ✅ Report submits successfully
- ✅ Toast notification: "+3 points! Report submitted 🎉"
- ✅ Delays panel opens showing the new report
- ✅ No "Please sign in" error

---

### Test 4: Vote on Reports
1. **Open "Delays" panel** (bottom navbar)
2. **Find a report** (not your own)
3. **Click upvote** (👍 button)

**Expected Results:**
- ✅ Vote registers
- ✅ Toast notification: "+0.5 points for helpful vote! 👍"
- ✅ Vote count increases
- ✅ No authentication errors

---

### Test 5: Profile Display
1. **Click "Profile" button** (bottom navbar)

**Expected Results:**
- ✅ Shows username
- ✅ Shows email
- ✅ Shows points: 150
- ✅ Shows level: 3
- ✅ Avatar displayed

---

### Test 6: Logout and Re-login
1. **Click "Profile" → "Logout"**
2. **Verify logged out** (redirected to home/login)
3. **Login again** with different credentials:
   - Username: `tester`
   - Password: `test123`

**Expected Results:**
- ✅ Old mock user cleared
- ✅ New mock user created
- ✅ New username displayed: `tester`
- ✅ Points reset to 150, Level 3

---

### Test 7: Register New User
1. **Navigate to:** http://localhost:3000/signup
2. **Fill registration form:**
   - Email: `newuser@demo.com`
   - Username: `newuser`
   - Password: `password123`
   - Confirm Password: `password123`
3. **Click "Sign up"**

**Expected Results:**
- ✅ Registration succeeds
- ✅ Redirects to `/map`
- ✅ Console shows: `🎭 Mock registration successful for demo`
- ✅ Points: 0, Level: 1 (new user)

---

## 🐛 Common Issues & Fixes

### Issue 1: "Please sign in to report delays"
**Cause:** Mock auth not enabled  
**Fix:** Check `.env.local` has `NEXT_PUBLIC_MOCK_AUTH_ENABLED=true`

### Issue 2: User not persisting
**Cause:** localStorage not working  
**Fix:** Check browser console for errors, try incognito mode

### Issue 3: Console shows no `🎭` logs
**Cause:** Environment variable not loaded  
**Fix:** Restart frontend dev server

### Issue 4: Backend is still running
**Cause:** Port 3001 in use  
**Fix:** Stop backend: `pkill -f "fastify"` or `pkill -f "node.*backend"`

---

## ✅ Success Criteria

All tests pass if:
- ✅ Login works without backend
- ✅ User persists across refreshes
- ✅ Reports can be submitted
- ✅ Voting works
- ✅ Profile displays correctly
- ✅ No authentication errors
- ✅ Console shows `🎭` mock auth messages

---

## 🎬 Demo Ready Confirmation

When ALL tests pass, you can confidently present to judges knowing:
- ✅ Backend can be off
- ✅ Demo will work flawlessly
- ✅ No error messages
- ✅ Professional appearance maintained
- ✅ Full functionality available

---

**Test Date:** _______________  
**Tested By:** _______________  
**Result:** [ ] PASS  [ ] FAIL  
**Notes:** _______________________________________________
