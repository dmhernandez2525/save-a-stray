// ── Help Center & Documentation System ───────────────────────
// Searchable FAQ, contextual help, changelog, and API documentation

// ── FAQ System ───────────────────────────────────────────────

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: FaqCategory;
  tags: string[];
  helpful: number;
  notHelpful: number;
}

export type FaqCategory =
  | 'adopter'
  | 'shelter'
  | 'foster'
  | 'account'
  | 'technical'
  | 'general';

export const FAQ_CATEGORIES: { id: FaqCategory; label: string; description: string }[] = [
  { id: 'adopter', label: 'Adopters', description: 'Finding and adopting your new pet' },
  { id: 'shelter', label: 'Shelters', description: 'Managing your shelter on the platform' },
  { id: 'foster', label: 'Foster Families', description: 'Fostering animals in need' },
  { id: 'account', label: 'Account & Security', description: 'Managing your account settings' },
  { id: 'technical', label: 'Technical Support', description: 'Troubleshooting and platform issues' },
  { id: 'general', label: 'General', description: 'About the platform and mission' },
];

export const FAQ_DATABASE: FaqItem[] = [
  // Adopter FAQs
  {
    id: 'adopt-01', question: 'How do I search for pets available for adoption?',
    answer: 'Visit the Animals page and use the search filters to narrow results by species, breed, age, size, and location. You can save searches to get notified when matching animals are listed.',
    category: 'adopter', tags: ['search', 'filter', 'animals'], helpful: 0, notHelpful: 0,
  },
  {
    id: 'adopt-02', question: 'How do I submit an adoption application?',
    answer: 'Click "Apply to Adopt" on any animal profile page. Fill out the application form with your living situation, experience, and references. You can save drafts and return later to complete your application.',
    category: 'adopter', tags: ['application', 'adopt', 'apply'], helpful: 0, notHelpful: 0,
  },
  {
    id: 'adopt-03', question: 'Can I apply for multiple animals at once?',
    answer: 'Yes, you can submit applications for multiple animals. Each application is reviewed independently by the shelter managing that animal.',
    category: 'adopter', tags: ['application', 'multiple'], helpful: 0, notHelpful: 0,
  },
  {
    id: 'adopt-04', question: 'How long does the adoption process take?',
    answer: 'Processing times vary by shelter. Most shelters review applications within 3-5 business days. You can track your application status from your dashboard.',
    category: 'adopter', tags: ['timeline', 'process', 'status'], helpful: 0, notHelpful: 0,
  },
  {
    id: 'adopt-05', question: 'What is the adoption fee?',
    answer: 'Adoption fees are set by each shelter and vary by animal. Fees typically cover vaccinations, spay/neuter surgery, and microchipping. The fee is displayed on each animal profile.',
    category: 'adopter', tags: ['fee', 'cost', 'price'], helpful: 0, notHelpful: 0,
  },
  {
    id: 'adopt-06', question: 'How do I save favorite animals?',
    answer: 'Click the heart icon on any animal card or profile page to add them to your favorites. Access your saved favorites from your dashboard at any time.',
    category: 'adopter', tags: ['favorites', 'save', 'heart'], helpful: 0, notHelpful: 0,
  },
  // Shelter FAQs
  {
    id: 'shelter-01', question: 'How do I register my shelter on Save A Stray?',
    answer: 'Click "Register Shelter" and complete the onboarding wizard. You will need your shelter name, address, contact information, and operating hours. Verification typically takes 1-2 business days.',
    category: 'shelter', tags: ['register', 'onboarding', 'setup'], helpful: 0, notHelpful: 0,
  },
  {
    id: 'shelter-02', question: 'How do I add animals to my shelter listing?',
    answer: 'From your shelter dashboard, click "Add Animal" and fill in the animal profile. Include photos, medical history, personality notes, and adoption fee. You can also use bulk import with a CSV file.',
    category: 'shelter', tags: ['add', 'animal', 'listing', 'csv'], helpful: 0, notHelpful: 0,
  },
  {
    id: 'shelter-03', question: 'How do I manage adoption applications?',
    answer: 'Applications appear in your dashboard under "Applications." You can review, approve, or reject applications, add internal notes, and communicate with applicants through the messaging system.',
    category: 'shelter', tags: ['applications', 'review', 'manage'], helpful: 0, notHelpful: 0,
  },
  {
    id: 'shelter-04', question: 'Can I add staff members to my shelter account?',
    answer: 'Yes, shelter admins can invite staff members from the Staff Management page. You can assign roles with different permission levels (admin, staff, volunteer).',
    category: 'shelter', tags: ['staff', 'team', 'invite', 'roles'], helpful: 0, notHelpful: 0,
  },
  {
    id: 'shelter-05', question: 'How do I sync listings with Petfinder or Adopt-a-Pet?',
    answer: 'Go to Settings > Integrations and enable the platforms you want to sync with. Listings are automatically synced, and status changes propagate across platforms.',
    category: 'shelter', tags: ['sync', 'petfinder', 'integration'], helpful: 0, notHelpful: 0,
  },
  // Foster FAQs
  {
    id: 'foster-01', question: 'How do I become a foster parent?',
    answer: 'Complete the foster registration form with your housing details, experience, and availability. The shelter will review your profile, conduct a home assessment, and match you with suitable animals.',
    category: 'foster', tags: ['register', 'foster', 'signup'], helpful: 0, notHelpful: 0,
  },
  {
    id: 'foster-02', question: 'What does fostering involve?',
    answer: 'Fostering means providing a temporary home for an animal until they are adopted. The shelter typically covers medical expenses and supplies. You provide food, shelter, and socialization.',
    category: 'foster', tags: ['foster', 'responsibilities', 'care'], helpful: 0, notHelpful: 0,
  },
  // Account FAQs
  {
    id: 'account-01', question: 'How do I reset my password?',
    answer: 'Click "Forgot Password" on the login page and enter your email address. You will receive a password reset link valid for 1 hour.',
    category: 'account', tags: ['password', 'reset', 'forgot'], helpful: 0, notHelpful: 0,
  },
  {
    id: 'account-02', question: 'How do I enable two-factor authentication?',
    answer: 'Go to Account Settings > Security and click "Enable 2FA." Scan the QR code with an authenticator app (Google Authenticator, Authy) and enter the verification code to confirm.',
    category: 'account', tags: ['2fa', 'security', 'authenticator'], helpful: 0, notHelpful: 0,
  },
  {
    id: 'account-03', question: 'How do I delete my account?',
    answer: 'Go to Account Settings > Privacy and click "Delete Account." This will permanently remove your profile, applications, and all associated data after a 30-day grace period.',
    category: 'account', tags: ['delete', 'account', 'privacy'], helpful: 0, notHelpful: 0,
  },
  // Technical FAQs
  {
    id: 'tech-01', question: 'What browsers are supported?',
    answer: 'Save A Stray supports the latest versions of Chrome, Firefox, Safari, and Edge. Internet Explorer is not supported.',
    category: 'technical', tags: ['browser', 'compatibility', 'support'], helpful: 0, notHelpful: 0,
  },
  {
    id: 'tech-02', question: 'Is there a mobile app?',
    answer: 'Save A Stray is a Progressive Web App (PWA). You can install it on your phone by visiting the site in your mobile browser and selecting "Add to Home Screen."',
    category: 'technical', tags: ['mobile', 'app', 'pwa'], helpful: 0, notHelpful: 0,
  },
  // General FAQs
  {
    id: 'general-01', question: 'What is Save A Stray?',
    answer: 'Save A Stray is a modern pet adoption platform connecting shelters, rescue organizations, and adopters. Our mission is to help every shelter animal find a loving home.',
    category: 'general', tags: ['about', 'mission', 'platform'], helpful: 0, notHelpful: 0,
  },
  {
    id: 'general-02', question: 'Is Save A Stray free for shelters?',
    answer: 'Basic shelter accounts are free. Premium features including advanced analytics, integrations, and priority support are available through paid plans.',
    category: 'general', tags: ['pricing', 'free', 'cost'], helpful: 0, notHelpful: 0,
  },
];

