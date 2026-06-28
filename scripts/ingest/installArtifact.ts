/**
 * Install artifact.
 *
 * Extracts a validated ZIP into the deterministic artifact directory, copies
 * the preview image and run notes, and prints the exact files changed.
 *
 * Atomicity: if any step fails, the partial output directory is removed so
 * the repository is not left in a half-installed state.
 */

import { mkdir, rm, cp, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";

import type { ArchiveValidation } from "./archiveValidation";

export interface InstallOptions {
  readonly repoRoot: string;
  readonly benchmarkSlug: string;
  readonly runSlug: string;
  readonly zipPath: string;
  readonly previewPath: string;
  readonly notesPath: string;
  readonly validation: ArchiveValidation;
  readonly extract: (zipPath: string, destDir: string) => Promise<void>;
}

export interface InstallResult {
  readonly artifactDir: string;
  readonly previewDest: string;
  readonly notesDest: string;
  readonly filesChanged: readonly string[];
}

export async function installArtifact(
  opts: InstallOptions,
): Promise<InstallResult> {
  const artifactDir = join(
    opts.repoRoot,
    "public",
    "artifacts",
    opts.benchmarkSlug,
    opts.runSlug,
  );
  const previewDir = join(
    opts.repoRoot,
    "public",
    "previews",
    opts.benchmarkSlug,
  );
  const notesDir = join(
    opts.repoRoot,
    "content",
    "run-notes",
    opts.benchmarkSlug,
  );
  const previewDest = join(previewDir, `${opts.runSlug}.webp`);
  const notesDest = join(notesDir, `${opts.runSlug}.md`);

  if (!opts.validation.ok) {
    throw new Error(
      `Cannot install: archive validation failed:\n  - ${opts.validation.errors.join("\n  - ")}`,
    );
  }

  const createdDirs: string[] = [];
  try {
    if (existsSync(artifactDir)) {
      await rm(artifactDir, { recursive: true, force: true });
    }
    await mkdir(artifactDir, { recursive: true });
    createdDirs.push(artifactDir);

    await opts.extract(opts.zipPath, artifactDir);

    await mkdir(previewDir, { recursive: true });
    createdDirs.push(previewDir);
    await cp(opts.previewPath, previewDest, { force: true });

    await mkdir(notesDir, { recursive: true });
    createdDirs.push(notesDir);
    await cp(opts.notesPath, notesDest, { force: true });

    const filesChanged = await listFiles(artifactDir);
    filesChanged.push(previewDest, notesDest);

    return { artifactDir, previewDest, notesDest, filesChanged };
  } catch (error) {
    for (const dir of createdDirs) {
      if (dir === artifactDir) {
        await rm(dir, { recursive: true, force: true });
      }
    }
    throw new Error(`Install failed: ${(error as Error).message}`, {
      cause: error,
    });
  }
}

async function listFiles(dir: string): Promise<string[]> {
  const results: string[] = [];
  if (!existsSync(dir)) return results;
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...(await listFiles(full)));
    } else {
      results.push(full);
    }
  }
  return results;
}
