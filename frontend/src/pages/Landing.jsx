import { Link } from "react-router-dom";
import { Icon, P } from "../icons.jsx";
import { ThemeToggle } from "../theme.jsx";

const FEATURES = [
  { cls: "c1", ic: "violet", icon: P.book, t: "Plain-language summaries", d: "Every finding explained the way a great doctor would — at the reading level you choose. No jargon, no guesswork." },
  { cls: "c2", ic: "fuchsia", icon: P.warn, t: "Colour-coded abnormal flags", d: "Instantly see what's high, low, or normal with a severity system you can read at a glance.", flags: true },
  { cls: "c3", ic: "cyan", icon: P.info, t: "Terms decoded", d: "Medical vocabulary defined in one line each." },
  { cls: "c4", ic: "pink", icon: P.checkc, t: "Doctor questions", d: "Specific questions to bring to your next appointment." },
  { cls: "c5", ic: "lime", icon: P.shield, t: "Private by design", d: "Your raw report is never stored — only a one-way hash." },
];

export default function Landing() {
  return (
    <div>
      <div className="aurora"><div className="blob b1" /><div className="blob b2" /><div className="blob b3" /></div>
      <div className="grid-ov" />

      <nav className="nav">
        <div className="nav-in">
          <Link to="/" className="brand"><span className="mark"><Icon d={P.pulse} /></span><span className="bn">Medi<span>Sum</span></span></Link>
          <div className="nav-links">
            <a href="#features">Features</a><a href="#how">How it works</a><a href="#trust">Privacy</a>
          </div>
          <div className="nav-cta">
            <ThemeToggle />
            <Link to="/login" className="btn btn-glass btn-sm">Log in</Link>
            <Link to="/register" className="btn btn-primary btn-sm">Get started</Link>
          </div>
        </div>
      </nav>

      <main className="wrap">
        <section className="lhero">
          <div className="lhero-grid">
            <div>
              <div className="pill"><Icon d={P.sparkle} />Powered by <b style={{ color: "var(--fuchsia)" }}>Groq · LLaMA 3.3</b></div>
              <h1>Your labs,<br />finally in<br /><span className="grad-text">plain English.</span></h1>
              <p>Paste any medical report. MediSum decodes the jargon, flags what's abnormal, and hands you the exact questions to ask your doctor — in seconds.</p>
              <div className="lhero-cta">
                <Link to="/register" className="btn btn-primary btn-lg">Try it free<Icon d={P.arrow} /></Link>
                <a href="#how" className="btn btn-glass btn-lg">See how it works</a>
              </div>
              <div className="lhero-trust">
                <span><span className="tdot" />No card needed</span>
                <span><span className="tdot" />Reports never stored</span>
                <span><span className="tdot" />Never diagnoses</span>
              </div>
            </div>
            <div className="hv">
              <div className="hv-glow" />
              <div className="hv-main">
                <div className="hv-scan" />
                <div className="hv-head"><span className="hv-title">Complete Blood Count</span><span className="hv-badge">ANALYZED</span></div>
                <div className="hv-row lo"><div className="hv-ic"><Icon d={P.chart} /></div><div className="hv-info"><div className="hv-nm">Hemoglobin</div><div className="hv-vl">10.1 g/dL · ref 13.5–17.5</div></div><span className="hv-tag">LOW</span></div>
                <div className="hv-row hi"><div className="hv-ic"><Icon d={P.pulse} /></div><div className="hv-info"><div className="hv-nm">White Blood Cells</div><div className="hv-vl">11,200 /uL · ref 4k–11k</div></div><span className="hv-tag">HIGH</span></div>
                <div className="hv-row ok"><div className="hv-ic"><Icon d={P.check} /></div><div className="hv-info"><div className="hv-nm">Platelets</div><div className="hv-vl">250,000 /uL · normal</div></div><span className="hv-tag">NORMAL</span></div>
                <div className="hv-float"><div className="big">4.9★</div><div className="sm">Clarity rating from early users</div></div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <div className="strip">
        <div className="strip-in">
          <span className="strip-item"><Icon d={P.shield} />Private by design</span>
          <span className="strip-item"><Icon d={P.bolt} />Instant analysis</span>
          <span className="strip-item"><Icon d={P.checkc} />12+ report types</span>
          <span className="strip-item"><Icon d={P.clock} />Under 3 seconds</span>
        </div>
      </div>

      <main className="wrap">
        <section className="lsection" id="features">
          <div className="sec-head">
            <div className="pill"><Icon d={P.sparkle} />What you get</div>
            <h2>Everything you need to<br /><span className="grad-text">actually understand</span> your results</h2>
          </div>
          <div className="bento">
            {FEATURES.map((f) => (
              <div className={`bcard ${f.cls}`} key={f.t}>
                <div className={`b-ic ${f.ic}`}><Icon d={f.icon} /></div>
                <h3>{f.t}</h3>
                <p>{f.d}</p>
                {f.flags && <div className="demo-flags"><span className="dflag a">LOW</span><span className="dflag p">HIGH</span><span className="dflag l">NORMAL</span></div>}
              </div>
            ))}
          </div>
        </section>

        <section className="lsection" id="how" style={{ paddingTop: 12 }}>
          <div className="steps-wrap" id="trust">
            <div className="steps-head"><div className="pill"><Icon d={P.sparkle} />How it works</div><h2>Three steps to clarity</h2></div>
            <div className="steps">
              <div className="step"><div className="step-n">01</div><h4>Paste your report</h4><p>Copy the text from any lab result, discharge note, or radiology report — or drop an image.</p></div>
              <div className="step"><div className="step-n">02</div><h4>Pick a reading level</h4><p>Plain, 9th-grade, or detailed — you choose how it's explained.</p></div>
              <div className="step"><div className="step-n">03</div><h4>Get your breakdown</h4><p>Flagged findings, defined terms, and doctor questions in seconds.</p></div>
            </div>
          </div>
        </section>

        <section className="lsection" style={{ paddingTop: 12 }}>
          <div className="lcta">
            <div className="lcta-in">
              <h2>Ready to understand<br />your health?</h2>
              <p>Join people who never walk out of an appointment confused again.</p>
              <Link to="/register" className="btn btn-white btn-lg">Create your free account<Icon d={P.arrow} /></Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="lfoot">
        <div className="wrap lfoot-in">
          <Link to="/" className="brand"><span className="mark" style={{ width: 32, height: 32 }}><Icon d={P.pulse} /></span><span className="bn" style={{ fontSize: 18 }}>Medi<span>Sum</span></span></Link>
          <span>An educational tool, not a medical device. · FastAPI · React · MongoDB · Groq</span>
        </div>
      </footer>

      <style>{`
        .lhero{padding:60px 0 44px}
        .lhero-grid{display:grid;grid-template-columns:1.05fr .95fr;gap:48px;align-items:center}
        @media(max-width:940px){.lhero-grid{grid-template-columns:1fr;gap:38px}}
        .pill{margin-bottom:24px}
        .lhero h1{font-family:'Space Grotesk',sans-serif;font-weight:600;font-size:clamp(42px,6.5vw,74px);line-height:.98;letter-spacing:-.035em;margin-bottom:22px}
        .grad-text{background-size:200% auto;animation:shift 6s linear infinite}
        @keyframes shift{to{background-position:200% center}}
        .lhero p{font-size:18px;color:var(--ink-soft);max-width:480px;line-height:1.6;margin-bottom:28px}
        .lhero-cta{display:flex;gap:13px;flex-wrap:wrap;margin-bottom:24px}
        .lhero-trust{display:flex;gap:20px;flex-wrap:wrap}
        .lhero-trust span{display:inline-flex;align-items:center;gap:8px;font-size:14px;color:var(--ink-soft);font-weight:500}
        .tdot{width:8px;height:8px;border-radius:50%;background:var(--lime);box-shadow:0 0 10px var(--lime)}
        .hv{position:relative;height:460px}
        @media(max-width:940px){.hv{height:420px}}
        .hv-glow{position:absolute;inset:8% 12%;background:var(--grad-cool);border-radius:30px;filter:blur(40px);opacity:.35}
        .hv-main{position:absolute;inset:0;background:linear-gradient(160deg,rgba(35,17,73,.85),rgba(13,5,24,.9));border:1px solid var(--line-2);border-radius:24px;backdrop-filter:blur(18px);padding:26px;box-shadow:0 28px 70px rgba(0,0,0,.5),inset 0 1px 0 rgba(255,255,255,.08);overflow:hidden}
        [data-theme="light"] .hv-main{background:linear-gradient(160deg,rgba(255,255,255,.9),rgba(247,245,255,.8))}
        .hv-scan{position:absolute;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,var(--cyan),transparent);box-shadow:0 0 14px var(--cyan);animation:scan 3s ease-in-out infinite;z-index:3}
        @keyframes scan{0%{top:8%}50%{top:90%}100%{top:8%}}
        .hv-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px}
        .hv-title{font-family:'Sora',sans-serif;font-weight:600;font-size:14px}
        .hv-badge{font-family:'JetBrains Mono',monospace;font-size:9.5px;color:var(--cyan);background:rgba(34,211,238,.12);border:1px solid rgba(34,211,238,.3);padding:5px 10px;border-radius:20px}
        .hv-row{display:flex;align-items:center;gap:12px;padding:12px 14px;background:rgba(167,139,250,.06);border:1px solid var(--line);border-radius:14px;margin-bottom:10px;position:relative;overflow:hidden}
        .hv-row::before{content:"";position:absolute;left:0;top:0;bottom:0;width:3px}
        .hv-row.lo::before{background:var(--amber);box-shadow:0 0 12px var(--amber)}
        .hv-row.hi::before{background:var(--pink);box-shadow:0 0 12px var(--pink)}
        .hv-row.ok::before{background:var(--lime);box-shadow:0 0 12px var(--lime)}
        .hv-ic{width:36px;height:36px;border-radius:10px;display:grid;place-items:center;flex-shrink:0}
        .hv-row.lo .hv-ic{background:rgba(251,191,36,.14);color:var(--amber)}
        .hv-row.hi .hv-ic{background:rgba(244,114,182,.14);color:var(--pink)}
        .hv-row.ok .hv-ic{background:rgba(163,230,53,.14);color:var(--lime)}
        .hv-ic svg{width:18px;height:18px}
        .hv-info{flex:1;min-width:0}
        .hv-nm{font-weight:600;font-size:13.5px}
        .hv-vl{font-family:'JetBrains Mono',monospace;font-size:10.5px;color:var(--ink-faint);margin-top:2px}
        .hv-tag{font-family:'JetBrains Mono',monospace;font-size:9px;font-weight:500;text-transform:uppercase;letter-spacing:.05em;padding:4px 9px;border-radius:20px}
        .hv-row.lo .hv-tag{background:rgba(251,191,36,.14);color:var(--amber)}
        .hv-row.hi .hv-tag{background:rgba(244,114,182,.14);color:var(--pink)}
        .hv-row.ok .hv-tag{background:rgba(163,230,53,.14);color:var(--lime)}
        .hv-float{position:absolute;background:linear-gradient(150deg,rgba(139,92,246,.95),rgba(109,40,217,.9));border-radius:16px;padding:15px 17px;box-shadow:0 18px 46px rgba(139,92,246,.5);z-index:4;border:1px solid rgba(255,255,255,.16);animation:bob 4s ease-in-out infinite;bottom:-16px;right:-14px;width:160px}
        @keyframes bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-9px)}}
        .hv-float .big{font-family:'Space Grotesk',sans-serif;font-weight:600;font-size:28px;color:#fff;line-height:1}
        .hv-float .sm{font-size:11px;color:rgba(255,255,255,.85);margin-top:4px}
        .strip{border-top:1px solid var(--line);border-bottom:1px solid var(--line);padding:20px 0;background:rgba(139,92,246,.04);position:relative;z-index:2}
        .strip-in{display:flex;align-items:center;justify-content:center;gap:38px;flex-wrap:wrap}
        .strip-item{display:inline-flex;align-items:center;gap:9px;font-family:'Sora',sans-serif;font-weight:600;font-size:15px;color:var(--ink-faint)}
        .strip-item svg{width:18px;height:18px;color:var(--violet-2)}
        .lsection{padding:64px 0}
        .sec-head{text-align:center;margin-bottom:40px}
        .sec-head .pill{margin-bottom:16px}
        .sec-head h2{font-family:'Space Grotesk',sans-serif;font-weight:600;font-size:clamp(28px,4vw,44px);line-height:1.06;letter-spacing:-.025em}
        .bento{display:grid;grid-template-columns:repeat(6,1fr);gap:15px}
        @media(max-width:820px){.bento{grid-template-columns:repeat(2,1fr)}}
        @media(max-width:520px){.bento{grid-template-columns:1fr}}
        .bcard{background:var(--card);border:1px solid var(--line);border-radius:20px;padding:26px;position:relative;overflow:hidden;backdrop-filter:blur(14px);transition:.25s;min-height:196px}
        .bcard:hover{transform:translateY(-4px);border-color:var(--line-2);box-shadow:0 18px 44px rgba(139,92,246,.2)}
        .bcard::before{content:"";position:absolute;width:170px;height:170px;border-radius:50%;filter:blur(48px);opacity:.5;top:-58px;right:-38px}
        .bcard.c1{grid-column:span 3}.bcard.c1::before{background:var(--violet)}
        .bcard.c2{grid-column:span 3}.bcard.c2::before{background:var(--fuchsia)}
        .bcard.c3{grid-column:span 2}.bcard.c3::before{background:var(--cyan)}
        .bcard.c4{grid-column:span 2}.bcard.c4::before{background:var(--pink)}
        .bcard.c5{grid-column:span 2}.bcard.c5::before{background:var(--lime)}
        @media(max-width:820px){.bcard.c1,.bcard.c2,.bcard.c3,.bcard.c4,.bcard.c5{grid-column:span 1}}
        .b-ic{width:52px;height:52px;border-radius:14px;display:grid;place-items:center;margin-bottom:16px;position:relative;z-index:1}
        .b-ic svg{width:26px;height:26px}
        .b-ic.violet{background:rgba(139,92,246,.16);color:var(--violet-2)}
        .b-ic.fuchsia{background:rgba(232,121,249,.16);color:var(--fuchsia)}
        .b-ic.cyan{background:rgba(34,211,238,.16);color:var(--cyan)}
        .b-ic.pink{background:rgba(244,114,182,.16);color:var(--pink)}
        .b-ic.lime{background:rgba(163,230,53,.16);color:var(--lime)}
        .bcard h3{font-family:'Sora',sans-serif;font-size:18px;font-weight:600;margin-bottom:8px;position:relative;z-index:1}
        .bcard p{font-size:14px;color:var(--ink-soft);line-height:1.55;position:relative;z-index:1}
        .demo-flags{display:flex;gap:7px;margin-top:14px;position:relative;z-index:1}
        .dflag{font-family:'JetBrains Mono',monospace;font-size:9.5px;font-weight:500;padding:5px 10px;border-radius:20px}
        .dflag.a{background:rgba(251,191,36,.14);color:var(--amber)}
        .dflag.p{background:rgba(244,114,182,.14);color:var(--pink)}
        .dflag.l{background:rgba(163,230,53,.14);color:var(--lime)}
        .steps-wrap{background:linear-gradient(150deg,rgba(35,17,73,.6),rgba(13,5,24,.4));border:1px solid var(--line);border-radius:28px;padding:48px;position:relative;overflow:hidden}
        [data-theme="light"] .steps-wrap{background:linear-gradient(150deg,rgba(255,255,255,.7),rgba(247,245,255,.5))}
        .steps-wrap::before{content:"";position:absolute;width:380px;height:380px;background:radial-gradient(circle,rgba(232,121,249,.2),transparent 65%);top:-110px;right:-70px;filter:blur(26px)}
        .steps-head{margin-bottom:34px;position:relative}
        .steps-head h2{font-family:'Space Grotesk',sans-serif;font-weight:600;font-size:clamp(26px,3.5vw,38px);letter-spacing:-.02em}
        .steps{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;position:relative}
        @media(max-width:720px){.steps{grid-template-columns:1fr}}
        .step-n{font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:52px;line-height:1;background:var(--grad-hero);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:10px}
        .step h4{font-family:'Sora',sans-serif;font-size:18px;font-weight:600;margin-bottom:7px}
        .step p{font-size:14px;color:var(--ink-soft);line-height:1.55}
        .lcta{background:var(--grad-violet);border-radius:28px;padding:64px 40px;text-align:center;position:relative;overflow:hidden;box-shadow:0 26px 70px rgba(139,92,246,.4)}
        .lcta::before{content:"";position:absolute;inset:0;background:radial-gradient(circle at 20% 20%,rgba(232,121,249,.5),transparent 40%),radial-gradient(circle at 80% 80%,rgba(34,211,238,.4),transparent 40%)}
        .lcta-in{position:relative;z-index:1}
        .lcta h2{font-family:'Space Grotesk',sans-serif;font-weight:600;font-size:clamp(30px,4.5vw,48px);color:#fff;line-height:1.04;letter-spacing:-.025em;margin-bottom:14px}
        .lcta p{font-size:17px;color:rgba(255,255,255,.85);margin-bottom:30px;max-width:460px;margin-left:auto;margin-right:auto}
        .lfoot{border-top:1px solid var(--line);padding:30px 0;position:relative;z-index:2}
        .lfoot-in{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px}
        .lfoot-in span{font-size:12.5px;color:var(--ink-faint)}
      `}</style>
    </div>
  );
}
