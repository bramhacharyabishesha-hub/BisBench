import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";

import { BenchmarkDossierPage } from "./BenchmarkDossierPage";
import { OutputCard } from "../components/OutputCard";
import { statusLabel } from "../components/statusLabel";
import type { ResolvedRun } from "../content/types";
import { getFeaturedBenchmark, resolveRuns } from "../content/loadBenchmarks";

function renderDossier(path = "/") {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <BenchmarkDossierPage />
    </MemoryRouter>,
  );
}

describe("BenchmarkDossierPage", () => {
  it("renders the positioning statement and task title from fixture content", () => {
    renderDossier();
    expect(screen.getByText("Outputs are the benchmark.")).toBeVisible();
    const taskTitle = screen.getByRole("heading", {
      level: 2,
      name: "Endless Runner",
    });
    expect(taskTitle).toBeVisible();
  });

  it("renders four output cards from fixture runs, not hardcoded", () => {
    renderDossier();
    const links = screen.getAllByRole("link", {
      name: /Open (playable )?build/i,
    });
    expect(links).toHaveLength(4);
  });

  it("renders every model display name from the fixture", () => {
    renderDossier();
    expect(screen.getByText("Fable 5")).toBeVisible();
    expect(screen.getByText("Claude Opus")).toBeVisible();
    expect(screen.getByText("Qwen3 Coder")).toBeVisible();
    expect(screen.getByText("Mistral Coder")).toBeVisible();
  });

  it("shows playable, partial, and failed status labels", () => {
    renderDossier();
    expect(screen.getAllByText("Playable").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Partial")).toHaveLength(1);
    expect(screen.getAllByText("Failed")).toHaveLength(1);
  });

  it("does not render any iframe on the dossier page", () => {
    const { container } = renderDossier();
    expect(container.querySelector("iframe")).toBeNull();
  });

  it("links each output to its viewer route", () => {
    renderDossier();
    const gptLink = screen.getByRole("link", {
      name: "Open playable build from Fable 5",
    });
    expect(gptLink).toHaveAttribute(
      "href",
      "/benchmarks/endless-runner/runs/fable-5",
    );
  });

  it("renders the benchmark ID in the metadata rail", () => {
    renderDossier();
    const rail = screen.getByLabelText("Benchmark metadata");
    expect(rail).toHaveTextContent("endless-runner");
    expect(rail).toHaveTextContent("Models");
    expect(rail).toHaveTextContent("Runs");
  });

  it("renders the exact prompt excerpt with the prompt text", () => {
    renderDossier();
    const promptSection = screen.getByLabelText("Exact prompt");
    expect(promptSection).toHaveTextContent("Build an endless runner");
  });

  it("expands the full prompt via keyboard-accessible toggle", async () => {
    const user = userEvent.setup();
    renderDossier();
    const toggle = screen.getByRole("button", {
      name: "Show full prompt",
    });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(
      screen.getByRole("button", { name: "Show less" }),
    ).toBeInTheDocument();
  });

  it("renders the methodology strip", () => {
    renderDossier();
    expect(
      screen.getByRole("heading", { level: 2, name: "Methodology" }),
    ).toBeVisible();
    const strip = screen.getByLabelText("Methodology");
    expect(strip).toHaveTextContent("Prompt");
    expect(strip).toHaveTextContent("Artifacts");
  });

  it("renders a not-found state for an unknown benchmark slug", () => {
    render(
      <MemoryRouter initialEntries={["/benchmarks/does-not-exist"]}>
        <Routes>
          <Route
            path="/benchmarks/:benchmarkSlug"
            element={<BenchmarkDossierPage />}
          />
        </Routes>
      </MemoryRouter>,
    );
    expect(
      screen.getByRole("heading", { name: "Benchmark not found" }),
    ).toBeVisible();
  });
});

describe("OutputCard", () => {
  function makeRun(overrides: Partial<ResolvedRun> = {}): ResolvedRun {
    const benchmark = getFeaturedBenchmark();
    const base = resolveRuns(benchmark)[0];
    return { ...base, ...overrides };
  }

  it("renders the model display name as a heading", () => {
    render(
      <MemoryRouter>
        <OutputCard run={makeRun()} />
      </MemoryRouter>,
    );
    expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent(
      "Fable 5",
    );
  });

  it("shows a preview image with meaningful alt text", () => {
    render(
      <MemoryRouter>
        <OutputCard run={makeRun()} />
      </MemoryRouter>,
    );
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("alt", expect.stringContaining("Fable 5"));
  });

  it("shows the playable status label and note for a playable run", () => {
    render(
      <MemoryRouter>
        <OutputCard run={makeRun({ status: "playable" })} />
      </MemoryRouter>,
    );
    expect(screen.getByText("Playable")).toBeVisible();
    expect(screen.getByText(/runs offline in a current browser/)).toBeVisible();
  });

  it("shows the partial status label and note for a partial run", () => {
    render(
      <MemoryRouter>
        <OutputCard run={makeRun({ status: "partial" })} />
      </MemoryRouter>,
    );
    expect(screen.getByText("Partial")).toBeVisible();
    expect(
      screen.getByText(/does not satisfy every requirement/),
    ).toBeVisible();
  });

  it("shows the failed status label and note for a failed run", () => {
    render(
      <MemoryRouter>
        <OutputCard run={makeRun({ status: "failed" })} />
      </MemoryRouter>,
    );
    expect(screen.getByText("Failed")).toBeVisible();
    expect(
      screen.getByText(/attempt is published transparently/),
    ).toBeVisible();
  });

  it("renders a keyboard-focusable link to the viewer", () => {
    render(
      <MemoryRouter>
        <OutputCard run={makeRun()} />
      </MemoryRouter>,
    );
    const link = screen.getByRole("link", {
      name: /Open (playable )?build/i,
    });
    expect(link.tagName).toBe("A");
    expect(link).toHaveAttribute("href", expect.stringContaining("/runs/"));
  });
});

describe("statusLabel", () => {
  it("returns a label for every status", () => {
    expect(statusLabel("playable").text).toBe("Playable");
    expect(statusLabel("partial").text).toBe("Partial");
    expect(statusLabel("failed").text).toBe("Failed");
  });

  it("every label has a non-empty note", () => {
    for (const status of ["playable", "partial", "failed"] as const) {
      expect(statusLabel(status).note.length).toBeGreaterThan(10);
    }
  });
});
