import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { apiFetch, getUser } from "../lib/auth";
import { Sidebar } from "../components/Sidebar";

export const Route = createFileRoute("/leaves")({
  head: () => ({ meta: [{ title: "Leaves — InsiiHR" }] }),
  beforeLoad: () => {
    if (typeof window !== "undefined" && !localStorage.getItem("insiihr_token")) {
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

function LeavesPage() {
  const [leaves, setLeaves] = useState<LeaveRecord[]>([]);
  const [employees, setEmployees] = useState<EmployeeMinimal[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter states
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");

  // Apply Leave states
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
  const [selectedLeaves, setSelectedLeaves] = useState<Set<number>>(new Set());
  const [batchProcessing, setBatchProcessing] = useState(false);

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
      .then((d) => setLeaves(Array.isArray(d) ? d : (d.content ?? [])))
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

    // If half-day, force endDate to match startDate
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
      loadEmployees(); // Reload balances
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to submit leave request";
      setError(errorMsg);
    }
  }

  async function handleStatusUpdate(id: number, status: "APPROVED" | "REJECTED" | "CANCELLED") {
    if (
      !window.confirm(
        `Are you sure you want to change the status of this leave request to ${status}?`
      )
    ) {
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
      const errorMsg = err instanceof Error ? err.message : "Action failed";
      alert(errorMsg);
    }
  }

  async function handleBatchAction(status: "APPROVED" | "REJECTED") {
    if (selectedLeaves.size === 0) {
      alert("No leaves selected");
      return;
    }
    if (!window.confirm(`Batch ${status.toLowerCase()} ${selectedLeaves.size} leave requests?`)) return;
    setBatchProcessing(true);
    try {
      const ids = Array.from(selectedLeaves);
      const res = await apiFetch(`/api/leaves/batch-status?status=${status}`, {
        method: "PUT",
        body: JSON.stringify(ids),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Batch operation failed");
      }
      setSelectedLeaves(new Set());
      loadLeaves();
      loadEmployees();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Batch operation failed");
    } finally {
      setBatchProcessing(false);
    }
  }

  function toggleSelect(id: number) {
    setSelectedLeaves((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    const pendings = filteredLeaves.filter((l) => l.status === "PENDING").map((l) => l.id);
    if (selectedLeaves.size === pendings.length) {
      setSelectedLeaves(new Set());
    } else {
      setSelectedLeaves(new Set(pendings));
    }
  }

  // Calculations
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

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 px-8 py-8">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <div className="font-mono text-[10px] text-primary tracking-[0.25em] uppercase mb-1">
              Time Off
            </div>
            <h1 className="font-display text-3xl font-extrabold tracking-tight">Leaves</h1>
          </div>
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

        {/* Summary Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
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

        {/* Filters Panel */}
        <div className="mb-6 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="flex flex-1 w-full sm:w-auto gap-3">
            <input
              type="search"
              placeholder="Search employee, leave type, or reason…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 max-w-md px-3 py-2 text-sm bg-secondary border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors text-foreground placeholder:text-muted-foreground"
            />
          </div>
          <div className="flex w-full sm:w-auto gap-3">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 text-sm bg-secondary border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors text-foreground cursor-pointer"
            >
              <option value="ALL">All Types</option>
              <option value="ANNUAL">ANNUAL</option>
              <option value="SICK">SICK</option>
              <option value="MATERNITY">MATERNITY</option>
              <option value="PATERNITY">PATERNITY</option>
              <option value="UNPAID">UNPAID</option>
              <option value="OTHER">OTHER</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-sm bg-secondary border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors text-foreground cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">PENDING</option>
              <option value="APPROVED">APPROVED</option>
              <option value="REJECTED">REJECTED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>
        </div>

        {/* Apply Leave Modal */}
        {isApplying && (
          <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-card border border-border w-full max-w-lg rounded-lg shadow-2xl p-6 relative">
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
                          className="accent-primary"
                        />
                        Full Day
                      </label>
                      <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                        <input
                          type="radio"
                          checked={newLeave.halfDay}
                          onChange={() => setNewLeave({ ...newLeave, halfDay: true })}
                          className="accent-primary"
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

        {isApprover && selectedLeaves.size > 0 && (
          <div className="mb-4 flex items-center gap-3 px-4 py-3 bg-secondary border border-border rounded-md">
            <span className="text-xs font-mono text-muted-foreground">
              {selectedLeaves.size} selected
            </span>
            <button
              onClick={() => handleBatchAction("APPROVED")}
              disabled={batchProcessing}
              className="px-3 py-1.5 text-xs font-semibold bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 cursor-pointer"
            >
              {batchProcessing ? "Processing…" : "Approve All"}
            </button>
            <button
              onClick={() => handleBatchAction("REJECTED")}
              disabled={batchProcessing}
              className="px-3 py-1.5 text-xs font-semibold bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 cursor-pointer"
            >
              {batchProcessing ? "Processing…" : "Reject All"}
            </button>
          </div>
        )}

        {loading ? (
          <div className="text-sm text-muted-foreground animate-pulse">Loading leave requests…</div>
        ) : (
          <div className="border border-border rounded-md overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-secondary">
                <tr>
                  {isApprover && (
                    <th className="px-4 py-3 text-left w-10">
                      <input
                        type="checkbox"
                        checked={selectedLeaves.size === filteredLeaves.filter(l => l.status === "PENDING").length && filteredLeaves.filter(l => l.status === "PENDING").length > 0}
                        onChange={toggleSelectAll}
                        className="accent-primary cursor-pointer"
                      />
                    </th>
                  )}
                  {[
                    "Employee",
                    "Type",
                    "Duration Option",
                    "Start Date",
                    "End Date",
                    "Duration",
                    "Reason",
                    "Status",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-widest text-muted-foreground"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredLeaves.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-4 py-8 text-center text-muted-foreground text-sm">
                      No leave requests found.
                    </td>
                  </tr>
                )}
                {filteredLeaves.map((l) => (
                  <tr key={l.id} className={`hover:bg-foreground/[0.02] transition-colors ${selectedLeaves.has(l.id) ? "bg-primary/5" : ""}`}>
                    {isApprover && (
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedLeaves.has(l.id)}
                          onChange={() => toggleSelect(l.id)}
                          disabled={l.status !== "PENDING"}
                          className="accent-primary cursor-pointer disabled:opacity-30"
                        />
                      </td>
                    )}
                    <td className="px-4 py-3 font-medium">{l.employeeName}</td>
                    <td className="px-4 py-3 text-muted-foreground">{l.leaveType}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-secondary border border-border text-foreground font-medium">
                        {l.halfDay ? "Half Day" : "Full Day"}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      {l.startDate}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      {l.endDate}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">
                      {l.duration} {l.duration === 1 ? "day" : "days"}
                    </td>
                    <td
                      className="px-4 py-3 text-xs text-muted-foreground max-w-xs truncate"
                      title={l.reason}
                    >
                      {l.reason || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`font-mono text-[10px] px-2 py-0.5 rounded-md border uppercase font-bold ${STATUS_COLORS[l.status] ?? ""}`}
                      >
                        {l.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {l.status === "PENDING" && (
                        <div className="flex gap-2">
                          {isApprover ? (
                            <>
                              <button
                                onClick={() => handleStatusUpdate(l.id, "APPROVED")}
                                className="text-xs text-green-600 hover:underline font-semibold cursor-pointer"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleStatusUpdate(l.id, "REJECTED")}
                                className="text-xs text-red-600 hover:underline font-semibold cursor-pointer"
                              >
                                Reject
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => handleStatusUpdate(l.id, "CANCELLED")}
                              className="text-xs text-gray-600 hover:underline font-semibold cursor-pointer"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      )}
                      {l.status !== "PENDING" && (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
