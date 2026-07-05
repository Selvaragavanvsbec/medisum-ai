import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import Shell from "./Shell.jsx";
import { Icon, P } from "../icons.jsx";
import { useAuth } from "../auth.jsx";
import { useToast, Ring, Counter } from "../ui.jsx";
import { useHealth } from "../context/HealthContext.jsx";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";

/* ── Inline style helpers ─────────────────────────────── */
const card = { padding: "24px 28px", borderRadius: 18 };
const hdr  = { fontSize: 17, fontWeight: 700, color: "var(--ink)", fontFamily: "'Space Grotesk',sans-serif" };
const sub  = { fontSize: 13, color: "var(--ink-soft)", marginTop: 4, lineHeight: 1.5 };

export default function Dashboard() {
  const { auth } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const { reports, reminders, alerts, notifications, addReport } = useHealth();
  const [activeChartMetric, setActiveChartMetric] = useState("Hemoglobin");

  /* ── Demo seed ─────────────────────────────────────── */
  const seedDemoData = () => {
    const demoReports = [
      {
        content_hash: "demo-hba1c-" + Date.now(), reading_level: "simple",
        created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
        summary: {
          overview: "Diabetes progress monitoring report.",
          health_score: { overall: 75, categories: { heart: 90, diabetes: 65, kidney: 80, liver: 85, blood: 85 } },
          key_findings: [
            { item: "Blood Sugar", value: "320 mg/dL", meaning: "Significantly high.", flag: "high" },
            { item: "Hemoglobin", value: "11.2 g/dL", meaning: "Mild anemia.", flag: "low" },
          ],
          alerts: [{ item: "Blood Sugar", value: "320 mg/dL", severity: "red", risk_percentage: 85, reason: "Severe hyperglycemia.", suggested_action: "See doctor immediately." }],
          reminders: [{ text: "Follow-up after 15 days", days_suggested: 15, reason: "Re-check glucose." }],
          patient_details: { age: "48", gender: "male", test_date: "June 04, 2026", report_type: "HbA1c Diabetes Panel" },
          medicines: ["Metformin 500mg"], lifestyle_suggestions: ["Reduce carbs.", "Daily walking."],
          risk_level: "high", emergency_warning: "Blood Sugar critically elevated.",
        },
      },
      {
        content_hash: "demo-lipid-" + Date.now(), reading_level: "simple",
        created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
        summary: {
          overview: "Lipid panel showing cardiovascular biomarkers.",
          health_score: { overall: 82, categories: { heart: 70, diabetes: 85, kidney: 88, liver: 85, blood: 88 } },
          key_findings: [
            { item: "Total Cholesterol", value: "245 mg/dL", meaning: "High cholesterol.", flag: "high" },
            { item: "Blood Sugar", value: "180 mg/dL", meaning: "Elevated glucose.", flag: "high" },
            { item: "Hemoglobin", value: "12.8 g/dL", meaning: "Healthy oxygen.", flag: "normal" },
          ],
          alerts: [{ item: "Total Cholesterol", value: "245 mg/dL", severity: "yellow", risk_percentage: 45, reason: "Mild hypercholesterolemia.", suggested_action: "Low-fat diet." }],
          reminders: [{ text: "Review after one month", days_suggested: 30, reason: "Check cholesterol." }],
          patient_details: { age: "48", gender: "male", test_date: "June 19, 2026", report_type: "Lipid Panel" },
          medicines: [], lifestyle_suggestions: ["Use olive oil.", "Add omega-3."],
          risk_level: "medium", emergency_warning: "",
        },
      },
      {
        content_hash: "demo-cbc-" + Date.now(), reading_level: "simple",
        created_at: new Date().toISOString(),
        summary: {
          overview: "Recent blood count showing recovery.",
          health_score: { overall: 89, categories: { heart: 92, diabetes: 90, kidney: 90, liver: 92, blood: 84 } },
          key_findings: [
            { item: "Blood Sugar", value: "110 mg/dL", meaning: "Normal range.", flag: "normal" },
            { item: "Total Cholesterol", value: "205 mg/dL", meaning: "Under control.", flag: "normal" },
            { item: "Hemoglobin", value: "13.6 g/dL", meaning: "Recovered.", flag: "normal" },
          ],
          alerts: [],
          reminders: [{ text: "Visit physician in 2 weeks", days_suggested: 14, reason: "Routine wellness." }],
          patient_details: { age: "48", gender: "male", test_date: "July 04, 2026", report_type: "Routine CBC & Lipid" },
          medicines: ["Metformin 500mg"], lifestyle_suggestions: ["Low-glycemic foods.", "Aerobic exercise."],
          risk_level: "low", emergency_warning: "",
        },
      },
    ];
    demoReports.forEach((r) => addReport(r));
    toast("Demo reports, alerts & reminders loaded!", "ok");
  };

  /* ── Derived stats ─────────────────────────────────── */
  const stats = useMemo(() => {
    const totalReports  = reports.length;
    const activeAlerts  = alerts.filter((a) => a.severity === "red" || a.severity === "yellow").length;
    const activeReminders = reminders.filter((r) => r.status === "pending").length;
    const latest        = reports[0];
    const latestScore   = latest?.summary?.health_score?.overall || 0;
    const scoreCategories = latest?.summary?.health_score?.categories || { heart: 0, diabetes: 0, kidney: 0, liver: 0, blood: 0 };
    return { totalReports, activeAlerts, activeReminders, latestScore, scoreCategories };
  }, [reports, alerts, reminders]);

  const chartData = useMemo(() =>
    [...reports].reverse().map((rep) => {
      const date = new Date(rep.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" });
      const pt = { date };
      (rep.summary?.key_findings || []).forEach((f) => {
        const n = parseFloat(f.value);
        if (!isNaN(n)) pt[f.item] = n;
      });
      return pt;
    }), [reports]);

  const chartMetrics = useMemo(() => {
    const s = new Set();
    reports.forEach((r) => (r.summary?.key_findings || []).forEach((f) => {
      if (!isNaN(parseFloat(f.value))) s.add(f.item);
    }));
    return Array.from(s);
  }, [reports]);

  /* ── Config ─────────────────────────────────────────── */
  const STAT_CARDS = [
    { label: "Reports Digitized",   value: stats.totalReports,   icon: P.file,    iconBg: "rgba(14,165,233,.15)",  iconC: "#38bdf8", valC: "#38bdf8", sub: "Aggregated diagnostics history" },
    { label: "Active Alerts",       value: stats.activeAlerts,   icon: P.warn,    iconBg: "rgba(244,63,94,.15)",   iconC: "#fb7185", valC: "#fb7185", sub: "Pulsing severity tracking", pulse: true },
    { label: "Follow-Up Reminders", value: stats.activeReminders,icon: P.clock,   iconBg: "rgba(6,182,212,.15)",   iconC: "#22d3ee", valC: "#22d3ee", sub: "Active reminders pending" },
    { label: "Overall Health Score",value: stats.latestScore,    icon: P.heart,   iconBg: "rgba(16,185,129,.15)",  iconC: "#34d399", valC: "#34d399", sub: "Derived from latest report", suffix: stats.latestScore > 0 ? "%" : "" },
  ];

  const QUICK_OPS = [
    { to: "/app/upload",    icon: P.upload,   label: "New Scan",       bg: "rgba(14,165,233,.1)",  c: "#38bdf8" },
    { to: "/app/alerts",    icon: P.warn,     label: "Clinical Alerts",bg: "rgba(244,63,94,.1)",   c: "#fb7185" },
    { to: "/app/reminders", icon: P.clock,    label: "Reminders",      bg: "rgba(6,182,212,.1)",   c: "#22d3ee" },
    { to: "/app/history",   icon: P.chart,    label: "History",        bg: "rgba(14,165,233,.1)",  c: "#38bdf8" },
    { to: "/app/reports",   icon: P.file,     label: "Reports DB",     bg: "rgba(16,185,129,.1)",  c: "#34d399" },
    { to: "/app/settings",  icon: P.settings, label: "Preferences",    bg: "rgba(100,116,139,.1)", c: "var(--ink-soft)" },
  ];

  const riskStyle = (risk) =>
    risk === "high" || risk === "critical" ? { bg: "rgba(244,63,94,.12)", c: "#fb7185" }
    : risk === "medium" ? { bg: "rgba(245,158,11,.12)", c: "#fbbf24" }
    : { bg: "rgba(16,185,129,.12)", c: "#34d399" };

  const notifStyle = (type) =>
    type === "alert"    ? { bg: "rgba(244,63,94,.15)",  c: "#fb7185" }
    : type === "reminder" ? { bg: "rgba(6,182,212,.15)",  c: "#22d3ee" }
    : type === "email"    ? { bg: "rgba(14,165,233,.15)", c: "#38bdf8" }
    : { bg: "rgba(16,185,129,.15)", c: "#34d399" };

  return (
    <Shell>
      {/* PAGE HEADER */}
      <div className="page-head anim-fade-up">
        <div>
          <h1 className="grad-text">Healthcare Automation Command Center</h1>
          <p>Welcome back, <strong>{auth?.user?.name || "Practitioner"}</strong>. Monitoring active clinical indicators and auto-dispatched alerts.</p>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", flexShrink: 0 }}>
          {reports.length === 0 && (
            <button className="btn btn-glass btn-sm" onClick={seedDemoData}>
              <Icon d={P.star} style={{ color: "#f59e0b" }} /> Load Sandbox Demo
            </button>
          )}
          <Link to="/app/upload" className="btn btn-primary btn-sm">
            <Icon d={P.upload} /> Upload Report
          </Link>
        </div>
      </div>

      {/* STAT CARDS */}
      <div className="stats anim-fade-up anim-fade-up-d1">
        {STAT_CARDS.map((sc, i) => (
          <div key={sc.label} className="glass stat">
            <div className="flex justify-between items-start mb-3">
              <div className="ico" style={{ backgroundColor: sc.iconBg, color: sc.iconC }}>
                <Icon d={sc.icon} />
              </div>
              {sc.pulse && (
                <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                </span>
              )}
            </div>
            <div className="num">
              <Counter value={sc.value} />{sc.suffix || ""}
            </div>
            <div className="lbl">{sc.label}</div>
            <p style={{ fontSize: 11, color: "var(--ink-faint)", marginTop: 6 }}>{sc.sub}</p>
          </div>
        ))}
      </div>

      {/* MAIN BENTO GRID */}
      <div className="bento-grid anim-fade-up anim-fade-up-d2">
        {/* CHART - span-8 */}
        <div className="glass bento-span-8 p-6">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
            <div>
              <h3 style={hdr}>Continuous Parameter Tracking</h3>
              <p style={sub}>Chronological comparison of extracted biomarkers</p>
            </div>
            {chartMetrics.length > 0 && (
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {chartMetrics.map((m) => (
                  <button key={m} onClick={() => setActiveChartMetric(m)}
                    className="btn btn-glass btn-sm"
                    style={{
                      padding: "6px 12px",
                      background: activeChartMetric === m ? "var(--grad-violet)" : "rgba(99,102,241,0.05)",
                      color: activeChartMetric === m ? "#fff" : "var(--ink-soft)",
                      borderColor: activeChartMetric === m ? "transparent" : "var(--line)",
                    }}
                  >{m}</button>
                ))}
              </div>
            )}
          </div>

          {chartData.length < 2 ? (
            <div className="empty" style={{ border: "1px dashed var(--line)", borderRadius: 16 }}>
              <div className="eico"><Icon d={P.chart} /></div>
              <h3>Insufficient Data for Trends</h3>
              <p>Upload 2 or more reports to view parameter progression curves, or load the Sandbox Demo.</p>
            </div>
          ) : (
            <div style={{ height: 240, marginTop: 10 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--violet-2)" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="var(--violet-2)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,.06)" />
                  <XAxis dataKey="date" stroke="var(--ink-faint)" fontSize={11} tickLine={false} />
                  <YAxis stroke="var(--ink-faint)" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "var(--card-solid)", borderColor: "var(--line-2)", borderRadius: 12, fontSize: 13, color: "var(--ink)" }}
                    labelStyle={{ color: "var(--ink)", fontWeight: "bold" }}
                  />
                  <Area type="monotone" dataKey={activeChartMetric} stroke="var(--violet-2)" strokeWidth={3} fillOpacity={1} fill="url(#colorMetric)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* HEALTH SCORE RING - span-4 */}
        <div className="glass bento-span-4 p-6 flex flex-col justify-between">
          <div>
            <h3 style={hdr}>Patient Health Index</h3>
            <p style={sub}>Composite score across core organs</p>
          </div>
          
          {reports.length === 0 ? (
            <div className="empty py-12">No medical metrics computed yet.</div>
          ) : (
            <div className="flex flex-col items-center justify-center my-4" style={{ flex: 1 }}>
              <div style={{ position: "relative" }}>
                <Ring
                  pct={stats.latestScore} size={130} stroke={11}
                  color={stats.latestScore > 85 ? "var(--lime)" : stats.latestScore > 70 ? "var(--cyan-2)" : "var(--rose)"}
                  label={`${stats.latestScore}%`}
                />
                <span className="absolute w-2 h-2 bg-purple-500 rounded-full" style={{ top: 8, right: 12, animation: "orbit 4s linear infinite" }} />
              </div>

              <div style={{ width: "100%", display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 6, marginTop: 20 }}>
                {Object.entries(stats.scoreCategories).map(([cat, val]) => (
                  <div key={cat} className="glass-inset p-2 text-center" style={{ borderRadius: 10 }}>
                    <span style={{ fontSize: 9, color: "var(--ink-faint)", textTransform: "uppercase", fontWeight: 700 }}>{cat.slice(0, 4)}</span>
                    <div style={{ fontSize: 15, fontWeight: 800, marginTop: 2, color: "var(--ink)", fontFamily: "'Space Grotesk',sans-serif" }}>{val}</div>
                    <div style={{ width: "100%", background: "rgba(99,102,241,.1)", height: 3, borderRadius: 2, overflow: "hidden", marginTop: 5 }}>
                      <div style={{ background: "var(--violet-2)", height: "100%", width: `${val}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* LIVE ACTIONS LOG - span-6 */}
        <div className="glass bento-span-6 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 style={hdr}>Real-Time Activity Stream</h3>
            <div className="sys-status">
              <span className="sys-dot"></span>
              Live Feed
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, maxHeight: 310, overflowY: "auto" }}>
            {notifications.length === 0 ? (
              <div className="empty">No platform updates triggered yet.</div>
            ) : notifications.slice(0, 6).map((notif) => {
              const time = new Date(notif.at).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
              const ns = notifStyle(notif.type);
              return (
                <div key={notif.id} className="flex gap-3 p-3 glass-inset" style={{ borderRadius: 12 }}>
                  <span className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: ns.bg, color: ns.c }}>
                    <Icon d={notif.type === "alert" ? P.warn : notif.type === "reminder" ? P.clock : notif.type === "email" ? P.mail : P.pulse} style={{ width: 17, height: 17 }} />
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="flex items-center justify-between gap-4">
                      <span style={{ fontSize: 13.5, fontWeight: 700, color: "var(--ink)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{notif.title}</span>
                      <span style={{ fontSize: 10, color: "var(--ink-faint)", fontFamily: "'JetBrains Mono',monospace" }}>{time}</span>
                    </div>
                    <p style={{ fontSize: 12, color: "var(--ink-soft)", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{notif.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RECENT REPORTS - span-6 */}
        <div className="glass bento-span-6 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 style={hdr}>Recent Digitized Labs</h3>
            <Link to="/app/reports" className="btn btn-glass btn-sm" style={{ padding: "6px 12px" }}>View Database →</Link>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, maxHeight: 310, overflowY: "auto" }}>
            {reports.length === 0 ? (
              <div className="empty">No scan reports imported.</div>
            ) : reports.slice(0, 4).map((rep) => {
              const summary = rep.summary || {};
              const risk = summary.risk_level || "low";
              const rs = riskStyle(risk);
              return (
                <div key={rep.content_hash} className="flex items-center justify-between p-3 glass-inset hover:border-indigo-500/30 transition-all" style={{ borderRadius: 12 }}>
                  <div className="flex items-center gap-3">
                    <span className="w-9 h-9 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center flex-shrink-0">
                      <Icon d={P.file} style={{ width: 18, height: 18 }} />
                    </span>
                    <div>
                      <div className="font-semibold text-sm text-zinc-100 truncate" style={{ maxWidth: 160 }}>
                        {summary.patient_details?.report_type || "General Analysis"}
                      </div>
                      <div className="text-[11px] text-zinc-500 mt-0.5">{new Date(rep.created_at).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider" style={{ backgroundColor: rs.bg, color: rs.c }}>
                      {risk}
                    </span>
                    <span className="font-bold text-base text-zinc-200" style={{ fontFamily: "'Space Grotesk',sans-serif" }}>
                      {summary.health_score?.overall || "—"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* QUICK OPERATIONS - span-12 */}
        <div className="glass bento-span-12 p-6">
          <h3 style={{ ...hdr, marginBottom: 16 }}>Operational Quick Actions</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12 }}>
            {QUICK_OPS.map((op) => (
              <Link key={op.to} to={op.to} className="glass-inset p-4 flex flex-col items-center justify-center text-center hover:border-indigo-500/30 transition-all" style={{ borderRadius: 14, gap: 8 }}>
                <Icon d={op.icon} style={{ width: 22, height: 22, color: op.c }} />
                <span style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)" }}>{op.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </Shell>
  );
}
