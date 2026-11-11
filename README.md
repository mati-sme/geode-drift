# Geode Drift

A smooth 3D incremental for macOS (and the web). Tap a tiny space geode, build orbiting mining drones, dig through glowing crystal layers, Polish for Gems and go Supernova.

- **Play on the web:** https://mati-sme.github.io/geode-drift/
- **Mac app (Apple Silicon):** grab `GeodeDrift-mac-arm64.zip` from the latest GitHub Release, unzip, drag **Geode Drift.app** to Applications.

### First launch on macOS (the app isn't notarized)
Right-click the app → **Open** → **Open**. If macOS says it's "damaged", run once in Terminal:
```
xattr -cr "/Applications/Geode Drift.app"
```

## Dev
- `npm run build` → bundles `src/` into `docs/` (also the GitHub Pages site)
- `npm run sim` → headless pacing sim (`node sim/sim.mjs 6` for 6 hours)
- `npm run dist:mac` → arm64 `.app` (ad-hoc signed with rcodesign) zipped into `dist/`