// ── FAQ Search ───────────────────────────────────────────────

export function searchFaq(query: string, category?: FaqCategory): FaqItem[] {
  if (!query.trim()) {
    return category ? FAQ_DATABASE.filter(f => f.category === category) : [...FAQ_DATABASE];
  }

  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);

  const scored = FAQ_DATABASE
    .filter(f => !category || f.category === category)
    .map(faq => {
      let score = 0;
      const questionLower = faq.question.toLowerCase();
      const answerLower = faq.answer.toLowerCase();
      const tagsLower = faq.tags.join(' ').toLowerCase();

      for (const term of terms) {
        if (questionLower.includes(term)) score += 3;
        if (tagsLower.includes(term)) score += 2;
        if (answerLower.includes(term)) score += 1;
      }
      return { faq, score };
    })
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.map(r => r.faq);
}

export function getFaqsByCategory(category: FaqCategory): FaqItem[] {
  return FAQ_DATABASE.filter(f => f.category === category);
}

export function getFaqById(id: string): FaqItem | null {
  return FAQ_DATABASE.find(f => f.id === id) || null;
}

// ── Contextual Help ──────────────────────────────────────────

export interface ContextualHelp {
  id: string;
  page: string;
  element: string;
  title: string;
  content: string;
  learnMoreUrl?: string;
}

