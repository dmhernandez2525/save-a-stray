// ── Educational Content System ───────────────────────────────
// Pet care guides, training resources, quizzes, Q&A, content management

// ── Content Types ───────────────────────────────────────────

export type ContentCategory = 'care' | 'training' | 'health' | 'behavior' | 'nutrition' | 'adoption-prep';
export type AnimalType = 'dog' | 'cat' | 'rabbit' | 'bird' | 'all';
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';
export type ContentFormat = 'article' | 'video' | 'guide' | 'quiz' | 'handout';

export interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  summary: string;
  category: ContentCategory;
  animalType: AnimalType;
  difficulty: DifficultyLevel;
  format: ContentFormat;
  author: string;
  publishedAt: string;
  updatedAt: string;
  tags: string[];
  readTimeMinutes: number;
  viewCount: number;
  bookmarkCount: number;
}

// ── Article Database ────────────────────────────────────────

export const ARTICLES: Article[] = [
  { id: 'a1', title: 'First Days Home: Dog Edition', slug: 'first-days-home-dog', content: 'Bringing your new dog home is exciting...', summary: 'Essential tips for your dog\'s first week at home.', category: 'adoption-prep', animalType: 'dog', difficulty: 'beginner', format: 'article', author: 'Dr. Sarah Miller', publishedAt: '2026-01-10', updatedAt: '2026-01-10', tags: ['new-pet', 'dogs', 'preparation'], readTimeMinutes: 8, viewCount: 1200, bookmarkCount: 85 },
  { id: 'a2', title: 'First Days Home: Cat Edition', slug: 'first-days-home-cat', content: 'Cats need time to adjust to new environments...', summary: 'How to help your new cat settle in.', category: 'adoption-prep', animalType: 'cat', difficulty: 'beginner', format: 'article', author: 'Dr. Sarah Miller', publishedAt: '2026-01-12', updatedAt: '2026-01-12', tags: ['new-pet', 'cats', 'preparation'], readTimeMinutes: 7, viewCount: 980, bookmarkCount: 62 },
  { id: 'a3', title: 'Basic Obedience Training', slug: 'basic-obedience-training', content: 'Start with sit, stay, and come...', summary: 'Foundational commands every dog should know.', category: 'training', animalType: 'dog', difficulty: 'beginner', format: 'guide', author: 'Mark Johnson', publishedAt: '2026-01-15', updatedAt: '2026-01-15', tags: ['training', 'obedience', 'dogs'], readTimeMinutes: 12, viewCount: 2100, bookmarkCount: 150 },
  { id: 'a4', title: 'Understanding Cat Body Language', slug: 'cat-body-language', content: 'Cats communicate primarily through body language...', summary: 'Learn to read what your cat is telling you.', category: 'behavior', animalType: 'cat', difficulty: 'beginner', format: 'article', author: 'Dr. Lisa Chen', publishedAt: '2026-01-18', updatedAt: '2026-01-18', tags: ['behavior', 'cats', 'communication'], readTimeMinutes: 10, viewCount: 1500, bookmarkCount: 110 },
  { id: 'a5', title: 'Dog Nutrition 101', slug: 'dog-nutrition-101', content: 'A balanced diet is crucial for your dog...', summary: 'Complete guide to feeding your dog properly.', category: 'nutrition', animalType: 'dog', difficulty: 'beginner', format: 'article', author: 'Dr. James Park', publishedAt: '2026-01-20', updatedAt: '2026-02-01', tags: ['nutrition', 'dogs', 'diet'], readTimeMinutes: 15, viewCount: 1800, bookmarkCount: 95 },
  { id: 'a6', title: 'Common Pet Health Issues', slug: 'common-health-issues', content: 'Knowing what signs to look for...', summary: 'Recognize early warning signs of common health problems.', category: 'health', animalType: 'all', difficulty: 'beginner', format: 'article', author: 'Dr. Sarah Miller', publishedAt: '2026-01-22', updatedAt: '2026-01-22', tags: ['health', 'prevention', 'veterinary'], readTimeMinutes: 20, viewCount: 3200, bookmarkCount: 200 },
  { id: 'a7', title: 'Crate Training Your Dog', slug: 'crate-training', content: 'Crate training provides a safe space...', summary: 'Step-by-step guide to effective crate training.', category: 'training', animalType: 'dog', difficulty: 'intermediate', format: 'guide', author: 'Mark Johnson', publishedAt: '2026-02-01', updatedAt: '2026-02-01', tags: ['training', 'crate', 'dogs'], readTimeMinutes: 10, viewCount: 900, bookmarkCount: 72 },
  { id: 'a8', title: 'Cat Litter Box Training', slug: 'litter-box-training', content: 'Most cats take to the litter box naturally...', summary: 'Tips for successful litter box habits.', category: 'training', animalType: 'cat', difficulty: 'beginner', format: 'article', author: 'Dr. Lisa Chen', publishedAt: '2026-02-05', updatedAt: '2026-02-05', tags: ['training', 'cats', 'litter'], readTimeMinutes: 6, viewCount: 1100, bookmarkCount: 55 },
  { id: 'a9', title: 'Advanced Recall Training', slug: 'advanced-recall', content: 'Building a reliable recall takes practice...', summary: 'Train your dog to come when called, every time.', category: 'training', animalType: 'dog', difficulty: 'advanced', format: 'guide', author: 'Mark Johnson', publishedAt: '2026-02-10', updatedAt: '2026-02-10', tags: ['training', 'advanced', 'dogs', 'recall'], readTimeMinutes: 18, viewCount: 600, bookmarkCount: 48 },
  { id: 'a10', title: 'Pet First Aid Basics', slug: 'pet-first-aid', content: 'Knowing basic first aid can save your pet...', summary: 'Essential first aid skills for pet owners.', category: 'health', animalType: 'all', difficulty: 'intermediate', format: 'guide', author: 'Dr. James Park', publishedAt: '2026-02-12', updatedAt: '2026-02-12', tags: ['health', 'first-aid', 'emergency'], readTimeMinutes: 25, viewCount: 2500, bookmarkCount: 180 },
];

