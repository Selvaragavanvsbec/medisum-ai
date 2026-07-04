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
      
      const matchSearch = type.includes(s) || overview.includes(s);
      const matchLevel = filterLevel === "all" || rep.reading_level === filterLevel;

      return matchSearch && matchLevel;
    });
  }, [reports, search, filterLevel]);

  return (
    <Shell>
      <div className="page-head">
        <div>
          <h1>Diagnostic Database</h1>
          <p>Browse, filter, and expand all translated medical summaries saved in your account.</p>
        </div>
      </div>

      <div className="glass card-pad mb-6 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <input
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-zinc-900/60 border border-purple-500/10 text-sm focus:outline-none focus:border-purple-500/30"
            placeholder="Search reports by keywords, test type, or symptoms..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Icon d={P.search} className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <select
            className="px-3 py-2 rounded-xl bg-zinc-900/60 border border-purple-500/10 text-xs text-zinc-300 focus:outline-none focus:border-purple-500/30 w-full md:w-auto"
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
          >
            <option value="all">All Reading Levels</option>
            <option value="simple">Plain Language</option>
            <option value="teen">9th Grade</option>
            <option value="detailed">Clinical Detailed</option>
          </select>
        </div>
      </div>

      {loading && (
        <div className="glass empty p-12 text-center">
          <Icon d={P.spin} className="spin w-8 h-8 text-violet-400 mx-auto mb-3" />
          <h3>Loading records...</h3>
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="glass empty p-12 text-center border border-dashed border-purple-500/15">
          <Icon d={P.file} className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
          <h3>No reports found</h3>
          <p className="text-xs text-zinc-400 mt-1 max-w-xs mx-auto">Try resetting filters or scan a new lab report to add it to your dashboard database.</p>
        </div>
      )}

      <div className="flex flex-col gap-4">
        {filtered.map((rep) => {
          const summary = rep.summary || {};
          const isExpanded = expandedId === rep.content_hash;
          const isCritical = summary.risk_level === "critical" || summary.risk_level === "high";
          
          return (
            <div key={rep.content_hash} className="glass overflow-hidden transition-all duration-200">
              <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-purple-500/5">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-zinc-100">{summary.patient_details?.report_type || "Routine Diagnostics"}</h3>
                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                      isCritical ? "bg-red-500/10 text-red-400 animate-pulse" : "bg-emerald-500/10 text-emerald-400"
                    }`}>
                      {summary.risk_level || "low"} Risk
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-zinc-500 mt-1">
                    <span>Date: {new Date(rep.created_at).toLocaleDateString()}</span>
                    <span>•</span>
                    <span className="capitalize">Audience: {rep.reading_level}</span>
                    <span>•</span>
                    <span>Score: {summary.health_score?.overall || 100}%</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    className="text-xs px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold"
                    onClick={() => setExpandedId(isExpanded ? null : rep.content_hash)}
                  >
                    {isExpanded ? "Collapse Details" : "View Full Summary"}
                  </button>
                </div>
              </div>

              {isExpanded && (
                <div className="p-4 border-t border-purple-500/10 bg-purple-900/5">
                  {/* Overview */}
                  <div className="mb-4">
                    <h4 className="text-xs font-semibold text-violet-400 uppercase tracking-wide mb-1">Overview</h4>
                    <p className="text-sm text-zinc-200 leading-relaxed">{summary.overview}</p>
                  </div>

                  {/* Key Findings List */}
                  {summary.key_findings?.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-xs font-semibold text-violet-400 uppercase tracking-wide mb-2">Findings Detail</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {summary.key_findings.map((f, i) => (
                          <div key={i} className="p-3 bg-zinc-950/40 border border-purple-500/10 rounded-xl flex items-start gap-3">
                            <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                              f.flag === "high" || f.flag === "abnormal" ? "bg-pink-400" :
                              f.flag === "low" ? "bg-cyan-400" : "bg-emerald-400"
                            }`} />
                            <div>
                              <div className="text-xs font-bold text-zinc-100">{f.item} <span className="font-mono text-zinc-400 text-[10px] ml-1">({f.value})</span></div>
                              <div className="text-xs text-zinc-400 mt-0.5">{f.meaning}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recommendations */}
                  {summary.lifestyle_suggestions?.length > 0 && (
                    <div className="mb-2">
                      <h4 className="text-xs font-semibold text-violet-400 uppercase tracking-wide mb-1.5">Prescribed Recommendations</h4>
                      <ul className="space-y-1">
                        {summary.lifestyle_suggestions.map((sug, i) => (
                          <li key={i} className="text-xs text-zinc-300 flex gap-2">
                            <span className="text-emerald-400">•</span>
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
