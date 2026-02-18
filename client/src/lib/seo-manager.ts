// ── SEO & Marketing Manager ──────────────────────────────────
// Meta tags, structured data, sitemap, Open Graph, and analytics

// ── Meta Tag Management ──────────────────────────────────────

export interface MetaTagConfig {
  title: string;
  description: string;
  keywords?: string[];
  canonical?: string;
  robots?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: string;
  ogUrl?: string;
  twitterCard?: 'summary' | 'summary_large_image' | 'player';
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
}

const DEFAULT_META: MetaTagConfig = {
  title: 'Save A Stray - Find Your Perfect Pet',
  description: 'Connect with shelters and rescue organizations to find adoptable dogs, cats, and other pets near you.',
  keywords: ['pet adoption', 'rescue animals', 'adopt a dog', 'adopt a cat', 'animal shelter'],
  robots: 'index, follow',
  ogType: 'website',
  twitterCard: 'summary_large_image',
};

export function generateMetaTags(config: Partial<MetaTagConfig> = {}): MetaTagConfig {
  const merged = { ...DEFAULT_META, ...config };
  merged.ogTitle = merged.ogTitle || merged.title;
  merged.ogDescription = merged.ogDescription || merged.description;
  merged.twitterTitle = merged.twitterTitle || merged.title;
  merged.twitterDescription = merged.twitterDescription || merged.description;
  return merged;
}

export function generateAnimalMeta(animal: {
  name: string;
  species: string;
  breed?: string;
  age?: string;
  shelter?: string;
  imageUrl?: string;
  id: string;
}): MetaTagConfig {
  const breedStr = animal.breed ? ` ${animal.breed}` : '';
  const ageStr = animal.age ? `, ${animal.age}` : '';
  const shelterStr = animal.shelter ? ` at ${animal.shelter}` : '';

  return generateMetaTags({
    title: `Adopt ${animal.name} -${breedStr} ${animal.species}${shelterStr} | Save A Stray`,
    description: `Meet ${animal.name}, a${breedStr} ${animal.species}${ageStr} available for adoption${shelterStr}. View photos, learn about their personality, and apply to adopt today.`,
    keywords: ['adopt', animal.species, animal.breed || '', animal.name, 'pet adoption'].filter(Boolean),
    ogImage: animal.imageUrl,
    ogType: 'article',
    canonical: `/animals/${animal.id}`,
  });
}

export function generateShelterMeta(shelter: {
  name: string;
  city?: string;
  state?: string;
  animalCount?: number;
  id: string;
}): MetaTagConfig {
  const locationStr = shelter.city && shelter.state ? ` in ${shelter.city}, ${shelter.state}` : '';
  const countStr = shelter.animalCount ? ` with ${shelter.animalCount} animals` : '';

  return generateMetaTags({
    title: `${shelter.name}${locationStr} | Save A Stray`,
    description: `${shelter.name}${locationStr}${countStr} available for adoption. View available pets, operating hours, and contact information.`,
    keywords: [shelter.name, 'animal shelter', shelter.city || '', shelter.state || '', 'pet adoption'].filter(Boolean),
    ogType: 'profile',
    canonical: `/shelters/${shelter.id}`,
  });
}

// ── Structured Data (JSON-LD) ────────────────────────────────

export interface StructuredDataConfig {
  type: 'Animal' | 'Organization' | 'Event' | 'WebSite' | 'BreadcrumbList';
  data: Record<string, unknown>;
}

export function generateAnimalSchema(animal: {
  name: string;
  species: string;
  breed?: string;
  description?: string;
  imageUrl?: string;
  shelter?: { name: string; url?: string };
}): StructuredDataConfig {
  return {
    type: 'Animal',
    data: {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: animal.name,
      description: animal.description || `${animal.name} is a ${animal.breed || animal.species} available for adoption.`,
      image: animal.imageUrl,
      category: animal.species,
      brand: animal.shelter ? { '@type': 'Organization', name: animal.shelter.name } : undefined,
      offers: {
        '@type': 'Offer',
        availability: 'https://schema.org/InStock',
        priceCurrency: 'USD',
      },
    },
  };
}

export function generateOrganizationSchema(org: {
  name: string;
  url?: string;
  logo?: string;
  phone?: string;
  email?: string;
  address?: { street?: string; city?: string; state?: string; zip?: string };
}): StructuredDataConfig {
  return {
    type: 'Organization',
    data: {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: org.name,
      url: org.url,
      logo: org.logo,
      telephone: org.phone,
      email: org.email,
      address: org.address ? {
        '@type': 'PostalAddress',
        streetAddress: org.address.street,
        addressLocality: org.address.city,
        addressRegion: org.address.state,
        postalCode: org.address.zip,
        addressCountry: 'US',
      } : undefined,
    },
  };
}

