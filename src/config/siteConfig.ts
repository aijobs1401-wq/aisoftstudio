/**
 * AI SOFT STUDIO - Master Configuration File
 * Easily update studio information, contact details, social links, and showcase data.
 */

export interface ServiceItem {
  id: string;
  number: string;
  title: string;
  description: string;
  highlights: string[];
  gradient: string;
  iconType: 'ai' | 'web' | 'mobile' | 'automation' | 'cloud' | 'design';
  displayOrder?: number;
  published?: boolean;
}

export interface ShowcaseProject {
  id: string;
  title: string;
  subtitle: string;
  category: 'AI' | 'Web' | 'Automation';
  allCategories: ('AI' | 'Web' | 'Automation')[];
  image: string;
  conceptSummary: string;
  challenge: string;
  solution: string;
  technologies: string[];
  metrics: { label: string; value: string }[];
  accentColor: string;
  isConcept?: boolean;
  projectUrl?: string;
  displayOrder?: number;
  published?: boolean;
}

export interface ProcessStep {
  number: string;
  title: string;
  description: string;
  deliverables: string[];
  timeframe: string;
}

export interface TechItem {
  name: string;
  category: 'AI & ML' | 'Frontend' | 'Backend & Cloud' | 'Automation';
  description: string;
}

export const SITE_CONFIG = {
  brand: {
    name: 'AI SOFT STUDIO',
    tagline: 'Futuristic Digital Experience & Software Engineering',
    availabilityBadge: 'AVAILABLE FOR SELECT PROJECTS',
    shortDescription: 'We combine thoughtful design, modern engineering, and intelligent automation to create digital experiences that solve real problems.',
  },
  contact: {
    email: 'hello@aisoftstudio.io',
    secondaryEmail: 'projects@aisoftstudio.io',
    location: 'Distributed Global Studio · Remote-First',
    responseWindow: 'Typically responds within 24 hours',
  },
  socials: [
    { name: 'GitHub', url: 'https://github.com', handle: 'aisoftstudio' },
    { name: 'X / Twitter', url: 'https://twitter.com', handle: '@aisoftstudio' },
    { name: 'LinkedIn', url: 'https://linkedin.com', handle: 'ai-soft-studio' },
    { name: 'Discord', url: 'https://discord.com', handle: 'aisoft-community' },
  ],
  services: [
    {
      id: 'ai-solutions',
      number: '01',
      title: 'AI Solutions',
      description: 'Custom AI integrations, intelligent assistants, AI-powered workflows, and practical business applications.',
      highlights: ['Custom LLM Pipelines', 'Intelligent Agent Swarms', 'Retrieval-Augmented Systems', 'Domain-Specific Workflows'],
      gradient: 'from-violet-500/20 via-fuchsia-500/10 to-transparent',
      iconType: 'ai',
    },
    {
      id: 'web-dev',
      number: '02',
      title: 'Web Development',
      description: 'High-performance websites, web applications, modern frontend architecture, and responsive experiences.',
      highlights: ['Next.js & React Architectures', 'Sub-Second Latency & Core Vitals', 'Design Systems & Component Kits', 'Interactive 3D / WebGL'],
      gradient: 'from-cyan-500/20 via-blue-500/10 to-transparent',
      iconType: 'web',
    },
    {
      id: 'mobile-apps',
      number: '03',
      title: 'Mobile Applications',
      description: 'Android and iOS experiences with intuitive interfaces and scalable architecture.',
      highlights: ['Cross-Platform React Native', 'Native Fluid Gestures', 'Offline-First Synchronization', 'Haptic & Motion Craft'],
      gradient: 'from-blue-500/20 via-indigo-500/10 to-transparent',
      iconType: 'mobile',
    },
    {
      id: 'workflow-automation',
      number: '04',
      title: 'Workflow Automation',
      description: 'Connect business tools, automate repetitive tasks, and streamline operations.',
      highlights: ['Event-Driven Webhook Meshes', 'CRM & ERP Synchronization', 'Zero-Touch Data Pipelines', 'Error Handling & Auto-Retry'],
      gradient: 'from-cyan-400/20 via-violet-500/10 to-transparent',
      iconType: 'automation',
    },
    {
      id: 'cloud-backend',
      number: '05',
      title: 'Cloud & Backend',
      description: 'API development, database architecture, secure integrations, and deployment infrastructure.',
      highlights: ['Distributed Microservices', 'PostgreSQL & Vector Indexes', 'Serverless & Edge Compute', 'Hardened Zero-Trust Auth'],
      gradient: 'from-purple-500/20 via-blue-500/10 to-transparent',
      iconType: 'cloud',
    },
    {
      id: 'ui-ux-branding',
      number: '06',
      title: 'UI/UX & Branding',
      description: 'Digital identity, product interfaces, prototypes, design systems, and conversion-focused experiences.',
      highlights: ['Cinematic Brand Systems', 'Interactive Prototyping', 'WCAG AA Accessibility', 'Conversion UX Optimization'],
      gradient: 'from-fuchsia-500/20 via-cyan-500/10 to-transparent',
      iconType: 'design',
    },
  ] as ServiceItem[],
  projects: [
    {
      id: 'ai-analytics-dashboard',
      title: 'AI Analytics Dashboard',
      subtitle: 'Neural topology monitoring & autonomous agent orchestrator',
      category: 'AI',
      allCategories: ['AI', 'Web'],
      image: '/src/assets/images/concept_ai_dashboard_1792785468334.jpg',
      conceptSummary: 'An enterprise command console built to visualize multi-agent AI execution, real-time inference latency heatmaps, and system throughput.',
      challenge: 'Managing distributed LLM inference clusters across multiple regions often suffers from opaque failure modes and disconnected observability tools.',
      solution: 'Constructed a unified glassmorphic telemetry canvas with real-time neural network graph rendering, automated fallback routing, and proactive anomaly alerts.',
      technologies: ['React 19', 'TypeScript', 'Tailwind CSS', 'Canvas Graph Engine', 'WebSockets', 'Vector Store'],
      metrics: [
        { label: 'Throughput', value: '420+ EPS' },
        { label: 'Latency Reduction', value: '38%' },
        { label: 'Agent Uptime', value: '99.98%' },
      ],
      accentColor: '#8B5CF6',
    },
    {
      id: 'saas-platform-interface',
      title: 'SaaS Platform Interface',
      subtitle: 'Modern enterprise cloud workspace & collaborative analytics suite',
      category: 'Web',
      allCategories: ['Web', 'AI'],
      image: '/src/assets/images/concept_saas_platform_1792785923243.jpg',
      conceptSummary: 'A next-generation enterprise SaaS workspace with multi-tenant team management, real-time resource allocation charts, and fluid dark UI.',
      challenge: 'Modern cloud teams face fragmented tooling, high cognitive load, and sluggish web interfaces that slow down daily operational decision-making.',
      solution: 'Engineered a cohesive workspace with sub-50ms interaction latency, modular analytics widgets, customizable dashboards, and real-time team presence.',
      technologies: ['Next.js', 'TypeScript', 'Tailwind CSS', 'PostgreSQL', 'Server Actions', 'Motion Engine'],
      metrics: [
        { label: 'Lighthouse Score', value: '99/100' },
        { label: 'Task Velocity', value: '+45%' },
        { label: 'Interaction Latency', value: '< 40ms' },
      ],
      accentColor: '#22D3EE',
    },
    {
      id: 'business-automation-control-center',
      title: 'Business Automation Control Center',
      subtitle: 'Autonomous cross-platform pipeline & event trigger mesh',
      category: 'Automation',
      allCategories: ['Automation', 'AI'],
      image: '/src/assets/images/concept_automation_1792785467769.jpg',
      conceptSummary: 'An event-driven enterprise orchestrator that parses unstructured business inbound requests, automates CRM enrichment, and routes tasks automatically.',
      challenge: 'Enterprise sales and support teams lose hundreds of hours manually copy-pasting customer requests across disconnected SaaS silos.',
      solution: 'Designed an intelligent pipeline utilizing AI parsing, dynamic lead scoring, CRM auto-sync, and automated multi-channel follow-up tasks.',
      technologies: ['Node.js', 'Python', 'PostgreSQL', 'Event Streams', 'REST & GraphQL', 'AI Agent Rules'],
      metrics: [
        { label: 'Hours Saved / Wk', value: '140+ hrs' },
        { label: 'Processing Speed', value: '< 2.5s' },
        { label: 'Error Rate', value: '0.02%' },
      ],
      accentColor: '#3B82F6',
    },
  ] as ShowcaseProject[],
  process: [
    {
      number: '01',
      title: 'Discover',
      description: 'We unpack your vision, target audience, technical architecture, and critical business objectives through structured strategic discovery.',
      deliverables: ['Product Architecture Blueprint', 'Technical Feasibility Study', 'UX Journey Mapping'],
      timeframe: 'Week 1',
    },
    {
      number: '02',
      title: 'Design',
      description: 'We shape tactile visual interfaces, interactive motion systems, and scalable component foundations tailored precisely to your brand.',
      deliverables: ['High-Fidelity Interactive Prototypes', 'Production Design System', 'Motion & Spatial Guidelines'],
      timeframe: 'Weeks 2–3',
    },
    {
      number: '03',
      title: 'Build',
      description: 'We develop clean, tested code with modular architectures, custom AI integrations, robust database schemas, and edge performance.',
      deliverables: ['Production Full-Stack Codebase', 'Automated CI/CD Workflows', 'Security & Stress Audits'],
      timeframe: 'Weeks 4–7',
    },
    {
      number: '04',
      title: 'Launch',
      description: 'We deploy to production cloud infrastructure, establish continuous monitoring, and support post-launch evolution with iterative improvements.',
      deliverables: ['Global Edge Deployment', 'Observability & Metrics Dashboard', 'Handoff & Long-term Evolution'],
      timeframe: 'Week 8+',
    },
  ] as ProcessStep[],
  techStack: [
    { name: 'React 19 & Next.js', category: 'Frontend', description: 'Server components, fluid client hydration, and micro-animations' },
    { name: 'TypeScript', category: 'Frontend', description: 'Strict end-to-end type safety across the entire application boundary' },
    { name: 'Tailwind CSS', category: 'Frontend', description: 'Composable modern utility architecture with custom theme design' },
    { name: 'Node.js & Express', category: 'Backend & Cloud', description: 'High-concurrency asynchronous runtime and REST/GraphQL APIs' },
    { name: 'Python', category: 'AI & ML', description: 'Data processing pipelines, scientific computation, and AI scripting' },
    { name: 'Gemini & Modern AI APIs', category: 'AI & ML', description: 'Multimodal vision, function calling, reasoning, and real-time streaming' },
    { name: 'PostgreSQL', category: 'Backend & Cloud', description: 'Relational data integrity, pgvector indexing, and transactional scale' },
    { name: 'Docker & Kubernetes', category: 'Backend & Cloud', description: 'Containerized orchestration, horizontal scaling, and isolated services' },
    { name: 'n8n & Workflow Engines', category: 'Automation', description: 'Visual pipeline coordination, webhooks, and multi-service connectors' },
    { name: 'Redis & Message Queues', category: 'Backend & Cloud', description: 'Low-latency in-memory cache, rate limiting, and pub/sub message brokers' },
    { name: 'Three.js & Canvas 2D', category: 'Frontend', description: 'Interactive 3D visuals, mathematical particle fields, and spatial graphics' },
    { name: 'Cloudflare / Edge Network', category: 'Backend & Cloud', description: 'Ultra-low latency global CDN, DNS routing, and edge worker functions' },
  ] as TechItem[],
  budgetOptions: [
    '< $10,000',
    '$10,000 – $25,000',
    '$25,000 – $50,000',
    '$50,000+',
    'Flexible / Undetermined',
  ],
  serviceOptions: [
    'AI Solutions & Agents',
    'Custom Web Development',
    'Mobile Application',
    'Workflow Automation',
    'Cloud & Backend Infrastructure',
    'Full Product Build (End-to-End)',
  ],
};
