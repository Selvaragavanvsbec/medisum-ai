import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Icon, P } from "../icons.jsx";
import { ThemeToggle } from "../theme.jsx";

const FEATURES = [
  { cls: "c1", ic: "violet", icon: P.book, t: "Plain-Language Summaries", d: "Every finding explained the way a great doctor would — at the reading level you choose. No jargon, no guesswork." },
  { cls: "c2", ic: "fuchsia", icon: P.warn, t: "Color-Coded Abnormal Flags", d: "Instantly see what's high, low, or normal with a severity system you can read at a glance.", flags: true },
  { cls: "c3", ic: "cyan", icon: P.info, t: "Medical Terms Decoded", d: "Medical vocabulary defined in simple, one-line summaries." },
  { cls: "c4", ic: "pink", icon: P.checkc, t: "Intelligent Doctor Questions", d: "Receive highly specific, relevant questions to bring to your next clinical checkup." },
  { cls: "c5", ic: "lime", icon: P.shield, t: "Private & Safe By Design", d: "Your raw report is never stored — only a secure one-way hash." },
];

export default function Landing() {
  const canvasRef = useRef(null);

  // Particle background logic
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animationId;
    
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    const particles = [];
    const count = 40;
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 2 + 1,
        dx: (Math.random() - 0.5) * 0.4,
        dy: (Math.random() - 0.5) * 0.4,
        alpha: Math.random() * 0.5 + 0.1,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "rgba(99, 102, 241, 0.15)";
      
      particles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(99, 102, 241, ${p.alpha})`;
        ctx.fill();
        
        p.x += p.dx;
        p.y += p.dy;

        if (p.x < 0 || p.x > canvas.width) p.dx = -p.dx;
        if (p.y < 0 || p.y > canvas.height) p.dy = -p.dy;
      });
      animationId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div style={{ minHeight: "100vh", overflowX: "hidden" }}>
      <div className="aurora">
        <div className="blob b1" />
        <div className="blob b2" />
        <div className="blob b3" />
        <canvas ref={canvasRef} className="particle-canvas" />
      </div>
      <div className="grid-ov" />

      <nav className="nav">
        <div className="nav-in">
          <Link to="/" className="brand">
            <span className="mark"><Icon d={P.pulse} /></span>
            <span className="bn">Medi<span>Sum</span></span>
          </Link>
          <div className="nav-links">
            <a href="#features">Features</a>
            <a href="#how">How it works</a>
            <a href="#stats">Impact</a>
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
            <div className="anim-fade-up">
              <div className="pill"><Icon d={P.sparkle} />Powered by <b style={{ color: "var(--violet-2)" }}>Groq · LLaMA 3.3</b></div>
              <h1>Your labs,<br />finally in<br /><span className="grad-text">plain English.</span></h1>
              <p>Paste any medical report. MediSum decodes the jargon, flags what's abnormal, and hands you the exact questions to ask your doctor — in seconds.</p>
              <div className="lhero-cta">
                <Link to="/register" className="btn btn-primary btn-lg">Try it free<Icon d={P.arrow} /></Link>
                <a href="#how" className="btn btn-glass btn-lg">See how it works</a>
              </div>
              <div className="lhero-trust">
                <span><span className="tdot" />HIPAA Compliant</span>
                <span><span className="tdot" />Reports Never Stored</span>
                <span><span className="tdot" />Never Diagnoses</span>
              </div>
            </div>
            
            <div className="hv anim-scale-in">
              <div className="hv-glow" />
              <div className="hv-main">
                <div className="hv-scan" />
                <div className="hv-head">
                  <span className="hv-title">Complete Blood Count</span>
                  <span className="hv-badge">ANALYZED</span>
                </div>
                <div className="hv-row lo">
                  <div className="hv-ic"><Icon d={P.chart} /></div>
                  <div className="hv-info">
                    <div className="hv-nm">Hemoglobin</div>
                    <div className="hv-vl">10.1 g/dL · ref 13.5–17.5</div>
                  </div>
                  <span className="hv-tag">LOW</span>
                </div>
                <div className="hv-row hi">
                  <div className="hv-ic"><Icon d={P.pulse} /></div>
                  <div className="hv-info">
                    <div className="hv-nm">White Blood Cells</div>
                    <div className="hv-vl">11,200 /uL · ref 4k–11k</div>
                  </div>
                  <span className="hv-tag">HIGH</span>
                </div>
                <div className="hv-row ok">
                  <div className="hv-ic"><Icon d={P.check} /></div>
                  <div className="hv-info">
                    <div className="hv-nm">Platelets</div>
                    <div className="hv-vl">250,000 /uL · normal</div>
                  </div>
                  <span className="hv-tag">NORMAL</span>
                </div>
                <div className="hv-float">
                  <div className="big">4.9★</div>
                  <div className="sm">Clarity rating from early patients</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Counter Grid */}
        <section id="stats" className="stat-counter-grid anim-fade-up">
          <div className="glass stat-counter">
            <div className="num">50K+</div>
            <div className="sub">Reports Summarized</div>
          </div>
          <div className="glass stat-counter">
            <div className="num">99.8%</div>
            <div className="sub">OCR Accuracy</div>
          </div>
          <div className="glass stat-counter">
            <div className="num">&lt; 3.0s</div>
            <div className="sub">Average Response</div>
          </div>
          <div className="glass stat-counter">
            <div className="num">25+</div>
            <div className="sub">Lab Parameters Decoded</div>
          </div>
        </section>
      </main>

      <div className="strip">
        <div className="strip-in">
          <span className="strip-item"><Icon d={P.shield} />Private & Secure</span>
          <span className="strip-item"><Icon d={P.bolt} />Real-Time Extraction</span>
          <span className="strip-item"><Icon d={P.checkc} />Auto-Flagged Risks</span>
          <span className="strip-item"><Icon d={P.clock} />Instant Clarity</span>
        </div>
      </div>

      <main className="wrap">
        <section className="lsection" id="features">
          <div className="sec-head">
            <div className="pill"><Icon d={P.sparkle} />Platform Features</div>
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
          <div className="steps-wrap">
            <div className="steps-head">
              <div className="pill"><Icon d={P.sparkle} />Simple Steps</div>
              <h2>Three steps to absolute clarity</h2>
            </div>
            <div className="steps">
              <div className="step">
                <div className="step-n">01</div>
                <h4>Upload or Paste</h4>
                <p>Drop a PDF/image report or paste your raw text directly into our secure scanner portal.</p>
              </div>
              <div className="step">
                <div className="step-n">02</div>
                <h4>Pick a Reading Level</h4>
                <p>Plain English, 9th grade, or professional clinical level — you control the level of medical vocabulary detail.</p>
              </div>
              <div className="step">
                <div className="step-n">03</div>
                <h4>Get Instant Breakdown</h4>
                <p>Receive your visual scores, flagged metrics, definitions, and medical follow-up check questions immediately.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="lsection" style={{ paddingTop: 12 }}>
          <div className="lcta">
            <div className="lcta-in">
              <h2>Ready to understand<br />your health?</h2>
              <p>Join patients worldwide who take control of their lab reports with total confidence.</p>
              <Link to="/register" className="btn btn-white btn-lg">Create free account<Icon d={P.arrow} /></Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="lfoot">
        <div className="wrap lfoot-in">
          <Link to="/" className="brand"><span className="mark" style={{ width: 32, height: 32 }}><Icon d={P.pulse} /></span><span className="bn" style={{ fontSize: 18 }}>Medi<span>Sum</span></span></Link>
          <span>Educational translation assistant. HIPAA-aligned platform. LLaMA 3.3 Powered.</span>
        </div>
      </footer>

      <style>{`
        @keyframes shift{to{background-position:200% center}}
      `}</style>
    </div>
  );
}