// ── Article Search & Filter ─────────────────────────────────

export function searchArticles(query: string): Article[] {
  if (!query.trim()) return ARTICLES;
  const q = query.toLowerCase();
  return ARTICLES.filter(a =>
    a.title.toLowerCase().includes(q) ||
    a.summary.toLowerCase().includes(q) ||
    a.tags.some(t => t.toLowerCase().includes(q))
  ).sort((a, b) => b.viewCount - a.viewCount);
}

export function filterArticles(filters: {
  category?: ContentCategory;
  animalType?: AnimalType;
  difficulty?: DifficultyLevel;
  format?: ContentFormat;
}): Article[] {
  return ARTICLES.filter(a => {
    if (filters.category && a.category !== filters.category) return false;
    if (filters.animalType && a.animalType !== filters.animalType && a.animalType !== 'all') return false;
    if (filters.difficulty && a.difficulty !== filters.difficulty) return false;
    if (filters.format && a.format !== filters.format) return false;
    return true;
  });
}

export function getArticleBySlug(slug: string): Article | null {
  return ARTICLES.find(a => a.slug === slug) || null;
}

export function getRelatedArticles(article: Article, limit: number = 3): Article[] {
  return ARTICLES
    .filter(a => a.id !== article.id && (a.category === article.category || a.animalType === article.animalType))
    .sort((a, b) => {
      const aTagOverlap = a.tags.filter(t => article.tags.includes(t)).length;
      const bTagOverlap = b.tags.filter(t => article.tags.includes(t)).length;
      return bTagOverlap - aTagOverlap;
    })
    .slice(0, limit);
}

// ── Adoption Readiness Quiz ─────────────────────────────────

export interface QuizQuestion {
  id: string;
  question: string;
  options: { id: string; text: string; score: number }[];
  category: string;
}

