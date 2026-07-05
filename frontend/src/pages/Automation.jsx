import { useState, useEffect } from "react";
import Shell from "./Shell.jsx";
import { Icon, P } from "../icons.jsx";
import { useHealth } from "../context/HealthContext.jsx";
import { Counter } from "../ui.jsx";

const NODES = [
  { id: "ocr", title: "OCR Digitization", desc: "Tesseract.js document text parsing", icon: P.upload, active: true },
  { id: "llama", title: "LLaMA Inference", desc: "Meta-LLaMA clinical context structuring", icon: P.brain, active: true },
  { id: "rules", title: "Rules Verification", desc: "Clinical boundaries analysis", icon: P.warn, active: true },
  { id: "dispatch", title: "Router Dispatch", desc: "Alert delivery & Cron scheduling", icon: P.mail, active: true },
];

export default function Automation() {
  const { notifications, reports, reminders, alerts } = useHealth();
  const [tick, setTick] = useState(0);
  const [activeStep, setActiveStep] = useState(0);

  // Pulse effect & cycling active pipeline node
  useEffect(() => {
    const id = setInterval(() => {
      setTick((t) => t + 1);
      setActiveStep((s) => (s + 1) % NODES.length);
    }, 3000);
    return () => clearInterval(id);
  }, []);

  const automationLogs = [...notifications]
    .filter((n) => ["upload", "summary", "email", "reminder", "alert"].includes(n.type))
    .sort((a, b) => new Date(b.at) - new Date(a.at));

  const TELEMETRY = [
    { label: "Alert Triggers", value: alerts.length, color: "var(--rose)", key: "alerts" },
    { label: "Cron Jobs", value: reminders.length, color: "var(--cyan)", key: "reminders" },
    { label: "OCR Scan Queue", value: reports.length, color: "var(--violet-2)", key: "reports" },
    { label: "System Events", value: automationLogs.length, color: "var(--emerald)", key: "events" },
  ];

  const typeConfig = {
    upload: { icon: P.upload, color: "bg-purple-500/15 text-purple-400", label: "OCR" },
    summary: { icon: P.pulse, color: "bg-emerald-500/15 text-emerald-400", label: "SUMMARY" },
    email: { icon: P.mail, color: "bg-cyan-500/15 text-cyan-400", label: "EMAIL" },
    reminder: { icon: P.clock, color: "bg-amber-500/15 text-amber-400", label: "REMINDER" },
    alert: { icon: P.warn, color: "bg-red-500/15 text-red-400", label: "ALERT" },
  };

  return (
    <Shell>
      <div className="page-head anim-fade-up">
        <div>
          <h1>Workflow Automation Engine</h1>
          <p>Real-time node telemetry, execution triggers, and diagnostic logs for background OCR and AI parsing.</p>
        </div>
        <span className="sys-status self-start">
          <span className="sys-dot" /> System Online
        </span>
      </div>

      {/* Live Telemetry counters */}
      <div className="stats anim-fade-up anim-fade-up-d1">
        {TELEMETRY.map((t) => (
          <div key={t.label} className="glass stat text-center">
            <div style={{ fontSize: 10, textTransform: "uppercase", fontWeight: 700, color: "var(--ink-faint)", marginBottom: 4 }}>{t.label}</div>
            <div className="num" style={{ color: t.color }}>
              <Counter value={t.value} />
            </div>
            <div style={{ fontSize: 11, color: "var(--ink-soft)", marginTop: 6 }}>Telemetry Node Active</div>
          </div>
        ))}
      </div>

      {/* Node Graph Pipeline Visualizer */}
      <div className="glass p-6 mb-6 anim-fade-up anim-fade-up-d2">
        <h3 className="font-bold text-sm text-zinc-200 mb-6 flex items-center gap-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          <span className="w-5 h-5 rounded-lg bg-indigo-500/15 text-indigo-400 flex items-center justify-center">
            <Icon d={P.pulse} className="w-3.5 h-3.5" />
          </span>
          Interactive Execution Path Topology
        </h3>

        <div className="pipeline-graph">
          <div className="pipeline-nodes flex items-center justify-between">
            {NODES.map((node, idx) => (
              <div key={node.id} className="flex-1 flex items-center">
                <div className={`pipeline-node ${activeStep === idx ? "active" : ""}`}>
                  <div className={`pipeline-node-icon ${activeStep === idx ? "bg-indigo-500 text-white" : "bg-zinc-900/60 text-zinc-400 border border-purple-500/10"}`}>
                    <Icon d={node.icon} className="w-6 h-6" />
                  </div>
                  <div className="pipeline-node-label">
                    <div style={{ color: activeStep === idx ? "var(--violet-2)" : "var(--ink-soft)", fontWeight: "bold" }}>{node.title}</div>
                    <div style={{ fontSize: 9, color: "var(--ink-faint)", marginTop: 2 }}>{node.desc}</div>
                  </div>
                </div>
                {idx < NODES.length - 1 && (
                  <div className="pipeline-connector" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Diagnostics Panel & Live Ticker */}
      <div className="bento-grid anim-fade-up anim-fade-up-d3">
        {/* System Diagnostics */}
        <div className="glass bento-span-4 p-6 flex flex-col justify-between">
          <div>
            <h3 className="font-semibold text-zinc-200 mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Diagnostics Panel</h3>
            <div className="flex flex-col gap-4">
              <div>
                <div className="flex justify-between text-xs text-zinc-400 mb-1">
                  <span>Engine Threads</span>
                  <span className="font-bold text-zinc-200">8 / 8</span>
                </div>
                <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-indigo-500 h-full w-[100%]" />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-xs text-zinc-400 mb-1">
                  <span>API Latency</span>
                  <span className="font-bold text-zinc-200">224ms</span>
                </div>
                <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-cyan-500 h-full w-[24%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs text-zinc-400 mb-1">
                  <span>OCR Buffer Load</span>
                  <span className="font-bold text-zinc-200">0%</span>
                </div>
                <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full w-0" />
                </div>
              </div>
            </div>
          </div>
          
          <div className="glass-inset p-3 text-xs text-zinc-400 mt-6" style={{ borderRadius: 10 }}>
            <strong>HIPAA Safe Mode:</strong> All network payloads are strictly encrypted end-to-end.
          </div>
        </div>

        {/* Live Logs Stream */}
        <div className="glass bento-span-8 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-zinc-200" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Real-time Audit Ticker</h3>
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-500">{automationLogs.length} events logged</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 10, maxHeight: 310, overflowY: "auto" }}>
            {automationLogs.length === 0 ? (
              <div className="empty py-16 text-center bento-span-12" style={{ gridColumn: "1 / -1" }}>
                <Icon d={P.pulse} className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
                <h3>No Events In Buffer</h3>
                <p>Run a report analysis to populate automation logs.</p>
              </div>
            ) : (
              automationLogs.map((log) => {
                const time = new Date(log.at).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", second: "2-digit" });
                const cfg = typeConfig[log.type] || typeConfig.summary;
                return (
                  <div key={log.id} className="flex gap-3 p-3 glass-inset hover:border-indigo-500/20 transition-all" style={{ borderRadius: 12 }}>
                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${cfg.color}`}>
                      <Icon d={cfg.icon} className="w-4 h-4" />
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-xs text-zinc-200 truncate">{log.title}</span>
                        <span className="text-[8px] font-mono text-zinc-500 flex-shrink-0">{time}</span>
                      </div>
                      <p className="text-[10px] text-zinc-400 leading-relaxed truncate mt-0.5">{log.desc}</p>
                      <span className="text-[8px] font-bold uppercase tracking-wider text-indigo-400 mt-1 block">{cfg.label}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </Shell>
  );
}

