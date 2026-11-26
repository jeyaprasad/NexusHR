export const MOCK_USERS: Record<string, { role: string; fullName: string; pass: string }> = {
  "admin@nexushr.com": { role: "ADMIN", fullName: "Karthik Subramanian (Admin)", pass: "admin123" },
  "hr@nexushr.com": { role: "HR", fullName: "Priya Natarajan (HR)", pass: "hr123" },
  "employee@nexushr.com": { role: "EMPLOYEE", fullName: "Anitha Murugesan", pass: "employee123" },
  "admin@insiihr.com": { role: "ADMIN", fullName: "Karthik Subramanian (Admin)", pass: "admin123" },
  "hr@insiihr.com": { role: "HR", fullName: "Priya Natarajan (HR)", pass: "hr123" },
  "employee@insiihr.com": { role: "EMPLOYEE", fullName: "Anitha Murugesan", pass: "employee123" },
};

export const MOCK_EMPLOYEES = [
  {
    id: 1,
    employeeId: "EMP001",
    firstName: "Karthik",
    lastName: "Subramanian",
    email: "admin@nexushr.com",
    phone: "+91 98765 43210",
    department: "Administration",
    position: "System Administrator & Architect",
    hireDate: "2023-01-15",
    salary: 120000,
    leaveBalance: 28,
    status: "ACTIVE",
    experienceLetterName: "EMP001_experience_letter.pdf",
    graduationCertificateName: "EMP001_degree_btech.pdf",
  },
  {
    id: 2,
    employeeId: "EMP002",
    firstName: "Priya",
    lastName: "Natarajan",
    email: "hr@nexushr.com",
    phone: "+91 98765 43211",
    department: "Human Resources",
    position: "HR Director",
    hireDate: "2024-03-01",
    salary: 95000,
    leaveBalance: 25,
    status: "ACTIVE",
    experienceLetterName: "EMP002_experience_letter.pdf",
    graduationCertificateName: "EMP002_mba_cert.pdf",
  },
  {
    id: 4,
    employeeId: "EMP004",
    firstName: "Anitha",
    lastName: "Murugesan",
    email: "employee@nexushr.com",
    phone: "+91 98765 43212",
    department: "Engineering",
    position: "Lead Cloud Engineer",
    hireDate: "2025-06-10",
    salary: 85000,
    leaveBalance: 22,
    status: "ACTIVE",
    experienceLetterName: "EMP004_aws_solutions_architect.pdf",
    graduationCertificateName: "EMP004_be_cse.pdf",
  },
  {
    id: 5,
    employeeId: "EMP005",
    firstName: "Rajesh",
    lastName: "Kannan",
    email: "rajesh.k@nexushr.com",
    phone: "+91 98765 43213",
    department: "Engineering",
    position: "Senior Frontend Engineer",
    hireDate: "2025-08-20",
    salary: 78000,
    leaveBalance: 26,
    status: "ACTIVE",
  },
  {
    id: 6,
    employeeId: "EMP006",
    firstName: "Deepa",
    lastName: "Lakshmi",
    email: "deepa.l@nexushr.com",
    phone: "+91 98765 43214",
    department: "Design",
    position: "Lead UI/UX Designer",
    hireDate: "2024-11-15",
    salary: 74000,
    leaveBalance: 30,
    status: "ACTIVE",
  },
  {
    id: 7,
    employeeId: "EMP007",
    firstName: "Vikramaditya",
    lastName: "Rao",
    email: "vikram.r@nexushr.com",
    phone: "+91 98765 43215",
    department: "Finance",
    position: "Senior Financial Analyst",
    hireDate: "2024-05-18",
    salary: 70000,
    leaveBalance: 24,
    status: "ACTIVE",
  },
];

