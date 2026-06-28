import { useState } from "react";
import { Link } from "react-router-dom";

import "./PromptExcerpt.css";

interface PromptExcerptProps {
  /** Raw markdown text of the exact prompt. */
  promptText: string;
  /** Path to the method page section explaining prompt equality. */
  methodPath?: string;
}

function truncate(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;
  const slice = text.slice(0, maxChars);
  const lastLine = slice.lastIndexOf("\n");
  return `${slice.slice(0, lastLine > 0 ? lastLine : maxChars).trimEnd()}…`;
}

export function PromptExcerpt({
  promptText,
  methodPath = "/method",
}: PromptExcerptProps) {
  const [expanded, setExpanded] = useState(false);
  const fullText = promptText.trim();
  const excerpt = truncate(fullText, 360);
  const isTruncated = excerpt.length < fullText.length;

  return (
    <section className="prompt-excerpt" aria-label="Exact prompt">
      <header className="prompt-excerpt__header">
        <h2 className="prompt-excerpt__title">Exact prompt</h2>
        <p className="prompt-excerpt__subtitle">
          Every model received this prompt verbatim.{" "}
          <Link to={methodPath}>Read the run protocol</Link>.
        </p>
      </header>

      <div className="prompt-excerpt__body">
        {expanded ? (
          <pre className="prompt-excerpt__pre">{fullText}</pre>
        ) : (
          <pre className="prompt-excerpt__pre">{excerpt}</pre>
        )}
      </div>

      {isTruncated && (
        <button
          type="button"
          className="prompt-excerpt__toggle"
          aria-expanded={expanded}
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded ? "Show less" : "Show full prompt"}
        </button>
      )}
    </section>
  );
}
