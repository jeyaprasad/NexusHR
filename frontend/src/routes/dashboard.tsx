import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { apiFetch } from "../lib/auth";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend
} from "recharts";
import { Users, UserCheck, Calendar, Clock, MoreHorizontal, CheckCircle2 } from "lucide-react";
import { Layout } from "../components/Layout";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — NexusHR" },
      { name: "description", content: "NexusHR Admin Dashboard with real-time HR metrics" },
    ],
  }),
  beforeLoad: () => {
    if (typeof window !== "undefined" && !localStorage.getItem("nexushr_token") && !localStorage.getItem("insiihr_token")) {
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

const CHART_COLORS = ['#2563eb', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#06b6d4'];

function KPICard({ label, value, icon: Icon, colorClass, bgClass }: { label: string, value: number | string, icon: any, colorClass: string, bgClass: string }) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 shadow-sm flex flex-col justify-between h-[150px]">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${bgClass} ${colorClass}`}>
          <Icon className="w-6 h-6" />
        </div>
        <button className="text-muted-foreground hover:text-foreground">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>
      <div>
        <div className="text-sm font-medium text-muted-foreground mb-1">{label}</div>
        <div className="text-3xl font-display font-bold text-foreground">{value}</div>
      </div>
    </div>
  );
}

function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch("/api/dashboard/stats")
      .then((r) => r.json())
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Compute Leave Types for Stacked Progress Bar (just taking the most recent month for demo)
  const currentMonthLeaves = (() => {
    if (!stats?.leaveTypeBreakdown) return [];
    const latestMonth = stats.leaveTypeBreakdown[stats.leaveTypeBreakdown.length - 1]?.month;
    return stats.leaveTypeBreakdown.filter(l => l.month === latestMonth);
  })();
  const totalMonthLeaves = currentMonthLeaves.reduce((acc, curr) => acc + curr.count, 0);

  return (
    <Layout>
      <main className="flex-1 p-6 md:p-8 w-full mx-auto">
        {loading && (
          <div className="text-sm text-muted-foreground animate-pulse">Loading dashboard...</div>
        )}

        {stats && (
          <div className="space-y-6 animate-slide-up">
            
            {/* 1. KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <KPICard 
                label="Total Employees" 
                value={stats.totalEmployees} 
                icon={Users} 
                colorClass="text-blue-600 dark:text-blue-400" 
                bgClass="bg-blue-100 dark:bg-blue-900/30" 
              />
              <KPICard 
                label="Active Staff" 
                value={stats.activeEmployees} 
                icon={UserCheck} 
                colorClass="text-emerald-600 dark:text-emerald-400" 
                bgClass="bg-emerald-100 dark:bg-emerald-900/30" 
              />
              <KPICard 
                label="On Leave Today" 
                value={stats.onLeaveToday} 
                icon={Calendar} 
                colorClass="text-orange-600 dark:text-orange-400" 
                bgClass="bg-orange-100 dark:bg-orange-900/30" 
              />
              <KPICard 
                label="Pending Requests" 
                value={stats.pendingLeaveRequests} 
                icon={Clock} 
                colorClass="text-purple-600 dark:text-purple-400" 
                bgClass="bg-purple-100 dark:bg-purple-900/30" 
              />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Left Column (Bar Chart & Progress Bar) */}
              <div className="xl:col-span-2 space-y-6">
                
                {/* 3. Bar Chart Panel */}
                <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-bold text-foreground">Headcount Trends</h2>
                  </div>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats.headcountHistory || []} barGap={4}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                        <XAxis 
                          dataKey="date" 
                          tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          stroke="var(--color-muted-foreground)" 
                          fontSize={12} 
                          tickLine={false} 
                          axisLine={false} 
                        />
                        <YAxis stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip 
                          contentStyle={{ borderRadius: '8px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-card)' }}
                          labelFormatter={(val) => new Date(val).toLocaleDateString()}
                        />
                        <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} verticalAlign="top" align="right" />
                        <Bar dataKey="active" name="Active" fill="#2563eb" radius={[4, 4, 0, 0]} maxBarSize={40} />
                        <Bar dataKey="onLeave" name="On Leave" fill="#8b5cf6" radius={[4, 4, 0, 0]} maxBarSize={40} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* 2. Stacked Progress Bar */}
                <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-bold text-foreground">Leave Breakdown (Current Month)</h2>
                    <div className="text-2xl font-bold">{totalMonthLeaves}</div>
                  </div>
                  
                  <div className="h-4 w-full rounded-full flex overflow-hidden mb-6 bg-secondary">
                    {currentMonthLeaves.map((leave, idx) => (
                      <div 
                        key={leave.type} 
                        style={{ width: `${(leave.count / totalMonthLeaves) * 100}%`, backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }}
                        className="h-full transition-all hover:opacity-90 cursor-pointer"
                        title={`${leave.type}: ${leave.count}`}
                      />
                    ))}
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-6">
                    {currentMonthLeaves.map((leave, idx) => (
                      <div key={leave.type} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }}></div>
                        <span className="text-sm font-medium text-foreground">{leave.type}</span>
                        <span className="text-sm text-muted-foreground">({((leave.count / totalMonthLeaves) * 100).toFixed(0)}%)</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Right Column (Donut, Team, Tasks) */}
              <div className="space-y-6">
                
                {/* 4. Donut Chart Panel */}
                <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                  <h2 className="text-lg font-bold text-foreground mb-2">Department Distribution</h2>
                  <div className="h-64 relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={stats.departmentDistribution || []}
                          cx="50%"
                          cy="50%"
                          innerRadius={65}
                          outerRadius={90}
                          paddingAngle={2}
                          dataKey="count"
                          stroke="none"
                        >
                          {(stats.departmentDistribution || []).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-card)' }} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-3xl font-bold text-foreground">{stats.totalEmployees}</span>
                      <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Total</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-y-3 gap-x-4 mt-2">
                    {(stats.departmentDistribution || []).map((dept, idx) => (
                      <div key={dept.department} className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }}></div>
                        <span className="text-xs font-medium text-foreground truncate flex-1">{dept.department}</span>
                        <span className="text-xs text-muted-foreground font-semibold">{dept.count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 6. Team Panel */}
                <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold text-foreground">Department Teams</h2>
                    <button className="text-sm font-medium text-primary hover:underline">View All</button>
                  </div>
                  <div className="space-y-4">
                    {(stats.departmentDistribution || []).slice(0, 4).map((dept) => (
                      <div key={dept.department} className="flex items-center justify-between p-3 rounded-lg border border-border bg-background/50 hover:bg-secondary/50 transition-colors cursor-pointer">
                        <div>
                          <div className="text-sm font-semibold text-foreground">{dept.department}</div>
                          <div className="text-xs text-muted-foreground">{dept.count} members</div>
                        </div>
                        <div className="flex -space-x-2 overflow-hidden">
                          {Array.from({ length: Math.min(dept.count, 3) }).map((_, i) => (
                            <div key={i} className="inline-block h-8 w-8 rounded-full ring-2 ring-card bg-primary text-primary-foreground flex flex-col items-center justify-center text-[10px] font-bold">
                              {dept.department.substring(0, 2).toUpperCase()}
                            </div>
                          ))}
                          {dept.count > 3 && (
                            <div className="inline-block h-8 w-8 rounded-full ring-2 ring-card bg-muted text-muted-foreground flex flex-col items-center justify-center text-xs font-medium">
                              +{dept.count - 3}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 5. Task List Panel */}
                <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold text-foreground">Recent Activity</h2>
                  </div>
                  <div className="space-y-3">
                    {stats.recentActivity && stats.recentActivity.slice(0, 5).map((log, idx) => (
                      <div key={log.id} className="flex items-start gap-3 p-3 rounded-r-lg border border-border border-l-4 bg-background/50 hover:bg-secondary/50 transition-colors" style={{ borderLeftColor: CHART_COLORS[idx % CHART_COLORS.length] }}>
                        <Clock className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-foreground truncate">{log.action}</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {new Date(log.timestamp).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })} • {log.performedBy || 'System'}
                          </div>
                        </div>
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 opacity-50 flex-shrink-0 mt-0.5" />
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>

          </div>
        )}
      </main>
    </Layout>
  );
}
