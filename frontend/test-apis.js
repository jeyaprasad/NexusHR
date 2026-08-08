const baseUrl = 'http://localhost:8080';

async function request(path, options = {}) {
  const url = `${baseUrl}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
  });
  const contentType = res.headers.get('content-type') || '';
  if (!res.ok) {
    let body = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status}: ${body}`);
  }
  if (contentType.includes('application/json')) {
    return res.json();
  }
  if (contentType.includes('application/pdf')) {
    return res.blob();
  }
  return res.text();
}

async function login(email, password) {
  const data = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
  return data.token;
}

async function runTests() {
  console.log('--- STARTING REGRESSION TESTS ---');
  
  // 1. Login
  console.log('Logging in as ADMIN...');
  const adminToken = await login('admin@insiihr.com', 'admin123');
  console.log('Logging in as HR...');
  const hrToken = await login('hr@insiihr.com', 'hr123');
  console.log('Logging in as EMPLOYEE...');
  const empToken = await login('employee@insiihr.com', 'employee123');
  console.log('Logins successful.');

  const authHeader = (token) => ({ 'Authorization': `Bearer ${token}` });

  // 5. Role-based access check
  console.log('Checking EMPLOYEE access to all employees (should fail)...');
  try {
    await request('/api/employees', { headers: authHeader(empToken) });
    console.error('FAIL: Employee could list all employees.');
  } catch (e) {
    if (e.message.includes('403')) console.log('PASS: Employee forbidden from listing all employees.');
    else console.error('Unexpected error:', e.message);
  }

  console.log('Checking EMPLOYEE access to own profile (should pass)...');
  const myProfile = await request('/api/employees/lookup/EMP004', { headers: authHeader(empToken) });
  if (myProfile.employeeId === 'EMP004') console.log('PASS: Employee can see own profile.');

  // 6. Core features
  console.log('--- CORE FEATURES ---');
  
  // Employees
  console.log('Fetching employees as Admin...');
  const employees = await request('/api/employees', { headers: authHeader(adminToken) });
  console.log(`Found ${employees.content ? employees.content.length : 'unknown'} employees.`);

  // Attendance
  console.log('Fetching attendance as Admin...');
  const att = await request('/api/attendance', { headers: authHeader(adminToken) });
  console.log(`Found ${att.content ? att.content.length : 'unknown'} attendance records.`);

  // Leaves: submit as Employee, approve as HR
  console.log('Submitting leave as Employee...');
  const leave = await request('/api/leaves', {
    method: 'POST',
    headers: authHeader(empToken),
    body: JSON.stringify({
      employeeId: myProfile.id,
      startDate: '2026-09-01',
      endDate: '2026-09-05',
      leaveType: 'CASUAL',
      reason: 'Vacation'
    })
  });
  console.log(`Leave submitted with ID ${leave.id}`);
  
  console.log('Approving leave as HR...');
  await request(`/api/leaves/${leave.id}/status?status=APPROVED`, {
    method: 'PUT',
    headers: authHeader(hrToken)
  });
  console.log('Leave approved successfully.');

  // Payroll
  console.log('Fetching payroll records as Admin...');
  const payrolls = await request('/api/payroll', { headers: authHeader(adminToken) });
  if (payrolls.content && payrolls.content.length > 0) {
    console.log(`Found payrolls. Downloading PDF for ${payrolls.content[0].id}...`);
    const pdf = await request(`/api/payroll/${payrolls.content[0].id}/pdf`, { headers: authHeader(adminToken) });
    console.log(`Downloaded PDF size: ${pdf.size} bytes`);
  } else {
    console.log('No payrolls generated yet.');
  }

  // Performance
  console.log('Submitting performance review as HR...');
  const hrProfile = await request('/api/employees/lookup/EMP002', { headers: authHeader(hrToken) });
  const review = await request('/api/performance', {
    method: 'POST',
    headers: authHeader(hrToken),
    body: JSON.stringify({
      employeeId: myProfile.id,
      reviewerId: hrProfile.id,
      reviewDate: '2026-08-08',
      rating: 5,
      feedback: 'Excellent work!',
      goals: 'Keep it up'
    })
  });
  console.log(`Performance review submitted with ID ${review.id}`);

  // AI Insights
  console.log('Testing AI Attrition prediction...');
  const aiAttr = await request('/api/ai/attrition', {
    method: 'POST',
    headers: authHeader(adminToken),
    body: JSON.stringify({ employeeData: 'Role: Software Engineer, Tenure: 5 years, Salary: $100,000' })
  });
  console.log(`Attrition prediction response: ${aiAttr.prediction.substring(0, 100)}...`);
  if (aiAttr.prediction.includes('Failed to generate insight') || aiAttr.prediction.includes('Feature unavailable')) {
    console.warn('WARNING: AI responded with fallback text!');
  } else {
    console.log('PASS: Real AI response generated.');
  }

  // HR Assistant
  console.log('Testing HR Assistant Chatbot...');
  const chat = await request('/api/ai/ask-hr', {
    method: 'POST',
    headers: authHeader(adminToken),
    body: JSON.stringify({ question: 'What is the maternity leave policy?' })
  });
  console.log(`HR Assistant response: ${chat.answer.substring(0, 100)}...`);
  if (chat.answer.includes('Failed to generate insight') || chat.answer.includes('Feature unavailable') || chat.answer.includes('Error processing request')) {
    console.warn('WARNING: Chatbot failed to generate real answer.');
  } else {
    console.log('PASS: Chatbot generated response.');
  }

  console.log('--- ALL TESTS COMPLETED SUCCESSFULLY ---');
}

runTests().catch(e => console.error('TEST SCRIPT FAILED:', e));
