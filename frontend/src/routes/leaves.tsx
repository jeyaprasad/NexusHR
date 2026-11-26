import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { apiFetch, getUser } from "../lib/auth";
import { Layout } from "../components/Layout";
import { Clock, CheckCircle, XCircle, Ban, Calendar, MessageSquare, AlertCircle } from "lucide-react";

export const Route = createFileRoute("/leaves")({
  head: () => ({ meta: [{ title: "Leaves — NexusHR" }] }),
  beforeLoad: () => {
    if (typeof window !== "undefined" && !localStorage.getItem("nexushr_token") && !localStorage.getItem("insiihr_token")) {
      throw redirect({ to: "/login" });
    }
  },
  component: LeavesPage,
});

type LeaveRecord = {
  id: number;
  employeeId: number;
  employeeName: string;
  startDate: string;
  endDate: string;
  leaveType: string;
  status: string;
  reason: string;
  duration: number;
  halfDay: boolean;
};

type EmployeeMinimal = {
  id: number;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  leaveBalance: number;
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: "text-yellow-600 bg-yellow-50 border-yellow-200",
  APPROVED: "text-green-600 bg-green-50 border-green-200",
  REJECTED: "text-red-600 bg-red-50 border-red-200",
  CANCELLED: "text-gray-600 bg-gray-50 border-gray-200",
};

const STATUS_ICONS: Record<string, any> = {
  PENDING: Clock,
  APPROVED: CheckCircle,
  REJECTED: XCircle,
  CANCELLED: Ban,
};

