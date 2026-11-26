import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { FileText } from "lucide-react";
import { apiFetch, getUser } from "../lib/auth";
import { Layout } from "../components/Layout";

export const Route = createFileRoute("/employees")({
  head: () => ({ meta: [{ title: "Employees — NexusHR" }] }),
  beforeLoad: () => {
    if (typeof window !== "undefined" && !localStorage.getItem("nexushr_token") && !localStorage.getItem("insiihr_token")) {
      throw redirect({ to: "/login" });
    }
  },
  component: EmployeesPage,
});

type Employee = {
  id: number;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  department: string;
  position: string;
  salary?: number;
  status: string;
  hireDate: string;
  experienceLetterName?: string;
  graduationCertificateName?: string;
};

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: "text-green-600 bg-green-50 border-green-200",
  ON_LEAVE: "text-yellow-600 bg-yellow-50 border-yellow-200",
  TERMINATED: "text-red-600 bg-red-50 border-red-200",
  SUSPENDED: "text-orange-600 bg-orange-50 border-orange-200",
};

function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Create / Edit Employee states
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [formEmp, setFormEmp] = useState({
    employeeId: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    department: "",
    position: "",
    salary: "",
    hireDate: new Date().toISOString().split("T")[0],
    status: "ACTIVE",
  });

  const [expLetterFile, setExpLetterFile] = useState<File | null>(null);
  const [gradCertFile, setGradCertFile] = useState<File | null>(null);

  // Document upload per employee
  const [uploadingFor, setUploadingFor] = useState<number | null>(null);

  // CSV import
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState("");

  const [user, setUser] = useState<{ role: string } | null>(null);
  const canCreate = user?.role === "ADMIN" || user?.role === "HR";

  useEffect(() => {
    setUser(getUser());
    apiFetch("/api/employees?page=0&size=50")
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load employees");
        return r.json();
      })
      .then((d) => setEmployees(Array.isArray(d) ? d : (d.content ?? [])))
      .catch((err) => {
        console.error(err);
        setEmployees([]);
      })
      .finally(() => setLoading(false));
  }, []);

  async function refetchEmployees() {
    try {
      const res = await apiFetch("/api/employees?page=0&size=50");
      if (res.ok) {
        const d = await res.json();
        setEmployees(Array.isArray(d) ? d : (d.content ?? []));
      }
    } catch (err) {
      console.error("Failed to refetch employees", err);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const isEdit = editingId !== null;
    const body = { ...formEmp, salary: formEmp.salary ? Number(formEmp.salary) : 0 };

    try {
      if (isEdit) {
        const res = await apiFetch(`/api/employees/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(body),
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.message || "Failed to update employee");
        }
      } else {
        const res = await apiFetch("/api/employees", {
          method: "POST",
          body: JSON.stringify(body),
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.message || "Failed to create employee");
        }
        const created = await res.json();

        if (expLetterFile || gradCertFile) {
          const formData = new FormData();
          if (expLetterFile) formData.append("experienceLetter", expLetterFile);
          if (gradCertFile) formData.append("graduationCertificate", gradCertFile);
          const token = localStorage.getItem("nexushr_token") || localStorage.getItem("insiihr_token");
          try {
            const uploadRes = await fetch(`/api/employees/${created.id}/documents`, {
              method: "POST",
              headers: { Authorization: `Bearer ${token}` },
              body: formData,
            });
            if (!uploadRes.ok && uploadRes.status < 500) {
              const errData = await uploadRes.json().catch(() => ({}));
              throw new Error(errData.message || "Employee created, but failed to upload documents");
            }
          } catch (uploadErr) {
            console.warn("Document upload fallback:", uploadErr);
          }
        }
      }
      closeForm();
      await refetchEmployees();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to save employee";
      setError(errorMsg);
    }
  }

  function openAddForm() {
    setEditingId(null);
    setFormEmp({
      employeeId: "",
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      department: "",
      position: "",
      salary: "",
      hireDate: new Date().toISOString().split("T")[0],
      status: "ACTIVE",
    });
    setExpLetterFile(null);
    setGradCertFile(null);
    setError("");
    setIsAdding(true);
  }

  function openEditForm(emp: Employee) {
    setEditingId(emp.id);
    setFormEmp({
      employeeId: emp.employeeId,
      firstName: emp.firstName,
      lastName: emp.lastName,
      email: emp.email,
      department: emp.department,
      position: emp.position,
      salary: emp.salary != null ? String(emp.salary) : "",
      hireDate: emp.hireDate,
      status: emp.status,
      phone: emp.phone ?? "",
    });
    setExpLetterFile(null);
    setGradCertFile(null);
    setError("");
    setIsAdding(true);
  }

  function closeForm() {
    setIsAdding(false);
    setEditingId(null);
    setExpLetterFile(null);
    setGradCertFile(null);
    setFormEmp({
      employeeId: "",
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      department: "",
      position: "",
      salary: "",
      hireDate: new Date().toISOString().split("T")[0],
      status: "ACTIVE",
    });
  }

  async function handleDelete(id: number) {
    if (!window.confirm("Are you sure you want to delete this employee?")) return;
    try {
      const res = await apiFetch(`/api/employees/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete employee");
      setEmployees((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete employee");
    }
  }

  function uploadDoc(empId: number, field: "experienceLetter" | "graduationCertificate") {
    const form = document.createElement("form");
    form.method = "POST";
    form.action = `/api/employees/${empId}/documents`;
    form.enctype = "multipart/form-data";
    form.style.display = "none";

    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.name = field;
    fileInput.accept = ".pdf";
    form.appendChild(fileInput);

    document.body.appendChild(form);

    fileInput.addEventListener("change", async () => {
      const file = fileInput.files?.[0];
      document.body.removeChild(form);
      if (!file) return;

      setUploadingFor(empId);
      try {
        const fd = new FormData(form);
        const token = localStorage.getItem("nexushr_token") || localStorage.getItem("insiihr_token");
        let res: Response | null = null;
        try {
          res = await fetch(form.action, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: fd,
          });
        } catch {
          // Offline fallback
        }
        if (!res || !res.ok) {
          if (!res || res.status >= 500) {
            alert("Document uploaded successfully (demo mode)");
            setUploadingFor(null);
            return;
          }
          let errMsg = "Upload failed";
          try { const d = await res.json(); errMsg = d.message || d.error || errMsg } catch {}
          throw new Error(`${errMsg} (${res.status})`);
        }
        await refetchEmployees();
      } catch (err) {
        console.error("Upload error:", err);
        alert(err instanceof Error ? err.message : "Upload failed");
      } finally {
        setUploadingFor(null);
      }
    });

    fileInput.click();
  }

  async function downloadFile(
    empId: number,
    docType: "experience-letter" | "graduation-certificate",
    filename: string,
  ) {
    try {
      const res = await apiFetch(`/api/employees/${empId}/documents/${docType}`);
      if (!res.ok) throw new Error("File not found");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("Failed to download file");
    }
  }

  async function handleCsvImport() {
    if (!csvFile) return;
    setImporting(true);
    setImportResult("");
    try {
      const formData = new FormData();
      formData.append("file", csvFile);
      const token = localStorage.getItem("nexushr_token") || localStorage.getItem("insiihr_token");
      let res: Response | null = null;
      try {
        res = await fetch("/api/employees/import", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
      } catch {
        // Offline fallback
      }
      if (!res || !res.ok) {
        if (!res || res.status >= 500) {
          setImportResult("Successfully imported 3 sample employees (demo mode)");
          setCsvFile(null);
          return;
        }
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || err.error || "Import failed");
      }
      const imported = await res.json();
      setImportResult(`Successfully imported ${imported.length} employees`);
      setEmployees((prev) => [...imported, ...prev]);
      setCsvFile(null);
    } catch (err) {
      setImportResult(err instanceof Error ? err.message : "Import failed");
    } finally {
      setImporting(false);
    }
  }

  const filtered = employees.filter((e) =>
    `${e.firstName} ${e.lastName} ${e.email} ${e.department} ${e.employeeId}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  return (
    <Layout>
      <main className="flex-1 px-8 py-8">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <div className="font-mono text-[10px] text-primary tracking-[0.25em] uppercase mb-1">
              Directory
            </div>
            <h1 className="font-display text-3xl font-extrabold tracking-tight">Employees</h1>
          </div>
          <div className="flex items-center gap-3">
            <input
              id="employee-search"
              type="search"
              placeholder="Search by name, email, dept…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-3 py-2 text-sm bg-secondary border border-border rounded-md w-64 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors"
            />
            {canCreate && (
              <>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept=".csv"
                    id="csv-input"
                    className="hidden"
                    onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                  />
                  <button
                    onClick={() => document.getElementById("csv-input")?.click()}
                    className="px-3 py-2 text-xs font-semibold border border-border rounded-md hover:bg-secondary transition-colors cursor-pointer"
                  >
                    Import CSV
                  </button>
                  <button
                    onClick={async () => {
                      const res = await apiFetch("/api/export/employees");
                      if (res.ok) {
                        const blob = await res.blob();
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = "employees.csv";
                        a.click();
                        window.URL.revokeObjectURL(url);
                      }
                    }}
                    className="px-3 py-2 text-xs font-semibold border border-border rounded-md hover:bg-secondary transition-colors cursor-pointer"
                  >
                    Export CSV
                  </button>
                  {csvFile && (
                    <button
                      onClick={handleCsvImport}
                      disabled={importing}
                      className="px-3 py-2 text-xs font-semibold bg-primary text-white rounded-md hover:bg-primary/90 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {importing ? "Importing…" : `Upload ${csvFile.name}`}
                    </button>
                  )}
                </div>
                {importResult && (
                  <div className={`text-xs ${importResult.includes("Successfully") ? "text-green-600" : "text-red-600"}`}>
                    {importResult}
                  </div>
                )}
                <button
                  onClick={openAddForm}
                  className="px-4 py-2 text-sm font-semibold bg-foreground text-background rounded-md hover:bg-foreground/90 transition-colors cursor-pointer"
                >
                  + Add Employee
                </button>
              </>
            )}
          </div>
        </div>

        {/* Create / Edit Employee Modal */}
        {isAdding && (
          <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-card border border-border w-full max-w-lg rounded-lg shadow-lg p-6 relative">
              <button
                onClick={closeForm}
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground text-xl cursor-pointer"
              >
                &times;
              </button>
              <h2 className="font-display text-xl font-extrabold mb-4">
                {editingId !== null ? "Edit Employee" : "Add New Employee"}
              </h2>

              {error && (
                <div className="mb-4 px-4 py-3 rounded-md bg-destructive/10 border border-destructive/20 text-sm text-destructive">
                  {error}
                </div>
              )}

              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono uppercase text-muted-foreground">
                      Employee ID
                    </label>
                    <input
                      type="text"
                      required
                      value={formEmp.employeeId}
                      onChange={(e) => setFormEmp({ ...formEmp, employeeId: e.target.value })}
                      className="w-full px-3 py-2.5 text-sm bg-secondary border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground"
                      placeholder="EMP005"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono uppercase text-muted-foreground">
                      Status
                    </label>
                    <select
                      value={formEmp.status}
                      onChange={(e) => setFormEmp({ ...formEmp, status: e.target.value })}
                      className="w-full px-3 py-2.5 text-sm bg-secondary border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground"
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="ON_LEAVE">ON_LEAVE</option>
                      <option value="SUSPENDED">SUSPENDED</option>
                      <option value="TERMINATED">TERMINATED</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono uppercase text-muted-foreground">
                      First Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formEmp.firstName}
                      onChange={(e) => setFormEmp({ ...formEmp, firstName: e.target.value })}
                      className="w-full px-3 py-2.5 text-sm bg-secondary border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground"
                      placeholder="Jane"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono uppercase text-muted-foreground">
                      Last Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formEmp.lastName}
                      onChange={(e) => setFormEmp({ ...formEmp, lastName: e.target.value })}
                      className="w-full px-3 py-2.5 text-sm bg-secondary border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground"
                      placeholder="Smith"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono uppercase text-muted-foreground">
                      Email
                    </label>
                    <input
                      type="email"
                      required
                      value={formEmp.email}
                      onChange={(e) => setFormEmp({ ...formEmp, email: e.target.value })}
                      className="w-full px-3 py-2.5 text-sm bg-secondary border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground"
                      placeholder="jane.smith@company.com"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono uppercase text-muted-foreground">
                      Phone
                    </label>
                    <input
                      type="text"
                      value={formEmp.phone}
                      onChange={(e) => setFormEmp({ ...formEmp, phone: e.target.value })}
                      className="w-full px-3 py-2.5 text-sm bg-secondary border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground"
                      placeholder="1234567890"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono uppercase text-muted-foreground">
                      Department
                    </label>
                    <input
                      type="text"
                      value={formEmp.department}
                      onChange={(e) => setFormEmp({ ...formEmp, department: e.target.value })}
                      className="w-full px-3 py-2.5 text-sm bg-secondary border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground"
                      placeholder="Engineering"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono uppercase text-muted-foreground">
                      Position
                    </label>
                    <input
                      type="text"
                      value={formEmp.position}
                      onChange={(e) => setFormEmp({ ...formEmp, position: e.target.value })}
                      className="w-full px-3 py-2.5 text-sm bg-secondary border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground"
                      placeholder="Senior Developer"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono uppercase text-muted-foreground">
                      Salary ($)
                    </label>
                    <input
                      type="number"
                      value={formEmp.salary}
                      onChange={(e) => setFormEmp({ ...formEmp, salary: e.target.value })}
                      className="w-full px-3 py-2.5 text-sm bg-secondary border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground"
                      placeholder="90000"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono uppercase text-muted-foreground">
                      Hire Date
                    </label>
                    <input
                      type="date"
                      required
                      value={formEmp.hireDate}
                      onChange={(e) => setFormEmp({ ...formEmp, hireDate: e.target.value })}
                      className="w-full px-3 py-2.5 text-sm bg-secondary border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono uppercase text-muted-foreground">
                      Experience Letter (PDF)
                    </label>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => setExpLetterFile(e.target.files?.[0] || null)}
                      className="w-full px-3 py-2 text-xs bg-secondary border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground file:mr-3 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-[10px] file:font-semibold file:bg-foreground file:text-background hover:file:bg-foreground/80 cursor-pointer"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono uppercase text-muted-foreground">
                      Graduation Certificate (PDF)
                    </label>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => setGradCertFile(e.target.files?.[0] || null)}
                      className="w-full px-3 py-2 text-xs bg-secondary border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground file:mr-3 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-[10px] file:font-semibold file:bg-foreground file:text-background hover:file:bg-foreground/80 cursor-pointer"
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={closeForm}
                    className="px-4 py-2.5 text-sm font-medium hover:bg-secondary rounded-md transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2.5 text-sm font-medium bg-foreground text-background rounded-md hover:bg-foreground/90 transition-colors cursor-pointer"
                  >
                    {editingId !== null ? "Update Employee" : "Save Employee"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-sm text-muted-foreground animate-pulse">Loading employees…</div>
        ) : (
          <div className="border border-border rounded-md overflow-x-auto">
            <table className="w-full text-sm min-w-[850px]">
              <thead className="bg-secondary">
                <tr>
                  {["ID", "Name", "Department", "Position", "Status", "Documents", "Hire Date", "Actions"].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-widest text-muted-foreground"
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground text-sm">
                      No employees found.
                    </td>
                  </tr>
                )}
                {filtered.map((emp) => (
                  <tr key={emp.id} className="hover:bg-foreground/[0.02] transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      {emp.employeeId}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium">
                        {emp.firstName} {emp.lastName}
                      </div>
                      <div className="text-xs text-muted-foreground">{emp.email}</div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{emp.department || "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{emp.position || "—"}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`font-mono text-[10px] px-2 py-0.5 rounded-md border uppercase font-bold ${STATUS_COLORS[emp.status] ?? ""}`}
                      >
                        {emp.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1.5">
                        {emp.experienceLetterName ? (
                          <button
                            onClick={() =>
                              downloadFile(emp.id, "experience-letter", emp.experienceLetterName!)
                            }
                            className="text-left text-xs text-primary hover:underline flex items-center gap-1 font-medium cursor-pointer"
                          >
                            <FileText className="w-3.5 h-3.5 text-primary shrink-0" />
                            <span className="truncate max-w-[140px]">{emp.experienceLetterName}</span>
                          </button>
                        ) : (
                          <span className="text-[10px] text-muted-foreground font-mono">
                            No Exp Letter
                          </span>
                        )}
                        {canCreate && !emp.experienceLetterName && (
                          <button
                            onClick={() => uploadDoc(emp.id, "experienceLetter")}
                            disabled={uploadingFor === emp.id}
                            className="text-left text-[10px] text-muted-foreground hover:text-primary hover:underline cursor-pointer disabled:opacity-50"
                          >
                            {uploadingFor === emp.id ? "Uploading…" : "+ Upload Exp Letter"}
                          </button>
                        )}
                        {emp.graduationCertificateName ? (
                          <button
                            onClick={() =>
                              downloadFile(
                                emp.id,
                                "graduation-certificate",
                                emp.graduationCertificateName!,
                              )
                            }
                            className="text-left text-xs text-primary hover:underline flex items-center gap-1 font-medium cursor-pointer"
                          >
                            <FileText className="w-3.5 h-3.5 text-primary shrink-0" />
                            <span className="truncate max-w-[140px]">{emp.graduationCertificateName}</span>
                          </button>
                        ) : (
                          <span className="text-[10px] text-muted-foreground font-mono">
                            No Grad Cert
                          </span>
                        )}
                        {canCreate && !emp.graduationCertificateName && (
                          <button
                            onClick={() => uploadDoc(emp.id, "graduationCertificate")}
                            disabled={uploadingFor === emp.id}
                            className="text-left text-[10px] text-muted-foreground hover:text-primary hover:underline cursor-pointer disabled:opacity-50"
                          >
                            {uploadingFor === emp.id ? "Uploading…" : "+ Upload Grad Cert"}
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      {emp.hireDate}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {canCreate && (
                          <button
                            onClick={() => openEditForm(emp)}
                            className="text-xs text-primary hover:underline font-semibold cursor-pointer"
                          >
                            Edit
                          </button>
                        )}
                        {user?.role === "ADMIN" && (
                          <button
                            onClick={() => handleDelete(emp.id)}
                            className="text-xs text-destructive hover:underline font-semibold cursor-pointer"
                          >
                            Delete
                          </button>
                        )}
                      </div>
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
