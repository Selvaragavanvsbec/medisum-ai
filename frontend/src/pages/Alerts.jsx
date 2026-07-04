import Shell from "./Shell.jsx";
import { Icon, P } from "../icons.jsx";
import { useHealth } from "../context/HealthContext.jsx";

export default function Alerts() {
  const { alerts, settings } = useHealth();

  const emailLogs = alerts
    .filter((a) => a.severity === "red")
    .map((a, idx) => ({
      id: `email-log-${idx}`,
      to: settings.notificationEmail || "patient@medisum.ai",
      subject: `CRITICAL MEDICAL ALERT: ${a.item}`,
      status: "Dispatched",
      date: a.date,
    }));

  return (
    <Shell>
      <div className="page-head">
        <div>
          <h1>Clinical Alert Manager</h1>
          <p>Real-time detection of high-risk parameters, color-coded severity badges, and auto-dispatched physician emails.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left Columns: Active Alerts */}
        <div className="xl:col-span-2 flex flex-col gap-4">
          <h3 className="font-bold text-sm text-zinc-200 mb-2">Flagged Anomalies ({alerts.length})</h3>
          
          {alerts.length === 0 ? (
            <div className="glass empty p-12 text-center border border-dashed border-purple-500/15">
              <Icon d={P.checkc} className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
              <h3>All readings normal</h3>
              <p className="text-xs text-zinc-400 mt-1">No clinical alerts or warnings have been triggered by your medical reports.</p>
            </div>
          ) : (
            alerts.map((alert) => {
              const isRed = alert.severity === "red";
              const isYellow = alert.severity === "yellow";
              
              return (
                <div 
                  key={alert.id}
                  className={`glass p-5 rounded-2xl border transition-all duration-300 relative overflow-hidden flex gap-4 ${
                    isRed ? "border-red-500/20 bg-red-500/5 hover:border-red-500/30" : 
                    isYellow ? "border-amber-500/20 bg-amber-500/5 hover:border-amber-500/30" :
                    "border-emerald-500/20 bg-emerald-500/5 hover:border-emerald-500/30"
                  }`}
                >
                  {/* Left Icon and Pulse animation for red severity */}
                  <div className="flex-shrink-0 flex items-start mt-0.5">
                    <span className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      isRed ? "bg-red-500/15 text-red-400" :
                      isYellow ? "bg-amber-500/15 text-amber-400" :
                      "bg-emerald-500/15 text-emerald-400"
                    }`}>
                      <Icon 
                        d={isRed || isYellow ? P.warn : P.checkc} 
                        className={`w-5 h-5 ${isRed ? "animate-pulse" : ""}`} 
                      />
                    </span>
                  </div>

                  {/* Body details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h4 className="font-bold text-sm text-zinc-100">{alert.item} <span className="font-mono text-zinc-400 text-xs ml-1">({alert.value})</span></h4>
                      
                      <div className="flex gap-2">
                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                          isRed ? "bg-red-500/20 text-red-400" :
                          isYellow ? "bg-amber-500/20 text-amber-400" :
                          "bg-emerald-500/20 text-emerald-400"
                        }`}>
                          {alert.severity} Severity
                        </span>
                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 font-bold">
                          Risk: {alert.risk_percentage}%
                        </span>
                      </div>
                    </div>

                    <div className="text-xs text-zinc-300 mt-2 leading-relaxed font-medium">
                      <span className="text-zinc-400 font-semibold">Reason:</span> {alert.reason}
                    </div>
                    
                    <div className="text-xs text-zinc-300 mt-2.5 leading-relaxed bg-zinc-950/30 border border-purple-500/5 p-3 rounded-xl">
                      <span className="text-emerald-400 font-semibold flex items-center gap-1.5 mb-1">
                        <Icon d={P.sparkle} className="w-3.5 h-3.5 text-emerald-400" /> Suggested Action
                      </span>
                      {alert.suggested_action}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Email logs for red severity alerts */}
        <div className="glass p-5 rounded-2xl h-fit">
          <h3 className="font-bold text-sm text-zinc-200 mb-1">Critical Dispatch Status</h3>
          <p className="text-[10px] text-zinc-400 mb-4">Auto-email notifications dispatched to patient clinicians on critical triggers.</p>
          
          <div className="flex flex-col gap-3">
            {emailLogs.length === 0 ? (
              <div className="text-center text-xs text-zinc-500 py-8">No critical dispatches registered.</div>
            ) : (
              emailLogs.map((log) => (
                <div key={log.id} className="text-xs bg-zinc-900/40 border border-purple-500/5 p-3 rounded-xl flex flex-col gap-1.5">
                  <div className="flex items-center justify-between font-mono text-[9px]">
                    <span className="text-purple-400">{new Date(log.date).toLocaleDateString()}</span>
                    <span className="text-emerald-400 font-bold uppercase tracking-wider">{log.status}</span>
                  </div>
                  <div className="font-semibold text-zinc-200 truncate">{log.subject}</div>
                  <div className="text-[10px] text-zinc-500">Recipient: {log.to}</div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </Shell>
  );
}
