import { useParams } from "react-router-dom";

import {
  getBenchmarkBySlug,
  getFeaturedBenchmark,
  resolveRuns,
} from "../content/loadBenchmarks";
import type { BenchmarkManifest } from "../content/types";
import { BenchmarkMetadata } from "../components/BenchmarkMetadata";
import { PromptExcerpt } from "../components/PromptExcerpt";
import { OutputCard } from "../components/OutputCard";
import { MethodologyStrip } from "../components/MethodologyStrip";

import "./BenchmarkDossierPage.css";

const promptModules = import.meta.glob("../../content/prompts/*.md", {
  eager: true,
  import: "default",
  query: "?raw",
});

function getPromptText(promptPath: string): string {
  const key = `../../content/prompts/${promptPath}`;
  const text = promptModules[key];
  if (typeof text !== "string") {
    throw new Error(
      `Prompt file "${promptPath}" was not found at ${key}. Add it under content/prompts/.`,
    );
  }
  return text;
}

function Dossier({ benchmark }: { benchmark: BenchmarkManifest }) {
  const runs = resolveRuns(benchmark);
  const promptText = getPromptText(benchmark.promptPath);

  return (
    <div className="dossier">
      <section className="dossier__identity">
        <p className="dossier__task-label">Benchmark</p>
        <h2 className="dossier__task-title">{benchmark.title}</h2>
        <p className="dossier__summary">{benchmark.summary}</p>
      </section>

      <div className="dossier__layout">
        <div className="dossier__rail">
          <section className="dossier__statement">
            <h1 className="dossier__statement-text">
              Outputs are the benchmark.
            </h1>
            <p className="dossier__statement-support">
              Compare coding models through the software they actually produce.
            </p>
          </section>
          <PromptExcerpt promptText={promptText} />
          <BenchmarkMetadata benchmark={benchmark} />
        </div>

        <div className="dossier__matrix" role="list">
          {runs.map((run) => (
            <div role="listitem" key={run.slug}>
              <OutputCard run={run} />
            </div>
          ))}
        </div>
      </div>

      <MethodologyStrip benchmark={benchmark} />
    </div>
  );
}

export function BenchmarkDossierPage() {
  const { benchmarkSlug } = useParams();
  const benchmark = benchmarkSlug
    ? getBenchmarkBySlug(benchmarkSlug)
    : getFeaturedBenchmark();

  if (!benchmark) {
    return (
      <section className="dossier dossier--missing">
        <h1>Benchmark not found</h1>
        <p>
          No benchmark exists at <code>{benchmarkSlug}</code>.{" "}
          <a href="/">Return to the featured benchmark</a>.
        </p>
      </section>
    );
  }

  return <Dossier benchmark={benchmark} />;
}
