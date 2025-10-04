# Delay Reporting Feature - Implementation Plan
**Project**: TG-3SIX-O (Travel Guardian 360)  
**Feature**: Comprehensive Delay Reporting System  
**Status**: Planning Phase  
**Priority**: High  

---

## 🎯 **Objectives**

Create a mobile-first, user-friendly delay reporting system that allows users to quickly report transit delays with minimal friction while capturing essential information for verification and community value.

---

## 📋 **Requirements Overview**

### **Core Requirements** (Must Have - MVP)
1. ✅ Quick report form with essential fields
2. ✅ Location detection (GPS + manual entry)
3. ✅ Transport type selection (Bus, Tram, Train, Metro)
4. ✅ Severity selection (Minor, Moderate, Severe)
5. ✅ Issue category selection
6. ✅ Basic description/notes
7. ✅ Form validation & error handling
8. ✅ Mobile-optimized UI with 44px+ touch targets

### **Enhanced Features** (Should Have - Phase 2)
1. 📸 Photo upload (max 3 images, 5MB each)
2. 🎥 Video upload (optional, max 1 video, 20MB)
3. 🗺️ Suggest nearby transit stops (based on location)
4. ⏱️ Estimated delay duration input
5. 🔄 Auto-populate previously reported lines/routes

### **Future Enhancements** (Nice to Have - Phase 3)
1. 🎤 Voice notes
2. 📍 Map-based location picker
3. 🚏 Transit stop favorites
4. 📊 Pre-submit delay probability indicator
5. 🌐 Offline mode with queue sync

---

## 🎨 **UI/UX Design Specification**

### **Form Flow**
```
1. Location Detection (Auto + Manual Override)
   ↓
2. Transport Type Selection
   ↓
3. Line/Route Number (Free text with autocomplete suggestions)
   ↓
4. Severity Level
   ↓
5. Issue Category
   ↓
6. Delay Duration (Estimated)
   ↓
7. Description/Notes (Optional)
   ↓
8. Photo/Video Upload (Optional)
   ↓
9. Review & Submit
```

### **Form Fields Detail**

#### **1. Location Detection** (Required) ✅ CONFIRMED
- **Type**: Dual input - GPS auto-detect + Manual search
- **Auto-detection** (Quick option): 
  - "Use My Location" button (prominent)
  - Use browser Geolocation API
  - Show loading state while detecting
  - Reverse geocode to show address/area name
  - Cache last location for faster subsequent reports
  - Development fallback: Tauron Arena, Kraków (50.067472°N, 19.991694°E)
- **Manual Entry** (Flexible option):
  - Text input field with search icon
  - Real-time autosuggest as user types
  - Debounced search (300ms delay)
  - Shows dropdown with location suggestions
  - Each suggestion shows: name + address + distance (if GPS available)
  - Click suggestion to populate location
  - Map picker (Phase 2)
- **Autosuggest Data Sources**:
  - **Phase 1 (MVP)**: Mock data with common Kraków locations
    - Transit hubs: Main Station, Galeria Krakowska, Rondo Mogilskie
    - Popular stops: Dworzec Główny, Teatr Słowackiego, Wawel
    - Districts: Krowodrza, Podgórze, Nowa Huta
  - **Phase 2**: Integration with geocoding API (Mapbox/OpenStreetMap)
  - **Phase 3**: User's recent/favorite locations + transit stop database
- **Validation**: Must have valid coordinates or address
- **Error Handling**: 
  - Location permission denied → Manual entry becomes primary option
  - Timeout → Fall back to manual entry
  - No autosuggest results → Allow free-text address entry
  - Show user-friendly error messages

#### **2. Transport Type** (Required)
- **Options**: Bus 🚌, Tram 🚊, Train 🚆, Metro 🚇
- **UI**: Large icon buttons in a grid (2x2 or 4x1)
- **Touch Target**: 64px minimum
- **Default**: None (user must select)
- **Validation**: Required field

#### **3. Line/Route Number** (Required)
- **Type**: Text input with autocomplete
- **Autocomplete**:
  - Suggest based on transport type + location
  - Show recently reported lines
  - Show user's frequent lines (from history)
