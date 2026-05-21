/**
 * Single source of truth for all landing-page copy.
 * Keeps marketing text out of components so it can later be moved into i18n.
 */

export const landingContent = {
  brand: {
    name: "EduSmart K-12",
    tagline: "Smart Online Learning System",
  },

  nav: [
    { label: "Home", href: "#home" },
    { label: "Features", href: "#features" },
    { label: "Blog", href: "#news" },
    { label: "About Us", href: "#about" },
  ],

  hero: {
    eyebrow: "Studying",
    headline: "Online is now",
    headlineLine2: "much easier",
    description:
      "EduSmart K-12 is a smart online learning system built for Ethiopian students, teachers, parents, and administrators — interactive lessons, live classes, and progress tracking in one place.",
    primaryCta: { label: "Join for free", to: "/register" },
    secondaryCta: { label: "Watch how it works", to: "#features" },
    badges: {
      assisted: { value: "250k+", label: "Assisted Students" },
      class: {
        title: "Live Math Class",
        time: "Today at 12:00 PM",
        cta: "Join Now",
      },
      congrats: {
        title: "Congratulations",
        subtitle: "Your admission is approved",
      },
    },
    /** Education-themed Unsplash photo of a smiling student. */
    image:
      "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=900&q=80",
    imageAlt: "A smiling student holding her notebooks",
  },

  trusted: {
    title: "Trusted by 200+ schools across Ethiopia",
    partners: [
      "Ministry of Education",
      "Addis Academy",
      "Hawassa Online",
      "Bahir Dar Tech",
      "UNICEF Ethiopia",
      "Mekelle Smart",
    ],
  },

  cloudSoftware: {
    eyebrow: "All-In-One",
    title: "All-in-One Cloud Software.",
    description:
      "EduSmart K-12 brings every classroom tool — live lessons, assignments, quizzes, and progress tracking — into a single secure platform that works on any device.",
    features: [
      {
        icon: "BookOpen",
        title: "Online Billing, Invoicing, & Contracts",
        body: "Simple and secure school billing with role-based access for admins, parents, and finance staff.",
        accent: "amber",
      },
      {
        icon: "Calendar",
        title: "Easy Scheduling & Attendance Tracking",
        body: "Plan timetables, mark attendance, and sync schedules with parents in one click.",
        accent: "brand",
      },
      {
        icon: "BarChart3",
        title: "Customer Tracking",
        body: "Track every student's progress, engagement, and performance across subjects.",
        accent: "rose",
      },
    ],
  },

  whatIs: {
    eyebrow: "What is EduSmart K-12?",
    title: "What is EduSmart K-12?",
    description:
      "EduSmart K-12 is a smart online learning system built for Ethiopian K-12 education — connecting students, teachers, and parents in one shared learning experience.",
    image:
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=80",
    imageAlt: "Group of students learning together",
    tabs: [
      {
        key: "instructors",
        label: "FOR INSTRUCTORS",
        title: "For Instructors",
        body:
          "Plan lessons, run live classes, grade assignments, and monitor every student's progress from a single intuitive dashboard.",
        cta: "Start a class today",
      },
      {
        key: "students",
        label: "FOR STUDENTS",
        title: "For Students",
        body:
          "Join live classes, complete assignments, take quizzes, and follow your learning path — all in one place, on any device.",
        cta: "Enter the classroom",
      },
      {
        key: "parents",
        label: "FOR PARENTS",
        title: "For Parents",
        body:
          "Stay connected with your child's progress: see grades, attendance, and teacher feedback in real time.",
        cta: "Track progress",
      },
    ],
  },

  physical: {
    title: "EduSmart’s Tools Helps Teachers Create An Online Classroom As Helpful As A Physical One.",
    body:
      "Replicate the structure of a real classroom online: live discussions, breakout study groups, hands-on quizzes, and visible progress for every student.",
    cta: "Get Started Now",
    image:
      "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=900&q=80",
    imageAlt: "Teacher delivering an online lesson",
  },

  featuresHeader: {
    titleStart: "Our",
    titleAccent: "Features",
    body:
      "This very extraordinary feature, can make learning activities more efficient.",
  },

  classroomUi: {
    title: "A user interface designed for the classroom",
    bullets: [
      "Teachers don't get lost in settings — controls stay simple and consistent.",
      "Quick attendance, polls, and reactions keep every student engaged.",
      "Built-in moderation and clear roles keep the classroom focused.",
    ],
    image:
      "https://images.unsplash.com/photo-1610484826917-0f101a7e1d72?auto=format&fit=crop&w=900&q=80",
    imageAlt: "Online classroom video grid",
  },

  toolsForTeachers: {
    title: "Tools for Teachers and Learners",
    body:
      "Classes, quizzes, assignments, polls, and shared resources — everything teachers and learners need to communicate, collaborate, and assess understanding.",
    image:
      "https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=900&q=80",
    imageAlt: "Teacher and student using a tablet",
  },

  quizzes: {
    title: "Assessments, Quizzes, Tests",
    body:
      "Easily build interactive quizzes and tests. Auto-grading and instant feedback help students learn from every answer.",
    image:
      "https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=900&q=80",
    imageAlt: "A student taking a quiz on a laptop",
  },

  classManagement: {
    title: "Class Management",
    body:
      "Keep your gradebook, attendance, and assignments organized in one place. Roster sync, bulk actions, and exportable reports save hours every week.",
    image:
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=900&q=80",
    imageAlt: "Gradebook on a laptop screen",
  },

  oneOnOne: {
    title: "One-on-One Discussions",
    body:
      "Private chat and 1-on-1 video sessions let teachers give targeted help and parents stay close to their child's learning.",
    image:
      "https://images.unsplash.com/photo-1573497019418-b400bb3ab074?auto=format&fit=crop&w=900&q=80",
    imageAlt: "Two people on a video call",
  },

  integrations: {
    eyebrow: "Integrations",
    title: "Everything You Need In One Place",
    body:
      "EduSmart K-12 plugs into the tools your school already uses — single sign-on, calendars, email, and storage.",
    items: [
      "Google Workspace",
      "Microsoft 365",
      "Zoom",
      "Telebirr",
      "Khan Academy",
      "YouTube EDU",
    ],
  },

  testimonial: {
    eyebrow: "Testimonial",
    quote:
      "EduSmart K-12 changed how our school runs. Teachers spend less time on paperwork and more time teaching, and parents finally have full visibility into their children's progress.",
    author: "Mrs. Hanna Bekele",
    role: "Principal, Addis Academy",
    image:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80",
  },

  news: {
    eyebrow: "Latest News & Resources",
    title: "Latest News and Resources",
    body:
      "See the latest updates, classroom tips, and product announcements from the EduSmart team.",
    items: [
      {
        category: "NEWS",
        title: "EduSmart K-12 reaches 200 schools across Ethiopia",
        image:
          "https://images.unsplash.com/photo-1497486751825-1233686d5d80?auto=format&fit=crop&w=600&q=80",
      },
      {
        category: "GUIDE",
        title: "5 ways to keep students engaged in live online classes",
        image:
          "https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=600&q=80",
      },
      {
        category: "PRODUCT",
        title: "New gradebook export and parent reports are here",
        image:
          "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=600&q=80",
      },
    ],
  },

  footer: {
    description:
      "EduSmart K-12 — a smart online learning system built for Ethiopian schools, families, and educators.",
    columns: [
      {
        title: "Company",
        links: ["About Us", "Careers", "Press", "Contact"],
      },
      {
        title: "Product",
        links: ["Features", "Pricing", "Security", "Roadmap"],
      },
      {
        title: "Resources",
        links: ["Help Center", "Community", "Tutorials", "Status"],
      },
      {
        title: "Legal",
        links: ["Privacy", "Terms", "Cookies", "Accessibility"],
      },
    ],
    copyright: "© 2026 EduSmart K-12. All rights reserved.",
  },
} as const;