export const ADOPTION_QUIZ: QuizQuestion[] = [
  {
    id: 'q1', question: 'How many hours per day will someone be home?',
    options: [
      { id: 'a', text: 'Most of the day (8+ hours)', score: 10 },
      { id: 'b', text: 'About half the day (4-8 hours)', score: 7 },
      { id: 'c', text: 'A few hours (2-4 hours)', score: 4 },
      { id: 'd', text: 'Rarely home', score: 1 },
    ],
    category: 'time',
  },
  {
    id: 'q2', question: 'What is your living situation?',
    options: [
      { id: 'a', text: 'House with yard', score: 10 },
      { id: 'b', text: 'House without yard', score: 7 },
      { id: 'c', text: 'Apartment (pet-friendly)', score: 5 },
      { id: 'd', text: 'Apartment (not sure about pets)', score: 2 },
    ],
    category: 'space',
  },
  {
    id: 'q3', question: 'Have you owned a pet before?',
    options: [
      { id: 'a', text: 'Yes, multiple pets over many years', score: 10 },
      { id: 'b', text: 'Yes, one pet', score: 7 },
      { id: 'c', text: 'Not personally, but family had pets', score: 5 },
      { id: 'd', text: 'No pet experience', score: 3 },
    ],
    category: 'experience',
  },
  {
    id: 'q4', question: 'Are you prepared for veterinary expenses?',
    options: [
      { id: 'a', text: 'Yes, with pet insurance and savings', score: 10 },
      { id: 'b', text: 'Yes, I have a budget set aside', score: 8 },
      { id: 'c', text: 'Somewhat, for routine care', score: 4 },
      { id: 'd', text: 'I haven\'t thought about it', score: 1 },
    ],
    category: 'financial',
  },
  {
    id: 'q5', question: 'How active is your lifestyle?',
    options: [
      { id: 'a', text: 'Very active (daily exercise, outdoors)', score: 10 },
      { id: 'b', text: 'Moderately active', score: 8 },
      { id: 'c', text: 'Somewhat sedentary', score: 5 },
      { id: 'd', text: 'Very sedentary', score: 3 },
    ],
    category: 'lifestyle',
  },
];

export function scoreQuiz(answers: Record<string, string>): {
  score: number;
  maxScore: number;
  percentage: number;
  readiness: 'ready' | 'mostly-ready' | 'needs-preparation' | 'not-ready';
  feedback: string[];
} {
  let score = 0;
  let maxScore = 0;
  const feedback: string[] = [];

  for (const q of ADOPTION_QUIZ) {
    const answerId = answers[q.id];
    const maxOption = Math.max(...q.options.map(o => o.score));
    maxScore += maxOption;

    if (!answerId) continue;
    const selected = q.options.find(o => o.id === answerId);
    if (selected) {
      score += selected.score;
      if (selected.score <= maxOption * 0.3) {
        feedback.push(`Consider improving: ${q.category}`);
      }
    }
  }

  const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
  const readiness = percentage >= 80 ? 'ready'
    : percentage >= 60 ? 'mostly-ready'
    : percentage >= 40 ? 'needs-preparation'
    : 'not-ready';

  return { score, maxScore, percentage, readiness, feedback };
}

// ── Video Tutorials ─────────────────────────────────────────

export interface VideoTutorial {
  id: string;
  title: string;
  description: string;
  url: string;
  durationMinutes: number;
  category: ContentCategory;
  animalType: AnimalType;
  order: number;
  courseId?: string;
}

export interface VideoProgress {
  videoId: string;
  watchedMinutes: number;
  completed: boolean;
  bookmarked: boolean;
  lastWatchedAt: string;
}

export function getVideoProgress(
  progress: VideoProgress[],
  courseVideos: VideoTutorial[]
): { completed: number; total: number; percentComplete: number } {
  const completed = progress.filter(p => p.completed && courseVideos.some(v => v.id === p.videoId)).length;
  const total = courseVideos.length;
  return {
    completed,
    total,
    percentComplete: total > 0 ? Math.round((completed / total) * 100) : 0,
  };
}

export function getBookmarkedVideos(progress: VideoProgress[]): string[] {
  return progress.filter(p => p.bookmarked).map(p => p.videoId);
}

// ── Expert Q&A ──────────────────────────────────────────────

export interface QAQuestion {
  id: string;
  userId: string;
  question: string;
  category: ContentCategory;
  animalType: AnimalType;
  createdAt: string;
  status: 'open' | 'answered' | 'closed';
  upvotes: number;
}

