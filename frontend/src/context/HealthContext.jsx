import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth, api } from "../auth.jsx";
import { useToast } from "../ui.jsx";

const HealthContext = createContext(null);

export function HealthProvider({ children }) {
  const { auth } = useAuth();
  const toast = useToast();
  const [reports, setReports] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [settings, setSettings] = useState({
    theme: "dark",
    emailNotifications: true,
    reminderFrequency: "weekly",
    alertThreshold: "high",
    language: "en",
    notificationEmail: auth?.user?.email || "",
  });
  const [loading, setLoading] = useState(false);

  const userKey = auth?.user?.email ? auth.user.email.toLowerCase() : "anon";

  // Load local state when auth changes
  useEffect(() => {
    if (!auth) {
      setReports([]);
      setReminders([]);
      setAlerts([]);
      setNotifications([]);
      return;
    }

    setLoading(true);
    // Fetch reports from backend API
    api("/reports", { token: auth.access_token })
      .then((res) => {
        const items = res.items || [];
        setReports(items);
        processInitialReports(items);
      })
      .catch((err) => {
        console.warn("Could not load reports from API, using localStorage fallback:", err);
        // Fallback to localStorage
        const storedReports = JSON.parse(localStorage.getItem(`medisum_reports_${userKey}`)) || [];
        setReports(storedReports);
        processInitialReports(storedReports);
      })
      .finally(() => setLoading(false));

    // Load active settings
    const storedSettings = JSON.parse(localStorage.getItem(`medisum_settings_${userKey}`));
    if (storedSettings) {
      setSettings(storedSettings);
    } else {
      setSettings((prev) => ({ ...prev, notificationEmail: auth.user.email }));
    }

    // Load custom reminders state (for edit/complete states which aren't in raw database)
    const storedReminders = JSON.parse(localStorage.getItem(`medisum_reminders_${userKey}`));
    if (storedReminders) {
      setReminders(storedReminders);
    }

    // Load custom notifications feed
    const storedNotifications = JSON.parse(localStorage.getItem(`medisum_notifications_${userKey}`));
    if (storedNotifications) {
      setNotifications(storedNotifications);
    } else {
      // Seed welcome notification
      const welcome = {
        id: "welcome",
        type: "info",
        title: "Platform Initialized",
        desc: "Welcome to your Healthcare Automation Platform.",
        at: new Date().toISOString(),
        read: false,
      };
      setNotifications([welcome]);
    }
  }, [auth, userKey]);

  // Process reports to extract alerts & reminders
  const processInitialReports = (reportList) => {
    const allAlerts = [];
    const allReminders = [];

    reportList.forEach((rep) => {
      const summary = rep.summary || {};
      const atDate = rep.created_at || new Date().toISOString();

      // Extract alerts
      if (summary.alerts && Array.isArray(summary.alerts)) {
        summary.alerts.forEach((alert, idx) => {
          allAlerts.push({
            id: `${rep.content_hash || idx}-alert-${idx}`,
            date: atDate,
            ...alert,
          });
        });
      }

      // Extract reminders (only seed if not already present in manually modified state)
      if (summary.reminders && Array.isArray(summary.reminders)) {
        summary.reminders.forEach((rem, idx) => {
          allReminders.push({
            id: `${rep.content_hash || idx}-rem-${idx}`,
            text: rem.text,
            days: rem.days_suggested || 30,
            reason: rem.reason || "",
            status: "pending", // pending, completed, missed
            date: atDate,
          });
        });
      }
    });

    setAlerts(allAlerts);

    // Merge extracted reminders with manually adjusted ones
    const localReminders = JSON.parse(localStorage.getItem(`medisum_reminders_${userKey}`)) || [];
    const mergedReminders = [...localReminders];

    allReminders.forEach((r) => {
      if (!mergedReminders.some((mr) => mr.id === r.id)) {
        mergedReminders.push(r);
      }
    });

    setReminders(mergedReminders);
    localStorage.setItem(`medisum_reminders_${userKey}`, JSON.stringify(mergedReminders));
  };

  // Push notification helper
  const addNotification = useCallback((type, title, desc) => {
    const newNotif = {
      id: Math.random().toString(36).slice(2),
      type, // 'alert', 'reminder', 'summary', 'upload', 'email'
      title,
      desc,
      at: new Date().toISOString(),
      read: false,
    };
    setNotifications((prev) => {
      const updated = [newNotif, ...prev].slice(0, 50); // cap at 50
      localStorage.setItem(`medisum_notifications_${userKey}`, JSON.stringify(updated));
      return updated;
    });
  }, [userKey]);

  // Add newly processed report
  const addReport = useCallback((newReport) => {
    setReports((prev) => {
      const updated = [newReport, ...prev];
      localStorage.setItem(`medisum_reports_${userKey}`, JSON.stringify(updated));
      return updated;
    });

    const summary = newReport.summary || {};
    const reportId = newReport.content_hash || Math.random().toString(36).slice(2);
    const dateStr = newReport.created_at || new Date().toISOString();

    addNotification("upload", "Report Uploaded", "Successfully processed report file/image via OCR.");
    addNotification("summary", "Summary Generated", "AI successfully completed medical report analysis.");

    // Alerts
    if (summary.alerts && Array.isArray(summary.alerts)) {
      const newAlerts = summary.alerts.map((a, idx) => ({
        id: `${reportId}-alert-${idx}`,
        date: dateStr,
        ...a,
      }));
      setAlerts((prev) => [...newAlerts, ...prev]);

      // If critical alerts exist
      newAlerts.forEach((a) => {
        if (a.severity === "red") {
          addNotification("alert", "Critical Alert Generated", `${a.item} is critical: ${a.value}`);
          if (settings.emailNotifications) {
            // Mock dispatching email
            setTimeout(() => {
              addNotification("email", "Email Alert Dispatched", `Notification sent to ${settings.notificationEmail || auth?.user?.email}`);
              toast(`Critical Alert email sent to ${settings.notificationEmail || auth?.user?.email}`, "info");
            }, 1000);
          }
        } else {
          addNotification("info", "Warning Alert Generated", `${a.item} is high/low: ${a.value}`);
        }
      });
    }

    // Reminders
    if (summary.reminders && Array.isArray(summary.reminders)) {
      const newReminders = summary.reminders.map((r, idx) => ({
        id: `${reportId}-rem-${idx}`,
        text: r.text,
        days: r.days_suggested || 30,
        reason: r.reason || "",
        status: "pending",
        date: dateStr,
      }));
      setReminders((prev) => {
        const updated = [...newReminders, ...prev];
        localStorage.setItem(`medisum_reminders_${userKey}`, JSON.stringify(updated));
        return updated;
      });

      newReminders.forEach((r) => {
        addNotification("reminder", "Follow-up Reminder Set", r.text);
      });
    }
  }, [userKey, addNotification, settings, toast, auth]);

  // Edit Reminder
  const editReminder = useCallback((id, updatedText, updatedDays) => {
    setReminders((prev) => {
      const updated = prev.map((r) => (r.id === id ? { ...r, text: updatedText, days: Number(updatedDays) } : r));
      localStorage.setItem(`medisum_reminders_${userKey}`, JSON.stringify(updated));
      return updated;
    });
    toast("Reminder updated", "ok");
  }, [userKey, toast]);

  // Delete Reminder
  const deleteReminder = useCallback((id) => {
    setReminders((prev) => {
      const updated = prev.filter((r) => r.id !== id);
      localStorage.setItem(`medisum_reminders_${userKey}`, JSON.stringify(updated));
      return updated;
    });
    toast("Reminder deleted", "info");
  }, [userKey, toast]);

  // Toggle/Mark completed
  const markReminderCompleted = useCallback((id, currentStatus) => {
    const nextStatus = currentStatus === "completed" ? "pending" : "completed";
    setReminders((prev) => {
      const updated = prev.map((r) => (r.id === id ? { ...r, status: nextStatus } : r));
      localStorage.setItem(`medisum_reminders_${userKey}`, JSON.stringify(updated));
      return updated;
    });
    addNotification("reminder", nextStatus === "completed" ? "Reminder Completed" : "Reminder Re-opened", `Reminder was marked as ${nextStatus}.`);
    toast(nextStatus === "completed" ? "Reminder completed" : "Reminder re-opened", "ok");
  }, [userKey, toast, addNotification]);

  // Update Settings
  const updateSettings = useCallback((newSettings) => {
    setSettings(newSettings);
    localStorage.setItem(`medisum_settings_${userKey}`, JSON.stringify(newSettings));
    toast("Settings saved", "ok");
  }, [userKey, toast]);

  // Mark all notifications read
  const markAllNotificationsRead = useCallback(() => {
    setNotifications((prev) => {
      const updated = prev.map((n) => ({ ...n, read: true }));
      localStorage.setItem(`medisum_notifications_${userKey}`, JSON.stringify(updated));
      return updated;
    });
  }, [userKey]);

  return (
    <HealthContext.Provider
      value={{
        reports,
        reminders,
        alerts,
        notifications,
        settings,
        loading,
        addReport,
        editReminder,
        deleteReminder,
        markReminderCompleted,
        updateSettings,
        addNotification,
        markAllNotificationsRead,
      }}
    >
      {children}
    </HealthContext.Provider>
  );
}

export const useHealth = () => useContext(HealthContext);
