import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Icon, P } from "../icons.jsx";
import { useAuth, api } from "../auth.jsx";
import { ThemeToggle } from "../theme.jsx";
import { useToast, fireConfetti } from "../ui.jsx";

export default function Register() {
  const { save } = useAuth();
  const toast = useToast();
  const nav = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setError("");
    if (form.password.length < 8) { setError("Password must be at least 8 characters."); return; }
    setLoading(true);
    try {
      const data = await api("/auth/register", { method: "POST", body: form });
      save(data);
      fireConfetti();
      toast("Account created — welcome to MediSum!", "ok");
      nav("/app");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="aurora"><div className="blob b1" /><div className="blob b2" /><div className="blob b3" /></div>
      <div className="grid-ov" />
      <div className="auth">
        <aside className="auth-aside">
          <Link to="/" className="brand"><span className="mark"><Icon d={P.pulse} /></span><span className="bn">Medi<span>Sum</span></span></Link>
          <div className="aside-mid">
            <h2>Start understanding<br /><span className="grad-text">your reports today.</span></h2>
            <p>Create a free account and turn confusing medical results into clear, plain-language explanations in seconds.</p>
            <div className="aside-feats">
              <div className="aside-feat"><span className="tick"><Icon d={P.check} /></span>Free — no card required</div>
              <div className="aside-feat"><span className="tick"><Icon d={P.check} /></span>Works with any lab or radiology report</div>
              <div className="aside-feat"><span className="tick"><Icon d={P.check} /></span>Private and secure by design</div>
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
            <h1>Create account</h1>
            <p className="lead">It takes less than a minute.</p>

            {error && <div className="alert alert-error"><Icon d={P.warn} />{error}</div>}

            <form onSubmit={submit}>
              <div className="field"><label>Full name</label>
                <input value={form.name} onChange={set("name")} placeholder="Jane Doe" required />
              </div>
              <div className="field"><label>Email</label>
                <input type="email" value={form.email} onChange={set("email")} placeholder="you@example.com" required />
              </div>
              <div className="field"><label>Password</label>
                <input type="password" value={form.password} onChange={set("password")} placeholder="At least 8 characters" required />
                <div className="hintline">Use 8 or more characters.</div>
              </div>
              <button className="btn btn-primary btn-block" disabled={loading}>
                {loading ? <><Icon d={P.spin} className="spin" />Creating…</> : <>Create account<Icon d={P.arrow} /></>}
              </button>
            </form>
            <div className="auth-switch">Already have an account? <Link to="/login">Log in</Link></div>
          </div>
        </main>
      </div>
    </div>
  );
}
