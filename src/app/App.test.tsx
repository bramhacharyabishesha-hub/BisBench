import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import App from "../app/App";

describe("App shell", () => {
  it("renders the site header with the BisBench mark", () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    );

    expect(screen.getByRole("link", { name: "BisBench" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Outputs are the benchmark.",
    );
  });

  it("renders the Benchmarks page at /benchmarks", () => {
    render(
      <MemoryRouter initialEntries={["/benchmarks"]}>
        <App />
      </MemoryRouter>,
    );
    expect(screen.getByRole("heading", { name: "Benchmarks" })).toBeVisible();
  });

  it("renders the Models page at /models", () => {
    render(
      <MemoryRouter initialEntries={["/models"]}>
        <App />
      </MemoryRouter>,
    );
    expect(screen.getByRole("heading", { name: "Models" })).toBeVisible();
  });

  it("renders the Method page at /method", () => {
    render(
      <MemoryRouter initialEntries={["/method"]}>
        <App />
      </MemoryRouter>,
    );
    expect(screen.getByRole("heading", { name: "Method" })).toBeVisible();
  });
});
