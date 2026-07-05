import { useState, useMemo } from "react";
import Shell from "./Shell.jsx";
import { Icon, P } from "../icons.jsx";
import { useHealth } from "../context/HealthContext.jsx";

export default function CompareReports() {
  const { reports } = useHealth();
  const [rep1Id, setRep1Id] = useState("");
  const [rep2Id, setRep2Id] = useState("");

  const rep1 = useMemo(() => reports.find((r) => r.content_hash === rep1Id), [reports, rep1Id]);
  const rep2 = useMemo(() => reports.find((r) => r.content_hash === rep2Id), [reports, rep2Id]);

  // Set default values when reports load
  useState(() => {
    if (reports.length > 0) setRep1Id(reports[0].content_hash);
    if (reports.length > 1) setRep2Id(reports[1].content_hash);
  });

  const comparisonData = useMemo(() => {
    if (!rep1 || !rep2) return [];

    const findings1 = rep1.summary?.key_findings || [];
    const findings2 = rep2.summary?.key_findings || [];

    const allItems = Array.from(new Set([
      ...findings1.map((f) => f.item),
      ...findings2.map((f) => f.item)
    ]));

    return allItems.map((item) => {
      const f1 = findings1.find((f) => f.item === item);
      const f2 = findings2.find((f) => f.item === item);

      const val1 = f1 ? parseFloat(f1.value) : NaN;
      const val2 = f2 ? parseFloat(f2.value) : NaN;

      let delta = null;
      let deltaType = "none";

      if (!isNaN(val1) && !isNaN(val2)) {
        const diff = val2 - val1;
        if (diff > 0) {
          delta = `+${diff.toFixed(1)}`;
          deltaType = "up";
        } else if (diff < 0) {
          delta = `${diff.toFixed(1)}`;
          deltaType = "down";
        } else {
          delta = "0.0";
          deltaType = "same";
        }
      }

      return {
        item,
        value1: f1 ? f1.value : "—",
        flag1: f1 ? f1.flag : "unclear",
        value2: f2 ? f2.value : "—",
        flag2: f2 ? f2.flag : "unclear",
        delta,
        deltaType,
      };
    });
  }, [rep1, rep2]);

  const flagColor = (flag) =>
    flag === "high" ? "var(--rose)" : flag === "low" ? "var(--amber)" : flag === "normal" ? "#22c55e" : "var(--ink-faint)";

  return (
    <Shell>
      <div className="page-head anim-fade-up">
        <div>
          <h1>Compare Diagnostics Reports</h1>
          <p>Analyze chronological progression and track metabolic changes side-by-side.</p>
        </div>
        <span className="sys-status self-start">
          <span className="sys-dot" /> Multi-Scan Mode
        </span>
      </div>

      {reports.length < 2 ? (
        <div className="glass empty anim-fade-up anim-fade-up-d1" style={{ border: "1px dashed var(--line)", padding: "80px 32px" }}>
          <div className="eico"><Icon d={P.compare} /></div>
          <h3>Insufficient Reports for Comparison</h3>
          <p>Please upload at least two medical reports or load the Sandbox Demo on the Dashboard.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>

          {/* Selectors */}
          <div className="glass anim-fade-up anim-fade-up-d1" style={{ padding: "28px 32px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 22 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--violet-2)" }} />
              <span style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em", color: "var(--ink-faint)" }}>Select Reports to Compare</span>
            </div>
            <div className="compare-grid" style={{ marginBottom: 0 }}>
              <div className="field" style={{ marginBottom: 0 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 2, background: "var(--violet-2)", display: "inline-block" }} />
                  Base Report (Older)
                </label>
                <select value={rep1Id} onChange={(e) => setRep1Id(e.target.value)}>
                  {reports.map((r) => (
                    <option key={r.content_hash} value={r.content_hash}>
                      {r.summary?.patient_details?.report_type || "Lab Report"} — {new Date(r.created_at).toLocaleDateString()}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field" style={{ marginBottom: 0 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 2, background: "var(--cyan-2)", display: "inline-block" }} />
                  Comparison Report (Newer)
                </label>
                <select value={rep2Id} onChange={(e) => setRep2Id(e.target.value)}>
                  {reports.map((r) => (
                    <option key={r.content_hash} value={r.content_hash}>
                      {r.summary?.patient_details?.report_type || "Lab Report"} — {new Date(r.created_at).toLocaleDateString()}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Side by side cards */}
          {rep1 && rep2 && (
            <div className="compare-grid anim-fade-up anim-fade-up-d2">
              {/* Base Card */}
              <div className="compare-card">
                <div className="compare-card-header base">⬤ Base Diagnostics</div>
                <div className="compare-card-body">
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--ink)", marginBottom: 10, fontFamily: "'Space Grotesk',sans-serif" }}>
                    {rep1.summary?.patient_details?.report_type}
                  </h3>
                  <p style={{ fontSize: 13.5, color: "var(--ink-soft)", lineHeight: 1.65, marginBottom: 20 }}>{rep1.summary?.overview}</p>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 16, borderTop: "1px solid var(--line)" }}>
                    <span style={{ fontSize: 12, color: "var(--ink-faint)", fontFamily: "'JetBrains Mono',monospace" }}>
                      {new Date(rep1.created_at).toLocaleDateString()}
                    </span>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 12, color: "var(--ink-faint)" }}>Health Index</span>
                      <span style={{ fontSize: 20, fontWeight: 800, color: "var(--violet-2)", fontFamily: "'Space Grotesk',sans-serif" }}>
                        {rep1.summary?.health_score?.overall}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Target Card */}
              <div className="compare-card">
                <div className="compare-card-header target">⬤ Target Comparison</div>
                <div className="compare-card-body">
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--ink)", marginBottom: 10, fontFamily: "'Space Grotesk',sans-serif" }}>
                    {rep2.summary?.patient_details?.report_type}
                  </h3>
                  <p style={{ fontSize: 13.5, color: "var(--ink-soft)", lineHeight: 1.65, marginBottom: 20 }}>{rep2.summary?.overview}</p>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 16, borderTop: "1px solid var(--line)" }}>
                    <span style={{ fontSize: 12, color: "var(--ink-faint)", fontFamily: "'JetBrains Mono',monospace" }}>
                      {new Date(rep2.created_at).toLocaleDateString()}
                    </span>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 12, color: "var(--ink-faint)" }}>Health Index</span>
                      <span style={{ fontSize: 20, fontWeight: 800, color: "var(--cyan-2)", fontFamily: "'Space Grotesk',sans-serif" }}>
                        {rep2.summary?.health_score?.overall}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Parameter Table */}
          {rep1 && rep2 && (
            <div className="glass tablecard anim-fade-up anim-fade-up-d3">
              <div className="th">
                <div>
                  <h3>Parameters Progression Analysis</h3>
                  <p style={{ fontSize: 13, color: "var(--ink-soft)", marginTop: 4 }}>Side-by-side biomarker delta tracking</p>
                </div>
                <span style={{ fontSize: 11, fontFamily: "'JetBrains Mono',monospace", color: "var(--ink-faint)", background: "rgba(99,102,241,.08)", padding: "5px 12px", borderRadius: 20, border: "1px solid var(--line)" }}>
                  {comparisonData.length} biomarkers matched
                </span>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table className="compare-table">
                  <thead>
                    <tr>
                      <th>Biomarker / Test</th>
                      <th>Base Level</th>
                      <th>Target Level</th>
                      <th>Delta Variance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonData.map((row) => (
                      <tr key={row.item}>
                        <td style={{ fontWeight: 700, color: "var(--ink)", fontSize: 14 }}>{row.item}</td>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 13 }}>{row.value1}</span>
                            {row.flag1 !== "normal" && row.value1 !== "—" && (
                              <span style={{ fontSize: 9, color: flagColor(row.flag1), fontWeight: 800, background: `${flagColor(row.flag1)}15`, padding: "2px 8px", borderRadius: 20, textTransform: "uppercase" }}>
                                {row.flag1}
                              </span>
                            )}
                          </div>
                        </td>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 13 }}>{row.value2}</span>
                            {row.flag2 !== "normal" && row.value2 !== "—" && (
                              <span style={{ fontSize: 9, color: flagColor(row.flag2), fontWeight: 800, background: `${flagColor(row.flag2)}15`, padding: "2px 8px", borderRadius: 20, textTransform: "uppercase" }}>
                                {row.flag2}
                              </span>
                            )}
                          </div>
                        </td>
                        <td>
                          {row.deltaType === "up" && (
                            <span className="delta-up">▲ {row.delta}</span>
                          )}
                          {row.deltaType === "down" && (
                            <span className="delta-down">▼ {row.delta}</span>
                          )}
                          {row.deltaType === "same" && (
                            <span className="delta-same">— 0.0</span>
                          )}
                          {row.deltaType === "none" && (
                            <span style={{ color: "var(--ink-faint)" }}>—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </Shell>
  );
}
