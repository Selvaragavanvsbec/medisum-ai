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
      let deltaType = "none"; // 'up', 'down', 'none'

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
        <div className="glass empty p-12 text-center anim-fade-up anim-fade-up-d1" style={{ border: "1px dashed var(--line)" }}>
          <div className="eico"><Icon d={P.compare} /></div>
          <h3>Insufficient Reports for Comparison</h3>
          <p>Please upload at least two medical reports or load the Sandbox Demo on the Dashboard.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {/* Selectors */}
          <div className="glass p-5 compare-grid anim-fade-up anim-fade-up-d1">
            <div className="field">
              <label>Select Base Report (Older)</label>
              <select value={rep1Id} onChange={(e) => setRep1Id(e.target.value)}>
                {reports.map((r) => (
                  <option key={r.content_hash} value={r.content_hash}>
                    {r.summary?.patient_details?.report_type || "Lab Report"} — {new Date(r.created_at).toLocaleDateString()}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label>Select Comparison Report (Newer)</label>
              <select value={rep2Id} onChange={(e) => setRep2Id(e.target.value)}>
                {reports.map((r) => (
                  <option key={r.content_hash} value={r.content_hash}>
                    {r.summary?.patient_details?.report_type || "Lab Report"} — {new Date(r.created_at).toLocaleDateString()}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Side by side overview comparison cards */}
          {rep1 && rep2 && (
            <div className="compare-grid anim-fade-up anim-fade-up-d2">
              <div className="glass p-5 flex flex-col justify-between">
                <div>
                  <div className="text-[10px] uppercase font-bold text-zinc-500 mb-2">Base Diagnostics</div>
                  <h3 className="font-bold text-sm text-zinc-200">{rep1.summary?.patient_details?.report_type}</h3>
                  <p className="text-xs text-zinc-400 mt-2 leading-relaxed">{rep1.summary?.overview}</p>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 20 }}>
                  <span className="text-xs font-mono text-zinc-500">{new Date(rep1.created_at).toLocaleDateString()}</span>
                  <span className="text-xs font-bold text-zinc-200">Health Index: {rep1.summary?.health_score?.overall}%</span>
                </div>
              </div>

              <div className="glass p-5 flex flex-col justify-between">
                <div>
                  <div className="text-[10px] uppercase font-bold text-zinc-500 mb-2">Target Comparison</div>
                  <h3 className="font-bold text-sm text-zinc-200">{rep2.summary?.patient_details?.report_type}</h3>
                  <p className="text-xs text-zinc-400 mt-2 leading-relaxed">{rep2.summary?.overview}</p>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 20 }}>
                  <span className="text-xs font-mono text-zinc-500">{new Date(rep2.created_at).toLocaleDateString()}</span>
                  <span className="text-xs font-bold text-zinc-200">Health Index: {rep2.summary?.health_score?.overall}%</span>
                </div>
              </div>
            </div>
          )}

          {/* Parameter Table */}
          {rep1 && rep2 && (
            <div className="glass tablecard anim-fade-up anim-fade-up-d3">
              <div className="th">
                <h3>Parameters Progression Analysis</h3>
                <span className="text-[10px] font-mono text-zinc-500">{comparisonData.length} biomarkers matched</span>
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
                        <td style={{ fontWeight: "600", color: "var(--ink)" }}>{row.item}</td>
                        <td>
                          <div className="flex items-center gap-2">
                            <span>{row.value1}</span>
                            {row.flag1 !== "normal" && row.value1 !== "—" && (
                              <span style={{ fontSize: 9, color: "var(--amber)", fontWeight: "bold" }}>({row.flag1})</span>
                            )}
                          </div>
                        </td>
                        <td>
                          <div className="flex items-center gap-2">
                            <span>{row.value2}</span>
                            {row.flag2 !== "normal" && row.value2 !== "—" && (
                              <span style={{ fontSize: 9, color: "var(--amber)", fontWeight: "bold" }}>({row.flag2})</span>
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
                            <span className="text-zinc-500">—</span>
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
