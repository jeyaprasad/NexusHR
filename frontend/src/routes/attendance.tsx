import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { apiFetch, getUser } from "../lib/auth";
import { Layout } from "../components/Layout";

export const Route = createFileRoute("/attendance")({
  head: () => ({ meta: [{ title: "Attendance — NexusHR" }] }),
  beforeLoad: () => {
    if (typeof window !== "undefined" && !localStorage.getItem("nexushr_token") && !localStorage.getItem("insiihr_token")) {
      throw redirect({ to: "/login" });
    }
  },
  component: AttendancePage,
});

type AttendanceRecord = {
  id: number;
  employeeId: number;
  employeeName: string;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  hoursWorked: number | null;
  overtimeHours: number | null;
  lateMinutes: number | null;
  status: string;
  notes: string | null;
};

const STATUS_COLORS: Record<string, string> = {
  PRESENT: "text-green-600 bg-green-50 border-green-200",
  ABSENT: "text-red-600 bg-red-50 border-red-200",
  LATE: "text-yellow-600 bg-yellow-50 border-yellow-200",
  HALF_DAY: "text-orange-600 bg-orange-50 border-orange-200",
  ON_LEAVE: "text-blue-600 bg-blue-50 border-blue-200",
};

function AttendancePage() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch("/api/attendance?page=0&size=50")
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load attendance");
        return r.json();
      })
      .then((d) => setRecords(Array.isArray(d) ? d : (d.content ?? [])))
      .catch((err) => {
        console.error(err);
        setRecords([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const [autoProcessing, setAutoProcessing] = useState(false);

  async function handleAutoProcess() {
    setAutoProcessing(true);
    try {
      const res = await apiFetch("/api/attendance/auto-process/today", { method: "POST" });
      if (!res.ok) throw new Error("Auto-process failed");
      const data = await res.json();
      alert(`Auto-processed: ${data.processed} employees marked absent`);
      window.location.reload();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Auto-process failed");
    } finally {
      setAutoProcessing(false);
    }
  }

  return (
    <Layout>
      <main className="flex-1 px-8 py-8">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <div className="font-mono text-[10px] text-primary tracking-[0.25em] uppercase mb-1">
              Tracking
            </div>
            <h1 className="font-display text-3xl font-extrabold tracking-tight">Attendance</h1>
            <p className="text-sm text-muted-foreground mt-1">{today}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={async () => {
                const res = await apiFetch("/api/export/attendance");
                if (res.ok) {
                  const blob = await res.blob();
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = "attendance.csv";
                  a.click();
                  window.URL.revokeObjectURL(url);
                }
              }}
              className="px-4 py-2 text-sm font-semibold border border-border rounded-md hover:bg-secondary transition-colors cursor-pointer"
            >
              Export CSV
            </button>
            <button
              onClick={handleAutoProcess}
              disabled={autoProcessing}
              className="px-4 py-2 text-sm font-semibold border border-border rounded-md hover:bg-secondary transition-colors disabled:opacity-50 cursor-pointer"
            >
              {autoProcessing ? "Processing…" : "Auto-Process Today"}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-sm text-muted-foreground animate-pulse">
            Loading attendance records…
          </div>
        ) : (
          <div className="border border-border rounded-md overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-secondary">
                <tr>
                  {["Employee", "Date", "Check In", "Check Out", "Hours", "Overtime", "Late", "Status", "Notes"].map((h) => (
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
                {records.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-4 py-8 text-center text-muted-foreground">
                      No attendance records found.
                    </td>
                  </tr>
                )}
                {records.map((r) => (
                  <tr key={r.id} className="hover:bg-foreground/[0.02] transition-colors">
                    <td className="px-4 py-3 font-medium">{r.employeeName}</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{r.date}</td>
                    <td className="px-4 py-3 font-mono text-xs">{r.checkIn ?? "—"}</td>
                    <td className="px-4 py-3 font-mono text-xs">{r.checkOut ?? "—"}</td>
                    <td className="px-4 py-3 font-mono text-xs">{r.hoursWorked != null ? r.hoursWorked + "h" : "—"}</td>
                    <td className="px-4 py-3 font-mono text-xs">{r.overtimeHours != null && r.overtimeHours > 0 ? r.overtimeHours + "h" : "—"}</td>
                    <td className="px-4 py-3 font-mono text-xs">{r.lateMinutes != null && r.lateMinutes > 0 ? r.lateMinutes + "m" : "—"}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`font-mono text-[10px] px-2 py-0.5 rounded-md border uppercase font-bold ${STATUS_COLORS[r.status] ?? ""}`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{r.notes ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </Layout>
  );
}
