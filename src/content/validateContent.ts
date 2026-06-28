/**
 * Shared content orchestration used by both:
 *   - the runtime loader (loadBenchmarks.ts, via import.meta.glob), and
 *   - the build-time Vite plugin (vite/plugins/validateContent.ts, via fs).
 *
 * Given raw manifest entries, this runs schema validation, path-safety checks,
 * duplicate-id detection, and run -> model referential integrity. Any failure
 * throws an Error with the offending source file and field path, which fails
 * both `vite build` (via the plugin) and `vitest` (via the loader).
 */

import type { BenchmarkManifest, ModelManifest } from "./types";
import { isSafeContentPath } from "./pathSafety";
import { parseBenchmarkManifest, parseModelManifest } from "./schema";

export interface RawEntry {
  readonly source: string;
  readonly raw: unknown;
}

export interface ValidatedContent {
  readonly modelsById: Map<string, ModelManifest>;
  readonly benchmarksBySlug: Map<string, BenchmarkManifest>;
}

function checkPath(path: string, field: string, source: string): void {
  const check = isSafeContentPath(path);
  if (!check.ok) {
    throw new Error(`${source}: ${field}: ${check.error}`);
  }
}

export function validateContentSet(
  models: readonly RawEntry[],
  benchmarks: readonly RawEntry[],
): ValidatedContent {
  const modelsById = new Map<string, ModelManifest>();
  for (const { source, raw } of models) {
    const model = parseModelManifest(raw, source);
    if (modelsById.has(model.id)) {
      throw new Error(
        `Duplicate model id "${model.id}" in ${source}; another model file already uses it.`,
      );
    }
    modelsById.set(model.id, model);
  }

  const benchmarksBySlug = new Map<string, BenchmarkManifest>();
  for (const { source, raw } of benchmarks) {
    const benchmark = parseBenchmarkManifest(raw, source);
    if (benchmarksBySlug.has(benchmark.slug)) {
      throw new Error(
        `Duplicate benchmark slug "${benchmark.slug}" in ${source}; another benchmark already uses it.`,
      );
    }
    checkPath(benchmark.promptPath, "promptPath", source);
    for (const run of benchmark.runs) {
      checkPath(run.artifactPath, `run "${run.slug}".artifactPath`, source);
      checkPath(
        run.previewImagePath,
        `run "${run.slug}".previewImagePath`,
        source,
      );
      checkPath(run.runNotesPath, `run "${run.slug}".runNotesPath`, source);
      const model = modelsById.get(run.modelId);
      if (!model) {
        throw new Error(
          `${source}: run "${run.slug}" references unknown modelId "${run.modelId}". Known models: ${[...modelsById.keys()].join(", ") || "(none)"}.`,
        );
      }
    }
    benchmarksBySlug.set(benchmark.slug, benchmark);
  }

  return { modelsById, benchmarksBySlug };
}
