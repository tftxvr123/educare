
// app.js — Educare Production Core LMS Controller

// Paste your Google OAuth Web Client ID from console.cloud.google.com (APIs & Services -> Credentials)
const GOOGLE_CLIENT_ID = "927965375944-06v891q36rs6vnu9stasjuk0kq8mli33.apps.googleusercontent.com";

// Paste your Razorpay Key ID from dashboard.razorpay.com (Settings -> API Keys)
const RAZORPAY_KEY_ID = "rzp_live_TdsETGp7PHolSJ";



const FALLBACK_COURSES = typeof INITIAL_COURSES !== 'undefined' ? INITIAL_COURSES : [];
const activeCourses = (typeof window.INITIAL_COURSES !== 'undefined') ? window.INITIAL_COURSES : (typeof INITIAL_COURSES !== 'undefined' ? INITIAL_COURSES : FALLBACK_COURSES);
const activePolicies = (typeof window.POLICIES_DATA !== 'undefined') ? window.POLICIES_DATA : (typeof POLICIES_DATA !== 'undefined' ? POLICIES_DATA : {});

const DEFAULT_STATE = {
  currentUser: null,
  users: [
    { id: "u-super-edwin", name: "Edwin (Director)", email: "tftxvr@gmail.com", role: "SUPER_ADMIN", active: true, activeSessionId: "sess_super_1", password: "Admin@123" },
    { id: "u-inst-sir", name: "Educare Faculty", email: "educaresir99@gmail.com", role: "INSTRUCTOR", active: true, activeSessionId: "sess_inst_sir", password: "Instructor@123" },
    { id: "u-admin", name: "Course Operations Admin", email: "admin@gmail.com", role: "ADMIN", active: true, activeSessionId: "sess_admin_1", password: "Admin@123" },
    { id: "u-student", name: "Jane Student", email: "student@gmail.com", role: "STUDENT", active: true, activeSessionId: "sess_student_1", password: "Student@123" }
  ],
  courses: activeCourses,
  liveClasses: typeof INITIAL_LIVE_CLASSES !== 'undefined' ? INITIAL_LIVE_CLASSES : [],
  enrollments: [],
  purchases: [],
  progress: {},
  quizAttempts: {},
  auditLogs: [{ id: "log-1", event: "SYSTEM_ONLINE", actor: "System", timestamp: new Date().toISOString(), details: "Platform initialized" }]
};

function loadState() {
  try {
    const stored = localStorage.getItem("educare_prod_v8");
    let parsedState = stored ? JSON.parse(stored) : JSON.parse(JSON.stringify(DEFAULT_STATE));

    // Guarantee Super Admin tftxvr@gmail.com
    let superRecord = parsedState.users.find(u => u.email === "tftxvr@gmail.com");
    if (!superRecord) {
      parsedState.users.unshift({ id: "u-super-edwin", name: "Edwin (Director)", email: "tftxvr@gmail.com", role: "SUPER_ADMIN", active: true, password: "Admin@123" });
    } else {
      superRecord.role = "SUPER_ADMIN";
      if (!superRecord.password) superRecord.password = "Admin@123";
    }

    // Guarantee Instructor educaresir99@gmail.com
    let instRecord = parsedState.users.find(u => u.email === "educaresir99@gmail.com");
    if (!instRecord) {
      parsedState.users.push({ id: "u-inst-sir", name: "Educare Faculty", email: "educaresir99@gmail.com", role: "INSTRUCTOR", active: true, password: "Instructor@123" });
    } else {
      instRecord.role = "INSTRUCTOR";
      if (!instRecord.password) instRecord.password = "Instructor@123";
    }

    // Re-link initial courses to educaresir99@gmail.com
    if (parsedState.courses) {
      parsedState.courses.forEach(c => {
        if (!c.instructorId || c.instructorId.includes("educare.local")) {
          c.instructorId = "educaresir99@gmail.com";
          c.instructorName = "Educare Faculty (educaresir99@gmail.com)";
        }
      });
    }

    return parsedState;
  } catch {
    return JSON.parse(JSON.stringify(DEFAULT_STATE));
  }
}

function saveState() {
  try {
    localStorage.setItem("educare_prod_v8", JSON.stringify(state));
  } catch (err) {
    console.error("Storage error:", err);
  }
}

function resetDemoState() {
  if (confirm("Reset local storage to initial defaults?")) {
    localStorage.removeItem("educare_prod_v8");
    state = JSON.parse(JSON.stringify(DEFAULT_STATE));
    saveState();
    navigate('home');
  }
}

let state = loadState();
let currentRoute = 'home';
let routeParams = {};
let pendingCheckoutCourse = null;
let isSignUpMode = false;

function generateSessionId() {
  return "sess_" + Math.random().toString(36).substring(2, 9) + "_" + Date.now();
}

