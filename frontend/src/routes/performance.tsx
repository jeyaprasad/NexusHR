import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { apiFetch, getUser } from "../lib/auth";
import { Layout } from "../components/Layout";
import { Star, Target, MessageSquareCode, Award, Plus, CheckCircle, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/performance")({
  head: () => ({ meta: [{ title: "Performance — NexusHR" }] }),
  beforeLoad: () => {
    if (typeof window !== "undefined" && !localStorage.getItem("nexushr_token") && !localStorage.getItem("insiihr_token")) {
      throw redirect({ to: "/login" });
    }
  },
  component: PerformancePage,
});

type Review = {
  id: number;
  employeeId: number;
  employeeName: string;
  reviewerName: string;
  reviewDate: string;
  rating: number;
  feedback: string;
  goals: string;
  status: string;
  sentiment: string;
};

type Goal = {
  id: number;
  employeeId: number;
  employeeName: string;
  title: string;
  description: string;
  targetValue: number;
  currentValue: number;
  category: string;
  startDate: string;
  targetDate: string;
  status: string;
  progress: number;
};

type FeedbackRequest = {
  id: number;
  employeeId: number;
  employeeName: string;
  reviewerId: number;
  reviewerName: string;
  period: string;
  dueDate: string;
  status: string;
  relationship: string;
};

const SENTIMENT_COLORS: Record<string, string> = {
  POSITIVE: "text-green-600",
  NEGATIVE: "text-destructive",
  NEUTRAL: "text-muted-foreground",
};

const STATUS_COLORS: Record<string, string> = {
  DRAFT: "text-muted-foreground bg-muted border-border",
  SUBMITTED: "text-blue-600 bg-blue-50 border-blue-200",
  ACKNOWLEDGED: "text-yellow-600 bg-yellow-50 border-yellow-200",
  COMPLETED: "text-green-600 bg-green-50 border-green-200",
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`w-4 h-4 ${
            s <= rating ? "fill-primary text-primary" : "fill-transparent text-border"
          }`}
        />
      ))}
    </div>
  );
}

