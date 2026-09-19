// policies-data.js — Public Institution Info, Legal Policies & Contact Data

const POLICIES_DATA = {
  institution: {
    name: "Educare Technical Training Institute",
    tagline: "Premier Vocational & Engineering Skills Academy",
    about: "Educare is a specialized technical training institution dedicated to bridging the gap between academic theory and practical engineering execution. We provide structured, industry-aligned training programs in core engineering disciplines and cutting-edge design software. Our courses are developed by practicing industry professionals to equip students and working engineers with job-ready competencies.",
    stats: [
      { label: "Core Engineering Streams", value: "4 Disciplines" },
      { label: "Practical Focus", value: "100% Industry Aligned" },
      { label: "Access Mode", value: "Self-Paced & Structured" },
      { label: "Platform Model", value: "Student-Login Enabled" }
    ]
  },
  contact: {
    email: "admissions@educare.local",
    supportEmail: "support@educare.local",
    phone: "+91 98765 43210",
    hours: "Monday – Saturday: 9:00 AM – 6:00 PM IST",
    address: "Educare Learning Complex, Knowledge Corridor, Tech Park Road, Bengaluru, Karnataka, India"
  },
  announcements: [
    {
      id: "ann-1",
      title: "New Batch Curriculum Released for MEP Disciplines",
      date: "Current Session",
      badge: "Curriculum",
      content: "Updated modules for Mechanical HVAC, Electrical Wiring, and Plumbing have been published with revised standard calculation guidelines."
    },
    {
      id: "ann-2",
      title: "AutoCAD & Revit BIM Lab Modules Online",
      date: "Announcement",
      badge: "Design Suite",
      content: "Complete 2D drafting and 3D architectural BIM coordination lessons are now accessible for enrolled engineering students."
    }
  ],
  privacyPolicy: {
    title: "Privacy Policy",
    lastUpdated: "Version 1.0 (Phase 1 MVP)",
    sections: [
      {
        heading: "1. Information We Collect",
        body: "We collect basic student account information including name, email address, course enrollments, lecture progress timestamps, and assessment scores. We do not collect payment card information or sensitive financial details on this platform."
      },
      {
        heading: "2. How Information is Used",
        body: "Your information is used strictly to provide educational services: recording lecture completion, preserving video resume positions, evaluating quizzes, and managing student course access."
      },
      {
        heading: "3. Data Protection & Cookies",
        body: "We use browser local storage and secure session identifiers solely for maintaining login states and playback progress. We do not sell, rent, or trade student data to third-party advertisers."
      }
    ]
  },
  termsConditions: {
    title: "Terms & Conditions",
    lastUpdated: "Version 1.0 (Phase 1 MVP)",
    sections: [
      {
        heading: "1. Platform Usage & Account Responsibility",
        body: "Educare provides technical courses for authorized student use. Users must provide accurate profile details and maintain the confidentiality of their login credentials."
      },
      {
        heading: "2. Intellectual Property Rights",
        body: "All curriculum structures, video lessons, downloadable reference PDFs, and quiz assessments are the intellectual property of Educare and its faculty. Content may not be copied, redistributed, or broadcast without express permission."
      },
      {
        heading: "3. Access Restrictions",
        body: "Unenrolled visitors may browse the public catalog, syllabus structures, and public announcements. Full video lessons and study materials require student login and course enrollment."
      }
    ]
  },
  refundPolicy: {
    title: "Refund & Cancellation Policy",
    lastUpdated: "Version 1.0 (Phase 1 MVP)",
    sections: [
      {
        heading: "1. Current Access Status",
        body: "During this initial deployment phase, course access is granted through student registration and enrollment without mandatory upfront billing. Course fees may be enabled in future phases."
      },
      {
        heading: "2. Future Paid Enrollments",
        body: "When fee payment structures are activated, students will be eligible for a full cancellation and refund within 7 calendar days of enrollment provided less than 25% of the course lectures have been completed."
      },
      {
        heading: "3. Dispute & Support Inquiries",
        body: "For all enrollment cancellation or access requests, students can reach the support desk at support@educare.local."
      }
    ]
  }
};