export const CONTEXTUAL_HELP: ContextualHelp[] = [
  { id: 'ch-animal-grid', page: '/animals', element: '[data-tour="animal-grid"]', title: 'Browse Animals', content: 'Use the grid to browse all available animals. Click on any card to see the full profile.' },
  { id: 'ch-search-filters', page: '/animals', element: '[data-tour="search-filters"]', title: 'Filter Results', content: 'Narrow your search by species, breed, age, size, and distance from your location.' },
  { id: 'ch-apply-btn', page: '/animals/:id', element: '[data-tour="apply-btn"]', title: 'Apply to Adopt', content: 'Start an adoption application for this animal. You can save your progress and return later.' },
  { id: 'ch-favorite-btn', page: '/animals/:id', element: '[data-tour="favorite-btn"]', title: 'Save to Favorites', content: 'Add this animal to your favorites list for quick access later.' },
  { id: 'ch-dashboard', page: '/shelter/dashboard', element: '[data-tour="dashboard"]', title: 'Shelter Dashboard', content: 'Your central hub for managing animals, applications, and shelter operations.' },
  { id: 'ch-animal-management', page: '/shelter/animals', element: '[data-tour="animal-management"]', title: 'Animal Management', content: 'Add, edit, and manage all animals in your shelter. Use bulk import for large batches.' },
  { id: 'ch-applications', page: '/shelter/applications', element: '[data-tour="applications"]', title: 'Application Review', content: 'Review incoming adoption applications. Approve, reject, or request more information.' },
  { id: 'ch-analytics', page: '/shelter/analytics', element: '[data-tour="analytics"]', title: 'Shelter Analytics', content: 'Track adoption rates, application trends, and shelter performance metrics.' },
  { id: 'ch-foster-reg', page: '/foster/register', element: '[data-tour="foster-form"]', title: 'Foster Registration', content: 'Complete your foster profile to start fostering animals. Include your housing details and experience.' },
  { id: 'ch-messaging', page: '/messages', element: '[data-tour="messaging"]', title: 'Messages', content: 'Communicate with shelters and adopters. You will receive notifications for new messages.' },
];

export function getContextualHelp(page: string): ContextualHelp[] {
  return CONTEXTUAL_HELP.filter(h => {
    if (h.page === page) return true;
    // Handle parameterized routes
    const pattern = h.page.replace(/:[^/]+/g, '[^/]+');
    return new RegExp(`^${pattern}$`).test(page);
  });
}

