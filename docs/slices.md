# BisBench Implementation Slices

Implement these slices in order. Complete and verify one slice before starting the next.

Global rules for every coding agent:

- Read `docs/plan.md` and this file first.
- Implement only the assigned slice.
- Do not refactor unrelated files.
- Do not start a later slice.
- Do not modify model-generated game code except when adding a tiny test fixture.
- Run every verification command listed for the slice.
- Stop and report blockers instead of silently changing the architecture.

## Progress

- [ ] Slice 1: Project foundation
- [ ] Slice 2: Content contracts and run protocol
- [ ] Slice 3: Benchmark Dossier interface
- [ ] Slice 4: Sandboxed playable viewer
- [ ] Slice 5: Supporting pages and navigation
- [ ] Slice 6: Artifact validation and ingestion
- [ ] Slice 7: Real benchmark content
- [ ] Slice 8: Release hardening

## Slice 1: Project Foundation

Goal: create a working, tested React/TypeScript/Vite application shell without implementing product features.

Create:

- `package.json`
- `bun.lock`
- `index.html`
- `vite.config.ts`
- `tsconfig.json`
- `tsconfig.app.json`
- `eslint.config.js`
- `.gitignore`
- `src/main.tsx`
- `src/app/App.tsx`
- `src/app/routes.tsx`
- `src/styles/global.css`
- `src/test/setup.ts`
- one minimal application test

Requirements:

- Use Bun.
- Use React, TypeScript, Vite, React Router, Vitest, Testing Library, ESLint, and Prettier.
- Add scripts: `dev`, `build`, `typecheck`, `lint`, `format`, `format:check`, and `test`.
- Define placeholder routes for `/`, `/benchmarks`, `/models`, and `/method`.
- Use semantic placeholder content only. Do not design the final pages yet.
- Do not add Tailwind, a component library, a state-management library, a backend, or authentication.

Verify:

```bash
bun install
bun run typecheck
bun run lint
bun run test
bun run build
```

Done when:

- All commands pass.
- The app loads locally.
- Every placeholder route renders.
- No product feature from later slices is implemented.

## Slice 2: Content Contracts and Run Protocol

Depends on: Slice 1.

Goal: establish the immutable data contracts that all pages, validation, and tests consume.

Create:

- `src/content/types.ts`
- `src/content/schema.ts`
- `src/content/loadBenchmarks.ts`
- `src/content/pathSafety.ts`
- `content/benchmarks/endless-runner.json`
- `content/models/*.json`
- `content/prompts/endless-runner.md`
- `content/protocols/v1.md`
- fixture run notes under `content/run-notes/endless-runner/`
- schema and loader tests

Requirements:

- Implement the manifest contract from `docs/plan.md`.
- Replace the subjective two-value model taxonomy with factual fields:
  - provider
  - model identifier
  - exact version
  - access mode
  - weights availability
  - license when known
- Store attempt number, effort level, capture date, status, artifact path, preview path, and run-notes path.
- Define protocol v1:
  - exact prompt
  - starting files
  - allowed tools
  - generation time limit
  - retry and intervention policy
  - dependency policy
  - viewport
  - packaging requirements
  - selection rule
- Use fixture paths only. Do not add the real game artifacts yet.
- Build must fail with a useful message for invalid content.

Verify:

```bash
bun run typecheck
bun run lint
bun run test
bun run build
```

Done when:

- Valid fixture content loads through one shared schema.
- Invalid fields and unsafe paths fail tests.
- UI code will not need to parse JSON directly.

## Slice 3: Benchmark Dossier Interface

Depends on: Slice 2.

Goal: implement the approved Variant G page using static previews.

Visual reference:

`/Users/bishesha/.gstack/projects/BisBench/designs/homepage-20260628/revision-G-benchmark-dossier.png`

Create or modify:

- `src/pages/BenchmarkDossierPage.tsx`
- `src/components/SiteHeader.tsx`
- `src/components/BenchmarkMetadata.tsx`
- `src/components/PromptExcerpt.tsx`
- `src/components/OutputCard.tsx`
- `src/components/MethodologyStrip.tsx`
- component CSS files
- dossier component tests
- routing needed to render the featured benchmark at `/`

Requirements:

- Preserve the research-publication tone.
- Use warm white, black, hairline rules, and restrained purple.
- Use the real output previews as the dominant color.
- Show task ID, task title, exact-prompt excerpt, run facts, four outputs, model metadata, date, and status.
- Do not add scores, rankings, winner labels, marketing metrics, pricing, login, or upload UI.
- Desktop: metadata rail plus 2×2 output matrix.
- Tablet: metadata above a 2-column matrix.
- Mobile: single-column output list.
- Every output action must be keyboard accessible.

Verify:

```bash
bun run typecheck
bun run lint
bun run test
bun run build
```

Done when:

- Fixture content renders without hardcoded model cards.
- Desktop and mobile layouts match the approved direction.
- Loading, failed, and partial labels are covered by tests.

## Slice 4: Sandboxed Playable Viewer

Depends on: Slice 3.

Goal: safely launch a selected browser-ready artifact.

Create or modify:

