import { useState, useEffect } from "react";
import Shell from "./Shell.jsx";
import { Icon, P } from "../icons.jsx";
import { useHealth } from "../context/HealthContext.jsx";

const PIPELINE_STEPS = [
  { num: 1, title: "Optical Character Recognition (OCR)", desc: "Digitizes PDF / JPG reports into standard string blocks using Tesseract.js.", color: "bg-purple-500/15 text-purple-300" },
  { num: 2, title: "Meta LLaMA Inference", desc: "Translates complex clinical parameters using few-shot prompts and structured JSON templates.", color: "bg-cyan-500/15 text-cyan-300" },
  { num: 3, title: "Alert Severity Checker", desc: "Scans findings against clinical boundaries to assign alert badges (Green, Yellow, Red).", color: "bg-pink-500/15 text-pink-300" },
  { num: 4, title: "Scheduler & Dispatch Router", desc: "Maps follow-ups to active reminders, schedules email alerts, and populates timelines.", color: "bg-emerald-500/15 text-emerald-300" },
];

export default function Automation() {
  const { notifications, reports, reminders, alerts } = useHealth();
  const [tick, setTick] = useState(0);

  // Pulse the pipeline steps every 3s for live feel
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 3000);
    return () => clearInterval(id);
  }, []);

  const automationLogs = [...notifications]
    .filter((n) => ["upload", "summary", "email", "reminder", "alert"].includes(n.type))
    .sort((a, b) => new Date(b.at) - new Date(a.at));

  const TELEMETRY = [
    { label: "Alert Triggers", value: alerts.length, color: "text-pink-400", bg: "bg-pink-500/10" },
    { label: "Cron Jobs", value: reminders.length, color: "text-cyan-400", bg: "bg-cyan-500/10" },
    { label: "Scan Pipeline", value: reports.length, color: "text-violet-400", bg: "bg-violet-500/10" },
    { label: "Events Logged", value: automationLogs.length, color: "text-emerald-400", bg: "bg-emerald-500/10" },
  ];

  const typeConfig = {
    upload: { icon: P.upload, color: "bg-violet-500/15 text-violet-400", label: "UPLOAD" },
    summary: { icon: P.pulse, color: "bg-emerald-500/15 text-emerald-400", label: "SUMMARY" },
    email: { icon: P.mail, color: "bg-cyan-500/15 text-cyan-400", label: "EMAIL" },
    reminder: { icon: P.clock, color: "bg-amber-500/15 text-amber-400", label: "REMINDER" },
    alert: { icon: P.warn, color: "bg-red-500/15 text-red-400", label: "ALERT" },
  };

  return (
    <Shell>
      <div className="page-head">
        <div>
          <h1>Workflow Automation Engine</h1>
          <p>Real-time telemetry, logic triggers, and logs for background OCR, AI parsing, and notification schedules.</p>
        </div>
        <span className="text-[10px] font-mono px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold uppercase flex items-center gap-1.5 self-start">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" /> System Online
        </span>
      </div>

      {/* Telemetry Bar */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "12px", marginBottom: "20px" }}>
        {TELEMETRY.map((t) => (
          <div key={t.label} className={`glass p-4 rounded-xl text-center border border-purple-500/5`}>
            <div className="text-[10px] uppercase font-bold text-zinc-500 mb-1">{t.label}</div>
            <h2 className={`text-2xl font-bold font-mono ${t.color}`}>{t.value}</h2>
          </div>
        ))}
      </div>

      {/* Pipeline Architecture */}
      <div className="glass p-5 rounded-2xl mb-5">
        <h3 className="font-bold text-sm text-zinc-200 mb-4 flex items-center gap-2">
          <span className="w-5 h-5 rounded-lg bg-purple-500/15 text-purple-400 flex items-center justify-center">
            <Icon d={P.pulse} className="w-3 h-3" />
          </span>
          Active Pipeline Architecture
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "10px" }}>
          {PIPELINE_STEPS.map((step, i) => (
            <div key={step.num} className="flex items-start gap-3 bg-zinc-900/40 border border-purple-500/10 p-3.5 rounded-xl hover:border-purple-500/20 transition-colors">
              <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5 ${step.color}`}>
                {step.num}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-xs font-semibold text-zinc-200 leading-tight">{step.title}</div>
                  <span className={`text-[8px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded-full font-bold flex-shrink-0 ${(tick + i) % 4 === 0 ? "opacity-60" : "opacity-100"} transition-opacity`}>
                    ACTIVE
                  </span>
                </div>
                <p className="text-[10px] text-zinc-400 mt-1 leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Workflow Event Stream — full width */}
      <div className="glass p-5 rounded-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-sm text-zinc-200 flex items-center gap-2">
            <Icon d={P.pulse} className="w-4 h-4 text-purple-400" />
            Workflow Event Stream
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-zinc-500">Showing {automationLogs.length} events</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>
        </div>

        {automationLogs.length === 0 ? (
          <div className="py-16 text-center">
            <Icon d={P.pulse} className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
            <div className="text-sm font-semibold text-zinc-500">No workflow actions registered</div>
            <p className="text-xs text-zinc-600 mt-1">Scan a report to trigger the automation pipeline.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "10px", maxHeight: "400px", overflowY: "auto" }}>
            {automationLogs.map((log) => {
              const time = new Date(log.at).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", second: "2-digit" });
              const cfg = typeConfig[log.type] || typeConfig.summary;
              return (
                <div key={log.id} className="flex gap-3 bg-zinc-900/30 border border-purple-500/5 hover:border-purple-500/15 p-3 rounded-xl transition-colors">
                  <span className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${cfg.color}`}>
                    <Icon d={cfg.icon} className="w-3.5 h-3.5" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <span className="font-semibold text-xs text-zinc-200 truncate">{log.title}</span>
                      <span className="text-[8px] font-mono text-zinc-500 flex-shrink-0">{time}</span>
                    </div>
                    <p className="text-[10px] text-zinc-400 leading-relaxed truncate">{log.desc}</p>
                    <span className="text-[8px] font-bold uppercase tracking-wider text-purple-500/70 mt-1 block">{cfg.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Shell>
  );
}
