/**
 * Viewer state machine.
 *
 *   idle -> loading -> loaded
 *   loading -> error
 *   any -> idle (reload)
 *
 * The iframe is only created when state is loading or loaded. In idle and
 * error states, no iframe exists, so untrusted code cannot run until the
 * visitor explicitly presses Play.
 */

export type ViewerState = "idle" | "loading" | "loaded" | "error";

export interface ViewerModel {
  readonly state: ViewerState;
  readonly reloadKey: number;
}

export function initialViewerModel(): ViewerModel {
  return { state: "idle", reloadKey: 0 };
}

export function play(model: ViewerModel): ViewerModel {
  if (model.state === "loading" || model.state === "loaded") return model;
  return { state: "loading", reloadKey: model.reloadKey };
}

export function markLoaded(model: ViewerModel): ViewerModel {
  if (model.state !== "loading") return model;
  return { ...model, state: "loaded" };
}

export function markError(model: ViewerModel): ViewerModel {
  if (model.state === "idle" || model.state === "error") return model;
  return { ...model, state: "error" };
}

export function reload(model: ViewerModel): ViewerModel {
  return { state: "loading", reloadKey: model.reloadKey + 1 };
}

export function exit(): ViewerModel {
  return initialViewerModel();
}

export function shouldRenderIframe(model: ViewerModel): boolean {
  return model.state === "loading" || model.state === "loaded";
}
