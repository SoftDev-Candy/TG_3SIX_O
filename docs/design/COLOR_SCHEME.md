# TG-3SIX-O Color Scheme & Design System

## Overview
Travel Guardian 360 uses a duo/tri-tone color scheme optimized for public transportation mapping and mobile-first design. The system supports both light and dark modes with accessibility-compliant contrast ratios.

## Color Philosophy
- **Minimal palette** for reduced cognitive load during travel
- **High contrast** for outdoor mobile usage
- **Transport-focused** colors that align with public transit conventions
- **Accessibility first** - WCAG AA+ compliance

## Primary Color Palette

### Light Mode (Default)
```css
/* Primary Duo-tone */
--primary-blue: #2563eb    /* Primary actions, transport lines */
--primary-gray: #64748b    /* Secondary text, borders */

/* Tri-tone Accent */
--accent-indigo: #4f46e5   /* Interactive elements, FAB */

/* Semantic Colors */
--success-green: #22c55e   /* Minor delays, positive states */
--warning-amber: #f59e0b   /* Moderate delays, caution */
--danger-red: #ef4444     /* Severe delays, critical alerts */

/* Neutral Grays */
--gray-50: #f8fafc        /* Background, cards */
--gray-100: #f1f5f9       /* Subtle backgrounds */
--gray-200: #e2e8f0       /* Borders, dividers */
--gray-600: #475569       /* Body text */
--gray-900: #0f172a       /* Headings, high emphasis */
```

### Dark Mode
```css
/* Primary Duo-tone */
--primary-blue: #3b82f6    /* Brighter for dark backgrounds */
--primary-gray: #94a3b8    /* Lighter gray for readability */

/* Tri-tone Accent */
--accent-indigo: #6366f1   /* Slightly brighter accent */

/* Semantic Colors (adjusted for dark) */
--success-green: #10b981   /* Slightly darker green */
--warning-amber: #f59e0b   /* Same amber (works on dark) */
--danger-red: #f87171     /* Lighter red for dark mode */

/* Dark Neutral Grays */
--gray-50: #1e293b        /* Dark background */
--gray-100: #334155       /* Card backgrounds */
--gray-200: #475569       /* Borders in dark mode */
--gray-600: #cbd5e1       /* Body text (light) */
--gray-900: #f1f5f9       /* Headings (light) */
```

## Transport Type Colors

### Light Mode
- **🚌 Bus**: `#2563eb` (Primary Blue)
- **🚊 Tram**: `#4f46e5` (Accent Indigo) 
- **🚆 Train**: `#64748b` (Primary Gray)
- **🚇 Metro**: `#0f172a` (Dark Gray)

### Dark Mode
- **🚌 Bus**: `#3b82f6` (Brighter Blue)
- **🚊 Tram**: `#6366f1` (Brighter Indigo)
- **🚆 Train**: `#94a3b8` (Light Gray)
- **🚇 Metro**: `#f1f5f9` (Light)

## Delay Severity Colors
Consistent across light and dark modes:

- **🟢 Minor**: `#22c55e` / `#10b981` (Green)
- **🟡 Moderate**: `#f59e0b` (Amber - same both modes)
- **🔴 Severe**: `#ef4444` / `#f87171` (Red)

## Map Styling

### Light Mode Map
- **Base tiles**: Standard OpenStreetMap
- **Water**: Light blue tint
- **Roads**: Subtle gray
- **Buildings**: Very light gray

### Dark Mode Map
- **Base tiles**: Dark-themed tiles (CartoDB Dark Matter)
- **Water**: Dark blue
- **Roads**: Light gray on dark
- **Buildings**: Dark gray

## UI Component Colors

### Floating Controls
```css
/* Light Mode */
background: rgba(255, 255, 255, 0.9)
backdrop-filter: blur(8px)
border: 1px solid rgba(226, 232, 240, 0.8)
shadow: 0 4px 6px rgba(0, 0, 0, 0.1)

/* Dark Mode */
background: rgba(30, 41, 59, 0.9)
backdrop-filter: blur(8px)
border: 1px solid rgba(71, 85, 105, 0.8)
shadow: 0 4px 6px rgba(0, 0, 0, 0.3)
```

### Transport Filter Badges
```css
/* Light Mode */
background: rgba(241, 245, 249, 0.9)
color: #475569
border: 1px solid #e2e8f0

/* Dark Mode */
background: rgba(51, 65, 85, 0.9)
color: #cbd5e1
border: 1px solid #475569
```

## Accessibility Standards

### Contrast Ratios (WCAG AA+)
- **Normal text**: Minimum 4.5:1
- **Large text**: Minimum 3:1
- **Interactive elements**: Minimum 4.5:1
- **Focus indicators**: Minimum 3:1

### Color Blindness Support
- **Never rely on color alone** for information
- **Use icons + colors** for transport types
- **Pattern/texture support** for severity levels
- **High contrast mode** available

## Implementation Guidelines

### CSS Custom Properties
```css
:root {
  /* Light mode variables */
  --color-primary: var(--primary-blue);
  --color-secondary: var(--primary-gray);
  --color-accent: var(--accent-indigo);
}

.dark {
  /* Dark mode overrides */
  --color-primary: var(--primary-blue-dark);
  --color-secondary: var(--primary-gray-dark);
  --color-accent: var(--accent-indigo-dark);
}
```

### Component Usage
```tsx
// Use semantic color classes
className="bg-primary text-primary-foreground"
className="text-secondary border-secondary"
className="bg-accent hover:bg-accent/90"

// Severity-specific classes
className="text-success" // Green
className="text-warning" // Amber  
className="text-danger"  // Red
```

## Mobile Considerations

### Outdoor Readability
- **Higher contrast** in bright sunlight
- **Larger touch targets** (44px minimum)
- **Bold typography** for better legibility
- **Reduced transparency** on critical elements

### Battery Optimization
- **Dark mode preferred** for OLED screens
- **Minimal animations** to save power
- **Efficient color calculations** in CSS

## Implementation Status

### ✅ Completed Features
- **Duo/tri-tone color scheme** implemented in CSS custom properties
- **Light and dark mode** support with system preference detection
- **Theme toggle component** with persistent storage
- **Map tile switching** between light/dark themes
- **Severity color adaptation** for both modes
- **Transport type color consistency** across themes

### 🔧 Technical Implementation
```tsx
// Theme toggle usage
import { ThemeToggle } from '@/components/ui/theme-toggle';

// In layout component
<ThemeToggle />
```

```css
/* Color scheme usage */
.transport-marker {
  background-color: var(--transport-bus);
  color: var(--primary-foreground);
}

.severity-severe {
  color: var(--danger-red);
}
```

### 📱 Mobile Optimizations
- **Theme toggle** positioned for thumb reach
- **High contrast** ratios for outdoor visibility
- **Battery-efficient** dark mode for OLED screens
- **Touch-friendly** 44px minimum targets maintained

## Future Enhancements

### Planned Features
- **Auto dark mode** based on time of day
- **High contrast mode** for accessibility
- **Custom theme** for transport operators
- **Colorblind-friendly** alternative palettes

### A/B Testing Targets
- **Delay severity colors** effectiveness
- **Transport type recognition** speed
- **Dark vs light mode** user preference
- **Contrast levels** for outdoor usage

---

**Last Updated**: 2025-10-04  
**Version**: 1.1  
**Status**: ✅ Implemented & Live
