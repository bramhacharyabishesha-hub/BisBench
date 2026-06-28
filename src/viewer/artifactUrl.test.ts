import { describe, it, expect } from "vitest";

import { artifactUrl } from "./artifactUrl";

describe("artifactUrl", () => {
  it("builds a URL from a directory path ending in slash", () => {
    expect(artifactUrl("endless-runner/gpt-5-5/")).toBe(
      "/artifacts/endless-runner/gpt-5-5/index.html",
    );
  });

  it("appends a trailing slash if missing", () => {
    expect(artifactUrl("endless-runner/gpt-5-5")).toBe(
      "/artifacts/endless-runner/gpt-5-5/index.html",
    );
  });

  it("always targets index.html at the artifact root", () => {
    expect(artifactUrl("foo/")).toBe("/artifacts/foo/index.html");
  });
});
