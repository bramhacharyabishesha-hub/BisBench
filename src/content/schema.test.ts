import { describe, it, expect } from "vitest";

import {
  parseBenchmarkManifest,
  parseModelManifest,
  validateBenchmarkManifest,
  validateBenchmarkRun,
  validateModelManifest,
} from "./schema";

function validRun() {
  return {
    slug: "gpt-5-5",
    modelId: "gpt-5-5",
    modelDisplayName: "GPT-5.5",
    attempt: 1,
    effortLevel: "high",
    artifactPath: "endless-runner/gpt-5-5/",
    previewImagePath: "endless-runner/gpt-5-5.webp",
    runNotesPath: "endless-runner/gpt-5-5.md",
    capturedAt: "2026-06-20",
    status: "playable",
    protocolVersion: "v1",
  };
}

function validBenchmark() {
  return {
    slug: "endless-runner",
    title: "Endless Runner",
    summary: "Build an endless runner.",
    promptPath: "endless-runner.md",
    publishedAt: "2026-06-28",
    environment: {
      artifactFormat: "browser-ready-static",
      networkAccess: "none",
      notes: "No runtime network.",
    },
    runs: [validRun()],
  };
}

function validModel() {
  return {
    id: "gpt-5-5",
    provider: "OpenAI",
    identifier: "gpt-5.5",
    version: "2026-06-15",
    accessMode: "api",
    weightsAvailable: false,
  };
}

describe("validateModelManifest", () => {
  it("accepts a valid model", () => {
    const result = validateModelManifest(validModel());
    expect(result.ok).toBe(true);
    expect(result.value?.id).toBe("gpt-5-5");
    expect(result.value?.license).toBeUndefined();
  });

  it("accepts optional license and homepage", () => {
    const result = validateModelManifest({
      ...validModel(),
      license: "Apache-2.0",
      homepage: "https://openai.com",
    });
    expect(result.ok).toBe(true);
    expect(result.value?.license).toBe("Apache-2.0");
  });

  it("rejects a non-object", () => {
    const result = validateModelManifest("nope");
    expect(result.ok).toBe(false);
    expect(result.errors[0]).toMatch(/expected an object/);
  });

  it("rejects missing required fields and a bad weightsAvailable type at once", () => {
    const result = validateModelManifest({
      id: "",
      provider: 5,
      identifier: undefined,
      version: null,
      accessMode: "api",
      weightsAvailable: "no",
    });
    expect(result.ok).toBe(false);
    expect(result.errors).toContain("model.id must be a non-empty string");
    expect(result.errors).toContain(
      "model.provider must be a non-empty string",
    );
    expect(result.errors).toContain(
      "model.identifier must be a non-empty string",
    );
    expect(result.errors).toContain("model.version must be a non-empty string");
    expect(result.errors).toContain("model.weightsAvailable must be a boolean");
  });

  it("rejects an empty optional license string", () => {
    const result = validateModelManifest({ ...validModel(), license: "   " });
    expect(result.ok).toBe(false);
    expect(result.errors.some((e) => e.includes("license"))).toBe(true);
  });
});

describe("validateBenchmarkRun", () => {
  it("accepts a valid run", () => {
    const { value, errors } = validateBenchmarkRun(validRun(), "run");
    expect(errors).toHaveLength(0);
    expect(value?.slug).toBe("gpt-5-5");
    expect(value?.effortLevel).toBe("high");
  });

  it("accepts a run without optional effortLevel", () => {
    const run = { ...validRun(), effortLevel: undefined };
    const { value, errors } = validateBenchmarkRun(run, "run");
    expect(errors).toHaveLength(0);
    expect(value?.effortLevel).toBeUndefined();
  });

  it("rejects a bad status enum", () => {
    const { errors } = validateBenchmarkRun(
      { ...validRun(), status: "broken" },
      "run",
    );
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.includes("status must be one of"))).toBe(true);
  });

  it("rejects a non-positive attempt", () => {
    const { errors } = validateBenchmarkRun(
      { ...validRun(), attempt: 0 },
      "run",
    );
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.includes("attempt must be a positive"))).toBe(
      true,
    );
  });

  it("rejects a malformed capturedAt date", () => {
    const { errors } = validateBenchmarkRun(
      { ...validRun(), capturedAt: "yesterday" },
      "run",
    );
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.includes("capturedAt must be an ISO"))).toBe(
      true,
    );
  });

  it("rejects an artifactPath that does not end with a slash", () => {
    const { errors } = validateBenchmarkRun(
      { ...validRun(), artifactPath: "endless-runner/gpt-5-5" },
      "run",
    );
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.includes("artifactPath must end with"))).toBe(
      true,
    );
  });
});

describe("validateBenchmarkManifest", () => {
  it("accepts a valid benchmark", () => {
    const result = validateBenchmarkManifest(validBenchmark());
    expect(result.ok).toBe(true);
    expect(result.value?.runs).toHaveLength(1);
  });

  it("rejects an empty runs array", () => {
    const result = validateBenchmarkManifest({
      ...validBenchmark(),
      runs: [],
    });
    expect(result.ok).toBe(false);
    expect(
      result.errors.some((e) => e.includes("runs must be a non-empty array")),
    ).toBe(true);
  });

  it("rejects a duplicate run slug within a benchmark", () => {
    const result = validateBenchmarkManifest({
      ...validBenchmark(),
      runs: [validRun(), { ...validRun(), modelDisplayName: "Other" }],
    });
    expect(result.ok).toBe(false);
    expect(result.errors.some((e) => e.includes("slug is duplicated"))).toBe(
      true,
    );
  });

  it("rejects a bad environment enum", () => {
    const result = validateBenchmarkManifest({
      ...validBenchmark(),
      environment: {
        artifactFormat: "wasm-binary",
        networkAccess: "none",
        notes: "x",
      },
    });
    expect(result.ok).toBe(false);
    expect(
      result.errors.some((e) => e.includes("artifactFormat must be one of")),
    ).toBe(true);
  });

  it("collects errors across nested fields in one pass", () => {
    const result = validateBenchmarkManifest({
      slug: "",
      title: "",
      summary: "",
      promptPath: "",
      publishedAt: "bad",
      environment: {},
      runs: [{ ...validRun(), status: "nope" }],
    });
    expect(result.ok).toBe(false);
    expect(result.errors.length).toBeGreaterThan(5);
  });
});

describe("parse* throwing parsers", () => {
  it("parseModelManifest throws a message listing the source and errors", () => {
    expect(() => parseModelManifest({ id: "" }, "models/bad.json")).toThrow(
      /models\/bad\.json[\s\S]*model\.id must be a non-empty string/,
    );
  });

  it("parseBenchmarkManifest throws with the source label", () => {
    expect(() =>
      parseBenchmarkManifest({ slug: "x" }, "benchmarks/bad.json"),
    ).toThrow(/benchmarks\/bad\.json/);
  });

  it("parseModelManifest returns the value when valid", () => {
    const model = parseModelManifest(validModel(), "models/g.json");
    expect(model.id).toBe("gpt-5-5");
  });
});
