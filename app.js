// app.js — Educare Production Core LMS Controller

// =============================================================
// YOUR CONFIGURED PRODUCTION CREDENTIALS
// =============================================================
const GOOGLE_CLIENT_ID = "927965375944-06v891q36rs6vnu9stasjuk0kq8mli33.apps.googleusercontent.com";
const RAZORPAY_KEY_ID = "rzp_live_TdsETGp7PHolSJ";
const RAZORPAY_PAYMENT_URL = "https://razorpay.me/@educare7642";

// Helper: Detect and convert any YouTube URL into an embed link
function getYouTubeEmbedUrl(url) {
  if (!url || typeof url !== 'string') return null;
  const regExp = /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/;
  const match = url.match(regExp);
  return (match && match[1]) ? `https://www.youtube.com/embed/${match[1]}?enablejsapi=1&rel=0&modestbranding=1` : null;
}

// =============================================================
// 4 CORE ENGINEERING LAUNCH COURSES (PRESERVED)
// =============================================================
const FALLBACK_COURSES = [
  {
    id: "c-mechanical",
    slug: "mechanical-engineering",
    title: "Mechanical: Industrial HVAC & Thermal Design",
    discipline: "HVAC, Thermodynamics & MEP",
    price: 6499,
    validityDays: 365,
    instructorId: "educaresir99@gmail.com",
    instructorName: "Educare Faculty (educaresir99@gmail.com)",
    shortDescription: "Complete industrial HVAC design, ventilation principles, duct sizing, and equipment selection.",
    description: "An industry-accredited training program covering thermodynamics fundamentals, psychrometric analysis, building heat load calculations using E20/ASHRAE standards, equal-friction duct sizing, chilled water pump head calculations, and AHU air-side design.",
    sections: [
      {
        id: "s-mech-1",
        title: "Module 1: HVAC Fundamentals & Psychrometric Analysis",
        lectures: [
          { id: "l-m-1", title: "1. Psychrometric Chart Dynamics & Thermal Comfort", duration: 46, videoUrl: "https://vjs.zencdn.net/v/oceans.mp4" },
          { id: "l-m-2", title: "2. Building Envelope Heat Gain & E-20 Sheets", duration: 5, videoUrl: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4" },
          { id: "l-m-3", title: "3. Air Handling Units (AHU) & Chilled Water Loops", duration: 10, videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4" }
        ]
      },
      {
        id: "s-mech-2",
        title: "Module 2: Duct Design, Air Distribution & Pump Sizing",
        lectures: [
          { id: "l-m-4", title: "4. Equal Friction Duct Sizing & Diffuser Layouts", duration: 46, videoUrl: "https://vjs.zencdn.net/v/oceans.mp4" },
          { id: "l-m-5", title: "5. Hydraulic Pump Head Calculation & Pipe Sizing", duration: 5, videoUrl: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4" }
        ]
      }
    ],
    resources: [{ id: "r-m-1", title: "ASHRAE_HVAC_Design_Manual.pdf", size: "3.2 MB" }],
    quizzes: []
  },
  {
    id: "c-electrical",
    slug: "electrical-engineering",
    title: "Electrical: Industrial Power Distribution & SLD",
    discipline: "Power Distribution & Control Panels",
    price: 5999,
    validityDays: 365,
    instructorId: "educaresir99@gmail.com",
    instructorName: "Educare Faculty (educaresir99@gmail.com)",
    shortDescription: "Industrial wiring, Single-Line Diagrams (SLD), panel board design, and transformer sizing.",
    description: "Master modern power engineering: connected load vs. maximum demand calculations, busbar trunking systems, voltage drop analysis, circuit breakers, and earthing design.",
    sections: [
      {
        id: "s-elec-1",
        title: "Module 1: Load Calculations & Single-Line Diagrams",
        lectures: [
          { id: "l-e-1", title: "1. Power System Topology & Substation Layouts", duration: 46, videoUrl: "https://vjs.zencdn.net/v/oceans.mp4" },
          { id: "l-e-2", title: "2. Maximum Demand & Diversity Factor Estimation", duration: 5, videoUrl: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4" }
        ]
      }
    ],
    resources: [{ id: "r-e-1", title: "IEC_Standard_Cable_Capacity_Guide.pdf", size: "2.8 MB" }],
    quizzes: []
  },
  {
    id: "c-plumbing",
    slug: "plumbing-engineering",
    title: "Plumbing: Public Health Engineering (PHE) & Fire",
    discipline: "Water Treatment, Drainage & Firefighting",
    price: 4999,
    validityDays: 365,
    instructorId: "educaresir99@gmail.com",
    instructorName: "Educare Faculty (educaresir99@gmail.com)",
    shortDescription: "Water supply networks, drainage systems, hydro-pneumatic pumping, and firefighting hydraulics.",
    description: "Covers water storage tank sizing, booster pumping systems, gravity water distribution, fixture units, soil and waste stack venting, and stormwater drainage.",
    sections: [
      {
        id: "s-plumb-1",
        title: "Module 1: Water Distribution & Storage Systems",
        lectures: [
          { id: "l-p-1", title: "1. Daily Water Demand Calculation & Sump Sizing", duration: 46, videoUrl: "https://vjs.zencdn.net/v/oceans.mp4" },
          { id: "l-p-2", title: "2. Hydro-Pneumatic Pressure Booster Systems", duration: 5, videoUrl: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4" }
        ]
      }
    ],
    resources: [{ id: "r-p-1", title: "UPC_Plumbing_Fixture_Unit_Chart.pdf", size: "2.1 MB" }],
    quizzes: []
  },
  {
    id: "c-autocad-revit",
    slug: "autocad-revit-bim",
    title: "AutoCAD & Revit: 2D Drafting to 3D BIM Modeling",
    discipline: "BIM Architecture & MEP Drafting",
    price: 7999,
    validityDays: 365,
    instructorId: "educaresir99@gmail.com",
    instructorName: "Educare Faculty (educaresir99@gmail.com)",
    shortDescription: "Master 2D engineering drafting in AutoCAD and multidisciplinary 3D BIM modeling in Autodesk Revit.",
    description: "Practical training from 2D floor plans to coordinated 3D BIM models: layer conventions, dynamic blocks, external references (XRefs), Revit parameter management, and family creation.",
    sections: [
      {
        id: "s-bim-1",
        title: "Module 1: AutoCAD 2D Engineering Drafting",
        lectures: [
          { id: "l-b-1", title: "1. Precision Coordinate Systems, Layers & Annotation Styles", duration: 46, videoUrl: "https://vjs.zencdn.net/v/oceans.mp4" },
          { id: "l-b-2", title: "2. Dynamic Attributes, Block Libraries & Viewports", duration: 5, videoUrl: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4" }
        ]
      }
    ],
    resources: [{ id: "r-b-1", title: "AutoCAD_Engineering_Standard_Shortcuts.pdf", size: "2.4 MB" }],
    quizzes: []
  }
];

const DEFAULT_STATE = {
  currentUser: null,
  users: [
    { id: "u-super-edwin", name: "Edwin (Director)", email: "tftxvr@gmail.com", role: "SUPER_ADMIN", active: true, activeSessionId: "sess_super_1", password: "Admin@123" },
    { id: "u-inst-sir", name: "Educare Faculty", email: "educaresir99@gmail.com", role: "INSTRUCTOR", active: true, activeSessionId: "sess_inst_sir", password: "Instructor@123" },
    { id: "u-admin", name: "Course Operations Admin", email: "admin@gmail.com", role: "ADMIN", active: true, activeSessionId: "sess_admin_1", password: "Admin@123" },
    { id: "u-student", name: "Jane Student", email: "student@gmail.com", role: "STUDENT", active: true, activeSessionId: "sess_student_1", password: "Student@123" }
  ],
  courses: FALLBACK_COURSES,
  liveClasses: [
    {
      id: "live-1",
      courseId: "c-mechanical",
      title: "Live MEP Coordination & Chiller Plant Room Walkthrough",
      platform: "Zoom",
      joinUrl: "https://zoom.us",
      scheduledDate: new Date(Date.now() + 86400000 * 2).toISOString(),
      instructorName: "educaresir99@gmail.com",
      isCompleted: false
    }
  ],
  enrollments: [],
  purchases: [],
  progress: {},
  quizAttempts: {},
  auditLogs: [{ id: "log-1", event: "SYSTEM_ONLINE", actor: "System", timestamp: new Date().toISOString(), details: "Platform initialized" }]
};

function loadState() {
  try {
    const stored = localStorage.getItem("educare_prod_v15");
    let parsedState = stored ? JSON.parse(stored) : JSON.parse(JSON.stringify(DEFAULT_STATE));

    if (!parsedState.courses || parsedState.courses.length === 0) {
      parsedState.courses = JSON.parse(JSON.stringify(FALLBACK_COURSES));
    }

    parsedState.courses.forEach(c => {
      c.instructorId = "educaresir99@gmail.com";
      c.instructorName = "Educare Faculty (educaresir99@gmail.com)";
    });

    let superRecord = parsedState.users.find(u => u.email === "tftxvr@gmail.com");
    if (!superRecord) {
      parsedState.users.unshift({ id: "u-super-edwin", name: "Edwin (Director)", email: "tftxvr@gmail.com", role: "SUPER_ADMIN", active: true, password: "Admin@123" });
    } else {
      superRecord.role = "SUPER_ADMIN";
      if (!superRecord.password) superRecord.password = "Admin@123";
    }

    let instRecord = parsedState.users.find(u => u.email === "educaresir99@gmail.com");
    if (!instRecord) {
      parsedState.users.push({ id: "u-inst-sir", name: "Educare Faculty", email: "educaresir99@gmail.com", role: "INSTRUCTOR", active: true, password: "Instructor@123" });
    } else {
      instRecord.role = "INSTRUCTOR";
      if (!instRecord.password) instRecord.password = "Instructor@123";
    }

    return parsedState;
  } catch {
    return JSON.parse(JSON.stringify(DEFAULT_STATE));
  }
}

function saveState() {
  try {
    localStorage.setItem("educare_prod_v15", JSON.stringify(state));
  } catch (err) {
    console.error("Storage error:", err);
  }
}

function resetDemoState() {
  if (confirm("Reset local storage to defaults? All courses and demo accounts will be refreshed.")) {
    localStorage.removeItem("educare_prod_v15");
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
  if (role === 'SUPER_ADMIN' || role === 'ADMIN') navigate('admin');
  else if (role === 'INSTRUCTOR') navigate('instructor');
  else navigate('dashboard');
}

// -------------------------------------------------------------
// AUTHENTICATION LOGIC (GOOGLE SSO + EMAIL/PASSWORD)
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


// =============================================================
// NATIVE PASSWORD ENCRYPTION (SHA-256 VIA WEB CRYPTO API)
// =============================================================
async function hashPassword(plainText) {
  const encoder = new TextEncoder();
  const data = encoder.encode(plainText);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Verifies encrypted password and auto-migrates any legacy plain-text passwords
async function verifyAndMigratePassword(user, enteredPassword) {
  if (!user.password) return true; // Accounts created via Google SSO
  
  const enteredHash = await hashPassword(enteredPassword);

  // 1. Password already encrypted as SHA-256 hash
  if (user.password === enteredHash) {
    return true;
  }

  // 2. Backward-compatibility: Plain-text match -> automatically upgrade to hash
  if (user.password === enteredPassword) {
    user.password = enteredHash;
    saveState(); // Permanently save as encrypted hash
    return true;
  }

  return false;
}


function handleGoogleCredentialResponse(response) {
  if (!response || !response.credential) return;
  const profile = parseJwt(response.credential);
  if (profile && profile.email) {
    loginWithGoogleProfile(profile.email, profile.name || profile.email.split('@')[0], profile.sub);
  }
}

function handleGoogleAuth() {
  if (typeof google !== 'undefined' && google.accounts && google.accounts.oauth2) {
    try {
      const tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
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
          alert("Google Sign-In Error: " + (err.message || "Ensure https://educare-hazel.vercel.app is in Authorized JavaScript origins in Google Cloud"));
        }
      });
      tokenClient.requestAccessToken({ prompt: 'consent' });
    } catch (err) {
      alert("Google popup error: " + err.message);
    }
  } else {
    alert("Google Identity Services is loading. Please try again.");
  }
}

function initOfficialGoogleButton() {
  const btnContainer = document.getElementById("google-signin-btn");
  if (!btnContainer) return;

  if (typeof google !== 'undefined' && google.accounts && google.accounts.id) {
    try {
      google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
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

    const newUser = { id: "u-" + Date.now(), name: nameInput || emailInput.split('@')[0], email: emailInput, role: roleAssigned, password: passwordInput, active: true, activeSessionId: sessId };
    state.users.push(newUser);
    state.currentUser = { email: newUser.email, name: newUser.name, role: newUser.role, sessionId: sessId };
    saveState();
    toggleAuthModal(false);
    renderNav();
    alert("Registration successful! Welcome to Educare.");
    redirectAfterLogin(newUser.role);
    return;
  }

  if (!existing) {
    alert("Account not found. Click 'Create an account' below to register.");
    return;
  }
  if (!existing.active) {
    alert("Account Locked by Administrator.");
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

  if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons();
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
  if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons();
}

function renderHomeView() {
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
  const isStaff = state.currentUser && ['SUPER_ADMIN', 'ADMIN', 'INSTRUCTOR'].includes(state.currentUser.role);
  const enrollment = state.currentUser ? state.enrollments.find(e => e.userId === state.currentUser.email && e.courseId === c.id) : null;
  const isEnrolled = isStaff || (!!enrollment && enrollment.status === 'ACTIVE');
  const lectureCount = c.sections ? c.sections.reduce((acc, s) => acc + s.lectures.length, 0) : 0;

  return `
    <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition">
      <div>
        <div class="flex justify-between items-center mb-3">
          ${
            isStaff
              ? '<span class="text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-800 px-2.5 py-1 rounded-full">✓ Staff Access — Unlocked</span>'
              : isEnrolled
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
        <span class="text-xs text-slate-500">${isStaff ? 'Master Access' : 'Validity: 365 Days'}</span>
        ${
          isEnrolled
            ? `<button onclick="startLearning('${c.id}')" class="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition">
                 Watch Lectures →
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

  const isStaff = state.currentUser && ['SUPER_ADMIN', 'ADMIN', 'INSTRUCTOR'].includes(state.currentUser.role);
  const enrollment = state.currentUser ? state.enrollments.find(e => e.userId === state.currentUser.email && e.courseId === course.id) : null;
  const isEnrolled = isStaff || (!!enrollment && enrollment.status === 'ACTIVE');
  const totalLectures = course.sections ? course.sections.reduce((acc, s) => acc + s.lectures.length, 0) : 0;

  return `
    <div class="max-w-5xl mx-auto px-4 py-12 space-y-8">
      <div class="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between gap-8">
        <div class="space-y-4 max-w-2xl">
          ${
            isStaff
              ? `<div class="inline-block text-xs font-bold bg-purple-100 text-purple-800 px-3 py-1 rounded-full">✓ ${state.currentUser.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Admin'} Master Privilege</div>`
              : isEnrolled
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
            ${
              isStaff
                ? `<div>
                     <span class="text-[11px] font-bold uppercase text-purple-700 font-semibold">Staff Privilege</span>
                     <div class="text-2xl font-black text-slate-900 mt-1">Full Access</div>
                     <p class="text-[11px] text-slate-400 mt-1">Unlimited Staff Stream</p>
                   </div>`
                : `<div>
                     <span class="text-[11px] font-bold uppercase text-slate-500">Program Tuition</span>
                     <div class="text-3xl font-black text-slate-900 mt-1">₹${course.price.toLocaleString('en-IN')}</div>
                     <p class="text-[11px] text-slate-400 mt-1">+18% GST • 365 Days Access</p>
                   </div>`
            }
          </div>

          <div class="mt-6">
            ${
              isStaff || isEnrolled
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

  const isStaff = state.currentUser && ['SUPER_ADMIN', 'ADMIN', 'INSTRUCTOR'].includes(state.currentUser.role);
  const enrollment = state.currentUser ? state.enrollments.find(e => e.userId === state.currentUser.email && e.courseId === course.id) : null;
  const isEnrolled = isStaff || (!!enrollment && enrollment.status === 'ACTIVE');

  if (!isEnrolled) {
    return `
      <div class="max-w-md mx-auto my-20 p-8 bg-white border border-slate-200 rounded-2xl text-center space-y-4 shadow-sm">
        <i data-lucide="lock" class="w-10 h-10 text-amber-500 mx-auto"></i>
        <h2 class="text-xl font-bold">Course Access Restricted</h2>
        <p class="text-slate-500 text-xs">Please sign in and complete enrollment to stream lectures.</p>
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

  const isCurrentLectureDone = state.currentUser && state.progress[state.currentUser.email]?.[activeLecture.id]?.completed;
  const ytEmbedUrl = getYouTubeEmbedUrl(activeLecture.videoUrl);

  const currentIndex = allLectures.findIndex(l => l.id === activeLecture.id);
  const prevLecture = allLectures[currentIndex - 1];
  const nextLecture = allLectures[currentIndex + 1];

  return `
    <div class="bg-slate-950 text-slate-100 min-h-[calc(100vh-4rem)] flex flex-col lg:flex-row">
      <div class="flex-1 p-4 lg:p-8 overflow-y-auto">
        <div class="max-w-4xl mx-auto space-y-6">
          
          <div class="relative bg-black rounded-2xl overflow-hidden border border-slate-800 shadow-2xl aspect-video select-none">
            ${
              ytEmbedUrl
                ? `
                   <iframe
                     id="live-player-yt"
                     src="${ytEmbedUrl}"
                     title="${activeLecture.title}"
                     class="w-full h-full border-0"
                     allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                     allowfullscreen
                   ></iframe>
                   <div class="absolute top-0 left-0 right-0 h-16 z-20 bg-transparent cursor-default" onclick="event.stopPropagation()"></div>
                   <div class="absolute bottom-0 left-0 w-28 h-12 z-20 bg-transparent cursor-default" onclick="event.stopPropagation()"></div>
                   <div class="absolute bottom-0 right-0 w-44 h-12 z-20 bg-transparent cursor-default" onclick="event.stopPropagation()"></div>
                  `
                : `
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
                  `
            }
          </div>

          <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div>
              <div class="text-xs text-emerald-400 font-semibold uppercase tracking-wider flex items-center gap-1">
                <span>✓ ${isStaff ? 'Staff Privilege Access' : 'Active License'}:</span> ${course.title}
              </div>
              <h1 class="text-2xl font-bold text-white mt-1">${activeLecture.title}</h1>
              <div class="flex items-center gap-3 mt-1.5">
                <span class="text-xs text-slate-400" id="progress-status">
                  ${isCurrentLectureDone ? '✓ Lesson Completed' : (ytEmbedUrl ? 'Protected YouTube Stream' : 'Tracking progress...')}
                </span>
                ${
                  state.currentUser && state.currentUser.role === 'STUDENT'
                    ? `<button onclick="toggleLectureCompletion('${course.id}', '${activeLecture.id}')" class="px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                        isCurrentLectureDone ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }">
                        <i data-lucide="check" class="w-3.5 h-3.5"></i>
                        ${isCurrentLectureDone ? 'Completed' : 'Mark Lesson Completed'}
                      </button>`
                    : ''
                }
              </div>
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

function toggleLectureCompletion(courseId, lectureId) {
  if (!state.currentUser) return;
  if (!state.progress[state.currentUser.email]) state.progress[state.currentUser.email] = {};
  const current = state.progress[state.currentUser.email][lectureId] || { seconds: 0, completed: false };
  current.completed = !current.completed;
  state.progress[state.currentUser.email][lectureId] = current;
  saveState();
  navigate('learn', { courseId, lectureId });
}

function renderStudentDashboardView() {
  if (!state.currentUser) return `<div class="p-8 text-center">Please sign in.</div>`;
  const userEnrollments = state.enrollments.filter(e => e.userId === state.currentUser?.email);
  const enrolledCourses = state.courses.filter(c => userEnrollments.some(e => e.courseId === c.id));
  const userProgress = state.progress[state.currentUser?.email] || {};

  return `
    <div class="max-w-7xl mx-auto px-4 py-12 space-y-10">
      <div>
        <span class="text-xs uppercase font-bold text-emerald-600 tracking-wider">Student Academic Center</span>
        <h1 class="text-3xl font-extrabold text-slate-900 mt-1">Welcome back, ${state.currentUser?.name || 'Student'}</h1>
      </div>

      <div class="grid md:grid-cols-2 gap-6">
        ${enrolledCourses.map(course => {
          const lectures = course.sections.flatMap(s => s.lectures);
          const completed = lectures.filter(l => userProgress[l.id]?.completed).length;
          const pct = lectures.length > 0 ? Math.round((completed / lectures.length) * 100) : 0;
          const nextLecture = lectures.find(l => !userProgress[l.id]?.completed) || lectures[0];

          return `
            <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
              <div>
                <span class="text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded">Active 365 Days</span>
                <h3 class="text-xl font-bold text-slate-900 mt-3">${course.title}</h3>
                <p class="text-slate-500 text-xs mt-1 line-clamp-2">${course.shortDescription}</p>
              </div>
              <div class="mt-6 pt-4 border-t border-slate-100 flex gap-2">
                <button onclick="navigate('learn', { courseId: '${course.id}', lectureId: '${nextLecture?.id}' })" class="flex-1 py-2.5 bg-slate-900 hover:bg-blue-600 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2">
                  <i data-lucide="play" class="w-4 h-4 fill-current"></i> Resume Learning (${pct}%)
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
// INSTRUCTOR STUDIO
// -------------------------------------------------------------
function renderInstructorDashboardView() {
  if (!state.currentUser || state.currentUser.role !== 'INSTRUCTOR') {
    return `<div class="p-12 text-center text-rose-600 font-bold">Access Denied: Instructor portal only.</div>`;
  }
  const myCourses = state.courses.filter(c => c.instructorId === state.currentUser.email);

  return `
    <div class="max-w-7xl mx-auto px-4 py-12 space-y-8">
      <div class="flex justify-between items-center">
        <div>
          <span class="text-xs uppercase font-bold text-indigo-600 tracking-wider">Faculty Studio</span>
          <h1 class="text-3xl font-extrabold text-slate-900 mt-1">${state.currentUser.name} (${state.currentUser.email})</h1>
        </div>
        <button onclick="promptScheduleLiveClass()" class="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow transition">
          + Schedule Live Session
        </button>
      </div>

      <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div class="px-6 py-4 border-b border-slate-100 font-bold text-sm text-slate-800">
          My Engineering Programs (${myCourses.length} Assigned)
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs text-slate-600">
            <thead class="bg-slate-50 uppercase text-[10px] text-slate-500 font-bold">
              <tr>
                <th class="px-6 py-3">Course Name</th>
                <th class="px-6 py-3">Curriculum Structure</th>
                <th class="px-6 py-3 text-right">Upload &amp; Delete Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              ${myCourses.map(c => `
                <tr>
                  <td class="px-6 py-4 font-bold text-slate-900">${c.title}</td>
                  <td class="px-6 py-4">${c.sections.length} Modules • ${c.sections.reduce((a, s) => a + s.lectures.length, 0)} Lessons</td>
                  <td class="px-6 py-4 text-right space-x-3">
                    <button onclick="promptAddSection('${c.id}')" class="text-blue-600 font-bold hover:underline">+ Module</button>
                    <button onclick="promptAddLecture('${c.id}')" class="text-emerald-600 font-bold hover:underline">📹 + Video</button>
                    <button onclick="promptDeleteLecture('${c.id}')" class="text-rose-600 font-bold hover:underline">🗑 Delete Video</button>
                    <button onclick="promptDeleteSection('${c.id}')" class="text-slate-500 font-bold hover:underline">🗑 Delete Module</button>
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
    return `<div class="p-12 text-center text-rose-600 font-bold">Access Denied.</div>`;
  }
  const isSuper = state.currentUser.role === 'SUPER_ADMIN';
  const studentsList = state.users.filter(u => u.role === 'STUDENT');
  const grossRevenue = state.purchases.reduce((acc, p) => acc + (p.paymentStatus === 'PAID' ? p.total : 0), 0);

  return `
    <div class="max-w-7xl mx-auto px-4 py-12 space-y-8">
      <div class="flex justify-between items-center">
        <div>
          <span class="text-xs uppercase font-bold ${isSuper ? 'text-rose-600' : 'text-amber-600'} tracking-wider">
            ${isSuper ? 'Super Admin Console (Director)' : 'Operations Admin Hub'}
          </span>
          <h1 class="text-3xl font-extrabold text-slate-900 mt-1">${state.currentUser.name} (${state.currentUser.email})</h1>
        </div>
        <button onclick="promptScheduleLiveClass()" class="px-3 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg shadow">+ Schedule Live Class</button>
      </div>

      <div class="grid grid-cols-2 ${isSuper ? 'md:grid-cols-4' : 'md:grid-cols-3'} gap-4">
        ${isSuper ? `
          <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <span class="text-xs font-bold text-slate-400 uppercase">Gross Revenue</span>
            <div class="text-2xl font-black text-emerald-600 mt-1">₹${grossRevenue.toLocaleString('en-IN')}</div>
          </div>
        ` : ''}
        <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <span class="text-xs font-bold text-slate-400 uppercase">Registered Students</span>
          <div class="text-2xl font-black text-slate-900 mt-1">${studentsList.length}</div>
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

      <!-- Student Directory -->
      <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div class="px-6 py-4 border-b border-slate-100 font-bold text-sm text-slate-800 flex justify-between items-center">
          <span>Registered Students Directory (${studentsList.length} Students)</span>
          <span class="text-xs text-slate-400">Full Names &amp; Verified Emails</span>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs text-slate-600">
            <thead class="bg-slate-50 uppercase text-[10px] text-slate-500 font-bold">
              <tr>
                <th class="px-6 py-3">Student Full Name</th>
                <th class="px-6 py-3">Email Address</th>
                <th class="px-6 py-3">Enrolled Program(s)</th>
                <th class="px-6 py-3">Status</th>
                <th class="px-6 py-3 text-right">Account Control</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              ${studentsList.map(s => {
                const studentEnrollments = state.enrollments.filter(e => e.userId === s.email && e.status === 'ACTIVE');
                const courseNames = studentEnrollments.map(enr => {
                  const c = state.courses.find(course => course.id === enr.courseId);
                  return c ? c.title : enr.courseId;
                });
                return `
                  <tr>
                    <td class="px-6 py-4 font-bold text-slate-900 text-sm">${s.name}</td>
                    <td class="px-6 py-4 font-mono text-blue-600 font-medium">${s.email}</td>
                    <td class="px-6 py-4">
                      ${courseNames.length > 0
                        ? courseNames.map(name => `<span class="inline-block bg-emerald-50 text-emerald-700 text-[11px] font-bold px-2 py-0.5 rounded mr-1">✓ ${name}</span>`).join('')
                        : '<span class="text-slate-400 italic">No enrollments</span>'}
                    </td>
                    <td class="px-6 py-4">
                      <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${s.active ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}">
                        ${s.active ? 'Active' : 'Locked'}
                      </span>
                    </td>
                   <td class="px-6 py-4 text-right space-x-3">
                   <button onclick="toggleUserStatus('${s.id}')" class="text-blue-600 font-bold hover:underline">${s.active ? 'Lock Account' : 'Unlock Account'}</button>
                  <button onclick="promptDeleteStudent('${s.id}')" class="text-rose-600 font-bold hover:underline">🗑 Delete Student</button>
                   </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Universal Course Management With Full Delete -->
      <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div class="px-6 py-4 border-b border-slate-100 font-bold text-sm text-slate-800 flex justify-between items-center">
          <span>All Courses — Upload, Manage &amp; Delete Items</span>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs text-slate-600">
            <thead class="bg-slate-50 uppercase text-[10px] text-slate-500 font-bold">
              <tr>
                <th class="px-6 py-3">Program Title</th>
                <th class="px-6 py-3">Curriculum Breakdown</th>
                <th class="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              ${state.courses.map(c => `
                <tr>
                  <td class="px-6 py-4 font-bold text-slate-900">${c.title}</td>
                  <td class="px-6 py-4">${c.sections.length} Modules • ${c.sections.reduce((a, s) => a + s.lectures.length, 0)} Lessons</td>
                  <td class="px-6 py-4 text-right space-x-3">
                    <button onclick="promptAddSection('${c.id}')" class="text-blue-600 font-bold hover:underline">+ Module</button>
                    <button onclick="promptAddLecture('${c.id}')" class="text-emerald-600 font-bold hover:underline">📹 + Video</button>
                    <button onclick="promptDeleteLecture('${c.id}')" class="text-rose-600 font-bold hover:underline">🗑 Delete Video</button>
                    <button onclick="promptDeleteSection('${c.id}')" class="text-slate-500 font-bold hover:underline">🗑 Delete Module</button>
                    ${isSuper ? `<button onclick="promptDeleteCourse('${c.id}')" class="text-red-700 font-bold hover:underline">🗑 Delete Course</button>` : ''}
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
  const title = prompt("Enter Module Title (e.g., Module 3: Hydronics):");
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
  const videoUrl = prompt("Enter Video Link (YouTube Unlisted link OR direct MP4 link):") || "https://vjs.zencdn.net/v/oceans.mp4";
  const duration = parseInt(prompt("Enter duration in seconds (e.g., 60):", "60"), 10) || 60;

  course.sections[0].lectures.push({ id: "l-" + Date.now(), title, duration, videoUrl });
  saveState();
  alert(`Video Lecture "${title}" successfully added to ${course.title}!`);
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
  alert("Live session scheduled!");
  navigate(currentRoute);
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
// DELETION CONTROLLERS (WITH SAFETY CONFIRMATION)
// -------------------------------------------------------------
function promptDeleteLecture(courseId) {
  const course = state.courses.find(c => c.id === courseId);
  if (!course) return;

  const allLectures = [];
  course.sections.forEach((sec, sIdx) => {
    sec.lectures.forEach((lec, lIdx) => {
      allLectures.push({ sec, sIdx, lec, lIdx, label: `${sec.title} ➔ ${lec.title}` });
    });
  });

  if (allLectures.length === 0) {
    alert("This course has no lectures to delete.");
    return;
  }

  let promptMsg = "Enter the number of the lecture to delete:\n\n";
  allLectures.forEach((item, idx) => {
    promptMsg += `${idx + 1}. ${item.label}\n`;
  });

  const choice = prompt(promptMsg);
  if (!choice) return;

  const index = parseInt(choice.trim(), 10) - 1;
  if (isNaN(index) || index < 0 || index >= allLectures.length) {
    alert("Invalid selection number.");
    return;
  }

  const target = allLectures[index];
  if (confirm(`Are you sure you want to PERMANENTLY delete lecture:\n"${target.lec.title}"?\n\nThis action cannot be undone.`)) {
    target.sec.lectures.splice(target.lIdx, 1);
    saveState();
    alert(`Lecture "${target.lec.title}" deleted.`);
    navigate(currentRoute);
  }
}

function promptDeleteSection(courseId) {
  const course = state.courses.find(c => c.id === courseId);
  if (!course || course.sections.length === 0) {
    alert("This course has no modules to delete.");
    return;
  }

  let promptMsg = "Enter the number of the module to delete:\n\n";
  course.sections.forEach((sec, idx) => {
    promptMsg += `${idx + 1}. ${sec.title} (${sec.lectures.length} lessons)\n`;
  });

  const choice = prompt(promptMsg);
  if (!choice) return;

  const index = parseInt(choice.trim(), 10) - 1;
  if (isNaN(index) || index < 0 || index >= course.sections.length) {
    alert("Invalid selection number.");
    return;
  }

  const targetSec = course.sections[index];
  if (confirm(`WARNING: Are you sure you want to delete module:\n"${targetSec.title}" and its ${targetSec.lectures.length} lecture(s)?`)) {
    course.sections.splice(index, 1);
    saveState();
    alert(`Module "${targetSec.title}" deleted.`);
    navigate(currentRoute);
  }
}

function promptDeleteCourse(courseId) {
  const course = state.courses.find(c => c.id === courseId);
  if (!course) return;

  if (confirm(`DANGER: Are you sure you want to permanently delete the entire course:\n"${course.title}"?\n\nAll modules and lessons will be removed.`)) {
    state.courses = state.courses.filter(c => c.id !== courseId);
    saveState();
    alert(`Course "${course.title}" was deleted.`);
    navigate(currentRoute);
  }
}

// 5. Delete a registered student and clean up all their records
function promptDeleteStudent(studentId) {
  const student = state.users.find(u => u.id === studentId);
  if (!student) return;

  // Prevent accidental self-deletion
  if (state.currentUser && state.currentUser.email === student.email) {
    alert("Action Prohibited: You cannot delete your own active account.");
    return;
  }

  const confirmMsg = `Are you sure you want to PERMANENTLY delete student:\n"${student.name}" (${student.email})?\n\nThis will also remove all their active course enrollments and progress records.`;
  if (!confirm(confirmMsg)) return;

  // 1. Remove from user directory
  state.users = state.users.filter(u => u.id !== studentId);

  // 2. Remove any course enrollments
  state.enrollments = state.enrollments.filter(e => e.userId !== student.email);

  // 3. Remove progress records and quiz history
  if (state.progress && state.progress[student.email]) {
    delete state.progress[student.email];
  }
  if (state.quizAttempts && state.quizAttempts[student.email]) {
    delete state.quizAttempts[student.email];
  }

  saveState();
  alert(`Student "${student.name}" and all associated records have been removed.`);
  navigate(currentRoute);
}

// -------------------------------------------------------------
// CHECKOUT & PAYMENT ENGINE (LIVE RAZORPAY POPUP + DIRECT LINK FALLBACK)
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

        <div class="p-3 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-800 space-y-1">
          <div class="font-bold flex items-center gap-1.5">
            <span>🔒</span> Razorpay Live Gateway
          </div>
          <p class="text-[11px] text-blue-700">UPI (Google Pay, PhonePe, Paytm, QR Code), Cards, and Net Banking supported.</p>
        </div>

        <div class="pt-2 space-y-2">
          <!-- 1. Live Razorpay Popup Attempt -->
          <button onclick="launchRazorpayCheckout(${subtotal}, ${tax}, ${total})" class="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow flex items-center justify-center gap-2 transition">
            <span>💳</span> Pay ₹${total.toLocaleString('en-IN')} via Razorpay
          </button>
          
          <!-- 2. Direct Official Link Fallback -->
          <a 
            href="${RAZORPAY_PAYMENT_URL}" 
            target="_blank" 
            onclick="document.getElementById('confirm-manual-pay').classList.remove('hidden')"
            class="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition text-center"
          >
            <span>🔗</span> Or Pay via Official Razorpay.me Link
          </a>

          <!-- Confirmation for link payment -->
          <div id="confirm-manual-pay" class="hidden pt-2 border-t border-slate-100">
            <button onclick="completePaymentAndEnroll(${subtotal}, ${tax}, ${total}, 'rzp_paid_' + Date.now(), 'Razorpay Live Link')" class="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow transition">
              ✓ I Have Paid — Activate 365-Day License
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', html);
}

function launchRazorpayCheckout(subtotal, tax, total) {
  if (typeof Razorpay === 'undefined') {
    // If external script is blocked, fallback immediately to direct live link
    window.open(RAZORPAY_PAYMENT_URL, '_blank');
    const confirmBox = document.getElementById('confirm-manual-pay');
    if (confirmBox) confirmBox.classList.remove('hidden');
    return;
  }

  const options = {
    "key": RAZORPAY_KEY_ID,
    "amount": total * 100, // in paise
    "currency": "INR",
    "name": "Educare Technical Training Institute",
    "description": pendingCheckoutCourse ? pendingCheckoutCourse.title : "Program Enrollment",
    "image": "https://educare-hazel.vercel.app/favicon.ico",
    "handler": function (response) {
      const paymentId = response.razorpay_payment_id || "pay_" + Math.random().toString(36).substring(2, 10);
      completePaymentAndEnroll(subtotal, tax, total, paymentId, "Razorpay Live Gateway");
    },
    "prefill": {
      "name": state.currentUser ? state.currentUser.name : "Student",
      "email": state.currentUser ? state.currentUser.email : "student@gmail.com",
      "contact": "9876543210"
    },
    "theme": { "color": "#2563EB" }
  };

  try {
    const rzp = new Razorpay(options);
    rzp.on('payment.failed', function (resp) {
      alert("Payment Notice: " + (resp.error ? resp.error.description : "Opening direct payment link."));
      window.open(RAZORPAY_PAYMENT_URL, '_blank');
      const confirmBox = document.getElementById('confirm-manual-pay');
      if (confirmBox) confirmBox.classList.remove('hidden');
    });
    rzp.open();
  } catch (err) {
    console.error("Razorpay popup launch error:", err);
    window.open(RAZORPAY_PAYMENT_URL, '_blank');
    const confirmBox = document.getElementById('confirm-manual-pay');
    if (confirmBox) confirmBox.classList.remove('hidden');
  }
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

  alert(`Payment Confirmed!\nTransaction ID: ${transactionId}\nInvoice #${invNum} generated.\n365-Day License Activated!`);
  navigate('dashboard');
}

function startLearning(courseId) {
  const course = state.courses.find(c => c.id === courseId);
  const firstLecture = course.sections[0]?.lectures[0];
  if (firstLecture) navigate('learn', { courseId: course.id, lectureId: firstLecture.id });
}

function startEducareApp() {
  try {
    navigate('home');
  } catch (err) {
    console.error("Educare startup error:", err);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startEducareApp);
} else {
  startEducareApp();
}
