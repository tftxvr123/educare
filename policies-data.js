// policies-data.js — Institute Profile, Business Contacts & Legal Policies

const POLICIES_DATA = {
  institution: {
    name: "Educare Technical Training Institute",
    tagline: "Premier Vocational & Industrial Engineering Academy",
    about: "Educare is an ISO 9001:2015 accredited technical training academy delivering hands-on engineering programs in Mechanical HVAC, Electrical Systems, Plumbing (PHE), and AutoCAD/Revit BIM Modeling. Our programs are designed and delivered by practicing senior MEP consultants to produce job-ready engineers.",
    regNumber: "EDU-IND-2026-8842",
    stats: [
      { label: "Engineering Disciplines", value: "4 Core Programs" },
      { label: "Accreditation", value: "ISO 9001:2015" },
      { label: "Course Validity", value: "365 Days (1 Year)" },
      { label: "Learning Mode", value: "Recorded + Live Classes" }
    ]
  },
  contact: {
    admissionsEmail: "admissions@educare.org.in",
    supportEmail: "support@educare.org.in",
    adminEmail: "admin@educare.org.in",
    instructorEmail: "instructor@educare.org.in",
    phone: "+91 80 4567 8900",
    whatsapp: "+91 98765 43210",
    hours: "Monday – Saturday: 9:00 AM – 6:30 PM IST",
    address: "Educare Campus, 4th Floor, Tech Hub Tower, Outer Ring Road, Bengaluru, Karnataka 560103, India"
  },
  announcements: [
    {
      id: "ann-1",
      title: "Batch 2026 Admissions & Live Interactive Sessions Announced",
      date: "Active Session",
      badge: "Admissions",
      content: "All enrolled students in Mechanical, Electrical, Plumbing, and AutoCAD & Revit are invited to the upcoming weekend live interactive session on MEP Coordination."
    },
    {
      id: "ann-2",
      title: "Course Validity Policy: 1-Year Unrestricted Access",
      date: "Policy Update",
      badge: "Notice",
      content: "All course enrollments remain active for exactly 365 days from the date of payment confirmation, including video lectures, reference PDFs, and live class archives."
    }
  ],
  privacyPolicy: {
    title: "Privacy Policy & Data Security",
    lastUpdated: "September 2026 — Production Standard",
    sections: [
      {
        heading: "1. Data Collection & Student Profiles",
        body: "Educare collects student identity data (name, email address, phone number), authentication metadata, device session tokens, and lecture watch records. Video progress and quiz scores are retained to maintain course compliance."
      },
      {
        heading: "2. Single Device & Session Enforcement",
        body: "To protect proprietary course materials and intellectual property, Educare strictly enforces one active session per student. When a new login occurs, any previously active session on another device or browser is terminated automatically."
      },
      {
        heading: "3. Payment Information Security",
        body: "All online payments are processed through PCI-DSS Level 1 certified gateways (Razorpay / Stripe). Educare never stores full debit/credit card numbers or CVVs on its servers."
      }
    ]
  },
  termsConditions: {
    title: "Terms & Conditions of Service",
    lastUpdated: "September 2026 — Production Standard",
    sections: [
      {
        heading: "1. 1-Year Course Access License",
        body: "Enrollment grants a personal, non-transferable, single-user license to access the course content for exactly 365 calendar days from the date of payment verification."
      },
      {
        heading: "2. Anti-Piracy & DRM Protection",
        body: "Course videos, live stream sessions, and engineering guides are watermarked and protected. Downloading, screen-recording, or sharing login credentials is a breach of copyright and results in immediate account revocation without refund."
      },
      {
        heading: "3. Completion Certificate Eligibility",
        body: "Certificates of Course Completion are generated only when the student successfully watches 100% of the course lectures and passes the associated module assessments with a minimum score of 70%."
      }
    ]
  },
  refundPolicy: {
    title: "Refund & Cancellation Policy",
    lastUpdated: "September 2026 — Production Standard",
    sections: [
      {
        heading: "1. 7-Day Refund Guarantee",
        body: "Students may request a cancellation and full refund within 7 calendar days of course enrollment, provided they have watched less than 20% of the total course video lectures and have not generated a course certificate."
      },
      {
        heading: "2. Cancellation Procedure",
        body: "Refund requests must be initiated directly from the Invoices & Billing section of the Student Dashboard or by emailing support@educare.org.in with the Invoice Reference ID."
      },
      {
        heading: "3. Settlement Timeline",
        body: "Approved refunds are credited back to the original payment source (UPI, Credit Card, Debit Card, Net Banking) within 5 to 7 business days."
      }
    ]
  }
};
