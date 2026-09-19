// courses-data.js — The 4 Core Engineering Launch Courses

const RELIABLE_VIDEOS = {
  stream1: "https://vjs.zencdn.net/v/oceans.mp4",
  stream2: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
  stream3: "https://www.w3schools.com/html/mov_bbb.mp4"
};

const INITIAL_COURSES = [
  {
    id: "c-mechanical",
    slug: "mechanical-engineering",
    title: "Mechanical",
    discipline: "HVAC & Thermal Systems",
    instructorId: "instructor@educare.local",
    instructorName: "Er. Rajesh Sharma (Senior MEP Lead)",
    shortDescription: "Complete industrial HVAC design, ventilation principles, duct sizing, and equipment selection.",
    description: "A comprehensive practical engineering course covering thermodynamics fundamentals, HVAC load estimation, ductwork layout and friction losses, hydronic piping, and equipment scheduling according to international standards.",
    sections: [
      {
        id: "s-mech-1",
        title: "Module 1: HVAC Fundamentals & Load Calculations",
        lectures: [
          { id: "l-m-1", title: "1. Introduction to HVAC & Psychrometric Charts", duration: 46, videoUrl: RELIABLE_VIDEOS.stream1 },
          { id: "l-m-2", title: "2. Heat Load Estimation & Building Envelopes", duration: 5, videoUrl: RELIABLE_VIDEOS.stream2 },
          { id: "l-m-3", title: "3. Air Handling Units (AHU) & Chiller Cycles", duration: 10, videoUrl: RELIABLE_VIDEOS.stream3 }
        ]
      },
      {
        id: "s-mech-2",
        title: "Module 2: Duct Design & Hydronic Piping",
        lectures: [
          { id: "l-m-4", title: "4. Equal Friction Duct Sizing & Diffuser Layouts", duration: 46, videoUrl: RELIABLE_VIDEOS.stream1 },
          { id: "l-m-5", title: "5. Chilled Water Pump Head Calculations", duration: 5, videoUrl: RELIABLE_VIDEOS.stream2 }
        ]
      }
    ],
    resources: [
      { id: "r-m-1", title: "HVAC_Load_Calculation_Formulae.pdf", size: "2.1 MB" },
      { id: "r-m-2", title: "Duct_Sizing_Friction_Chart.png", size: "920 KB" }
    ],
    quizzes: [
      {
        id: "q-m-1",
        title: "Mechanical Module 1 Assessment",
        passingScore: 70,
        questions: [
          {
            id: "qq-m-1",
            questionText: "Which property is represented on the horizontal axis of a psychrometric chart?",
            options: ["Relative Humidity", "Dry-Bulb Temperature", "Enthalpy", "Dew Point"],
            correctAnswerIndex: 1
          },
          {
            id: "qq-m-2",
            questionText: "What is the primary method used for low-velocity air conditioning duct sizing?",
            options: ["Equal Friction Method", "Constant Velocity Method", "Static Regain Method only", "Direct Approximation"],
            correctAnswerIndex: 0
          }
        ]
      }
    ]
  },
  {
    id: "c-electrical",
    slug: "electrical-engineering",
    title: "Electrical",
    discipline: "Power Systems & Industrial Wiring",
    instructorId: "instructor@educare.local",
    instructorName: "Er. Priya Nair (Chief Electrical Engineer)",
    shortDescription: "Industrial wiring, single-line diagrams (SLD), panel board schedules, and transformer sizing.",
    description: "Master modern building electrical engineering: load calculations, cable selection, voltage drop analysis, circuit breakers, main distribution boards (MDB), earthing design, and emergency backup generator sizing.",
    sections: [
      {
        id: "s-elec-1",
        title: "Module 1: Single-Line Diagrams & Load Schedules",
        lectures: [
          { id: "l-e-1", title: "1. Principles of Power Distribution Networks", duration: 46, videoUrl: RELIABLE_VIDEOS.stream1 },
          { id: "l-e-2", title: "2. Connected Load vs Maximum Demand Calculations", duration: 5, videoUrl: RELIABLE_VIDEOS.stream2 },
          { id: "l-e-3", title: "3. Cable Tray Routing & Cable Sizing Standards", duration: 10, videoUrl: RELIABLE_VIDEOS.stream3 }
        ]
      },
      {
        id: "s-elec-2",
        title: "Module 2: Protection, Earthing & Panels",
        lectures: [
          { id: "l-e-4", title: "4. MCB, MCCB, and ACB Protection Coordination", duration: 46, videoUrl: RELIABLE_VIDEOS.stream1 },
          { id: "l-e-5", title: "5. Earthing Systems & Lightning Protection", duration: 5, videoUrl: RELIABLE_VIDEOS.stream2 }
        ]
      }
    ],
    resources: [
      { id: "r-e-1", title: "Electrical_Cable_Selection_Guide.pdf", size: "3.4 MB" },
      { id: "r-e-2", title: "Standard_SLD_Sample_Layout.png", size: "1.2 MB" }
    ],
    quizzes: [
      {
        id: "q-e-1",
        title: "Electrical Load Sizing Quiz",
        passingScore: 70,
        questions: [
          {
            id: "qq-e-1",
            questionText: "Diversity factor is defined as the ratio of:",
            options: ["Sum of individual maximum demands to coincident maximum demand", "Connected load to running load", "Voltage drop to source voltage", "Power factor to efficiency"],
            correctAnswerIndex: 0
          }
        ]
      }
    ]
  },
  {
    id: "c-plumbing",
    slug: "plumbing-engineering",
    title: "Plumbing",
    discipline: "Public Health Engineering (PHE)",
    instructorId: "instructor@educare.local",
    instructorName: "Er. K. V. Raman (Senior PHE Consultant)",
    shortDescription: "Water supply systems, drainage network design, pipe sizing, and rainwater harvesting.",
    description: "Covers water storage tank capacities, booster pumping systems, gravity water distribution, soil and waste drainage stacks, venting systems, septic tank sizing, and stormwater drainage systems.",
    sections: [
      {
        id: "s-plumb-1",
        title: "Module 1: Domestic Water Supply Design",
        lectures: [
          { id: "l-p-1", title: "1. Water Demand Estimation & Storage Tanks", duration: 46, videoUrl: RELIABLE_VIDEOS.stream1 },
          { id: "l-p-2", title: "2. Hydro-Pneumatic Pumping Systems", duration: 5, videoUrl: RELIABLE_VIDEOS.stream2 },
          { id: "l-p-3", title: "3. Water Distribution Pipe Sizing (Fixture Units)", duration: 10, videoUrl: RELIABLE_VIDEOS.stream3 }
        ]
      },
      {
        id: "s-plumb-2",
        title: "Module 2: Sanitation, Drainage & Stormwater",
        lectures: [
          { id: "l-p-4", title: "4. Two-Pipe vs One-Pipe Drainage Systems", duration: 46, videoUrl: RELIABLE_VIDEOS.stream1 },
          { id: "l-p-5", title: "5. Traps, Vent Stacks & Manhole Layouts", duration: 5, videoUrl: RELIABLE_VIDEOS.stream2 }
        ]
      }
    ],
    resources: [
      { id: "r-p-1", title: "Water_Demand_Fixture_Unit_Tables.pdf", size: "1.9 MB" }
    ],
    quizzes: [
      {
        id: "q-p-1",
        title: "PHE Systems Fundamentals Assessment",
        passingScore: 70,
        questions: [
          {
            id: "qq-p-1",
            questionText: "What is the primary function of a vent stack in building drainage?",
            options: ["To drain rainwater", "To prevent siphonage of water seals in traps", "To increase water pressure", "To filter solid waste"],
            correctAnswerIndex: 1
          }
        ]
      }
    ]
  },
  {
    id: "c-autocad-revit",
    slug: "autocad-revit-bim",
    title: "AutoCAD & Revit",
    discipline: "Computer-Aided Design & BIM Modeling",
    instructorId: "instructor@educare.local",
    instructorName: "Ar. Sneha Patel (Certified BIM Professional)",
    shortDescription: "Professional 2D drafting in AutoCAD and 3D architectural & MEP modeling in Autodesk Revit.",
    description: "Gain hands-on proficiency in industry-standard CAD and Building Information Modeling (BIM). Learn layer management, dimensioning standards, family modeling, clash detection, documentation sheets, and MEP coordination.",
    sections: [
      {
        id: "s-bim-1",
        title: "Module 1: AutoCAD 2D Engineering Drafting",
        lectures: [
          { id: "l-b-1", title: "1. Workspace Setup, Layers & Precision Drawing", duration: 46, videoUrl: RELIABLE_VIDEOS.stream1 },
          { id: "l-b-2", title: "2. Blocks, Dynamic Attributes & Sheet Sets", duration: 5, videoUrl: RELIABLE_VIDEOS.stream2 },
          { id: "l-b-3", title: "3. Engineering Plan & Elevation Drafting", duration: 10, videoUrl: RELIABLE_VIDEOS.stream3 }
        ]
      },
      {
        id: "s-bim-2",
        title: "Module 2: Autodesk Revit 3D BIM Modeling",
        lectures: [
          { id: "l-b-4", title: "4. Revit Interface, Grids, Levels & Walls", duration: 46, videoUrl: RELIABLE_VIDEOS.stream1 },
          { id: "l-b-5", title: "5. MEP Duct & Conduit Modeling in Revit", duration: 5, videoUrl: RELIABLE_VIDEOS.stream2 }
        ]
      }
    ],
    resources: [
      { id: "r-b-1", title: "AutoCAD_Shortcuts_and_Standards.pdf", size: "2.7 MB" },
      { id: "r-b-2", title: "Revit_MEP_Sample_Template.png", size: "1.5 MB" }
    ],
    quizzes: [
      {
        id: "q-b-1",
        title: "CAD & BIM Proficiency Assessment",
        passingScore: 70,
        questions: [
          {
            id: "qq-b-1",
            questionText: "In Building Information Modeling (BIM), what does Revit primarily use to generate floor plans, sections, and 3D views?",
            options: ["Separate detached 2D drawings", "A single unified central database model", "Raster images", "Text-based scripts"],
            correctAnswerIndex: 1
          }
        ]
      }
    ]
  }
];