function redirectAfterLogin(role) {
  if (role === 'SUPER_ADMIN' || role === 'ADMIN') {
    navigate('admin');
  } else if (role === 'INSTRUCTOR') {
    navigate('instructor');
  } else {
    navigate('dashboard');
  }
}

// -------------------------------------------------------------
// AUTHENTICATION ENGINE
// -------------------------------------------------------------
function loginWithGoogleProfile(email, name, sub) {
  const sessId = generateSessionId();
  const normalizedEmail = email.toLowerCase().trim();
  let existing = state.users.find(u => u.email === normalizedEmail);

  let targetRole = "STUDENT";
  if (normalizedEmail === "tftxvr@gmail.com") targetRole = "SUPER_ADMIN";
  else if (normalizedEmail === "educaresir99@gmail.com") targetRole = "INSTRUCTOR";
  else if (existing) targetRole = existing.role;

  if (!existing) {
    existing = { id: "u-" + Date.now(), name, email: normalizedEmail, role: targetRole, active: true, activeSessionId: sessId, googleSub: sub };
    state.users.push(existing);
  } else {
    existing.activeSessionId = sessId;
    existing.role = targetRole;
  }

  state.currentUser = { email: existing.email, name: existing.name, role: existing.role, sessionId: sessId };
  saveState();
  toggleAuthModal(false);
  renderNav();
  alert(`Signed in as: ${existing.name} (${existing.role})`);
  redirectAfterLogin(existing.role);
}

function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

function handleGoogleCredentialResponse(response) {
  if (!response || !response.credential) return;
  const profile = parseJwt(response.credential);
  if (profile && profile.email) {
    loginWithGoogleProfile(profile.email, profile.name || profile.email.split('@')[0], profile.sub);
  }
}

function handleGoogleAuth() {
  const clientId = window.DYNAMIC_GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID;

  if (typeof google !== 'undefined' && google.accounts && google.accounts.oauth2) {
    try {
      const tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'email profile openid',
        callback: async (tokenResponse) => {
          if (tokenResponse && tokenResponse.access_token) {
            try {
              const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
              });
              const userProfile = await res.json();
              if (userProfile && userProfile.email) {
                loginWithGoogleProfile(userProfile.email, userProfile.name || userProfile.email.split('@')[0], userProfile.sub);
              }
            } catch (err) {
              alert("Google profile error: " + err.message);
            }
          }
        },
        error_callback: (err) => {
          alert("Google Sign-In Notice: " + (err.message || "Ensure Authorized Origins are set in Google Cloud"));
        }
      });
      tokenClient.requestAccessToken({ prompt: 'consent' });
    } catch (err) {
      alert("Google popup error: " + err.message);
    }
  } else {
    alert("Google Identity Services is loading. Please try again in 2 seconds.");
  }
}

function initOfficialGoogleButton() {
  const btnContainer = document.getElementById("google-signin-btn");
  if (!btnContainer) return;
  const clientId = window.DYNAMIC_GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID;
  if (!clientId || clientId.includes("YOUR_GOOGLE_CLIENT_ID")) return;

  if (typeof google !== 'undefined' && google.accounts && google.accounts.id) {
    try {
      google.accounts.id.initialize({
        client_id: clientId,
        callback: handleGoogleCredentialResponse
      });
      btnContainer.innerHTML = "";
      google.accounts.id.renderButton(btnContainer, {
        theme: "outline",
        size: "large",
        width: 320,
        text: "continue_with"
      });
    } catch (e) {
      console.warn("Google button render:", e);
    }
  }
}

function toggleAuthMode() {
  isSignUpMode = !isSignUpMode;
  const title = document.getElementById("auth-modal-title");
  const nameField = document.getElementById("auth-name-field");
  const submitBtn = document.getElementById("auth-submit-btn");
  const toggleBtn = document.getElementById("auth-toggle-mode-btn");

  if (isSignUpMode) {
    if (title) title.innerText = "Create Student Account";
    if (nameField) nameField.classList.remove("hidden");
    if (submitBtn) submitBtn.innerText = "Register & Sign In";
    if (toggleBtn) toggleBtn.innerHTML = "Already have an account? <span class='font-bold text-blue-600'>Sign In</span>";
  } else {
    if (title) title.innerText = "Sign In to Educare";
    if (nameField) nameField.classList.add("hidden");
    if (submitBtn) submitBtn.innerText = "Sign In";
    if (toggleBtn) toggleBtn.innerHTML = "New student? <span class='font-bold text-blue-600'>Create an account</span>";
  }
}

function togglePasswordVisibility() {
  const pwdInput = document.getElementById("auth-password");
  if (!pwdInput) return;
  pwdInput.type = pwdInput.type === "password" ? "text" : "password";
}

