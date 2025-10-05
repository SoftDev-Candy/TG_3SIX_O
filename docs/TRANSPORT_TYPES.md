# Transport Types - City Configuration

## Kraków (Current Implementation)

### Active Transport Types
- **Bus** 🚌 - Fully functional
- **Tram** 🚋 - Fully functional  
- **Train** 🚆 - Fully functional

### Disabled Transport Types
- **Metro** 🚇 - Greyed out with message "Coming soon"
  - Kraków does not have a metro system
  - Reserved for future city expansions

### Removed Transport Types
- **Ferry** ⛴️ - Completely removed
  - Not applicable to Kraków (landlocked city)

## Future City Expansions

### Warsaw (Planned)
- Bus ✓
- Tram ✓
- Train ✓
- **Metro** ✓ (Enable - Warsaw has 2 metro lines)

### Other Polish Cities
- **Wrocław**: Bus, Tram, Train
- **Łódź**: Bus, Tram, Train
- **Gdańsk**: Bus, Tram, Train, Ferry (Baltic Sea port)

## Implementation Notes

**Frontend (`ReportDelayForm.tsx`)**:
- Disabled metro option:
  - Looks production-ready, not like a limitation
  - Hints at future expansion ("Coming soon")
  - Shows planning for continued development
  - Simple and professional messaging
- Ferry completely removed from options

**Types**:
- `TransportType = 'bus' | 'tram' | 'train' | 'metro'`
- Metro kept in type for future Warsaw expansion
- Ferry removed entirely
**Backend**:
- Accepts all 4 transport types (bus, tram, train, metro)
- Frontend prevents metro selection for Kraków
- Ready for city-specific validation in future

## City-Specific Features (Future)

```typescript
interface CityConfig {
  name: string;
  availableTransportTypes: TransportType[];
  hasMetro: boolean;
  hasFerry: boolean;
}

const cities: Record<string, CityConfig> = {
  krakow: {
    name: 'Kraków',
    availableTransportTypes: ['bus', 'tram', 'train'],
    hasMetro: false,
    hasFerry: false,
  },
  warsaw: {
    name: 'Warsaw',
    availableTransportTypes: ['bus', 'tram', 'train', 'metro'],
    hasMetro: true,
    hasFerry: false,
  },
};
```

---

**Last Updated**: 2025-10-05  
**Status**: Production-ready for Kraków hackathon demo
