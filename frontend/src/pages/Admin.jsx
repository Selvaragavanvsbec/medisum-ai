import { useEffect, useState, useCallback } from "react";
import Shell from "./Shell.jsx";
import { Icon, P } from "../icons.jsx";
import { useAuth, api } from "../auth.jsx";
import { Counter } from "../ui.jsx";
import { useToast } from "../ui.jsx";

export function AdminDashboard() {
  const { auth } = useAuth();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api("/admin/stats", { token: auth?.access_token }).then(setStats).catch((e) => setError(e.message));
  }, [auth]);

  const cards = [
    { k: "total_users", label: "Total users", icon: P.users, cls: "violet" },
    { k: "regular_users", label: "Regular users", icon: P.user, cls: "cyan" },
    { k: "admins", label: "Admins", icon: P.shield, cls: "fuchsia" },
    { k: "total_summaries", label: "Reports analyzed", icon: P.file, cls: "lime" },
  ];

  return (
    <Shell>
      <div className="page-head">
        <div><h1>Admin overview</h1><p>Platform activity at a glance.</p></div>
        <span className="pill orange"><Icon d={P.shield} />Admin</span>
      </div>

      {error && <div className="alert alert-error"><Icon d={P.warn} />{error}</div>}

      <div className="stats">
        {cards.map((c) => (
          <div className="stat glass" key={c.k}>
            <div className={`ico ${c.cls}`}><Icon d={c.icon} /></div>
            <div className="num">{stats ? <Counter value={stats[c.k]} /> : "—"}</div>
            <div className="lbl">{c.label}</div>
          </div>
        ))}
      </div>

      <div className="glass" style={{ padding: 28 }}>
        <h3 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 20, fontWeight: 600, marginBottom: 8 }}>Welcome, administrator</h3>
        <p style={{ color: "var(--ink-soft)", fontSize: 15, maxWidth: 620, lineHeight: 1.6 }}>
          From here you can monitor platform usage and manage user accounts. Head to the Users
          section to promote members to admin, or remove accounts. All report content stays private —
          only anonymized activity counts are shown here.
        </p>
        <a href="/admin/users" className="btn btn-primary" style={{ marginTop: 20 }}>Manage users<Icon d={P.arrow} /></a>
      </div>
    </Shell>
  );
}

export function AdminUsers() {
  const { auth } = useAuth();
  const toast = useToast();
  const [users, setUsers] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");

  const refresh = useCallback(() => {
    api("/admin/users", { token: auth?.access_token }).then((d) => setUsers(d.users)).catch((e) => setError(e.message));
  }, [auth]);
  useEffect(refresh, [refresh]);

  async function setRole(email, role) {
    setBusy(email); setError("");
    try { await api("/admin/users/role", { method: "POST", token: auth?.access_token, body: { email, role } }); toast(`Role updated to ${role}`, "ok"); refresh(); }
    catch (e) { setError(e.message); toast(e.message, "err"); } finally { setBusy(""); }
  }
  async function del(email) {
    if (!window.confirm(`Delete ${email}? This can't be undone.`)) return;
    setBusy(email); setError("");
    try { await api(`/admin/users/${encodeURIComponent(email)}`, { method: "DELETE", token: auth?.access_token }); toast("User deleted", "ok"); refresh(); }
    catch (e) { setError(e.message); toast(e.message, "err"); } finally { setBusy(""); }
  }

  return (
    <Shell>
      <div className="page-head">
        <div><h1>User management</h1><p>Promote, demote, or remove accounts.</p></div>
        <span className="pill">{users ? `${users.length} users` : "…"}</span>
      </div>

      {error && <div className="alert alert-error"><Icon d={P.warn} />{error}</div>}

      <div className="glass tablecard">
        <div className="th"><h3>All users</h3></div>
        {!users ? (
          <div className="empty"><div className="eico"><Icon d={P.spin} className="spin" /></div><h3>Loading…</h3></div>
        ) : users.length === 0 ? (
          <div className="empty"><div className="eico"><Icon d={P.users} /></div><h3>No users yet</h3><p>Registered users will appear here.</p></div>
        ) : (
          <table>
            <thead><tr><th>User</th><th>Email</th><th>Role</th><th style={{ textAlign: "right" }}>Actions</th></tr></thead>
            <tbody>
              {users.map((u) => {
                const initials = (u.name || u.email).trim().slice(0, 2).toUpperCase();
                const isBusy = busy === u.email;
                return (
                  <tr key={u.email}>
                    <td><div className="trow-user"><div className="uav">{initials}</div><b>{u.name || "—"}</b></div></td>
                    <td style={{ color: "var(--ink-soft)" }}>{u.email}</td>
                    <td><span className={`rolechip ${u.role}`}>{u.role}</span></td>
                    <td style={{ textAlign: "right" }}>
                      {u.role === "user"
                        ? <button className="linkbtn promote" disabled={isBusy} onClick={() => setRole(u.email, "admin")}>Make admin</button>
                        : <button className="linkbtn promote" disabled={isBusy} onClick={() => setRole(u.email, "user")}>Make user</button>}
                      <button className="linkbtn del" disabled={isBusy} onClick={() => del(u.email)}>Delete</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </Shell>
  );
}
