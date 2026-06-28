/**
 * Content path safety.
 *
 * All manifest path fields are relative POSIX strings. This module enforces
 * that invariant so that no manifest can ever point outside its base
 * directory. It rejects:
 *   - non-strings and empty strings
 *   - null bytes
 *   - absolute paths (leading "/" or "\")
 *   - backslashes
 *   - "." or ".." segments (traversal / zip-slip)
 *   - empty segments ("a//b")
 *   - segments with characters outside [A-Za-z0-9._-]
 *
 * This is the string-level guard used by the loader. The ingestion command
 * (Slice 6) adds archive-level guards (real symlinks, decompression bombs).
 */

export interface PathCheck {
  readonly ok: boolean;
  readonly error?: string;
}

const SAFE_SEGMENT = /^[A-Za-z0-9._-]+$/;

export function isSafeContentPath(input: unknown): PathCheck {
  if (typeof input !== "string") {
    return { ok: false, error: "path must be a string" };
  }
  if (input.length === 0) {
    return { ok: false, error: "path must not be empty" };
  }
  if (input.includes("\0")) {
    return { ok: false, error: "path must not contain null bytes" };
  }
  if (input.startsWith("/") || input.startsWith("\\")) {
    return { ok: false, error: "path must not be absolute" };
  }
  if (input.includes("\\")) {
    return { ok: false, error: "path must use forward slashes only" };
  }
  const normalized = input.endsWith("/") ? input.slice(0, -1) : input;
  const segments = normalized.split("/");
  for (const segment of segments) {
    if (segment.length === 0) {
      return { ok: false, error: "path must not contain empty segments" };
    }
    if (segment === "." || segment === "..") {
      return {
        ok: false,
        error: "path must not contain '.' or '..' segments",
      };
    }
    if (!SAFE_SEGMENT.test(segment)) {
      return {
        ok: false,
        error: `path segment "${segment}" contains unsafe characters`,
      };
    }
  }
  return { ok: true };
}

export function assertSafeContentPath(
  input: unknown,
  fieldLabel: string,
): void {
  const check = isSafeContentPath(input);
  if (!check.ok) {
    throw new Error(`${fieldLabel}: ${check.error}`);
  }
}