export interface QAAnswer {
  id: string;
  questionId: string;
  expertId: string;
  expertName: string;
  expertRole: string;
  answer: string;
  createdAt: string;
  isAccepted: boolean;
  upvotes: number;
}

export function submitQuestion(
  userId: string,
  question: string,
  category: ContentCategory,
  animalType: AnimalType
): QAQuestion {
  return {
    id: `qa_${Date.now()}`,
    userId,
    question,
    category,
    animalType,
    createdAt: new Date().toISOString(),
    status: 'open',
    upvotes: 0,
  };
}

export function answerQuestion(
  questionId: string,
  expertId: string,
  expertName: string,
  expertRole: string,
  answer: string
): QAAnswer {
  return {
    id: `ans_${Date.now()}`,
    questionId,
    expertId,
    expertName,
    expertRole,
    answer,
    createdAt: new Date().toISOString(),
    isAccepted: false,
    upvotes: 0,
  };
}

export function acceptAnswer(answer: QAAnswer): QAAnswer {
  return { ...answer, isAccepted: true };
}

// ── Content Recommendation ──────────────────────────────────

export function recommendContent(
  viewHistory: { articleId: string; category: ContentCategory; animalType: AnimalType }[],
  limit: number = 5
): Article[] {
  if (viewHistory.length === 0) {
    return [...ARTICLES].sort((a, b) => b.viewCount - a.viewCount).slice(0, limit);
  }

  // Count category and animal type preferences
  const catCounts: Record<string, number> = {};
  const typeCounts: Record<string, number> = {};
  for (const v of viewHistory) {
    catCounts[v.category] = (catCounts[v.category] || 0) + 1;
    typeCounts[v.animalType] = (typeCounts[v.animalType] || 0) + 1;
  }

  const viewedIds = new Set(viewHistory.map(v => v.articleId));

  return ARTICLES
    .filter(a => !viewedIds.has(a.id))
    .map(a => {
      const catScore = catCounts[a.category] || 0;
      const typeScore = typeCounts[a.animalType] || 0;
      return { article: a, score: catScore * 2 + typeScore + (a.viewCount / 1000) };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(r => r.article);
}

// ── Multilingual Support ────────────────────────────────────

export const SUPPORTED_LANGUAGES = ['en', 'es', 'fr', 'de', 'pt', 'zh'] as const;
export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];

export interface Translation {
  articleId: string;
  language: SupportedLanguage;
  title: string;
  content: string;
  translatedAt: string;
  status: 'draft' | 'reviewed' | 'published';
}

export function getAvailableTranslations(
  translations: Translation[],
  articleId: string
): SupportedLanguage[] {
  return translations
    .filter(t => t.articleId === articleId && t.status === 'published')
    .map(t => t.language);
}

// ── Content Analytics ───────────────────────────────────────

export interface ContentAnalytics {
  totalArticles: number;
  totalViews: number;
  totalBookmarks: number;
  averageReadTime: number;
  topArticles: { id: string; title: string; views: number }[];
  viewsByCategory: Record<string, number>;
}

export function calculateContentAnalytics(articles: Article[]): ContentAnalytics {
  const totalViews = articles.reduce((s, a) => s + a.viewCount, 0);
  const totalBookmarks = articles.reduce((s, a) => s + a.bookmarkCount, 0);
  const avgReadTime = articles.length > 0
    ? Math.round(articles.reduce((s, a) => s + a.readTimeMinutes, 0) / articles.length)
    : 0;

  const viewsByCat: Record<string, number> = {};
  for (const a of articles) {
    viewsByCat[a.category] = (viewsByCat[a.category] || 0) + a.viewCount;
  }

  const topArticles = [...articles]
    .sort((a, b) => b.viewCount - a.viewCount)
    .slice(0, 5)
    .map(a => ({ id: a.id, title: a.title, views: a.viewCount }));

  return {
    totalArticles: articles.length,
    totalViews,
    totalBookmarks,
    averageReadTime: avgReadTime,
    topArticles,
    viewsByCategory: viewsByCat,
  };
}
