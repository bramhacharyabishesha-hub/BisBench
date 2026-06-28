# BisBench

A public, read-only benchmark for coding models. Instead of reducing model performance to leaderboard numbers, BisBench publishes the exact prompt and lets visitors inspect and run the software each model produced.

**Outputs are the benchmark.**

## Quick start

```bash
bun install
bun run dev
```

The app loads at `http://localhost:5173`.

## Scripts

| Command | Description |
|---|---|
| `bun run dev` | Start the Vite dev server |
| `bun run build` | Type-check and build the static site to `dist/` |
| `bun run typecheck` | Run TypeScript type checking |
| `bun run lint` | Run ESLint |
| `bun run test` | Run Vitest unit and component tests |
| `bun run format` | Format all files with Prettier |
| `bun run format:check` | Check formatting without writing |
| `bun run ingest` | Validate and install a model artifact (see below) |

## Project structure

```
content/          JSON manifests, prompts, run notes, protocols
public/
  artifacts/      Extracted model builds (served statically)
  previews/       Screenshot previews
  _headers        Netlify security + caching headers
  _redirects      Netlify SPA fallback
src/
  app/            App shell and routes
  components/     Reusable UI components
  content/        Manifest types, schema, loader
  pages/          Route-level pages
  viewer/         Sandboxed iframe viewer
  styles/         Global CSS
  utils/          Shared utilities
scripts/
  ingest/         Artifact ingestion command
vite/
  plugins/        Build-time content validation plugin
```

## Adding a model output

Place the model's browser-ready ZIP, a preview screenshot, and run notes in an `incoming/` directory, then run:

```bash
bun run ingest -- \
  --benchmark endless-runner \
  --model gpt-5-5 \
  --zip ./incoming/gpt-5-5.zip \
  --preview ./incoming/gpt-5-5.webp \
  --notes ./incoming/gpt-5-5.md
```

The command validates the archive (rejects symlinks, traversal, oversized archives, unsupported files, missing `index.html`), extracts it to `public/artifacts/<benchmark>/<model>/`, copies the preview and notes, and prints the files changed.

## Deployment

The site is a static build deployed to Netlify.

- Build command: `bun run build`
- Publish directory: `dist/`
- SPA fallback: `public/_redirects` handles client-side routing
- Security headers: `public/_headers` sets CSP, HSTS, and caching

## Security

- Model output is untrusted code. It runs inside a sandboxed iframe with `sandbox="allow-scripts allow-pointer-lock"` — no same-origin, forms, popups, top-navigation, downloads, or storage access.
- The iframe is only created after a visitor explicitly presses Play.
- Ingestion never executes artifact HTML, JavaScript, or build scripts.
- All manifest paths are validated against traversal attacks.
- Content manifests are schema-validated at build time; invalid content fails the build.

## License

See the repository for license information.
