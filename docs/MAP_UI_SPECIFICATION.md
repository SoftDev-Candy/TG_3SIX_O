# Map Page UI Specification
## TG-3SIX-O (Travel Guardian 360) - Primary Interface

### 🎯 **Core Philosophy**
The map page is our **PRIMARY INTERFACE** - users should be able to accomplish all key tasks without leaving this view. Every interaction must be **mobile-first** with clear visual hierarchy.

---

## 📱 **Primary Actions (Always Visible)**

### 1. **REPORT DELAY** - Main CTA
- **Position**: Bottom-right, floating
- **Size**: Large (80x80px minimum)
- **Style**: Red circular button with white text
- **Icon**: ⚠️ Alert triangle
- **Text**: "REPORT" (always visible)
- **Action**: Opens delay report modal
- **Priority**: HIGHEST - This is our core feature

### 2. **MY LOCATION** - Navigation Aid  
- **Position**: Bottom-left, floating
- **Size**: Medium (60x60px)
- **Style**: Blue circular button
- **Icon**: 📍 Location pin
- **Text**: "MY LOCATION" (on larger screens)
- **Action**: Centers map on user location
- **Priority**: HIGH - Essential for mobile users

### 3. **MENU** - Navigation Hub
- **Position**: Top-left, floating
- **Size**: Medium (60x60px) 
- **Style**: White/gray circular button
- **Icon**: ☰ Hamburger menu
- **Text**: "MENU" (on larger screens)
- **Action**: Opens navigation drawer
- **Priority**: HIGH - Access to all features

---

## 🎛️ **Secondary Actions (Contextual)**

### 4. **FILTERS** - Data Control
- **Position**: Top-right, floating
- **Size**: Medium (60x60px)
- **Style**: White/gray circular button  
- **Icon**: 🔍 Filter/funnel
- **Text**: "FILTERS"
- **Action**: Opens filter panel
- **Priority**: MEDIUM

### 5. **STATS** - Live Data
- **Position**: Top-center or expandable from menu
- **Size**: Pill-shaped button (120x40px)
- **Style**: Semi-transparent white background
- **Icon**: 📊 Chart/graph
- **Text**: "LIVE STATS"
- **Action**: Shows/hides stats overlay
- **Priority**: MEDIUM

### 6. **ROUTE PLANNER** - Journey Planning
- **Position**: Left edge, middle (slide-out)
- **Size**: Medium (60x60px)
- **Style**: Green circular button
- **Icon**: 🗺️ Route/directions
- **Text**: "ROUTES"
- **Action**: Opens route planning interface
- **Priority**: MEDIUM

---

## 🚌 **Transport Type Selector**

### 7. **TRANSPORT FILTER** - Quick Selection
- **Position**: Bottom-center, floating bar
- **Size**: Horizontal pill (300x50px)
- **Style**: Semi-transparent white background
- **Icons**: 🚌 🚊 🚆 🚇 (with text labels)
- **Text**: "BUS", "TRAM", "TRAIN", "METRO", "ALL"
- **Action**: Filters map markers by transport type
- **Priority**: HIGH - Core filtering functionality

---

## 👤 **User Actions**

### 8. **USER PROFILE** - Account Access
- **Position**: Top-right corner (if logged in)
- **Size**: Small avatar (40x40px) + points badge
- **Style**: Circular avatar with points counter
- **Text**: Points count (e.g., "1,247 pts")
- **Action**: Opens user profile/menu
- **Priority**: MEDIUM (only when authenticated)

### 9. **LOGIN/SIGNUP** - Authentication
- **Position**: Top-right corner (if guest)
- **Size**: Medium button (100x40px)
- **Style**: Outlined button
- **Text**: "SIGN IN" or "JOIN"
- **Action**: Opens auth modal/page
- **Priority**: LOW (optional for core functionality)

---

## 📊 **Information Display**

