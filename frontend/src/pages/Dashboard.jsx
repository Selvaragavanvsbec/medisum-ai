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

  /* ── Render ──────────────────────────────────────────── */
  return (
    <Shell>

      {/* PAGE HEADER */}
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:16, marginBottom:32, flexWrap:"wrap" }}>
        <div>
          <h1 style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:30, fontWeight:700, letterSpacing:"-0.02em", color:"var(--ink)", lineHeight:1.2 }}>
            Healthcare Automation Command Center
          </h1>
          <p style={{ fontSize:15, color:"var(--ink-soft)", marginTop:8, lineHeight:1.6 }}>
            Welcome back, <strong style={{ color:"var(--ink)" }}>{auth?.user?.name || "Practitioner"}</strong>.{" "}
            Monitoring patient indicators and auto-dispatched clinical workflows.
          </p>
        </div>
        <div style={{ display:"flex", gap:10, flexWrap:"wrap", flexShrink:0 }}>
          {reports.length === 0 && (
            <button className="btn btn-glass btn-sm" onClick={seedDemoData} style={{ fontSize:14 }}>
              <Icon d={P.star} style={{ color:"#f59e0b" }} /> Load Demo Sandbox
            </button>
          )}
          <Link to="/app/upload" className="btn btn-primary" style={{ fontSize:15 }}>
            <Icon d={P.upload} /> Upload Report
          </Link>
        </div>
      </div>

      {/* STAT CARDS */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(210px,1fr))", gap:20, marginBottom:28 }}>
        {STAT_CARDS.map((sc) => (
          <div key={sc.label} className="glass" style={{ padding:"22px 24px", borderRadius:18, display:"flex", alignItems:"center", gap:18 }}>
            <div style={{ width:54, height:54, borderRadius:15, background:sc.iconBg, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
              <Icon d={sc.icon} style={{ width:26, height:26, color:sc.iconC }} />
            </div>
            <div style={{ minWidth:0 }}>
              <div style={{ fontSize:11, fontWeight:700, color:"var(--ink-faint)", textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:5 }}>
                {sc.label}
              </div>
              <div style={{ fontSize:34, fontWeight:800, color:sc.valC, lineHeight:1, fontFamily:"'Space Grotesk',sans-serif", display:"flex", alignItems:"baseline", gap:3 }}>
                <Counter value={sc.value} />{sc.suffix || ""}
                {sc.pulse && <span style={{ width:8, height:8, borderRadius:"50%", background:"#fb7185", marginLeft:6, display:"inline-block", animation:"spin 1.2s linear infinite" }} />}
              </div>
              <div style={{ fontSize:13, color:"var(--ink-soft)", marginTop:5 }}>{sc.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* MAIN GRID */}
      <div style={{ display:"grid", gap:22 }}>

        {/* TREND CHART */}
        <div className="glass" style={card}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20, flexWrap:"wrap", gap:12 }}>
            <div>
              <h3 style={hdr}>Continuous Parameter Tracking</h3>
              <p style={sub}>Comparing extracted metrics across chronological reports</p>
            </div>
            {chartMetrics.length > 0 && (
              <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                {chartMetrics.map((m) => (
                  <button key={m} onClick={() => setActiveChartMetric(m)}
                    style={{
                      fontSize:13, fontWeight:600, padding:"6px 14px", borderRadius:10, border:"1px solid", cursor:"pointer", transition:"all .15s",
                      background: activeChartMetric===m ? "rgba(14,165,233,.2)" : "rgba(14,165,233,.05)",
                      color:       activeChartMetric===m ? "#38bdf8" : "var(--ink-soft)",
                      borderColor: activeChartMetric===m ? "rgba(14,165,233,.4)" : "rgba(14,165,233,.12)",
                    }}
                  >{m}</button>
                ))}
              </div>
            )}
          </div>

          {chartData.length < 2 ? (
            <div style={{ height:200, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", border:"1px dashed rgba(14,165,233,.15)", borderRadius:14, textAlign:"center", padding:24 }}>
              <Icon d={P.chart} style={{ width:38, height:38, color:"var(--ink-faint)", marginBottom:12 }} />
              <h4 style={{ fontSize:15, fontWeight:600, color:"var(--ink-soft)" }}>Insufficient Data for Trends</h4>
              <p style={{ fontSize:13, color:"var(--ink-faint)", maxWidth:340, marginTop:7, lineHeight:1.6 }}>
                Upload at least 2 medical reports to render diagnostic trends, or click <strong>Load Demo Sandbox</strong>.
              </p>
            </div>
          ) : (
            <div style={{ height:230 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top:10, right:10, left:-20, bottom:0 }}>
                  <defs>
                    <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="var(--violet)" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="var(--violet)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(14,165,233,.08)" />
                  <XAxis dataKey="date" stroke="var(--ink-faint)" fontSize={12} tickLine={false} />
                  <YAxis stroke="var(--ink-faint)" fontSize={12} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor:"var(--card-solid)", borderColor:"var(--line-2)", borderRadius:12, fontSize:13 }}
                    labelStyle={{ color:"var(--ink)", fontWeight:"bold" }}
                    itemStyle={{ color:"var(--violet-2)" }}
                  />
                  <Area type="monotone" dataKey={activeChartMetric} stroke="var(--violet)" strokeWidth={2.5} fillOpacity={1} fill="url(#colorMetric)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* HEALTH INDEX + ACTION LOG */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))", gap:22 }}>

          {/* Patient Health Index */}
          <div className="glass" style={card}>
            <h3 style={{ ...hdr, marginBottom:20 }}>Patient Health Index</h3>
            {reports.length === 0 ? (
              <div style={{ padding:"40px 0", textAlign:"center", fontSize:14, color:"var(--ink-faint)" }}>
                No score available. Upload a report to compute indices.
              </div>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", alignItems:"center" }}>
                <Ring
                  pct={stats.latestScore} size={120} stroke={10}
                  color={stats.latestScore>85?"var(--lime)":stats.latestScore>70?"var(--cyan)":"var(--fuchsia)"}
                  label={`${stats.latestScore}`}
                />
                <div style={{ width:"100%", display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:8, marginTop:22 }}>
                  {Object.entries(stats.scoreCategories).map(([cat, val]) => (
                    <div key={cat} style={{ display:"flex", flexDirection:"column", alignItems:"center", padding:"12px 6px", background:"rgba(14,165,233,.06)", border:"1px solid rgba(14,165,233,.1)", borderRadius:13 }}>
                      <span style={{ fontSize:10, color:"var(--ink-faint)", textTransform:"uppercase", fontWeight:700, letterSpacing:"0.06em" }}>{cat.slice(0,4)}</span>
                      <span style={{ fontSize:18, fontWeight:800, marginTop:5, color:"var(--ink)", fontFamily:"'Space Grotesk',sans-serif" }}>{val}</span>
                      <div style={{ width:"100%", background:"rgba(14,165,233,.12)", height:4, borderRadius:4, overflow:"hidden", marginTop:7 }}>
                        <div style={{ background:"var(--violet)", height:"100%", borderRadius:4, width:`${val}%`, transition:"width .8s ease" }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Real-Time Actions Log */}
          <div className="glass" style={card}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
              <h3 style={hdr}>Real-Time Actions Log</h3>
              <span style={{ fontSize:11, fontWeight:700, padding:"4px 12px", borderRadius:20, background:"rgba(16,185,129,.12)", color:"#34d399", display:"flex", alignItems:"center", gap:5, textTransform:"uppercase", letterSpacing:"0.07em" }}>
                <span style={{ width:6, height:6, borderRadius:"50%", background:"#34d399", display:"inline-block", animation:"spin 1.5s linear infinite" }} /> Live
              </span>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:12, maxHeight:290, overflowY:"auto" }}>
              {notifications.length === 0 ? (
                <div style={{ padding:"40px 0", textAlign:"center", fontSize:14, color:"var(--ink-faint)" }}>
                  No pipeline events yet. Upload a report to trigger automation.
                </div>
              ) : notifications.slice(0, 8).map((notif) => {
                const time = new Date(notif.at).toLocaleTimeString(undefined, { hour:"2-digit", minute:"2-digit" });
                const ns = notifStyle(notif.type);
                return (
                  <div key={notif.id} style={{ display:"flex", gap:14, paddingBottom:12, borderBottom:"1px solid rgba(14,165,233,.08)" }}>
                    <span style={{ width:38, height:38, borderRadius:11, background:ns.bg, color:ns.c, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                      <Icon d={notif.type==="alert"?P.warn:notif.type==="reminder"?P.clock:notif.type==="email"?P.mail:P.pulse} style={{ width:17, height:17 }} />
                    </span>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:8 }}>
                        <span style={{ fontSize:14, fontWeight:600, color:"var(--ink)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{notif.title}</span>
                        <span style={{ fontSize:11, color:"var(--ink-faint)", fontFamily:"'JetBrains Mono',monospace", flexShrink:0 }}>{time}</span>
                      </div>
                      <p style={{ fontSize:13, color:"var(--ink-soft)", marginTop:3, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{notif.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RECENT REPORTS + QUICK OPS */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))", gap:22 }}>

          {/* Recent Reports */}
          <div className="glass" style={{ borderRadius:18, overflow:"hidden" }}>
            <div style={{ padding:"18px 24px", borderBottom:"1px solid var(--line)", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <h3 style={hdr}>Recent Digitized Reports</h3>
              <Link to="/app/reports" style={{ fontSize:14, color:"var(--violet-2)", fontWeight:600, textDecoration:"none" }}>View All →</Link>
            </div>
            {reports.length === 0 ? (
              <div style={{ padding:"40px 24px", textAlign:"center", fontSize:14, color:"var(--ink-faint)" }}>
                No reports uploaded yet. Upload a report to start monitoring!
              </div>
            ) : reports.slice(0, 5).map((rep) => {
              const summary = rep.summary || {};
              const risk = summary.risk_level || "low";
              const rs = riskStyle(risk);
              return (
                <div key={rep.content_hash}
                  style={{ display:"flex", alignItems:"center", gap:16, padding:"15px 24px", borderBottom:"1px solid var(--line)", cursor:"pointer", transition:"background .15s" }}
                  onMouseEnter={e=>e.currentTarget.style.background="rgba(14,165,233,.05)"}
                  onMouseLeave={e=>e.currentTarget.style.background="transparent"}
                >
                  <span style={{ width:42, height:42, borderRadius:12, background:"rgba(14,165,233,.1)", color:"#38bdf8", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    <Icon d={P.file} style={{ width:19, height:19 }} />
                  </span>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:15, fontWeight:600, color:"var(--ink)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                      {summary.patient_details?.report_type || "General Lab"}
                    </div>
                    <div style={{ fontSize:13, color:"var(--ink-soft)", marginTop:3 }}>
                      {new Date(rep.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:10, flexShrink:0 }}>
                    <span style={{ fontSize:11, fontWeight:700, padding:"4px 11px", borderRadius:20, background:rs.bg, color:rs.c, textTransform:"uppercase", letterSpacing:"0.05em" }}>{risk}</span>
                    <span style={{ fontSize:16, fontWeight:800, color:"var(--ink)", fontFamily:"'Space Grotesk',sans-serif" }}>{summary.health_score?.overall || "—"}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Operations */}
          <div className="glass" style={card}>
            <h3 style={{ ...hdr, marginBottom:18 }}>Quick Operations</h3>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              {QUICK_OPS.map((op) => (
                <Link key={op.to} to={op.to}
                  style={{ padding:"18px 14px", background:op.bg, border:"1px solid rgba(14,165,233,.1)", borderRadius:14, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", textAlign:"center", textDecoration:"none", transition:"all .2s", gap:9 }}
                  onMouseEnter={e=>{ e.currentTarget.style.transform="translateY(-3px)"; e.currentTarget.style.boxShadow="0 10px 28px rgba(14,165,233,.15)"; }}
                  onMouseLeave={e=>{ e.currentTarget.style.transform="none"; e.currentTarget.style.boxShadow="none"; }}
                >
                  <Icon d={op.icon} style={{ width:24, height:24, color:op.c }} />
                  <span style={{ fontSize:14, fontWeight:700, color:"var(--ink)" }}>{op.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

      </div>
    </Shell>
  );
}
