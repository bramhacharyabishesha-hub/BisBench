/**
 * Archive validation.
 *
 * Validates a ZIP archive's entries before extraction. Rejects:
 *   - absolute paths (leading / or drive letters)
 *   - parent traversal (../)
 *   - symlinks
 *   - missing root index.html
 *   - archives over the size limit
 *   - extracted content over the size limit
 *   - unsupported file types
 *
 * Never executes any file inside the archive.
 */

import {
  isSupportedFile,
  ARCHIVE_LIMIT_BYTES,
  EXTRACTED_LIMIT_BYTES,
} from "./filePolicy";

export interface ZipEntry {
  readonly name: string;
  readonly size: number;
  readonly compressedSize: number;
  readonly isDirectory: boolean;
  readonly isSymbolicLink: boolean;
}

export interface ArchiveValidation {
  readonly ok: boolean;
  readonly errors: readonly string[];
  readonly totalUncompressedSize: number;
  readonly hasRootIndex: boolean;
}

export function validateEntries(
  entries: readonly ZipEntry[],
  archiveSize: number,
): ArchiveValidation {
  const errors: string[] = [];
  let totalUncompressed = 0;
  let hasRootIndex = false;

  if (archiveSize > ARCHIVE_LIMIT_BYTES) {
    errors.push(
      `archive is ${(archiveSize / 1024 / 1024).toFixed(1)} MB; limit is ${ARCHIVE_LIMIT_BYTES / 1024 / 1024} MB`,
    );
  }

  for (const entry of entries) {
    if (entry.isSymbolicLink) {
      errors.push(`"${entry.name}" is a symlink; symlinks are not allowed`);
      continue;
    }
    if (entry.isDirectory) continue;

    if (entry.name.startsWith("/")) {
      errors.push(`"${entry.name}" is an absolute path`);
      continue;
    }
    if (/^[a-z]:/i.test(entry.name)) {
      errors.push(`"${entry.name}" looks like a Windows absolute path`);
      continue;
    }
    if (entry.name.includes("..")) {
      errors.push(`"${entry.name}" contains parent traversal ("..")`);
      continue;
    }
    if (entry.name.includes("\\")) {
      errors.push(`"${entry.name}" contains backslashes; use forward slashes`);
      continue;
    }

    if (entry.name === "index.html" || entry.name.startsWith("index.html")) {
      if (entry.name === "index.html") hasRootIndex = true;
    }

    const fileCheck = isSupportedFile(entry.name);
    if (!fileCheck.ok && !fileCheck.error?.includes("ignored system file")) {
      errors.push(fileCheck.error!);
      continue;
    }

    totalUncompressed += entry.size;
  }

  if (totalUncompressed > EXTRACTED_LIMIT_BYTES) {
    errors.push(
      `extracted size is ${(totalUncompressed / 1024 / 1024).toFixed(1)} MB; limit is ${EXTRACTED_LIMIT_BYTES / 1024 / 1024} MB`,
    );
  }

  if (!hasRootIndex) {
    errors.push('archive must contain "index.html" at the root');
  }

  return {
    ok: errors.length === 0,
    errors,
    totalUncompressedSize: totalUncompressed,
    hasRootIndex,
  };
}
