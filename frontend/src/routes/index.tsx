import { createFileRoute } from "@tanstack/react-router";
import { Users, UserCheck, Calendar, Clock, LayoutDashboard, Sparkles, ShieldCheck, Database, Server } from "lucide-react";

type Feature = { n: string; title: string; desc: string; icon: any; featured?: boolean };

const FEATURES: Feature[] = [
  {
    n: "01",
    title: "Employee Lifecycle",
    desc: "Onboarding to offboarding automation with complete historical audit trails.",
    icon: Users,
  },
  {
    n: "02",
    title: "Attendance & Leave",
    desc: "Real-time time tracking with geo-fencing and automated policy enforcement.",
    icon: Calendar,
  },
  {
    n: "03",
    title: "Payroll Engine",
    desc: "Statutory compliance, tax computations, and direct bank transfers in one click.",
    icon: Database,
  },
  {
    n: "04",
    title: "Performance",
    desc: "360-degree reviews, OKR tracking, and continuous feedback loops.",
    icon: LayoutDashboard,
  },
  {
    n: "05",
    title: "AI Attrition",
    desc: "Predictive modeling that identifies flight risks before they become vacancies.",
    icon: Sparkles,
    featured: true,
  },
  {
    n: "06",
    title: "Workforce Intel",
    desc: "Role-based analytics with drill-down reports and executive snapshots.",
    icon: UserCheck,
  },
  {
    n: "07",
    title: "Notifications",
    desc: "Event-driven pub/sub system for critical HR alerts and observability.",
    icon: Clock,
  },
  {
    n: "08",
    title: "RBAC Control",
    desc: "Granular row-level security with field permissions and full audit trails.",
    icon: ShieldCheck,
  },
];

