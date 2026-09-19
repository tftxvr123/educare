// app.js — Educare Production Core LMS Controller

const DEFAULT_STATE = {
  currentUser: {
    email: "student@educare.local",
    name: "Jane Student",
    role: "STUDENT",
    sessionId: "sess_student_init_1",
    registeredAt: "2026-01-15T09:00:00.000Z"
  },
  users: [
    { id: "u-1", name: "Jane Student", email: "student@educare.local", role: "STUDENT", active: true, activeSessionId: "sess_student_init_1" },
    { id: "u-2", name: "Prof. Alan Turing", email: "instructor@educare.local", role: "INSTRUCTOR", active: true, activeSessionId: "sess_inst_init_1" },
    { id: "u-3", name: "Course Admin", email: "admin@educare.local", role: "ADMIN", active: true, activeSessionId: "sess_admin_init_1" },
    { id: "u-4", name: "Director Super Admin", email: "superadmin@educare.local", role: "SUPER_ADMIN", active: true, activeSessionId: "sess_super_init_1" }
  ],
  courses: INITIAL_COURSES,
  liveClasses: INITIAL_LIVE_CLASSES,
  enrollments: [
    {
      id: "enr-mech-1",
      userId: "student@educare.local",
      courseId: "c-mechanical",
      enrolledAt: "2026-02-01T10:00:00.000Z",
      expiresAt: "2027-02-01T10:00:00.000Z",
      status: "ACTIVE", // ACTIVE, EXPIRED, REFUND_REQUESTED, REFUNDED
      transactionId: "TXN-2026-8812",
      amountPaid: 6499,
      invoiceNumber: "INV-2026-1001"
    }
  ],
  purchases: [
    {
      id: "pur-1",
      invoiceNumber: "INV-2026-1001",
      userId: "student@educare.local",
      studentName: "Jane Student",
      courseId: "c-mechanical",
      courseTitle: "Mechanical: Industrial HVAC & Thermal Design",
      amount: 6499,
      tax: 1170, // 18% GST simulation
      total: 7669,
      paymentMethod: "UPI / Razorpay Gateway",
      paymentStatus: "PAID",
      transactionId: "TXN-2026-8812",
      paidAt: "2026-02-01T10:00:00.000Z"
    }
  ],
  progress: {
    "student@educare.local": {
      "l-m-1": { seconds: 46, completed: true, updatedAt: "2026-02-02T12:00:00.000Z" },
      "l-m-2": { seconds: 5, completed: true, updatedAt: "2026-02-03T12:00:00.000Z" },
      "l-m-3": { seconds: 10, completed: true, updatedAt: "2026-02-04T12:00:00.000Z" },
      "l-m-4": { seconds: 46, completed: true, updatedAt: "2026-02-05T12:00:00.000Z" },
      "l-m-5": { seconds: 5, completed: true, updatedAt: "2026-02-06T12:00:00.000Z" }
    }
  },
  quizAttempts: {
    "student@educare.local": {
      "q-m-1": { score: 100, passed: true, attemptedAt: "2026-02-07T14:00:00.000Z" }
    }
  },
  auditLogs: [
    { id: "log-1", event: "SYSTEM_INITIALIZED", actor: "system", timestamp: "2026-01-01T00:00:00.000Z", details: "LMS Production Phase Initialized" }
  ]
};

function logAuditEvent(event, details) {
  const actor = state.currentUser ? `${state.currentUser.name} (${state.currentUser.email})` : "Anonymous Visitor";
  state.auditLogs.unshift({
    id: "log-" + Date.now(),
    event,
    actor,
    timestamp: new Date().toISOString(),
    details
  });
  if (state.auditLogs.length > 200) state.auditLogs.pop();
  saveState();
}

function loadState() {
  const stored = localStorage.getItem("educare_prod_v2");
  if (!stored) {
    localStorage.setItem("educare_prod_v2", JSON.stringify(DEFAULT_STATE));
    return JSON.parse(JSON.stringify(DEFAULT_STATE));
  }
  return JSON.parse(stored);
}

function saveState() {
  localStorage.setItem("educare_prod_v2", JSON.stringify(state));
}

function resetDemoState() {
  if (confirm("Reset the LMS to initial demo state? All local modifications will be restored to production defaults.")) {
    localStorage.removeItem("educare_prod_v2");
    state = JSON.parse(JSON.stringify(DEFAULT_STATE));
    saveState();
    navigate('home');
  }
}

let state = loadState();
let currentRoute = 'home';
let routeParams = {};
let pendingCheckoutCourse = null;

// Enforce single active device/session
function checkSingleDeviceSession() {
  if (!state.currentUser) return true;
  const userRecord = state.users.find(u => u.email === state.currentUser.email);
  if (!userRecord) return true;
  if (userRecord.activeSessionId && userRecord.activeSessionId !== state.currentUser.sessionId) {
    alert("Session Expired: You have signed in from another browser or device. Educare allows only 1 active session per student.");
    logout(true);
    return false;
  }
  return true;
}

// Auth Handlers
function generateSessionId() {
  return "sess_" + Math.random().toString(36).substring(2, 9) + "_" + Date.now();
}

function quickAuth(roleType) {
  const sessId = generateSessionId();
  if (roleType === 'superadmin') {
    state.currentUser = { email: "superadmin@educare.local", name: "Director Super Admin", role: "SUPER_ADMIN", sessionId: sessId };
  } else if (roleType === 'admin') {
    state.currentUser = { email: "admin@educare.local", name: "Course Admin", role: "ADMIN", sessionId: sessId };
  } else if (roleType === 'instructor') {
    state.currentUser = { email: "instructor@educare.local", name: "Prof. Alan Turing", role: "INSTRUCTOR", sessionId: sessId };
  } else {
    state.currentUser = { email: "student@educare.local", name: "Jane Student", role: "STUDENT", sessionId: sessId };
  }

  // Update session token in user master
  const u = state.users.find(user => user.email === state.currentUser.email);
  if (u) u.activeSessionId = sessId;

  logAuditEvent("USER_LOGIN", `Signed in with role: ${state.currentUser.role}`);
  saveState();
  toggleAuthModal(false);
  renderNav();
  navigate(currentRoute, routeParams);
}

function handleGoogleAuth() {
  const dummyGoogleEmail = prompt("Enter your Google / Gmail account address:", "jane.engineer@gmail.com");
  if (!dummyGoogleEmail) return;

  const sessId = generateSessionId();
  const normalizedEmail = dummyGoogleEmail.trim().toLowerCase();
  let existing = state.users.find(u => u.email === normalizedEmail);

  if (!existing) {
    existing = {
      id: "u-" + Date.now(),
      name: normalizedEmail.split('@')[0].replace('.', ' ').toUpperCase(),
      email: normalizedEmail,
      role: "STUDENT",
      active: true,
      activeSessionId: sessId
    };
    state.users.push(existing);
  } else {
    existing.activeSessionId = sessId;
  }

  state.currentUser = {
    email: existing.email,
    name: existing.name,
    role: existing.role,
    sessionId: sessId
  };

  logAuditEvent("GOOGLE_OAUTH_LOGIN", `Authenticated via Google: ${normalizedEmail}`);
  saveState();
  toggleAuthModal(false);
  renderNav();
  navigate(currentRoute, routeParams);
}

function handleCustomLogin() {
  const emailInput = document.getElementById("auth-email").value.trim().toLowerCase();
  if (!emailInput) return;

  const sessId = generateSessionId();
  let existing = state.users.find(u => u.email === emailInput);

  if (!existing) {
    let assignedRole = "STUDENT";
    if (emailInput.includes("superadmin")) assignedRole = "SUPER_ADMIN";
    else if (emailInput.includes("admin")) assignedRole = "ADMIN";
    else if (emailInput.includes("instructor")) assignedRole = "INSTRUCTOR";

    existing = {
      id: "u-" + Date.now(),
      name: emailInput.split('@')[0],
      email: emailInput,
      role: assignedRole,
      active: true,
      activeSessionId: sessId
    };
    state.users.push(existing);
  }

  if (!existing.active) {
    alert("This account has been deactivated by the Administration.");
    return;
  }

  existing.activeSessionId = sessId;
  state.currentUser = {
    email: existing.email,
    name: existing.name,
    role: existing.role,
    sessionId: sessId
  };

  logAuditEvent("EMAIL_LOGIN", `Custom login: ${emailInput} as ${existing.role}`);
  saveState();
  toggleAuthModal(false);
  renderNav();
  navigate(currentRoute, routeParams);
}

