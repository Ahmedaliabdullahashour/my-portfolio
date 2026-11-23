const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const Project = require('../models/Project');
const Skill = require('../models/Skill');
const Experience = require('../models/Experience');
const Education = require('../models/Education');
const PortfolioSettings = require('../models/PortfolioSettings');
const INITIAL_SETTINGS = {
  name: 'Ahmed Ali Abdullah Ashour',
  shortName: 'Ahmed Ashour',
  title: 'Front-End Developer',
  tagline: 'I design and build fast, accessible interfaces for the modern web.',
  intro:
    'Front-end developer focused on Angular, TypeScript and thoughtful UI engineering. I turn complex requirements into clean, responsive experiences that feel effortless to use.',
  bio: [
    'I am Ahmed Ali Abdullah Ashour, a front-end developer with a strong interest in interface design and the engineering behind it. My work sits at the intersection of clean architecture and visual craft — components that are reusable, accessible and pleasant to interact with.',
    'I study Computer Science at the Faculty of Obour University for Science and Technology, where I build a solid foundation in algorithms, object-oriented programming and system analysis. Alongside my studies I keep sharpening my front-end stack: HTML, CSS, JavaScript, TypeScript and Angular, with Node.js, Express.js and MongoDB on the backend side.',
    'I enjoy turning ideas into shipped products: planning the data model, structuring an Angular application into clear feature boundaries, and polishing motion, spacing and typography until the interface feels right. I am currently open to junior front-end roles, internships and freelance collaborations.',
  ],
  careerGoals: [
    'Grow into a front-end engineer who owns complete product experiences.',
    'Contribute to production Angular applications with clean, testable architecture.',
    'Deepen my full-stack skills with Node.js, Express.js and MongoDB.',
    'Keep accessibility and performance as defaults, not afterthoughts.',
  ],
  email: 'ahmed.ashour@example.com',
  location: 'Egypt',
  availability: 'Open to junior roles, internships & freelance work',
  cvUrl: 'assets/cv/ahmed-ashour-cv.pdf',
  profileImage: 'assets/images/profile.svg',
  socialImage: 'assets/images/social-preview.svg',
  socials: [
    { label: 'GitHub', icon: 'github', url: '' },
    { label: 'LinkedIn', icon: 'linkedin', url: '' },
    { label: 'Email', icon: 'mail', url: 'mailto:ahmed.ashour@example.com' },
  ],
};

const INITIAL_SKILLS = [
  { name: 'HTML', level: 95, category: 'Frontend', icon: 'code', note: 'Semantic, accessible markup' },
  { name: 'CSS', level: 92, category: 'Frontend', icon: 'palette', note: 'Responsive layouts & motion' },
  { name: 'JavaScript', level: 88, category: 'Frontend', icon: 'braces', note: 'Modern ES features' },
  { name: 'TypeScript', level: 86, category: 'Frontend', icon: 'file-code', note: 'Typed, maintainable code' },
  { name: 'Angular', level: 85, category: 'Frontend', icon: 'layers', note: 'Standalone, signals, routing' },
  { name: 'Node.js', level: 78, category: 'Backend', icon: 'server', note: 'APIs & tooling' },
  { name: 'Express.js', level: 76, category: 'Backend', icon: 'route', note: 'REST endpoints' },
  { name: 'MongoDB', level: 72, category: 'Backend', icon: 'database', note: 'Schemas & queries' },
  { name: 'C++', level: 80, category: 'Programming', icon: 'cpu', note: 'Data structures & logic' },
  { name: 'OOP', level: 85, category: 'Programming', icon: 'boxes', note: 'Reusable object design' },
  { name: 'Algorithms', level: 75, category: 'Computer Science', icon: 'git-branch', note: 'Problem solving' },
  { name: 'System Analysis', level: 78, category: 'Computer Science', icon: 'workflow', note: 'Requirements & modelling' },
];

