#!/usr/bin/env bun
/**
 * BisBench artifact ingestion command.
 *
 * Usage:
 *   bun run ingest -- \
 *     --benchmark endless-runner \
 *     --model gpt-5-5 \
 *     --zip ./incoming/gpt-5-5.zip \
 *     --preview ./incoming/gpt-5-5.webp \
 *     --notes ./incoming/gpt-5-5.md
 *
 * Validates the ZIP, extracts it into the deterministic artifact directory,
 * copies the preview and run notes, and prints the exact files changed.
 *
 * Never executes artifact HTML, JavaScript, package scripts, or build commands.
 */

import { stat } from "node:fs/promises";
import { statSync } from "node:fs";
import { resolve } from "node:path";
import AdmZip from "adm-zip";

import { validateEntries, type ZipEntry } from "./archiveValidation";
import { installArtifact } from "./installArtifact";

interface Args {
  benchmark: string;
  model: string;
  zip: string;
  preview: string;
  notes: string;
}

function parseArgs(argv: string[]): Args {
  const args: Record<string, string> = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith("--")) {
      const key = a.slice(2);
      const value = argv[i + 1];
      if (!value || value.startsWith("--")) {
        throw new Error(`Missing value for --${key}`);
      }
      args[key] = value;
      i++;
    }
  }
  const required = ["benchmark", "model", "zip", "preview", "notes"];
  for (const key of required) {
    if (!args[key]) {
      throw new Error(`Missing required argument: --${key}`);
    }
  }
  return args as unknown as Args;
}

function readZipEntries(zipPath: string): {
  entries: ZipEntry[];
  size: number;
} {
  const zip = new AdmZip(zipPath);
  const entries = zip.getEntries();
  const size = statSync(zipPath).size;
  return {
    entries: entries.map((e) => ({
      name: e.entryName,
      size: e.header.size,
      compressedSize: e.header.compressedSize,
      isDirectory: e.isDirectory,
      isSymbolicLink: false,
    })),
    size,
  };
}

async function extractZip(zipPath: string, destDir: string): Promise<void> {
  const zip = new AdmZip(zipPath);
  zip.extractAllTo(destDir, true, false);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const repoRoot = resolve(process.cwd());

  console.log(`Ingesting artifact:`);
  console.log(`  benchmark: ${args.benchmark}`);
  console.log(`  model:     ${args.model}`);
  console.log(`  zip:       ${args.zip}`);
  console.log(`  preview:   ${args.preview}`);
  console.log(`  notes:     ${args.notes}`);
  console.log();

  const zipStats = await stat(args.zip);
  const { entries, size } = readZipEntries(args.zip);
  console.log(
    `Archive: ${entries.length} entries, ${(size / 1024).toFixed(0)} KB`,
  );

  const validation = validateEntries(entries, zipStats.size);
  if (!validation.ok) {
    console.error("Validation failed:");
    for (const error of validation.errors) {
      console.error(`  - ${error}`);
    }
    process.exit(1);
  }
  console.log("Validation passed.");
  console.log(
    `  extracted size: ${(validation.totalUncompressedSize / 1024).toFixed(0)} KB`,
  );
  console.log(`  root index.html: ${validation.hasRootIndex}`);

  const result = await installArtifact({
    repoRoot,
    benchmarkSlug: args.benchmark,
    runSlug: args.model,
    zipPath: args.zip,
    previewPath: args.preview,
    notesPath: args.notes,
    validation,
    extract: extractZip,
  });

  console.log();
  console.log("Installed. Files changed:");
  for (const file of result.filesChanged) {
    const relative = file.replace(repoRoot + "/", "");
    console.log(`  ${relative}`);
  }
  console.log();
  console.log("Verify with:");
  console.log("  bun run typecheck && bun run build");
}

main().catch((error) => {
  console.error(`Error: ${error.message}`);
  process.exit(1);
});
