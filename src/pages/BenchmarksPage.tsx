import { Link } from "react-router-dom";

import { getBenchmarks } from "../content/loadBenchmarks";
import { formatDateLong } from "../utils/formatDate";

import "./BenchmarksPage.css";

export function BenchmarksPage() {
  const benchmarks = getBenchmarks();

  return (
    <section className="benchmarks-page">
      <header className="benchmarks-page__header">
        <h1>Benchmarks</h1>
        <p className="benchmarks-page__lede">
          Published benchmarks. V1 contains one benchmark; the data model
          supports more.
        </p>
      </header>

      <ul className="benchmarks-page__list">
        {benchmarks.map((benchmark) => {
          const modelCount = new Set(benchmark.runs.map((r) => r.modelId)).size;
          return (
            <li key={benchmark.slug} className="benchmarks-page__item">
              <Link
                to={`/benchmarks/${benchmark.slug}`}
                className="benchmarks-page__link"
              >
                <span className="benchmarks-page__item-title">
                  {benchmark.title}
                </span>
                <span className="benchmarks-page__item-meta">
                  {modelCount} models · {benchmark.runs.length} runs · published{" "}
                  {formatDateLong(benchmark.publishedAt)}
                </span>
                <span className="benchmarks-page__item-summary">
                  {benchmark.summary}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
