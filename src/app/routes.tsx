import { Route, Routes } from "react-router-dom";

import { BenchmarkDossierPage } from "../pages/BenchmarkDossierPage";
import { ArtifactViewerPage } from "../pages/ArtifactViewerPage";
import { BenchmarksPage } from "../pages/BenchmarksPage";
import { ModelsPage } from "../pages/ModelsPage";
import { MethodPage } from "../pages/MethodPage";

interface PlaceholderProps {
  title: string;
  description: string;
}

function Placeholder({ title, description }: PlaceholderProps) {
  return (
    <section className="placeholder">
      <h1>{title}</h1>
      <p>{description}</p>
    </section>
  );
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<BenchmarkDossierPage />} />
      <Route path="/benchmarks" element={<BenchmarksPage />} />
      <Route
        path="/benchmarks/:benchmarkSlug"
        element={<BenchmarkDossierPage />}
      />
      <Route
        path="/benchmarks/:benchmarkSlug/runs/:runSlug"
        element={<ArtifactViewerPage />}
      />
      <Route path="/models" element={<ModelsPage />} />
      <Route path="/method" element={<MethodPage />} />
      <Route
        path="*"
        element={
          <Placeholder
            title="Not found"
            description="This page does not exist yet."
          />
        }
      />
    </Routes>
  );
}
