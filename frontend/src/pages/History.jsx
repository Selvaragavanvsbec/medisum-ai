import Shell from "./Shell.jsx";
import { Icon, P } from "../icons.jsx";
import { useHealth } from "../context/HealthContext.jsx";
import { Link } from "react-router-dom";

export default function History() {
  const { reports, loading } = useHealth();

  return (
    <Shell>
      {/* Page Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 30, fontWeight: 700, letterSpacing: "-0.02em", color: "var(--ink)" }}>
          Diagnostic Chronology
        </h1>
        <p style={{ fontSize: 15, color: "var(--ink-soft)", marginTop: 8, lineHeight: 1.6 }}>
          Chronological patient history mapping medical reports, diagnoses, and comparative indicators.
        </p>
      </div>

      {loading && (
        <div className="glass" style={{ padding: 48, textAlign: "center", borderRadius: 18 }}>
          <Icon d={P.spin} style={{ width: 36, height: 36, color: "var(--violet)", margin: "0 auto 14px", display: "block" }} className="spin" />
          <p style={{ fontSize: 15, color: "var(--ink-soft)" }}>Retrieving history timeline...</p>
        </div>
      )}

      {!loading && reports.length === 0 && (
        <div className="glass" style={{ padding: 56, textAlign: "center", borderRadius: 18, border: "1px dashed rgba(14,165,233,.2)" }}>
          <Icon d={P.file} style={{ width: 44, height: 44, color: "var(--ink-faint)", margin: "0 auto 16px", display: "block" }} />
          <h3 style={{ fontSize: 18, fontWeight: 600, color: "var(--ink)" }}>Timeline is empty</h3>
          <p style={{ fontSize: 14, color: "var(--ink-soft)", marginTop: 8, maxWidth: 320, margin: "10px auto 24px" }}>
            Upload reports in the Scan portal to populate your patient history timeline.
          </p>
          <Link to="/app/upload" className="btn btn-primary">Digitize a Report</Link>
        </div>
      )}

      {!loading && reports.length > 0 && (
        <div style={{ position: "relative", paddingLeft: 36, borderLeft: "2px solid rgba(14,165,233,.25)", marginLeft: 12, display: "flex", flexDirection: "column", gap: 28 }}>
          {reports.map((rep, idx) => {
            const summary = rep.summary || {};
            const details = summary.patient_details || {};
            const dateStr = new Date(rep.created_at).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
            const timeStr = new Date(rep.created_at).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
            const isCritical = summary.risk_level === "critical" || summary.risk_level === "high";
            const riskStyle = isCritical
              ? { bg: "rgba(244,63,94,.12)", c: "#fb7185" }
              : { bg: "rgba(16,185,129,.12)", c: "#34d399" };

            return (
              <div key={rep.content_hash || idx} style={{ position: "relative" }}>
                {/* Timeline Dot */}
                <div style={{
                  position: "absolute", left: -46, top: 20,
                  width: 18, height: 18, borderRadius: "50%",
                  background: isCritical ? "#fb7185" : "var(--violet)",
                  border: "3px solid var(--bg)",
                  boxShadow: isCritical ? "0 0 0 4px rgba(244,63,94,.2)" : "0 0 0 4px rgba(14,165,233,.2)"
                }} />

                {/* Card */}
                <div className="glass" style={{ borderRadius: 18, overflow: "hidden" }}>
                  {/* Header */}
                  <div style={{ padding: "18px 24px", borderBottom: "1px solid var(--line)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "var(--violet-2)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 5, fontFamily: "'JetBrains Mono',monospace" }}>
                        {dateStr} at {timeStr}
                      </div>
                      <h3 style={{ fontSize: 17, fontWeight: 700, color: "var(--ink)" }}>
                        {details.report_type || "Routine Panel Analysis"}
                      </h3>
                    </div>
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <span style={{ fontSize: 12, fontWeight: 700, padding: "5px 13px", borderRadius: 20, background: riskStyle.bg, color: riskStyle.c, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        {summary.risk_level || "low"} Risk
                      </span>
                      <span style={{ fontSize: 14, fontWeight: 800, padding: "5px 13px", borderRadius: 20, background: "rgba(14,165,233,.1)", color: "var(--violet-2)" }}>
                        Score: {summary.health_score?.overall || 100}%
                      </span>
                    </div>
                  </div>

                  {/* Body */}
                  <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 18 }}>

                    {/* Clinical Summary */}
                    <div>
                      <h4 style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-faint)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
                        Clinical Summary
                      </h4>
                      <p style={{ fontSize: 14, color: "var(--ink-soft)", lineHeight: 1.7 }}>
                        {summary.overview || "No summary available."}
                      </p>
                    </div>

                    {/* Critical Flags */}
                    {summary.abnormal_highlights?.length > 0 && (
                      <div style={{ background: "rgba(244,63,94,.06)", border: "1px solid rgba(244,63,94,.15)", borderRadius: 13, padding: "14px 18px" }}>
                        <h4 style={{ fontSize: 11, fontWeight: 700, color: "#fb7185", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
                          Critical Flags Extracted
                        </h4>
                        <ul style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                          {summary.abnormal_highlights.map((h, i) => (
                            <li key={i} style={{ fontSize: 14, color: "var(--ink-soft)", display: "flex", gap: 10, alignItems: "flex-start" }}>
                              <span style={{ color: "#fb7185", fontWeight: 700, flexShrink: 0 }}>•</span>
                              <span>{h}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Lifestyle Tips */}
                    {summary.lifestyle_suggestions?.length > 0 && (
                      <div>
                        <h4 style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-faint)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
                          Preventative Actions Set
                        </h4>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                          {summary.lifestyle_suggestions.slice(0, 4).map((sug, i) => (
                            <span key={i} style={{ fontSize: 13, padding: "6px 14px", borderRadius: 20, background: "rgba(16,185,129,.1)", color: "#34d399", border: "1px solid rgba(16,185,129,.18)" }}>
                              {sug}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Shell>
  );
}
