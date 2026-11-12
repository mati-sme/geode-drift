# Geode Drift

A 3D story-driven mining adventure for macOS (and the web). The starship **Starling** crash-landed in the Geode Drift. Young miner **Pip**, robot buddy **Bolt** and **Captain Nova** need ore to rebuild the ship, find the Starheart and save their home planet Lumen.

- **Steer with WASD / arrow keys** (S dives faster, W brakes). Lasers auto-fire at the nearest rocks.
- **10 story chapters** with missions, character dialogue and rewards. The ship at your camp gets rebuilt part by part.
- **Modules:** Chain Lightning, Seeker Missiles, Ore Magnet, Drill Saw, Bubble Shield, with up to 4 loadout slots.
- **Rocks with personality:** iron, bomb rocks, time capsules, lost drones to rescue, crystal clusters, and Artifact Geodes holding 12 permanent artifacts.
- **Guardian fights** with 3 attack phases (shard rings, aimed volleys, a spiral storm). Dodge them!
- Combo multiplier, screen shake, an 80-node upgrade web, Supernova prestige, offline mining.
- **v4: three Acts, 30 chapters, 5 worlds:** Geode Drift, Frostveil (ice moon), Emberforge (lava planet), Prisma Nebula and Void Core, each with its own ores, special rocks (frost, magma, prism, gravity wells), Guardians and crew member.
- **v4 long-term systems:** real-time Research Lab (keeps working offline), a crew you train with rescued drones, Constellations (a second prestige layer with a Star Chart tree), 59 achievements with permanent bonuses, daily contracts and a daily supply drop. Endless Deep Rift contracts after the story.
- v3 saves carry over automatically.

- **Play on the web:** https://mati-sme.github.io/geode-drift/
- **Mac app (Apple Silicon):** grab `GeodeDrift-mac-arm64.zip` from the latest GitHub Release, unzip, drag **Geode Drift.app** to Applications.

### First launch on macOS (the app isn't notarized)
Right-click the app → **Open** → **Open**. If macOS says it's "damaged", run once in Terminal:
```
xattr -cr "/Applications/Geode Drift.app"
```

## Dev
- `npm run build` → bundles `src/` into `docs/` (also the GitHub Pages site)
- `npm run sim` → headless pacing sim: an autopilot plays the story, claims chapters and goes Supernova over simulated days with offline gaps (`node sim/sim.mjs 9 80` = 9 days, two 80-minute sessions a day; output in `sim/pacing-v4-full-arc.txt`)
- `node sim/shots.mjs` / `node sim/shots4.mjs` → headless screenshots
- `npm run dist:mac` → arm64 `.app` (ad-hoc signed with rcodesign) zipped into `dist/`
