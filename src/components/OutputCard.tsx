import { Link } from "react-router-dom";

import type { ResolvedRun } from "../content/types";
import { statusLabel } from "./statusLabel";
import { formatDateShort } from "../utils/formatDate";

import "./OutputCard.css";

interface OutputCardProps {
  run: ResolvedRun;
}

export function OutputCard({ run }: OutputCardProps) {
  const previewUrl = `/previews/${run.previewImagePath}`;
  const viewerPath = `/benchmarks/${run.benchmarkSlug}/runs/${run.slug}`;
  const status = statusLabel(run.status);
  const isPlayable = run.status === "playable";

  return (
    <article className={`output-card output-card--${run.status}`}>
      <div className="output-card__preview">
        <img
          src={previewUrl}
          alt={`${run.modelDisplayName} output for ${run.benchmarkSlug}`}
          loading="lazy"
          width={640}
          height={360}
          onError={(e) => {
            const img = e.currentTarget;
            if (img.src.endsWith("/previews/placeholder.svg")) return;
            img.src = "/previews/placeholder.svg";
          }}
        />
        <span
          className={`output-card__status output-card__status--${run.status}`}
        >
          {status.text}
        </span>
      </div>

      <div className="output-card__body">
        <h3 className="output-card__model">{run.modelDisplayName}</h3>

        <dl className="output-card__meta">
          <div className="output-card__meta-row">
            <dt>Provider</dt>
            <dd>{run.model.provider}</dd>
          </div>
          <div className="output-card__meta-row">
            <dt>Model</dt>
            <dd>
              <code>{run.model.identifier}</code>
            </dd>
          </div>
          <div className="output-card__meta-row">
            <dt>Version</dt>
            <dd>{run.model.version}</dd>
          </div>
          <div className="output-card__meta-row">
            <dt>Access</dt>
            <dd>{run.model.accessMode}</dd>
          </div>
          <div className="output-card__meta-row">
            <dt>Captured</dt>
            <dd>
              <time dateTime={run.capturedAt}>
                {formatDateShort(run.capturedAt)}
              </time>
            </dd>
          </div>
          {run.effortLevel && (
            <div className="output-card__meta-row">
              <dt>Effort</dt>
              <dd>{run.effortLevel}</dd>
            </div>
          )}
        </dl>

        <p className="output-card__status-note">{status.note}</p>

        <div className="output-card__actions">
          <Link
            to={viewerPath}
            className="output-card__primary-action"
            aria-label={`Open playable build from ${run.modelDisplayName}`}
          >
            {isPlayable ? "Open playable build" : "Open build"}
            <span aria-hidden="true">&nbsp;&rarr;</span>
          </Link>
        </div>
      </div>
    </article>
  );
}