export function getContextualHelpById(id: string): ContextualHelp | null {
  return CONTEXTUAL_HELP.find(h => h.id === id) || null;
}

// ── Changelog System ─────────────────────────────────────────

export interface ChangelogEntry {
  version: string;
  date: string;
  title: string;
  highlights: string[];
  changes: { type: 'added' | 'changed' | 'fixed' | 'removed'; description: string }[];
}

export const CHANGELOG: ChangelogEntry[] = [
  {
    version: '2.0.0',
    date: '2026-02-15',
    title: 'Platform Modernization',
    highlights: [
      'Complete frontend rewrite with React 19 and Vite',
      'New shelter dashboard with real-time analytics',
      'Progressive Web App support for mobile',
    ],
    changes: [
      { type: 'added', description: 'Modern React 19 frontend with Tailwind CSS' },
      { type: 'added', description: 'Shelter analytics with adoption metrics and KPIs' },
      { type: 'added', description: 'Foster management system' },
      { type: 'added', description: 'In-app messaging between shelters and adopters' },
      { type: 'added', description: 'PWA support with offline browsing' },
      { type: 'added', description: 'Demo mode for platform exploration' },
      { type: 'changed', description: 'Upgraded to TypeScript strict mode' },
      { type: 'changed', description: 'Migrated from Create React App to Vite' },
      { type: 'fixed', description: 'Mobile responsiveness across all pages' },
    ],
  },
  {
    version: '1.5.0',
    date: '2026-01-10',
    title: 'Search and Discovery',
    highlights: [
      'Advanced animal search with multiple filters',
      'Saved searches with email alerts',
      'Social sharing for animal profiles',
    ],
    changes: [
      { type: 'added', description: 'Multi-criteria animal search filters' },
      { type: 'added', description: 'Saved search functionality' },
      { type: 'added', description: 'Social media sharing for animal profiles' },
      { type: 'changed', description: 'Improved search relevance scoring' },
      { type: 'fixed', description: 'Search pagination edge cases' },
    ],
  },
  {
    version: '1.0.0',
    date: '2025-12-01',
    title: 'Initial Launch',
    highlights: [
      'Core adoption platform with animal listings',
      'Shelter registration and management',
      'Adoption application workflow',
    ],
    changes: [
      { type: 'added', description: 'Animal listing and profile pages' },
      { type: 'added', description: 'Shelter registration and dashboard' },
      { type: 'added', description: 'Adoption application system' },
      { type: 'added', description: 'User authentication with JWT' },
      { type: 'added', description: 'Email notifications' },
    ],
  },
];

export function getChangelog(): ChangelogEntry[] {
  return [...CHANGELOG];
}

export function getChangelogByVersion(version: string): ChangelogEntry | null {
  return CHANGELOG.find(e => e.version === version) || null;
}

export function getLatestChangelog(): ChangelogEntry | null {
  return CHANGELOG.length > 0 ? CHANGELOG[0] : null;
}

export function getChangesByType(version: string, type: string): string[] {
  const entry = CHANGELOG.find(e => e.version === version);
  if (!entry) return [];
  return entry.changes.filter(c => c.type === type).map(c => c.description);
}

// ── API Documentation Generator ──────────────────────────────

export interface ApiEndpoint {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  summary: string;
  description: string;
  category: string;
  auth: boolean;
  params?: { name: string; type: string; required: boolean; description: string }[];
  requestBody?: { type: string; example: string };
  responses: { status: number; description: string; example?: string }[];
}