### 10. **SEVERITY LEGEND** - Visual Guide
- **Position**: Bottom-left, above location button
- **Size**: Compact card (80x60px)
- **Style**: Semi-transparent background
- **Content**: 
  - 🟢 Minor (1-5 min)
  - 🟡 Moderate (5-15 min)  
  - 🔴 Severe (15+ min)
- **Priority**: MEDIUM - Helps users understand map markers

### 11. **LIVE COUNTER** - Activity Indicator
- **Position**: Top-center, small badge
- **Size**: Small pill (80x24px)
- **Style**: Pulsing animation, colored background
- **Text**: "12 ACTIVE DELAYS" or "47 REPORTS TODAY"
- **Action**: Click to show stats panel
- **Priority**: LOW - Engagement feature

---

## 🎨 **Visual Hierarchy Rules**

### **Size Priority**:
1. **REPORT button** - Largest (80x80px)
2. **MY LOCATION, MENU** - Large (60x60px)  
3. **Secondary actions** - Medium (50x50px)
4. **Transport selector** - Wide bar (300x50px)
5. **Info elements** - Small/compact

### **Color Priority**:
1. **REPORT** - Red (#DC2626) - Danger/urgency
2. **MY LOCATION** - Blue (#2563EB) - Navigation
3. **MENU** - Gray/White - Neutral
4. **ROUTE PLANNER** - Green (#059669) - Success/go
5. **Others** - Muted colors

### **Z-Index Layers**:
- **Map**: 0 (base layer)
- **Map markers**: 100
- **Floating buttons**: 1000  
- **Panels/modals**: 1001
- **Tooltips**: 1002

---

## 📱 **Mobile Responsiveness**

### **Phone (320-767px)**:
- All buttons minimum 44x44px (Apple guidelines)
- Text labels may be hidden on smallest screens
- Single column layout for panels
- Swipe gestures for panels

### **Tablet (768-1023px)**:
- All text labels visible
- Larger touch targets (60x60px+)
- Side panels instead of full-screen modals

### **Desktop (1024px+)**:
- Hover states for all interactive elements
- Keyboard shortcuts (R for Report, M for Menu, etc.)
- Multi-column layouts for panels
- Mouse wheel zoom controls

---

## ⚡ **Performance Requirements**

- **Button response time**: < 100ms
- **Panel animations**: 200-300ms duration
- **Map interactions**: 60fps smooth
- **Modal load time**: < 200ms
- **Location detection**: < 3 seconds

---

## ♿ **Accessibility Standards**

- **ARIA labels** on all buttons
- **Keyboard navigation** support
- **Screen reader** compatible
- **High contrast** mode support
- **Focus indicators** clearly visible
- **Touch target size** minimum 44x44px

---

## 🔄 **State Management**

### **Button States**:
- **Default**: Normal appearance
- **Hover**: Slight scale/color change
- **Active**: Pressed appearance
- **Loading**: Spinner overlay
- **Disabled**: Grayed out, not clickable

### **Panel States**:
- **Closed**: Hidden/collapsed
- **Opening**: Slide-in animation
- **Open**: Fully visible
- **Closing**: Slide-out animation

---

## 🎯 **Success Metrics**

- **Report submission rate**: > 80% completion
- **Location accuracy**: < 10m error
- **User engagement**: > 3 actions per session
- **Mobile usability**: > 90% task completion
- **Accessibility score**: 100% WCAG AA compliance

---

## 🚀 **Implementation Priority**

### **Phase 1 (MVP)**:
1. REPORT DELAY button + modal
2. MY LOCATION button
3. MENU button + navigation
4. Transport type selector
5. Basic map markers

### **Phase 2 (Enhanced)**:
1. FILTERS panel
2. STATS overlay  
3. User profile integration
4. Severity legend
5. Live counters

### **Phase 3 (Advanced)**:
1. ROUTE PLANNER integration
2. Advanced animations
3. Keyboard shortcuts
4. Offline support
5. Push notifications

---

*This specification ensures our map interface is intuitive, accessible, and mobile-first while providing all essential functionality for transit delay reporting and navigation.*