function logout(silent = false) {
  if (state.currentUser && !silent) {
    logAuditEvent("USER_LOGOUT", `User logged out: ${state.currentUser.email}`);
  }
  state.currentUser = null;
  saveState();
  renderNav();
  navigate('home');
}

function toggleAuthModal(show) {
  const modal = document.getElementById("auth-modal");
  modal.classList.toggle("hidden", !show);
  modal.classList.toggle("flex", show);
}

// Navigation & Role Guards
function renderNav() {
  const authDiv = document.getElementById("auth-buttons");
  const studentBtn = document.getElementById("nav-student-btn");
  const instructorBtn = document.getElementById("nav-instructor-btn");
  const adminBtn = document.getElementById("nav-admin-btn");
  const superAdminBtn = document.getElementById("nav-superadmin-btn");

  if (state.currentUser) {
    studentBtn.classList.toggle("hidden", state.currentUser.role !== 'STUDENT');
    instructorBtn.classList.toggle("hidden", state.currentUser.role !== 'INSTRUCTOR');
    adminBtn.classList.toggle("hidden", state.currentUser.role !== 'ADMIN' && state.currentUser.role !== 'SUPER_ADMIN');
    if (superAdminBtn) {
      superAdminBtn.classList.toggle("hidden", state.currentUser.role !== 'SUPER_ADMIN');
    }

    authDiv.innerHTML = `
      <div class="flex items-center space-x-3">
        <span class="text-xs bg-slate-100 border border-slate-200 text-slate-700 px-2.5 py-1 rounded-full font-medium">
          ${state.currentUser.name} <span class="font-bold text-blue-600">(${state.currentUser.role})</span>
        </span>
        <button onclick="logout()" class="text-xs font-semibold text-rose-600 hover:text-rose-700">Logout</button>
      </div>
    `;
  } else {
    studentBtn.classList.add("hidden");
    instructorBtn.classList.add("hidden");
    adminBtn.classList.add("hidden");
    if (superAdminBtn) superAdminBtn.classList.add("hidden");
    authDiv.innerHTML = `
      <button onclick="toggleAuthModal(true)" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition shadow-sm">
        Sign In
      </button>
    `;
  }
  lucide.createIcons();
}

function navigate(route, params = {}) {
  if (!checkSingleDeviceSession()) return;
  if (progressTimer) {
    clearInterval(progressTimer);
    progressTimer = null;
  }
  currentRoute = route;
  routeParams = params;
  renderNav();

  const app = document.getElementById("app");
  if (route === 'home') app.innerHTML = renderHomeView();
  else if (route === 'courses') app.innerHTML = renderCoursesView();
  else if (route === 'course-detail') app.innerHTML = renderCourseDetailView(params.courseId);
  else if (route === 'learn') app.innerHTML = renderLearnView(params.courseId, params.lectureId);
  else if (route === 'dashboard') app.innerHTML = renderStudentDashboardView();
  else if (route === 'instructor') app.innerHTML = renderInstructorDashboardView();
  else if (route === 'admin') app.innerHTML = renderAdminView();

  window.scrollTo(0, 0);
  lucide.createIcons();
}

// -------------------------------------------------------------
// VIEWS
// -------------------------------------------------------------
function renderHomeView() {
  const p = POLICIES_DATA.institution;
  return `
    <section class="bg-slate-900 text-white py-20 px-4 text-center">
      <div class="max-w-4xl mx-auto space-y-6">
        <span class="inline-block text-xs uppercase tracking-widest px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full border border-emerald-400/30 font-semibold">
          Accredited Professional Engineering Platform
        </span>
        <h1 class="text-4xl md:text-6xl font-extrabold tracking-tight">
          Transform Your Future. <br><span class="text-blue-400">Empower Your Ambition with Educare.</span>
        </h1>
        <p class="text-slate-400 text-base md:text-lg max-w-2xl mx-auto">
          Access comprehensive, expert-crafted courses designed for real-world mastery. Learn at your own pace with structured video lectures, downloadable guides, live interactive classes, and verifiable certificates.
        </p>
        <div class="flex justify-center gap-4 pt-4">
          <button onclick="navigate('courses')" class="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition shadow-lg flex items-center gap-2">
            Explore 4 Core Programs →
          </button>
          ${
            state.currentUser?.role === 'SUPER_ADMIN' || state.currentUser?.role === 'ADMIN'
              ? `<button onclick="navigate('admin')" class="px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-xl transition">Admin Control Panel</button>`
              : state.currentUser?.role === 'INSTRUCTOR'
              ? `<button onclick="navigate('instructor')" class="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition">Instructor Studio</button>`
              : `<button onclick="navigate('dashboard')" class="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl border border-slate-700 transition">Student Dashboard</button>`
          }
        </div>
      </div>
    </section>

    <!-- Institution Overview & Metrics -->
    <section class="bg-white border-b border-slate-200 py-12 px-4">
      <div class="max-w-6xl mx-auto grid md:grid-cols-2 gap-8 items-center">
        <div>
          <span class="text-xs uppercase font-bold text-blue-600 tracking-wider">About Our Training Academy</span>
          <h2 class="text-2xl font-bold text-slate-900 mt-1">${p.name}</h2>
          <p class="text-slate-600 text-sm mt-3 leading-relaxed">${p.about}</p>
          <div class="mt-4 text-xs text-slate-500 font-mono">Accreditation ID: ${p.regNumber}</div>
        </div>
        <div class="grid grid-cols-2 gap-4">
          ${p.stats.map(s => `
            <div class="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div class="text-xl font-extrabold text-blue-600">${s.value}</div>
              <div class="text-xs text-slate-500 mt-1">${s.label}</div>
            </div>
          `).join('')}
        </div>
      </div>
    </section>

    <!-- Announcements Notice Board -->
    <section class="max-w-6xl mx-auto px-4 pt-12">
      <div class="bg-blue-50 border border-blue-200 rounded-2xl p-6">
        <div class="flex items-center gap-2 mb-4">
          <i data-lucide="bell" class="w-5 h-5 text-blue-600"></i>
          <h3 class="font-bold text-slate-900 text-base">Institute Notice Board & Live Schedules</h3>
        </div>
        <div class="grid md:grid-cols-2 gap-4">
          ${POLICIES_DATA.announcements.map(a => `
            <div class="bg-white p-4 rounded-xl border border-blue-100 shadow-sm">
              <div class="flex items-center justify-between text-[11px] mb-1">
                <span class="bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded">${a.badge}</span>
                <span class="text-slate-400 font-medium">${a.date}</span>
              </div>
              <h4 class="font-bold text-sm text-slate-900 mt-1">${a.title}</h4>
              <p class="text-xs text-slate-600 mt-1 leading-relaxed">${a.content}</p>
            </div>
          `).join('')}
        </div>
      </div>
    </section>

    <!-- Available Launch Courses -->
    <section class="max-w-7xl mx-auto px-4 py-16">
      <div class="flex justify-between items-end mb-6">
        <div>
          <h2 class="text-2xl font-bold text-slate-900">Core Engineering Programs</h2>
          <p class="text-slate-500 text-sm">Select a course to view modules, video lectures, and instructor details.</p>
        </div>
        <button onclick="navigate('courses')" class="text-blue-600 font-semibold hover:underline text-xs">View Full Catalog →</button>
      </div>
      <div class="grid md:grid-cols-2 gap-6">
        ${state.courses.map(courseCardHtml).join('')}
      </div>
    </section>
  `;
}

function renderCoursesView() {
  return `
    <div class="max-w-7xl mx-auto px-4 py-12">
      <div class="mb-8">
        <h1 class="text-3xl font-extrabold text-slate-900">Engineering Programs Catalog</h1>
        <p class="text-slate-500 text-sm mt-1">Enroll online for 365 days of unrestricted access to video modules, reference material, and live interactive classes.</p>
      </div>
      <div class="grid md:grid-cols-2 gap-6">
        ${state.courses.map(courseCardHtml).join('')}
      </div>
    </div>
  `;
}

