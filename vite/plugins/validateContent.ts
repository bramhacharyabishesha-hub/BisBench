import { readdirSync, readFileSync } from "node:fs";
import { extname, join } from "node:path";
import type { Plugin } from "vite";

import {
  validateContentSet,
  type RawEntry,
} from "../../src/content/validateContent";

function readJsonDir(dir: string): RawEntry[] {
  const entries: RawEntry[] = [];
  let files: string[];
  try {
    files = readdirSync(dir);
  } catch {
    return entries;
  }
  for (const file of files) {
    if (extname(file) !== ".json") continue;
    const fullPath = join(dir, file);
    const text = readFileSync(fullPath, "utf8");
    let raw: unknown;
    try {
      raw = JSON.parse(text);
    } catch (error) {
      throw new Error(
        `Invalid JSON in ${fullPath}: ${(error as Error).message}`,
        {
          cause: error,
        },
      );
    }
    entries.push({ source: fullPath, raw });
  }
  return entries;
}

/**
 * Vite plugin that validates every content manifest at build time. Runs in
 * `buildStart` so `vite build` fails fast with a useful message before any
 * code is bundled. Gated to `apply: "build"` so dev/test startup stays fast;
 * test-time validation is covered by the loader test importing
 * loadBenchmarks.ts.
 */
export function validateContentPlugin(): Plugin {
  return {
    name: "bisbench-validate-content",
    apply: "build",
    buildStart() {
      const root = process.cwd();
      const models = readJsonDir(join(root, "content", "models"));
      const benchmarks = readJsonDir(join(root, "content", "benchmarks"));
      validateContentSet(models, benchmarks);
      this.info("BisBench content validated.");
    },
  };
}
