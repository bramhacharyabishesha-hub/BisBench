import { describe, it, expect } from "vitest";

import {
  exit,
  initialViewerModel,
  markError,
  markLoaded,
  play,
  reload,
  shouldRenderIframe,
} from "./viewerState";

describe("viewerState", () => {
  it("starts in idle with no iframe", () => {
    const m = initialViewerModel();
    expect(m.state).toBe("idle");
    expect(shouldRenderIframe(m)).toBe(false);
  });

  it("play moves idle -> loading and enables the iframe", () => {
    const m = play(initialViewerModel());
    expect(m.state).toBe("loading");
    expect(shouldRenderIframe(m)).toBe(true);
  });

  it("play is idempotent from loading and loaded", () => {
    const loading = play(initialViewerModel());
    expect(play(loading).state).toBe("loading");
    const loaded = markLoaded(loading);
    expect(play(loaded).state).toBe("loaded");
  });

  it("markLoaded moves loading -> loaded", () => {
    const m = markLoaded(play(initialViewerModel()));
    expect(m.state).toBe("loaded");
    expect(shouldRenderIframe(m)).toBe(true);
  });

  it("markLoaded is ignored from idle and error", () => {
    expect(markLoaded(initialViewerModel()).state).toBe("idle");
    const err = markError(play(initialViewerModel()));
    expect(markLoaded(err).state).toBe("error");
  });

  it("markError moves loading -> error and removes the iframe", () => {
    const m = markError(play(initialViewerModel()));
    expect(m.state).toBe("error");
    expect(shouldRenderIframe(m)).toBe(false);
  });

  it("markError is ignored from idle", () => {
    expect(markError(initialViewerModel()).state).toBe("idle");
  });

  it("reload increments the key and returns to loading", () => {
    const m1 = play(initialViewerModel());
    const m2 = reload(markError(m1));
    expect(m2.state).toBe("loading");
    expect(m2.reloadKey).toBe(m1.reloadKey + 1);
    expect(shouldRenderIframe(m2)).toBe(true);
  });

  it("exit resets to idle", () => {
    const m = exit();
    expect(m.state).toBe("idle");
    expect(m.reloadKey).toBe(0);
    expect(shouldRenderIframe(m)).toBe(false);
  });
});