const INFRA = [
  "JWT Authentication with Refresh Rotation",
  "OWASP Hardened (XSS, CSRF, SQLi)",
  "GitHub Actions CI/CD with Security Scans",
  "Redis Caching & Rate-Limiting",
  "PostgreSQL Encrypted at Rest",
  "Multi-Stage Hardened Docker Images",
];

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NexusHR — Enterprise HR, Intelligence-First" },
      {
        name: "description",
        content:
          "Manage the complete employee lifecycle on a unified, AI-enabled, production-grade HR platform built on Java 21 and Spring AI.",
      },
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/10 selection:text-primary">
      {/* Navigation (Dark HR-Flow Sidebar Theme) */}
      <nav className="sticky top-0 z-50 shadow-sm" style={{ backgroundColor: '#1A1A2E' }}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-10">
            <a href="/" className="font-display text-xl font-extrabold tracking-tighter text-white">
              NEXUS<span className="text-primary">HR</span>
            </a>
            <div className="hidden md:flex gap-7 text-sm font-medium text-white/70">
              <a href="#platform" className="hover:text-white transition-colors">Platform</a>
              <a href="#infrastructure" className="hover:text-white transition-colors">Infrastructure</a>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <a href="/login" className="text-sm font-medium text-white/80 hover:text-white transition-colors">
              Sign In
            </a>
            <a href="/login" className="text-sm font-semibold bg-primary text-white px-5 py-2 rounded-md shadow-md hover:bg-primary/90 transition-all">
              Get Started
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative py-20 overflow-hidden bg-secondary/30 border-b border-border">
        <div className="w-full max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Hero Copy */}
          <div className="animate-slide-up">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 mb-8 border border-primary/20">
              <span className="font-mono text-[10px] font-bold tracking-widest text-primary uppercase">
                Enterprise HR Management
              </span>
            </div>
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6 text-foreground">
              Intelligent HR for <br /> modern teams.
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed mb-10 max-w-md">
              The unified architecture for the modern employee lifecycle. Track attendance, payroll, and performance all in one place.
            </p>
            <div className="flex gap-4">
              <a href="/login" className="text-base font-semibold bg-primary text-white px-8 py-3.5 rounded-md shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all">
                Access Dashboard
              </a>
              <a href="#platform" className="text-base font-semibold bg-card text-foreground border border-border px-8 py-3.5 rounded-md shadow-sm hover:bg-secondary transition-all">
                Learn More
              </a>
            </div>
          </div>

          {/* Hero Mock UI (HR-Flow Dashboard Vibe) */}
          <div className="relative animate-slide-up [animation-delay:200ms] hidden lg:block">
            {/* Background container mimicking the app shell */}
            <div className="bg-card border border-border rounded-xl shadow-2xl p-6 relative z-10 w-full max-w-lg ml-auto overflow-hidden">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-display font-bold text-lg">Workforce Overview</h3>
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-border"></div>
                  <div className="w-2 h-2 rounded-full bg-border"></div>
                  <div className="w-2 h-2 rounded-full bg-border"></div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                {/* Mock KPI 1 */}
                <div className="border border-border rounded-lg p-4 bg-background">
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3">
                    <Users className="w-5 h-5" />
                  </div>
                  <div className="text-xs text-muted-foreground font-medium mb-1">Total Employees</div>
                  <div className="text-2xl font-bold font-display">735</div>
                </div>
                {/* Mock KPI 2 */}
                <div className="border border-border rounded-lg p-4 bg-background">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div className="text-xs text-muted-foreground font-medium mb-1">Today's Attendance</div>
                  <div className="text-2xl font-bold font-display">97%</div>
                </div>
              </div>

              {/* Mock Task List */}
              <div className="space-y-3">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Recent Tasks</div>
                <div className="flex items-center gap-3 p-3 rounded-md border border-border border-l-4 bg-background" style={{ borderLeftColor: '#2563eb' }}>
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <div className="text-sm font-medium flex-1">UI Design Candidate Screening</div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-md border border-border border-l-4 bg-background" style={{ borderLeftColor: '#10b981' }}>
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <div className="text-sm font-medium flex-1">Interview with Developers</div>
                </div>
              </div>
            </div>

            {/* Decorative elements behind */}
            <div className="absolute -top-10 -right-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl -z-10"></div>
            <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -z-10"></div>
          </div>
        </div>
      </header>

      {/* Feature Grid */}
      <section id="platform" className="py-24 max-w-7xl mx-auto px-6">
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <h2 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight mb-4">
            Everything HR. Nothing redundant.
          </h2>
          <p className="text-muted-foreground text-lg">
            A comprehensive suite of tools designed with a clean, flat aesthetic to help you manage your organization efficiently.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map((f, i) => {
            const colors = ['text-blue-600 bg-blue-100 dark:bg-blue-900/30', 'text-purple-600 bg-purple-100 dark:bg-purple-900/30', 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30', 'text-orange-600 bg-orange-100 dark:bg-orange-900/30'];
            const colorClass = colors[i % colors.length];
            return (
              <div key={f.n} className="bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-lg transition-shadow">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-6 ${colorClass}`}>
                  <f.icon className="w-6 h-6" />
                </div>
                <h3 className="font-display text-lg font-bold mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Infrastructure Section */}
      <section id="infrastructure" className="bg-secondary/30 py-24 border-y border-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight mb-4">
              Secure by design.
            </h2>
            <p className="text-lg text-muted-foreground">
              Hardened from the database to the edge with zero-trust architecture.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-6">
            {INFRA.map((item) => (
              <div key={item} className="flex items-center gap-3 bg-card border border-border p-4 rounded-lg shadow-sm">
                <ShieldCheck className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA (Dark Theme) */}
      <section className="py-24 text-center px-6" style={{ backgroundColor: '#1A1A2E', color: 'white' }}>
        <div className="max-w-2xl mx-auto">
          <h2 className="font-display text-4xl md:text-5xl font-extrabold mb-8 tracking-tight">
            Ready to upgrade your workflow?
          </h2>
          <a href="/login" className="inline-block px-8 py-4 bg-primary text-white font-bold rounded-md shadow-xl hover:bg-primary/90 hover:-translate-y-0.5 transition-all">
            Get Started Now
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 border-t" style={{ backgroundColor: '#1A1A2E', borderColor: '#2A2A40', color: 'white' }}>
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <span className="font-display font-extrabold tracking-tighter">
            NEXUS<span className="text-primary">HR</span>
          </span>
          <div className="font-mono text-xs text-white/50 uppercase tracking-widest">
            © 2026 NexusHR Platform
          </div>
        </div>
      </footer>
    </div>
  );
}
