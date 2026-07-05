import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./auth.jsx";
import { ThemeProvider } from "./theme.jsx";
import { ToastProvider } from "./ui.jsx";
import { HealthProvider } from "./context/HealthContext.jsx";
import CommandPalette from "./CommandPalette.jsx";
import AIChatbot from "./AIChatbot.jsx";
import Landing from "./pages/Landing.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Upload from "./pages/Upload.jsx";
import Reports from "./pages/Reports.jsx";
import History from "./pages/History.jsx";
import Automation from "./pages/Automation.jsx";
import Alerts from "./pages/Alerts.jsx";
import Reminders from "./pages/Reminders.jsx";
import Settings from "./pages/Settings.jsx";
import Trends from "./pages/Trends.jsx";
import Profile from "./pages/Profile.jsx";
import CompareReports from "./pages/CompareReports.jsx";
import { AdminDashboard, AdminUsers } from "./pages/Admin.jsx";
import NotFound from "./pages/NotFound.jsx";

function Protected({ children, role }) {
  const { auth } = useAuth();
  if (!auth) return <Navigate to="/login" replace />;
  if (role === "admin" && auth.user.role !== "admin") return <Navigate to="/app" replace />;
  return children;
}

// Command palette only shows for authenticated users
function PaletteGate() {
  const { auth } = useAuth();
  const loc = useLocation();
  const onAuthPage = ["/login", "/register"].includes(loc.pathname);
  if (!auth || onAuthPage) return null;
  return <CommandPalette />;
}

// Global Chatbot gate
function ChatbotGate() {
  const { auth } = useAuth();
  const loc = useLocation();
  const onAuthPage = ["/login", "/register", "/"].includes(loc.pathname);
  if (!auth || onAuthPage) return null;
  return <AIChatbot />;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <HealthProvider>
            <BrowserRouter>
              <PaletteGate />
              <ChatbotGate />
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/app" element={<Protected><Dashboard /></Protected>} />
                <Route path="/app/upload" element={<Protected><Upload /></Protected>} />
                <Route path="/app/reports" element={<Protected><Reports /></Protected>} />
                <Route path="/app/history" element={<Protected><History /></Protected>} />
                <Route path="/app/automation" element={<Protected><Automation /></Protected>} />
                <Route path="/app/alerts" element={<Protected><Alerts /></Protected>} />
                <Route path="/app/reminders" element={<Protected><Reminders /></Protected>} />
                <Route path="/app/settings" element={<Protected><Settings /></Protected>} />
                <Route path="/app/trends" element={<Protected><Trends /></Protected>} />
                <Route path="/app/profile" element={<Protected><Profile /></Protected>} />
                <Route path="/app/compare" element={<Protected><CompareReports /></Protected>} />
                <Route path="/admin" element={<Protected role="admin"><AdminDashboard /></Protected>} />
                <Route path="/admin/users" element={<Protected role="admin"><AdminUsers /></Protected>} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </HealthProvider>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
