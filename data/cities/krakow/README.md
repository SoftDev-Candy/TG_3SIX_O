# Kraków Transit Data

This directory contains transit network data for Kraków, Poland.

## Files

- **krakow-tram.json** - All 22 tram lines with realistic street-following paths
- **krakow-bus.json** - Major bus routes (10 key lines)

## Structure

Each file follows the GeoJSON FeatureCollection format:

```json
{
  "type": "FeatureCollection",
  "metadata": {
    "city": "Kraków",
    "transportType": "tram" | "bus",
    "routeCount": number
  },
  "routes": [...]
}
```

## Routes Include

### Tram Lines (22 total)
Lines: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 14, 17, 18, 19, 20, 21, 22, 24, 50, 52

### Bus Routes (10 major)
- **52** - Krowodrza Górka ↔ Borek Fałęcki
- **130** - Plac Inwalidów ↔ Witkowice (via Tauron Arena)
- **139** - Dworzec Główny ↔ Wieliczka
- **152** - Dworzec Główny ↔ Balice Airport
- **173** - Os. Piastów ↔ AGH University
- **194** - Salwator ↔ Bieńczyce
- **208** - Dworzec Główny ↔ Nowa Huta
- **229** - Borek Fałęcki ↔ Kurdwanów P+R
- **501** - Nowa Huta ↔ Skawina (Night Bus)
- **902** - Airport Express

## Path Generation

All paths are generated using OSRM (Open Source Routing Machine) to follow actual streets.

To regenerate paths:
```bash
npx tsx scripts/generate-realistic-paths.ts
```

## Usage

Frontend loads both files and merges them for map visualization.
