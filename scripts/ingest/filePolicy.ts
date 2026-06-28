/**
 * File policy for ingestion.
 *
 * Only browser-readable static file types are accepted. Everything else is
 * rejected so an archive cannot smuggle executables, scripts that run outside
 * the browser, or other non-static content.
 */

const SUPPORTED_EXTENSIONS = new Set([
  ".html",
  ".htm",
  ".css",
  ".js",
  ".mjs",
  ".json",
  ".svg",
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".webp",
  ".avif",
  ".ico",
  ".woff",
  ".woff2",
  ".ttf",
  ".otf",
  ".eot",
  ".mp3",
  ".wav",
  ".ogg",
  ".mp4",
  ".webm",
  ".txt",
  ".md",
  ".map",
  ".webmanifest",
]);

const SUPPORTED_MIME_PREFIXES = [
  "text/",
  "application/json",
  "application/javascript",
  "application/xml",
  "image/",
  "audio/",
  "video/",
  "font/",
  "application/font",
  "application/octet-stream",
];

const IGNORED_NAMES = new Set([
  ".ds_store",
  "thumbs.db",
  ".gitkeep",
  "__macosx",
]);

export interface FileCheck {
  readonly ok: boolean;
  readonly error?: string;
}

export function isSupportedFile(name: string, mimeType?: string): FileCheck {
  const lower = name.toLowerCase();
  const base = lower.split("/").pop() ?? lower;

  if (IGNORED_NAMES.has(base)) {
    return { ok: false, error: `ignored system file "${name}"` };
  }

  const dot = base.lastIndexOf(".");
  if (dot === -1) {
    return { ok: false, error: `"${name}" has no file extension` };
  }
  const ext = base.slice(dot);
  if (!SUPPORTED_EXTENSIONS.has(ext)) {
    return {
      ok: false,
      error: `"${name}" has unsupported extension "${ext}"`,
    };
  }
  if (
    mimeType &&
    !SUPPORTED_MIME_PREFIXES.some((p) => mimeType.startsWith(p))
  ) {
    return {
      ok: false,
      error: `"${name}" has unsupported MIME type "${mimeType}"`,
    };
  }
  return { ok: true };
}

export const ARCHIVE_LIMIT_BYTES = 25 * 1024 * 1024;
export const EXTRACTED_LIMIT_BYTES = 100 * 1024 * 1024;