export function generateEventSchema(event: {
  name: string;
  startDate: string;
  endDate?: string;
  location?: string;
  description?: string;
  url?: string;
}): StructuredDataConfig {
  return {
    type: 'Event',
    data: {
      '@context': 'https://schema.org',
      '@type': 'Event',
      name: event.name,
      startDate: event.startDate,
      endDate: event.endDate,
      location: event.location ? { '@type': 'Place', name: event.location } : undefined,
      description: event.description,
      url: event.url,
    },
  };
}

export function generateBreadcrumbSchema(items: { name: string; url: string }[]): StructuredDataConfig {
  return {
    type: 'BreadcrumbList',
    data: {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: item.url,
      })),
    },
  };
}

export function generateWebSiteSchema(): StructuredDataConfig {
  return {
    type: 'WebSite',
    data: {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Save A Stray',
      url: 'https://saveastray.com',
      description: 'Modern pet adoption platform connecting shelters, rescues, and adopters.',
      potentialAction: {
        '@type': 'SearchAction',
        target: 'https://saveastray.com/animals?q={search_term_string}',
        'query-input': 'required name=search_term_string',
      },
    },
  };
}

export function renderJsonLd(schema: StructuredDataConfig): string {
  return JSON.stringify(schema.data, null, 0);
}

// ── Sitemap Generation ───────────────────────────────────────

export interface SitemapEntry {
  url: string;
  lastmod?: string;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
}

export const STATIC_PAGES: SitemapEntry[] = [
  { url: '/', changefreq: 'daily', priority: 1.0 },
  { url: '/animals', changefreq: 'hourly', priority: 0.9 },
  { url: '/shelters', changefreq: 'weekly', priority: 0.7 },
  { url: '/about', changefreq: 'monthly', priority: 0.5 },
  { url: '/faq', changefreq: 'monthly', priority: 0.4 },
  { url: '/success-stories', changefreq: 'weekly', priority: 0.6 },
  { url: '/events', changefreq: 'daily', priority: 0.6 },
  { url: '/foster', changefreq: 'monthly', priority: 0.5 },
  { url: '/contact', changefreq: 'monthly', priority: 0.3 },
  { url: '/privacy', changefreq: 'yearly', priority: 0.2 },
  { url: '/terms', changefreq: 'yearly', priority: 0.2 },
];

export function generateSitemapEntries(
  dynamicPages: { url: string; lastmod: string; priority?: number }[]
): SitemapEntry[] {
  const staticEntries = STATIC_PAGES.map(p => ({
    ...p,
    lastmod: new Date().toISOString().split('T')[0],
  }));

  const dynamicEntries: SitemapEntry[] = dynamicPages.map(page => ({
    url: page.url,
    lastmod: page.lastmod,
    changefreq: 'weekly' as const,
    priority: page.priority || 0.6,
  }));

  return [...staticEntries, ...dynamicEntries];
}

export function generateSitemapXml(entries: SitemapEntry[], baseUrl: string): string {
  const urls = entries.map(entry => {
    const parts = [
      `  <url>`,
      `    <loc>${baseUrl}${entry.url}</loc>`,
    ];
    if (entry.lastmod) parts.push(`    <lastmod>${entry.lastmod}</lastmod>`);
    parts.push(`    <changefreq>${entry.changefreq}</changefreq>`);
    parts.push(`    <priority>${entry.priority.toFixed(1)}</priority>`);
    parts.push(`  </url>`);
    return parts.join('\n');
  });

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls,
    '</urlset>',
  ].join('\n');
}

// ── Robots.txt Generation ────────────────────────────────────

export function generateRobotsTxt(baseUrl: string): string {
  return [
    'User-agent: *',
    'Allow: /',
    'Disallow: /api/',
    'Disallow: /graphql',
    'Disallow: /admin/',
    'Disallow: /demo/',
    'Disallow: /shelter/dashboard',
    '',
    `Sitemap: ${baseUrl}/sitemap.xml`,
  ].join('\n');
}

// ── SEO-Friendly URL Slugs ───────────────────────────────────

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function generateAnimalSlug(animal: { name: string; species: string; id: string }): string {
  const base = generateSlug(`${animal.name}-${animal.species}`);
  return `/animals/${base}-${animal.id.slice(-6)}`;
}

export function generateShelterSlug(shelter: { name: string; id: string }): string {
  const base = generateSlug(shelter.name);
  return `/shelters/${base}-${shelter.id.slice(-6)}`;
}

// ── Social Sharing ───────────────────────────────────────────

export interface ShareConfig {
  url: string;
  title: string;
  description: string;
  image?: string;
  hashtags?: string[];
}

