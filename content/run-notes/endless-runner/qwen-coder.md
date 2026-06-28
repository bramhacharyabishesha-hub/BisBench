# Run notes — Qwen3 Coder / Endless Runner

**Status:** partial
**Attempt:** 1 of 3
**Effort level:** high
**Captured:** 2026-06-21
**Protocol:** v1

## What was sent

The exact prompt in `content/prompts/endless-runner.md`, with no additions or paraphrasing.

## What came back

A static archive that loads and renders, but the game restarts by reloading the page rather than resetting state in place. Score and keyboard controls work; touch controls are missing.

## Why partial

The archive is browser-ready and runs offline, but it does not satisfy the "restart without reloading the page" and "touch controls" requirements. The result is published as partial rather than failed because the core loop is playable.

## Deviations

None to the prompt. The output itself omits two in-scope requirements, documented above.

## How it was verified

Opened in a current browser at 1280×720 with network disabled. The game loaded and the core loop ran; restart-via-reload and missing touch were confirmed.