function courseCardHtml(c) {
  const enrollment = state.currentUser ? state.enrollments.find(e => e.userId === state.currentUser.email && e.courseId === c.id) : null;
  const isEnrolled = !!enrollment && enrollment.status === 'ACTIVE';
  const lectureCount = c.sections.reduce((acc, s) => acc + s.lectures.length, 0);

  return `
    <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition">
      <div>
        <div class="flex justify-between items-center mb-3">
          ${
            isEnrolled
              ? '<span class="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full">✓ Enrolled & Active</span>'
              : '<span class="text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full">1-Year Validity</span>'
          }
          <span class="text-xs text-slate-400 font-medium">${c.discipline}</span>
        </div>
        <h3 class="font-bold text-xl text-slate-900">${c.title}</h3>
        <p class="text-xs text-blue-600 font-semibold mt-0.5">${c.instructorName}</p>
        <p class="text-slate-500 text-xs mt-2 leading-relaxed">${c.shortDescription}</p>
        <div class="mt-4 flex items-center gap-3 text-xs text-slate-400">
          <span>${c.sections.length} Modules</span>
          <span>•</span>
          <span>${lectureCount} Lessons</span>
          <span>•</span>
          <span class="font-bold text-slate-900 text-sm">₹${c.price.toLocaleString('en-IN')}</span>
        </div>
      </div>

      <div class="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
        <span class="text-xs text-slate-500">Access: 365 Days</span>
        ${
          isEnrolled
            ? `<button onclick="startLearning('${c.id}')" class="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition">
                 Continue Learning →
               </button>`
            : `<button onclick="navigate('course-detail', { courseId: '${c.id}' })" class="px-5 py-2.5 bg-slate-900 hover:bg-blue-600 text-white text-xs font-bold rounded-xl transition">
                 View &amp; Enroll
               </button>`
        }
      </div>
    </div>
  `;
}