export function generateShareUrl(platform: string, config: ShareConfig): string {
  const encodedUrl = encodeURIComponent(config.url);
  const encodedTitle = encodeURIComponent(config.title);
  const encodedDesc = encodeURIComponent(config.description);
  const hashtagStr = config.hashtags ? config.hashtags.map(h => h.replace(/^#/, '')).join(',') : '';

  const shareUrlMap: Record<string, string> = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}${hashtagStr ? `&hashtags=${encodeURIComponent(hashtagStr)}` : ''}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    pinterest: `https://pinterest.com/pin/create/button/?url=${encodedUrl}&description=${encodedDesc}${config.image ? `&media=${encodeURIComponent(config.image)}` : ''}`,
    email: `mailto:?subject=${encodedTitle}&body=${encodedDesc}%0A%0A${encodedUrl}`,
  };

  return shareUrlMap[platform] || '';
}

export function getSupportedPlatforms(): string[] {
  return ['facebook', 'twitter', 'linkedin', 'pinterest', 'email'];
}

// ── Analytics Event Tracking ─────────────────────────────────

export interface AnalyticsEvent {
  category: string;
  action: string;
  label?: string;
  value?: number;
}

const ANALYTICS_KEY = 'seo_analytics_events';

export function trackAnalyticsEvent(event: AnalyticsEvent): void {
  try {
    const data = localStorage.getItem(ANALYTICS_KEY);
    const events: (AnalyticsEvent & { timestamp: string })[] = data ? JSON.parse(data) : [];
    events.push({ ...event, timestamp: new Date().toISOString() });
    if (events.length > 1000) events.splice(0, events.length - 1000);
    localStorage.setItem(ANALYTICS_KEY, JSON.stringify(events));
  } catch {
    // Silent fail
  }
}

export function getAnalyticsEvents(): (AnalyticsEvent & { timestamp: string })[] {
  try {
    const data = localStorage.getItem(ANALYTICS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function getAnalyticsSummary(): {
  totalEvents: number;
  topCategories: { category: string; count: number }[];
  topActions: { action: string; count: number }[];
} {
  const events = getAnalyticsEvents();
  if (events.length === 0) {
    return { totalEvents: 0, topCategories: [], topActions: [] };
  }

  const categoryMap: Record<string, number> = {};
  const actionMap: Record<string, number> = {};
  for (const e of events) {
    categoryMap[e.category] = (categoryMap[e.category] || 0) + 1;
    actionMap[e.action] = (actionMap[e.action] || 0) + 1;
  }

  const topCategories = Object.entries(categoryMap)
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const topActions = Object.entries(actionMap)
    .map(([action, count]) => ({ action, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return { totalEvents: events.length, topCategories, topActions };
}

export function clearAnalyticsEvents(): void {
  localStorage.removeItem(ANALYTICS_KEY);
}

// ── Page Speed Optimization Hints ────────────────────────────

export interface PageSpeedHint {
  category: 'performance' | 'accessibility' | 'seo' | 'best-practices';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
}

export const PAGE_SPEED_HINTS: PageSpeedHint[] = [
  { category: 'performance', title: 'Lazy load images', description: 'Use loading="lazy" on images below the fold', impact: 'high' },
  { category: 'performance', title: 'Preload critical assets', description: 'Add preload hints for fonts and hero images', impact: 'high' },
  { category: 'performance', title: 'Minimize JavaScript', description: 'Code split routes and lazy load non-critical components', impact: 'high' },
  { category: 'performance', title: 'Optimize images', description: 'Use WebP format and responsive srcset attributes', impact: 'medium' },
  { category: 'performance', title: 'Cache static assets', description: 'Set long cache headers for immutable assets', impact: 'medium' },
  { category: 'accessibility', title: 'Alt text for images', description: 'All images should have descriptive alt attributes', impact: 'high' },
  { category: 'accessibility', title: 'Semantic headings', description: 'Use proper heading hierarchy (h1, h2, h3)', impact: 'medium' },
  { category: 'accessibility', title: 'Color contrast', description: 'Ensure text meets WCAG 2.1 AA contrast ratios', impact: 'high' },
  { category: 'seo', title: 'Meta descriptions', description: 'Every page should have a unique meta description under 160 characters', impact: 'high' },
  { category: 'seo', title: 'Canonical URLs', description: 'Set canonical URLs to prevent duplicate content issues', impact: 'medium' },
  { category: 'seo', title: 'Structured data', description: 'Add JSON-LD structured data for animal and organization schemas', impact: 'medium' },
  { category: 'best-practices', title: 'HTTPS everywhere', description: 'All resources should load over HTTPS', impact: 'high' },
  { category: 'best-practices', title: 'No mixed content', description: 'Avoid loading HTTP resources on HTTPS pages', impact: 'high' },
];

export function getPageSpeedHints(category?: string): PageSpeedHint[] {
  if (!category) return [...PAGE_SPEED_HINTS];
  return PAGE_SPEED_HINTS.filter(h => h.category === category);
}

export function getHighImpactHints(): PageSpeedHint[] {
  return PAGE_SPEED_HINTS.filter(h => h.impact === 'high');
}
