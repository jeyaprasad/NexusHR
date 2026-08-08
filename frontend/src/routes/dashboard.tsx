import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { apiFetch } from "../lib/auth";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  BarChart, Bar
} from "recharts";
import { Users, UserCheck, Calendar, Clock, IndianRupee, TrendingUp, Activity } from "lucide-react";
import { Sidebar } from "../components/Sidebar";

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
  pendingLeaveRequests: number;
  onLeaveToday: number;
  averageSalary: number;
  averagePerformanceRating: number;
  headcountHistory: { date: string; active: number; onLeave: number }[];
  departmentDistribution: { department: string; count: number }[];
  leaveTypeBreakdown: { month: string; type: string; count: number }[];
  recentActivity: {
    id: number;
    action: string;
    entityType: string;
    entityId: number;
    performedBy: string;
    timestamp: string;
  }[];
};

function StatCard({ label, value, icon: Icon, sub }: { label: string; value: string | number; icon: any; sub?: string }) {
  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
      <div className="absolute top-4 right-4 text-muted-foreground/30 group-hover:text-primary/20 transition-colors">
        <Icon className="w-8 h-8" />
      </div>
      <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-3 pr-8">
        {label}
      </div>
      <div className="text-3xl font-display font-bold tracking-tighter text-foreground">{value}</div>
      {sub && <div className="text-xs text-muted-foreground mt-2 font-medium">{sub}</div>}
    </div>
  );
}

const COLORS = ['#6366f1', '#14b8a6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#3b82f6'];

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

  const formattedLeaveData = (() => {
    if (!stats?.leaveTypeBreakdown) return [];
    const map = new Map<string, any>();
    stats.leaveTypeBreakdown.forEach(({ month, type, count }) => {
      if (!map.has(month)) map.set(month, { month });
      map.get(month)[type] = count;
    });
    return Array.from(map.values()).sort((a, b) => a.month.localeCompare(b.month));
  })();

  const leaveTypes = Array.from(new Set(stats?.leaveTypeBreakdown?.map(l => l.type) || []));

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 px-4 md:px-8 py-8 max-w-[1200px] mx-auto w-full">
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
          <div className="space-y-6 mb-10 animate-slide-up">
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              <StatCard label="Total Employees" value={stats.totalEmployees} icon={Users} />
              <StatCard label="Active Staff" value={stats.activeEmployees} icon={UserCheck} />
              <StatCard label="On Leave Today" value={stats.onLeaveToday} icon={Calendar} />
              <StatCard label="Pending Leaves" value={stats.pendingLeaveRequests} icon={Clock} />
              <StatCard 
                label="Average Salary" 
                value={`₹${stats.averageSalary.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} 
                icon={IndianRupee} 
              />
              <StatCard 
                label="Avg Performance" 
                value={stats.averagePerformanceRating.toFixed(1)} 
                icon={TrendingUp} 
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-card border border-border rounded-lg p-6 shadow-sm">
                <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-6">Weekly Active Headcount (Last 14 Days)</div>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stats.headcountHistory}>
                      <defs>
                        <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        stroke="var(--color-muted-foreground)" 
                        fontSize={12} 
                        tickLine={false} 
                        axisLine={false} 
                        minTickGap={20}
                      />
                      <YAxis stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '8px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-card)', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        labelFormatter={(val) => new Date(val).toLocaleDateString()}
                      />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', marginTop: '10px' }} />
                      <Area type="monotone" dataKey="active" name="Active Staff" stroke="var(--color-primary)" fillOpacity={1} fill="url(#colorActive)" strokeWidth={2} />
                      <Area type="monotone" dataKey="onLeave" name="On Leave" stroke="var(--color-signal-risk)" fill="none" strokeWidth={2} strokeDasharray="4 4" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
                <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-6">Department Distribution</div>
                <div className="h-72 flex flex-col justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats.departmentDistribution}
                        cx="50%"
                        cy="45%"
                        innerRadius={55}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="count"
                        nameKey="department"
                      >
                        {stats.departmentDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ borderRadius: '8px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-card)', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      />
                      <Legend 
                        iconType="circle" 
                        layout="horizontal" 
                        verticalAlign="bottom" 
                        align="center"
                        wrapperStyle={{ fontSize: '12px' }}
                        formatter={(value, entry: any) => `${value} (${entry.payload.count})`}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-card border border-border rounded-lg p-6 shadow-sm">
                <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-6">Monthly Leave Type Breakdown</div>
                <div className="h-64">
                  {formattedLeaveData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={formattedLeaveData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                        <XAxis 
                          dataKey="month" 
                          stroke="var(--color-muted-foreground)" 
                          fontSize={12} 
                          tickLine={false} 
                          axisLine={false} 
                        />
                        <YAxis stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                        <Tooltip 
                          contentStyle={{ borderRadius: '8px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-card)', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                        {leaveTypes.map((type, index) => (
                          <Bar key={type} dataKey={type} stackId="a" fill={COLORS[index % COLORS.length]} radius={index === leaveTypes.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]} />
                        ))}
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-sm text-muted-foreground">No leave data available.</div>
                  )}
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg p-6 shadow-sm flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Recent Activity</div>
                  <Activity className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                  {stats.recentActivity && stats.recentActivity.length > 0 ? (
                    stats.recentActivity.map((log) => (
                      <div key={log.id} className="relative pl-4 border-l-2 border-border">
                        <div className="absolute w-2 h-2 bg-primary rounded-full -left-[5px] top-1.5 ring-4 ring-card"></div>
                        <div className="text-sm font-medium text-foreground">{log.action}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {log.entityType} • {new Date(log.timestamp).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </div>
                        {log.performedBy && (
                          <div className="text-[10px] text-muted-foreground mt-1">by {log.performedBy}</div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-muted-foreground">No recent activity found.</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
