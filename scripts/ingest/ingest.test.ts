import { describe, it, expect } from "vitest";

import { validateEntries, type ZipEntry } from "./archiveValidation";
import { isSupportedFile, ARCHIVE_LIMIT_BYTES } from "./filePolicy";

function entry(name: string, overrides: Partial<ZipEntry> = {}): ZipEntry {
  return {
    name,
    size: 100,
    compressedSize: 50,
    isDirectory: false,
    isSymbolicLink: false,
    ...overrides,
  };
}

const VALID_ARCHIVE_SIZE = 1024;

describe("validateEntries", () => {
  it("accepts a valid archive with root index.html", () => {
    const result = validateEntries(
      [entry("index.html"), entry("game.js"), entry("assets/sprite.png")],
      VALID_ARCHIVE_SIZE,
    );
    expect(result.ok).toBe(true);
    expect(result.hasRootIndex).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("rejects a missing root index.html", () => {
    const result = validateEntries(
      [entry("game.js"), entry("assets/sprite.png")],
      VALID_ARCHIVE_SIZE,
    );
    expect(result.ok).toBe(false);
    expect(result.errors).toContain(
      'archive must contain "index.html" at the root',
    );
  });

  it("rejects index.html inside a subdirectory but not at root", () => {
    const result = validateEntries(
      [entry("build/index.html")],
      VALID_ARCHIVE_SIZE,
    );
    expect(result.ok).toBe(false);
    expect(result.hasRootIndex).toBe(false);
  });

  it("rejects a symlink entry", () => {
    const result = validateEntries(
      [entry("index.html"), entry("evil", { isSymbolicLink: true })],
      VALID_ARCHIVE_SIZE,
    );
    expect(result.ok).toBe(false);
    expect(result.errors.some((e) => e.includes("symlink"))).toBe(true);
  });

  it("rejects an absolute unix path", () => {
    const result = validateEntries(
      [entry("index.html"), entry("/etc/passwd")],
      VALID_ARCHIVE_SIZE,
    );
    expect(result.ok).toBe(false);
    expect(result.errors.some((e) => e.includes("absolute path"))).toBe(true);
  });

  it("rejects a Windows drive-letter path", () => {
    const result = validateEntries(
      [entry("index.html"), entry("C:/Windows/System32/evil.dll")],
      VALID_ARCHIVE_SIZE,
    );
    expect(result.ok).toBe(false);
    expect(result.errors.some((e) => e.includes("Windows absolute"))).toBe(
      true,
    );
  });

  it("rejects parent traversal", () => {
    const result = validateEntries(
      [entry("index.html"), entry("../escape.txt")],
      VALID_ARCHIVE_SIZE,
    );
    expect(result.ok).toBe(false);
    expect(result.errors.some((e) => e.includes("parent traversal"))).toBe(
      true,
    );
  });

  it("rejects backslashes in entry names", () => {
    const result = validateEntries(
      [entry("index.html"), entry("folder\\file.js")],
      VALID_ARCHIVE_SIZE,
    );
    expect(result.ok).toBe(false);
    expect(result.errors.some((e) => e.includes("backslashes"))).toBe(true);
  });

  it("rejects an archive over the size limit", () => {
    const oversized = ARCHIVE_LIMIT_BYTES + 1;
    const result = validateEntries([entry("index.html")], oversized);
    expect(result.ok).toBe(false);
    expect(result.errors.some((e) => e.includes("archive is"))).toBe(true);
  });

  it("rejects extracted content over the size limit", () => {
    const huge = entry("index.html", { size: 101 * 1024 * 1024 });
    const result = validateEntries([huge], VALID_ARCHIVE_SIZE);
    expect(result.ok).toBe(false);
    expect(result.errors.some((e) => e.includes("extracted size"))).toBe(true);
  });

  it("rejects unsupported file types", () => {
    const result = validateEntries(
      [entry("index.html"), entry("malware.exe")],
      VALID_ARCHIVE_SIZE,
    );
    expect(result.ok).toBe(false);
    expect(result.errors.some((e) => e.includes("unsupported extension"))).toBe(
      true,
    );
  });

  it("accepts directory entries without checking their extension", () => {
    const result = validateEntries(
      [entry("index.html"), entry("assets/", { isDirectory: true })],
      VALID_ARCHIVE_SIZE,
    );
    expect(result.ok).toBe(true);
  });

  it("collects multiple errors in one pass", () => {
    const result = validateEntries(
      [
        entry("../escape.txt"),
        entry("evil", { isSymbolicLink: true }),
        entry("malware.exe"),
      ],
      ARCHIVE_LIMIT_BYTES + 1,
    );
    expect(result.ok).toBe(false);
    expect(result.errors.length).toBeGreaterThanOrEqual(4);
  });
});

describe("isSupportedFile", () => {
  it("accepts standard web file types", () => {
    expect(isSupportedFile("game.js").ok).toBe(true);
    expect(isSupportedFile("style.css").ok).toBe(true);
    expect(isSupportedFile("sprite.png").ok).toBe(true);
    expect(isSupportedFile("index.html").ok).toBe(true);
    expect(isSupportedFile("font.woff2").ok).toBe(true);
  });

  it("rejects executables", () => {
    expect(isSupportedFile("run.exe").ok).toBe(false);
    expect(isSupportedFile("script.sh").ok).toBe(false);
    expect(isSupportedFile("binary.bin").ok).toBe(false);
  });

  it("rejects files with no extension", () => {
    expect(isSupportedFile("Makefile").ok).toBe(false);
    expect(isSupportedFile("LICENSE").ok).toBe(false);
  });

  it("ignores system files", () => {
    expect(isSupportedFile(".DS_Store").ok).toBe(false);
    expect(isSupportedFile("Thumbs.db").ok).toBe(false);
  });
});