function LeavesPage() {
  const [leaves, setLeaves] = useState<LeaveRecord[]>([]);
  const [employees, setEmployees] = useState<EmployeeMinimal[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");

  const [isApplying, setIsApplying] = useState(false);
  const [error, setError] = useState("");
  const [newLeave, setNewLeave] = useState({
    employeeId: "",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
    leaveType: "ANNUAL",
    reason: "",
    halfDay: false,
  });

  const [user, setUser] = useState<{ email: string; fullName: string; role: string } | null>(null);
  const isApprover = user?.role === "ADMIN" || user?.role === "HR";
  
  const [selectedLeaveId, setSelectedLeaveId] = useState<number | null>(null);

  useEffect(() => {
    setUser(getUser());
    loadLeaves();
    loadEmployees();
  }, []);

  function loadLeaves() {
    setLoading(true);
    apiFetch("/api/leaves?page=0&size=50")
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load leaves");
        return r.json();
      })
      .then((d) => {
        const data = Array.isArray(d) ? d : (d.content ?? []);
        setLeaves(data);
        if (data.length > 0 && selectedLeaveId === null) {
          setSelectedLeaveId(data[0].id);
        }
      })
      .catch((err) => {
        console.error(err);
        setLeaves([]);
      })
      .finally(() => setLoading(false));
  }

  function loadEmployees() {
    apiFetch("/api/employees?page=0&size=1000")
      .then((r) => r.json())
      .then((d) => setEmployees(Array.isArray(d) ? d : (d.content ?? [])))
      .catch(console.error);
  }

  async function handleApply(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const payload = {
      ...newLeave,
      employeeId: Number(newLeave.employeeId),
      endDate: newLeave.halfDay ? newLeave.startDate : newLeave.endDate,
    };

    if (!payload.employeeId) {
      setError("Please select an employee");
      return;
    }

    try {
      const res = await apiFetch("/api/leaves", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to submit leave request");
      }
      setIsApplying(false);
      setNewLeave({
        employeeId: "",
        startDate: new Date().toISOString().split("T")[0],
        endDate: new Date().toISOString().split("T")[0],
        leaveType: "ANNUAL",
        reason: "",
        halfDay: false,
      });
      loadLeaves();
      loadEmployees();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to submit leave request";
      setError(errorMsg);
    }
  }

  async function handleStatusUpdate(id: number, status: "APPROVED" | "REJECTED" | "CANCELLED") {
    if (!window.confirm(`Are you sure you want to change the status of this leave request to ${status}?`)) {
      return;
    }
    try {
      const res = await apiFetch(`/api/leaves/${id}/status?status=${status}`, {
        method: "PUT",
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || `Failed to ${status.toLowerCase()} leave request`);
      }
      loadLeaves();
      loadEmployees();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Action failed");
    }
  }

  const pendingCount = leaves.filter((l) => l.status === "PENDING").length;
  const approvedCount = leaves.filter((l) => l.status === "APPROVED").length;
  const totalApprovedDays = leaves
    .filter((l) => l.status === "APPROVED")
    .reduce((sum, l) => sum + (l.duration || 0), 0);

  const currentEmployee = user
    ? employees.find((emp) => emp.email?.toLowerCase() === user.email?.toLowerCase())
    : null;
  const myBalance = currentEmployee?.leaveBalance ?? null;

  const filteredLeaves = leaves.filter((l) => {
    const matchesSearch =
      !search.trim() ||
      l.employeeName.toLowerCase().includes(search.toLowerCase()) ||
      l.leaveType.toLowerCase().includes(search.toLowerCase()) ||
      (l.reason && l.reason.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === "ALL" || l.status === statusFilter;
    const matchesType = typeFilter === "ALL" || l.leaveType === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const selectedLeaveDetails = leaves.find(l => l.id === selectedLeaveId);
  const selectedEmployeeDetails = selectedLeaveDetails ? employees.find(e => e.id === selectedLeaveDetails.employeeId) : null;

  return (
    <Layout>
      <main className="flex-1 flex flex-col h-[calc(100vh-4rem)] overflow-hidden">
        {/* Top Header & Stats */}
        <div className="px-8 py-6 shrink-0 border-b border-border bg-background">
          <div className="flex items-end justify-between gap-4 mb-6">
            <div>
              <div className="font-mono text-[10px] text-primary tracking-[0.25em] uppercase mb-1">
                Time Off
              </div>
              <h1 className="font-display text-3xl font-extrabold tracking-tight">Leaves</h1>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={async () => {
                  const res = await apiFetch("/api/export/leaves");
                  if (res.ok) {
                    const blob = await res.blob();
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = "leaves.csv";
                    a.click();
                    window.URL.revokeObjectURL(url);
                  }
                }}
                className="px-4 py-2 text-sm font-semibold border border-border rounded-md hover:bg-secondary transition-colors cursor-pointer"
              >
                Export CSV
              </button>
              <button
                onClick={() => {
                  setIsApplying(true);
                  setError("");
                  if (user && user.role === "EMPLOYEE" && currentEmployee) {
                    setNewLeave((prev) => ({ ...prev, employeeId: String(currentEmployee.id) }));
                  }
                }}
                className="px-4 py-2 text-sm font-semibold bg-foreground text-background rounded-md hover:bg-foreground/90 transition-colors cursor-pointer"
              >
                Apply Leave
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-card border border-border p-4 rounded-md hover:border-primary/50 transition-colors flex flex-col justify-between">
              <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
                My Leave Balance
              </span>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-3xl font-extrabold tracking-tight">
                  {myBalance !== null ? `${myBalance}` : "—"}
                </span>
                <span className="text-xs text-muted-foreground">days</span>
              </div>
            </div>
            <div className="bg-card border border-border p-4 rounded-md hover:border-yellow-500/50 transition-colors flex flex-col justify-between">
              <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
                Pending Approvals
              </span>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-3xl font-extrabold tracking-tight text-yellow-600 dark:text-yellow-500">
                  {pendingCount}
                </span>
                <span className="text-xs text-muted-foreground">requests</span>
              </div>
            </div>
            <div className="bg-card border border-border p-4 rounded-md hover:border-green-500/50 transition-colors flex flex-col justify-between">
              <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
                Approved Requests
              </span>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-3xl font-extrabold tracking-tight text-green-600 dark:text-green-500">
                  {approvedCount}
                </span>
                <span className="text-xs text-muted-foreground">requests</span>
              </div>
            </div>
            <div className="bg-card border border-border p-4 rounded-md hover:border-primary/50 transition-colors flex flex-col justify-between">
              <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
                Total Days Taken
              </span>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-3xl font-extrabold tracking-tight">{totalApprovedDays}</span>
                <span className="text-xs text-muted-foreground">days</span>
              </div>
            </div>
          </div>

          {/* Pill Filters */}
          <div className="flex items-center justify-between">
            <div className="flex gap-1 bg-secondary rounded-full p-1 shadow-inner">
              {["ALL", "PENDING", "APPROVED", "REJECTED", "CANCELLED"].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-all cursor-pointer ${
                    statusFilter === status
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "text-muted-foreground hover:bg-primary/10 hover:text-foreground"
                  }`}
                >
                  {status === "ALL" ? "All Statuses" : status.charAt(0) + status.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2 text-sm bg-secondary rounded-full focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors text-foreground cursor-pointer font-medium"
            >
              <option value="ALL">All Types</option>
              <option value="ANNUAL">ANNUAL</option>
              <option value="SICK">SICK</option>
              <option value="MATERNITY">MATERNITY</option>
              <option value="PATERNITY">PATERNITY</option>
              <option value="UNPAID">UNPAID</option>
              <option value="OTHER">OTHER</option>
            </select>
          </div>
        </div>

        {/* Split View Pane */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Panel: Dark List */}
          <div className="w-[350px] lg:w-[400px] bg-primary text-primary-foreground overflow-y-auto shrink-0 flex flex-col relative z-10 shadow-lg">
            {loading ? (
              <div className="p-8 text-center text-primary-foreground/60 text-sm animate-pulse">Loading queue…</div>
            ) : filteredLeaves.length === 0 ? (
              <div className="p-8 text-center text-primary-foreground/60 text-sm">No leave requests found.</div>
            ) : (
              <div className="divide-y divide-primary-foreground/10">
                {filteredLeaves.map((l) => {
                  const Icon = STATUS_ICONS[l.status] || Clock;
                  const isSelected = selectedLeaveId === l.id;
                  return (
                    <button
                      key={l.id}
                      onClick={() => setSelectedLeaveId(l.id)}
                      className={`w-full text-left p-5 transition-all flex items-start gap-4 cursor-pointer ${
                        isSelected 
                          ? "bg-white/10 shadow-[inset_4px_0_0_0_#fff]" 
                          : "hover:bg-white/5"
                      }`}
                    >
                      <div className={`mt-0.5 ${
                        l.status === 'APPROVED' ? 'text-emerald-400' :
                        l.status === 'REJECTED' ? 'text-rose-400' :
                        l.status === 'PENDING' ? 'text-amber-400' :
                        'text-primary-foreground/60'
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline mb-1">
                          <div className="font-semibold text-sm truncate pr-2">{l.employeeName}</div>
                          <div className="font-mono text-[10px] opacity-70 whitespace-nowrap">{l.duration} {l.duration === 1 ? "day" : "days"}</div>
                        </div>
                        <div className="text-xs opacity-80 mb-2">{l.leaveType} • {l.startDate}</div>
                        <div className="text-xs opacity-60 truncate">
                          {l.reason || "No reason provided"}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Panel: Light Detail */}
          <div className="flex-1 bg-card text-foreground overflow-y-auto">
            {selectedLeaveDetails ? (
              <div className="max-w-3xl mx-auto p-10 animate-slide-up">
                <div className="flex items-center justify-between mb-8 pb-8 border-b border-border">
                  <div>
                    <h2 className="text-2xl font-display font-bold tracking-tight mb-2">
                      Leave Request
                    </h2>
                    <div className="flex gap-2">
                      <span className={`font-mono text-[10px] px-2 py-0.5 rounded-md border uppercase font-bold ${STATUS_COLORS[selectedLeaveDetails.status] ?? ""}`}>
                        {selectedLeaveDetails.status}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-foreground font-medium border border-border">
                        {selectedLeaveDetails.halfDay ? "Half Day" : "Full Day"}
                      </span>
                    </div>
                  </div>
                  {selectedEmployeeDetails && (
                    <div className="text-right">
                      <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Balance Available</div>
                      <div className="text-3xl font-extrabold">{selectedEmployeeDetails.leaveBalance}</div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-8 mb-8">
                  <div>
                    <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Employee</div>
                    <div className="font-semibold text-lg">{selectedLeaveDetails.employeeName}</div>
                    {selectedEmployeeDetails && <div className="text-sm text-muted-foreground">{selectedEmployeeDetails.email}</div>}
                  </div>
                  <div>
                    <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Leave Type</div>
                    <div className="font-semibold text-lg">{selectedLeaveDetails.leaveType}</div>
                  </div>
                </div>

                <div className="bg-secondary/50 rounded-lg p-6 mb-8 border border-border/50 flex gap-12">
                  <div>
                    <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Start Date</div>
                    <div className="font-semibold">{selectedLeaveDetails.startDate}</div>
                  </div>
                  <div>
                    <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-1">End Date</div>
                    <div className="font-semibold">{selectedLeaveDetails.endDate}</div>
                  </div>
                  <div>
                    <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Duration</div>
                    <div className="font-semibold text-primary">{selectedLeaveDetails.duration} {selectedLeaveDetails.duration === 1 ? "day" : "days"}</div>
                  </div>
                </div>

                <div className="mb-10">
                  <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
                    <MessageSquare className="w-3 h-3" /> Reason
                  </div>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap bg-background border border-border rounded-lg p-5">
                    {selectedLeaveDetails.reason || <span className="text-muted-foreground italic">No reason provided.</span>}
                  </p>
                </div>

                {selectedLeaveDetails.status === "PENDING" && (
                  <div className="flex gap-3 pt-6 border-t border-border">
                    {isApprover ? (
                      <>
                        <button
                          onClick={() => handleStatusUpdate(selectedLeaveDetails.id, "APPROVED")}
                          className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-md shadow-sm transition-colors cursor-pointer"
                        >
                          Approve Request
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(selectedLeaveDetails.id, "REJECTED")}
                          className="px-6 py-3 bg-card border border-destructive text-destructive hover:bg-destructive/10 text-sm font-semibold rounded-md transition-colors cursor-pointer"
                        >
                          Reject
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleStatusUpdate(selectedLeaveDetails.id, "CANCELLED")}
                        className="px-6 py-3 bg-card border border-border text-foreground hover:bg-secondary text-sm font-semibold rounded-md transition-colors cursor-pointer"
                      >
                        Cancel Request
                      </button>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <AlertCircle className="w-12 h-12 mb-4 opacity-20" />
                <p>Select a leave request from the queue</p>
              </div>
            )}
          </div>
        </div>

        {/* Apply Leave Modal */}
        {isApplying && (
          <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-card border border-border w-full max-w-lg rounded-lg shadow-lg p-6 relative">
              <button
                onClick={() => setIsApplying(false)}
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground text-xl cursor-pointer"
              >
                &times;
              </button>
              <h2 className="font-display text-xl font-extrabold mb-4">Request Time Off</h2>

              {error && (
                <div className="mb-4 px-4 py-3 rounded-md bg-destructive/10 border border-destructive/20 text-sm text-destructive">
                  {error}
                </div>
              )}

              <form onSubmit={handleApply} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase text-muted-foreground">
                    Employee
                  </label>
                  <select
                    required
                    disabled={user?.role === "EMPLOYEE"}
                    value={newLeave.employeeId}
                    onChange={(e) => setNewLeave({ ...newLeave, employeeId: e.target.value })}
                    className="w-full px-3 py-2.5 text-sm bg-secondary border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground disabled:opacity-75 disabled:cursor-not-allowed"
                  >
                    <option value="">Select Employee</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.firstName} {emp.lastName} (Bal:{" "}
                        {emp.leaveBalance != null ? emp.leaveBalance : 30} days)
                      </option>
                    ))}
                  </select>
                  {user?.role === "EMPLOYEE" && (
                    <p className="text-[11px] font-mono text-muted-foreground mt-0.5">
                      Leave requests are locked to your personal profile.
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono uppercase text-muted-foreground">
                      Leave Type
                    </label>
                    <select
                      value={newLeave.leaveType}
                      onChange={(e) => setNewLeave({ ...newLeave, leaveType: e.target.value })}
                      className="w-full px-3 py-2.5 text-sm bg-secondary border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground"
                    >
                      <option value="ANNUAL">ANNUAL</option>
                      <option value="SICK">SICK</option>
                      <option value="MATERNITY">MATERNITY</option>
                      <option value="PATERNITY">PATERNITY</option>
                      <option value="UNPAID">UNPAID</option>
                      <option value="OTHER">OTHER</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono uppercase text-muted-foreground">
                      Duration Option
                    </label>
                    <div className="flex gap-4 items-center h-10">
                      <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                        <input
                          type="radio"
                          checked={!newLeave.halfDay}
                          onChange={() => setNewLeave({ ...newLeave, halfDay: false })}
                          className="accent-primary cursor-pointer"
                        />
                        Full Day
                      </label>
                      <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                        <input
                          type="radio"
                          checked={newLeave.halfDay}
                          onChange={() => setNewLeave({ ...newLeave, halfDay: true })}
                          className="accent-primary cursor-pointer"
                        />
                        Half Day
                      </label>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono uppercase text-muted-foreground">
                      {newLeave.halfDay ? "Date" : "Start Date"}
                    </label>
                    <input
                      type="date"
                      required
                      value={newLeave.startDate}
                      onChange={(e) => {
                        const newD = e.target.value;
                        setNewLeave({
                          ...newLeave,
                          startDate: newD,
                          endDate: newLeave.halfDay ? newD : newLeave.endDate,
                        });
                      }}
                      className="w-full px-3 py-2.5 text-sm bg-secondary border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground"
                    />
                  </div>
                  {!newLeave.halfDay && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-mono uppercase text-muted-foreground">
                        End Date
                      </label>
                      <input
                        type="date"
                        required
                        value={newLeave.endDate}
                        onChange={(e) => setNewLeave({ ...newLeave, endDate: e.target.value })}
                        className="w-full px-3 py-2.5 text-sm bg-secondary border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground"
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase text-muted-foreground">
                    Reason
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={newLeave.reason}
                    onChange={(e) => setNewLeave({ ...newLeave, reason: e.target.value })}
                    className="w-full px-3 py-2.5 text-sm bg-secondary border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground resize-none"
                    placeholder="Enter reason for leave request…"
                  />
                </div>

                <div className="mt-6 flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsApplying(false)}
                    className="px-4 py-2.5 text-sm font-medium hover:bg-secondary rounded-md transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2.5 text-sm font-medium bg-foreground text-background rounded-md hover:bg-foreground/90 transition-colors cursor-pointer"
                  >
                    Submit Request
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </Layout>
  );
}
