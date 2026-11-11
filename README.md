# Geode Drift

A 3D run-based mining incremental for macOS (and the web). Launch your drill rig into an asteroid shaft for a short timed dive: it drills and lasers rocks by itself. Spend the ore on a big branching upgrade web, break each zone's Guardian to reach new ores, dive deeper every run, then go Supernova for permanent Stardust.

- **Play on the web:** https://mati-sme.github.io/geode-drift/
- **Mac app (Apple Silicon):** grab `GeodeDrift-mac-arm64.zip` from the latest GitHub Release, unzip, drag **Geode Drift.app** to Applications.

### First launch on macOS (the app isn't notarized)
Right-click the app → **Open** → **Open**. If macOS says it's "damaged", run once in Terminal:
```
xattr -cr "/Applications/Geode Drift.app"
```

## Dev
- `npm run build` → bundles `src/` into `docs/` (also the GitHub Pages site)
- `npm run sim` → headless pacing sim (`node sim/sim.mjs 60` = 60 runs; `node sim/sim.mjs 90 25` = with Supernova at 25 stardust)
- `npm run dist:mac` → arm64 `.app` (ad-hoc signed with rcodesign) zipped into `dist/`
