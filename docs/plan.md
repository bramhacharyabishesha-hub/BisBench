<!-- /autoplan restore point: /Users/bishesha/.gstack/projects/BisBench/main-autoplan-restore-20260628-114304.md -->

# BisBench Implementation Plan

Status: APPROVED FOR SLICED IMPLEMENTATION  
Date: 2026-06-28  
Branch: `main`  
Repository state: empty repository, no initial commit  
Primary implementation agent: GLM 5.2 through OpenCode terminals

## Product Definition

BisBench is a public, read-only benchmark for coding models. Instead of reducing model performance to leaderboard numbers, it publishes the exact prompt and lets visitors inspect and run the software each model produced.

The first benchmark is:

> Build an endless runner.

The first release contains four owner-curated model outputs. Visitors can inspect the common prompt, compare screenshots, open each browser-ready build, and read how the run was produced.

## Approved Design Direction

Approved direction: **Variant G — Benchmark Dossier**

Mockup:

`/Users/bishesha/.gstack/projects/BisBench/designs/homepage-20260628/revision-G-benchmark-dossier.png`

Design principles:

- Research publication, not SaaS dashboard.
- Outputs are the benchmark.
- White or warm-white background, black typography, hairline rules, restrained purple accent.
- Real screenshots provide nearly all strong color.
- Exact prompt, run facts, dates, model class, and methodology remain visible.
- No numeric ranking or aggregate score in v1.
- Inspired by [DeepSWE](https://deepswe.datacurve.ai/) in rigor and restraint, without copying its logo, brand assets, chart, page structure, or visual identity.

## Product Premises

These require confirmation before implementation:

1. A playable artifact communicates coding-model capability better than a single aggregate score for visually inspectable tasks.
2. V1 should prioritize one excellent benchmark with four real outputs over a broad catalog of shallow examples.
3. Only the repository owner publishes runs. Public uploads, accounts, comments, voting, and live model execution are out of scope.
4. Every model receives the same prompt and packaging requirements. Any deviations are disclosed in run notes.
5. Model output is untrusted code even when owner-curated, so it must run inside a restrictive browser sandbox.
6. V1 can store manifests, screenshots, prompts, and extracted static builds in the repository. External object storage is deferred until artifact volume makes repository storage impractical.

## Goals

- Make the difference between four model outputs visible within 10 seconds.
- Let a visitor launch any result within two interactions.
- Publish the exact prompt and run conditions for every benchmark.
- Preserve each submitted output as an archived, browser-ready artifact.
- Make adding a benchmark deterministic enough that another coding agent can follow the documented workflow.
- Produce a static deployment with no database, authentication service, or server runtime.

## Non-Goals

- Public submissions.
- User accounts or owner login UI.
- Live calls to frontier or open-weight models.
- Numeric scoring, ranking, voting, or a winner label.
- Automated gameplay evaluation.
- Installing dependencies or executing build scripts from uploaded model projects.
- Supporting arbitrary server-side applications.
- A generalized benchmark authoring platform.
- Payments, subscriptions, or monetization in v1.

## Users and Core Jobs

### Visitor

Wants to:

- Understand the benchmark task.
- See which models participated.
- Compare visible output differences.
- Launch a result and interact with it.
- Verify that each model received the same prompt.
- Understand how results were collected.

### Repository Owner

Wants to:

- Add a model and its browser-ready build.
- Add or update screenshots.
- Publish prompt and run notes.
- Validate that an artifact is safe to archive and correctly referenced.
- Deploy the updated static site.

## Information Architecture

### `/`

The approved Benchmark Dossier page for the featured benchmark.

Content order:

1. Compact BisBench header and navigation.
2. Positioning statement: “Outputs are the benchmark.”
3. Benchmark identity and exact task title.
4. Run facts and exact-prompt excerpt.
5. Four model-output previews.
6. Links to launch each playable build.
7. Methodology strip.

### `/benchmarks`

An index of all published benchmarks. V1 contains one item but the data model supports more.

### `/benchmarks/:benchmarkSlug`

The full dossier for a benchmark. The home page may render the featured benchmark through the same page component.

### `/models`

A compact index of models present in published runs, including model class and linked benchmark appearances.

### `/method`

Explains prompt equality, run capture, packaging requirements, artifact isolation, known limitations, and what BisBench does not measure.

### `/artifacts/:benchmarkSlug/:runSlug/`

Static extracted model output. This path is loaded only inside the sandboxed artifact viewer.

## Technical Approach

### Application

- React and TypeScript.
- Vite for local development and static production builds.
- React Router for explicit static routes.
- CSS Modules or plain component-scoped CSS. Do not add a component framework for four pages.
- No database, API server, authentication, state-management library, or runtime CMS.

### Content

Repository-managed JSON manifests:

```text
content/
  benchmarks/
    endless-runner.json
  models/
    gpt-5-5.json
    claude.json
    qwen-coder.json
    open-model.json
```

Static prompts and run notes:

```text
content/
  prompts/
    endless-runner.md
  run-notes/
    endless-runner/
      gpt-5-5.md
      claude.md
      qwen-coder.md
      open-model.md
```

Static artifacts:

```text
public/
  artifacts/
    endless-runner/
      gpt-5-5/
        index.html
        ...
      claude/
        index.html
        ...
  previews/
    endless-runner/
      gpt-5-5.webp
      ...
```

### Manifest Contract

```ts
type ModelClass = "frontier" | "open-weights";

interface BenchmarkManifest {
  slug: string;
  title: string;
  summary: string;
  promptPath: string;
  publishedAt: string;
  environment: {
    artifactFormat: "browser-ready-static";
    networkAccess: "none";
    notes: string;
  };
  runs: BenchmarkRun[];
}

interface BenchmarkRun {
  slug: string;
  modelId: string;
  modelDisplayName: string;
  modelClass: ModelClass;
  modelVersion: string;
  effortLevel?: string;
  artifactPath: string;
  previewImagePath: string;
  runNotesPath: string;
  capturedAt: string;
  status: "playable" | "failed" | "partial";
}
```

The schema must be implemented once and used by validation, page rendering, and tests.

## Artifact Contract

Each model result is provided as a browser-ready ZIP:

```text
submission.zip
  index.html
  game.js
  assets/
  vendor/
```

Rules:

- `index.html` is required at the archive root.
- All scripts, Three.js files, textures, fonts, audio, and other assets must be included.
- No external network dependency is allowed at runtime.
- No package installation or build step occurs inside BisBench.
- No absolute filesystem paths.
- No symlinks.
- No path traversal entries such as `../`.
- Archive and extracted-size limits are enforced.
- Only browser-readable static files are accepted.

## Owner Ingestion Workflow

Add a local command:

```bash
bun run ingest -- \
  --benchmark endless-runner \
  --model gpt-5-5 \
  --zip ./incoming/gpt-5-5.zip \
  --preview ./incoming/gpt-5-5.webp \
  --notes ./incoming/gpt-5-5.md
```

The command:

1. Validates the benchmark and model IDs.
2. Rejects unsafe ZIP paths and symlinks.
3. Enforces archive and extracted-size limits.
4. Requires root `index.html`.
5. Rejects unsupported file types.
6. Extracts into the deterministic artifact directory.
7. Copies the preview and notes.
8. Updates or verifies the manifest entry.
9. Prints the exact files changed and the verification command.

The command never executes artifact code or package scripts.

## Artifact Isolation

The playable result is untrusted model-generated HTML and JavaScript.

Viewer requirements:

- Render inside an `iframe`.
- Use `sandbox="allow-scripts allow-pointer-lock"`.
- Do not use `allow-same-origin`, forms, popups, top navigation, downloads, or storage permissions.
- Add an explicit fullscreen permission only if required by the selected UX.
- Lazy-load the iframe only after the visitor chooses to play.
- Show a static preview before loading.
- Provide a visible “Exit build” control outside the iframe.
- Display a failure state if the artifact does not load.
- Document that client-side sandboxing reduces risk but does not make arbitrary code trustworthy.

Before implementation, verify that module scripts and relative static assets work under the chosen sandbox and static host. If they do not, serve artifacts from a separate origin with explicit CORS headers.

## UI Specification

### Header

- Compact BisBench mark and wordmark.
- Navigation: Benchmarks, Models, Method, GitHub.
- No login or upload action.

### Benchmark Dossier

- Serif statement: “Outputs are the benchmark.”
- Supporting line: “Compare coding models through the software they actually produce.”
- Left metadata rail:
  - Benchmark ID.
  - Task title.
  - Model count.
  - Shared prompt.
  - Browser-ready build note.
  - Exact prompt excerpt.
  - Run facts.
- Right output matrix:
  - Four previews.
  - Model display name.
  - Model class.
  - Capture date.
  - “Open playable build” action.
- Bottom methodology strip:
  - Prompt.
  - Artifacts.
  - Run notes.
  - Source files.

### Playable Viewer

- Opens as a dedicated route or full-page layer, not a tiny modal.
- Keeps model name, benchmark name, and exit control outside the artifact frame.
- Includes loading, failure, partial-result, and unsupported-device states.
- Keyboard focus enters the artifact only after explicit visitor action.

### Responsive Behavior

- Desktop: metadata rail plus 2×2 output matrix.
- Tablet: metadata above a 2-column matrix.
- Mobile: single-column output list; exact prompt collapsed behind a visible disclosure; playable viewer uses the full viewport.
- Minimum touch target: 44×44 CSS pixels.
- No critical interaction depends on hover.

## Visual Tokens

These are initial implementation values, not a new design system:

```css
:root {
  --paper: #f7f6f2;
  --ink: #111111;
  --muted: #6f6d68;
  --rule: #d7d4cd;
  --accent: #6f3fd6;
  --focus: #4b22a8;
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-6: 1.5rem;
  --space-8: 2rem;
  --space-12: 3rem;
}
```

Typography:

- Display: a self-hosted or system-available editorial serif with a documented fallback.
- Interface: a neutral sans-serif system stack.
- Metadata: a monospace system stack.
- Do not block v1 on paid fonts.

## Accessibility

- Semantic headings and landmarks.
- Every artifact preview has meaningful alternative text.
- Visible keyboard focus.
- Keyboard-operable navigation and viewer controls.
- Reduced-motion support.
- Color contrast meets WCAG AA.
- Model class is communicated in text, not only color.
- iframe has a descriptive `title`.
- Loading and failure messages use an announced live region.

## States and Failure Handling

| State | Visitor experience | Required behavior |
|---|---|---|
| Manifest missing | Build-time failure | Stop the build with file and field information |
| Invalid run | Build-time failure | Identify benchmark, run, and invalid field |
| Preview missing | Build-time failure | Do not publish an invisible run |
| Artifact missing | Build-time failure | Do not emit a broken play link |
| Artifact loading | Viewer status | Keep preview visible and announce loading |
| Artifact runtime error | Viewer failure panel | Offer exit, reload, and run-notes links |
| Failed model result | Dossier entry | Publish as failed only with transparent run notes |
| Partial model result | Dossier entry | Label partial and explain the limitation |
| Mobile incompatibility | Viewer notice | Explain controls and allow exit without trapping focus |

## Security Requirements

- Treat manifests, Markdown, ZIP entries, and artifact files as untrusted input.
- Render Markdown without raw HTML.
- Validate every manifest against the shared schema during build.
- Protect ingestion from ZIP-slip, symlinks, decompression bombs, and overwrite collisions.
- Never evaluate artifact JavaScript during ingestion, testing, or screenshot generation.
- Keep artifact iframe permissions minimal.
- Add a restrictive Content Security Policy for the main application.
- Do not expose environment variables to artifact content.
- Do not place secrets in the static application.

## Performance Requirements

- Initial page must not load playable iframes.
- Preview images use WebP or AVIF with dimensions and responsive sources.
- Target initial JavaScript under 150 KB compressed, excluding artifact code.
- Lazy-load non-visible previews.
- Avoid layout shift by reserving preview aspect ratios.
- Cache immutable artifact files with content hashes when practical.
- Keep the first dossier usable on a mid-range mobile device.

## Testing Strategy

### Unit

- Manifest schema accepts valid data and rejects every invalid required field.
- ZIP validator rejects traversal, symlinks, missing `index.html`, oversized archives, and unsupported files.
- Path builders produce deterministic safe paths.
- Model-class labels and status labels render correctly.

### Component

- Dossier renders four runs from fixture content.
- Loading, failed, and partial states are visible.
- Viewer does not create an iframe before explicit play.
- iframe sandbox omits prohibited permissions.
- Mobile prompt disclosure remains keyboard accessible.

### End-to-End

- Visitor opens the featured benchmark.
- Visitor reads the exact prompt.
- Visitor opens each playable result.
- Visitor exits the playable viewer.
- Broken artifact produces a recoverable failure state.
- Keyboard-only visitor completes the same flow.
- Mobile viewport renders a single-column dossier.

### Build Verification

```bash
bun run format:check
bun run lint
bun run typecheck
bun run test
bun run test:e2e
bun run build
```

## Deployment

- Produce a static `dist/` directory.
- Deploy from the default branch after checks pass.
- Configure SPA route fallback only if required by the router strategy.
- Configure security and caching headers in host-native configuration.
- Do not choose a paid service or external database for v1.
- Validate iframe sandbox behavior on the real deployment before publishing.

## Proposed Repository Layout

```text
docs/
  plan.md
  slices.md
content/
  benchmarks/
  models/
  prompts/
  run-notes/
public/
  artifacts/
  previews/
scripts/
  ingest/
src/
  app/
  components/
  content/
  pages/
  styles/
  viewer/
tests/
  e2e/
  fixtures/
```

## Implementation Boundaries for OpenCode Agents

- One agent claims one slice at a time.
- A slice lists all files it may modify.
- No two active slices own the same file.
- Shared contracts and schemas land before consumer slices.
- Every slice begins from a passing default branch and ends with its verification commands passing.
- Agents must not refactor outside their owned files.
- If a slice discovers a contract change, stop and update the plan before editing dependent slices.
- Generated model artifacts are data. Agents must not “improve” their game code.

## Success Criteria

- The first dossier shows four clearly labeled model outputs.
- Every output uses the same published prompt.
- Each playable artifact launches without loading external network resources.
- Visitors can inspect prompt, model class, capture date, run notes, and methodology.
- No public write path exists.
- Main-site code cannot be accessed from artifact code through the configured sandbox.
- Desktop and mobile end-to-end flows pass.
- A new benchmark can be added through the documented owner workflow without editing application components.

## Deferred

- External object storage and separate artifact origin.
- Automated screenshot capture.
- Video previews.
- Public API.
- Search and filtering across many benchmarks.
- Numeric or human evaluation.
- Cost and token metadata.
- Live model runs.
- Commercial features.

## Locked Implementation Decisions

1. Store the first four browser-ready builds in the repository. Enforce a 25 MB archive limit and 100 MB extracted limit per build. Revisit external storage before adding the second benchmark if repository growth is already painful.
2. Use React Router with explicit clean routes. The deployment must support a static route fallback.
3. Build the dossier and viewer before ingestion automation. The first real artifacts may be placed manually, but the validator must land before the project is considered complete.
4. Use a dedicated viewer route: `/benchmarks/:benchmarkSlug/runs/:runSlug`.
5. Treat model identifier, exact version, effort level, capture date, and attempt number as immutable run metadata. Withdrawn or unavailable models remain historically labeled rather than renamed.
6. Describe v1 as a reproducible playable-artifact benchmark. It complements quantitative leaderboards; it does not claim that visual output alone proves overall model quality.
7. Freeze a versioned run protocol before publishing the first comparison. “Same prompt” is insufficient without the same starting files, tools, time budget, retry policy, intervention policy, viewport, and packaging requirements.
8. Publish every attempted run in the cohort or disclose a mechanical predeclared selection rule. Do not silently cherry-pick the best output.

<!-- AUTONOMOUS DECISION LOG -->
## Decision Audit Trail

| # | Phase | Decision | Classification | Principle | Rationale | Rejected |
|---|---|---|---|---|---|---|