- **Examples**: "M1", "100", "S-Bahn S5"
- **Validation**: 
  - Required
  - Min 1 character, Max 20 characters
  - Alphanumeric with spaces/hyphens allowed

#### **4. Severity Level** (Required)
- **Options**:
  - 🟢 **Minor**: 1-5 minutes delay
  - 🟡 **Moderate**: 5-15 minutes delay
  - 🔴 **Severe**: 15+ minutes delay
- **UI**: 3 large buttons with color coding
- **Default**: None (user must select)
- **Validation**: Required field

#### **5. Issue Category** (Required)
- **Options**:
  - 🔧 Mechanical/Technical Issue
  - 🚦 Signal Problems
  - 🌧️ Weather-Related
  - 🚗 Traffic/Road Issues
  - 👥 Overcrowding
  - 🚨 Emergency/Accident
  - 🛠️ Maintenance/Construction
  - ❓ Other/Unknown
- **UI**: Grid of buttons or dropdown (mobile: bottom sheet)
- **Default**: None (user must select)
- **Validation**: Required field

#### **6. Delay Duration** (Optional but Recommended)
- **Type**: Number input or picker
- **Options**:
  - Quick buttons: 5min, 10min, 15min, 30min, 60min+
  - Custom input field
- **Unit**: Minutes
- **Range**: 1-240 minutes (4 hours max)
- **Default**: Based on severity selection
  - Minor → 3 minutes
  - Moderate → 10 minutes
  - Severe → 20 minutes
- **Validation**: 
  - Optional
  - If provided, must be > 0 and < 240

#### **7. Description/Notes** (Optional)
- **Type**: Textarea
- **Placeholder**: "Any additional details? (e.g., 'Train stopped between stations', 'Long wait at platform')"
- **Character Limit**: 500 characters
- **UI**: Auto-expanding textarea
- **Validation**: 
  - Optional
  - Max 500 characters
  - Strip HTML/scripts for security

#### **8. Photo/Video Upload** (Optional - Phase 2)
- **Photos**:
  - Max 3 images
  - Max 5MB per image
  - Formats: JPG, PNG, WEBP
  - Auto-compress if > 2MB
  - Show thumbnail previews
  - Remove button per image
- **Video** (Phase 3):
  - Max 1 video
  - Max 20MB
  - Formats: MP4, MOV
  - Show duration and size
- **Mobile Integration**:
  - Native camera access
  - Photo library access
  - Drag & drop on desktop
- **Validation**:
  - File size limits enforced
  - File type validation
  - Virus scan (backend)

---

## 🏗️ **Component Architecture**

### **Component Hierarchy**
```
ReportDelayForm (Main Container)
├── LocationSelector
│   ├── AutoLocationButton ("Use My Location")
│   ├── LocationSearchInput
│   │   ├── TextInput (with search icon)
│   │   └── AutosuggestDropdown
│   │       └── LocationSuggestionItem × N
│   └── SelectedLocationDisplay
├── TransportTypeSelector
│   └── TransportButton × 4
├── LineNumberInput (with autocomplete)
├── SeveritySelector
│   └── SeverityButton × 3
├── CategorySelector
│   └── CategoryButton × 8
├── DurationPicker
│   ├── QuickDurationButtons
│   └── CustomDurationInput
├── DescriptionInput
├── MediaUploader (Phase 2)
│   ├── PhotoUploader
│   └── VideoUploader (Phase 3)
└── SubmitButton (with loading state)
```

### **State Management**
```typescript
interface ReportFormState {
  // Location
  location: {
    coordinates: { lat: number; lng: number } | null;
    address: string;
    detectionMethod: 'auto' | 'manual';
    isDetecting: boolean;
  };
  
  // Report Details
  transportType: 'bus' | 'tram' | 'train' | 'metro' | null;
  lineNumber: string;
  severity: 'minor' | 'moderate' | 'severe' | null;
  category: string | null;
  delayMinutes: number | null;
  description: string;
  
  // Media (Phase 2)
  photos: File[];
  video: File | null;
  
  // Form State
  isSubmitting: boolean;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
}
```