function handleAuthSubmit(e) {
  e.preventDefault();
  const emailInput = document.getElementById("auth-email").value.trim().toLowerCase();
  const passwordInput = document.getElementById("auth-password").value;
  const nameInput = document.getElementById("auth-name") ? document.getElementById("auth-name").value.trim() : "";

  if (!emailInput || !passwordInput) {
    alert("Please enter both email and password.");
    return;
  }

  const sessId = generateSessionId();
  let existing = state.users.find(u => u.email === emailInput);

  if (isSignUpMode) {
    if (existing) {
      alert("An account with this email already exists. Please sign in.");
      toggleAuthMode();
      return;
    }
    let roleAssigned = "STUDENT";
    if (emailInput === "tftxvr@gmail.com") roleAssigned = "SUPER_ADMIN";
    else if (emailInput === "educaresir99@gmail.com") roleAssigned = "INSTRUCTOR";

    const newUser = {
      id: "u-" + Date.now(),
      name: nameInput || emailInput.split('@')[0],
      email: emailInput,
      role: roleAssigned,
      password: passwordInput,
      active: true,
      activeSessionId: sessId
    };
    state.users.push(newUser);
    state.currentUser = { email: newUser.email, name: newUser.name, role: newUser.role, sessionId: sessId };
    saveState();
    toggleAuthModal(false);
    renderNav();
    alert("Registration successful! Welcome to Educare.");
    redirectAfterLogin(newUser.role);
    return;
  }

  // Sign In Mode
  if (!existing) {
    alert("Account not found. Click 'Create an account' below to register.");
    return;
  }

  if (!existing.active) {
    alert("Account Locked: This account has been deactivated by an Administrator.");
    return;
  }

  if (existing.password && existing.password !== passwordInput) {
    alert("Incorrect password. Please verify and try again.");
    return;
  }

  existing.activeSessionId = sessId;
  state.currentUser = { email: existing.email, name: existing.name, role: existing.role, sessionId: sessId };
  saveState();
  toggleAuthModal(false);
  renderNav();
  redirectAfterLogin(existing.role);
}

function logout() {
  state.currentUser = null;
  saveState();
  renderNav();
  navigate('home');
}

function toggleAuthModal(show) {
  const modal = document.getElementById("auth-modal");
  if (modal) {
    modal.classList.toggle("hidden", !show);
    modal.classList.toggle("flex", show);
    if (show) {
      setTimeout(initOfficialGoogleButton, 100);
    }
  }
}

function renderNav() {
  const authDiv = document.getElementById("auth-buttons");
  const studentBtn = document.getElementById("nav-student-btn");
  const instructorBtn = document.getElementById("nav-instructor-btn");
  const adminBtn = document.getElementById("nav-admin-btn");

  if (state.currentUser) {
    if (studentBtn) studentBtn.classList.toggle("hidden", state.currentUser.role !== 'STUDENT');
    if (instructorBtn) instructorBtn.classList.toggle("hidden", state.currentUser.role !== 'INSTRUCTOR');
    if (adminBtn) adminBtn.classList.toggle("hidden", state.currentUser.role !== 'ADMIN' && state.currentUser.role !== 'SUPER_ADMIN');

    if (authDiv) {
      const roleLabel = state.currentUser.role === 'SUPER_ADMIN' ? 'SUPER ADMIN' : state.currentUser.role;
      authDiv.innerHTML = `
        <div class="flex items-center space-x-3">
          <span class="text-xs bg-slate-100 border border-slate-200 text-slate-700 px-2.5 py-1 rounded-full font-medium">
            ${state.currentUser.name} <span class="font-bold text-blue-600">(${roleLabel})</span>
          </span>
          <button onclick="logout()" class="text-xs font-semibold text-rose-600 hover:text-rose-700">Logout</button>
        </div>
      `;
    }
  } else {
    if (studentBtn) studentBtn.classList.add("hidden");
    if (instructorBtn) instructorBtn.classList.add("hidden");
    if (adminBtn) adminBtn.classList.add("hidden");
    if (authDiv) {
      authDiv.innerHTML = `
        <button onclick="toggleAuthModal(true)" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition shadow-sm">
          Sign In
        </button>
      `;
    }
  }

  if (typeof lucide !== 'undefined' && lucide.createIcons) {
    lucide.createIcons();
  }
}

function navigate(route, params = {}) {
  currentRoute = route;
  routeParams = params;
  renderNav();

  const app = document.getElementById("app");
  if (!app) return;

  if (route === 'home') app.innerHTML = renderHomeView();
  else if (route === 'courses') app.innerHTML = renderCoursesView();
  else if (route === 'course-detail') app.innerHTML = renderCourseDetailView(params.courseId);
  else if (route === 'learn') app.innerHTML = renderLearnView(params.courseId, params.lectureId);
  else if (route === 'dashboard') app.innerHTML = renderStudentDashboardView();
  else if (route === 'instructor') app.innerHTML = renderInstructorDashboardView();
  else if (route === 'admin') app.innerHTML = renderAdminView();

  window.scrollTo(0, 0);
  if (typeof lucide !== 'undefined' && lucide.createIcons) {
    lucide.createIcons();
  }
}