- `src/pages/ArtifactViewerPage.tsx`
- `src/viewer/ArtifactFrame.tsx`
- `src/viewer/artifactUrl.ts`
- `src/viewer/viewerState.ts`
- viewer CSS
- viewer unit and component tests
- route `/benchmarks/:benchmarkSlug/runs/:runSlug`
- one harmless static artifact fixture

Requirements:

- Do not create the iframe until the visitor explicitly presses Play.
- iframe sandbox: `allow-scripts allow-pointer-lock`.
- Do not grant same-origin, forms, popups, top navigation, downloads, or storage permissions.
- Keep benchmark name, model name, loading state, failure state, reload, and exit controls outside the iframe.
- Provide a descriptive iframe title.
- Restore focus when exiting.
- Support fullscreen only if it does not weaken sandboxing.
- Test relative scripts and assets under the real sandbox behavior.

Verify:

```bash
bun run typecheck
bun run lint
bun run test
bun run build
```

Manual check:

- Open the fixture build.
- Use keyboard-only navigation to enter and exit it.
- Confirm the artifact cannot navigate or access the parent application.

## Slice 5: Supporting Pages and Navigation

Depends on: Slice 4.

Goal: make the small site complete without pretending it already has a large catalog.

Create:

- `src/pages/BenchmarksPage.tsx`
- `src/pages/ModelsPage.tsx`
- `src/pages/MethodPage.tsx`
- supporting components and tests

Requirements:

- Benchmarks page lists published manifests.
- Models page derives appearances from run data.
- Method page explains protocol, selection policy, limitations, artifact isolation, and what BisBench does not measure.
- Header navigation indicates the current page.
- Do not add search or filters for a one-benchmark catalog.
- Do not duplicate content-loader logic.

Verify:

```bash
bun run typecheck
bun run lint
bun run test
bun run build
```

## Slice 6: Artifact Validation and Ingestion

Depends on: Slice 2 and Slice 4.

Goal: provide an owner-only local command that validates and installs browser-ready ZIPs without executing them.

Create:

- `scripts/ingest/index.ts`
- `scripts/ingest/archiveValidation.ts`
- `scripts/ingest/filePolicy.ts`
- `scripts/ingest/installArtifact.ts`
- tests and malicious archive fixtures
- `ingest` package script

Requirements:

- Require root `index.html`.
- Reject `../`, absolute paths, symlinks, overwrite collisions, unsupported file types, archives over 25 MB, and extracted content over 100 MB.
- Never execute HTML, JavaScript, package scripts, or build commands.
- Copy preview and run notes into deterministic paths.
- Print the exact files changed.
- Fail atomically without leaving partial output.

Verify:

```bash
bun run typecheck
bun run lint
bun run test
```

Done when malicious fixtures prove every rejection path.

## Slice 7: Real Benchmark Content

Depends on: Slices 3, 4, and 6.

Goal: replace fixtures with the real endless-runner cohort.

Allowed changes:

- `content/**`
- `public/artifacts/endless-runner/**`
- `public/previews/endless-runner/**`

Requirements:

- Preserve each model’s output exactly.
- Record exact model version, attempt, effort level, date, protocol version, and status.
- Publish every attempt required by the selection policy.
- Include the exact shared prompt and factual run notes.
- Include four optimized previews with dimensions.
- Ensure every build works without external network access.

Verify:

```bash
bun run test
bun run build
```

Manual check every playable build.

## Slice 8: Release Hardening

Depends on: all prior slices.

Goal: make the first public release trustworthy and repeatable.

Create or modify:

- Playwright configuration and end-to-end tests
- accessibility checks
- deployment configuration
- security and caching headers
- `README.md`
- contributor/runbook documentation

Required end-to-end flows:

- Open the featured dossier.
- Read the exact prompt.
- Launch and exit each result.
- Recover from a broken artifact.
- Complete the flow by keyboard.
- Complete the flow at a mobile viewport.

Performance:

- No iframe loads on initial page render.
- Preview dimensions prevent layout shift.
- Initial application JavaScript stays below the target in `docs/plan.md`.

Final verification:

```bash
bun run format:check
bun run lint
bun run typecheck
bun run test
bun run test:e2e
bun run build
```

## Prompt Template for OpenCode

```text
Read docs/plan.md and docs/slices.md.

Implement Slice <NUMBER> only.

Rules:
- Do not begin later slices.
- Do not refactor unrelated files.
- Match existing style and the approved architecture.
- Run every verification command listed for this slice.
- If a required prerequisite is missing, stop and report it.
- When finished, report files changed, commands run, results, and remaining blockers.
```

## First Prompt

```text
Read docs/plan.md and docs/slices.md.

Implement Slice 1: Project Foundation only.

Do not implement the dossier UI, content schema, artifact viewer, ingestion command, or real benchmark data yet. Use Bun, React, TypeScript, Vite, React Router, Vitest, Testing Library, ESLint, and Prettier. Keep the shell minimal.

Run:
bun install
bun run typecheck
bun run lint
bun run test
bun run build

When finished, report files changed, command results, and blockers. Do not start Slice 2.
```
