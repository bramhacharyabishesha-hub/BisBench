import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";

import { ArtifactViewerPage } from "./ArtifactViewerPage";
import { ArtifactFrame } from "../viewer/ArtifactFrame";
import { initialViewerModel, play } from "../viewer/viewerState";

function renderViewer(path = "/benchmarks/endless-runner/runs/gpt-5-5") {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route
          path="/benchmarks/:benchmarkSlug/runs/:runSlug"
          element={<ArtifactViewerPage />}
        />
      </Routes>
    </MemoryRouter>,
  );
}

describe("ArtifactViewerPage", () => {
  it("renders the model name and benchmark breadcrumb outside the iframe", () => {
    renderViewer();
    expect(screen.getByRole("heading", { name: "GPT-5.5" })).toBeVisible();
    expect(screen.getByText("endless-runner")).toBeVisible();
  });

  it("does not create an iframe before the visitor presses Play", () => {
    const { container } = renderViewer();
    expect(container.querySelector("iframe")).toBeNull();
  });

  it("shows a Play button in idle state", () => {
    renderViewer();
    const playButtons = screen.getAllByRole("button", { name: "Play build" });
    expect(playButtons.length).toBeGreaterThanOrEqual(1);
  });

  it("creates the iframe only after Play is pressed", async () => {
    const user = userEvent.setup();
    const { container } = renderViewer();
    expect(container.querySelector("iframe")).toBeNull();

    const playButton = screen.getAllByRole("button", { name: "Play build" })[0];
    await user.click(playButton);

    const iframe = container.querySelector("iframe");
    expect(iframe).not.toBeNull();
  });

  it("sets the iframe sandbox to allow-scripts allow-pointer-lock only", async () => {
    const user = userEvent.setup();
    const { container } = renderViewer();
    const playButton = screen.getAllByRole("button", { name: "Play build" })[0];
    await user.click(playButton);

    const iframe = container.querySelector("iframe");
    expect(iframe).not.toBeNull();
    const sandbox = iframe!.getAttribute("sandbox") || "";
    expect(sandbox).toContain("allow-scripts");
    expect(sandbox).toContain("allow-pointer-lock");
    expect(sandbox).not.toContain("allow-same-origin");
    expect(sandbox).not.toContain("allow-forms");
    expect(sandbox).not.toContain("allow-popups");
    expect(sandbox).not.toContain("allow-top-navigation");
    expect(sandbox).not.toContain("allow-downloads");
  });

  it("gives the iframe a descriptive title", async () => {
    const user = userEvent.setup();
    const { container } = renderViewer();
    const playButton = screen.getAllByRole("button", { name: "Play build" })[0];
    await user.click(playButton);

    const iframe = container.querySelector("iframe");
    expect(iframe?.getAttribute("title")).toBe(
      "GPT-5.5 build for endless-runner",
    );
  });

  it("renders an Exit build control outside the iframe", () => {
    renderViewer();
    expect(screen.getByText("Exit build")).toBeVisible();
  });

  it("renders a not-found state for an unknown run", () => {
    render(
      <MemoryRouter initialEntries={["/benchmarks/endless-runner/runs/nope"]}>
        <Routes>
          <Route
            path="/benchmarks/:benchmarkSlug/runs/:runSlug"
            element={<ArtifactViewerPage />}
          />
        </Routes>
      </MemoryRouter>,
    );
    expect(
      screen.getByRole("heading", { name: "Run not found" }),
    ).toBeVisible();
  });
});

describe("ArtifactFrame", () => {
  it("renders nothing in idle state", () => {
    const { container } = render(
      <MemoryRouter>
        <ArtifactFrame
          model={initialViewerModel()}
          artifactPath="endless-runner/gpt-5-5/"
          title="test"
          onLoad={vi.fn()}
          onError={vi.fn()}
        />
      </MemoryRouter>,
    );
    expect(container.querySelector("iframe")).toBeNull();
  });

  it("renders an iframe when in loading state", () => {
    const { container } = render(
      <MemoryRouter>
        <ArtifactFrame
          model={play(initialViewerModel())}
          artifactPath="endless-runner/gpt-5-5/"
          title="test"
          onLoad={vi.fn()}
          onError={vi.fn()}
        />
      </MemoryRouter>,
    );
    const iframe = container.querySelector("iframe");
    expect(iframe).not.toBeNull();
    expect(iframe?.getAttribute("src")).toBe(
      "/artifacts/endless-runner/gpt-5-5/index.html",
    );
  });

  it("does not grant allow-same-origin", () => {
    const { container } = render(
      <MemoryRouter>
        <ArtifactFrame
          model={play(initialViewerModel())}
          artifactPath="endless-runner/gpt-5-5/"
          title="test"
          onLoad={vi.fn()}
          onError={vi.fn()}
        />
      </MemoryRouter>,
    );
    const sandbox = container.querySelector("iframe")?.getAttribute("sandbox");
    expect(sandbox).not.toContain("allow-same-origin");
  });
});
