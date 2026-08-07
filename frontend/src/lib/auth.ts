/**
 * Shared auth utilities for InsiiHR frontend.
 * Centralises token management, API calls with auth headers,
 * and redirect-to-login guard used by protected routes.
 */

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("insiihr_token");
}

export function getUser(): { email: string; fullName: string; role: string } | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("insiihr_user");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function logout() {
  if (typeof window === "undefined") return;
  const token = getToken();
  if (token) {
    // Fire-and-forget blacklist request
    fetch("/api/auth/logout", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => {});
  }
  localStorage.removeItem("insiihr_token");
  localStorage.removeItem("insiihr_refresh");
  localStorage.removeItem("insiihr_user");
  window.location.href = "/login";
}

export async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const token = getToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };
  const hasContentType = Object.keys(headers).some(k => k.toLowerCase() === "content-type");
  if (!hasContentType) {
    headers["Content-Type"] = "application/json";
  }
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  const baseURL = import.meta.env.VITE_API_URL || "";
  const res = await fetch(`${baseURL}${path}`, { ...options, headers });
  if (res.status === 401) {
    logout();
  }
  return res;
}

/** Redirect guard — call inside beforeLoad for protected routes */
export function requireAuth() {
  if (typeof window !== "undefined" && !getToken()) {
    throw new Error("REDIRECT_LOGIN");
  }
}
