#!/usr/bin/env bash
# Builds an unsigned-but-ad-hoc-signed arm64 Geode Drift.app on Linux and zips it (symlinks preserved).
set -euo pipefail
cd "$(dirname "$0")/.."
node build.mjs
npx electron-builder --mac dir --arm64
~/.local/bin/rcodesign sign "dist/mac-arm64/Geode Drift.app"
rm -f dist/GeodeDrift-mac-arm64.zip
(cd dist/mac-arm64 && python3 ../../build/zipapp.py "Geode Drift.app" ../GeodeDrift-mac-arm64.zip)
ls -la dist/GeodeDrift-mac-arm64.zip
