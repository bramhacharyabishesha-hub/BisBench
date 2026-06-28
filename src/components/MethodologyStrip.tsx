import { Link } from "react-router-dom";

import type { BenchmarkManifest } from "../content/types";

import "./MethodologyStrip.css";

interface MethodologyStripProps {
  benchmark: BenchmarkManifest;
}

export function MethodologyStrip({ benchmark }: MethodologyStripProps) {
  return (
    <section className="methodology-strip" aria-label="Methodology">
      <h2 className="methodology-strip__title">Methodology</h2>
      <ul className="methodology-strip__list">
        <li className="methodology-strip__item">
          <span className="methodology-strip__label">Prompt</span>
          <span className="methodology-strip__value">
            <code>{benchmark.promptPath}</code>
          </span>
        </li>
        <li className="methodology-strip__item">
          <span className="methodology-strip__label">Artifacts</span>
          <span className="methodology-strip__value">
            {benchmark.environment.artifactFormat}
          </span>
        </li>
        <li className="methodology-strip__item">
          <span className="methodology-strip__label">Run notes</span>
          <span className="methodology-strip__value">
            Per run, linked from each output card
          </span>
        </li>
        <li className="methodology-strip__item">
          <span className="methodology-strip__label">Source files</span>
          <span className="methodology-strip__value">
            <Link to="/method">How BisBench captures runs</Link>
          </span>
        </li>
      </ul>
    </section>
  );
}