export const API_DOCUMENTATION: ApiEndpoint[] = [
  {
    path: '/api/v1/animals',
    method: 'GET',
    summary: 'List animals',
    description: 'Retrieve a paginated list of animals with optional filters',
    category: 'Animals',
    auth: false,
    params: [
      { name: 'species', type: 'string', required: false, description: 'Filter by species (dog, cat, other)' },
      { name: 'breed', type: 'string', required: false, description: 'Filter by breed' },
      { name: 'age', type: 'string', required: false, description: 'Filter by age range' },
      { name: 'size', type: 'string', required: false, description: 'Filter by size' },
      { name: 'page', type: 'number', required: false, description: 'Page number (default: 1)' },
      { name: 'limit', type: 'number', required: false, description: 'Items per page (default: 20, max: 100)' },
    ],
    responses: [
      { status: 200, description: 'List of animals', example: '{"data": [...], "total": 150, "page": 1}' },
      { status: 400, description: 'Invalid filter parameters' },
    ],
  },
  {
    path: '/api/v1/animals/:id',
    method: 'GET',
    summary: 'Get animal by ID',
    description: 'Retrieve detailed information about a specific animal',
    category: 'Animals',
    auth: false,
    params: [
      { name: 'id', type: 'string', required: true, description: 'Animal ID' },
    ],
    responses: [
      { status: 200, description: 'Animal details' },
      { status: 404, description: 'Animal not found' },
    ],
  },
  {
    path: '/api/v1/animals',
    method: 'POST',
    summary: 'Create animal',
    description: 'Add a new animal listing to your shelter',
    category: 'Animals',
    auth: true,
    requestBody: { type: 'application/json', example: '{"name": "Buddy", "species": "dog", "breed": "Labrador"}' },
    responses: [
      { status: 201, description: 'Animal created successfully' },
      { status: 401, description: 'Authentication required' },
      { status: 403, description: 'Insufficient permissions' },
    ],
  },
  {
    path: '/api/v1/shelters',
    method: 'GET',
    summary: 'List shelters',
    description: 'Retrieve a list of registered shelters',
    category: 'Shelters',
    auth: false,
    params: [
      { name: 'near', type: 'string', required: false, description: 'Location for proximity search' },
      { name: 'radius', type: 'number', required: false, description: 'Search radius in miles' },
    ],
    responses: [
      { status: 200, description: 'List of shelters' },
    ],
  },
  {
    path: '/api/v1/shelters/:id',
    method: 'GET',
    summary: 'Get shelter by ID',
    description: 'Retrieve detailed information about a specific shelter',
    category: 'Shelters',
    auth: false,
    params: [
      { name: 'id', type: 'string', required: true, description: 'Shelter ID' },
    ],
    responses: [
      { status: 200, description: 'Shelter details' },
      { status: 404, description: 'Shelter not found' },
    ],
  },
  {
    path: '/api/v1/applications',
    method: 'POST',
    summary: 'Submit application',
    description: 'Submit an adoption application for an animal',
    category: 'Applications',
    auth: true,
    requestBody: { type: 'application/json', example: '{"animalId": "abc123", "answers": {...}}' },
    responses: [
      { status: 201, description: 'Application submitted' },
      { status: 401, description: 'Authentication required' },
      { status: 409, description: 'Duplicate application' },
    ],
  },
  {
    path: '/api/v1/applications/:id',
    method: 'GET',
    summary: 'Get application status',
    description: 'Check the status of a specific adoption application',
    category: 'Applications',
    auth: true,
    params: [
      { name: 'id', type: 'string', required: true, description: 'Application ID' },
    ],
    responses: [
      { status: 200, description: 'Application details with status' },
      { status: 401, description: 'Authentication required' },
      { status: 404, description: 'Application not found' },
    ],
  },
  {
    path: '/api/v1/auth/login',
    method: 'POST',
    summary: 'Login',
    description: 'Authenticate with email and password',
    category: 'Authentication',
    auth: false,
    requestBody: { type: 'application/json', example: '{"email": "user@example.com", "password": "..."}' },
    responses: [
      { status: 200, description: 'Authentication successful, returns JWT token' },
      { status: 401, description: 'Invalid credentials' },
      { status: 429, description: 'Too many login attempts' },
    ],
  },
  {
    path: '/api/v1/auth/register',
    method: 'POST',
    summary: 'Register',
    description: 'Create a new user account',
    category: 'Authentication',
    auth: false,
    requestBody: { type: 'application/json', example: '{"email": "user@example.com", "password": "...", "name": "John"}' },
    responses: [
      { status: 201, description: 'Account created successfully' },
      { status: 409, description: 'Email already registered' },
    ],
  },
  {
    path: '/api/v1/graphql',
    method: 'POST',
    summary: 'GraphQL endpoint',
    description: 'Primary GraphQL API endpoint. Use GraphQL introspection for schema discovery.',
    category: 'GraphQL',
    auth: false,
    requestBody: { type: 'application/json', example: '{"query": "{ animals { name species } }"}' },
    responses: [
      { status: 200, description: 'GraphQL response' },
    ],
  },
];

