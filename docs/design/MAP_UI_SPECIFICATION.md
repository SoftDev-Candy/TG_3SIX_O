# Map UI Specification
**Project:** TG-3SIX-O (Travel Guardian 360)  
**Date:** 2025-10-05  
**Version:** 1.0  
**Purpose:** Hackathon Demo Visual Design

---

## 🎯 Design Goals

1. **Clarity First:** Users should instantly see delays, not be overwhelmed by colors
2. **Professional:** Clean, modern aesthetic suitable for investor/judge presentation
3. **Mobile-Optimized:** Works on small screens without visual clutter
4. **Accessibility:** High contrast for delay markers, readable in bright light
5. **Brand Identity:** Consistent with Travel Guardian 360 brand

---

## 🎨 Color Scheme: Subdued Duo-Tone

### Core Principle
**"Delay-First" Design:** Only delays should be colorful. Everything else is neutral.

### Map Layers (Bottom to Top)

#### 1. Base Map Tiles
**Current:** Full-color OpenStreetMap  
**Problem:** Competes with transit data for attention

**Recommended Options:**

**Option A: Grayscale Map (Recommended for Demo)**
```typescript
L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
  attribution: '© CartoDB © OpenStreetMap',
  subdomains: 'abcd',
  maxZoom: 19
})
```
- Very light gray streets
- Minimal labels
- Perfect for overlaying colored data

**Option B: Custom Muted OSM**
```typescript
L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png', {
  attribution: '© Stadia Maps © OpenStreetMap',
  maxZoom: 19
})
```
- Slightly warmer than grayscale
- Still subdued enough for overlays

**Option C: Dark Mode (Alternative)**
```typescript
L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
  // Dark base, bright colored overlays pop
})
```

**Decision:** Use **Option A (CartoDB Light)** for hackathon demo.

---

#### 2. Transit Route Lines

**Problem:** 22 different colored lines create visual chaos.

**Solution: Monochrome with Opacity Hierarchy**

##### Color Palette
```
Primary Transit Color: #6B7280 (Gray-500)
- All tram lines use same gray color
- Differentiate by opacity and context, not color

Severity-Based Highlighting:
- Normal routes: #6B7280 at 30% opacity
- Routes with delays: #EF4444 (Red) at 70% opacity
- Hovered route: Increase weight + 80% opacity
```

##### Visual Hierarchy
```typescript
const routeStyles = {
  // Normal state (no delays)
  normal: {
    color: '#6B7280',      // Gray-500
    weight: 2,
    opacity: 0.3,          // Very subtle
    smoothFactor: 1
  },
  
  // Route has delays
  hasDelays: {
    color: '#EF4444',      // Red-500
    weight: 3,
    opacity: 0.7,
    smoothFactor: 1
  },
  
  // Hovered (any state)
  hover: {
    weight: 5,
    opacity: 0.9
  },
  
  // Selected (for routing)
  selected: {
    color: '#3B82F6',      // Blue-500
    weight: 4,
    opacity: 0.9
  }
}
```

**Rationale:**
- Eye naturally drawn to red (delayed) routes
- Gray routes provide context without distraction
- Reduces cognitive load - users don't need to remember 22 colors

---

#### 3. Delay Markers (Highest Priority)

**These are the stars of the show!**

##### Severity Colors (Keep Current System)
```
Severe:   #DC2626 (Red-600)   - Dark red, urgent
Moderate: #EA580C (Orange-600) - Bright orange, attention
Minor:    #16A34A (Green-600)  - Green, informative
```

##### Visual Treatment
```typescript
const markerStyles = {
  severe: {
    backgroundColor: '#DC2626',
    size: 32,                    // Larger for urgency
    borderColor: '#FFF',
    borderWidth: 3,
    boxShadow: '0 4px 12px rgba(220, 38, 38, 0.4)',
    pulse: true                  // Animate for severe delays
  },
  moderate: {
    backgroundColor: '#EA580C',
    size: 28,
    borderColor: '#FFF',
    borderWidth: 2,
    boxShadow: '0 3px 8px rgba(234, 88, 12, 0.3)'
  },
  minor: {
    backgroundColor: '#16A34A',
    size: 24,
    borderColor: '#FFF',
    borderWidth: 2,
    boxShadow: '0 2px 6px rgba(22, 163, 74, 0.2)'
  }
}
```

