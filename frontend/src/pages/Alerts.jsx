import Shell from "./Shell.jsx";
import { Icon, P } from "../icons.jsx";
import { useHealth } from "../context/HealthContext.jsx";

const sevConfig = {
  red:    { color: "var(--rose)",   bg: "rgba(225,29,72,.06)",   border: "rgba(225,29,72,.18)",   label: "Critical",  dotColor: "#fb7185" },
  yellow: { color: "var(--amber)",  bg: "rgba(217,119,6,.06)",   border: "rgba(217,119,6,.18)",   label: "Warning",   dotColor: "#fbbf24" },
  green:  { color: "#22c55e",       bg: "rgba(34,197,94,.06)",   border: "rgba(34,197,94,.18)",   label: "Normal",    dotColor: "#4ade80" },
};

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
      <div className="page-head anim-fade-up">
        <div>
          <h1>Clinical Alert Manager</h1>
          <p>Real-time detection of high-risk parameters, color-coded severity badges, and auto-dispatched physician emails.</p>
        </div>
        {alerts.length > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(245,158,11,.1)", border: "1px solid rgba(245,158,11,.25)", padding: "8px 16px", borderRadius: 12, flexShrink: 0 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--amber)", animation: "pulseGlow 1s infinite", display: "inline-block" }} />
            <span style={{ fontSize: 12.5, fontWeight: 700, color: "var(--amber)" }}>{alerts.length} Active Alerts</span>
          </div>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 24 }}>
        
        {/* Left: Active Alerts */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)", fontFamily: "'Space Grotesk',sans-serif" }}>
              Flagged Anomalies
              <span style={{ marginLeft: 10, fontSize: 12, fontWeight: 600, color: "var(--ink-faint)", background: "rgba(99,102,241,.1)", padding: "2px 10px", borderRadius: 20, border: "1px solid var(--line)" }}>
                {alerts.length}
              </span>
            </h3>
          </div>
          
          {alerts.length === 0 ? (
            <div className="glass empty anim-fade-up" style={{ border: "1px dashed var(--line)", padding: "80px 32px" }}>
              <div className="eico" style={{ background: "rgba(34,197,94,.12)", color: "#22c55e" }}>
                <Icon d={P.checkc} />
              </div>
              <h3>All readings normal</h3>
              <p>No clinical alerts or warnings have been triggered by your medical reports.</p>
            </div>
          ) : (
            alerts.map((alert, idx) => {
              const sev = sevConfig[alert.severity] || sevConfig.green;
              const isRed = alert.severity === "red";
              
              return (
                <div
                  key={alert.id}
                  className="anim-fade-up"
                  style={{
                    animationDelay: `${idx * 0.08}s`,
                    background: sev.bg,
                    border: `1px solid ${sev.border}`,
                    borderRadius: 20,
                    padding: "24px 28px",
                    position: "relative",
                    overflow: "hidden",
                    backdropFilter: "blur(20px)",
                    boxShadow: "0 4px 24px rgba(0,0,0,.06)",
                  }}
                >
                  {/* Glow accent left bar */}
                  <div style={{
                    position: "absolute", left: 0, top: 0, bottom: 0, width: 4,
                    background: sev.color,
                    boxShadow: `0 0 16px ${sev.color}`,
                  }} />

                  <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
                    {/* Severity Icon */}
                    <div style={{
                      width: 52, height: 52, borderRadius: 16, flexShrink: 0,
                      display: "grid", placeItems: "center",
                      background: `${sev.color}18`,
                      border: `1px solid ${sev.color}30`,
                    }}>
                      <Icon
                        d={isRed || alert.severity === "yellow" ? P.warn : P.checkc}
                        style={{ width: 24, height: 24, color: sev.color, animation: isRed ? "pulseGlow 1.5s infinite" : "none" }}
                      />
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      {/* Header row */}
                      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 10 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <h4 style={{ fontSize: 17, fontWeight: 700, color: "var(--ink)", fontFamily: "'Space Grotesk',sans-serif" }}>
                            {alert.item}
                          </h4>
                          <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12, color: "var(--ink-faint)", background: "rgba(99,102,241,.08)", padding: "3px 10px", borderRadius: 20 }}>
                            {alert.value}
                          </span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{
                            fontSize: 10.5, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".06em",
                            padding: "4px 12px", borderRadius: 20,
                            background: `${sev.color}15`, color: sev.color,
                            border: `1px solid ${sev.color}30`,
                          }}>
                            {sev.label} Severity
                          </span>
                          <span style={{
                            fontSize: 10.5, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".06em",
                            padding: "4px 12px", borderRadius: 20,
                            background: "rgba(139,92,246,.12)", color: "var(--violet-2)",
                            border: "1px solid rgba(139,92,246,.2)",
                          }}>
                            Risk: {alert.risk_percentage}%
                          </span>
                        </div>
                      </div>

                      {/* Reason */}
                      <p style={{ fontSize: 14, color: "var(--ink-soft)", lineHeight: 1.6, marginBottom: 16 }}>
                        <strong style={{ color: "var(--ink)" }}>Reason: </strong>{alert.reason}
                      </p>

                      {/* Suggested Action */}
                      <div style={{
                        background: "rgba(16,185,129,.06)",
                        border: "1px solid rgba(16,185,129,.18)",
                        borderRadius: 14, padding: "14px 18px",
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, fontSize: 12, fontWeight: 700, color: "#22c55e" }}>
                          <Icon d={P.sparkle} style={{ width: 14, height: 14 }} />
                          Suggested Action
                        </div>
                        <p style={{ fontSize: 13.5, color: "var(--ink-soft)", lineHeight: 1.55 }}>
                          {alert.suggested_action}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right: Email Dispatch Status */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="glass" style={{ padding: "24px 26px", borderRadius: 20 }}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <div style={{ width: 36, height: 36, borderRadius: 12, background: "rgba(99,102,241,.12)", display: "grid", placeItems: "center", color: "var(--violet-2)" }}>
                <Icon d={P.mail || P.pulse} style={{ width: 17, height: 17 }} />
              </div>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--ink)", fontFamily: "'Space Grotesk',sans-serif" }}>
                Critical Dispatch Status
              </h3>
            </div>
            <p style={{ fontSize: 12.5, color: "var(--ink-soft)", lineHeight: 1.55, marginBottom: 20 }}>
              Auto-email notifications dispatched to patient clinicians on critical triggers.
            </p>
            
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {emailLogs.length === 0 ? (
                <div style={{
                  textAlign: "center", padding: "40px 16px",
                  color: "var(--ink-faint)", fontSize: 13,
                  background: "rgba(99,102,241,.04)", borderRadius: 14,
                  border: "1px dashed var(--line)",
                }}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>📭</div>
                  No critical dispatches registered.
                </div>
              ) : (
                emailLogs.map((log) => (
                  <div key={log.id} style={{
                    background: "rgba(99,102,241,.05)",
                    border: "1px solid var(--line)",
                    borderRadius: 14, padding: "14px 16px",
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                      <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: "var(--violet-2)", fontWeight: 700 }}>
                        {new Date(log.date).toLocaleDateString()}
                      </span>
                      <span style={{ fontSize: 10, color: "#22c55e", fontWeight: 800, textTransform: "uppercase", letterSpacing: ".04em" }}>
                        ✓ {log.status}
                      </span>
                    </div>
                    <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--ink)", marginBottom: 4 }}>{log.subject}</div>
                    <div style={{ fontSize: 11, color: "var(--ink-faint)" }}>To: {log.to}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Info Panel */}
          <div className="glass" style={{ padding: "22px 26px", borderRadius: 20, background: "linear-gradient(135deg, rgba(139,92,246,.08), rgba(99,102,241,.04))" }}>
            <h4 style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)", marginBottom: 14, fontFamily: "'Space Grotesk',sans-serif" }}>
              Severity Guide
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { color: "#fb7185", label: "Critical", desc: "Requires immediate attention" },
                { color: "#fbbf24", label: "Warning", desc: "Monitor closely, consult doctor" },
                { color: "#4ade80", label: "Normal", desc: "Within reference range" },
              ].map((s) => (
                <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: s.color, boxShadow: `0 0 8px ${s.color}`, flexShrink: 0 }} />
                  <div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "var(--ink)" }}>{s.label}</span>
                    <span style={{ fontSize: 11, color: "var(--ink-faint)", marginLeft: 8 }}>{s.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Responsive styles */}
      <style>{`
        @media (max-width: 900px) {
          .alerts-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </Shell>
  );
}
