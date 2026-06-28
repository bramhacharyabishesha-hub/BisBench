import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { getRun } from "../content/loadBenchmarks";
import { ArtifactFrame } from "../viewer/ArtifactFrame";
import {
  exit as exitState,
  initialViewerModel,
  play as playState,
  reload as reloadState,
  type ViewerModel,
} from "../viewer/viewerState";

import "./ArtifactViewerPage.css";

export function ArtifactViewerPage() {
  const { benchmarkSlug, runSlug } = useParams();
  const navigate = useNavigate();
  const run = benchmarkSlug && runSlug ? getRun(benchmarkSlug, runSlug) : null;
  const [model, setModel] = useState<ViewerModel>(initialViewerModel);
  const exitButtonRef = useRef<HTMLAnchorElement>(null);

  const handlePlay = useCallback(() => {
    setModel((m) => playState(m));
  }, []);

  const handleReload = useCallback(() => {
    setModel((m) => reloadState(m));
  }, []);

  const handleExit = useCallback(() => {
    setModel(exitState);
    if (benchmarkSlug) {
      navigate(`/benchmarks/${benchmarkSlug}`);
    } else {
      navigate("/");
    }
  }, [navigate, benchmarkSlug]);

  useEffect(() => {
    if (model.state === "error") {
      exitButtonRef.current?.focus();
    }
  }, [model.state]);

  if (!run) {
    return (
      <section className="viewer viewer--missing">
        <h1>Run not found</h1>
        <p>
          No playable run exists at this path.{" "}
          <Link to="/">Return to the featured benchmark</Link>.
        </p>
      </section>
    );
  }

  const iframeTitle = `${run.modelDisplayName} build for ${run.benchmarkSlug}`;
  const showPlayButton = model.state === "idle";
  const showError = model.state === "error";

  return (
    <div className="viewer">
      <header className="viewer__header">
        <div className="viewer__header-info">
          <p className="viewer__breadcrumb">
            <Link to={`/benchmarks/${run.benchmarkSlug}`}>
              {run.benchmarkSlug}
            </Link>
            <span aria-hidden="true">/</span>
            <span>{run.modelDisplayName}</span>
          </p>
          <h1 className="viewer__title">{run.modelDisplayName}</h1>
          <p className="viewer__subtitle">
            {run.model.provider} · {run.model.identifier} · {run.status}
          </p>
        </div>
        <div className="viewer__controls">
          {showPlayButton && (
            <button type="button" className="viewer__play" onClick={handlePlay}>
              Play build
            </button>
          )}
          {!showPlayButton && (
            <button
              type="button"
              className="viewer__reload"
              onClick={handleReload}
              disabled={model.state === "loading"}
            >
              {model.state === "loading" ? "Loading…" : "Reload"}
            </button>
          )}
          <a
            ref={exitButtonRef}
            href={`/benchmarks/${run.benchmarkSlug}`}
            className="viewer__exit"
            onClick={(e) => {
              e.preventDefault();
              handleExit();
            }}
          >
            Exit build
          </a>
        </div>
      </header>

      <div className="viewer__stage" role="region" aria-label="Playable build">
        {showPlayButton && (
          <div className="viewer__idle">
            <p className="viewer__idle-text">
              This is an untrusted model-generated build. It runs in a sandboxed
              iframe with no access to your data or this site.
            </p>
            <button
              type="button"
              className="viewer__play-large"
              onClick={handlePlay}
            >
              Play build
            </button>
          </div>
        )}

        {showError && (
          <div className="viewer__error" role="alert">
            <p className="viewer__error-text">
              The build failed to load. It may be missing files or contain
              broken code.
            </p>
            <div className="viewer__error-actions">
              <button
                type="button"
                className="viewer__retry"
                onClick={handleReload}
              >
                Try again
              </button>
              <a
                href={`/benchmarks/${run.benchmarkSlug}`}
                className="viewer__exit-link"
                onClick={(e) => {
                  e.preventDefault();
                  handleExit();
                }}
              >
                Exit to dossier
              </a>
            </div>
          </div>
        )}

        <ArtifactFrame
          model={model}
          artifactPath={run.artifactPath}
          title={iframeTitle}
          onLoad={() => setModel((m) => ({ ...m, state: "loaded" }))}
          onError={() => setModel((m) => ({ ...m, state: "error" }))}
        />
      </div>
    </div>
  );
}
