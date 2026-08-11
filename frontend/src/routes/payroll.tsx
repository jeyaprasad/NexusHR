import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { apiFetch } from "../lib/auth";
import { Layout } from "../components/Layout";

export const Route = createFileRoute("/payroll")({
  head: () => ({ meta: [{ title: "Payroll — InsiiHR" }] }),
  beforeLoad: () => {
    if (typeof window !== "undefined" && !localStorage.getItem("insiihr_token")) {
      throw redirect({ to: "/login" });
    }
  },
  component: PayrollPage,
});

type PayrollRecord = {
  id: number;
  employeeName: string;
  payPeriod: string;
  basicSalary: number;
  allowances: number;
  deductions: number;
  taxAmount: number;
  netSalary: number;
  payDate: string;
  status: string;
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: "text-yellow-600 bg-yellow-50 border-yellow-200",
  PROCESSED: "text-blue-600 bg-blue-50 border-blue-200",
  PAID: "text-green-600 bg-green-50 border-green-200",
  CANCELLED: "text-red-600 bg-red-50 border-red-200",
};

function fmt(n: number | null | undefined) {
  if (n == null) return "$0.00";
  return (
    "$" + Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  );
}

function PayrollPage() {
  const [records, setRecords] = useState<PayrollRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch("/api/payroll?page=0&size=50")
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load payroll");
        return r.json();
      })
      .then((d) => setRecords(Array.isArray(d) ? d : (d.content ?? [])))
      .catch((err) => {
        console.error(err);
        setRecords([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const [batchProcessing, setBatchProcessing] = useState(false);
  const [batchPayPeriod, setBatchPayPeriod] = useState(
    new Date().toLocaleString("en-US", { month: "long", year: "numeric" }).replace(" ", " ")
  );

  function downloadPayslip(id: number) {
    apiFetch(`/api/payroll/${id}/payslip`)
      .then((r) => r.blob())
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `payslip-${id}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      })
      .catch(console.error);
  }

  async function handleBatchPayroll() {
    setBatchProcessing(true);
    try {
      const res = await apiFetch(`/api/payroll/batch?payPeriod=${encodeURIComponent(batchPayPeriod)}`, {
        method: "POST",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Batch payroll failed");
      }
      const result = await res.json();
      alert(`Batch payroll processed: ${result.length} payslips generated`);
      window.location.reload();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Batch payroll failed");
    } finally {
      setBatchProcessing(false);
    }
  }

  return (
    <Layout>
      <main className="flex-1 px-8 py-8">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <div className="font-mono text-[10px] text-primary tracking-[0.25em] uppercase mb-1">
              Compensation
            </div>
            <h1 className="font-display text-3xl font-extrabold tracking-tight">Payroll</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Automated tax computation via progressive brackets. Monthly runs on the 28th.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={batchPayPeriod}
              onChange={(e) => setBatchPayPeriod(e.target.value)}
              className="px-3 py-2 text-sm bg-secondary border border-border rounded-md w-44 focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground"
              placeholder="e.g. July 2026"
            />
            <button
              onClick={handleBatchPayroll}
              disabled={batchProcessing}
              className="px-4 py-2 text-sm font-semibold bg-foreground text-background rounded-md hover:bg-foreground/90 disabled:opacity-50 transition-colors cursor-pointer"
            >
              {batchProcessing ? "Processing…" : "Run Batch Payroll"}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-sm text-muted-foreground animate-pulse">
            Loading payroll records…
          </div>
        ) : (
          <div className="border border-border rounded-md overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-secondary">
                <tr>
                  {[
                    "Employee",
                    "Pay Period",
                    "Basic",
                    "Allowances",
                    "Tax",
                    "Deductions",
                    "Net Salary",
                    "Status",
                    "",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-widest text-muted-foreground whitespace-nowrap"
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
                      No payroll records found.
                    </td>
                  </tr>
                )}
                {records.map((r) => (
                  <tr key={r.id} className="hover:bg-foreground/[0.02] transition-colors">
                    <td className="px-4 py-3 font-medium">{r.employeeName}</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      {r.payPeriod}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">{fmt(r.basicSalary)}</td>
                    <td className="px-4 py-3 font-mono text-xs text-green-600">
                      +{fmt(r.allowances)}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-destructive">
                      -{fmt(r.taxAmount)}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-destructive">
                      -{fmt(r.deductions)}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs font-bold">{fmt(r.netSalary)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`font-mono text-[10px] px-2 py-0.5 rounded-md border uppercase font-bold ${STATUS_COLORS[r.status] ?? ""}`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        id={`download-payslip-${r.id}`}
                        onClick={() => downloadPayslip(r.id)}
                        className="text-xs text-primary hover:underline font-medium"
                      >
                        PDF ?
                      </button>
                    </td>
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
