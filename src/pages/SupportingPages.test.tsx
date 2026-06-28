import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import { BenchmarksPage } from "./BenchmarksPage";
import { ModelsPage } from "./ModelsPage";
import { MethodPage } from "./MethodPage";

describe("BenchmarksPage", () => {
  it("lists every published benchmark from fixture content", () => {
    render(
      <MemoryRouter>
        <BenchmarksPage />
      </MemoryRouter>,
    );
    expect(screen.getByRole("heading", { name: "Benchmarks" })).toBeVisible();
    expect(
      screen.getByRole("link", { name: /Endless Runner/ }),
    ).toBeInTheDocument();
  });

  it("links each benchmark to its dossier route", () => {
    render(
      <MemoryRouter>
        <BenchmarksPage />
      </MemoryRouter>,
    );
    const link = screen.getByRole("link", { name: /Endless Runner/ });
    expect(link).toHaveAttribute("href", "/benchmarks/endless-runner");
  });
});

describe("ModelsPage", () => {
  it("lists every model from fixture content", () => {
    render(
      <MemoryRouter>
        <ModelsPage />
      </MemoryRouter>,
    );
    expect(screen.getByRole("heading", { name: "Models" })).toBeVisible();
    expect(screen.getByText("gpt-5.5")).toBeVisible();
    expect(screen.getByText("claude-opus")).toBeVisible();
    expect(screen.getByText("qwen3-coder")).toBeVisible();
    expect(screen.getByText("mistral-coder")).toBeVisible();
  });

  it("shows each model's provider and version", () => {
    render(
      <MemoryRouter>
        <ModelsPage />
      </MemoryRouter>,
    );
    expect(screen.getByText("OpenAI")).toBeVisible();
    expect(screen.getByText("Anthropic")).toBeVisible();
  });

  it("derives benchmark appearances from run data", () => {
    render(
      <MemoryRouter>
        <ModelsPage />
      </MemoryRouter>,
    );
    const appearances = screen.getAllByRole("link", {
      name: "Endless Runner",
    });
    expect(appearances.length).toBeGreaterThanOrEqual(4);
  });

  it("shows weight availability per model", () => {
    render(
      <MemoryRouter>
        <ModelsPage />
      </MemoryRouter>,
    );
    expect(screen.getAllByText("available").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("closed").length).toBeGreaterThanOrEqual(1);
  });
});

describe("MethodPage", () => {
  it("renders the method heading and lede", () => {
    render(
      <MemoryRouter>
        <MethodPage />
      </MemoryRouter>,
    );
    expect(screen.getByRole("heading", { name: "Method" })).toBeVisible();
  });

  it("renders the run protocol text from content", () => {
    render(
      <MemoryRouter>
        <MethodPage />
      </MemoryRouter>,
    );
    expect(screen.getByText("Run protocol v1")).toBeVisible();
    expect(screen.getByText(/Exact prompt/)).toBeVisible();
  });

  it("renders artifact isolation explanation", () => {
    render(
      <MemoryRouter>
        <MethodPage />
      </MemoryRouter>,
    );
    expect(screen.getByText("Artifact isolation")).toBeVisible();
    expect(screen.getByText(/allow-scripts allow-pointer-lock/)).toBeVisible();
  });

  it("renders what BisBench does not measure", () => {
    render(
      <MemoryRouter>
        <MethodPage />
      </MemoryRouter>,
    );
    const headings = screen.getAllByRole("heading", {
      name: "What BisBench does not measure",
    });
    expect(headings.length).toBeGreaterThanOrEqual(1);
  });
});
