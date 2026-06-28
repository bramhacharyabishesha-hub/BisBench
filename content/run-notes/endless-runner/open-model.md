# Run notes — Mistral Coder / Endless Runner

**Status:** failed
**Attempt:** 1 of 3
**Effort level:** high
**Captured:** 2026-06-21
**Protocol:** v1

## What was sent

The exact prompt in `content/prompts/endless-runner.md`, with no additions or paraphrasing.

## What came back

The archive contains `index.html` but references a script that was not included. The game does not start in a browser with network disabled.

## Why failed

The output is not browser-ready: a required script is missing from the archive, so the game cannot run offline. Per protocol v1 section 9, the attempt is published as `failed` rather than discarded.

## Deviations

None to the prompt. The output fails the packaging requirement that all scripts be vendored into the archive.

## How it was verified

Opened in a current browser at 1280×720 with network disabled. The console reported the missing module and the game did not start.

## Selection note

Two further attempts also failed to produce a complete archive. Per the selection rule, the first attempt is published with this transparent note.