const INITIAL_PROJECTS = [
  {
    title: 'Aurora — Analytics Dashboard',
    description: 'A dark analytics dashboard concept with responsive charts, filter chips and a component-driven layout.',
    longDescription: 'A sample dashboard built to demonstrate information hierarchy, data-dense layouts and reusable card components. Includes a collapsible sidebar, KPI tiles and a filterable activity feed.',
    image: 'assets/images/projects/aurora.svg',
    imageAlt: 'Abstract preview of the Aurora analytics dashboard',
    technologies: ['Angular', 'TypeScript', 'CSS', 'Signals'],
    category: 'Frontend',
    githubUrl: 'https://github.com',
    liveUrl: 'https://example.com',
    featured: true,
    order: 1,
    year: '2026',
    highlights: [
      'Reusable dashboard shell and widget components',
      'Responsive grid that reflows cleanly on mobile',
      'Signal-based state with loading skeletons',
    ],
    isDemo: false,
  },
  {
    title: 'Nova — E-Commerce Storefront',
    description: 'A full-stack storefront demo with product filtering, a cart drawer and a REST API backed by MongoDB.',
    longDescription: 'Sample storefront showing a complete product browsing flow: category filters, product cards, a cart summary and an order form.',
    image: 'assets/images/projects/nova.svg',
    imageAlt: 'Abstract preview of the Nova storefront',
    technologies: ['Angular', 'Express.js', 'MongoDB', 'TypeScript'],
    category: 'Full-Stack',
    githubUrl: 'https://github.com',
    liveUrl: 'https://example.com',
    featured: true,
    order: 2,
    year: '2026',
    highlights: [
      'Typed API contracts shared with the Node.js layer',
      'Cart state and optimistic UI updates',
      'Mobile-first product grid',
    ],
    isDemo: false,
  },
  {
    title: 'Atlas — Task Workspace',
    description: 'A minimal task workspace with drag-free kanban columns, keyboard-friendly workflows and calm motion.',
    longDescription: 'Concept product exploring productivity UI: boards, quick capture and a compact activity timeline.',
    image: 'assets/images/projects/atlas.svg',
    imageAlt: 'Abstract preview of the Atlas task workspace',
    technologies: ['TypeScript', 'Angular', 'RxJS'],
    category: 'Frontend',
    githubUrl: 'https://github.com',
    liveUrl: 'https://example.com',
    featured: false,
    order: 3,
    year: '2025',
    highlights: ['Keyboard-first interactions', 'Optimistic state updates', 'Reduced-motion friendly'],
    isDemo: false,
  },
  {
    title: 'Pulse — Weather Interface',
    description: 'A weather experience with animated conditions, saved locations and a fully responsive layout.',
    longDescription: 'Interface study focused on data visualisation, atmospheric backgrounds and typography at small sizes.',
    image: 'assets/images/projects/pulse.svg',
    imageAlt: 'Abstract preview of the Pulse weather interface',
    technologies: ['Angular', 'CSS', 'REST API'],
    category: 'Frontend',
    githubUrl: 'https://github.com',
    liveUrl: 'https://example.com',
    featured: false,
    order: 4,
    year: '2025',
    highlights: ['Animated weather states', 'Persistent saved locations', 'Accessible contrast'],
    isDemo: false,
  },
  {
    title: 'Meridian — Design System',
    description: 'A token-driven design system: typography scale, color primitives and documented component states.',
    longDescription: 'A small design system pack covering tokens, buttons, inputs, cards and layout primitives.',
    image: 'assets/images/projects/meridian.svg',
    imageAlt: 'Abstract preview of the Meridian design system',
    technologies: ['CSS', 'Design Tokens', 'HTML'],
    category: 'UI / UX',
    githubUrl: 'https://github.com',
    liveUrl: 'https://example.com',
    featured: false,
    order: 5,
    year: '2025',
    highlights: ['CSS custom-property theming', 'Documented states', 'Zero UI dependencies'],
    isDemo: false,
  },
  {
    title: 'Scholar — Course Platform',
    description: 'A course platform concept with lesson progress, a reading view and an instructor dashboard shell.',
    longDescription: 'Learning platform concept demonstrating nested routing, progress tracking and content-heavy layouts.',
    image: 'assets/images/projects/scholar.svg',
    imageAlt: 'Abstract preview of the Scholar course platform',
    technologies: ['Angular', 'TypeScript', 'Node.js'],
    category: 'Full-Stack',
    githubUrl: 'https://github.com',
    liveUrl: 'https://example.com',
    featured: false,
    order: 6,
    year: '2026',
    highlights: ['Nested feature routing', 'Progress persistence', 'Content-first typography'],
    isDemo: false,
  },
];

