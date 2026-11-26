import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { Info, Copy, Check } from "lucide-react";
import { handleMockApiRequest } from "../lib/mockData";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign In — NexusHR" },
      { name: "description", content: "Sign in to NexusHR Enterprise HR Platform" },
    ],
  }),
  beforeLoad: () => {
    if (typeof window !== "undefined" && (localStorage.getItem("nexushr_token") || localStorage.getItem("insiihr_token"))) {
      throw redirect({ to: "/dashboard" });
    }
  },
  component: LoginPage,
});

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("EMPLOYEE");
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copiedRole, setCopiedRole] = useState<string | null>(null);
  const navigate = Route.useNavigate();

  const showDemoCreds = import.meta.env.VITE_SHOW_DEMO_CREDENTIALS !== "false";

  const handleCopyDemoCreds = (role: string, email: string, pass: string) => {
    navigator.clipboard.writeText(`Email: ${email}\nPassword: ${pass}`);
    setCopiedRole(role);
    setTimeout(() => setCopiedRole(null), 2000);
  };

  async function executeAuth(targetEmail: string, targetPass: string, isReg = false, regName = "", regRole = "EMPLOYEE") {
    setLoading(true);
    setError("");
    try {
      const trimmedEmail = (targetEmail || "").trim();
      const trimmedPass = (targetPass || "").trim();
      const endpoint = isReg ? "/api/auth/register" : "/api/auth/login";
      const payload = isReg
        ? { email: trimmedEmail, password: trimmedPass, fullName: regName.trim(), role: regRole }
        : { email: trimmedEmail, password: trimmedPass };

      let res: Response | null = null;
      try {
        res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } catch {
        // Live server offline or proxy network error -> fallback to mock handler
        res = handleMockApiRequest(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      // If backend returned 502/504 Bad Gateway from Vite proxy or server failure
      if (!res || (!res.ok && res.status >= 500)) {
        const mockRes = handleMockApiRequest(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (mockRes) {
          res = mockRes;
        }
      }

      if (!res || !res.ok) {
        const data = res ? await res.json().catch(() => ({})) : {};
        throw new Error(
          data.message || data.error || (isReg ? "Registration failed" : "Invalid credentials"),
        );
      }
      const data = await res.json();
      localStorage.setItem("nexushr_token", data.token);
      localStorage.setItem("nexushr_refresh", data.refreshToken);
      localStorage.setItem(
        "nexushr_user",
        JSON.stringify({ email: data.email, fullName: data.fullName, role: data.role }),
      );
      localStorage.setItem("insiihr_token", data.token);
      localStorage.setItem("insiihr_refresh", data.refreshToken);
      localStorage.setItem(
        "insiihr_user",
        JSON.stringify({ email: data.email, fullName: data.fullName, role: data.role }),
      );
      navigate({ to: "/dashboard" });
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : isReg ? "Registration failed" : "Login failed";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await executeAuth(email, password, isRegistering, fullName, role);
  }

  return (
    <div className="min-h-screen bg-secondary/30 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-card border border-border shadow-xl rounded-2xl p-8 lg:p-10">
        {/* Logo */}
        <div className="text-center mb-10">
          <a href="/" className="font-display text-2xl font-extrabold tracking-tighter">
            NEXUS<span className="text-primary">HR</span>
          </a>
          <p className="mt-2 text-sm text-muted-foreground">
            {isRegistering ? "Create your account" : "Sign in to your workspace"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" id="login-form">
          {error && (
            <div className="px-4 py-3 rounded-md bg-destructive/10 border border-destructive/20 text-sm text-destructive">
              {error}
            </div>
          )}

          {isRegistering && (
            <div className="space-y-1.5 animate-slide-up">
              <label
                htmlFor="fullName"
                className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground"
              >
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2.5 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all shadow-sm"
                placeholder="Arun Kumar"
              />
            </div>
          )}

          <div className="space-y-1.5">
            <label
              htmlFor="email"
              className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2.5 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all shadow-sm"
              placeholder="you@company.com"
            />
          </div>

          <div className="space-y-1.5 relative">
            <label
              htmlFor="password"
              className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground"
            >
              Password {isRegistering && "(min 8 chars)"}
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                minLength={isRegistering ? 8 : undefined}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2.5 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all shadow-sm pr-10"
                placeholder="••••••••"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 px-3 flex items-center text-muted-foreground hover:text-foreground bg-transparent border-none outline-none cursor-pointer"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                )}
              </button>
            </div>
          </div>

          {isRegistering && (
            <div className="space-y-1.5 animate-slide-up">
              <label
                htmlFor="role"
                className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground"
              >
                Role
              </label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3 py-2.5 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all shadow-sm text-foreground"
              >
                <option value="EMPLOYEE">EMPLOYEE</option>
                <option value="HR">HR</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </div>
          )}

          <button
            id="login-submit"
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-4 bg-primary text-primary-foreground text-sm font-semibold rounded-md shadow-md hover:shadow-lg hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            {loading
              ? isRegistering
                ? "Creating account…"
                : "Signing in…"
              : isRegistering
                ? "Register"
                : "Sign In"}
          </button>
        </form>

        {showDemoCreds && !isRegistering && (
          <div className="mt-8 p-4 rounded-r-lg border-l-4 border-l-primary bg-primary/[0.03] shadow-sm flex items-start gap-4 animate-in fade-in slide-in-from-bottom-2">
            <Info className="w-5 h-5 text-primary mt-0.5 shrink-0" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-foreground mb-3">
                Demo Credentials
              </h3>
              <div className="space-y-2">
                {[
                  { role: "ADMIN", email: "admin@nexushr.com", pass: "admin123" },
                  { role: "HR", email: "hr@nexushr.com", pass: "hr123" },
                  { role: "EMPLOYEE", email: "employee@nexushr.com", pass: "employee123" },
                ].map((cred) => (
                  <div
                    key={cred.role}
                    onClick={() => {
                      setEmail(cred.email);
                      setPassword(cred.pass);
                      setError("");
                    }}
                    className="flex items-center justify-between text-xs font-mono bg-background p-2 rounded border border-border/50 hover:border-primary/50 hover:bg-primary/5 cursor-pointer transition-colors group"
                    title="Click to fill credentials"
                  >
                    <div>
                      <div className="text-[10px] uppercase text-primary font-bold mb-0.5">
                        {cred.role}{" "}
                        <span className="text-[9px] font-normal text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                          (Click to select)
                        </span>
                      </div>
                      <div className="text-muted-foreground">
                        <span className="text-foreground">{cred.email}</span> / <span className="text-foreground">{cred.pass}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          executeAuth(cred.email, cred.pass);
                        }}
                        className="px-2 py-1 text-[10px] font-sans font-medium rounded bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-all cursor-pointer whitespace-nowrap shrink-0"
                        title={`1-Click Sign In as ${cred.role}`}
                      >
                        Sign in
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyDemoCreds(cred.role, cred.email, cred.pass);
                        }}
                        className="text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded hover:bg-secondary cursor-pointer"
                        title={`Copy ${cred.role} credentials`}
                      >
                        {copiedRole === cred.role ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-[11px] text-muted-foreground italic border-t border-border/50 pt-2">
                * For evaluation/demo purposes only
              </p>
            </div>
          </div>
        )}

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsRegistering(!isRegistering);
              setError("");
            }}
            className="text-xs text-primary hover:underline cursor-pointer bg-transparent border-none outline-none"
          >
            {isRegistering ? "Already have an account? Sign In" : "Don't have an account? Register"}
          </button>
        </div>

        <p className="mt-8 text-center font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
          © 2026 NexusHR Enterprise
        </p>
      </div>
    </div>
  );
}
