import Shell from "./Shell.jsx";
import { Icon, P } from "../icons.jsx";
import { useHealth } from "../context/HealthContext.jsx";
import { Link } from "react-router-dom";

export default function History() {
  const { reports, loading } = useHealth();

  return (
    <Shell>
      <div className="page-head">
        <div>
          <h1>Diagnostic Chronology</h1>
          <p>Chronological patient history mapping medical reports, diagnoses, and comparative indicators.</p>
        </div>
      </div>

      {loading && (
        <div className="glass empty p-12 text-center">
          <Icon d={P.spin} className="spin w-8 h-8 text-purple-400 mx-auto mb-3" />
          <h3>Retrieving history timeline...</h3>
        </div>
      )}

      {!loading && reports.length === 0 && (
        <div className="glass empty p-12 text-center border border-dashed border-purple-500/15">
          <Icon d={P.file} className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
          <h3>Timeline is empty</h3>
          <p className="text-xs text-zinc-400 mt-1 max-w-xs mx-auto">Upload reports in the Scan portal to populate your patient history timeline.</p>
          <Link href="/app/upload" className="btn btn-primary mt-4">Digitize a Report</Link>
        </div>
      )}

      {!loading && reports.length > 0 && (
        <div className="relative pl-6 md:pl-8 border-l border-purple-500/25 ml-4 space-y-8 py-4">
          {reports.map((rep, idx) => {
            const summary = rep.summary || {};
            const details = summary.patient_details || {};
            const dateStr = new Date(rep.created_at).toLocaleDateString(undefined, {
              year: "numeric",
              month: "long",
              day: "numeric",
            });
            const timeStr = new Date(rep.created_at).toLocaleTimeString(undefined, {
              hour: "2-digit",
              minute: "2-digit",
            });

            const isCritical = summary.risk_level === "critical" || summary.risk_level === "high";

            return (
              <div key={rep.content_hash || idx} className="relative group">
                {/* Timeline Circle Bullet */}
                <div className={`absolute -left-[31px] md:-left-[39px] top-1.5 w-4 h-4 rounded-full border-2 border-zinc-950 flex items-center justify-center transition-all ${
                  isCritical ? "bg-pink-500 ring-4 ring-pink-500/20" : "bg-purple-500 ring-4 ring-purple-500/20"
                }`}>
                  <div className="w-1.5 h-1.5 rounded-full bg-zinc-950"></div>
                </div>

                {/* Timeline Content Block */}
                <div className="glass p-5 rounded-2xl relative hover:border-purple-500/20 transition-all duration-300">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-purple-500/10 pb-3 mb-3">
                    <div>
                      <span className="text-[10px] font-bold font-mono text-purple-400 uppercase tracking-wider">{dateStr} at {timeStr}</span>
                      <h3 className="font-bold text-sm text-zinc-200 mt-1">{details.report_type || "Routine Panel Analysis"}</h3>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        isCritical ? "bg-red-500/10 text-red-400" : "bg-emerald-500/10 text-emerald-400"
                      }`}>
                        {summary.risk_level || "low"} Risk
                      </span>
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-purple-500/10 text-purple-300">
                        Score: {summary.health_score?.overall || 100}%
                      </span>
                    </div>
                  </div>

                  {/* Summary content */}
                  <div>
                    <h4 className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold mb-1">Clinical Summary</h4>
                    <p className="text-xs text-zinc-300 leading-relaxed">{summary.overview}</p>
                  </div>

                  {/* Key Highlights */}
                  {summary.abnormal_highlights?.length > 0 && (
                    <div className="mt-3 bg-zinc-950/20 border border-purple-500/5 rounded-xl p-3">
                      <h4 className="text-[9px] text-pink-400 uppercase tracking-wider font-bold mb-1.5">Critical Flags Extracted</h4>
                      <ul className="space-y-1">
                        {summary.abnormal_highlights.map((h, i) => (
                          <li key={i} className="text-xs text-zinc-400 flex gap-2">
                            <span className="text-pink-400 font-bold">•</span>
                            <span>{h}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Recommendations */}
                  {summary.lifestyle_suggestions?.length > 0 && (
                    <div className="mt-3">
                      <h4 className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold mb-1">Preventative Actions Set</h4>
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {summary.lifestyle_suggestions.slice(0, 3).map((sug, i) => (
                          <span key={i} className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/15 px-2.5 py-1 rounded-full">
                            {sug}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Shell>
  );
}
