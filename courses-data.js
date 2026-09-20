// course-data.js — Dynamic Course Syllabi, Live Classes & Seed Data

const RELIABLE_VIDEOS = {
  stream1: "https://vjs.zencdn.net/v/oceans.mp4",
  stream2: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
  stream3: "https://www.w3schools.com/html/mov_bbb.mp4"
};

const INITIAL_COURSES = [
  {
    id: "c-mechanical",
    slug: "mechanical-engineering",
    title: "Mechanical: Industrial HVAC & Thermal Design",
    discipline: "HVAC, Thermodynamics & MEP",
    price: 10,
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
          { id: "l-m-1", title: "1. Psychrometric Chart Dynamics & Thermal Comfort", duration: 46, videoUrl: RELIABLE_VIDEOS.stream1 },
          { id: "l-m-2", title: "2. Building Envelope Heat Gain & E-20 Sheets", duration: 5, videoUrl: RELIABLE_VIDEOS.stream2 },
          { id: "l-m-3", title: "3. Air Handling Units (AHU) & Chilled Water Loops", duration: 10, videoUrl: RELIABLE_VIDEOS.stream3 }
        ]
      },
      {
        id: "s-mech-2",
        title: "Module 2: Duct Design, Air Distribution & Pump Sizing",
        lectures: [
          { id: "l-m-4", title: "4. Equal Friction Duct Sizing & Diffuser Layouts", duration: 46, videoUrl: RELIABLE_VIDEOS.stream1 },
          { id: "l-m-5", title: "5. Hydraulic Pump Head Calculation & Pipe Sizing", duration: 5, videoUrl: RELIABLE_VIDEOS.stream2 }
        ]
      }
    ],
    resources: [
      { id: "r-m-1", title: "ASHRAE_HVAC_Design_Manual.pdf", size: "3.2 MB" },
      { id: "r-m-2", title: "Equal_Friction_Duct_Chart.png", size: "1.1 MB" }
    ],
    quizzes: [
      {
        id: "q-m-1",
        title: "Mechanical HVAC Systems Evaluation",
        passingScore: 70,
        questions: [
          {
            id: "qq-m-1",
            questionText: "Which variable is displayed on the horizontal axis of a psychrometric chart?",
            options: ["Relative Humidity", "Dry-Bulb Temperature", "Enthalpy", "Wet-Bulb Temperature"],
            correctAnswerIndex: 1
          },
          {
            id: "qq-m-2",
            questionText: "What is the primary sizing criterion used for supply air duct branches in commercial HVAC?",
            options: ["Equal Friction Method", "Static Regain only", "Velocity Drop Method", "Volumetric Flow Rate Guess"],
            correctAnswerIndex: 0
          }
        ]
      }
    ]
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
    description: "Master modern power engineering: connected load vs. maximum demand calculations, busbar trunking systems, voltage drop analysis, circuit breakers (MCB, MCCB, ACB), lightning protection, and backup diesel generator sizing.",
    sections: [
      {
        id: "s-elec-1",
        title: "Module 1: Load Calculations & Single-Line Diagrams",
        lectures: [
          { id: "l-e-1", title: "1. Power System Topology & Substation Layouts", duration: 46, videoUrl: RELIABLE_VIDEOS.stream1 },
          { id: "l-e-2", title: "2. Maximum Demand & Diversity Factor Estimation", duration: 5, videoUrl: RELIABLE_VIDEOS.stream2 },
          { id: "l-e-3", title: "3. Cable Selection & Permissible Voltage Drop", duration: 10, videoUrl: RELIABLE_VIDEOS.stream3 }
        ]
      },
      {
        id: "s-elec-2",
        title: "Module 2: Protection Coordination & Earthing",
        lectures: [
          { id: "l-e-4", title: "4. Breaker Sizing & Fault Current Discrimination", duration: 46, videoUrl: RELIABLE_VIDEOS.stream1 },
          { id: "l-e-5", title: "5. Chemical Earthing Design & Surge Suppression", duration: 5, videoUrl: RELIABLE_VIDEOS.stream2 }
        ]
      }
    ],
    resources: [
      { id: "r-e-1", title: "IEC_Standard_Cable_Capacity_Guide.pdf", size: "2.8 MB" }
    ],
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
    description: "Covers water storage tank sizing, booster pumping systems, gravity water distribution, fixture units (FU), soil and waste stack venting, storm water harvesting, and sprinkler hydraulic design.",
    sections: [
      {
        id: "s-plumb-1",
        title: "Module 1: Water Distribution & Storage Systems",
        lectures: [
          { id: "l-p-1", title: "1. Daily Water Demand Calculation & Underground Sump Sizing", duration: 46, videoUrl: RELIABLE_VIDEOS.stream1 },
          { id: "l-p-2", title: "2. Hydro-Pneumatic Pressure Booster Systems", duration: 5, videoUrl: RELIABLE_VIDEOS.stream2 },
          { id: "l-p-3", title: "3. Water Distribution Pipe Sizing using Fixture Units", duration: 10, videoUrl: RELIABLE_VIDEOS.stream3 }
        ]
      }
    ],
    resources: [
      { id: "r-p-1", title: "UPC_Plumbing_Fixture_Unit_Chart.pdf", size: "2.1 MB" }
    ],
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
    description: "Practical training from 2D floor plans to coordinated 3D BIM models: layer conventions, dynamic blocks, external references (XRefs), Revit parameter management, family creation, and MEP coordination.",
    sections: [
      {
        id: "s-bim-1",
        title: "Module 1: AutoCAD 2D Engineering Drafting",
        lectures: [
          { id: "l-b-1", title: "1. Precision Coordinate Systems, Layers & Annotation Styles", duration: 46, videoUrl: RELIABLE_VIDEOS.stream1 },
          { id: "l-b-2", title: "2. Dynamic Attributes, Block Libraries & Viewports", duration: 5, videoUrl: RELIABLE_VIDEOS.stream2 }
        ]
      }
    ],
    resources: [
      { id: "r-b-1", title: "AutoCAD_Engineering_Standard_Shortcuts.pdf", size: "2.4 MB" }
    ],
    quizzes: []
  }
];

const INITIAL_LIVE_CLASSES = [
  {
    id: "live-1",
    courseId: "c-mechanical",
    title: "Live MEP Coordination & Chiller Plant Room Walkthrough",
    platform: "Zoom",
    joinUrl: "https://zoom.us",
    scheduledDate: new Date(Date.now() + 86400000 * 2).toISOString(),
    durationMinutes: 90,
    instructorName: "educaresir99@gmail.com",
    isCompleted: false,
    recordingUrl: null
  }
];
