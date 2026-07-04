import { useEffect, useState } from "react";
import Shell from "./Shell.jsx";
import { Icon, P } from "../icons.jsx";
import { useAuth, api } from "../auth.jsx";
import { Counter } from "../ui.jsx";
import { TrendChart } from "../TrendChart.jsx";

const COLORS = ["#8b5cf6", "#e879f9", "#22d3ee", "#a3e635", "#fbbf24", "#f472b6"];

export default function Trends() {
  const { auth } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api("/trends", { token: auth?.access_token })
      .then(setData)
      .catch((e) => setError(e.message));
  }, [auth]);

  const metrics = data?.metrics || [];
  const totalPoints = metrics.reduce((s, m) => s + m.count, 0);

  return (
    <Shell>
      <div className="page-head">
        <div>
          <h1>Health trends</h1>
          <p>How your results move over time. Every analysis you run is tracked here.</p>
        </div>
        <span className="pill"><Icon d={P.trend} />{metrics.length} metrics tracked</span>
      </div>

      {error && <div className="alert alert-error"><Icon d={P.warn} />{error}</div>}

      {!data && !error && (
        <div className="glass empty"><div className="eico"><Icon d={P.spin} className="spin" /></div><h3>Loading your trends…</h3></div>
      )}

      {data && metrics.length === 0 && (
        <div className="glass empty">
          <div className="eico"><Icon d={P.trend} /></div>
          <h3>No trends yet</h3>
          <p>Analyze a couple of reports and your numeric findings will chart here automatically — great for tracking values across visits.</p>
          <a href="/app" className="btn btn-primary" style={{ marginTop: 18 }}>Analyze a report<Icon d={P.arrow} /></a>
        </div>
      )}

      {metrics.length > 0 && (
        <>
          <div className="stats">
            <div className="stat glass">
              <div className="ico violet"><Icon d={P.trend} /></div>
              <div className="num"><Counter value={metrics.length} /></div>
              <div className="lbl">Metrics tracked</div>
            </div>
            <div className="stat glass">
              <div className="ico cyan"><Icon d={P.chart} /></div>
              <div className="num"><Counter value={totalPoints} /></div>
              <div className="lbl">Data points</div>
            </div>
            <div className="stat glass">
              <div className="ico fuchsia"><Icon d={P.file} /></div>
              <div className="num"><Counter value={Math.max(...metrics.map((m) => m.count))} /></div>
              <div className="lbl">Longest streak</div>
            </div>
          </div>

          <div className="trend-grid">
            {metrics.map((m, i) => {
              const color = COLORS[i % COLORS.length];
              const first = m.points[0]?.value ?? 0;
              const last = m.latest;
              const delta = last - first;
              const dir = delta > 0 ? "up" : delta < 0 ? "down" : "flat";
              const latestFlag = (m.points[m.points.length - 1]?.flag || "unclear").toLowerCase();
              return (
                <div className="glass tcardw" key={m.name}>
                  <div className="tch">
                    <div>
                      <div className="tname">{m.name}</div>
                      <div className="tlatest" style={{ color }}>
                        {m.points[m.points.length - 1]?.raw || last}
                      </div>
                    </div>
                    <span className={`fflag ${["high", "low", "normal", "abnormal"].includes(latestFlag) ? latestFlag : "unclear"}`}>{latestFlag}</span>
                  </div>
                  <TrendChart points={m.points} color={color} height={120} />
                  <div className="tcf">
                    <span className="tcf-pts">{m.count} reading{m.count > 1 ? "s" : ""}</span>
                    {m.count > 1 && (
                      <span className={`tcf-delta ${dir}`}>
                        <Icon d={dir === "down" ? P.trend : P.trend} style={{ transform: dir === "down" ? "scaleY(-1)" : "none" }} />
                        {delta > 0 ? "+" : ""}{delta.toFixed(1)} since first
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      <style>{`
        .trend-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:16px}
        .tcardw{padding:20px}
        .tch{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;margin-bottom:14px}
        .tname{font-family:'Space Grotesk',sans-serif;font-size:16px;font-weight:600}
        .tlatest{font-family:'JetBrains Mono',monospace;font-size:13px;margin-top:4px;font-weight:500}
        .fflag{font-family:'JetBrains Mono',monospace;font-size:9.5px;font-weight:600;text-transform:uppercase;letter-spacing:.05em;padding:4px 9px;border-radius:20px;white-space:nowrap}
        .fflag.high{background:rgba(244,114,182,.14);color:var(--pink)} .fflag.low{background:rgba(34,211,238,.14);color:var(--cyan)}
        .fflag.normal{background:rgba(163,230,53,.14);color:var(--lime)} .fflag.abnormal,.fflag.unclear{background:rgba(251,191,36,.14);color:var(--amber)}
        .tcf{display:flex;align-items:center;justify-content:space-between;margin-top:12px;gap:8px}
        .tcf-pts{font-size:12px;color:var(--ink-faint);font-family:'JetBrains Mono',monospace}
        .tcf-delta{display:inline-flex;align-items:center;gap:5px;font-size:12px;font-weight:600;font-family:'JetBrains Mono',monospace}
        .tcf-delta svg{width:13px;height:13px}
        .tcf-delta.up{color:var(--pink)} .tcf-delta.down{color:var(--lime)} .tcf-delta.flat{color:var(--ink-faint)}
      `}</style>
    </Shell>
  );
}