export const MOCK_DASHBOARD_STATS = {
  totalEmployees: 38,
  activeEmployees: 36,
  pendingLeaveRequests: 3,
  onLeaveToday: 2,
  averageSalary: 86450,
  averagePerformanceRating: 4.6,
  departmentBreakdown: [
    { department: "Engineering", count: 18 },
    { department: "Human Resources", count: 5 },
    { department: "Product & Design", count: 7 },
    { department: "Finance & Legal", count: 5 },
    { department: "Administration", count: 3 },
  ],
  departmentDistribution: [
    { department: "Engineering", count: 18 },
    { department: "Human Resources", count: 5 },
    { department: "Product & Design", count: 7 },
    { department: "Finance & Legal", count: 5 },
    { department: "Administration", count: 3 },
  ],
  headcountHistory: [
    { date: "2026-11-20", active: 34, onLeave: 4 },
    { date: "2026-11-21", active: 35, onLeave: 3 },
    { date: "2026-11-22", active: 36, onLeave: 2 },
    { date: "2026-11-23", active: 36, onLeave: 2 },
    { date: "2026-11-24", active: 35, onLeave: 3 },
    { date: "2026-11-25", active: 36, onLeave: 2 },
    { date: "2026-11-26", active: 36, onLeave: 2 },
  ],
  leaveTypeBreakdown: [
    { month: "Nov 2026", type: "Casual Leave", count: 12 },
    { month: "Nov 2026", type: "Sick Leave", count: 5 },
    { month: "Nov 2026", type: "Earned Leave", count: 8 },
    { month: "Nov 2026", type: "Maternity / Parental", count: 2 },
  ],
  monthlyAttendance: [
    { month: "Jun", rate: 95 },
    { month: "Jul", rate: 96 },
    { month: "Aug", rate: 94 },
    { month: "Sep", rate: 97 },
    { month: "Oct", rate: 98 },
    { month: "Nov", rate: 96 },
  ],
  recentActivity: [
    { id: 101, action: "Leave Request Approved", entityType: "Leave", entityId: 1, performedBy: "Priya Natarajan (HR)", timestamp: "2026-11-26T09:30:00Z" },
    { id: 102, action: "Attendance Check-In Recorded", entityType: "Attendance", entityId: 4, performedBy: "Anitha Murugesan", timestamp: "2026-11-26T09:00:15Z" },
    { id: 103, action: "HR Policy Indexed in Vector DB", entityType: "HrPolicy", entityId: 1, performedBy: "Karthik Subramanian (Admin)", timestamp: "2026-11-25T18:20:00Z" },
    { id: 104, action: "Monthly Payroll Auto-Processed", entityType: "Payroll", entityId: 12, performedBy: "Priya Natarajan (HR)", timestamp: "2026-11-25T16:45:00Z" },
  ],
  recentAuditLogs: [
    { id: 101, action: "LEAVE_APPROVED", entityType: "Leave", performedBy: "Priya Natarajan (HR)", userEmail: "hr@nexushr.com", timestamp: "2026-11-26 09:30:00" },
    { id: 102, action: "CHECK_IN_RECORDED", entityType: "Attendance", performedBy: "Anitha Murugesan", userEmail: "employee@nexushr.com", timestamp: "2026-11-26 09:00:15" },
    { id: 103, action: "POLICY_INGESTED", entityType: "HrPolicy", performedBy: "Karthik Subramanian (Admin)", userEmail: "admin@nexushr.com", timestamp: "2026-11-25 18:20:00" },
  ],
};

export const MOCK_ATTENDANCE = [
  { id: 1, employeeId: 4, employeeName: "Anitha Murugesan", date: "2026-11-26", checkIn: "09:00:00", checkOut: null, hoursWorked: 4.5, overtimeHours: 0, lateMinutes: 0, status: "PRESENT", notes: "Regular check-in" },
  { id: 2, employeeId: 2, employeeName: "Priya Natarajan", date: "2026-11-26", checkIn: "08:45:00", checkOut: null, hoursWorked: 4.75, overtimeHours: 0, lateMinutes: 0, status: "PRESENT", notes: "Early arrival" },
  { id: 3, employeeId: 1, employeeName: "Karthik Subramanian", date: "2026-11-26", checkIn: "08:55:00", checkOut: null, hoursWorked: 4.6, overtimeHours: 0, lateMinutes: 0, status: "PRESENT", notes: "Infrastructure review" },
  { id: 4, employeeId: 5, employeeName: "Rajesh Kannan", date: "2026-11-26", checkIn: "09:15:00", checkOut: null, hoursWorked: 4.25, overtimeHours: 0, lateMinutes: 15, status: "LATE", notes: "Traffic delay" },
  { id: 5, employeeId: 6, employeeName: "Deepa Lakshmi", date: "2026-11-26", checkIn: null, checkOut: null, hoursWorked: 0, overtimeHours: 0, lateMinutes: 0, status: "ON_LEAVE", notes: "Casual leave" },
  { id: 6, employeeId: 7, employeeName: "Vikramaditya Rao", date: "2026-11-26", checkIn: "09:02:00", checkOut: null, hoursWorked: 4.5, overtimeHours: 0, lateMinutes: 2, status: "PRESENT", notes: "Normal check-in" },
];

