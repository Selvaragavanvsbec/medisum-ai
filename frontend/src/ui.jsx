import { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";
import { Icon, P } from "./icons.jsx";

/* ---------------- Toasts ---------------- */
const ToastCtx = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const push = useCallback((message, kind = "info") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, message, kind }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  }, []);
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="toast-wrap">
        {toasts.map((t) => (
          <div className={`toast ${t.kind}`} key={t.id}>
            <Icon d={t.kind === "ok" ? P.checkc : t.kind === "err" ? P.warn : P.info} />
            {t.message}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}
export const useToast = () => useContext(ToastCtx);

/* ---------------- Confetti ---------------- */
const COLORS = ["#8b5cf6", "#e879f9", "#22d3ee", "#a3e635", "#fbbf24", "#f472b6"];
export function fireConfetti() {
  const layer = document.createElement("div");
  layer.className = "confetti";
  document.body.appendChild(layer);
  const n = 90;
  for (let i = 0; i < n; i++) {
    const p = document.createElement("i");
    p.style.left = Math.random() * 100 + "vw";
    p.style.background = COLORS[i % COLORS.length];
    p.style.animationDuration = 1.8 + Math.random() * 1.4 + "s";
    p.style.animationDelay = Math.random() * 0.3 + "s";
    p.style.transform = `rotate(${Math.random() * 360}deg)`;
    layer.appendChild(p);
  }
  setTimeout(() => layer.remove(), 3600);
}

/* ---------------- Animated counter ---------------- */
export function Counter({ value, duration = 1000, decimals = 0, suffix = "" }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef();
  useEffect(() => {
    const target = Number(value) || 0;
    const start = performance.now();
    cancelAnimationFrame(ref.current);
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(target * eased);
      if (t < 1) ref.current = requestAnimationFrame(tick);
      else setDisplay(target);
    };
    ref.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(ref.current);
  }, [value, duration]);
  return (
    <>{decimals ? display.toFixed(decimals) : Math.round(display).toLocaleString()}{suffix}</>
  );
}

/* ---------------- Progress ring ---------------- */
export function Ring({ pct = 50, size = 46, stroke = 5, color = "var(--violet-2)", label }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const [off, setOff] = useState(c);
  useEffect(() => {
    const id = requestAnimationFrame(() => setOff(c - (Math.min(100, Math.max(0, pct)) / 100) * c));
    return () => cancelAnimationFrame(id);
  }, [pct, c]);
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)", flexShrink: 0 }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--line)" strokeWidth={stroke} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeLinecap="round" strokeDasharray={c} strokeDashoffset={off}
        style={{ transition: "stroke-dashoffset 1s cubic-bezier(.2,.8,.2,1)" }}
      />
      {label && (
        <text x="50%" y="50%" dominantBaseline="central" textAnchor="middle"
          transform={`rotate(90 ${size / 2} ${size / 2})`}
          style={{ fontSize: 11, fontWeight: 600, fill: "var(--ink)", fontFamily: "'JetBrains Mono',monospace" }}>
          {label}
        </text>
      )}
    </svg>
  );
}
