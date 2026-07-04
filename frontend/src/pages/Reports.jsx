import { useState, useMemo } from "react";
import Shell from "./Shell.jsx";
import { Icon, P } from "../icons.jsx";
import { useHealth } from "../context/HealthContext.jsx";

export default function Reports() {
  const { reports, loading } = useHealth();
  const [search, setSearch] = useState("");
  const [filterLevel, setFilterLevel] = useState("all");
  const [expandedId, setExpandedId] = useState(null);

  const filtered = useMemo(() => {
    return reports.filter((rep) => {
      const summary = rep.summary || {};
      const type = (summary.patient_details?.report_type || "General").toLowerCase();
      const overview = (summary.overview || "").toLowerCase();
      const s = search.toLowerCase();
      return (type.includes(s) || overview.includes(s)) && (filterLevel === "all" || rep.reading_level === filterLevel);
    });
  }, [reports, search, filterLevel]);

  const flagColor = (flag) =>
    flag === "high" || flag === "abnormal" ? "#fb7185"
    : flag === "low" ? "#22d3ee"
    : "#34d399";

  return (
    <Shell>
      {/* Page Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 30, fontWeight: 700, letterSpacing: "-0.02em", color: "var(--ink)" }}>
          Diagnostic Database
        </h1>
        <p style={{ fontSize: 15, color: "var(--ink-soft)", marginTop: 8, lineHeight: 1.6 }}>
          Browse, filter, and expand all translated medical summaries saved in your account.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="glass" style={{ padding: "16px 20px", borderRadius: 16, marginBottom: 24, display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
          <Icon d={P.search} style={{ width: 17, height: 17, color: "var(--ink-faint)", position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
          <input
            style={{
              width: "100%", paddingLeft: 42, paddingRight: 16, paddingTop: 10, paddingBottom: 10,
              borderRadius: 12, border: "1px solid var(--line)", background: "var(--input-bg)",
              fontSize: 14, color: "var(--ink)", outline: "none", fontFamily: "inherit"
            }}
            placeholder="Search reports by keywords, test type, or symptoms..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={e => e.target.style.borderColor = "var(--violet)"}
            onBlur={e => e.target.style.borderColor = "var(--line)"}
          />
        </div>
        <select
          style={{
            padding: "10px 16px", borderRadius: 12, border: "1px solid var(--line)",
            background: "var(--input-bg)", fontSize: 14, color: "var(--ink)", outline: "none",
            fontFamily: "inherit", cursor: "pointer"
          }}
          value={filterLevel}
          onChange={(e) => setFilterLevel(e.target.value)}
        >
          <option value="all">All Reading Levels</option>
          <option value="simple">Plain Language</option>
          <option value="teen">9th Grade</option>
          <option value="detailed">Clinical Detailed</option>
        </select>
      </div>

      {loading && (
        <div className="glass" style={{ padding: 48, textAlign: "center", borderRadius: 18 }}>
          <Icon d={P.spin} style={{ width: 36, height: 36, color: "var(--violet)", margin: "0 auto 14px", display: "block" }} className="spin" />
          <p style={{ fontSize: 15, color: "var(--ink-soft)" }}>Loading records...</p>
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="glass" style={{ padding: 56, textAlign: "center", borderRadius: 18, border: "1px dashed rgba(14,165,233,.2)" }}>
          <Icon d={P.file} style={{ width: 44, height: 44, color: "var(--ink-faint)", margin: "0 auto 16px", display: "block" }} />
          <h3 style={{ fontSize: 18, fontWeight: 600, color: "var(--ink)" }}>No reports found</h3>
          <p style={{ fontSize: 14, color: "var(--ink-soft)", marginTop: 10, maxWidth: 320, margin: "10px auto" }}>
            Try resetting filters or scan a new lab report to add it to your dashboard database.
          </p>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {filtered.map((rep) => {
          const summary = rep.summary || {};
          const isExpanded = expandedId === rep.content_hash;
          const isCritical = summary.risk_level === "critical" || summary.risk_level === "high";
          const riskStyle = isCritical
            ? { bg: "rgba(244,63,94,.12)", c: "#fb7185" }
            : summary.risk_level === "medium"
            ? { bg: "rgba(245,158,11,.12)", c: "#fbbf24" }
            : { bg: "rgba(16,185,129,.12)", c: "#34d399" };

          return (
            <div key={rep.content_hash} className="glass" style={{ borderRadius: 18, overflow: "hidden" }}>

              {/* Row header */}
              <div style={{ padding: "18px 24px", background: "rgba(14,165,233,.04)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--ink)" }}>
                      {summary.patient_details?.report_type || "Routine Diagnostics"}
                    </h3>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 11px", borderRadius: 20, background: riskStyle.bg, color: riskStyle.c, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      {summary.risk_level || "low"} Risk
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 13, color: "var(--ink-soft)", marginTop: 5, flexWrap: "wrap" }}>
                    <span>Date: {new Date(rep.created_at).toLocaleDateString()}</span>
                    <span style={{ color: "var(--line-2)" }}>•</span>
                    <span style={{ textTransform: "capitalize" }}>Audience: {rep.reading_level}</span>
                    <span style={{ color: "var(--line-2)" }}>•</span>
                    <span>Score: <strong style={{ color: "var(--ink)" }}>{summary.health_score?.overall || 100}%</strong></span>
                  </div>
                </div>
                <button
                  onClick={() => setExpandedId(isExpanded ? null : rep.content_hash)}
                  style={{
                    padding: "10px 20px", borderRadius: 12, border: "1px solid var(--line-2)",
                    background: "rgba(14,165,233,.08)", color: "var(--violet-2)", fontSize: 13,
                    fontWeight: 600, cursor: "pointer", transition: "all .15s", flexShrink: 0
                  }}
                  onMouseEnter={e => { e.target.style.background = "rgba(14,165,233,.18)"; }}
                  onMouseLeave={e => { e.target.style.background = "rgba(14,165,233,.08)"; }}
                >
                  {isExpanded ? "Collapse ↑" : "View Full Summary →"}
                </button>
              </div>

              {/* Expanded body */}
              {isExpanded && (
                <div style={{ padding: "24px", borderTop: "1px solid var(--line)", background: "rgba(14,165,233,.02)", display: "flex", flexDirection: "column", gap: 22 }}>

                  {/* Overview */}
                  <div>
                    <h4 style={{ fontSize: 11, fontWeight: 700, color: "var(--violet-2)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Overview</h4>
                    <p style={{ fontSize: 15, color: "var(--ink-soft)", lineHeight: 1.8 }}>{summary.overview}</p>
                  </div>

                  {/* Key Findings */}
                  {summary.key_findings?.length > 0 && (
                    <div>
                      <h4 style={{ fontSize: 11, fontWeight: 700, color: "var(--violet-2)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>Findings Detail</h4>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 12 }}>
                        {summary.key_findings.map((f, i) => (
                          <div key={i} style={{ padding: "14px 16px", background: "rgba(14,165,233,.06)", border: "1px solid var(--line)", borderRadius: 14, display: "flex", alignItems: "flex-start", gap: 12 }}>
                            <span style={{ width: 10, height: 10, borderRadius: "50%", background: flagColor(f.flag), flexShrink: 0, marginTop: 5 }} />
                            <div>
                              <div style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)" }}>
                                {f.item} <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12, color: "var(--ink-soft)", fontWeight: 400 }}>({f.value})</span>
                              </div>
                              <div style={{ fontSize: 13, color: "var(--ink-soft)", marginTop: 4, lineHeight: 1.5 }}>{f.meaning}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recommendations */}
                  {summary.lifestyle_suggestions?.length > 0 && (
                    <div>
                      <h4 style={{ fontSize: 11, fontWeight: 700, color: "var(--violet-2)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Prescribed Recommendations</h4>
                      <ul style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {summary.lifestyle_suggestions.map((sug, i) => (
                          <li key={i} style={{ fontSize: 14, color: "var(--ink-soft)", display: "flex", gap: 10 }}>
                            <span style={{ color: "#34d399", fontWeight: 700, flexShrink: 0 }}>•</span>
                            <span>{sug}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Shell>
  );
}
