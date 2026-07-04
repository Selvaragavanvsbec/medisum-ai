import Shell from "./Shell.jsx";
import { Icon, P } from "../icons.jsx";
import { useAuth } from "../auth.jsx";

export default function Profile() {
  const { auth } = useAuth();
  const user = auth?.user || {};
  const initials = (user.name || user.email || "U").trim().slice(0, 2).toUpperCase();

  return (
    <Shell>
      <div className="page-head">
        <div><h1>Your profile</h1><p>Your account details.</p></div>
      </div>

      <div className="glass" style={{ padding: 28, maxWidth: 560 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 24 }}>
          <div className="avatar" style={{ width: 68, height: 68, fontSize: 26, borderRadius: 20 }}>{initials}</div>
          <div>
            <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 24, fontWeight: 600 }}>{user.name || "User"}</div>
            <div style={{ color: "var(--ink-soft)", fontSize: 15 }}>{user.email}</div>
          </div>
        </div>
        <div className="prow"><span>Full name</span><b>{user.name || "—"}</b></div>
        <div className="prow"><span>Email</span><b>{user.email}</b></div>
        <div className="prow"><span>Account type</span><span className={`rolechip ${user.role}`}>{user.role}</span></div>
        <div className="prow" style={{ borderBottom: 0 }}><span>Status</span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 7, color: "var(--lime)", fontWeight: 600, fontSize: 14 }}>
            <Icon d={P.checkc} style={{ width: 16, height: 16 }} />Active
          </span>
        </div>
      </div>

      <style>{`
        .prow{display:flex;justify-content:space-between;align-items:center;padding:15px 0;border-bottom:1px solid var(--line)}
        .prow span:first-child{font-size:14px;color:var(--ink-soft)}
        .prow b{font-size:14.5px;font-weight:600}
      `}</style>
    </Shell>
  );
}
