import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Icon, P } from "../icons.jsx";
import { useAuth } from "../auth.jsx";
import { ThemeToggle } from "../theme.jsx";
import { useHealth } from "../context/HealthContext.jsx";

const CORE_NAV = [
  { to: "/app", label: "Dashboard", icon: P.grid },
  { to: "/app/upload", label: "New Scan", icon: P.upload },
  { to: "/app/reports", label: "Reports DB", icon: P.file },
];
const ANALYTICS_NAV = [
  { to: "/app/history", label: "History & Trends", icon: P.clock },
  { to: "/app/compare", label: "Compare Reports", icon: P.compare },
  { to: "/app/alerts", label: "Clinical Alerts", icon: P.warn },
];
const AUTOMATION_NAV = [
  { to: "/app/automation", label: "Workflow Engine", icon: P.pulse },
  { to: "/app/reminders", label: "Reminders", icon: P.bell },
  { to: "/app/settings", label: "Settings", icon: P.settings },
];

const ADMIN_NAV = [
  { to: "/admin", label: "Overview", icon: P.grid },
  { to: "/admin/users", label: "Users", icon: P.users },
];

export default function Shell({ children, nav }) {
  const { auth, logout } = useAuth();
  const { notifications, markAllNotificationsRead } = useHealth();
  const navigate = useNavigate();
  const [showNotif, setShowNotif] = useState(false);
  
  const user = auth?.user || {};
  const initials = (user.name || user.email || "U").trim().slice(0, 2).toUpperCase();
  const unreadCount = notifications.filter((n) => !n.read).length;

  function doLogout() {
    logout();
    navigate("/login");
  }

  return (
    <>
      <div className="aurora"><div className="blob b1" /><div className="blob b2" /><div className="blob b3" /></div>
      <div className="grid-ov" />
      <div className="shell">
        <aside className="side">
          <Link to="/" className="brand">
            <span className="mark"><Icon d={P.pulse} /></span>
            <span className="bn">Medi<span>Sum</span></span>
          </Link>
          
          <nav className="side-nav">
            {user.role === "admin" ? (
              <>
                <div className="nav-section-label">Admin Controls</div>
                {ADMIN_NAV.map((n) => (
                  <NavLink key={n.to} to={n.to} end className={({ isActive }) => (isActive ? "active" : "")}>
                    <Icon d={n.icon} />{n.label}
                  </NavLink>
                ))}
              </>
            ) : (
              <>
                <div className="nav-section-label">Core Platform</div>
                {CORE_NAV.map((n) => (
                  <NavLink key={n.to} to={n.to} end className={({ isActive }) => (isActive ? "active" : "")}>
                    <Icon d={n.icon} />{n.label}
                  </NavLink>
                ))}

                <div className="nav-section-label">Analytics & Insights</div>
                {ANALYTICS_NAV.map((n) => (
                  <NavLink key={n.to} to={n.to} end className={({ isActive }) => (isActive ? "active" : "")}>
                    <Icon d={n.icon} />{n.label}
                  </NavLink>
                ))}

                <div className="nav-section-label">Automation Tools</div>
                {AUTOMATION_NAV.map((n) => (
                  <NavLink key={n.to} to={n.to} end className={({ isActive }) => (isActive ? "active" : "")}>
                    <Icon d={n.icon} />{n.label}
                  </NavLink>
                ))}
              </>
            )}
          </nav>

          <div className="side-foot">
            <div className="side-user">
              <div className="avatar">
                <span className="avatar-ring"></span>
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <div className="nm truncate">{user.name || "User"}</div>
                <div className="rl">{user.role}</div>
              </div>
              <div className="flex gap-1 items-center" style={{ marginLeft: "auto" }}>
                <button 
                  className="theme-btn relative flex items-center justify-center" 
                  onClick={() => setShowNotif(!showNotif)}
                  title="Notifications"
                >
                  <Icon d={P.bell} className="w-[18px] h-[18px]" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-pink-500 ring-2 ring-zinc-950 animate-pulse"></span>
                  )}
                </button>
                <ThemeToggle />
              </div>
            </div>
            <button className="logout" onClick={doLogout}><Icon d={P.logout} />Log out</button>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", alignItems: "center", marginTop: "4px" }}>
              <div className="sys-status">
                <span className="sys-dot"></span>
                Automation Active
              </div>
              <div style={{ fontSize: 10, color: "var(--ink-faint)", textAlign: "center" }}>
                Press <span className="kbd">⌘K</span> for commands
              </div>
            </div>
          </div>
        </aside>
        
        <main className="main relative">
          {children}

          {/* Notifications Drawer Overlay */}
          {showNotif && (
            <div className="fixed inset-y-0 right-0 w-80 bg-zinc-950/85 border-l border-purple-500/15 backdrop-blur-md z-[200] p-5 shadow-2xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-purple-500/10 pb-3 mb-4">
                  <h3 className="font-bold text-sm text-zinc-100 flex items-center gap-2">
                    <Icon d={P.bell} className="w-4 h-4 text-purple-400" /> Notifications Drawer
                  </h3>
                  <button className="text-zinc-400 hover:text-white" onClick={() => setShowNotif(false)}>
                    <Icon d={P.x} className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex flex-col gap-3 overflow-y-auto max-h-[72vh] pr-1">
                  {notifications.length === 0 ? (
                    <div className="text-center text-xs text-zinc-500 py-12">No notifications yet.</div>
                  ) : (
                    notifications.map((n) => (
                      <div 
                        key={n.id} 
                        className={`p-3 rounded-xl bg-zinc-900/50 border border-purple-500/5 text-xs flex gap-2.5 ${
                          !n.read ? "border-purple-500/20 bg-purple-500/5" : ""
                        }`}
                      >
                        <span className={`w-5 h-5 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          n.type === "alert" ? "bg-red-500/15 text-red-400" :
                          n.type === "reminder" ? "bg-cyan-500/15 text-cyan-400" :
                          "bg-purple-500/15 text-purple-400"
                        }`}>
                          <Icon d={n.type === "alert" ? P.warn : n.type === "reminder" ? P.clock : P.pulse} className="w-3 h-3" />
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-zinc-200">{n.title}</div>
                          <p className="text-zinc-400 text-[10px] mt-0.5 leading-normal">{n.desc}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
              
              {notifications.length > 0 && (
                <button 
                  className="w-full text-center text-[10px] font-bold uppercase tracking-wider text-purple-400 border-t border-purple-500/10 pt-3 hover:text-purple-300"
                  onClick={markAllNotificationsRead}
                >
                  Mark all as read
                </button>
              )}
            </div>
          )}
        </main>
      </div>
    </>
  );
}
