import { NavLink } from "react-router-dom";

import "./SiteHeader.css";

const navItems = [
  { to: "/benchmarks", label: "Benchmarks" },
  { to: "/models", label: "Models" },
  { to: "/method", label: "Method" },
];

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <NavLink to="/" end className="site-header__mark">
          BisBench
        </NavLink>
        <nav className="site-header__nav" aria-label="Primary">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => (isActive ? "is-active" : undefined)}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
