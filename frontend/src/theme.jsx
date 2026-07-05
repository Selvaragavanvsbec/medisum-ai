import { createContext, useContext, useState, useEffect } from "react";
import { Icon, P } from "./icons.jsx";

const ThemeCtx = createContext(null);

export function ThemeProvider({ children }) {
  // Always lock theme to light (morning) mode
  const theme = "light";

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", "light");
  }, []);

  const toggle = () => {};

  return <ThemeCtx.Provider value={{ theme, toggle }}>{children}</ThemeCtx.Provider>;
}

export function useTheme() {
  return useContext(ThemeCtx);
}

export function ThemeToggle() {
  return (
    <div 
      className="theme-btn text-amber-500 flex items-center justify-center" 
      style={{ cursor: "default", background: "rgba(245, 158, 11, 0.08)", borderColor: "rgba(245, 158, 11, 0.2)" }} 
      title="Locked to Morning Mode"
    >
      <Icon d={P.sun} className="w-[18px] h-[18px]" style={{ animation: "spin 12s linear infinite" }} />
    </div>
  );
}