### **Form Validation Schema (Zod)**
```typescript
const reportDelaySchema = z.object({
  location: z.object({
    coordinates: z.object({
      lat: z.number().min(-90).max(90),
      lng: z.number().min(-180).max(180),
    }).nullable(),
    address: z.string().min(3, 'Location is required'),
  }),
  transportType: z.enum(['bus', 'tram', 'train', 'metro'], {
    required_error: 'Please select a transport type',
  }),
  lineNumber: z.string()
    .min(1, 'Line/route number is required')
    .max(20, 'Line number too long')
    .regex(/^[A-Za-z0-9\s\-]+$/, 'Invalid characters in line number'),
  severity: z.enum(['minor', 'moderate', 'severe'], {
    required_error: 'Please select severity level',
  }),
  category: z.string().min(1, 'Please select an issue category'),
  delayMinutes: z.number()
    .min(1, 'Delay must be at least 1 minute')
    .max(240, 'Delay cannot exceed 4 hours')
    .optional(),
  description: z.string()
    .max(500, 'Description cannot exceed 500 characters')
    .optional(),
  photos: z.array(z.instanceof(File))
    .max(3, 'Maximum 3 photos allowed')
    .optional(),
  video: z.instanceof(File)
    .optional(),
});
```

---

## 📍 **Mock Location Data (Phase 1)**

For MVP development and testing, we'll use the following mock locations in Kraków:

```typescript
const mockLocations = [
  // Major Transit Hubs
  { 
    id: 'dworzec-glowny',
    name: 'Dworzec Główny', 
    address: 'Dworzec Główny, Kraków', 
    lat: 50.0675, lng: 19.9452,
    type: 'transit_hub',
    lines: ['All trains', '2', '4', '5', '8', '10', '20', '50']
  },
  { 
    id: 'galeria-krakowska',
    name: 'Galeria Krakowska', 
    address: 'ul. Pawia 5, Kraków', 
    lat: 50.0686, lng: 19.9469,
    type: 'transit_hub',
    lines: ['4', '5', '10', '20', '52']
  },
  { 
    id: 'rondo-mogilskie',
    name: 'Rondo Mogilskie', 
    address: 'Rondo Mogilskie, Kraków', 
    lat: 50.0693, lng: 19.9534,
    type: 'transit_hub',
    lines: ['3', '9', '10', '24', '52']
  },
  
  // Popular Locations
  { 
    id: 'teatr-slowackiego',
    name: 'Teatr Słowackiego', 
    address: 'pl. św. Ducha 1, Kraków', 
    lat: 50.0650, lng: 19.9413,
    type: 'landmark',
    lines: ['2', '4', '14', '18', '20']
  },
  { 
    id: 'wawel',
    name: 'Wawel', 
    address: 'Wawel 5, Kraków', 
    lat: 50.0544, lng: 19.9356,
    type: 'landmark',
    lines: ['8', '10', '18']
  },
  { 
    id: 'main-square',
    name: 'Rynek Główny', 
    address: 'Rynek Główny, Kraków', 
    lat: 50.0619, lng: 19.9368,
    type: 'landmark',
    lines: ['1', '6', '8', '13', '18']
  },
  { 
    id: 'tauron-arena',
    name: 'Tauron Arena', 
    address: 'al. Pokoju 1, Kraków', 
    lat: 50.067472, lng: 19.991694,
    type: 'venue',
    lines: ['4', '10', '14', '18', '44', '52']
  },
  
  // Districts
  { 
    id: 'krowodrza',
    name: 'Krowodrza', 
    address: 'Krowodrza, Kraków', 
    lat: 50.0824, lng: 19.9126,
    type: 'district',
    lines: ['4', '5', '10', '44', '52', '164']
  },
  { 
    id: 'podgorze',
    name: 'Podgórze', 
    address: 'Podgórze, Kraków', 
    lat: 50.0341, lng: 19.9496,
    type: 'district',
    lines: ['6', '8', '10', '13', '23']
  },
  { 
    id: 'nowa-huta',
    name: 'Nowa Huta', 
    address: 'Nowa Huta, Kraków', 
    lat: 50.0691, lng: 20.0400,
    type: 'district',
    lines: ['4', '10', '15', '16', '22']
  },
  
  // University Area
  { 
    id: 'agh',
    name: 'AGH University', 
    address: 'al. Mickiewicza 30, Kraków', 
    lat: 50.0657, lng: 19.9191,
    type: 'university',
    lines: ['15', '18', '50', '173', '501']
  },
];
```