export const MOCK_LEAVES = [
  { id: 1, employeeId: 4, employeeName: "Anitha Murugesan", startDate: "2026-12-01", endDate: "2026-12-03", leaveType: "CASUAL", status: "PENDING", reason: "Attending Cloud Architecture Conference", duration: 3, halfDay: false },
  { id: 2, employeeId: 2, employeeName: "Priya Natarajan", startDate: "2026-11-10", endDate: "2026-11-12", leaveType: "SICK", status: "APPROVED", reason: "Medical rest and recovery", duration: 3, halfDay: false },
  { id: 3, employeeId: 6, employeeName: "Deepa Lakshmi", startDate: "2026-11-26", endDate: "2026-11-26", leaveType: "CASUAL", status: "APPROVED", reason: "Personal family obligation", duration: 1, halfDay: false },
  { id: 4, employeeId: 5, employeeName: "Rajesh Kannan", startDate: "2026-12-15", endDate: "2026-12-18", leaveType: "ANNUAL", status: "PENDING", reason: "Year-end vacation", duration: 4, halfDay: false },
];

export const MOCK_PAYROLL = [
  { id: 1, employeeId: 1, employeeName: "Karthik Subramanian", payPeriod: "November 2026", basicSalary: 100000, allowances: 20000, deductions: 12000, netSalary: 108000, status: "PAID" },
  { id: 2, employeeId: 2, employeeName: "Priya Natarajan", payPeriod: "November 2026", basicSalary: 80000, allowances: 15000, deductions: 9500, netSalary: 85500, status: "PAID" },
  { id: 3, employeeId: 4, employeeName: "Anitha Murugesan", payPeriod: "November 2026", basicSalary: 72000, allowances: 13000, deductions: 8200, netSalary: 76800, status: "PAID" },
  { id: 4, employeeId: 5, employeeName: "Rajesh Kannan", payPeriod: "November 2026", basicSalary: 66000, allowances: 12000, deductions: 7500, netSalary: 70500, status: "PROCESSED" },
  { id: 5, employeeId: 6, employeeName: "Deepa Lakshmi", payPeriod: "November 2026", basicSalary: 62000, allowances: 12000, deductions: 7000, netSalary: 67000, status: "PROCESSED" },
];

export const MOCK_REVIEWS = [
  {
    id: 1,
    employeeId: 4,
    employeeName: "Anitha Murugesan",
    reviewerName: "Priya Natarajan",
    reviewDate: "2026-11-20",
    rating: 5,
    feedback: "Anitha consistently delivers top-tier distributed systems architecture and mentors team members effectively. Outstanding ownership.",
    goals: "Complete migration to native microservices and achieve 99.99% availability.",
    status: "COMPLETED",
    sentiment: "POSITIVE",
  },
  {
    id: 2,
    employeeId: 5,
    employeeName: "Rajesh Kannan",
    reviewerName: "Anitha Murugesan",
    reviewDate: "2026-11-15",
    rating: 4,
    feedback: "Great work on modernizing the UI components and improving frontend web vitals. Ready for broader project leadership.",
    goals: "Master SSR hydration optimizations with TanStack Start.",
    status: "COMPLETED",
    sentiment: "POSITIVE",
  },
];

export const MOCK_GOALS = [
  {
    id: 1,
    employeeId: 4,
    employeeName: "Anitha Murugesan",
    title: "Scale RAG Engine to 99.9% Uptime",
    description: "Optimize pgvector indexing and cache high-frequency policy prompts.",
    targetValue: 100,
    currentValue: 85,
    category: "PROJECT",
    startDate: "2026-07-01",
    targetDate: "2026-12-31",
    status: "IN_PROGRESS",
    progress: 85,
  },
  {
    id: 2,
    employeeId: 2,
    employeeName: "Priya Natarajan",
    title: "Automate Monthly Statutory Payroll",
    description: "Implement multi-tier tax brackets and OpenPDF direct payslip delivery.",
    targetValue: 100,
    currentValue: 100,
    category: "PROJECT",
    startDate: "2026-01-01",
    targetDate: "2026-06-30",
    status: "ACHIEVED",
    progress: 100,
  },
];

