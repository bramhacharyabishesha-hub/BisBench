import { Link } from "react-router-dom";

import { getBenchmarks, getModels } from "../content/loadBenchmarks";
import type { BenchmarkManifest, ModelManifest } from "../content/types";

import "./ModelsPage.css";

interface ModelAppearance {
  readonly benchmark: BenchmarkManifest;
  readonly runCount: number;
  readonly statuses: readonly string[];
}

function deriveAppearances(): Map<string, ModelAppearance[]> {
  const appearances = new Map<string, ModelAppearance[]>();
  for (const benchmark of getBenchmarks()) {
    const byModel = new Map<string, ModelAppearance>();
    for (const run of benchmark.runs) {
      const existing = byModel.get(run.modelId);
      if (existing) {
        byModel.set(run.modelId, {
          benchmark,
          runCount: existing.runCount + 1,
          statuses: [...new Set([...existing.statuses, run.status])],
        });
      } else {
        byModel.set(run.modelId, {
          benchmark,
          runCount: 1,
          statuses: [run.status],
        });
      }
    }
    for (const [modelId, appearance] of byModel) {
      const list = appearances.get(modelId) ?? [];
      list.push(appearance);
      appearances.set(modelId, list);
    }
  }
  return appearances;
}

export function ModelsPage() {
  const models = getModels();
  const appearances = deriveAppearances();

  return (
    <section className="models-page">
      <header className="models-page__header">
        <h1>Models</h1>
        <p className="models-page__lede">
          Models present in published runs, with their benchmark appearances.
        </p>
      </header>

      <ul className="models-page__list">
        {models.map((model: ModelManifest) => {
          const apps = appearances.get(model.id) ?? [];
          return (
            <li key={model.id} className="models-page__item">
              <div className="models-page__item-head">
                <h2 className="models-page__item-title">{model.identifier}</h2>
                <span className="models-page__item-provider">
                  {model.provider}
                </span>
              </div>
              <dl className="models-page__meta">
                <div className="models-page__meta-row">
                  <dt>Version</dt>
                  <dd>{model.version}</dd>
                </div>
                <div className="models-page__meta-row">
                  <dt>Access</dt>
                  <dd>{model.accessMode}</dd>
                </div>
                <div className="models-page__meta-row">
                  <dt>Weights</dt>
                  <dd>{model.weightsAvailable ? "available" : "closed"}</dd>
                </div>
                {model.license && (
                  <div className="models-page__meta-row">
                    <dt>License</dt>
                    <dd>{model.license}</dd>
                  </div>
                )}
              </dl>
              <div className="models-page__appearances">
                <h3 className="models-page__appearances-title">Appearances</h3>
                <ul className="models-page__appearances-list">
                  {apps.map((app) => (
                    <li
                      key={app.benchmark.slug}
                      className="models-page__appearance"
                    >
                      <Link to={`/benchmarks/${app.benchmark.slug}`}>
                        {app.benchmark.title}
                      </Link>
                      <span className="models-page__appearance-meta">
                        {app.runCount} run{app.runCount > 1 ? "s" : ""} ·{" "}
                        {app.statuses.join(", ")}
                      </span>
                    </li>
                  ))}
                  {apps.length === 0 && (
                    <li className="models-page__appearance models-page__appearance--empty">
                      No published runs yet.
                    </li>
                  )}
                </ul>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
