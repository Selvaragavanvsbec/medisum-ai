import { useState, useEffect } from "react";
import Shell from "./Shell.jsx";
import { Icon, P } from "../icons.jsx";
import { useHealth } from "../context/HealthContext.jsx";
import { useTheme } from "../theme.jsx";

export default function Settings() {
  const { settings, updateSettings } = useHealth();
  const { theme, toggle } = useTheme();
  
  const [form, setForm] = useState({
    theme: "dark",
    emailNotifications: true,
    reminderFrequency: "weekly",
    alertThreshold: "high",
    language: "en",
    notificationEmail: "",
  });

  // Sync state with global settings on load
  useEffect(() => {
    if (settings) {
      setForm(settings);
    }
  }, [settings]);

  const handleSubmit = (e) => {
    e.preventDefault();
    updateSettings(form);
  };

  const handleToggleTheme = () => {
    toggle();
    setForm((prev) => ({ ...prev, theme: theme === "dark" ? "light" : "dark" }));
  };

  return (
    <Shell>
      <div className="page-head">
        <div>
          <h1>Preferences & Automations</h1>
          <p>Configure notifications threshold boundaries, email dispatch schedules, and theme preferences.</p>
        </div>
      </div>

      <div className="glass card-pad max-w-xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* User Interface */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400 border-b border-purple-500/10 pb-2 mb-3">User Interface</h3>
            <div className="flex justify-between items-center bg-zinc-900/40 p-4 rounded-xl border border-purple-500/5">
              <div>
                <div className="text-xs font-bold text-zinc-100">Interface Theme</div>
                <div className="text-[10px] text-zinc-500 mt-0.5">Toggle between Dark Mode and Light Mode layouts.</div>
              </div>
              <button 
                type="button" 
                className="theme-btn" 
                onClick={handleToggleTheme}
              >
                <Icon d={theme === "dark" ? P.sun : P.moon} className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Email Notifications */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400 border-b border-purple-500/10 pb-2 mb-3">Dispatches & Emails</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-zinc-900/40 p-4 rounded-xl border border-purple-500/5">
                <div>
                  <div className="text-xs font-bold text-zinc-100">Auto-Email Alerts</div>
                  <div className="text-[10px] text-zinc-500 mt-0.5">Forward red-severity critical findings directly to patient email.</div>
                </div>
                <input 
                  type="checkbox" 
                  className="w-4 h-4 accent-purple-500"
                  checked={form.emailNotifications}
                  onChange={(e) => setForm({ ...form, emailNotifications: e.target.checked })}
                />
              </div>

              {form.emailNotifications && (
                <div className="field">
                  <label>Notification Recipient Email</label>
                  <input
                    type="email"
                    className="w-full text-xs"
                    placeholder="Enter email address"
                    value={form.notificationEmail}
                    onChange={(e) => setForm({ ...form, notificationEmail: e.target.value })}
                    required
                  />
                </div>
              )}
            </div>
          </div>

          {/* Automation settings */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400 border-b border-purple-500/10 pb-2 mb-3">Telemetry Boundaries</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="field">
                <label>Alert Trigger Threshold</label>
                <select
                  className="w-full text-xs py-2 px-3 bg-zinc-900/50 border border-purple-500/10 rounded-xl"
                  value={form.alertThreshold}
                  onChange={(e) => setForm({ ...form, alertThreshold: e.target.value })}
                >
                  <option value="low">Low (Alert all findings)</option>
                  <option value="medium">Medium (Alert values outside range)</option>
                  <option value="high">High (Alert clinical concerns)</option>
                  <option value="critical">Critical (Alert urgent issues only)</option>
                </select>
              </div>

              <div className="field">
                <label>Reminder Check frequency</label>
                <select
                  className="w-full text-xs py-2 px-3 bg-zinc-900/50 border border-purple-500/10 rounded-xl"
                  value={form.reminderFrequency}
                  onChange={(e) => setForm({ ...form, reminderFrequency: e.target.value })}
                >
                  <option value="daily">Daily Cron Summary</option>
                  <option value="weekly">Weekly Checklist Sync</option>
                  <option value="monthly">Monthly Diagnostics Review</option>
                </select>
              </div>
            </div>
          </div>

          {/* Language Selection */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400 border-b border-purple-500/10 pb-2 mb-3">Translation Engine</h3>
            <div className="field">
              <label>Default Translation Language</label>
              <select
                className="w-full text-xs py-2 px-3 bg-zinc-900/50 border border-purple-500/10 rounded-xl"
                value={form.language}
                onChange={(e) => setForm({ ...form, language: e.target.value })}
              >
                <option value="en">English (US/UK)</option>
                <option value="es">Español (Spanish)</option>
                <option value="fr">Français (French)</option>
                <option value="de">Deutsch (German)</option>
                <option value="zh">中文 (Chinese)</option>
              </select>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 justify-end border-t border-purple-500/10 pt-4">
            <button type="submit" className="btn btn-primary">Save Preferences</button>
          </div>

        </form>
      </div>
    </Shell>
  );
}
