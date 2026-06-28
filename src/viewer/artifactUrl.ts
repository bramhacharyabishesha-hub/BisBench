/**
 * Artifact URL construction.
 *
 * Maps a run's artifactPath (relative, e.g. "endless-runner/gpt-5-5/") to an
 * absolute URL that the static host serves from /artifacts/. The iframe loads
 * this URL. The path is already validated by pathSafety at build time, so
 * here we only assemble the final string.
 */

export function artifactUrl(artifactPath: string): string {
  const base = artifactPath.endsWith("/") ? artifactPath : `${artifactPath}/`;
  return `/artifacts/${base}index.html`;
}
