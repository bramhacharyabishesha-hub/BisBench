/**
 * BisBench content contracts.
 *
 * Single source of truth for the shape of every manifest. Consumed by
 * validation (schema.ts), the build-time loader (loadBenchmarks.ts), page
 * rendering, and tests. UI code never parses JSON directly.
 *
 * Contract notes:
 * - The subjective two-value `modelClass` taxonomy from the original plan is
 *   replaced by factual model fields on ModelManifest (provider, identifier,
 *   version, accessMode, weightsAvailable, license).
 * - Run metadata (attempt, effortLevel, capturedAt, status, paths) is
 *   immutable per locked decision #5. A run snapshots a modelDisplayName so
 *   withdrawn models remain historically labeled.
 * - All path fields are relative POSIX strings (no leading slash, no `..`,
 *   no backslash). The loader maps each to its base directory.
 */

export type BenchmarkStatus = "playable" | "failed" | "partial";

export type ArtifactFormat = "browser-ready-static";

export type NetworkAccess = "none";

export interface ModelManifest {
  /** Stable slug referenced by runs via `modelId`. */
  readonly id: string;
  /** Organization that produces or hosts the model. */
  readonly provider: string;
  /** Model family / product identifier, e.g. "gpt-5.5", "claude-opus". */
  readonly identifier: string;
  /** Exact version snapshot, e.g. "2026-06-15", "2.5-coder-480b". */
  readonly version: string;
  /** How the model was accessed, e.g. "api", "open-weights", "local". */
  readonly accessMode: string;
  /** Whether model weights are publicly downloadable. */
  readonly weightsAvailable: boolean;
  /** License when known. Omit when unspecified. */
  readonly license?: string;
  /** Optional canonical homepage. */
  readonly homepage?: string;
}

export interface BenchmarkEnvironment {
  readonly artifactFormat: ArtifactFormat;
  readonly networkAccess: NetworkAccess;
  readonly notes: string;
}

export interface BenchmarkRun {
  /** Run slug, unique within its benchmark. */
  readonly slug: string;
  /** Reference to a ModelManifest id. */
  readonly modelId: string;
  /** Display name snapshot for historical labeling. */
  readonly modelDisplayName: string;
  /** Attempt number within the cohort (1-based). */
  readonly attempt: number;
  /** Effort level descriptor, e.g. "high", "low", or provider-specific. */
  readonly effortLevel?: string;
  /** Path to extracted artifact root, relative to /artifacts/. Must end in "/". */
  readonly artifactPath: string;
  /** Path to preview image, relative to /previews/. */
  readonly previewImagePath: string;
  /** Path to run notes markdown, relative to content/run-notes/. */
  readonly runNotesPath: string;
  /** ISO date the run was captured. */
  readonly capturedAt: string;
  readonly status: BenchmarkStatus;
  /** Protocol version this run followed, e.g. "v1". */
  readonly protocolVersion: string;
}

export interface BenchmarkManifest {
  readonly slug: string;
  readonly title: string;
  readonly summary: string;
  /** Path to the prompt markdown, relative to content/prompts/. */
  readonly promptPath: string;
  /** ISO date the benchmark was published. */
  readonly publishedAt: string;
  readonly environment: BenchmarkEnvironment;
  readonly runs: readonly BenchmarkRun[];
}

/**
 * A run joined with its resolved model. Convenience shape for UI that wants
 * both in one place without a second lookup.
 */
export interface ResolvedRun extends BenchmarkRun {
  readonly benchmarkSlug: string;
  readonly model: ModelManifest;
}
