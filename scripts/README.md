# Scripts

## generate-realistic-paths.ts

Generates realistic street-following paths for transit routes in `krakow.json`.

### What it does

**Hybrid approach:**
- **Trams & Buses**: Uses OSRM routing API (follows streets)
- **Trains**: Uses Overpass API (actual railway tracks from OpenStreetMap)

### How to run

```bash
# From project root
npx tsx scripts/generate-realistic-paths.ts
```

### Prerequisites

Node.js and `tsx` (should already be installed in frontend):

```bash
npm install -g tsx
```

### What happens

1. Reads `/data/krakow.json`
2. For each route:
   - Trams/Buses → Queries OSRM with stop coordinates
   - Trains → Queries Overpass API for railway tracks
3. Replaces straight-line paths with realistic street-following coordinates
4. Saves updated `krakow.json`

### Output

```
🚀 Generating realistic transit route paths...

Found 7 routes to process

════════════════════════════════════════════════════════════

📍 Processing TRAM Line 52
   Os. Piastów - Czerwone Maki P+R
   Stops: 7
    Fetching OSRM route...
    ✓ Got 287 coordinate points
   📊 Path updated: 10 → 287 points (+277)
   ✅ Success: Realistic street-following path generated

... (repeats for all routes)

════════════════════════════════════════════════════════════

📊 Summary:
   ✅ Realistic paths: 6
   ⚠️  Fallback paths: 1
   📁 Total routes: 7

💾 Saving updated krakow.json...
✅ Done! krakow.json has been updated with realistic paths.
```

### Expected Results

- **Before**: 7-10 coordinate points per route (straight lines)
- **After**: 100-300+ coordinate points per route (follows streets!)

### Troubleshooting

**OSRM API errors:**
- Script automatically falls back to straight lines
- Public API may have rate limits - script waits 1.5s between requests

**Overpass API timeout:**
- Railway queries can be slow
- Script falls back to OSRM if Overpass fails

### Run it once

You only need to run this **once**. The generated paths are saved to `krakow.json` and committed to git.

To regenerate (if you add new routes):
```bash
npx tsx scripts/generate-realistic-paths.ts
```
