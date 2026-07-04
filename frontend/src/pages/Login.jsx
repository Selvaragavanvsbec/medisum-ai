import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Icon, P } from "../icons.jsx";
import { useAuth, api } from "../auth.jsx";
import { ThemeToggle } from "../theme.jsx";
import { useToast } from "../ui.jsx";

export default function Login() {
  const { save } = useAuth();
  const toast = useToast();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await api("/auth/login", { method: "POST", body: { email, password } });
      save(data);
      toast(`Welcome back, ${data.user.name || "there"}`, "ok");
      nav(data.user.role === "admin" ? "/admin" : "/app");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function fillDemo() {
    setEmail("admin@medisum.ai");
    setPassword("admin12345");
  }

  return (
    <div>
      <div className="aurora"><div className="blob b1" /><div className="blob b2" /><div className="blob b3" /></div>
      <div className="grid-ov" />
      <div className="auth">
        <aside className="auth-aside">
          <Link to="/" className="brand"><span className="mark"><Icon d={P.pulse} /></span><span className="bn">Medi<span>Sum</span></span></Link>
          <div className="aside-mid">
            <h2>Welcome back to<br /><span className="grad-text">clearer health.</span></h2>
            <p>Log in to analyze reports, track your trends, and keep understanding your results with confidence.</p>
            <div className="aside-feats">
              <div className="aside-feat"><span className="tick"><Icon d={P.check} /></span>Plain-language summaries</div>
              <div className="aside-feat"><span className="tick"><Icon d={P.check} /></span>Health trends over time</div>
              <div className="aside-feat"><span className="tick"><Icon d={P.check} /></span>Your reports are never stored</div>
            </div>
          </div>
          <div style={{ fontSize: 12.5, color: "var(--ink-faint)" }}>An educational tool, not a medical device.</div>
        </aside>

        <main className="auth-main">
          <div className="auth-box">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <Link to="/" className="brand"><span className="mark" style={{ width: 34, height: 34 }}><Icon d={P.pulse} /></span><span className="bn" style={{ fontSize: 19 }}>Medi<span>Sum</span></span></Link>
              <ThemeToggle />
            </div>
            <h1>Log in</h1>
            <p className="lead">Enter your details to continue.</p>

            {error && <div className="alert alert-error"><Icon d={P.warn} />{error}</div>}

            <form onSubmit={submit}>
              <div className="field"><label>Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
              </div>
              <div className="field"><label>Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
              </div>
              <button className="btn btn-primary btn-block" disabled={loading}>
                {loading ? <><Icon d={P.spin} className="spin" />Logging in…</> : <>Log in<Icon d={P.arrow} /></>}
              </button>
            </form>

            <div className="demo-note">
              Demo admin — <b>admin@medisum.ai</b> / <b>admin12345</b>
              <button className="linkbtn" onClick={fillDemo}>Fill demo credentials →</button>
            </div>
            <div className="auth-switch">New here? <Link to="/register">Create an account</Link></div>
          </div>
        </main>
      </div>
    </div>
  );
}
