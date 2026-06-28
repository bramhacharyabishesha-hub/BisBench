import { SiteHeader } from "../components/SiteHeader";
import { SiteFooter } from "../components/SiteFooter";
import { AppRoutes } from "./routes";

export default function App() {
  return (
    <div className="app-shell">
      <SiteHeader />
      <main className="app-main">
        <AppRoutes />
      </main>
      <SiteFooter />
    </div>
  );
}
