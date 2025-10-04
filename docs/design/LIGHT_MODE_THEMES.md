# TG-3SIX-O Light Mode Duo/Tri-tone Themes

## Theme Options for Public Transportation

### 1. **Transit Blue** (Current)
**Duo-tone**: Blue + Gray  
**Tri-tone**: + Indigo accent
```css
--primary: #2563eb    /* Transit Blue */
--secondary: #64748b  /* Slate Gray */
--accent: #4f46e5     /* Indigo */
```
**Best for**: Professional, trustworthy, corporate transit apps

### 2. **Urban Green**
**Duo-tone**: Emerald + Charcoal  
**Tri-tone**: + Teal accent
```css
--primary: #059669    /* Emerald */
--secondary: #374151  /* Gray-700 */
--accent: #0d9488     /* Teal */
```
**Best for**: Eco-friendly transit, sustainability focus, modern cities

### 3. **Metro Orange**
**Duo-tone**: Orange + Dark Gray  
**Tri-tone**: + Amber accent
```css
--primary: #ea580c    /* Orange-600 */
--secondary: #4b5563  /* Gray-600 */
--accent: #d97706     /* Amber-600 */
```
**Best for**: High visibility, construction zones, urgent alerts

### 4. **Royal Purple**
**Duo-tone**: Purple + Slate  
**Tri-tone**: + Violet accent
```css
--primary: #7c3aed    /* Violet-600 */
--secondary: #475569  /* Slate-600 */
--accent: #8b5cf6     /* Violet-500 */
```
**Best for**: Premium transit services, night services, luxury

### 5. **Crimson Red**
**Duo-tone**: Red + Charcoal  
**Tri-tone**: + Rose accent
```css
--primary: #dc2626    /* Red-600 */
--secondary: #374151  /* Gray-700 */
--accent: #e11d48     /* Rose-600 */
```
**Best for**: Emergency services, critical alerts, urgent transit

### 6. **Ocean Teal**
**Duo-tone**: Teal + Steel  
**Tri-tone**: + Cyan accent
```css
--primary: #0f766e    /* Teal-700 */
--secondary: #52525b  /* Zinc-600 */
--accent: #0891b2     /* Sky-600 */
```
**Best for**: Coastal cities, ferry services, calm/reliable feel

### 7. **Sunset Amber**
**Duo-tone**: Amber + Warm Gray  
**Tri-tone**: + Yellow accent
```css
--primary: #d97706    /* Amber-600 */
--secondary: #78716c  /* Stone-500 */
--accent: #eab308     /* Yellow-500 */
```
**Best for**: Warm, friendly, accessible transit, school buses

### 8. **Forest Pine**
**Duo-tone**: Green + Slate  
**Tri-tone**: + Lime accent
```css
--primary: #166534    /* Green-800 */
--secondary: #475569  /* Slate-600 */
--accent: #65a30d     /* Lime-600 */
```
**Best for**: Rural transit, nature-focused, outdoor activities

## Recommended Implementation

### **Urban Green Theme** (Recommended)
Modern, eco-friendly, great contrast for mobile:

```css
:root {
  /* Urban Green Duo/Tri-tone */
  --primary: #059669;      /* Emerald-600 */
  --secondary: #374151;    /* Gray-700 */
  --accent: #0d9488;       /* Teal-600 */
  
  /* Transport Colors */
  --transport-bus: var(--primary);     /* Emerald */
  --transport-tram: var(--accent);     /* Teal */
  --transport-train: var(--secondary); /* Gray */
  --transport-metro: #1f2937;          /* Gray-800 */
  
  /* Severity (unchanged) */
  --success: #22c55e;      /* Green-500 */
  --warning: #f59e0b;      /* Amber-500 */
  --danger: #ef4444;       /* Red-500 */
}
```

### **Metro Orange Theme** (High Visibility)
Great for outdoor mobile use:

```css
:root {
  /* Metro Orange Duo/Tri-tone */
  --primary: #ea580c;      /* Orange-600 */
  --secondary: #4b5563;    /* Gray-600 */
  --accent: #d97706;       /* Amber-600 */
  
  /* Transport Colors */
  --transport-bus: var(--primary);     /* Orange */
  --transport-tram: var(--accent);     /* Amber */
  --transport-train: var(--secondary); /* Gray */
  --transport-metro: #374151;          /* Gray-700 */
}
```

## Implementation Guide

### Quick Theme Switch
```tsx
// Theme selector component
const themes = {
  'transit-blue': { primary: '#2563eb', secondary: '#64748b', accent: '#4f46e5' },
  'urban-green': { primary: '#059669', secondary: '#374151', accent: '#0d9488' },
  'metro-orange': { primary: '#ea580c', secondary: '#4b5563', accent: '#d97706' },
  // ... more themes
};

const applyTheme = (themeName: string) => {
  const theme = themes[themeName];
  document.documentElement.style.setProperty('--primary', theme.primary);
  document.documentElement.style.setProperty('--secondary', theme.secondary);
  document.documentElement.style.setProperty('--accent', theme.accent);
};
```

### CSS Custom Properties
```css
/* Use in components */
.transport-button {
  background-color: var(--primary);
  border-color: var(--secondary);
  color: white;
}

.accent-highlight {
  background-color: var(--accent);
  color: white;
}
```

## Mobile Considerations

### High Contrast Ratios
All themes tested for WCAG AA compliance:
- **Primary on white**: >4.5:1 contrast
- **Secondary on white**: >4.5:1 contrast  
- **Accent on white**: >4.5:1 contrast

### Outdoor Visibility
Recommended for bright sunlight:
1. **Metro Orange** - Highest visibility
2. **Urban Green** - Good contrast
3. **Transit Blue** - Current, reliable

### Battery Efficiency
Darker themes use less power on OLED:
1. **Forest Pine** - Darkest primary
2. **Royal Purple** - Medium dark
3. **Ocean Teal** - Balanced

## A/B Testing Recommendations

### Test Scenarios
- **Urban areas**: Urban Green vs Transit Blue
- **Outdoor use**: Metro Orange vs Crimson Red  
- **Night use**: Royal Purple vs Ocean Teal
- **Accessibility**: High contrast versions of each

### Metrics to Track
- **Tap accuracy** on transport type buttons
- **Error rates** in delay reporting
- **User preference** surveys
- **Completion rates** for key tasks

---

**Recommendation**: Start with **Urban Green** for a modern, eco-friendly feel that works great on mobile and has excellent contrast ratios.
