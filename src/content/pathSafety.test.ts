import { describe, it, expect } from "vitest";

import { assertSafeContentPath, isSafeContentPath } from "./pathSafety";

describe("isSafeContentPath", () => {
  it("accepts a simple relative path", () => {
    expect(isSafeContentPath("endless-runner/gpt-5-5.md").ok).toBe(true);
  });

  it("accepts a single file with extension", () => {
    expect(isSafeContentPath("gpt-5-5.webp").ok).toBe(true);
  });

  it("accepts a directory path ending in a slash", () => {
    expect(isSafeContentPath("endless-runner/gpt-5-5/").ok).toBe(true);
  });

  it("rejects a non-string", () => {
    expect(isSafeContentPath(42).ok).toBe(false);
  });

  it("rejects an empty string", () => {
    expect(isSafeContentPath("").ok).toBe(false);
  });

  it("rejects a null byte", () => {
    expect(isSafeContentPath("a\0b").ok).toBe(false);
  });

  it("rejects an absolute unix path", () => {
    expect(isSafeContentPath("/etc/passwd").ok).toBe(false);
  });

  it("rejects a backslash path", () => {
    expect(isSafeContentPath("a\\b").ok).toBe(false);
  });

  it("rejects parent traversal", () => {
    expect(isSafeContentPath("../secret.md").ok).toBe(false);
    expect(isSafeContentPath("a/../../secret.md").ok).toBe(false);
  });

  it("rejects a dot segment", () => {
    expect(isSafeContentPath("./a.md").ok).toBe(false);
  });

  it("rejects an empty segment", () => {
    expect(isSafeContentPath("a//b.md").ok).toBe(false);
  });

  it("rejects unsafe characters in a segment", () => {
    expect(isSafeContentPath("a b.md").ok).toBe(false);
    expect(isSafeContentPath("a:b.md").ok).toBe(false);
  });
});

describe("assertSafeContentPath", () => {
  it("does not throw for a safe path", () => {
    expect(() =>
      assertSafeContentPath("endless-runner/gpt-5-5.md", "promptPath"),
    ).not.toThrow();
  });

  it("throws with the field label and reason for an unsafe path", () => {
    expect(() =>
      assertSafeContentPath("../escape.md", "run.runNotesPath"),
    ).toThrow(/run\.runNotesPath.*must not contain/);
  });
});
