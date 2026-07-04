import { createContext, useContext, useState, useCallback } from "react";

const KEY = "medisum_auth";
const AuthCtx = createContext(null);

// Use VITE_API_URL env var in production; fall back to "" (relative URL) which
// works when FastAPI serves the built frontend from /app/static.
const API_BASE = import.meta.env.VITE_API_URL ?? "";

function load() {
  try {
    return JSON.parse(sessionStorage.getItem(KEY)) || null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(load);

  const save = useCallback((data) => {
    sessionStorage.setItem(KEY, JSON.stringify(data));
    setAuth(data);
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem(KEY);
    setAuth(null);
  }, []);

  return (
    <AuthCtx.Provider value={{ auth, save, logout }}>
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth() {
  return useContext(AuthCtx);
}

// API helper — attaches bearer token, returns parsed JSON or throws.
export async function api(path, { method = "GET", body, token } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const url = `${API_BASE}/api${path}`;

  let res;
  try {
    res = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (networkErr) {
    throw new Error("Network error — please check your connection and try again.");
  }

  let data = null;
  try {
    data = await res.json();
  } catch {
    /* no body */
  }
  if (!res.ok) {
    const msg = (data && (data.detail || data.message)) || `Request failed (${res.status})`;
    throw new Error(typeof msg === "string" ? msg : "Request failed");
  }
  return data;
}
