# Geode Drift

A 3D story-driven mining adventure for macOS (and the web). The starship **Starling** crash-landed in the Geode Drift. Young miner **Pip**, robot buddy **Bolt** and **Captain Nova** need ore to rebuild the ship, find the Starheart and save their home planet Lumen.

- **Steer with WASD / arrow keys** (S dives faster, W brakes). Lasers auto-fire at the nearest rocks.
- **10 story chapters** with missions, character dialogue and rewards. The ship at your camp gets rebuilt part by part.
- **Modules:** Chain Lightning, Seeker Missiles, Ore Magnet, Drill Saw, Bubble Shield, with up to 4 loadout slots.
- **Rocks with personality:** iron, bomb rocks, time capsules, lost drones to rescue, crystal clusters, and Artifact Geodes holding 12 permanent artifacts.
- **Guardian fights** with 3 attack phases (shard rings, aimed volleys, a spiral storm). Dodge them!
- Combo multiplier, screen shake, a 60-node upgrade web, Supernova prestige, offline mining, and endless Deep Rift contracts after the story.

- **Play on the web:** https://mati-sme.github.io/geode-drift/
- **Mac app (Apple Silicon):** grab `GeodeDrift-mac-arm64.zip` from the latest GitHub Release, unzip, drag **Geode Drift.app** to Applications.

### First launch on macOS (the app isn't notarized)
Right-click the app → **Open** → **Open**. If macOS says it's "damaged", run once in Terminal:
```
xattr -cr "/Applications/Geode Drift.app"
```

## Dev
- `npm run build` → bundles `src/` into `docs/` (also the GitHub Pages site)
- `npm run sim` → headless pacing sim: an autopilot plays the story, claims chapters and goes Supernova (`node sim/sim.mjs 260`; output in `sim/pacing-v3-story-and-endless.txt`)
- `node sim/shots.mjs` → headless screenshots
- `npm run dist:mac` → arm64 `.app` (ad-hoc signed with rcodesign) zipped into `dist/`
