import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { apiFetch } from "../lib/auth";
import { Layout } from "../components/Layout";

export const Route = createFileRoute("/ai-insights")({
  head: () => ({ meta: [{ title: "AI Insights — NexusHR" }] }),
  beforeLoad: () => {
    if (typeof window !== "undefined" && !localStorage.getItem("nexushr_token") && !localStorage.getItem("insiihr_token")) {
      throw redirect({ to: "/login" });
    }
  },
  component: AiInsightsPage,
});

import { TriangleAlert, BookOpen, Lightbulb } from "lucide-react";

type InsightType = "attrition" | "skill-gap" | "engagement";

type FormField = {
  key: string;
  label: string;
  type: "text" | "number";
  example: string;
  required?: boolean;
};

const INSIGHT_CONFIG: Record<
  InsightType,
  { label: string; icon: React.ReactNode; endpoint: string; responseKey: string; fields: FormField[] }
> = {
  attrition: {
    label: "Attrition Prediction",
    icon: <TriangleAlert className="size-4" />,
    endpoint: "/api/ai/attrition",
    responseKey: "prediction",
    fields: [
      { key: "employee", label: "Employee", type: "text", example: "Anitha Murugesan", required: true },
      { key: "role", label: "Role", type: "text", example: "Lead Engineer", required: true },
      { key: "tenure", label: "Tenure (years)", type: "number", example: "4.2" },
      { key: "lastReviewRating", label: "Last Review Rating (/5)", type: "number", example: "2.8" },
      { key: "leaveDaysUsed", label: "Leave Days Used", type: "text", example: "28/30" },
      { key: "recentAbsences", label: "Recent Absences", type: "number", example: "6" },
      { key: "salaryChangeLastYear", label: "Salary Change Last Year (%)", type: "number", example: "0" },
    ]
  },
  "skill-gap": {
    label: "Skill Gap Analysis",
    icon: <BookOpen className="size-4" />,
    endpoint: "/api/ai/skill-gap",
    responseKey: "analysis",
    fields: [
      { key: "employee", label: "Employee", type: "text", example: "John Smith", required: true },
      { key: "currentRole", label: "Current Role", type: "text", example: "Backend Developer", required: true },
      { key: "targetRole", label: "Target Role", type: "text", example: "Senior Backend Developer", required: true },
      { key: "currentSkills", label: "Current Skills", type: "text", example: "Java, Spring Boot, REST APIs" },
      { key: "yearsExperience", label: "Years Experience", type: "number", example: "3" },
      { key: "lastTraining", label: "Last Training", type: "text", example: "18 months ago" },
    ]
  },
  engagement: {
    label: "Engagement Scoring",
    icon: <Lightbulb className="size-4" />,
    endpoint: "/api/ai/engagement",
    responseKey: "score",
    fields: [
      { key: "employee", label: "Employee", type: "text", example: "Alice Chen", required: true },
      { key: "attendanceRate", label: "Attendance Rate (%)", type: "text", example: "94%" },
      { key: "avgPerformanceRating", label: "Avg Performance Rating", type: "text", example: "4.1/5" },
      { key: "leaveUtilisation", label: "Leave Utilisation", type: "text", example: "12/30 days" },
      { key: "tenure", label: "Tenure (years)", type: "text", example: "2.5 years" },
      { key: "feedbackSentiment", label: "Feedback Sentiment", type: "text", example: "Positive" },
      { key: "team", label: "Team", type: "text", example: "Product Engineering", required: true },
    ]
  },
};