function PerformancePage() {
  const [activeTab, setActiveTab] = useState<"reviews" | "goals" | "feedback">("reviews");
  const [reviews, setReviews] = useState<Review[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [feedbackList, setFeedbackList] = useState<FeedbackRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Load reviews
  useEffect(() => {
    apiFetch("/api/performance?page=0&size=50")
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => setReviews(Array.isArray(d) ? d : (d.content ?? [])))
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  }, []);

  // Load feedback requests
  useEffect(() => {
    if (activeTab === "feedback") {
      apiFetch("/api/feedback")
        .then((r) => (r.ok ? r.json() : []))
        .then((d) => setFeedbackList(Array.isArray(d) ? d : []))
        .catch(() => setFeedbackList([]));
    }
  }, [activeTab]);

  async function handleExport() {
    const res = await apiFetch("/api/export/performance");
    if (res.ok) {
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "performance.csv";
      a.click();
      window.URL.revokeObjectURL(url);
    }
  }

  async function handleCompleteFeedback(id: number) {
    const res = await apiFetch(`/api/feedback/${id}/complete`, { method: "PATCH" });
    if (res.ok) {
      setFeedbackList((prev) =>
        prev.map((f) => (f.id === id ? { ...f, status: "COMPLETED" } : f))
      );
    }
  }

  return (
    <Layout>
      <main className="flex-1 px-8 py-8 max-w-7xl">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <div className="font-mono text-[10px] text-primary tracking-[0.25em] uppercase mb-1">
              F-04 · Talent & Excellence
            </div>
            <h1 className="font-display text-3xl font-extrabold tracking-tight">Performance</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Continuous feedback loops, OKR tracking, and AI sentiment analysis.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleExport}
              className="px-4 py-2 text-sm font-semibold border border-border rounded-md hover:bg-secondary transition-colors cursor-pointer"
            >
              Export CSV
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 bg-secondary p-1 rounded-lg w-fit mb-6">
          <button
            onClick={() => setActiveTab("reviews")}
            className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${
              activeTab === "reviews"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            360° Reviews
          </button>
          <button
            onClick={() => setActiveTab("goals")}
            className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${
              activeTab === "goals"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Goals & OKRs
          </button>
          <button
            onClick={() => setActiveTab("feedback")}
            className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${
              activeTab === "feedback"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Feedback Requests
          </button>
        </div>

        {/* Reviews Tab */}
        {activeTab === "reviews" && (
          loading ? (
            <div className="text-sm text-muted-foreground animate-pulse">Loading reviews…</div>
          ) : (
            <div className="space-y-4">
              {reviews.length === 0 && (
                <div className="border border-border rounded-md p-8 text-center text-muted-foreground">
                  No performance reviews found.
                </div>
              )}
              {reviews.map((r) => (
                <div
                  key={r.id}
                  className="border border-border rounded-md p-5 bg-card hover:bg-card/80 transition-colors shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <div className="font-semibold text-foreground">{r.employeeName}</div>
                      <div className="text-xs text-muted-foreground">
                        Reviewed by {r.reviewerName} · {r.reviewDate}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {r.sentiment && (
                        <span
                          className={`font-mono text-[10px] font-bold uppercase ${SENTIMENT_COLORS[r.sentiment] ?? ""}`}
                        >
                          {r.sentiment}
                        </span>
                      )}
                      <span
                        className={`font-mono text-[10px] px-2 py-0.5 rounded-md border uppercase font-bold ${STATUS_COLORS[r.status] ?? ""}`}
                      >
                        {r.status}
                      </span>
                    </div>
                  </div>
                  <StarRating rating={r.rating} />
                  {r.feedback && (
                    <p className="mt-3 text-sm text-muted-foreground leading-relaxed line-clamp-3">
                      {r.feedback}
                    </p>
                  )}
                  {r.goals && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      <span className="font-semibold text-foreground">Goals: </span>
                      {r.goals}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )
        )}

        {/* Goals & OKRs Tab */}
        {activeTab === "goals" && (
          <div className="space-y-6">
            <div className="border border-border rounded-xl p-6 bg-card shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  <h2 className="text-base font-semibold">Active Corporate & Individual Goals</h2>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-6">
                Track organizational Objectives and Key Results (OKRs) aligned across departments and individual contributors.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-border/80 rounded-lg p-4 bg-secondary/20">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-semibold text-sm">Scale RAG Engine to 99.9% Uptime</span>
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 font-bold">In Progress</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">Optimize pgvector indexing and cache high-frequency policy prompts.</p>
                  <div className="w-full bg-secondary rounded-full h-2 overflow-hidden mb-1">
                    <div className="bg-primary h-2 rounded-full" style={{ width: "85%" }}></div>
                  </div>
                  <div className="flex justify-between text-[11px] text-muted-foreground font-mono">
                    <span>Progress: 85%</span>
                    <span>Target: Q3 2026</span>
                  </div>
                </div>

                <div className="border border-border/80 rounded-lg p-4 bg-secondary/20">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-semibold text-sm">Automate Monthly Statutory Payroll</span>
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 font-bold">Achieved</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">Implement multi-tier tax brackets and OpenPDF direct payslip delivery.</p>
                  <div className="w-full bg-secondary rounded-full h-2 overflow-hidden mb-1">
                    <div className="bg-emerald-500 h-2 rounded-full" style={{ width: "100%" }}></div>
                  </div>
                  <div className="flex justify-between text-[11px] text-muted-foreground font-mono">
                    <span>Progress: 100%</span>
                    <span>Completed</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 360 Feedback Tab */}
        {activeTab === "feedback" && (
          <div className="space-y-4">
            <div className="border border-border rounded-xl p-6 bg-card shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquareCode className="w-5 h-5 text-primary" />
                <h2 className="text-base font-semibold">360° Peer & Manager Feedback</h2>
              </div>
              <p className="text-sm text-muted-foreground mb-6">
                Continuous anonymous and structured feedback collected between colleagues, supervisors, and cross-functional teams.
              </p>

              {feedbackList.length === 0 ? (
                <div className="border border-dashed border-border rounded-lg p-8 text-center text-sm text-muted-foreground">
                  No pending feedback requests at this time. All evaluation cycles are up to date.
                </div>
              ) : (
                <div className="space-y-3">
                  {feedbackList.map((item) => (
                    <div key={item.id} className="border border-border rounded-lg p-4 flex items-center justify-between">
                      <div>
                        <div className="text-sm font-semibold">{item.employeeName}</div>
                        <div className="text-xs text-muted-foreground">
                          Reviewer: {item.reviewerName} · Period: {item.period} · Relationship: {item.relationship}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded font-bold ${
                          item.status === "COMPLETED" ? "bg-green-500/10 text-green-600" : "bg-amber-500/10 text-amber-600"
                        }`}>
                          {item.status}
                        </span>
                        {item.status !== "COMPLETED" && (
                          <button
                            onClick={() => handleCompleteFeedback(item.id)}
                            className="px-3 py-1 text-xs bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
                          >
                            Mark Complete
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </Layout>
  );
}