##### Pulse Animation (Severe Only)
```css
@keyframes pulse-severe {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.15);
    opacity: 0.8;
  }
}
```

**Rationale:**
- High contrast against muted background
- Size hierarchy matches urgency
- Pulse draws attention to critical issues
- White border ensures visibility on any background

---

## 🎨 Complete Color Palette

### Neutral Grays (Base Map & Routes)
```
Gray-100: #F3F4F6  // Very light backgrounds
Gray-300: #D1D5DB  // Borders, dividers
Gray-500: #6B7280  // Normal transit routes
Gray-700: #374151  // Text on light backgrounds
Gray-900: #111827  // Primary text
```

### Accent Colors (Delays & Actions)
```
Red-600:    #DC2626  // Severe delays
Orange-600: #EA580C  // Moderate delays
Green-600:  #16A34A  // Minor delays
Blue-500:   #3B82F6  // Selected route, links
```

### Functional Colors
```
Success: #10B981   // Verification, completion
Warning: #F59E0B   // Cautions
Error:   #EF4444   // Errors, severe issues
Info:    #0EA5E9   // Informational messages
```

---

## 📐 Spacing & Sizes

### Route Line Weights
```
Normal routes:      2px
Routes with delays: 3px
Hovered routes:     5px
Selected routes:    4px
```

### Marker Sizes
```
Severe:   32px × 32px
Moderate: 28px × 28px
Minor:    24px × 24px
```

### Touch Targets (Mobile)
```
Minimum: 44px × 44px (iOS/Android standard)
Preferred: 48px × 48px
Delay markers: 56px × 56px clickable area (including padding)
```

---

## 🖼️ Visual Hierarchy (Z-Index)

```
1. Base map tiles         (z-index: 0)
2. Normal transit routes  (z-index: 100, opacity: 0.3)
3. Delayed routes         (z-index: 200, opacity: 0.7)
4. Hovered route          (z-index: 300)
5. Delay markers          (z-index: 400)
6. Selected marker popup  (z-index: 500)
7. Bottom navigation      (z-index: 1000)
8. Slide-up panels        (z-index: 1100)
```

---

## 🎭 Interactive States

### Route Polylines

| State | Color | Weight | Opacity | Animation |
|-------|-------|--------|---------|-----------|
| Default (no delays) | Gray-500 | 2px | 30% | - |
| Has delays | Red-500 | 3px | 70% | - |
| Hover | Same | 5px | 90% | Smooth 200ms |
| Selected | Blue-500 | 4px | 90% | - |

### Delay Markers

| State | Size | Shadow | Animation |
|-------|------|--------|-----------|
| Default | Varies | Standard | Pulse (severe only) |
| Hover | +4px | Enhanced | Scale 1.1 |
| Active/Popup | +6px | Strong | - |

---

## 📱 Mobile Optimizations

### Marker Clustering (Performance)
When **> 50 markers** visible:
```typescript
const clusterConfig = {
  maxClusterRadius: 60,
  spiderfyOnMaxZoom: true,
  showCoverageOnHover: false,
  iconCreateFunction: (cluster) => {
    const count = cluster.getChildCount();
    const severity = getMostSevereSeverity(cluster);
    return createClusterIcon(count, severity);
  }
}
```

### Adaptive Line Thickness
```typescript
// Thin lines on mobile to reduce visual noise
const isMobile = window.innerWidth < 768;
const routeWeight = isMobile ? 1.5 : 2;
```

### Simplified View (< 375px width)
- Hide route lines at zoom < 12
- Show only delay markers
- Cluster more aggressively

---

## 🎨 Contextual Color Changes

### "Delay Mode" (Current View - Default)
```
Purpose: Show all delays at a glance
Routes: Gray (30%) for context, Red (70%) for affected
Markers: Full color hierarchy
```

### "Route Planning Mode" (Future)
```
Purpose: Plan a specific journey
Routes: Selected route in Blue (90%), others gray (20%)
Markers: Only show markers affecting selected route
```

### "Transport Type Filter" (Via bottom nav)
```
Purpose: Focus on one transport type
Routes: Filtered type at normal opacity, others fade to 10%
Markers: Show only filtered type
```

---

## 🔍 Accessibility

### Color Blind Considerations
- Don't rely solely on red/green distinction
- Severe delays: Size + pulse animation (not just color)
- Use patterns or icons as backup indicators

### Contrast Ratios (WCAG AA)
```
Delay marker text on colored background: 4.5:1 minimum
Route labels: 3:1 minimum against map
Bottom nav text: 4.5:1
```