**Autosuggest Behavior:**
- Search is case-insensitive
- Matches on name OR address
- Results sorted by relevance (exact match > starts with > contains)
- Show max 5 suggestions
- Display format: `[icon] Name - Address (X lines)`

---

## 🔌 **API Integration**

### **Endpoints**

#### **1. Submit Report**
```typescript
POST /api/reports

Request Body:
{
  location: {
    coordinates: { lat: number; lng: number };
    address: string;
  };
  transportType: string;
  lineNumber: string;
  severity: string;
  category: string;
  delayMinutes?: number;
  description?: string;
  photos?: string[]; // URLs after upload
  video?: string;    // URL after upload
}

Response:
{
  id: string;
  status: 'pending';
  points: number;
  createdAt: string;
}
```

#### **2. Get Nearby Transit Stops** (Phase 2)
```typescript
GET /api/transit/stops/nearby?lat={lat}&lng={lng}&radius={meters}

Response:
{
  stops: [
    {
      id: string;
      name: string;
      type: 'bus' | 'tram' | 'train' | 'metro';
      distance: number; // meters
      lines: string[];
    }
  ]
}
```

#### **3. Autocomplete Line Numbers**
```typescript
GET /api/transit/lines/search?q={query}&type={transportType}&location={lat,lng}

Response:
{
  suggestions: [
    {
      lineNumber: string;
      name: string;
      type: string;
      frequency: number; // how often reported
    }
  ]
}
```

#### **4. Upload Media** (Phase 2)
```typescript
POST /api/media/upload

Request: multipart/form-data
- file: File
- type: 'photo' | 'video'

Response:
{
  url: string;
  size: number;
  mimeType: string;
}
```

---

## 📱 **Mobile-First Considerations**

### **Performance**
- Lazy load media uploader components
- Debounce autocomplete searches (300ms)
- Optimize images before upload (client-side compression)
- Show progress indicators for all async operations
- Cache location and recent line numbers in localStorage

### **Offline Support** (Phase 3)
- Queue reports in IndexedDB
- Show "Offline" indicator
- Auto-sync when connection restored
- Show queued reports count

### **Touch Optimization**
- All buttons: minimum 44x44px touch targets
- Increased tap area for small icons (48x48px)
- Swipe gestures for photo gallery
- Pull-to-refresh for location
- Bottom sheet for pickers (native feel)

### **Progressive Disclosure**
- Show only essential fields initially
- Expand optional fields on demand
- "Add more details" section (collapsed by default)
- Skip button for optional steps

---

## ♿ **Accessibility**

### **ARIA Labels**
- All form fields with proper labels
- Error messages announced to screen readers
- Loading states announced
- Success/error feedback

### **Keyboard Navigation**
- Tab order follows logical flow
- Enter to submit
- Escape to close modals
- Arrow keys for button groups

### **Visual Accessibility**
- High contrast mode support
- Color-blind friendly severity indicators (icons + colors)
- Large text mode support
- Focus indicators on all interactive elements

---

## 🧪 **Testing Strategy**

### **Unit Tests**
- Form validation logic
- State management
- Location detection helpers
- Media upload utilities

### **Integration Tests**
- Form submission flow
- API error handling
- Location permission flows
- File upload process

### **E2E Tests** (Playwright)
- Complete report submission (happy path)
- Form validation errors
- Location permission denied
- Network failure scenarios
- Photo upload flow

### **Manual Testing Checklist**
- [ ] Test on real mobile devices (iOS + Android)
- [ ] Test with slow 3G connection
- [ ] Test location permission denied
- [ ] Test with location services off
- [ ] Test camera permission flows
- [ ] Test form with various invalid inputs
- [ ] Test offline mode (Phase 3)
- [ ] Test with screen reader
- [ ] Test with keyboard only

---

## 📊 **Analytics & Monitoring**