export const MOCK_FEEDBACK = [
  {
    id: 1,
    employeeId: 4,
    employeeName: "Anitha Murugesan",
    reviewerId: 5,
    reviewerName: "Rajesh Kannan",
    period: "Q4 2026",
    dueDate: "2026-12-15",
    status: "PENDING",
    relationship: "PEER",
  },
  {
    id: 2,
    employeeId: 2,
    employeeName: "Priya Natarajan",
    reviewerId: 1,
    reviewerName: "Karthik Subramanian",
    period: "Q3 2026",
    dueDate: "2026-09-30",
    status: "COMPLETED",
    relationship: "MANAGER",
  },
];

export const MOCK_WORKFORCE_INSIGHTS = {
  totalEmployees: 38,
  avgAttritionRisk: 0.17,
  avgEngagement: 0.85,
  highRiskCount: 2,
  departmentBreakdown: [
    { department: "Engineering", count: 18 },
    { department: "Human Resources", count: 5 },
    { department: "Product", count: 8 },
    { department: "Finance", count: 4 },
    { department: "Design", count: 3 },
  ],
};

export function handleMockApiRequest(path: string, options: RequestInit = {}): Response | null {
  const method = (options.method || "GET").toUpperCase();
  const url = path.split("?")[0];

  // Auth Login
  if (url === "/api/auth/login" && method === "POST") {
    try {
      const body = JSON.parse(options.body as string || "{}");
      const normalizedEmail = (body.email || "").toLowerCase().trim();
      const enteredPass = (body.password || "").trim();

      let user = MOCK_USERS[normalizedEmail];
      if (!user) {
        if (normalizedEmail.includes("admin")) {
          user = MOCK_USERS["admin@nexushr.com"];
        } else if (normalizedEmail.includes("hr")) {
          user = MOCK_USERS["hr@nexushr.com"];
        } else if (normalizedEmail.includes("employee") || normalizedEmail.includes("emp")) {
          user = MOCK_USERS["employee@nexushr.com"];
        }
      }

      if (user && (user.pass === enteredPass || enteredPass === "admin123" || enteredPass === "hr123" || enteredPass === "employee123" || enteredPass.toLowerCase() === user.pass.toLowerCase())) {
        return new Response(JSON.stringify({
          token: "mock-jwt-token-" + Date.now(),
          refreshToken: "mock-refresh-token-" + Date.now(),
          email: normalizedEmail || "admin@nexushr.com",
          fullName: user.fullName,
          role: user.role,
        }), { status: 200, headers: { "Content-Type": "application/json" } });
      }
      return new Response(JSON.stringify({ error: "Invalid credentials", message: "Invalid email or password" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    } catch {
      return null;
    }
  }

  // Auth Register
  if (url === "/api/auth/register" && method === "POST") {
    try {
      const body = JSON.parse(options.body as string || "{}");
      return new Response(JSON.stringify({
        token: "mock-jwt-token-" + Date.now(),
        refreshToken: "mock-refresh-token-" + Date.now(),
        email: body.email,
        fullName: body.fullName || "New User",
        role: body.role || "EMPLOYEE",
      }), { status: 200, headers: { "Content-Type": "application/json" } });
    } catch {
      return null;
    }
  }

  // Dashboard Stats
  if (url === "/api/dashboard/stats" || url === "/api/dashboard") {
    return new Response(JSON.stringify(MOCK_DASHBOARD_STATS), { status: 200, headers: { "Content-Type": "application/json" } });
  }

  // Employees
  if (url === "/api/employees") {
    if (method === "GET") {
      return new Response(JSON.stringify({ content: MOCK_EMPLOYEES, totalElements: MOCK_EMPLOYEES.length }), { status: 200, headers: { "Content-Type": "application/json" } });
    }
  }

  // Attendance
  if (url === "/api/attendance") {
    return new Response(JSON.stringify({ content: MOCK_ATTENDANCE, totalElements: MOCK_ATTENDANCE.length }), { status: 200, headers: { "Content-Type": "application/json" } });
  }

  if (url.startsWith("/api/attendance/auto-process")) {
    return new Response(JSON.stringify({ message: "Attendance auto-processed for today successfully" }), { status: 200, headers: { "Content-Type": "application/json" } });
  }

  // Leaves
  if (url === "/api/leaves") {
    if (method === "POST") {
      try {
        const body = JSON.parse(options.body as string || "{}");
        const newLeave = {
          id: MOCK_LEAVES.length + 1,
          employeeId: 4,
          employeeName: "Anitha Murugesan",
          leaveType: body.leaveType || "CASUAL",
          startDate: body.startDate || "2026-12-01",
          endDate: body.endDate || "2026-12-02",
          reason: body.reason || "Personal work",
          status: "PENDING",
        };
        MOCK_LEAVES.unshift(newLeave);
        return new Response(JSON.stringify(newLeave), { status: 201, headers: { "Content-Type": "application/json" } });
      } catch {
        return new Response(JSON.stringify({ status: "PENDING" }), { status: 201, headers: { "Content-Type": "application/json" } });
      }
    }
    return new Response(JSON.stringify({ content: MOCK_LEAVES, totalElements: MOCK_LEAVES.length }), { status: 200, headers: { "Content-Type": "application/json" } });
  }

  if (url.startsWith("/api/leaves/") && url.includes("/status")) {
    return new Response(JSON.stringify({ message: "Leave status updated successfully" }), { status: 200, headers: { "Content-Type": "application/json" } });
  }

  // Payroll
  if (url === "/api/payroll") {
    return new Response(JSON.stringify({ content: MOCK_PAYROLL, totalElements: MOCK_PAYROLL.length }), { status: 200, headers: { "Content-Type": "application/json" } });
  }

  if (url.startsWith("/api/payroll/batch")) {
    return new Response(JSON.stringify({ message: "Monthly payroll batch processed for all active employees" }), { status: 200, headers: { "Content-Type": "application/json" } });
  }

  if (url.includes("/payslip")) {
    const dummyPdfContent = "%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj 2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj 3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<<>>>>endobj\nxref\n0 4\n0000000000 65535 f\n0000000009 00000 n\n0000000052 00000 n\n0000000101 00000 n\ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n178\n%%EOF";
    return new Response(dummyPdfContent, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="payslip.pdf"',
      },
    });
  }

  // Performance
  if (url === "/api/performance") {
    return new Response(JSON.stringify({ content: MOCK_REVIEWS, totalElements: MOCK_REVIEWS.length }), { status: 200, headers: { "Content-Type": "application/json" } });
  }

  // Goals
  if (url.startsWith("/api/goals")) {
    return new Response(JSON.stringify(MOCK_GOALS), { status: 200, headers: { "Content-Type": "application/json" } });
  }

  // Feedback
  if (url.startsWith("/api/feedback")) {
    return new Response(JSON.stringify(MOCK_FEEDBACK), { status: 200, headers: { "Content-Type": "application/json" } });
  }

  // AI Workforce
  if (url === "/api/ai/workforce") {
    return new Response(JSON.stringify(MOCK_WORKFORCE_INSIGHTS), { status: 200, headers: { "Content-Type": "application/json" } });
  }

  // Policy Upload
  if (url === "/api/ai/policy-upload" && method === "POST") {
    return new Response(JSON.stringify({ message: "Policy document uploaded, parsed, and embedded in vector store successfully." }), { status: 200, headers: { "Content-Type": "application/json" } });
  }

  // Employee import & documents
  if (url === "/api/employees/import") {
    return new Response(JSON.stringify({ count: 3, message: "Employees imported successfully" }), { status: 200, headers: { "Content-Type": "application/json" } });
  }

  if (url.includes("/documents")) {
    return new Response(JSON.stringify({ message: "Document uploaded successfully" }), { status: 200, headers: { "Content-Type": "application/json" } });
  }

  // RAG Ask HR
  if (url === "/api/ai/ask-hr" && method === "POST") {
    const question = options.body ? JSON.parse(options.body as string).question || "" : "";
    let answer = "According to the NexusHR Comprehensive Policy Handbook:\n\n- **Standard Work Hours**: 9:00 AM to 6:00 PM, Monday through Friday, with flexible hybrid options.\n- **Annual Paid Leave**: Full-time employees receive 30 days of paid leave per calendar year (accrued monthly).\n- **Sick Leave**: Up to 12 paid sick days per year, with medical certificate required for absences exceeding 2 consecutive days.\n- **Health Coverage**: Comprehensive medical insurance covering inpatient hospitalisation up to \$500,000 for employee, spouse, and dependents.\n- **Professional Growth**: Up to \$1,500 annual tuition/certification reimbursement.";
    if (question.toLowerCase().includes("maternity") || question.toLowerCase().includes("paternity")) {
      answer = "Under NexusHR Parental Leave Policies:\n\n- **Maternity Leave**: Up to 26 weeks of fully paid leave for eligible birthing mothers, with flexible phased return-to-work.\n- **Paternity Leave**: 4 weeks of fully paid leave for fathers and secondary caregivers, usable within the first 12 months.";
    } else if (question.toLowerCase().includes("payroll") || question.toLowerCase().includes("salary")) {
      answer = "Under NexusHR Compensation & Statutory Compliance:\n\n- Payroll is processed monthly on the 28th.\n- Automatic progressive statutory tax and social security deductions are calculated and itemized on your PDF payslip.\n- Download official payslips anytime under the **Payroll** tab.";
    }
    return new Response(JSON.stringify({ answer }), { status: 200, headers: { "Content-Type": "application/json" } });
  }

  // AI Attrition Prediction
  if (url === "/api/ai/attrition" && method === "POST") {
    const prediction = "1) Risk Level: Low (14% probability)\n\n2) Key Risk Factors:\n- Strong tenure and steady progression\n- Healthy leave utilization ratio (18/30 days)\n- Consistently positive manager reviews\n\n3) Recommended Retention Actions:\n- Nominate for upcoming leadership excellence track\n- Offer stretch technical architecture assignment\n- Continue regular quarterly 1-on-1 check-ins";
    return new Response(JSON.stringify({ prediction }), { status: 200, headers: { "Content-Type": "application/json" } });
  }

  // AI Skill Gap
  if (url === "/api/ai/skill-gap" && method === "POST") {
    const analysis = "1) Current Skills: Java, Spring Boot, RESTful Architecture, Docker\n\n2) Required Skills for Target Role:\n- Distributed Event Streaming (Apache Kafka)\n- Kubernetes Production Orchestration\n- System Reliability Engineering (SRE) principles\n\n3) Identified Skill Gaps:\n- Advanced Kafka partitioning & consumer group tuning\n- Multi-region disaster recovery runbooks\n\n4) Recommended Learning Resources:\n- Certified Kubernetes Administrator (CKA)\n- Confluent Certified Distributed Systems Developer";
    return new Response(JSON.stringify({ analysis }), { status: 200, headers: { "Content-Type": "application/json" } });
  }

  // AI Engagement Scoring
  if (url === "/api/ai/engagement" && method === "POST") {
    const score = "1) Engagement Score: 88/100\n\n2) Engagement Level: Highly Engaged\n\n3) Top Engagement Drivers:\n- High attendance consistency (98.5% present rate)\n- Exceptional peer review ratings (4.8/5 average)\n- Proactive contribution in cross-functional projects\n\n4) Top Engagement Risks:\n- High workload in sprint cycles\n\n5) Recommended Actions:\n- Balance technical project allocation\n- Public recognition in monthly team showcase";
    return new Response(JSON.stringify({ score }), { status: 200, headers: { "Content-Type": "application/json" } });
  }

  // CSV Export
  if (url.startsWith("/api/export/")) {
    const type = url.split("/api/export/")[1];
    const csvContent = `ID,Employee,Metric,Status,Date\n1,Karthik Subramanian,100,ACTIVE,2026-11-26\n2,Priya Natarajan,100,ACTIVE,2026-11-26\n4,Anitha Murugesan,100,ACTIVE,2026-11-26\n`;
    return new Response(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="${type}.csv"`,
      },
    });
  }

  return null;
}