const INITIAL_EXPERIENCE = [
  {
    role: 'Front-End Developer',
    company: 'Tech Solutions Co.',
    location: 'Cairo, Egypt',
    startDate: '2024',
    endDate: 'Present',
    description: 'Developing high-performance responsive web applications using Angular, TypeScript, and modern CSS.',
    technologies: ['Angular', 'TypeScript', 'CSS', 'RxJS'],
    isPlaceholder: false,
    order: 1,
  },
  {
    role: 'Junior Web Developer Intern',
    company: 'Digital Innovation Lab',
    location: 'Giza, Egypt',
    startDate: '2023',
    endDate: '2024',
    description: 'Collaborated on client projects, built interactive UI components, and integrated REST APIs.',
    technologies: ['JavaScript', 'HTML5', 'CSS3', 'Node.js'],
    isPlaceholder: false,
    order: 2,
  },
];

const INITIAL_EDUCATION = [
  {
    institution: 'Obour University for Science and Technology',
    faculty: 'Faculty of Computer Science',
    degree: "Bachelor's Degree in Computer Science",
    startYear: '2022',
    endYear: '2026',
    location: 'Egypt',
    description: 'Studying computer science with an emphasis on algorithms, object-oriented design, database architecture, and web systems.',
    relevantCourses: [
      'Data Structures & Algorithms',
      'Object-Oriented Programming',
      'System Analysis & Design',
      'Database Systems',
    ],
    isPlaceholder: false,
    order: 1,
  },
];

async function seed() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('MONGO_URI is not set.');
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log('[Seed] Connected to database');

  // Seed Admin User
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@portfolio.local';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123456';
  let admin = await User.findOne({ email: adminEmail });
  if (!admin) {
    await User.create({ email: adminEmail, password: adminPassword });
    console.log(`[Seed] Created admin account: ${adminEmail}`);
  } else {
    console.log(`[Seed] Admin account already exists: ${adminEmail}`);
  }

  // Seed Settings
  const settingsCount = await PortfolioSettings.countDocuments();
  if (settingsCount === 0) {
    await PortfolioSettings.create(INITIAL_SETTINGS);
    console.log('[Seed] Seeded Portfolio Settings');
  }

  // Seed Projects
  const projectsCount = await Project.countDocuments();
  if (projectsCount === 0) {
    await Project.insertMany(INITIAL_PROJECTS);
    console.log(`[Seed] Seeded ${INITIAL_PROJECTS.length} projects`);
  }

  // Seed Skills
  const skillsCount = await Skill.countDocuments();
  if (skillsCount === 0) {
    await Skill.insertMany(INITIAL_SKILLS);
    console.log(`[Seed] Seeded ${INITIAL_SKILLS.length} skills`);
  }

  // Seed Experience
  const expCount = await Experience.countDocuments();
  if (expCount === 0) {
    await Experience.insertMany(INITIAL_EXPERIENCE);
    console.log(`[Seed] Seeded ${INITIAL_EXPERIENCE.length} experience records`);
  }

  // Seed Education
  const eduCount = await Education.countDocuments();
  if (eduCount === 0) {
    await Education.insertMany(INITIAL_EDUCATION);
    console.log(`[Seed] Seeded ${INITIAL_EDUCATION.length} education records`);
  }

  console.log('[Seed] Database seeding completed successfully.');
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('[Seed] Seeding failed:', err);
  process.exit(1);
});