function AiInsightsPage() {
  const [activeTab, setActiveTab] = useState<InsightType>("attrition");
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [workforceStats, setWorkforceStats] = useState<{
    totalEmployees: number;
    avgAttritionRisk: number;
    avgEngagement: number;
    highRiskCount: number;
    departmentBreakdown: { department: string; count: number }[];
  } | null>(null);

  const config = INSIGHT_CONFIG[activeTab];

  useEffect(() => {
    apiFetch("/api/ai/workforce")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && !data.error) setWorkforceStats(data);
      })
      .catch(() => {});
  }, []);

  // Reset form when changing tabs
  useEffect(() => {
    setFormData({});
    setResult("");
    setError("");
  }, [activeTab]);

  async function runInsight() {
    // Validation
    const missingRequired = config.fields.filter(f => f.required && !formData[f.key]);
    if (missingRequired.length > 0) {
      setError(`Please fill in required fields: ${missingRequired.map(f => f.label.split(' (')[0]).join(", ")}`);
      return;
    }

    // Construct the payload string mapping the form fields to plain text
    const payloadString = config.fields
      .map(f => {
        const cleanLabel = f.label.replace(/\s*\(.*\)/, "");
        // Only include if value is present
        if (formData[f.key]) {
          // Special cases to append context if they just enter numbers
          let suffix = "";
          if (f.label.includes("(%)") && !formData[f.key].includes("%")) suffix = "%";
          if (f.label.includes("(years)") && !formData[f.key].includes("years")) suffix = " years";
          return `${cleanLabel}: ${formData[f.key]}${suffix}`;
        }
        return `${cleanLabel}: `;
      })
      .join("\n");

    setLoading(true);
    setResult("");
    setError("");
    try {
      const res = await apiFetch(config.endpoint, {
        method: "POST",
        body: JSON.stringify({ data: payloadString }),
      });
      if (!res.ok) throw new Error("AI request failed");
      const data = await res.json();
      setResult(data[config.responseKey] ?? JSON.stringify(data));
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "AI service unavailable";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }

  function loadExample() {
    const exampleData: Record<string, string> = {};
    config.fields.forEach(f => {
      exampleData[f.key] = f.example;
    });
    setFormData(exampleData);
    setResult("");
    setError("");
  }

  return (
    <Layout>
      <main className="flex-1 px-8 py-8 max-w-7xl">
        <div className="mb-6">
          <div className="font-mono text-[10px] text-primary tracking-[0.25em] uppercase mb-1">
            F-05 · Spring AI
          </div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight">
            AI Workforce Insights
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Powered by Groq LLM (OpenAI Compatible) — Attrition prediction, skill gap analysis, engagement
            scoring.
          </p>
        </div>

        {/* Workforce Overview Cards (from commit 64d6a36) */}
        {workforceStats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Headcount</div>
              <div className="text-2xl font-bold font-display mt-1">{workforceStats.totalEmployees}</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">Monitored in NexusHR</div>
            </div>
            <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Avg Attrition Risk</div>
              <div className="text-2xl font-bold font-display mt-1 text-amber-500">
                {Math.round((workforceStats.avgAttritionRisk || 0) * 100)}%
              </div>
              <div className="text-[11px] text-muted-foreground mt-0.5">Predictive algorithmic model</div>
            </div>
            <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Avg Engagement</div>
              <div className="text-2xl font-bold font-display mt-1 text-emerald-500">
                {Math.round((workforceStats.avgEngagement || 0) * 100)}%
              </div>
              <div className="text-[11px] text-muted-foreground mt-0.5">Attendance + review weighted</div>
            </div>
            <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">High Flight Risks</div>
              <div className="text-2xl font-bold font-display mt-1 text-rose-500">
                {workforceStats.highRiskCount}
              </div>
              <div className="text-[11px] text-muted-foreground mt-0.5">&gt;60% calculated probability</div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 bg-secondary rounded-full p-1 mb-6 w-fit shadow-inner">
          {(Object.entries(INSIGHT_CONFIG) as [InsightType, typeof config][]).map(([key, c]) => (
            <button
              key={key}
              id={`ai-tab-${key}`}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded-full transition-all ${
                activeTab === key
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:bg-primary/10 hover:text-foreground"
              }`}
            >
              <span>{c.icon}</span>
              {c.label}
            </button>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Input Form */}
          <div className="lg:col-span-1">
            <div className="flex items-center justify-between mb-4">
              <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Employee Data
              </div>
              <button
                id="ai-load-example"
                onClick={loadExample}
                className="text-xs text-primary font-medium hover:underline"
              >
                Load example →
              </button>
            </div>
            
            <div className="space-y-4 bg-card border border-border p-5 rounded-lg shadow-sm">
              {config.fields.map(f => (
                <div key={f.key} className="space-y-1.5">
                  <label htmlFor={f.key} className="block text-xs font-semibold text-foreground">
                    {f.label} {f.required && <span className="text-destructive">*</span>}
                  </label>
                  <input
                    id={f.key}
                    type={f.type}
                    value={formData[f.key] || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, [f.key]: e.target.value }))}
                    className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                    placeholder={`e.g. ${f.example}`}
                    step={f.type === "number" ? "any" : undefined}
                  />
                </div>
              ))}
              
              <button
                id="ai-run-btn"
                onClick={runInsight}
                disabled={loading}
                className="w-full mt-2 py-2.5 bg-primary text-primary-foreground text-sm font-bold rounded-md shadow-sm hover:shadow-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? "Analysing…" : `Run ${config.label}`}
              </button>
            </div>
          </div>

          {/* Output */}
          <div className="lg:col-span-2 overflow-hidden flex flex-col">
            <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-4">
              AI Response
            </div>
            <div
              id="ai-output"
              className="flex-1 min-h-[400px] border border-border rounded-lg p-6 bg-card text-sm text-foreground leading-relaxed overflow-auto shadow-sm"
            >
              {loading && (
                <div className="flex items-center gap-2 text-muted-foreground animate-pulse">
                  <div className="size-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  Generating insight with {config.label}...
                </div>
              )}
              {error && <span className="text-destructive font-medium bg-destructive/10 px-3 py-2 rounded-md">{error}</span>}
              {!loading && !error && result && (
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown
                    components={{
                      h1: ({node, ...props}) => <h1 className="text-xl font-bold mt-4 mb-2" {...props} />,
                      h2: ({node, ...props}) => <h2 className="text-lg font-bold mt-4 mb-2 border-b border-border pb-1" {...props} />,
                      h3: ({node, ...props}) => <h3 className="text-md font-bold mt-3 mb-2" {...props} />,
                      p: ({node, ...props}) => <p className="mb-3 leading-relaxed" {...props} />,
                      ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-3 space-y-1" {...props} />,
                      ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-3 space-y-1" {...props} />,
                      li: ({node, ...props}) => <li className="mb-1" {...props} />,
                      strong: ({node, ...props}) => <strong className="font-semibold text-foreground" {...props} />,
                      table: ({node, ...props}) => <div className="overflow-x-auto my-4"><table className="w-full text-left border-collapse border border-border" {...props} /></div>,
                      th: ({node, ...props}) => <th className="border-b border-r border-border p-2 font-semibold bg-secondary/50" {...props} />,
                      td: ({node, ...props}) => <td className="border-b border-r border-border p-2" {...props} />,
                    }}
                  >
                    {result}
                  </ReactMarkdown>
                </div>
              )}
              {!loading && !error && !result && (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-70">
                  <span className="mb-2">{config.icon}</span>
                  <span>Enter employee data and click Run to generate insight.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
}

