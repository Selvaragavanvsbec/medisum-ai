import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { Icon, P } from "./icons.jsx";

const ThemeCtx = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    try {
      return sessionStorage.getItem("medisum_theme") || "dark";
    } catch {
      return "dark";
    }
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try {
      sessionStorage.setItem("medisum_theme", theme);
    } catch {
      /* ignore */
    }
  }, [theme]);

  const toggle = useCallback(() => setTheme((t) => (t === "dark" ? "light" : "dark")), []);

  return <ThemeCtx.Provider value={{ theme, toggle }}>{children}</ThemeCtx.Provider>;
}

export function useTheme() {
  return useContext(ThemeCtx);
}

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <button className="theme-btn" onClick={toggle} aria-label="Toggle theme" title="Toggle theme (dark / light)">
      <Icon d={theme === "dark" ? P.sun : P.moon} />
    </button>
  );
}
