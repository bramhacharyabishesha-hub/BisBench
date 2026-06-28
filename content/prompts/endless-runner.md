# Endless Runner — Shared Prompt

> This is the exact prompt every model received for the Endless Runner benchmark. Protocol v1 governs starting files, tools, time budget, retry policy, and packaging.

Build an endless runner game that runs in a browser with no backend and no external network access.

## Requirements

- Single-player, runs entirely in the browser.
- No server, no API calls, no external assets loaded at runtime. All scripts, textures, fonts, and audio must be bundled inside the archive.
- Entry point is `index.html` at the archive root.
- Keyboard and touch controls.
- A score that increases the longer the player survives.
- Game-over and restart without reloading the page.
- Works in a current Chrome or Firefox at a 1280×720 viewport.

## Deliverable

A single ZIP archive containing `index.html` and every asset the game needs. No build step will be run. No package will be installed. The archive is extracted and served statically as-is.

## Out of scope

- No accounts, no leaderboards, no telemetry.
- No framework is required; use whatever runs in a static browser context.
- Do not rely on a package manager at runtime.