export function getApiEndpoints(): ApiEndpoint[] {
  return [...API_DOCUMENTATION];
}

export function getApiEndpointsByCategory(category: string): ApiEndpoint[] {
  return API_DOCUMENTATION.filter(e => e.category === category);
}

export function getApiCategories(): string[] {
  return [...new Set(API_DOCUMENTATION.map(e => e.category))];
}

export function searchApiDocs(query: string): ApiEndpoint[] {
  if (!query.trim()) return [...API_DOCUMENTATION];
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);

  return API_DOCUMENTATION.filter(endpoint => {
    const searchable = [
      endpoint.path,
      endpoint.summary,
      endpoint.description,
      endpoint.category,
      endpoint.method,
    ].join(' ').toLowerCase();

    return terms.every(term => searchable.includes(term));
  });
}

// ── User Guide System ────────────────────────────────────────

export interface GuideSection {
  id: string;
  title: string;
  audience: 'adopter' | 'shelter' | 'foster' | 'developer' | 'all';
  sections: { heading: string; content: string }[];
}

export const USER_GUIDES: GuideSection[] = [
  {
    id: 'adopter-guide',
    title: 'Adopter Guide',
    audience: 'adopter',
    sections: [
      { heading: 'Getting Started', content: 'Create an account to start your adoption journey. You can browse animals without an account, but you will need one to submit applications and save favorites.' },
      { heading: 'Searching for Pets', content: 'Use the search page to find animals by species, breed, age, size, and location. Save your searches to receive alerts when matching animals are listed.' },
      { heading: 'Submitting Applications', content: 'When you find a pet you love, click "Apply to Adopt" to start an application. Fill in your housing details, experience, and references. You can save drafts and complete the application later.' },
      { heading: 'Tracking Applications', content: 'Check your dashboard for application status updates. You will also receive email notifications when your application status changes.' },
      { heading: 'After Adoption', content: 'After approval, coordinate with the shelter for pickup. You will receive adoption documents and post-adoption resources.' },
    ],
  },
  {
    id: 'shelter-guide',
    title: 'Shelter Onboarding Guide',
    audience: 'shelter',
    sections: [
      { heading: 'Registration', content: 'Register your shelter by providing basic information: name, address, contact details, and operating hours. Verification typically takes 1-2 business days.' },
      { heading: 'Adding Animals', content: 'Add animals individually or use bulk import with a CSV file. Include photos, medical history, and personality descriptions for the best results.' },
      { heading: 'Managing Applications', content: 'Review applications from your dashboard. Use the scoring system and notes to track your evaluation process. Communicate with applicants through the messaging system.' },
      { heading: 'Staff Management', content: 'Invite staff members and assign roles. Admins have full access, while staff members can manage animals and applications.' },
      { heading: 'Analytics', content: 'Track your shelter performance with analytics dashboards showing adoption rates, application trends, and key metrics.' },
    ],
  },
  {
    id: 'foster-guide',
    title: 'Foster Family Guide',
    audience: 'foster',
    sections: [
      { heading: 'Becoming a Foster', content: 'Complete the foster registration form with your housing details, experience, and availability. The shelter will review and match you with suitable animals.' },
      { heading: 'During Fostering', content: 'The shelter provides medical care and often supplies. You provide a safe home environment, socialization, and basic care for the animal.' },
      { heading: 'Communication', content: 'Stay in touch with the shelter through the messaging system. Report any health concerns or behavior changes promptly.' },
      { heading: 'Foster to Adopt', content: 'If you bond with your foster animal, you can convert to an adoption application with a streamlined process.' },
    ],
  },
  {
    id: 'developer-guide',
    title: 'Developer Contributing Guide',
    audience: 'developer',
    sections: [
      { heading: 'Environment Setup', content: 'Clone the repository, install dependencies with npm, and configure environment variables. See .env.example for required configuration.' },
      { heading: 'Architecture', content: 'The platform uses a React frontend with Vite, a Node.js/Express backend with GraphQL (graphql-js), and MongoDB for data storage.' },
      { heading: 'Coding Standards', content: 'TypeScript strict mode, no any types, proper error handling. Follow the existing patterns for GraphQL resolvers and React components.' },
      { heading: 'Testing', content: 'Write tests for all new code. Use Vitest for the frontend and Mocha for the backend. Maintain 80% coverage or higher.' },
      { heading: 'Pull Requests', content: 'Create feature branches from main. Write descriptive PR titles and descriptions. All CI checks must pass before merging.' },
    ],
  },
];

