import "./MethodPage.css";

const protocolModules = import.meta.glob("../../content/protocols/*.md", {
  eager: true,
  import: "default",
  query: "?raw",
});

function getProtocolText(version: string): string {
  const key = `../../content/protocols/${version}.md`;
  const text = protocolModules[key];
  if (typeof text !== "string") return "";
  return text;
}

export function MethodPage() {
  const protocolText = getProtocolText("v1");

  return (
    <section className="method-page">
      <header className="method-page__header">
        <h1>Method</h1>
        <p className="method-page__lede">
          How BisBench captures runs, isolates artifacts, and what it does not
          measure.
        </p>
      </header>

      <article className="method-page__protocol">
        <h2>Run protocol v1</h2>
        <pre className="method-page__protocol-text">{protocolText}</pre>
      </article>

      <section className="method-page__section">
        <h2>Artifact isolation</h2>
        <p>
          Every playable result is untrusted model-generated HTML and
          JavaScript. It is rendered inside an <code>iframe</code> with{" "}
          <code>sandbox="allow-scripts allow-pointer-lock"</code>. The sandbox
          does not grant <code>allow-same-origin</code>, forms, popups,
          top-navigation, downloads, or storage access. The iframe is only
          created after a visitor explicitly presses Play.
        </p>
        <p>
          Client-side sandboxing reduces risk but does not make arbitrary code
          trustworthy. BisBench never executes artifact JavaScript during
          ingestion, testing, or screenshot generation.
        </p>
      </section>

      <section className="method-page__section">
        <h2>What BisBench does not measure</h2>
        <ul>
          <li>Overall model quality. A single task does not rank models.</li>
          <li>
            Cost, latency, or token efficiency (deferred to a later version).
          </li>
          <li>Robustness across many tasks. V1 has one benchmark.</li>
          <li>
            Automated gameplay quality. Visitors judge the output themselves by
            looking and playing.
          </li>
          <li>Public submissions, voting, or accounts.</li>
        </ul>
      </section>
    </section>
  );
}