function renderCourseDetailView(courseId) {
  const course = state.courses.find(c => c.id === courseId);
  if (!course) return `<div class="p-8">Course not found.</div>`;

  const enrollment = state.currentUser ? state.enrollments.find(e => e.userId === state.currentUser.email && e.courseId === course.id) : null;
  const isEnrolled = !!enrollment && enrollment.status === 'ACTIVE';
  const totalLectures = course.sections.reduce((acc, s) => acc + s.lectures.length, 0);

  return `
    <div class="max-w-5xl mx-auto px-4 py-12 space-y-8">
      <div class="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between gap-8">
        <div class="space-y-4 max-w-2xl">
          ${
            isEnrolled
              ? '<div class="inline-block text-xs font-bold bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full">✓ You Own This Course (Validity: 365 Days)</div>'
              : '<div class="inline-block text-xs font-bold bg-blue-50 text-blue-700 px-3 py-1 rounded-full">Accredited Engineering Program</div>'
          }
          <h1 class="text-3xl font-extrabold text-slate-900">${course.title}</h1>
          <p class="text-slate-600 text-sm leading-relaxed">${course.description}</p>
          <div class="text-xs text-slate-500 font-medium flex flex-wrap items-center gap-4">
            <span>Faculty: <strong class="text-slate-800">${course.instructorName}</strong></span>
            <span>•</span>
            <span>${course.sections.length} Modules</span>
            <span>•</span>
            <span>${totalLectures} Video Lessons</span>
            <span>•</span>
            <span>Completion Certificate Included</span>
          </div>
        </div>

        <div class="bg-slate-50 p-6 rounded-xl border border-slate-200 text-center flex flex-col justify-between min-w-[240px]">
          <div>
            <span class="text-[11px] font-bold uppercase text-slate-500">Program Fee</span>
            <div class="text-3xl font-black text-slate-900 mt-1">₹${course.price.toLocaleString('en-IN')}</div>
            <p class="text-[11px] text-slate-400 mt-1">+18% GST • 365 Days Access</p>
          </div>
          ${
            isEnrolled
              ? `<button onclick="startLearning('${course.id}')" class="w-full mt-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl shadow transition">
                   Watch All Lessons →
                 </button>`
              : `<button onclick="openCheckoutModal('${course.id}')" class="w-full mt-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow transition">
                   Enroll Online
                 </button>`
          }
        </div>
      </div>

      <!-- Curriculum breakdown -->
      <div class="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <h2 class="text-xl font-bold text-slate-900">Curriculum Structure</h2>
        <div class="space-y-4">
          ${course.sections.map((section, sIdx) => `
            <div class="border border-slate-200 rounded-xl overflow-hidden">
              <div class="bg-slate-50 px-4 py-3 font-semibold text-xs text-slate-700 flex justify-between">
                <span>Module ${sIdx + 1}: ${section.title}</span>
                <span>${section.lectures.length} lessons</span>
              </div>
              <div class="divide-y divide-slate-100">
                ${section.lectures.map(lecture => `
                  <div class="px-4 py-3.5 flex items-center justify-between text-sm hover:bg-slate-50">
                    <div class="flex items-center space-x-3">
                      <i data-lucide="${isEnrolled ? 'play-circle' : 'lock'}" class="w-4 h-4 ${isEnrolled ? 'text-emerald-600' : 'text-slate-400'}"></i>
                      <span class="${isEnrolled ? 'text-slate-800 font-medium' : 'text-slate-500'}">${lecture.title}</span>
                    </div>
                    <div class="flex items-center space-x-3">
                      <span class="text-xs text-slate-400 font-mono">${lecture.duration}s</span>
                      ${isEnrolled ? `<button onclick="navigate('learn', { courseId: '${course.id}', lectureId: '${lecture.id}' })" class="px-3 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-bold rounded transition">Play</button>` : ''}
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

function renderLearnView(courseId, lectureId) {
  const course = state.courses.find(c => c.id === courseId);
  if (!course) return `<div class="p-8">Course not found.</div>`;

  const enrollment = state.currentUser ? state.enrollments.find(e => e.userId === state.currentUser.email && e.courseId === course.id) : null;
  const isEnrolled = !!enrollment && enrollment.status === 'ACTIVE';
  const isStaff = state.currentUser && ['ADMIN', 'SUPER_ADMIN', 'INSTRUCTOR'].includes(state.currentUser.role);

  if (!isEnrolled && !isStaff) {
    return `
      <div class="max-w-md mx-auto my-20 p-8 bg-white border border-slate-200 rounded-2xl text-center space-y-4 shadow-sm">
        <i data-lucide="lock" class="w-10 h-10 text-amber-500 mx-auto"></i>
        <h2 class="text-xl font-bold">Course Access Restricted</h2>
        <p class="text-slate-500 text-xs">This course content is protected. Please complete enrollment to stream lectures.</p>
        <button onclick="navigate('course-detail', { courseId: '${course.id}' })" class="px-5 py-2.5 bg-blue-600 text-white text-xs font-bold rounded-xl">
          View Enrollment Page
        </button>
      </div>
    `;
  }

  const allLectures = course.sections.flatMap(s => s.lectures);
  const activeLecture = allLectures.find(l => l.id === lectureId) || allLectures[0];

  let savedSeconds = 0;
  if (state.currentUser && state.progress[state.currentUser.email]?.[activeLecture.id]) {
    savedSeconds = state.progress[state.currentUser.email][activeLecture.id].seconds || 0;
  }

  const currentIndex = allLectures.findIndex(l => l.id === activeLecture.id);
  const prevLecture = allLectures[currentIndex - 1];
  const nextLecture = allLectures[currentIndex + 1];

  setTimeout(() => initVideoPlayer(activeLecture.id, savedSeconds), 80);

  const videoSource = localBlobUrl || activeLecture.videoUrl;

  return `
    <div class="bg-slate-950 text-slate-100 min-h-[calc(100vh-4rem)] flex flex-col lg:flex-row">
      <div class="flex-1 p-4 lg:p-8 overflow-y-auto">
        <div class="max-w-4xl mx-auto space-y-6">

          <!-- Video Player with Anti-Download Controls -->
          <div class="relative bg-black rounded-2xl overflow-hidden border border-slate-800 shadow-2xl aspect-video select-none">
            <video
              id="live-player"
              src="${videoSource}"
              controls
              controlsList="nodownload"
              playsinline
              preload="auto"
              class="w-full h-full object-contain"
            ></video>
            <div id="resume-toast" class="absolute top-4 left-4 bg-blue-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow hidden">
              Resumed at <span id="resume-time-str">00:00</span>
            </div>
          </div>

          <div class="flex items-center justify-between bg-slate-900 border border-slate-800 p-3 rounded-xl text-xs text-slate-400">
            <span>Engineering Lab Preview: Test with an offline MP4 file?</span>
            <label class="cursor-pointer bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg font-medium border border-slate-700">
              📁 Choose Local File
              <input type="file" accept="video/mp4,video/*" class="hidden" onchange="handleLocalVideoUpload(event)" />
            </label>
          </div>

          <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div>
              <div class="text-xs text-emerald-400 font-semibold uppercase tracking-wider flex items-center gap-1">
                <span>✓ Active License:</span> ${course.title}
              </div>
              <h1 class="text-2xl font-bold text-white mt-1">${activeLecture.title}</h1>
              <p class="text-xs text-slate-400 mt-1" id="progress-status">Tracking progress automatically...</p>
            </div>
            <div class="flex items-center space-x-2">
              ${prevLecture ? `<button onclick="navigate('learn', { courseId: '${course.id}', lectureId: '${prevLecture.id}' })" class="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-lg">← Previous</button>` : ''}
              ${nextLecture ? `<button onclick="navigate('learn', { courseId: '${course.id}', lectureId: '${nextLecture.id}' })" class="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg">Next Lesson →</button>` : ''}
            </div>
          </div>

          <!-- Assessments -->
          ${course.quizzes && course.quizzes.length > 0 ? `
            <div class="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <h3 class="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <i data-lucide="help-circle" class="w-4 h-4 text-indigo-400"></i> Module Knowledge Check
              </h3>
              <div class="space-y-3">
                ${course.quizzes.map(quiz => {
                  const userAttempt = state.quizAttempts[state.currentUser?.email]?.[quiz.id];
                  return `
                    <div class="p-4 bg-slate-800/40 rounded-xl border border-slate-700/40 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                      <div>
                        <div class="font-semibold text-sm text-white">${quiz.title}</div>
                        <div class="text-xs text-slate-400 mt-0.5">${quiz.questions.length} Questions • Passing: ${quiz.passingScore}%</div>
                        ${userAttempt ? `
                          <div class="mt-2 text-xs font-bold ${userAttempt.passed ? 'text-emerald-400' : 'text-amber-400'}">
                            Previous Score: ${userAttempt.score}% (${userAttempt.passed ? 'Passed ✓' : 'Needs Retake'})
                          </div>
                        ` : ''}
                      </div>
                      <button onclick="openQuizModal('${course.id}', '${quiz.id}')" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition">
                        ${userAttempt ? 'Retake Quiz' : 'Attempt Quiz'}
                      </button>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          ` : ''}

          <!-- Resources -->
          ${course.resources.length > 0 ? `
            <div class="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
              <h3 class="text-xs font-bold text-slate-300 uppercase tracking-wider">Engineering Formulas &amp; Documents</h3>
              <div class="grid sm:grid-cols-2 gap-3">
                ${course.resources.map(r => `
                  <div class="flex items-center justify-between p-3 bg-slate-800/40 rounded-lg border border-slate-700/40 text-xs">
                    <span class="font-medium text-slate-200">${r.title}</span>
                    <button onclick="alert('Viewing protected document: ${r.title}')" class="text-blue-400 hover:underline">View Material (${r.size})</button>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}
        </div>
      </div>

      <div class="w-full lg:w-80 bg-slate-900 border-t lg:border-t-0 lg:border-l border-slate-800 p-4 overflow-y-auto">
        <h2 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Course Syllabus</h2>
        <div class="space-y-4">
          ${course.sections.map(s => `
            <div class="space-y-1">
              <div class="text-[11px] font-bold text-slate-400 uppercase px-2 py-1">${s.title}</div>
              ${s.lectures.map(l => {
                const isCurrent = l.id === activeLecture.id;
                const isCompleted = state.currentUser && state.progress[state.currentUser.email]?.[l.id]?.completed;
                return `
                  <button onclick="navigate('learn', { courseId: '${course.id}', lectureId: '${l.id}' })" class="w-full text-left p-2.5 rounded-lg text-xs flex items-center justify-between ${isCurrent ? 'bg-blue-600 text-white font-bold' : 'hover:bg-slate-800 text-slate-300'} transition">
                    <div class="flex items-center space-x-2 truncate">
                      <i data-lucide="${isCompleted ? 'check-circle' : 'play'}" class="w-3.5 h-3.5 shrink-0 ${isCompleted ? 'text-emerald-400' : 'text-slate-400'}"></i>
                      <span class="truncate">${l.title}</span>
                    </div>
                    <span class="text-[10px] text-slate-400 font-mono">${l.duration}s</span>
                  </button>
                `;
              }).join('')}
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

// -------------------------------------------------------------
// STUDENT DASHBOARD (With Validity, Invoices, Certificates)
// -------------------------------------------------------------
function renderStudentDashboardView() {
  if (!state.currentUser || state.currentUser.role !== 'STUDENT') {
    return `
      <div class="max-w-md mx-auto my-20 p-8 bg-white border border-slate-200 rounded-2xl text-center space-y-4 shadow-sm">
        <h2 class="text-xl font-bold">Student Portal Only</h2>
        <button onclick="quickAuth('student')" class="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg">Sign In as Jane</button>
      </div>
    `;
  }

  const userEnrollments = state.enrollments.filter(e => e.userId === state.currentUser.email);
  const enrolledCourses = state.courses.filter(c => userEnrollments.some(e => e.courseId === c.id));
  const userProgress = state.progress[state.currentUser.email] || {};
  const userPurchases = state.purchases.filter(p => p.userId === state.currentUser.email);

  return `
    <div class="max-w-7xl mx-auto px-4 py-12 space-y-10">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span class="text-xs uppercase font-bold text-emerald-600 tracking-wider">Student Academic Center</span>
          <h1 class="text-3xl font-extrabold text-slate-900 mt-1">Welcome back, ${state.currentUser.name}</h1>
          <p class="text-slate-500 text-sm mt-1">Manage active engineering courses, join live class sessions, review tax invoices, and export certificates.</p>
        </div>
        <div class="bg-white px-4 py-2 rounded-xl border border-slate-200 text-xs font-mono text-slate-500">
          Device Session: <span class="text-emerald-600 font-bold">Active &amp; Secured</span>
        </div>
      </div>

      <!-- Enrolled Courses Cards with 1-Year Expiry Countdown -->
      <div>
        <h2 class="text-xl font-bold text-slate-900 mb-4">Purchased Engineering Programs</h2>
        ${enrolledCourses.length === 0 ? `
          <div class="p-8 bg-white rounded-2xl border border-slate-200 text-center text-slate-500 text-sm">
            No active courses. Explore the catalog to enroll.
          </div>
        ` : `
          <div class="grid md:grid-cols-2 gap-6">
            ${enrolledCourses.map(course => {
              const enr = userEnrollments.find(e => e.courseId === course.id);
              const lectures = course.sections.flatMap(s => s.lectures);
              const total = lectures.length;
              const completed = lectures.filter(l => userProgress[l.id]?.completed).length;
              const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
              const nextLecture = lectures.find(l => !userProgress[l.id]?.completed) || lectures[0];

              // Calculate days remaining in 1-year validity
              const expiryDate = new Date(enr?.expiresAt || new Date(Date.now() + 365*86400000));
              const daysLeft = Math.max(0, Math.ceil((expiryDate - new Date()) / (1000 * 60 * 60 * 24)));

              return `
                <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
                  <div>
                    <div class="flex justify-between items-center">
                      <span class="text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded">
                        License Active • ${daysLeft} Days Remaining
                      </span>
                      <span class="text-xs font-bold text-slate-900">${pct}% Done</span>
                    </div>
                    <h3 class="text-xl font-bold text-slate-900 mt-3">${course.title}</h3>
                    <p class="text-slate-500 text-xs mt-1 line-clamp-2">${course.shortDescription}</p>

                    <div class="mt-6 space-y-2">
                      <div class="flex justify-between text-xs text-slate-600 font-medium">
                        <span>${completed} of ${total} Lessons Completed</span>
                      </div>
                      <div class="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div class="h-full bg-blue-600 rounded-full transition-all duration-300" style="width: ${pct}%"></div>
                      </div>
                    </div>
                  </div>

                  <div class="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row gap-2">
                    <button onclick="navigate('learn', { courseId: '${course.id}', lectureId: '${nextLecture?.id}' })" class="flex-1 py-2.5 bg-slate-900 hover:bg-blue-600 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2">
                      <i data-lucide="play" class="w-4 h-4 fill-current"></i> Resume Learning
                    </button>
                    ${pct === 100 ? `
                      <button onclick="showCertificateModal('${course.id}')" class="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5">
                        <i data-lucide="award" class="w-4 h-4"></i> Certificate
                      </button>
                    ` : ''}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        `}
      </div>

      <!-- Live Classes Hub -->
      <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div class="flex justify-between items-center">
          <div>
            <h2 class="text-lg font-bold text-slate-900">Live Classes &amp; Interactive Mentorship</h2>
            <p class="text-xs text-slate-500">Live sessions hosted on Zoom, Google Meet &amp; YouTube Live.</p>
          </div>
        </div>
        <div class="grid md:grid-cols-2 gap-4">
          ${state.liveClasses.map(session => {
            const course = state.courses.find(c => c.id === session.courseId);
            return `
              <div class="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between">
                <div>
                  <div class="flex justify-between items-center text-[10px] mb-1">
                    <span class="font-bold text-indigo-600 uppercase bg-indigo-50 px-2 py-0.5 rounded">${session.platform}</span>
                    <span class="text-slate-400 font-mono">${new Date(session.scheduledDate).toLocaleDateString()}</span>
                  </div>
                  <h4 class="font-bold text-sm text-slate-900">${session.title}</h4>
                  <p class="text-xs text-slate-500 mt-1">${course?.title || 'General Engineering Session'}</p>
                </div>
                <div class="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between">
                  <span class="text-xs text-slate-500">Instructor: ${session.instructorName}</span>
                  ${session.isCompleted && session.recordingUrl ? `
                    <button onclick="playLiveRecording('${session.recordingUrl}')" class="px-3 py-1.5 bg-slate-800 text-white text-xs font-bold rounded-lg hover:bg-slate-700">Watch Recording</button>
                  ` : `
                    <a href="${session.joinUrl}" target="_blank" class="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-500">Join Live Session</a>
                  `}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- Invoices & Tax Receipts -->
      <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div class="px-6 py-4 border-b border-slate-100 font-bold text-sm text-slate-800 flex justify-between items-center">
          <span>Billing History &amp; Official Invoices</span>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs text-slate-600">
            <thead class="bg-slate-50 uppercase text-[10px] text-slate-500 font-bold">
              <tr>
                <th class="px-6 py-3">Invoice Ref</th>
                <th class="px-6 py-3">Course</th>
                <th class="px-6 py-3">Amount</th>
                <th class="px-6 py-3">Date</th>
                <th class="px-6 py-3">Status</th>
                <th class="px-6 py-3 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              ${userPurchases.map(p => `
                <tr>
                  <td class="px-6 py-4 font-mono font-bold text-slate-800">${p.invoiceNumber}</td>
                  <td class="px-6 py-4">${p.courseTitle}</td>
                  <td class="px-6 py-4 font-bold text-slate-900">₹${p.total.toLocaleString('en-IN')}</td>
                  <td class="px-6 py-4">${new Date(p.paidAt).toLocaleDateString()}</td>
                  <td class="px-6 py-4">
                    <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      ${p.paymentStatus}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-right space-x-2">
                    <button onclick="showInvoiceModal('${p.id}')" class="text-blue-600 font-bold hover:underline">Download Tax Invoice</button>
                    <button onclick="requestRefundPrompt('${p.id}')" class="text-slate-400 hover:text-rose-600">Refund</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

// -------------------------------------------------------------
// INSTRUCTOR STUDIO
// -------------------------------------------------------------
function renderInstructorDashboardView() {
  if (!state.currentUser || !['INSTRUCTOR', 'SUPER_ADMIN'].includes(state.currentUser.role)) {
    return `<div class="p-12 text-center text-rose-600 font-bold">Access Denied: Instructor role required.</div>`;
  }

  const myCourses = state.courses.filter(c => c.instructorId === state.currentUser.email);

  return `
    <div class="max-w-7xl mx-auto px-4 py-12 space-y-8">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span class="text-xs uppercase font-bold text-indigo-600 tracking-wider">Instructor Studio</span>
          <h1 class="text-3xl font-extrabold text-slate-900 mt-1">${state.currentUser.name}</h1>
          <p class="text-slate-500 text-xs mt-1">Manage industrial curricula, modules, video updates, and schedule live workshops.</p>
        </div>
        <div class="flex gap-2">
          <button onclick="promptScheduleLiveClass()" class="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow transition">
            + Schedule Live Class
          </button>
          <button onclick="promptCreateCourse()" class="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow transition">
            + Add New Course
          </button>
        </div>
      </div>

      <!-- Course Curriculum Table -->
      <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div class="px-6 py-4 border-b border-slate-100 font-bold text-sm text-slate-800">
          Authored Programs
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs text-slate-600">
            <thead class="bg-slate-50 uppercase text-[10px] text-slate-500 font-bold">
              <tr>
                <th class="px-6 py-3">Program Name</th>
                <th class="px-6 py-3">Modules &amp; Lessons</th>
                <th class="px-6 py-3">Course Price</th>
                <th class="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              ${myCourses.map(c => `
                <tr>
                  <td class="px-6 py-4 font-bold text-slate-900">${c.title}</td>
                  <td class="px-6 py-4">${c.sections.length} Modules • ${c.sections.reduce((a, s) => a + s.lectures.length, 0)} Lessons</td>
                  <td class="px-6 py-4 font-bold text-slate-900">₹${c.price.toLocaleString('en-IN')}</td>
                  <td class="px-6 py-4 text-right space-x-3">
                    <button onclick="promptUpdatePrice('${c.id}')" class="text-emerald-600 font-bold hover:underline">Edit Price</button>
                    <button onclick="promptAddSection('${c.id}')" class="text-blue-600 font-bold hover:underline">+ Module</button>
                    <button onclick="promptAddLecture('${c.id}')" class="text-indigo-600 font-bold hover:underline">+ Video</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

// -------------------------------------------------------------
// ADMIN & SUPER ADMIN CONTROL CENTER
// -------------------------------------------------------------
function renderAdminView() {
  if (!state.currentUser || !['ADMIN', 'SUPER_ADMIN'].includes(state.currentUser.role)) {
    return `<div class="p-12 text-center text-rose-600 font-bold">Access Denied: Administrative role required.</div>`;
  }

  const isSuper = state.currentUser.role === 'SUPER_ADMIN';
  const totalStudents = state.users.filter(u => u.role === 'STUDENT').length;
  const totalInstructors = state.users.filter(u => u.role === 'INSTRUCTOR').length;
  const grossRevenue = state.purchases.reduce((acc, p) => acc + (p.paymentStatus === 'PAID' ? p.total : 0), 0);

  return `
    <div class="max-w-7xl mx-auto px-4 py-12 space-y-8">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span class="text-xs uppercase font-bold text-amber-600 tracking-wider">
            ${isSuper ? 'Super Administrator Console' : 'Administrator Operations Portal'}
          </span>
          <h1 class="text-3xl font-extrabold text-slate-900 mt-1">Platform Analytics &amp; Control</h1>
          <p class="text-slate-500 text-xs mt-1">Real-time reports, student registries, payment audits, and session security.</p>
        </div>
        <div class="flex gap-2">
          <button onclick="promptAddUser()" class="px-3 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg shadow">+ Register User</button>
          <button onclick="promptScheduleLiveClass()" class="px-3 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg shadow">+ Schedule Live Class</button>
        </div>
      </div>

      <!-- Real-Time Analytical KPI Metrics -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <span class="text-xs font-bold text-slate-400 uppercase">Gross Revenue</span>
          <div class="text-2xl font-black text-emerald-600 mt-1">₹${grossRevenue.toLocaleString('en-IN')}</div>
        </div>
        <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <span class="text-xs font-bold text-slate-400 uppercase">Registered Students</span>
          <div class="text-2xl font-black text-slate-900 mt-1">${totalStudents}</div>
        </div>
        <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <span class="text-xs font-bold text-slate-400 uppercase">Active Enrollments</span>
          <div class="text-2xl font-black text-blue-600 mt-1">${state.enrollments.filter(e => e.status === 'ACTIVE').length}</div>
        </div>
        <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <span class="text-xs font-bold text-slate-400 uppercase">Certified Completions</span>
          <div class="text-2xl font-black text-amber-500 mt-1">
            ${Object.values(state.progress).filter(userProg => Object.values(userProg).every(l => l.completed)).length}
          </div>
        </div>
      </div>

      <!-- User Management Table -->
      <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div class="px-6 py-4 border-b border-slate-100 font-bold text-sm text-slate-800 flex justify-between items-center">
          <span>Student &amp; Staff Access Directory</span>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs text-slate-600">
            <thead class="bg-slate-50 uppercase text-[10px] text-slate-500 font-bold">
              <tr>
                <th class="px-6 py-3">Account</th>
                <th class="px-6 py-3">Assigned Role</th>
                <th class="px-6 py-3">Status</th>
                <th class="px-6 py-3">Active Session</th>
                <th class="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              ${state.users.map(u => `
                <tr>
                  <td class="px-6 py-4">
                    <strong class="text-slate-900 block">${u.name}</strong>
                    <span class="text-slate-400 text-[11px]">${u.email}</span>
                  </td>
                  <td class="px-6 py-4">
                    <select onchange="changeUserRole('${u.id}', this.value)" ${!isSuper && u.role === 'SUPER_ADMIN' ? 'disabled' : ''} class="bg-slate-50 border border-slate-300 rounded px-2 py-1 text-xs font-semibold text-slate-700">
                      <option value="STUDENT" ${u.role === 'STUDENT' ? 'selected' : ''}>STUDENT</option>
                      <option value="INSTRUCTOR" ${u.role === 'INSTRUCTOR' ? 'selected' : ''}>INSTRUCTOR</option>
                      <option value="ADMIN" ${u.role === 'ADMIN' ? 'selected' : ''}>ADMIN</option>
                      ${isSuper ? `<option value="SUPER_ADMIN" ${u.role === 'SUPER_ADMIN' ? 'selected' : ''}>SUPER_ADMIN</option>` : ''}
                    </select>
                  </td>
                  <td class="px-6 py-4">
                    <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${u.active ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}">
                      ${u.active ? 'Active' : 'Locked'}
                    </span>
                  </td>
                  <td class="px-6 py-4 font-mono text-[10px] text-slate-400">
                    ${u.activeSessionId ? u.activeSessionId.substring(0, 14) + '...' : 'Idle'}
                  </td>
                  <td class="px-6 py-4 text-right space-x-2">
                    <button onclick="terminateSession('${u.id}')" class="text-amber-600 font-bold hover:underline">Reset Session</button>
                    <button onclick="toggleUserStatus('${u.id}')" class="text-blue-600 font-bold hover:underline">${u.active ? 'Lock' : 'Unlock'}</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Audit Logs -->
      <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div class="px-6 py-4 border-b border-slate-100 font-bold text-sm text-slate-800">
          Security &amp; Transaction Audit Log
        </div>
        <div class="max-h-60 overflow-y-auto divide-y divide-slate-100 text-xs text-slate-600">
          ${state.auditLogs.map(l => `
            <div class="px-6 py-2.5 flex items-center justify-between">
              <div>
                <span class="font-bold text-slate-800 font-mono text-[11px]">${l.event}</span>
                <span class="text-slate-400 mx-2">•</span>
                <span class="text-slate-600">${l.details}</span>
              </div>
              <div class="text-right text-[10px] text-slate-400 font-mono">
                ${new Date(l.timestamp).toLocaleTimeString()} by ${l.actor}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

// -------------------------------------------------------------
// CHECKOUT & PAYMENT MODAL
// -------------------------------------------------------------
function openCheckoutModal(courseId) {
  if (!state.currentUser) {
    toggleAuthModal(true);
    return;
  }
  const course = state.courses.find(c => c.id === courseId);
  if (!course) return;

  pendingCheckoutCourse = course;
  const subtotal = course.price;
  const tax = Math.round(subtotal * 0.18);
  const total = subtotal + tax;

  const html = `
    <div id="active-checkout-modal" class="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
        <div class="flex justify-between items-center pb-3 border-b border-slate-100">
          <h3 class="text-lg font-bold text-slate-900">Secure Course Checkout</h3>
          <button onclick="document.getElementById('active-checkout-modal').remove()" class="text-slate-400 hover:text-slate-600 text-2xl font-bold">&times;</button>
        </div>
        <div class="p-4 bg-slate-50 rounded-xl space-y-2 text-xs text-slate-600">
          <div class="flex justify-between">
            <span class="font-bold text-slate-900">${course.title}</span>
            <span class="font-bold text-slate-900">₹${subtotal.toLocaleString('en-IN')}</span>
          </div>
          <div class="flex justify-between text-slate-500">
            <span>GST / Taxes (18% Statutory Rate):</span>
            <span>₹${tax.toLocaleString('en-IN')}</span>
          </div>
          <div class="flex justify-between pt-2 border-t border-slate-200 text-sm font-black text-slate-900">
            <span>Total Payable:</span>
            <span class="text-blue-600">₹${total.toLocaleString('en-IN')}</span>
          </div>
        </div>

        <div>
          <label class="block text-[11px] uppercase font-bold text-slate-500 mb-1">Select Gateway</label>
          <div class="grid grid-cols-2 gap-2 text-xs">
            <label class="p-3 border border-blue-500 bg-blue-50 rounded-lg cursor-pointer flex items-center gap-2 font-medium">
              <input type="radio" name="gateway" checked class="accent-blue-600" />
              <span>Razorpay / UPI / Cards</span>
            </label>
            <label class="p-3 border border-slate-200 rounded-lg cursor-pointer flex items-center gap-2 font-medium text-slate-500">
              <input type="radio" name="gateway" class="accent-blue-600" />
              <span>Stripe International</span>
            </label>
          </div>
        </div>

        <div class="pt-3 border-t border-slate-100 space-y-2">
          <button onclick="processPaymentConfirmation(${subtotal}, ${tax}, ${total})" class="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow flex items-center justify-center gap-2">
            <span>🔒</span> Pay ₹${total.toLocaleString('en-IN')} &amp; Activate 1-Year Access
          </button>
          <p class="text-[10px] text-center text-slate-400">256-Bit SSL Encrypted • 7-Day Refund Policy Protected</p>
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', html);
}

function processPaymentConfirmation(subtotal, tax, total) {
  if (!pendingCheckoutCourse || !state.currentUser) return;

  const invNum = "INV-2026-" + Math.floor(1000 + Math.random() * 9000);
  const txnId = "TXN-2026-" + Math.floor(100000 + Math.random() * 900000);
  const now = new Date();
  const expiry = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000); // 1-year validity

  // 1. Create Purchase
  const newPurchase = {
    id: "pur-" + Date.now(),
    invoiceNumber: invNum,
    userId: state.currentUser.email,
    studentName: state.currentUser.name,
    courseId: pendingCheckoutCourse.id,
    courseTitle: pendingCheckoutCourse.title,
    amount: subtotal,
    tax: tax,
    total: total,
    paymentMethod: "Razorpay / UPI Secure Gateway",
    paymentStatus: "PAID",
    transactionId: txnId,
    paidAt: now.toISOString()
  };
  state.purchases.unshift(newPurchase);

  // 2. Upsert Enrollment
  const existingEnrIdx = state.enrollments.findIndex(e => e.userId === state.currentUser.email && e.courseId === pendingCheckoutCourse.id);
  if (existingEnrIdx >= 0) {
    state.enrollments[existingEnrIdx].status = "ACTIVE";
    state.enrollments[existingEnrIdx].expiresAt = expiry.toISOString();
  } else {
    state.enrollments.push({
      id: "enr-" + Date.now(),
      userId: state.currentUser.email,
      courseId: pendingCheckoutCourse.id,
      enrolledAt: now.toISOString(),
      expiresAt: expiry.toISOString(),
      status: "ACTIVE",
      transactionId: txnId,
      amountPaid: subtotal,
      invoiceNumber: invNum
    });
  }

  logAuditEvent("PAYMENT_SUCCESSFUL", `Payment of ₹${total} processed for ${pendingCheckoutCourse.title}`);
  saveState();

  const modal = document.getElementById('active-checkout-modal');
  if (modal) modal.remove();

  alert(`Payment Confirmed!\nInvoice #${invNum} generated.\nAccess activated for 365 days.`);
  navigate('dashboard');
}

// -------------------------------------------------------------
// INVOICE RECEIPT MODAL
// -------------------------------------------------------------
function showInvoiceModal(purchaseId) {
  const p = state.purchases.find(item => item.id === purchaseId);
  if (!p) return;

  const html = `
    <div id="active-invoice-modal" class="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl max-w-2xl w-full p-8 shadow-2xl border border-slate-200 space-y-6">
        <div class="flex justify-between items-start pb-4 border-b border-slate-100">
          <div>
            <h3 class="text-xl font-black text-slate-900">TAX INVOICE / RECEIPT</h3>
            <p class="text-xs text-slate-400 mt-0.5">Educare Technical Training Institute (ISO 9001:2015)</p>
          </div>
          <button onclick="document.getElementById('active-invoice-modal').remove()" class="text-slate-400 hover:text-slate-600 text-2xl font-bold">&times;</button>
        </div>

        <div class="grid grid-cols-2 gap-4 text-xs text-slate-600">
          <div>
            <strong class="text-slate-900 block">Billed To:</strong>
            <div>${p.studentName}</div>
            <div>${p.userId}</div>
          </div>
          <div class="text-right">
            <div><strong>Invoice No:</strong> ${p.invoiceNumber}</div>
            <div><strong>Transaction ID:</strong> ${p.transactionId}</div>
            <div><strong>Date:</strong> ${new Date(p.paidAt).toLocaleDateString()}</div>
          </div>
        </div>

        <table class="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
          <thead class="bg-slate-50 uppercase text-[10px] text-slate-500 font-bold">
            <tr>
              <th class="p-3">Course Item</th>
              <th class="p-3 text-right">Validity</th>
              <th class="p-3 text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr>
              <td class="p-3 font-semibold text-slate-900">${p.courseTitle}</td>
              <td class="p-3 text-right">365 Days</td>
              <td class="p-3 text-right">₹${p.amount.toLocaleString('en-IN')}</td>
            </tr>
            <tr>
              <td colspan="2" class="p-3 text-right font-medium text-slate-500">CGST (9%) + SGST (9%)</td>
              <td class="p-3 text-right font-medium text-slate-700">₹${p.tax.toLocaleString('en-IN')}</td>
            </tr>
            <tr class="bg-slate-50 font-bold text-slate-900">
              <td colspan="2" class="p-3 text-right">Total Paid (Inclusive of Taxes)</td>
              <td class="p-3 text-right text-blue-600 text-sm">₹${p.total.toLocaleString('en-IN')}</td>
            </tr>
          </tbody>
        </table>

        <div class="flex justify-between items-center pt-2">
          <span class="text-[10px] text-slate-400">Status: Verified Payment • Computer Generated Invoice</span>
          <button onclick="window.print()" class="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold shadow">
            🖨 Print Invoice
          </button>
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', html);
}

// -------------------------------------------------------------
// VERIFIABLE CERTIFICATE MODAL
// -------------------------------------------------------------
function showCertificateModal(courseId) {
  const course = state.courses.find(c => c.id === courseId);
  const certId = "EDU-CERT-" + Math.floor(100000 + Math.random() * 900000);

  const html = `
    <div id="active-cert-modal" class="fixed inset-0 z-50 bg-slate-900/85 backdrop-blur-sm flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl max-w-3xl w-full p-10 shadow-2xl border-8 border-slate-900 space-y-6 text-center relative overflow-hidden">
        <button onclick="document.getElementById('active-cert-modal').remove()" class="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-2xl font-bold">&times;</button>
        
        <div class="space-y-2">
          <div class="w-12 h-12 bg-blue-600 rounded-full mx-auto flex items-center justify-center text-white font-black text-2xl">E</div>
          <div class="text-xs uppercase tracking-widest text-slate-400 font-bold">Educare Technical Training Institute</div>
          <h2 class="text-3xl font-black text-slate-900 tracking-tight">CERTIFICATE OF COMPLETION</h2>
        </div>

        <p class="text-xs text-slate-500 italic">This is to certify that</p>
        <div class="text-3xl font-extrabold text-blue-700 font-serif border-b-2 border-slate-200 pb-2 max-w-md mx-auto">
          ${state.currentUser.name}
        </div>

        <p class="text-xs text-slate-600 max-w-lg mx-auto leading-relaxed">
          has successfully satisfied all rigorous curriculum requirements, module assessments, and practical technical assignments for:
        </p>
        <div class="text-xl font-bold text-slate-900">
          ${course.title}
        </div>

        <div class="grid grid-cols-2 gap-8 pt-8 max-w-md mx-auto text-xs border-t border-slate-200">
          <div>
            <div class="font-serif italic font-bold text-slate-800">${course.instructorName}</div>
            <div class="text-[10px] text-slate-400">Chief Course Faculty</div>
          </div>
          <div>
            <div class="font-serif italic font-bold text-slate-800">Academic Director</div>
            <div class="text-[10px] text-slate-400">Educare Standards Committee</div>
          </div>
        </div>

        <div class="pt-4 text-[10px] text-slate-400 font-mono flex justify-between items-center border-t border-slate-100">
          <span>Certificate ID: ${certId}</span>
          <span>Verified Online: educare-hazel.vercel.app</span>
          <button onclick="window.print()" class="px-3 py-1 bg-slate-900 text-white rounded text-[11px] font-bold">🖨 Print</button>
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', html);
}

// -------------------------------------------------------------
// LIVE CLASS SCHEDULER & PLAYER
// -------------------------------------------------------------
function promptScheduleLiveClass() {
  const title = prompt("Enter Live Session Title:");
  if (!title) return;
  const platform = prompt("Platform (Zoom, Google Meet, or YouTube Live):", "Zoom") || "Zoom";
  const joinUrl = prompt("Enter Class Meeting URL:", "https://zoom.us/j/123456789") || "https://zoom.us";
  const courseId = state.courses[0]?.id || "c-mechanical";

  state.liveClasses.unshift({
    id: "live-" + Date.now(),
    courseId,
    title,
    platform,
    joinUrl,
    scheduledDate: new Date(Date.now() + 86400000 * 2).toISOString(),
    durationMinutes: 60,
    instructorName: state.currentUser.name,
    isCompleted: false,
    recordingUrl: null
  });

  logAuditEvent("LIVE_CLASS_SCHEDULED", `Scheduled live session: ${title} on ${platform}`);
  saveState();
  alert("Live session scheduled and broadcasted to enrolled students.");
  navigate(currentRoute);
}

function playLiveRecording(url) {
  const html = `
    <div id="live-rec-modal" class="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div class="bg-black rounded-2xl max-w-3xl w-full p-4 space-y-2">
        <div class="flex justify-between items-center text-white text-xs pb-2 border-b border-slate-800">
          <span>Archived Live Class Stream</span>
          <button onclick="document.getElementById('live-rec-modal').remove()" class="text-slate-400 hover:text-white text-xl font-bold">&times;</button>
        </div>
        <video src="${url}" controls controlsList="nodownload" class="w-full aspect-video rounded-xl"></video>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', html);
}

// -------------------------------------------------------------
// USER MANAGEMENT & ROLE MUTATIONS
// -------------------------------------------------------------
function promptAddUser() {
  const name = prompt("User Full Name:");
  if (!name) return;
  const email = prompt("User Email Address:");
  if (!email) return;
  const role = prompt("Role (STUDENT, INSTRUCTOR, ADMIN, SUPER_ADMIN):", "STUDENT").toUpperCase();

  state.users.push({
    id: "u-" + Date.now(),
    name,
    email: email.toLowerCase(),
    role: ['STUDENT', 'INSTRUCTOR', 'ADMIN', 'SUPER_ADMIN'].includes(role) ? role : 'STUDENT',
    active: true,
    activeSessionId: null
  });

  logAuditEvent("USER_CREATED", `Added user ${name} (${email}) as ${role}`);
  saveState();
  navigate('admin');
}

function changeUserRole(userId, newRole) {
  const user = state.users.find(u => u.id === userId);
  if (user) {
    user.role = newRole;
    logAuditEvent("ROLE_CHANGED", `Changed ${user.email} to ${newRole}`);
    saveState();
    renderNav();
  }
}

function toggleUserStatus(userId) {
  const user = state.users.find(u => u.id === userId);
  if (user) {
    user.active = !user.active;
    logAuditEvent("USER_STATUS_TOGGLED", `${user.email} status set to ${user.active ? 'Active' : 'Locked'}`);
    saveState();
    navigate('admin');
  }
}

function terminateSession(userId) {
  const user = state.users.find(u => u.id === userId);
  if (user) {
    user.activeSessionId = null;
    logAuditEvent("SESSION_RESET", `Session terminated for ${user.email}`);
    saveState();
    alert(`Session terminated for ${user.name}. The user will be required to sign in again.`);
    navigate('admin');
  }
}

function promptUpdatePrice(courseId) {
  const course = state.courses.find(c => c.id === courseId);
  if (!course) return;
  const newPrice = parseInt(prompt("Enter new Course Price (INR):", course.price));
  if (!isNaN(newPrice) && newPrice > 0) {
    course.price = newPrice;
    logAuditEvent("PRICE_UPDATED", `Updated price for ${course.title} to ₹${newPrice}`);
    saveState();
    navigate('instructor');
  }
}

function promptAddSection(courseId) {
  const course = state.courses.find(c => c.id === courseId);
  if (!course) return;
  const title = prompt("Enter Module Title:");
  if (!title) return;
  course.sections.push({ id: "s-" + Date.now(), title, lectures: [] });
  saveState();
  navigate('instructor');
}

function promptAddLecture(courseId) {
  const course = state.courses.find(c => c.id === courseId);
  if (!course || course.sections.length === 0) return;
  const title = prompt("Enter Lecture Title:");
  if (!title) return;
  const videoUrl = prompt("Enter Video URL (or leave blank for standard demo):") || RELIABLE_VIDEOS.stream1;
  course.sections[0].lectures.push({ id: "l-" + Date.now(), title, duration: 46, videoUrl });
  saveState();
  navigate('instructor');
}

function requestRefundPrompt(purchaseId) {
  const p = state.purchases.find(item => item.id === purchaseId);
  if (!p) return;
  if (confirm(`Request a cancellation and refund for ${p.courseTitle}? According to policy, this must be within 7 days with < 20% progress.`)) {
    p.paymentStatus = "REFUND_REQUESTED";
    logAuditEvent("REFUND_REQUESTED", `Refund requested for ${p.invoiceNumber}`);
    saveState();
    alert("Refund request submitted to administration. Settlement takes 5-7 business days.");
    navigate('dashboard');
  }
}

function startLearning(courseId) {
  const course = state.courses.find(c => c.id === courseId);
  const firstLecture = course.sections[0]?.lectures[0];
  if (firstLecture) {
    navigate('learn', { courseId: course.id, lectureId: firstLecture.id });
  }
}

// -------------------------------------------------------------
// PUBLIC MODALS (POLICIES & CONTACT)
// -------------------------------------------------------------
function showPolicyModal(policyKey) {
  const policy = POLICIES_DATA[policyKey];
  if (!policy) return;

  const html = `
    <div id="active-policy-modal" class="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[85vh] flex flex-col">
        <div class="flex justify-between items-center pb-3 border-b border-slate-100">
          <div>
            <h3 class="text-lg font-bold text-slate-900">${policy.title}</h3>
            <span class="text-xs text-slate-400">${policy.lastUpdated}</span>
          </div>
          <button onclick="document.getElementById('active-policy-modal').remove()" class="text-slate-400 hover:text-slate-600 text-2xl font-bold">&times;</button>
        </div>
        <div class="overflow-y-auto py-4 space-y-4 text-xs text-slate-600 leading-relaxed">
          ${policy.sections.map(s => `
            <div>
              <h4 class="font-bold text-slate-800 text-sm mb-1">${s.heading}</h4>
              <p>${s.body}</p>
            </div>
          `).join('')}
        </div>
        <div class="pt-3 border-t border-slate-100 flex justify-end">
          <button onclick="document.getElementById('active-policy-modal').remove()" class="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold">Close</button>
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', html);
}

function showContactModal() {
  const c = POLICIES_DATA.contact;
  const html = `
    <div id="active-contact-modal" class="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
        <div class="flex justify-between items-center pb-2 border-b border-slate-100">
          <h3 class="text-lg font-bold text-slate-900">Institute Official Contact</h3>
          <button onclick="document.getElementById('active-contact-modal').remove()" class="text-slate-400 hover:text-slate-600 text-2xl font-bold">&times;</button>
        </div>
        <div class="space-y-3 text-xs text-slate-600">
          <div>
            <strong class="text-slate-800 block mb-0.5">Admissions:</strong>
            <a href="mailto:${c.admissionsEmail}" class="text-blue-600 hover:underline">${c.admissionsEmail}</a>
          </div>
          <div>
            <strong class="text-slate-800 block mb-0.5">Student Support:</strong>
            <a href="mailto:${c.supportEmail}" class="text-blue-600 hover:underline">${c.supportEmail}</a>
          </div>
          <div>
            <strong class="text-slate-800 block mb-0.5">Administration:</strong>
            <a href="mailto:${c.adminEmail}" class="text-blue-600 hover:underline">${c.adminEmail}</a>
          </div>
          <div>
            <strong class="text-slate-800 block mb-0.5">Phone &amp; WhatsApp:</strong>
            <span>${c.phone} / ${c.whatsapp}</span>
          </div>
          <div>
            <strong class="text-slate-800 block mb-0.5">Campus Address:</strong>
            <span>${c.address}</span>
          </div>
        </div>
        <div class="pt-2 border-t border-slate-100 flex justify-end">
          <button onclick="document.getElementById('active-contact-modal').remove()" class="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold">Close</button>
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', html);
}

// -------------------------------------------------------------
// QUIZ MODAL & ASSESSMENT
// -------------------------------------------------------------
function openQuizModal(courseId, quizId) {
  const course = state.courses.find(c => c.id === courseId);
  const quiz = course?.quizzes.find(q => q.id === quizId);
  if (!quiz) return;

  const modalHtml = `
    <div id="active-quiz-modal" class="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div class="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 my-8">
        <div class="flex justify-between items-center pb-3 border-b border-slate-100">
          <h3 class="text-lg font-bold text-slate-900">${quiz.title}</h3>
          <button onclick="document.getElementById('active-quiz-modal').remove()" class="text-slate-400 hover:text-slate-600 text-xl font-bold">&times;</button>
        </div>
        <form id="quiz-form" onsubmit="submitQuiz(event, '${courseId}', '${quizId}')" class="mt-4 space-y-6">
          ${quiz.questions.map((q, qIdx) => `
            <div class="space-y-2">
              <p class="text-sm font-semibold text-slate-800">${qIdx + 1}. ${q.questionText}</p>
              <div class="space-y-1.5 pl-2">
                ${q.options.map((opt, optIdx) => `
                  <label class="flex items-center space-x-2 text-xs text-slate-700 cursor-pointer p-2 rounded-lg hover:bg-slate-50 border border-slate-100">
                    <input type="radio" name="question_${qIdx}" value="${optIdx}" required class="accent-indigo-600" />
                    <span>${opt}</span>
                  </label>
                `).join('')}
              </div>
            </div>
          `).join('')}
          <div class="pt-4 border-t border-slate-100 flex justify-end gap-2">
            <button type="button" onclick="document.getElementById('active-quiz-modal').remove()" class="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
            <button type="submit" class="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow">Submit Assessment</button>
          </div>
        </form>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', modalHtml);
}

function submitQuiz(e, courseId, quizId) {
  e.preventDefault();
  const course = state.courses.find(c => c.id === courseId);
  const quiz = course?.quizzes.find(q => q.id === quizId);
  if (!quiz || !state.currentUser) return;

  const formData = new FormData(e.target);
  let correctCount = 0;

  quiz.questions.forEach((q, qIdx) => {
    const selected = parseInt(formData.get(`question_${qIdx}`));
    if (selected === q.correctAnswerIndex) correctCount++;
  });

  const score = Math.round((correctCount / quiz.questions.length) * 100);
  const passed = score >= quiz.passingScore;

  if (!state.quizAttempts[state.currentUser.email]) {
    state.quizAttempts[state.currentUser.email] = {};
  }

  state.quizAttempts[state.currentUser.email][quiz.id] = {
    score,
    passed,
    attemptedAt: new Date().toISOString()
  };

  logAuditEvent("QUIZ_ATTEMPTED", `Scored ${score}% on ${quiz.title}`);
  saveState();

  document.getElementById('active-quiz-modal').remove();
  alert(`Assessment Complete!\nYour Score: ${score}%\nResult: ${passed ? 'PASSED ✓' : 'NEEDS RETAKE'}`);
  navigate('learn', { courseId, lectureId: course.sections[0]?.lectures[0]?.id });
}

// -------------------------------------------------------------
// BOOTSTRAP
// -------------------------------------------------------------
window.onload = () => {
  navigate('home');
};

