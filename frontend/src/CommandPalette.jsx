import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Icon, P } from "./icons.jsx";
import { useTheme } from "./theme.jsx";
import { useAuth } from "./auth.jsx";

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(0);
  const inputRef = useRef();
  const nav = useNavigate();
  const { toggle } = useTheme();
  const { auth, logout } = useAuth();
  const isAdmin = auth?.user?.role === "admin";

  const commands = useMemo(() => {
    const base = [
      { icon: P.grid, title: "Dashboard", sub: "Platform overview", run: () => nav("/app") },
      { icon: P.upload, title: "Upload Report", sub: "Scan new diagnostics", run: () => nav("/app/upload") },
      { icon: P.file, title: "Reports Database", sub: "Structured summaries list", run: () => nav("/app/reports") },
      { icon: P.clock, title: "Diagnostic History", sub: "Chronological patient progress", run: () => nav("/app/history") },
      { icon: P.pulse, title: "Workflows & Automation", sub: "System automation logs", run: () => nav("/app/automation") },
      { icon: P.warn, title: "Clinical Alerts", sub: "Active warnings and dispatches", run: () => nav("/app/alerts") },
      { icon: P.bell, title: "Follow-Up Reminders", sub: "Checkups calendar and manager", run: () => nav("/app/reminders") },
      { icon: P.settings, title: "Settings & Thresholds", sub: "Custom options", run: () => nav("/app/settings") },
      { icon: P.trend, title: "Health trends", sub: "View parameters charts", run: () => nav("/app/trends") },
      { icon: P.user, title: "Profile", sub: "Your account details", run: () => nav("/app/profile") },
      { icon: P.sun, title: "Toggle theme", sub: "Dark / light mode", run: () => toggle() },
      { icon: P.home, title: "Home", sub: "Welcome landing page", run: () => nav("/") },
      { icon: P.logout, title: "Log out", sub: "End session", run: () => { logout(); nav("/login"); } },
    ];
    if (isAdmin) {
      base.splice(3, 0,
        { icon: P.grid, title: "Admin overview", sub: "Platform stats", run: () => nav("/admin") },
        { icon: P.users, title: "Manage users", sub: "User admin", run: () => nav("/admin/users") },
      );
    }
    return base;
  }, [nav, toggle, logout, isAdmin]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return commands;
    return commands.filter((c) => (c.title + " " + c.sub).toLowerCase().includes(s));
  }, [q, commands]);

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (open) {
      setQ("");
      setSel(0);
      setTimeout(() => inputRef.current?.focus(), 40);
    }
  }, [open]);

  useEffect(() => setSel(0), [q]);

  if (!open) return null;

  const run = (c) => { setOpen(false); c.run(); };

  const onKeyDown = (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setSel((s) => Math.min(s + 1, filtered.length - 1)); }
    if (e.key === "ArrowUp") { e.preventDefault(); setSel((s) => Math.max(s - 1, 0)); }
    if (e.key === "Enter" && filtered[sel]) run(filtered[sel]);
  };

  return (
    <div className="cmdk-ov" onClick={() => setOpen(false)}>
      <div className="cmdk" onClick={(e) => e.stopPropagation()}>
        <div className="cmdk-input">
          <Icon d={P.search} />
          <input ref={inputRef} value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={onKeyDown}
            placeholder="Type a command or search…" />
          <span className="kbd">ESC</span>
        </div>
        <div className="cmdk-list">
          {filtered.length === 0 ? (
            <div style={{ padding: 20, textAlign: "center", color: "var(--ink-faint)", fontSize: 14 }}>No results</div>
          ) : filtered.map((c, i) => (
            <div className={`cmdk-item ${i === sel ? "sel" : ""}`} key={c.title}
              onMouseEnter={() => setSel(i)} onClick={() => run(c)}>
              <div className="ci"><Icon d={c.icon} /></div>
              <div><div className="ct">{c.title}</div><div className="cs">{c.sub}</div></div>
            </div>
          ))}
        </div>
        <div className="cmdk-foot">
          <span><span className="kbd">↑↓</span> navigate</span>
          <span><span className="kbd">↵</span> select</span>
          <span><span className="kbd">⌘K</span> toggle</span>
        </div>
      </div>
    </div>
  );
}