### Screen Reader Support
```html
<div role="button" aria-label="Severe delay on Tram 52, 15 minutes">
  <!-- Marker content -->
</div>
```

---

## 💡 Recommended Implementation

### Phase 1: Quick Wins (30 min)
1. **Switch to grayscale base map**
   - Change tile URL to CartoDB Light
   - Instant visual improvement

2. **Unify transit route colors**
   - All routes → Gray #6B7280 at 30% opacity
   - Remove individual route colors

3. **Enhance delay marker visibility**
   - Increase border width to 3px
   - Add subtle drop shadow

### Phase 2: Polish (1 hour)
4. **Add contextual coloring**
   - Routes with delays → Red with 70% opacity
   - Detect which routes have delay markers

5. **Improve hover states**
   - Smooth transitions (200ms)
   - Increase weight on hover

6. **Add pulse animation to severe delays**
   - CSS keyframes
   - Only for severe markers

### Phase 3: Enhancement (Optional)
7. **Marker clustering** (if > 50 markers)
8. **Dark mode toggle** (time permitting)
9. **Transport type color coding** (if filters active)

---

## 🎬 Demo Scenario Considerations

### For Judges (2-minute pitch)
**Focus:** Clean, professional appearance
- Grayscale map → looks polished, not chaotic
- Red delay highlights → instant "aha!" moment
- "See how delays pop against the neutral background?"

### For User Testing
**Focus:** Findability
- Can users spot delays in < 3 seconds? (Should be yes with red routes)
- Can users identify severity? (Size + color + animation)
- Is map readable on phone? (Gray routes don't overwhelm)

---

## 📏 Design Tokens (For Implementation)

```typescript
// colors.ts
export const mapColors = {
  // Base map (handled by tile provider)
  
  // Transit routes
  routeNormal: '#6B7280',
  routeDelayed: '#EF4444',
  routeSelected: '#3B82F6',
  
  // Delay markers
  severeSevere: '#DC2626',
  severityModerate: '#EA580C',
  severityMinor: '#16A34A',
  
  // UI elements
  markerBorder: '#FFFFFF',
  markerShadow: 'rgba(0, 0, 0, 0.2)',
}

export const mapOpacity = {
  routeNormal: 0.3,
  routeDelayed: 0.7,
  routeHover: 0.9,
  routeSelected: 0.9,
}

export const mapWeights = {
  routeNormal: 2,
  routeDelayed: 3,
  routeHover: 5,
  routeSelected: 4,
}

export const markerSizes = {
  severe: 32,
  moderate: 28,
  minor: 24,
  clusterSmall: 40,
  clusterMedium: 50,
  clusterLarge: 60,
}
```

---

## 🚀 Next Steps

1. **Review & Approve:** Team reviews this spec
2. **Create Figma mockups:** Visual reference for judges
3. **Implement Phase 1:** Grayscale base + unified route colors
4. **Test on mobile:** Verify readability
5. **Iterate:** Adjust based on real-device testing

---

## 📸 Before/After Comparison

### Current State (Identified Issues)
- ❌ 22 different route colors (rainbow soup)
- ❌ Colorful base map competes for attention
- ❌ No visual hierarchy (everything screams)
- ❌ Hard to spot delays quickly
- ❌ Looks amateur/chaotic

### Target State (This Spec)
- ✅ Grayscale base map (professional)
- ✅ Unified gray routes (context, not noise)
- ✅ Red-highlighted delayed routes (instant clarity)
- ✅ Bold colored markers (clear severity)
- ✅ Looks polished, investor-ready

---

**Document Owner:** UI/UX Team  
**Review Date:** Before hackathon demo  
**Status:** Ready for Implementation

---

## 🎨 Alternative Color Schemes (Discussion)

### Option B: "Transit Blue" Monochrome
```
All routes: Various shades of blue (#1E40AF to #DBEAFE)
Delays: Keep red/orange/green markers
Pro: More "transit system" feel
Con: Less dramatic contrast with delays
```

### Option C: "Night Mode"
```
Dark base map + bright neon routes
Routes: Cyan (#06B6D4)
Delays: Same red/orange/green
Pro: Modern, eye-catching
Con: Harder to read in bright light (outdoor demo)
```

**Recommendation:** Stick with Option A (grayscale + red delays) for maximum clarity and professionalism.