function renderHomeView() {
  const p = activePolicies.institution || {};
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
              : state.currentUser
              ? `<button onclick="navigate('dashboard')" class="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl border border-slate-700 transition">Student Dashboard</button>`
              : `<button onclick="toggleAuthModal(true)" class="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl border border-slate-700 transition">Sign In to Platform</button>`
          }
        </div>
      </div>
    </section>

    <!-- Core Programs Grid -->
    <section class="max-w-7xl mx-auto px-4 py-16">
      <div class="flex justify-between items-end mb-6">
        <div>
          <h2 class="text-2xl font-bold text-slate-900">Core Engineering Programs</h2>
          <p class="text-slate-500 text-sm">Industrial HVAC, Power Electrical, Public Health &amp; BIM Drafting</p>
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
  const lectureCount = c.sections ? c.sections.reduce((acc, s) => acc + s.lectures.length, 0) : 0;

  return `
    <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition">
      <div>
        <div class="flex justify-between items-center mb-3">
          ${
            isEnrolled
              ? '<span class="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full">✓ Enrolled &amp; Active</span>'
              : '<span class="text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full">1-Year License</span>'
          }
          <span class="text-xs text-slate-400 font-medium">${c.discipline || 'Engineering'}</span>
        </div>
        <h3 class="font-bold text-xl text-slate-900">${c.title}</h3>
        <p class="text-xs text-blue-600 font-semibold mt-0.5">Faculty: ${c.instructorName}</p>
        <p class="text-slate-500 text-xs mt-2 leading-relaxed">${c.shortDescription}</p>
        <div class="mt-4 flex items-center gap-3 text-xs text-slate-400">
          <span>${c.sections ? c.sections.length : 0} Modules</span>
          <span>•</span>
          <span>${lectureCount} Lessons</span>
          <span>•</span>
          <span class="font-bold text-slate-900 text-sm">₹${c.price.toLocaleString('en-IN')}</span>
        </div>
      </div>

      <div class="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
        <span class="text-xs text-slate-500">Validity: 365 Days</span>
        ${
          isEnrolled
            ? `<button onclick="startLearning('${c.id}')" class="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition">
                 Continue Learning →
               </button>`
            : `<button onclick="navigate('course-detail', { courseId: '${c.id}' })" class="px-5 py-2.5 bg-slate-900 hover:bg-blue-600 text-white text-xs font-bold rounded-xl transition">
                 View Course Details
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
              ? '<div class="inline-block text-xs font-bold bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full">✓ License Active (365 Days)</div>'
              : '<div class="inline-block text-xs font-bold bg-blue-50 text-blue-700 px-3 py-1 rounded-full">Accredited Program</div>'
          }
          <h1 class="text-3xl font-extrabold text-slate-900">${course.title}</h1>
          <p class="text-slate-600 text-sm leading-relaxed">${course.description}</p>
          <div class="text-xs text-slate-500 font-medium flex flex-wrap items-center gap-4">
            <span>Faculty: <strong class="text-slate-800">${course.instructorName}</strong></span>
            <span>•</span>
            <span>${course.sections.length} Modules</span>
            <span>•</span>
            <span>${totalLectures} Video Lessons</span>
          </div>
        </div>

        <div class="bg-slate-50 p-6 rounded-xl border border-slate-200 text-center flex flex-col justify-between min-w-[260px]">
          <div>
            <span class="text-[11px] font-bold uppercase text-slate-500">Program Tuition</span>
            <div class="text-3xl font-black text-slate-900 mt-1">₹${course.price.toLocaleString('en-IN')}</div>
            <p class="text-[11px] text-slate-400 mt-1">+18% GST • 365 Days Access</p>
          </div>

          <div class="mt-6">
            ${
              isEnrolled
                ? `<button onclick="startLearning('${course.id}')" class="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl shadow transition">
                     Watch All Lessons →
                   </button>`
                : state.currentUser
                ? `<button onclick="openCheckoutModal('${course.id}')" class="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow transition flex items-center justify-center gap-2">
                     <span>💳</span> Enroll via Razorpay
                   </button>`
                : `<div class="space-y-2">
                     <button onclick="toggleAuthModal(true)" class="w-full py-3 bg-slate-900 hover:bg-blue-600 text-white text-sm font-bold rounded-xl shadow transition flex items-center justify-center gap-2">
                       <span>🔒</span> Sign In to Enroll
                     </button>
                     <p class="text-[10px] text-slate-500">Student login required to purchase</p>
                   </div>`
            }
          </div>
        </div>
      </div>

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

  const allLectures = course.sections.flatMap(s => s.lectures);
  const activeLecture = allLectures.find(l => l.id === lectureId) || allLectures[0];

  let savedSeconds = 0;
  if (state.currentUser && state.progress[state.currentUser.email]?.[activeLecture.id]) {
    savedSeconds = state.progress[state.currentUser.email][activeLecture.id].seconds || 0;
  }

  const currentIndex = allLectures.findIndex(l => l.id === activeLecture.id);
  const prevLecture = allLectures[currentIndex - 1];
  const nextLecture = allLectures[currentIndex + 1];

  setTimeout(() => {
    if (typeof initVideoPlayer === 'function') {
      initVideoPlayer(activeLecture.id, savedSeconds);
    }
  }, 80);

  return `
    <div class="bg-slate-950 text-slate-100 min-h-[calc(100vh-4rem)] flex flex-col lg:flex-row">
      <div class="flex-1 p-4 lg:p-8 overflow-y-auto">
        <div class="max-w-4xl mx-auto space-y-6">
          <div class="relative bg-black rounded-2xl overflow-hidden border border-slate-800 shadow-2xl aspect-video select-none">
            <video
              id="live-player"
              src="${activeLecture.videoUrl}"
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

function renderStudentDashboardView() {
  if (!state.currentUser) {
    return `<div class="max-w-md mx-auto my-20 p-8 bg-white border border-slate-200 rounded-2xl text-center space-y-4 shadow-sm"><h2 class="text-xl font-bold">Please Sign In</h2></div>`;
  }

  const userEnrollments = state.enrollments.filter(e => e.userId === state.currentUser?.email);
  const enrolledCourses = state.courses.filter(c => userEnrollments.some(e => e.courseId === c.id));
  const userProgress = state.progress[state.currentUser?.email] || {};

  return `
    <div class="max-w-7xl mx-auto px-4 py-12 space-y-10">
      <div>
        <span class="text-xs uppercase font-bold text-emerald-600 tracking-wider">Student Academic Center</span>
        <h1 class="text-3xl font-extrabold text-slate-900 mt-1">Welcome back, ${state.currentUser?.name || 'Student'}</h1>
        <p class="text-slate-500 text-sm mt-1">Manage active engineering courses, join live class sessions, and export certificates.</p>
      </div>

      <div class="grid md:grid-cols-2 gap-6">
        ${enrolledCourses.map(course => {
          const enr = userEnrollments.find(e => e.courseId === course.id);
          const lectures = course.sections.flatMap(s => s.lectures);
          const total = lectures.length;
          const completed = lectures.filter(l => userProgress[l.id]?.completed).length;
          const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
          const nextLecture = lectures.find(l => !userProgress[l.id]?.completed) || lectures[0];

          return `
            <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div class="flex justify-between items-center">
                  <span class="text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded">Active 365 Days</span>
                  <span class="text-xs font-bold text-slate-900">${pct}% Done</span>
                </div>
                <h3 class="text-xl font-bold text-slate-900 mt-3">${course.title}</h3>
                <p class="text-slate-500 text-xs mt-1 line-clamp-2">${course.shortDescription}</p>
              </div>

              <div class="mt-6 pt-4 border-t border-slate-100 flex gap-2">
                <button onclick="navigate('learn', { courseId: '${course.id}', lectureId: '${nextLecture?.id}' })" class="flex-1 py-2.5 bg-slate-900 hover:bg-blue-600 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2">
                  <i data-lucide="play" class="w-4 h-4 fill-current"></i> Resume Learning
                </button>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

// -------------------------------------------------------------
// INSTRUCTOR STUDIO (educaresir99@gmail.com PORTAL)
// -------------------------------------------------------------
function renderInstructorDashboardView() {
  if (!state.currentUser || state.currentUser.role !== 'INSTRUCTOR') {
    return `<div class="p-12 text-center text-rose-600 font-bold">Access Denied: Instructor portal only.</div>`;
  }

  // Filter courses owned by this instructor
  const myCourses = state.courses.filter(c => c.instructorId === state.currentUser.email);

  return `
    <div class="max-w-7xl mx-auto px-4 py-12 space-y-8">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span class="text-xs uppercase font-bold text-indigo-600 tracking-wider">Faculty Studio</span>
          <h1 class="text-3xl font-extrabold text-slate-900 mt-1">${state.currentUser.name} (${state.currentUser.email})</h1>
          <p class="text-slate-500 text-xs mt-1">Upload lecture videos, structure modules, and review assessments for your courses.</p>
        </div>
        <button onclick="promptScheduleLiveClass()" class="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow transition flex items-center gap-2">
          <span>📹</span> + Schedule Live Session
        </button>
      </div>

      <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div class="px-6 py-4 border-b border-slate-100 font-bold text-sm text-slate-800">
          My Engineering Programs (${myCourses.length} Courses Assigned)
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs text-slate-600">
            <thead class="bg-slate-50 uppercase text-[10px] text-slate-500 font-bold">
              <tr>
                <th class="px-6 py-3">Course Name</th>
                <th class="px-6 py-3">Curriculum Breakdown</th>
                <th class="px-6 py-3 text-right">Upload &amp; Manage</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              ${myCourses.map(c => `
                <tr>
                  <td class="px-6 py-4 font-bold text-slate-900">${c.title}</td>
                  <td class="px-6 py-4">${c.sections.length} Modules • ${c.sections.reduce((a, s) => a + s.lectures.length, 0)} Lessons</td>
                  <td class="px-6 py-4 text-right space-x-3">
                    <button onclick="promptAddSection('${c.id}')" class="text-blue-600 font-bold hover:underline">+ Module</button>
                    <button onclick="promptAddLecture('${c.id}')" class="text-emerald-600 font-bold hover:underline">📹 + Video Lecture</button>
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
// ADMIN & SUPER ADMIN OPERATIONS
// -------------------------------------------------------------
function renderAdminView() {
  if (!state.currentUser || !['ADMIN', 'SUPER_ADMIN'].includes(state.currentUser.role)) {
    return `<div class="p-12 text-center text-rose-600 font-bold">Access Denied: Administrative access required.</div>`;
  }

  const isSuper = state.currentUser.role === 'SUPER_ADMIN';
  const totalStudents = state.users.filter(u => u.role === 'STUDENT').length;
  const grossRevenue = state.purchases.reduce((acc, p) => acc + (p.paymentStatus === 'PAID' ? p.total : 0), 0);

  return `
    <div class="max-w-7xl mx-auto px-4 py-12 space-y-8">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span class="text-xs uppercase font-bold ${isSuper ? 'text-rose-600' : 'text-amber-600'} tracking-wider">
            ${isSuper ? 'Super Admin Console (Director)' : 'Operations Admin Hub'}
          </span>
          <h1 class="text-3xl font-extrabold text-slate-900 mt-1">${state.currentUser.name} (${state.currentUser.email})</h1>
          <p class="text-slate-500 text-xs mt-1">Upload lectures across all courses, manage student access, and oversee live sessions.</p>
        </div>
        <div class="flex gap-2">
          <button onclick="promptScheduleLiveClass()" class="px-3 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg shadow">+ Schedule Live Class</button>
        </div>
      </div>

      <!-- KPI Cards -->
      <div class="grid grid-cols-2 ${isSuper ? 'md:grid-cols-4' : 'md:grid-cols-3'} gap-4">
        ${isSuper ? `
          <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <span class="text-xs font-bold text-slate-400 uppercase">Gross Revenue</span>
            <div class="text-2xl font-black text-emerald-600 mt-1">₹${grossRevenue.toLocaleString('en-IN')}</div>
            <span class="text-[10px] text-slate-400">Razorpay Verified</span>
          </div>
        ` : ''}
        <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <span class="text-xs font-bold text-slate-400 uppercase">Registered Students</span>
          <div class="text-2xl font-black text-slate-900 mt-1">${totalStudents}</div>
        </div>
        <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <span class="text-xs font-bold text-slate-400 uppercase">Active Enrollments</span>
          <div class="text-2xl font-black text-blue-600 mt-1">${state.enrollments.filter(e => e.status === 'ACTIVE').length}</div>
        </div>
        <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <span class="text-xs font-bold text-slate-400 uppercase">Total Courses</span>
          <div class="text-2xl font-black text-slate-900 mt-1">${state.courses.length}</div>
        </div>
      </div>

      <!-- Universal Course Management -->
      <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div class="px-6 py-4 border-b border-slate-100 font-bold text-sm text-slate-800 flex justify-between items-center">
          <span>All Courses — Upload Lectures &amp; Manage Modules</span>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs text-slate-600">
            <thead class="bg-slate-50 uppercase text-[10px] text-slate-500 font-bold">
              <tr>
                <th class="px-6 py-3">Program Title</th>
                <th class="px-6 py-3">Assigned Faculty</th>
                <th class="px-6 py-3">Curriculum Structure</th>
                <th class="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              ${state.courses.map(c => `
                <tr>
                  <td class="px-6 py-4 font-bold text-slate-900">${c.title}</td>
                  <td class="px-6 py-4 font-semibold text-blue-600">${c.instructorId}</td>
                  <td class="px-6 py-4">${c.sections.length} Modules • ${c.sections.reduce((a, s) => a + s.lectures.length, 0)} Lessons</td>
                  <td class="px-6 py-4 text-right space-x-3">
                    <button onclick="promptAddSection('${c.id}')" class="text-blue-600 font-bold hover:underline">+ Module</button>
                    <button onclick="promptAddLecture('${c.id}')" class="text-emerald-600 font-bold hover:underline">📹 + Video Lecture</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- User Directory Table -->
      <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div class="px-6 py-4 border-b border-slate-100 font-bold text-sm text-slate-800 flex justify-between items-center">
          <span>User Directory &amp; Roles</span>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs text-slate-600">
            <thead class="bg-slate-50 uppercase text-[10px] text-slate-500 font-bold">
              <tr>
                <th class="px-6 py-3">User</th>
                <th class="px-6 py-3">Role</th>
                <th class="px-6 py-3">Status</th>
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
                    ${isSuper && u.email !== state.currentUser.email ? `
                      <select onchange="changeUserRole('${u.id}', this.value)" class="bg-slate-50 border border-slate-300 rounded px-2 py-1 text-xs font-semibold text-slate-700">
                        <option value="STUDENT" ${u.role === 'STUDENT' ? 'selected' : ''}>STUDENT</option>
                        <option value="INSTRUCTOR" ${u.role === 'INSTRUCTOR' ? 'selected' : ''}>INSTRUCTOR</option>
                        <option value="ADMIN" ${u.role === 'ADMIN' ? 'selected' : ''}>ADMIN</option>
                        <option value="SUPER_ADMIN" ${u.role === 'SUPER_ADMIN' ? 'selected' : ''}>SUPER_ADMIN</option>
                      </select>
                    ` : `
                      <span class="font-bold text-blue-600 uppercase text-[11px]">${u.role}</span>
                    `}
                  </td>
                  <td class="px-6 py-4">
                    <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${u.active ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}">
                      ${u.active ? 'Active' : 'Locked'}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-right space-x-2">
                    ${u.email !== state.currentUser.email ? `
                      <button onclick="toggleUserStatus('${u.id}')" class="text-blue-600 font-bold hover:underline">${u.active ? 'Lock' : 'Unlock'}</button>
                    ` : '<span class="text-slate-400 text-[10px]">Current Session</span>'}
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
// COURSE CONTENT UPLOADS & MUTATIONS
// -------------------------------------------------------------
function promptAddSection(courseId) {
  const course = state.courses.find(c => c.id === courseId);
  if (!course) return;
  const title = prompt("Enter Module Title (e.g., Module 3: Advanced Hydronics):");
  if (!title) return;
  course.sections.push({ id: "s-" + Date.now(), title, lectures: [] });
  saveState();
  alert(`Module "${title}" added to ${course.title}.`);
  navigate(currentRoute);
}

function promptAddLecture(courseId) {
  const course = state.courses.find(c => c.id === courseId);
  if (!course || course.sections.length === 0) {
    alert("Please add at least one module first before adding lectures.");
    return;
  }
  const title = prompt("Enter Lecture / Video Title:");
  if (!title) return;
  const videoUrl = prompt("Enter MP4 Video URL (or leave blank for standard test stream):") || "https://vjs.zencdn.net/v/oceans.mp4";
  const duration = parseInt(prompt("Enter duration in seconds:", "46")) || 46;

  course.sections[0].lectures.push({ id: "l-" + Date.now(), title, duration, videoUrl });
  saveState();
  alert(`Video Lecture "${title}" successfully uploaded to ${course.title}!`);
  navigate(currentRoute);
}

function promptScheduleLiveClass() {
  const title = prompt("Enter Live Session Title:");
  if (!title) return;
  const platform = prompt("Platform (Zoom, Google Meet, or YouTube Live):", "Zoom") || "Zoom";
  const joinUrl = prompt("Enter Meeting Link:", "https://zoom.us") || "https://zoom.us";
  const courseId = state.courses[0]?.id || "c-mechanical";

  state.liveClasses.unshift({
    id: "live-" + Date.now(),
    courseId,
    title,
    platform,
    joinUrl,
    scheduledDate: new Date(Date.now() + 86400000 * 2).toISOString(),
    instructorName: state.currentUser.name,
    isCompleted: false
  });

  saveState();
  alert("Live session scheduled and broadcasted!");
  navigate(currentRoute);
}

function changeUserRole(userId, newRole) {
  const user = state.users.find(u => u.id === userId);
  if (user) {
    user.role = newRole;
    saveState();
    alert(`Role updated: ${user.name} is now ${newRole}.`);
    renderNav();
    navigate('admin');
  }
}

function toggleUserStatus(userId) {
  const user = state.users.find(u => u.id === userId);
  if (user) {
    user.active = !user.active;
    saveState();
    navigate('admin');
  }
}

// -------------------------------------------------------------
// CHECKOUT & PAYMENT ENGINE
// -------------------------------------------------------------
function openCheckoutModal(courseId) {
  if (!state.currentUser) {
    alert("Authentication Required: Please sign in before enrolling.");
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
          <div>
            <h3 class="text-lg font-bold text-slate-900">Secure Razorpay Checkout</h3>
            <span class="text-[11px] text-slate-400">Student: ${state.currentUser.name} (${state.currentUser.email})</span>
          </div>
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
            <span>Total Amount Payable:</span>
            <span class="text-blue-600">₹${total.toLocaleString('en-IN')}</span>
          </div>
        </div>

        <div class="pt-2 space-y-2">
          <button onclick="launchRazorpayCheckout(${subtotal}, ${tax}, ${total})" class="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow flex items-center justify-center gap-2 transition">
            <span>💳</span> Pay ₹${total.toLocaleString('en-IN')} via Razorpay
          </button>
          
          <button onclick="simulateSandboxPayment(${subtotal}, ${tax}, ${total})" class="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-[11px] font-semibold transition">
            Simulate Instant Test Payment (Without Live Key)
          </button>
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', html);
}

function launchRazorpayCheckout(subtotal, tax, total) {
  if (typeof Razorpay === 'undefined') {
    alert("Razorpay SDK is still loading. Please try again in a moment.");
    return;
  }

  if (RAZORPAY_KEY_ID === "rzp_test_YOUR_KEY_HERE" && !window.DYNAMIC_RAZORPAY_KEY) {
    const enteredKey = prompt("Enter your Razorpay Key ID (starts with rzp_test_ or rzp_live_):", "rzp_test_");
    if (!enteredKey || enteredKey === "rzp_test_") {
      alert("Key ID required. You can use 'Simulate Instant Test Payment' in the meantime.");
      return;
    }
    window.DYNAMIC_RAZORPAY_KEY = enteredKey.trim();
  }

  const keyToUse = window.DYNAMIC_RAZORPAY_KEY || RAZORPAY_KEY_ID;

  const options = {
    "key": keyToUse,
    "amount": total * 100,
    "currency": "INR",
    "name": "Educare Training Institute",
    "description": pendingCheckoutCourse.title,
    "image": "https://educare-hazel.vercel.app/favicon.ico",
    "handler": function (response) {
      const paymentId = response.razorpay_payment_id || "pay_" + Math.random().toString(36).substring(2, 10);
      completePaymentAndEnroll(subtotal, tax, total, paymentId, "Razorpay Online Gateway");
    },
    "prefill": {
      "name": state.currentUser.name,
      "email": state.currentUser.email,
      "contact": "9876543210"
    },
    "theme": { "color": "#2563EB" }
  };

  try {
    const rzp = new Razorpay(options);
    rzp.on('payment.failed', function (resp) {
      alert("Payment Failed: " + resp.error.description);
    });
    rzp.open();
  } catch (err) {
    alert("Could not open Razorpay window: " + err.message);
  }
}

function simulateSandboxPayment(subtotal, tax, total) {
  const dummyTxn = "pay_sim_" + Math.random().toString(36).substring(2, 10);
  completePaymentAndEnroll(subtotal, tax, total, dummyTxn, "Razorpay Sandbox Simulator");
}

function completePaymentAndEnroll(subtotal, tax, total, transactionId, paymentMethod) {
  const invNum = "INV-2026-" + Math.floor(1000 + Math.random() * 9000);
  const now = new Date();
  const expiry = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);

  state.purchases.unshift({
    id: "pur-" + Date.now(),
    invoiceNumber: invNum,
    userId: state.currentUser.email,
    studentName: state.currentUser.name,
    courseId: pendingCheckoutCourse.id,
    courseTitle: pendingCheckoutCourse.title,
    amount: subtotal,
    tax: tax,
    total: total,
    paymentMethod: paymentMethod,
    paymentStatus: "PAID",
    transactionId: transactionId,
    paidAt: now.toISOString()
  });

  const existingIdx = state.enrollments.findIndex(e => e.userId === state.currentUser.email && e.courseId === pendingCheckoutCourse.id);
  if (existingIdx >= 0) {
    state.enrollments[existingIdx].status = "ACTIVE";
    state.enrollments[existingIdx].expiresAt = expiry.toISOString();
  } else {
    state.enrollments.push({
      id: "enr-" + Date.now(),
      userId: state.currentUser.email,
      courseId: pendingCheckoutCourse.id,
      enrolledAt: now.toISOString(),
      expiresAt: expiry.toISOString(),
      status: "ACTIVE",
      transactionId: transactionId,
      amountPaid: subtotal,
      invoiceNumber: invNum
    });
  }

  saveState();

  const modal = document.getElementById('active-checkout-modal');
  if (modal) modal.remove();

  alert(`Payment Confirmed!\nPayment ID: ${transactionId}\nInvoice #${invNum} generated.\n365-Day License Activated!`);
  navigate('dashboard');
}

function showPolicyModal(key) {
  const p = activePolicies[key];
  if (!p) return;
  alert(`${p.title}\n\n${p.sections.map(s => `${s.heading}:\n${s.body}`).join('\n\n')}`);
}

function showContactModal() {
  const c = activePolicies.contact;
  if (!c) return;
  alert(`Educare Institute Contact\n\nAdmissions: ${c.admissionsEmail}\nSupport: ${c.supportEmail}\nPhone: ${c.phone}\nAddress: ${c.address}`);
}

function startLearning(courseId) {
  const course = state.courses.find(c => c.id === courseId);
  const firstLecture = course.sections[0]?.lectures[0];
  if (firstLecture) {
    navigate('learn', { courseId: course.id, lectureId: firstLecture.id });
  }
}

function startEducareApp() {
  try {
    navigate('home');
  } catch (err) {
    console.error("Educare startup failed:", err);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startEducareApp);
} else {
  startEducareApp();
}