### **Events to Track**
- `report_form_opened`
- `report_form_abandoned` (which step)
- `location_detection_success/failure`
- `transport_type_selected`
- `severity_selected`
- `photo_uploaded`
- `report_submitted_success`
- `report_submitted_error`
- `form_validation_error` (which field)

### **Metrics**
- Average time to complete form
- Completion rate by step
- Photo upload rate
- Error rate by field
- Success rate vs failure rate

---

## 🚀 **Implementation Phases**

### **Phase 1: Core MVP** (Current Sprint)
**Goal**: Basic functional report submission
- [x] ReportDelayForm component (already exists)
- [ ] Update with new field requirements
- [ ] Location detection implementation:
  - [x] GPS auto-detection with fallback (Tauron Arena)
  - [ ] Manual location search input
  - [ ] Autosuggest dropdown with mock Kraków locations
  - [ ] Location suggestion selection
  - [ ] Display selected location
- [ ] Line number input (free text, no autocomplete yet)
- [ ] Duration picker
- [ ] API integration for submission
- [ ] Form state persistence (localStorage)
- [ ] Loading & success states
- [ ] Error handling & validation

**Deliverable**: Users can submit basic delay reports with all required fields

### **Phase 2: Enhanced Features** (Next Sprint)
**Goal**: Improve UX and add media upload
- [ ] Photo upload component
- [ ] Image compression
- [ ] Media upload API integration
- [ ] Autocomplete for line numbers
- [ ] Nearby transit stops suggestions
- [ ] Recent/frequent lines tracking
- [ ] Form analytics integration

**Deliverable**: Enhanced reporting experience with photos and smart suggestions

### **Phase 3: Advanced Features** (Future)
**Goal**: Polish and advanced functionality
- [ ] Video upload
- [ ] Voice notes
- [ ] Map-based location picker
- [ ] Offline mode with queue
- [ ] Transit stop favorites
- [ ] Pre-submit validation indicator

**Deliverable**: Feature-complete delay reporting system

---

## ✅ **Definition of Done**

A feature is considered complete when:
1. ✅ All unit tests pass
2. ✅ Integration tests pass
3. ✅ E2E tests pass
4. ✅ Code review approved
5. ✅ Tested on real mobile devices (iOS + Android)
6. ✅ Accessibility audit passed
7. ✅ Performance benchmarks met (< 3s form load)
8. ✅ Documentation updated
9. ✅ Analytics events implemented
10. ✅ Deployed to staging and verified

---

## 🤔 **Open Questions & Decisions Needed**

### **1. Location Detection** ✅ DECIDED
- **Decision**: Support BOTH GPS and manual input
  - Quick "Use My Location" button (GPS detection)
  - Manual text input with address autosuggest/search
  - GPS preferred but not required (fallback to manual)
  - Encourage GPS with benefits messaging ("More accurate reports earn more points!")
- **Status**: Approved

### **2. Anonymous Reporting**
- **Q**: Should users be able to report without logging in?
- **Recommendation**: Yes, but with limitations (no points, rate limiting, require CAPTCHA)

### **3. Photo Moderation**
- **Q**: Should photos be moderated before showing publicly?
- **Recommendation**: Phase 2 - Auto-scan for inappropriate content, manual review for flagged items

### **4. Duplicate Detection**
- **Q**: How to handle multiple reports for the same delay?
- **Recommendation**: 
  - Check for reports in same location + line + timeframe (10 min window)
  - Show "Someone already reported this - add your confirmation instead?"
  - Convert to upvote/verification instead of new report

### **5. Report Expiry**
- **Q**: When should reports auto-resolve?
- **Recommendation**: 
  - Minor: 30 minutes
  - Moderate: 2 hours
  - Severe: 4 hours
  - Or when explicitly marked resolved by users/system

### **6. Media Storage**
- **Q**: Where to store uploaded photos/videos?
- **Recommendation**: AWS S3 or CloudFlare R2 (cheaper egress)

---

## 📝 **Next Steps**

1. **Review & Approve** this plan
2. **Clarify open questions** and make decisions
3. **Create GitHub issues** for Phase 1 tasks
4. **Design mockups** for new form layout
5. **Begin implementation** of Phase 1

---

**Prepared by**: Cascade AI  
**Date**: 2025-10-04  
**Last Updated**: 2025-10-04
