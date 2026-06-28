import type { BenchmarkManifest } from "../content/types";
import { formatDateLong } from "../utils/formatDate";

import "./BenchmarkMetadata.css";

interface BenchmarkMetadataProps {
  benchmark: BenchmarkManifest;
}

export function BenchmarkMetadata({ benchmark }: BenchmarkMetadataProps) {
  const runCount = benchmark.runs.length;
  const modelIds = new Set(benchmark.runs.map((r) => r.modelId));
  const capturedDates = [...benchmark.runs.map((r) => r.capturedAt)].sort();
  const earliest = capturedDates[0];
  const protocolVersions = new Set(
    benchmark.runs.map((r) => r.protocolVersion),
  );

  return (
    <aside className="benchmark-metadata" aria-label="Benchmark metadata">
      <dl className="benchmark-metadata__list">
        <div className="benchmark-metadata__row">
          <dt>Benchmark ID</dt>
          <dd>
            <code>{benchmark.slug}</code>
          </dd>
        </div>
        <div className="benchmark-metadata__row">
          <dt>Task</dt>
          <dd>{benchmark.title}</dd>
        </div>
        <div className="benchmark-metadata__row">
          <dt>Models</dt>
          <dd>{modelIds.size}</dd>
        </div>
        <div className="benchmark-metadata__row">
          <dt>Runs</dt>
          <dd>{runCount}</dd>
        </div>
        <div className="benchmark-metadata__row">
          <dt>Published</dt>
          <dd>
            <time dateTime={benchmark.publishedAt}>
              {formatDateLong(benchmark.publishedAt)}
            </time>
          </dd>
        </div>
        <div className="benchmark-metadata__row">
          <dt>Captured</dt>
          <dd>
            <time dateTime={earliest}>{formatDateLong(earliest)}</time>
          </dd>
        </div>
        <div className="benchmark-metadata__row">
          <dt>Protocol</dt>
          <dd>
            <code>{[...protocolVersions].join(", ")}</code>
          </dd>
        </div>
        <div className="benchmark-metadata__row">
          <dt>Artifact format</dt>
          <dd>{benchmark.environment.artifactFormat}</dd>
        </div>
        <div className="benchmark-metadata__row">
          <dt>Network access</dt>
          <dd>{benchmark.environment.networkAccess}</dd>
        </div>
        <div className="benchmark-metadata__row benchmark-metadata__row--notes">
          <dt>Environment</dt>
          <dd>{benchmark.environment.notes}</dd>
        </div>
      </dl>
    </aside>
  );
}
