import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { apiFetch } from "../lib/auth";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — InsiiHR" },
      { name: "description", content: "InsiiHR Admin Dashboard with real-time HR metrics" },
    ],
  }),
  beforeLoad: () => {
    if (typeof window !== "undefined" && !localStorage.getItem("insiihr_token")) {
      throw redirect({ to: "/login" });
    }
  },
  component: DashboardPage,
});

type Stats = {
  totalEmployees: number;
  activeEmployees: number;
  presentToday: number;
  absentToday: number;
};

import { Sidebar, NAV_ITEMS } from "../components/Sidebar";

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="border border-border rounded-lg p-6 bg-card shadow-sm hover:shadow-md transition-shadow">
      <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-3">
        {label}
      </div>
      <div className="text-4xl font-display font-bold tracking-tighter text-foreground">{value}</div>
      {sub && <div className="text-xs text-muted-foreground mt-2 font-medium">{sub}</div>}
    </div>
  );
}

function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch("/api/dashboard/stats")
      .then((r) => r.json())
      .then(setStats)
      .catch(() => setError("Failed to load dashboard metrics"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 px-8 py-8 max-w-5xl">
        <div className="mb-8">
          <div className="font-mono text-[10px] text-primary tracking-[0.25em] uppercase mb-1">
            Overview
          </div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight">
            Workforce Dashboard
          </h1>
        </div>

        {loading && (
          <div className="text-sm text-muted-foreground animate-pulse">Loading metrics…</div>
        )}
        {error && <div className="text-sm text-destructive">{error}</div>}

        {stats && (
          <div className="space-y-6 mb-10">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard label="Total Employees" value={stats.totalEmployees} />
              <StatCard label="Active" value={stats.activeEmployees} sub="Currently employed" />
              <StatCard label="Present Today" value={stats.presentToday} sub="Clock-ins recorded" />
              <StatCard label="Absent Today" value={stats.absentToday} sub="No check-in" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-slide-up">
              <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
                <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-6">Workforce Distribution</div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: "Active", value: stats.activeEmployees },
                          { name: "Inactive", value: stats.totalEmployees - stats.activeEmployees },
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        <Cell fill="var(--color-primary)" />
                        <Cell fill="var(--color-muted-foreground)" />
                      </Pie>
                      <Tooltip 
                        contentStyle={{ borderRadius: '8px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-card)', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        itemStyle={{ color: 'var(--color-foreground)', fontSize: '14px', fontWeight: 500 }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
                <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-6">Today's Attendance</div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: "Present", value: stats.presentToday },
                          { name: "Absent", value: stats.absentToday },
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        <Cell fill="var(--color-signal-ok)" />
                        <Cell fill="var(--color-signal-risk)" />
                      </Pie>
                      <Tooltip 
                        contentStyle={{ borderRadius: '8px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-card)', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        itemStyle={{ color: 'var(--color-foreground)', fontSize: '14px', fontWeight: 500 }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}


      </main>
    </div>
  );
}
