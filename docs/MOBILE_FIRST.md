# 🚨 MOBILE-FIRST DESIGN REQUIREMENT

## Critical Context
TG-3SIX-O (Travel Guardian 360) is designed for **on-the-go travelers** who need real-time transit information while commuting. The primary user experience happens on mobile devices.

## Design Principles

### 1. Mobile is Primary, Not Secondary
- Design and develop for mobile screens first (320px - 428px)
- Desktop is an enhancement, not the base
- Test every feature on mobile before desktop

### 2. Touch-First Interactions
- Minimum tap target size: 44x44px (iOS guidelines)
- Large, easily tappable buttons
- Swipe gestures where appropriate
- No hover-dependent interactions

### 3. Performance on Mobile Networks
- Optimize images and assets for mobile bandwidth
- Lazy load non-critical content
- Progressive enhancement
- Offline-first considerations

### 4. One-Handed Operation
- Critical actions accessible with thumb reach
- Bottom navigation where appropriate
- FAB (Floating Action Button) for primary actions
- Avoid top-only navigation on tall screens

### 5. Quick Access Features
**Most Used Actions (in order of priority):**
1. View live map of delays
2. Report a delay (quick form)
3. Check saved routes
4. View points balance

These should be accessible within 1-2 taps maximum.

### 6. Mobile-Optimized Forms
- Auto-focus and auto-advance
- Appropriate input types (tel, email, number)
- Date/time pickers optimized for touch
- Minimize typing where possible
- Use native mobile features (camera, location)

### 7. Location & Camera Integration
- Request location permissions contextually
- Show clear value proposition before asking
- Easy photo upload from camera or gallery
- Geolocation for automatic stop detection

## Responsive Breakpoints
```
Mobile:  320px - 767px  (PRIMARY)
Tablet:  768px - 1023px (secondary)
Desktop: 1024px+        (enhancement)
```

## Testing Requirements
- Test on real devices, not just browser DevTools
- Test on various screen sizes (small phones to tablets)
- Test on slow 3G networks
- Test with large font sizes (accessibility)
- Test one-handed thumb reach zones

## TailwindCSS Approach
Always write mobile styles first, then add responsive prefixes:

```tsx
// ✅ CORRECT - Mobile first
<div className="p-4 md:p-6 lg:p-8">

// ❌ WRONG - Desktop first
<div className="lg:p-8 md:p-6 p-4">
```

## Key Metrics to Optimize
- **First Contentful Paint**: < 1.8s on 3G
- **Time to Interactive**: < 3.5s on 3G
- **Largest Contentful Paint**: < 2.5s
- **Bundle Size**: Keep initial bundle < 200KB
- **Touch Response**: < 100ms feedback

## PWA Considerations
Plan for Progressive Web App features:
- Add to Home Screen capability
- Push notifications for route delays
- Offline map caching
- Background sync for reports

---

**Remember:** If a feature works great on desktop but poorly on mobile, it's broken. Mobile users are our core audience.
