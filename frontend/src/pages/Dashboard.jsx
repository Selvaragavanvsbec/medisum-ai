import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import Shell from "./Shell.jsx";
import { Icon, P } from "../icons.jsx";
import { useAuth } from "../auth.jsx";
import { useToast, Ring, Counter } from "../ui.jsx";
import { useHealth } from "../context/HealthContext.jsx";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export default function Dashboard() {
  const { auth } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const { reports, reminders, alerts, notifications, addReport } = useHealth();
  const [activeChartMetric, setActiveChartMetric] = useState("Hemoglobin");

  const seedDemoData = () => {
    const demoReports = [
      {
        content_hash: "demo-hba1c-" + Date.now(),
        reading_level: "simple",
        created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        summary: {
          overview: "Diabetes progress monitoring report showing blood sugar values.",
          health_score: { overall: 75, categories: { heart: 90, diabetes: 65, kidney: 80, liver: 85, blood: 85 } },
          key_findings: [
            { item: "Blood Sugar", value: "320 mg/dL (High)", meaning: "Significantly high blood glucose.", flag: "high" },
            { item: "Hemoglobin", value: "11.2 g/dL (Low)", meaning: "Mild anemia signs.", flag: "low" },
          ],
          alerts: [
            { item: "Blood Sugar", value: "320 mg/dL", severity: "red", risk_percentage: 85, reason: "Severe hyperglycemia detected.", suggested_action: "Consult doctor immediately." }
          ],
          reminders: [{ text: "Follow-up after 15 days", days_suggested: 15, reason: "Re-check glucose levels." }],
          patient_details: { age: "48", gender: "male", test_date: "June 04, 2026", report_type: "HbA1c Diabetes Panel" },
          medicines: ["Metformin 500mg"],
          lifestyle_suggestions: ["Reduce carbohydrate intake.", "Regular walking exercise."],
          risk_level: "high",
          emergency_warning: "Blood Sugar is critically elevated at 320 mg/dL.",
        }
      },
      {
        content_hash: "demo-lipid-" + Date.now(),
        reading_level: "simple",
        created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        summary: {
          overview: "Lipid panel showing cardiovascular biomarkers.",
          health_score: { overall: 82, categories: { heart: 70, diabetes: 85, kidney: 88, liver: 85, blood: 88 } },
          key_findings: [
            { item: "Total Cholesterol", value: "245 mg/dL (High)", meaning: "High cholesterol, watch diet.", flag: "high" },
            { item: "Blood Sugar", value: "180 mg/dL (High)", meaning: "Elevated postprandial glucose.", flag: "high" },
            { item: "Hemoglobin", value: "12.8 g/dL (Normal)", meaning: "Healthy oxygen level.", flag: "normal" },
          ],
          alerts: [
            { item: "Total Cholesterol", value: "245 mg/dL", severity: "yellow", risk_percentage: 45, reason: "Mild hypercholesterolemia.", suggested_action: "Adopt low-fat diet." }
          ],
          reminders: [{ text: "Review after one month", days_suggested: 30, reason: "Check cholesterol levels." }],
          patient_details: { age: "48", gender: "male", test_date: "June 19, 2026", report_type: "Lipid Panel" },
          medicines: [],
          lifestyle_suggestions: ["Substitute animal fats with olive oil.", "Add omega-3 fatty acids."],
          risk_level: "medium",
          emergency_warning: "",
        }
      },
      {
        content_hash: "demo-cbc-" + Date.now(),
        reading_level: "simple",
        created_at: new Date().toISOString(),
        summary: {
          overview: "Recent blood count showing recovery in metrics.",
          health_score: { overall: 89, categories: { heart: 92, diabetes: 90, kidney: 90, liver: 92, blood: 84 } },
          key_findings: [
            { item: "Blood Sugar", value: "110 mg/dL (Normal)", meaning: "Glucose is back in normal range.", flag: "normal" },
            { item: "Total Cholesterol", value: "205 mg/dL (Normal)", meaning: "Cholesterol is under control.", flag: "normal" },
            { item: "Hemoglobin", value: "13.6 g/dL (Normal)", meaning: "Hemoglobin recovered.", flag: "normal" },
          ],
          alerts: [],
          reminders: [{ text: "Visit physician in 2 weeks", days_suggested: 14, reason: "Routine wellness review." }],
          patient_details: { age: "48", gender: "male", test_date: "July 04, 2026", report_type: "Routine CBC & Lipid" },
          medicines: ["Metformin 500mg"],
          lifestyle_suggestions: ["Continue low-glycemic foods.", "Maintain aerobic exercises."],
          risk_level: "low",
          emergency_warning: "",
        }
      }
    ];
    demoReports.forEach((rep) => addReport(rep));
    toast("Demo reports, alerts & reminders loaded!", "ok");
  };

  const stats = useMemo(() => {
    const totalReports = reports.length;
    const activeAlerts = alerts.filter((a) => a.severity === "red" || a.severity === "yellow").length;
    const activeReminders = reminders.filter((r) => r.status === "pending").length;
    const latestReport = reports[0];
    const latestScore = latestReport?.summary?.health_score?.overall || 0;
    const scoreCategories = latestReport?.summary?.health_score?.categories || { heart: 0, diabetes: 0, kidney: 0, liver: 0, blood: 0 };
    return { totalReports, activeAlerts, activeReminders, latestScore, scoreCategories };
  }, [reports, alerts, reminders]);

  const chartData = useMemo(() => {
    return [...reports].reverse().map((rep) => {
      const date = new Date(rep.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" });
      const pt = { date };
      (rep.summary?.key_findings || []).forEach((f) => {
        const num = parseFloat(f.value);
        if (!isNaN(num)) pt[f.item] = num;
      });
      return pt;
    });
  }, [reports]);

  const availableChartMetrics = useMemo(() => {
    const metricsSet = new Set();
    reports.forEach((rep) => {
      (rep.summary?.key_findings || []).forEach((f) => {
        if (!isNaN(parseFloat(f.value))) metricsSet.add(f.item);
      });
    });
    return Array.from(metricsSet);
  }, [reports]);

  const STAT_CARDS = [
    { label: "Reports Digitized", value: stats.totalReports, color: "violet", icon: P.file, sub: "Aggregated diagnostics history" },
    { label: "Active Alerts", value: stats.activeAlerts, color: "pink", icon: P.warn, sub: "Pulsing severity tracking", pulse: true },
    { label: "Follow-Up Reminders", value: stats.activeReminders, color: "cyan", icon: P.clock, sub: "Active reminders pending" },
    { label: "Overall Health Score", value: stats.latestScore, color: "emerald", icon: P.heart, sub: "Derived from latest report", suffix: stats.latestScore > 0 ? "%" : "" },
  ];

  const colorMap = {
    violet: { bg: "bg-violet-500/10", text: "text-violet-400", val: "text-violet-300" },
    pink: { bg: "bg-pink-500/10", text: "text-pink-400", val: "text-pink-400" },
    cyan: { bg: "bg-cyan-500/10", text: "text-cyan-400", val: "text-cyan-400" },
    emerald: { bg: "bg-emerald-500/10", text: "text-emerald-400", val: "text-emerald-400" },
  };

  return (
    <Shell>
      <div className="page-head">
        <div>
          <h1>Healthcare Automation Command Center</h1>
          <p>Welcome back, {auth?.user?.name || "Practitioner"}. Monitoring patient indicators and auto-dispatched clinical workflows.</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {reports.length === 0 && (
            <button className="btn btn-glass btn-sm" onClick={seedDemoData}>
              <Icon d={P.star} className="text-amber-400" /> Load Demo Sandbox
            </button>
          )}
          <Link to="/app/upload" className="btn btn-primary btn-sm">
            <Icon d={P.upload} /> Upload Report
          </Link>
        </div>
      </div>

      {/* ── Stat Cards ─────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "14px", marginBottom: "22px" }}>
        {STAT_CARDS.map((card) => {
          const c = colorMap[card.color];
          return (
            <div key={card.label} className="glass p-4 rounded-2xl flex flex-col justify-between" style={{ minHeight: 110 }}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider leading-tight">{card.label}</span>
                <span className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${c.bg} ${c.text}`}>
                  <Icon d={card.icon} className="w-3.5 h-3.5" />
                </span>
              </div>
              <div className={`text-3xl font-bold font-mono mt-2 ${c.val}`}>
                <Counter value={card.value} />{card.suffix || ""}
              </div>
              <div className="text-[10px] text-zinc-500 mt-1 flex items-center gap-1">
                {card.pulse && <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-pulse flex-shrink-0" />}
                {card.sub}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Main Body ─────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "18px" }}>

        {/* Trend Chart */}
        <div className="glass p-5 rounded-2xl">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div>
              <h3 className="font-bold text-sm text-zinc-200">Continuous Parameter Tracking</h3>
              <p className="text-xs text-zinc-400">Comparing extracted metrics across chronological reports</p>
            </div>
            {availableChartMetrics.length > 0 && (
              <div className="flex gap-1.5 flex-wrap">
                {availableChartMetrics.map((metric) => (
                  <button
                    key={metric}
                    className={`text-[10px] px-2.5 py-1 rounded-lg border font-semibold transition-colors ${
                      activeChartMetric === metric
                        ? "bg-purple-500/20 text-purple-300 border-purple-500/40"
                        : "bg-zinc-900/40 text-zinc-400 border-purple-500/10 hover:text-white"
                    }`}
                    onClick={() => setActiveChartMetric(metric)}
                  >
                    {metric}
                  </button>
                ))}
              </div>
            )}
          </div>

          {chartData.length < 2 ? (
            <div className="h-48 flex flex-col items-center justify-center text-center p-4 border border-dashed border-purple-500/10 rounded-xl">
              <Icon d={P.chart} className="w-8 h-8 text-zinc-600 mb-2" />
              <h4 className="text-xs font-semibold text-zinc-400">Insufficient Data for Trends</h4>
              <p className="text-[10px] text-zinc-500 max-w-xs mt-1">Upload at least 2 medical reports to render diagnostic trends, or click Load Demo Sandbox.</p>
            </div>
          ) : (
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--violet)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="var(--violet)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(167,139,250,0.08)" />
                  <XAxis dataKey="date" stroke="#8b7fb0" fontSize={10} tickLine={false} />
                  <YAxis stroke="#8b7fb0" fontSize={10} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#160a2b", borderColor: "rgba(167,139,250,.3)", borderRadius: "12px" }}
                    labelStyle={{ color: "#fff", fontWeight: "bold", fontSize: 11 }}
                    itemStyle={{ color: "var(--violet-2)", fontSize: 11 }}
                  />
                  <Area type="monotone" dataKey={activeChartMetric} stroke="var(--violet)" strokeWidth={2} fillOpacity={1} fill="url(#colorMetric)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* 2-col: Health Index + Notifications */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "18px" }}>

          {/* Patient Health Index */}
          <div className="glass p-5 rounded-2xl">
            <h3 className="font-bold text-sm text-zinc-200 mb-4">Patient Health Index</h3>
            {reports.length === 0 ? (
              <div className="py-6 text-center text-xs text-zinc-500">No score available. Upload a report to compute indices.</div>
            ) : (
              <div className="flex flex-col items-center">
                <Ring pct={stats.latestScore} size={100} stroke={8} color={stats.latestScore > 85 ? "var(--lime)" : stats.latestScore > 70 ? "var(--cyan)" : "var(--pink)"} label={`${stats.latestScore}`} />
                <div className="w-full grid grid-cols-5 gap-1.5 mt-4">
                  {Object.entries(stats.scoreCategories).map(([cat, val]) => (
                    <div key={cat} className="flex flex-col items-center p-1.5 bg-zinc-900/40 border border-purple-500/5 rounded-xl">
                      <span className="text-[9px] text-zinc-400 uppercase font-bold tracking-tight">{cat.slice(0, 4)}</span>
                      <span className="text-xs font-mono font-bold mt-1 text-zinc-100">{val}</span>
                      <div className="w-full bg-zinc-800 h-1 rounded-full overflow-hidden mt-1.5">
                        <div className="bg-violet-500 h-full rounded-full" style={{ width: `${val}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Real-Time Actions Log */}
          <div className="glass p-5 rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-sm text-zinc-200">Real-Time Actions Log</h3>
              <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-bold uppercase flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-emerald-400 animate-ping" /> Live
              </span>
            </div>
            <div className="flex flex-col gap-2.5 max-h-52 overflow-y-auto pr-1">
              {notifications.length === 0 ? (
                <div className="py-8 text-center text-xs text-zinc-500">No pipeline events yet. Upload a report to trigger automation.</div>
              ) : (
                notifications.slice(0, 8).map((notif) => {
                  const time = new Date(notif.at).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
                  return (
                    <div key={notif.id} className="flex gap-2.5 text-xs border-b border-purple-500/5 pb-2 last:border-0">
                      <span className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        notif.type === "alert" ? "bg-red-500/15 text-red-400" :
                        notif.type === "reminder" ? "bg-cyan-500/15 text-cyan-400" :
                        notif.type === "email" ? "bg-violet-500/15 text-violet-400" :
                        "bg-emerald-500/15 text-emerald-400"
                      }`}>
                        <Icon d={notif.type === "alert" ? P.warn : notif.type === "reminder" ? P.clock : notif.type === "email" ? P.mail : P.pulse} className="w-3 h-3" />
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-zinc-200 truncate">{notif.title}</span>
                          <span className="text-[9px] text-zinc-500 font-mono ml-1 flex-shrink-0">{time}</span>
                        </div>
                        <p className="text-[11px] text-zinc-400 mt-0.5 truncate">{notif.desc}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* 2-col: Recent Reports + Quick Actions */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "18px" }}>

          {/* Recent Reports */}
          <div className="glass rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-purple-500/10 flex items-center justify-between">
              <h3 className="font-bold text-sm text-zinc-200">Recent Digitized Reports</h3>
              <Link to="/app/reports" className="text-xs text-purple-400 hover:text-purple-300 transition-colors">View All →</Link>
            </div>
            {reports.length === 0 ? (
              <div className="p-6 text-center text-xs text-zinc-500">No reports uploaded yet. Upload a report to start monitoring!</div>
            ) : (
              <div className="divide-y divide-purple-500/5">
                {reports.slice(0, 4).map((rep) => {
                  const summary = rep.summary || {};
                  const risk = summary.risk_level || "low";
                  const riskColor = risk === "high" || risk === "critical" ? "text-red-400 bg-red-500/10" : risk === "medium" ? "text-amber-400 bg-amber-500/10" : "text-emerald-400 bg-emerald-500/10";
                  return (
                    <div key={rep.content_hash} className="flex items-center gap-3 px-4 py-3 hover:bg-purple-500/5 transition-colors">
                      <span className="w-7 h-7 rounded-lg bg-violet-500/10 text-violet-400 flex items-center justify-center flex-shrink-0">
                        <Icon d={P.file} className="w-3.5 h-3.5" />
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-zinc-200 truncate">{summary.patient_details?.report_type || "General Lab"}</div>
                        <div className="text-[10px] text-zinc-500">{new Date(rep.created_at).toLocaleDateString()}</div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${riskColor}`}>{risk}</span>
                        <span className="text-xs font-mono font-bold text-zinc-300">{summary.health_score?.overall || "—"}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Operations */}
          <div className="glass p-5 rounded-2xl">
            <h3 className="font-bold text-sm text-zinc-200 mb-4">Quick Operations</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { to: "/app/upload", icon: P.upload, label: "New Scan", color: "text-purple-400" },
                { to: "/app/alerts", icon: P.warn, label: "Clinical Alerts", color: "text-pink-400" },
                { to: "/app/reminders", icon: P.clock, label: "Reminders", color: "text-cyan-400" },
                { to: "/app/history", icon: P.chart, label: "History", color: "text-violet-400" },
                { to: "/app/reports", icon: P.file, label: "Reports DB", color: "text-emerald-400" },
                { to: "/app/settings", icon: P.settings, label: "Preferences", color: "text-zinc-400" },
              ].map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="p-3 bg-zinc-900/40 hover:bg-purple-500/10 border border-purple-500/5 rounded-xl flex flex-col items-center justify-center text-center transition-all hover:border-purple-500/20 hover:scale-[1.02]"
                >
                  <Icon d={item.icon} className={`w-5 h-5 mb-1.5 ${item.color}`} />
                  <span className="text-[10px] font-bold text-zinc-300">{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Shell>
  );
}
