/**
 * Manifest schema validation.
 *
 * Structural validation only: required fields, types, enums, ISO dates, and
 * array shape. Referential checks (modelId resolves to a known model) and
 * path safety are enforced by the loader, which composes this module with
 * pathSafety.ts and the model registry.
 *
 * Every validator collects ALL errors for an object (not fail-fast) so an
 * invalid manifest reports every bad field in one build failure.
 */

import type {
  BenchmarkEnvironment,
  BenchmarkManifest,
  BenchmarkRun,
  ModelManifest,
} from "./types";

export interface ValidationResult<T> {
  readonly ok: boolean;
  readonly value: T | null;
  readonly errors: readonly string[];
}

const ok = <T>(value: T): ValidationResult<T> => ({
  ok: true,
  value,
  errors: [],
});

const fail = <T>(errors: string[]): ValidationResult<T> => ({
  ok: false,
  value: null,
  errors,
});

const BENCHMARK_STATUSES = new Set(["playable", "failed", "partial"]);
const ARTIFACT_FORMATS = new Set(["browser-ready-static"]);
const NETWORK_ACCESS = new Set(["none"]);
const ISO_DATE =
  /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:\d{2})?)?$/;

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

function isInteger(v: unknown, min: number): v is number {
  return typeof v === "number" && Number.isInteger(v) && v >= min;
}

function isIsoDate(v: unknown): v is string {
  return typeof v === "string" && ISO_DATE.test(v);
}

function isEnumValue(v: unknown, allowed: Set<string>): v is string {
  return typeof v === "string" && allowed.has(v);
}

function optionalNonEmptyString(
  obj: Record<string, unknown>,
  field: string,
  root: string,
  errors: string[],
): string | undefined {
  const v = obj[field];
  if (v === undefined) return undefined;
  if (!isNonEmptyString(v)) {
    errors.push(`${root}.${field} must be a non-empty string when present`);
    return undefined;
  }
  return v;
}

export function validateModelManifest(
  input: unknown,
): ValidationResult<ModelManifest> {
  const root = "model";
  if (!isRecord(input))
    return fail<ModelManifest>([`${root}: expected an object`]);
  const errors: string[] = [];

  const id = input.id;
  if (!isNonEmptyString(id))
    errors.push(`${root}.id must be a non-empty string`);

  const provider = input.provider;
  if (!isNonEmptyString(provider))
    errors.push(`${root}.provider must be a non-empty string`);

  const identifier = input.identifier;
  if (!isNonEmptyString(identifier))
    errors.push(`${root}.identifier must be a non-empty string`);

  const version = input.version;
  if (!isNonEmptyString(version))
    errors.push(`${root}.version must be a non-empty string`);

  const accessMode = input.accessMode;
  if (!isNonEmptyString(accessMode))
    errors.push(`${root}.accessMode must be a non-empty string`);

  const weightsAvailable = input.weightsAvailable;
  if (typeof weightsAvailable !== "boolean")
    errors.push(`${root}.weightsAvailable must be a boolean`);

  const license = optionalNonEmptyString(input, "license", root, errors);
  const homepage = optionalNonEmptyString(input, "homepage", root, errors);

  if (errors.length > 0) return fail<ModelManifest>(errors);

  const model: ModelManifest = {
    id: id as string,
    provider: provider as string,
    identifier: identifier as string,
    version: version as string,
    accessMode: accessMode as string,
    weightsAvailable: weightsAvailable as boolean,
    ...(license !== undefined ? { license } : {}),
    ...(homepage !== undefined ? { homepage } : {}),
  };
  return ok(model);
}

function validateEnvironment(
  input: unknown,
  root: string,
): { value: BenchmarkEnvironment | null; errors: string[] } {
  const errors: string[] = [];
  if (!isRecord(input)) {
    return { value: null, errors: [`${root}: expected an object`] };
  }
  const artifactFormat = input.artifactFormat;
  if (!isEnumValue(artifactFormat, ARTIFACT_FORMATS))
    errors.push(
      `${root}.artifactFormat must be one of: ${[...ARTIFACT_FORMATS].join(", ")}`,
    );

  const networkAccess = input.networkAccess;
  if (!isEnumValue(networkAccess, NETWORK_ACCESS))
    errors.push(
      `${root}.networkAccess must be one of: ${[...NETWORK_ACCESS].join(", ")}`,
    );

  const notes = input.notes;
  if (!isNonEmptyString(notes))
    errors.push(`${root}.notes must be a non-empty string`);

  if (errors.length > 0) return { value: null, errors };
  return {
    value: {
      artifactFormat: artifactFormat as BenchmarkEnvironment["artifactFormat"],
      networkAccess: networkAccess as BenchmarkEnvironment["networkAccess"],
      notes: notes as string,
    },
    errors: [],
  };
}