export function getGuide(id: string): GuideSection | null {
  return USER_GUIDES.find(g => g.id === id) || null;
}

export function getGuidesForAudience(audience: string): GuideSection[] {
  return USER_GUIDES.filter(g => g.audience === audience || g.audience === 'all');
}

// ── Documentation Versioning ─────────────────────────────────

export interface DocVersion {
  version: string;
  releaseDate: string;
  current: boolean;
}

export const DOC_VERSIONS: DocVersion[] = [
  { version: '2.0.0', releaseDate: '2026-02-15', current: true },
  { version: '1.5.0', releaseDate: '2026-01-10', current: false },
  { version: '1.0.0', releaseDate: '2025-12-01', current: false },
];

export function getCurrentDocVersion(): DocVersion {
  return DOC_VERSIONS.find(v => v.current) || DOC_VERSIONS[0];
}

export function getDocVersions(): DocVersion[] {
  return [...DOC_VERSIONS];
}

// ── Help Feedback ────────────────────────────────────────────

const HELP_FEEDBACK_KEY = 'help_center_feedback';

interface HelpFeedback {
  itemId: string;
  helpful: boolean;
  timestamp: string;
}

export function submitFeedback(itemId: string, helpful: boolean): void {
  try {
    const data = localStorage.getItem(HELP_FEEDBACK_KEY);
    const feedback: HelpFeedback[] = data ? JSON.parse(data) : [];
    // Replace existing feedback for same item
    const existing = feedback.findIndex(f => f.itemId === itemId);
    if (existing >= 0) {
      feedback[existing] = { itemId, helpful, timestamp: new Date().toISOString() };
    } else {
      feedback.push({ itemId, helpful, timestamp: new Date().toISOString() });
    }
    if (feedback.length > 200) feedback.splice(0, feedback.length - 200);
    localStorage.setItem(HELP_FEEDBACK_KEY, JSON.stringify(feedback));
  } catch {
    // Silent fail
  }
}

export function getFeedback(): HelpFeedback[] {
  try {
    const data = localStorage.getItem(HELP_FEEDBACK_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function getFeedbackStats(): { total: number; helpful: number; notHelpful: number; helpfulRate: number } {
  const feedback = getFeedback();
  const helpful = feedback.filter(f => f.helpful).length;
  const notHelpful = feedback.length - helpful;
  return {
    total: feedback.length,
    helpful,
    notHelpful,
    helpfulRate: feedback.length > 0 ? Math.round((helpful / feedback.length) * 100) : 0,
  };
}

export function clearFeedback(): void {
  localStorage.removeItem(HELP_FEEDBACK_KEY);
}
