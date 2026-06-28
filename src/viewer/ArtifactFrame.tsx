import { useEffect, useRef } from "react";

import type { ViewerModel } from "./viewerState";
import { shouldRenderIframe } from "./viewerState";
import { artifactUrl } from "./artifactUrl";

import "./ArtifactFrame.css";

interface ArtifactFrameProps {
  model: ViewerModel;
  artifactPath: string;
  title: string;
  onLoad: () => void;
  onError: () => void;
}

/**
 * The sandboxed iframe that hosts untrusted model output.
 *
 * Permissions granted: allow-scripts (run JS), allow-pointer-lock (games).
 * Permissions denied: allow-same-origin, allow-forms, allow-popups,
 * allow-top-navigation, allow-downloads, allow-storage-access-by-user-activation.
 *
 * The iframe is only mounted when the viewer state is loading or loaded,
 * i.e. after the visitor presses Play. It is never created in idle or error
 * states.
 */
export function ArtifactFrame({
  model,
  artifactPath,
  title,
  onLoad,
  onError,
}: ArtifactFrameProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!shouldRenderIframe(model)) return;
    const iframe = iframeRef.current;
    if (!iframe) return;

    let canceled = false;
    const timer = window.setTimeout(() => {
      if (!canceled) onLoad();
    }, 500);

    const handleIframeError = () => {
      if (!canceled) {
        window.clearTimeout(timer);
        onError();
      }
    };

    iframe.addEventListener("error", handleIframeError);

    return () => {
      canceled = true;
      window.clearTimeout(timer);
      iframe.removeEventListener("error", handleIframeError);
    };
  }, [model, onLoad, onError]);

  if (!shouldRenderIframe(model)) {
    return null;
  }

  return (
    <div className="artifact-frame">
      <iframe
        key={model.reloadKey}
        ref={iframeRef}
        src={artifactUrl(artifactPath)}
        title={title}
        sandbox="allow-scripts allow-pointer-lock"
        className="artifact-frame__iframe"
        allow="fullscreen"
      />
    </div>
  );
}