export function validateBenchmarkRun(
  input: unknown,
  root: string,
): { value: BenchmarkRun | null; errors: string[] } {
  const errors: string[] = [];
  if (!isRecord(input)) {
    return { value: null, errors: [`${root}: expected an object`] };
  }

  const slug = input.slug;
  if (!isNonEmptyString(slug))
    errors.push(`${root}.slug must be a non-empty string`);

  const modelId = input.modelId;
  if (!isNonEmptyString(modelId))
    errors.push(`${root}.modelId must be a non-empty string`);

  const modelDisplayName = input.modelDisplayName;
  if (!isNonEmptyString(modelDisplayName))
    errors.push(`${root}.modelDisplayName must be a non-empty string`);

  const attempt = input.attempt;
  if (!isInteger(attempt, 1))
    errors.push(`${root}.attempt must be a positive integer`);

  const effortLevel = optionalNonEmptyString(
    input,
    "effortLevel",
    root,
    errors,
  );

  const artifactPath = input.artifactPath;
  if (!isNonEmptyString(artifactPath))
    errors.push(`${root}.artifactPath must be a non-empty string`);
  else if (!artifactPath.endsWith("/"))
    errors.push(`${root}.artifactPath must end with "/" (directory root)`);

  const previewImagePath = input.previewImagePath;
  if (!isNonEmptyString(previewImagePath))
    errors.push(`${root}.previewImagePath must be a non-empty string`);

  const runNotesPath = input.runNotesPath;
  if (!isNonEmptyString(runNotesPath))
    errors.push(`${root}.runNotesPath must be a non-empty string`);

  const capturedAt = input.capturedAt;
  if (!isIsoDate(capturedAt))
    errors.push(`${root}.capturedAt must be an ISO 8601 date string`);

  const status = input.status;
  if (!isEnumValue(status, BENCHMARK_STATUSES))
    errors.push(
      `${root}.status must be one of: ${[...BENCHMARK_STATUSES].join(", ")}`,
    );

  const protocolVersion = input.protocolVersion;
  if (!isNonEmptyString(protocolVersion))
    errors.push(`${root}.protocolVersion must be a non-empty string`);

  if (errors.length > 0) return { value: null, errors };

  const run: BenchmarkRun = {
    slug: slug as string,
    modelId: modelId as string,
    modelDisplayName: modelDisplayName as string,
    attempt: attempt as number,
    ...(effortLevel !== undefined ? { effortLevel } : {}),
    artifactPath: artifactPath as string,
    previewImagePath: previewImagePath as string,
    runNotesPath: runNotesPath as string,
    capturedAt: capturedAt as string,
    status: status as BenchmarkRun["status"],
    protocolVersion: protocolVersion as string,
  };
  return { value: run, errors: [] };
}

export function validateBenchmarkManifest(
  input: unknown,
): ValidationResult<BenchmarkManifest> {
  const root = "benchmark";
  if (!isRecord(input))
    return fail<BenchmarkManifest>([`${root}: expected an object`]);
  const errors: string[] = [];

  const slug = input.slug;
  if (!isNonEmptyString(slug))
    errors.push(`${root}.slug must be a non-empty string`);

  const title = input.title;
  if (!isNonEmptyString(title))
    errors.push(`${root}.title must be a non-empty string`);

  const summary = input.summary;
  if (!isNonEmptyString(summary))
    errors.push(`${root}.summary must be a non-empty string`);

  const promptPath = input.promptPath;
  if (!isNonEmptyString(promptPath))
    errors.push(`${root}.promptPath must be a non-empty string`);

  const publishedAt = input.publishedAt;
  if (!isIsoDate(publishedAt))
    errors.push(`${root}.publishedAt must be an ISO 8601 date string`);

  const env = validateEnvironment(input.environment, `${root}.environment`);
  errors.push(...env.errors);

  const runsInput = input.runs;
  if (!Array.isArray(runsInput) || runsInput.length === 0) {
    errors.push(`${root}.runs must be a non-empty array`);
  } else {
    const seenSlugs = new Set<string>();
    runsInput.forEach((runInput, i) => {
      const runRoot = `${root}.runs[${i}]`;
      const run = validateBenchmarkRun(runInput, runRoot);
      errors.push(...run.errors);
      if (run.value !== null) {
        if (seenSlugs.has(run.value.slug)) {
          errors.push(`${runRoot}.slug is duplicated within this benchmark`);
        } else {
          seenSlugs.add(run.value.slug);
        }
      }
    });
  }

  if (errors.length > 0) return fail<BenchmarkManifest>(errors);

  const runs = (runsInput as unknown[])
    .map((r) => validateBenchmarkRun(r, "").value)
    .filter((r): r is BenchmarkRun => r !== null);

  return ok<BenchmarkManifest>({
    slug: slug as string,
    title: title as string,
    summary: summary as string,
    promptPath: promptPath as string,
    publishedAt: publishedAt as string,
    environment: env.value as BenchmarkEnvironment,
    runs,
  });
}

/**
 * Parse and return a valid ModelManifest, or throw an Error listing every
 * invalid field. The `source` label is included so build failures point at
 * the offending file.
 */
export function parseModelManifest(
  input: unknown,
  source: string,
): ModelManifest {
  const result = validateModelManifest(input);
  if (!result.ok || result.value === null) {
    throw new Error(
      `Invalid model manifest ${source}:\n  - ${result.errors.join("\n  - ")}`,
    );
  }
  return result.value;
}

/**
 * Parse and return a valid BenchmarkManifest, or throw with every error.
 * Referential integrity (run.modelId -> model id) is checked by the loader.
 */
export function parseBenchmarkManifest(
  input: unknown,
  source: string,
): BenchmarkManifest {
  const result = validateBenchmarkManifest(input);
  if (!result.ok || result.value === null) {
    throw new Error(
      `Invalid benchmark manifest ${source}:\n  - ${result.errors.join("\n  - ")}`,
    );
  }
  return result.value;
}
