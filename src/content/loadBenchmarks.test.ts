import { describe, it, expect } from "vitest";

import {
  getBenchmarkBySlug,
  getBenchmarks,
  getFeaturedBenchmark,
  getModelById,
  getModels,
  getRun,
  resolveRuns,
} from "./loadBenchmarks";

describe("fixture content loads through the schema", () => {
  it("loads at least one benchmark and four models", () => {
    expect(getBenchmarks().length).toBeGreaterThanOrEqual(1);
    expect(getModels().length).toBeGreaterThanOrEqual(4);
  });

  it("exposes the endless-runner benchmark", () => {
    const benchmark = getBenchmarkBySlug("endless-runner");
    expect(benchmark).toBeDefined();
    expect(benchmark?.title).toBe("Endless Runner");
    expect(benchmark?.runs).toHaveLength(4);
  });

  it("the featured benchmark is the first one and is non-empty", () => {
    const featured = getFeaturedBenchmark();
    expect(featured.runs.length).toBeGreaterThan(0);
  });

  it("every run references a known model", () => {
    for (const benchmark of getBenchmarks()) {
      for (const run of benchmark.runs) {
        const model = getModelById(run.modelId);
        expect(
          model,
          `run ${run.slug} -> modelId ${run.modelId}`,
        ).toBeDefined();
      }
    }
  });

  it("exercises playable, partial, and failed statuses in fixtures", () => {
    const benchmark = getBenchmarkBySlug("endless-runner");
    const statuses = benchmark?.runs.map((r) => r.status);
    expect(statuses).toEqual(
      expect.arrayContaining(["playable", "partial", "failed"]),
    );
  });

  it("resolveRuns joins each run with its resolved model", () => {
    const benchmark = getBenchmarkBySlug("endless-runner");
    const resolved = resolveRuns(benchmark!);
    expect(resolved).toHaveLength(benchmark!.runs.length);
    expect(resolved[0].model.id).toBe(resolved[0].modelId);
    expect(resolved[0].benchmarkSlug).toBe("endless-runner");
  });

  it("getRun returns a resolved run by slugs and undefined when missing", () => {
    const run = getRun("endless-runner", "fable-5");
    expect(run?.modelDisplayName).toBe("Fable 5");
    expect(run?.model.provider).toBe("HyperAgent");
    expect(getRun("endless-runner", "nope")).toBeUndefined();
    expect(getRun("nope", "fable-5")).toBeUndefined();
  });

  it("every manifest path is a safe relative path", () => {
    for (const benchmark of getBenchmarks()) {
      expect(benchmark.promptPath).toMatch(/^[A-Za-z0-9._-]+\.md$/);
      for (const run of benchmark.runs) {
        expect(run.artifactPath).toMatch(/\/$/);
        expect(run.previewImagePath).toMatch(/\.(webp|svg)$/);
        expect(run.runNotesPath).toMatch(/\.md$/);
      }
    }
  });
});
