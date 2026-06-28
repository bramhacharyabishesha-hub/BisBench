/**
 * Runtime content loader.
 *
 * Uses Vite's import.meta.glob to bundle every manifest as JSON, then runs
 * them through validateContentSet (schema + path safety + referential
 * integrity). Anything invalid throws at module load, which fails `vitest`.
 *
 * Build-time validation (for `vite build`) is handled by the Vite plugin in
 * vite/plugins/validateContent.ts, which reuses the same validateContentSet.
 *
 * UI code imports the typed accessors below and never touches raw JSON.
 *
 * Path bases:
 *   artifactPath     -> served from /artifacts/
 *   previewImagePath -> served from /previews/
 *   promptPath       -> content/prompts/
 *   runNotesPath     -> content/run-notes/
 */

import type { BenchmarkManifest, ModelManifest, ResolvedRun } from "./types";
import { validateContentSet } from "./validateContent";

const benchmarkModules = import.meta.glob("../../content/benchmarks/*.json", {
  eager: true,
  import: "default",
});

const modelModules = import.meta.glob("../../content/models/*.json", {
  eager: true,
  import: "default",
});

const toEntries = Object.entries.bind(null);

const { modelsById, benchmarksBySlug } = validateContentSet(
  toEntries(modelModules).map(([source, raw]) => ({ source, raw })),
  toEntries(benchmarkModules).map(([source, raw]) => ({ source, raw })),
);

export function getModels(): readonly ModelManifest[] {
  return [...modelsById.values()];
}

export function getModelById(id: string): ModelManifest | undefined {
  return modelsById.get(id);
}

export function getBenchmarks(): readonly BenchmarkManifest[] {
  return [...benchmarksBySlug.values()];
}

export function getBenchmarkBySlug(
  slug: string,
): BenchmarkManifest | undefined {
  return benchmarksBySlug.get(slug);
}

export function getFeaturedBenchmark(): BenchmarkManifest {
  if (benchmarksBySlug.size === 0) {
    throw new Error(
      "No benchmarks are published in content/benchmarks/. Add at least one benchmark manifest.",
    );
  }
  return getBenchmarks()[0];
}

export function getRun(
  benchmarkSlug: string,
  runSlug: string,
): ResolvedRun | undefined {
  const benchmark = benchmarksBySlug.get(benchmarkSlug);
  if (!benchmark) return undefined;
  const run = benchmark.runs.find((r) => r.slug === runSlug);
  if (!run) return undefined;
  const model = modelsById.get(run.modelId);
  if (!model) return undefined;
  return { ...run, benchmarkSlug, model };
}

export function resolveRuns(
  benchmark: BenchmarkManifest,
): readonly ResolvedRun[] {
  return benchmark.runs.map((run) => {
    const model = modelsById.get(run.modelId);
    if (!model) {
      throw new Error(
        `Benchmark "${benchmark.slug}" run "${run.slug}" references unknown modelId "${run.modelId}".`,
      );
    }
    return { ...run, benchmarkSlug: benchmark.slug, model };
  });
}
