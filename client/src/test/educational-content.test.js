import { describe, it, expect } from 'vitest';
import {
  ARTICLES, searchArticles, filterArticles, getArticleBySlug, getRelatedArticles,
  ADOPTION_QUIZ, scoreQuiz,
  getVideoProgress, getBookmarkedVideos,
  submitQuestion, answerQuestion, acceptAnswer,
  recommendContent,
  SUPPORTED_LANGUAGES, getAvailableTranslations,
  calculateContentAnalytics,
} from '../lib/educational-content';

describe('Educational Content', () => {

  describe('Article Library', () => {
    it('should have at least 10 articles', () => {
      expect(ARTICLES.length).toBeGreaterThanOrEqual(10);
    });

    it('should include multiple categories', () => {
      const cats = new Set(ARTICLES.map(a => a.category));
      expect(cats.size).toBeGreaterThan(3);
    });

    it('should include both dog and cat content', () => {
      expect(ARTICLES.some(a => a.animalType === 'dog')).toBe(true);
      expect(ARTICLES.some(a => a.animalType === 'cat')).toBe(true);
    });

    it('should search by title', () => {
      const results = searchArticles('obedience');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].title.toLowerCase()).toContain('obedience');
    });

    it('should search by tag', () => {
      const results = searchArticles('first-aid');
      expect(results.length).toBeGreaterThan(0);
    });

    it('should return all articles for empty search', () => {
      expect(searchArticles('')).toHaveLength(ARTICLES.length);
    });

    it('should filter by category', () => {
      const results = filterArticles({ category: 'training' });
      expect(results.length).toBeGreaterThan(0);
      results.forEach(a => expect(a.category).toBe('training'));
    });

    it('should filter by animal type', () => {
      const results = filterArticles({ animalType: 'dog' });
      expect(results.length).toBeGreaterThan(0);
      results.forEach(a => expect(['dog', 'all']).toContain(a.animalType));
    });

    it('should filter by difficulty', () => {
      const results = filterArticles({ difficulty: 'beginner' });
      expect(results.length).toBeGreaterThan(0);
    });

    it('should get article by slug', () => {
      const article = getArticleBySlug('basic-obedience-training');
      expect(article).not.toBeNull();
      expect(article.title).toContain('Obedience');
    });

    it('should return null for unknown slug', () => {
      expect(getArticleBySlug('nonexistent')).toBeNull();
    });

    it('should get related articles', () => {
      const article = ARTICLES[0];
      const related = getRelatedArticles(article);
      expect(related.length).toBeGreaterThan(0);
      expect(related.find(a => a.id === article.id)).toBeUndefined();
    });
  });

  describe('Adoption Readiness Quiz', () => {
    it('should have at least 5 questions', () => {
      expect(ADOPTION_QUIZ.length).toBeGreaterThanOrEqual(5);
    });

    it('should have 4 options per question', () => {
      ADOPTION_QUIZ.forEach(q => {
        expect(q.options).toHaveLength(4);
      });
    });

    it('should score perfect answers as ready', () => {
      const answers = {};
      ADOPTION_QUIZ.forEach(q => { answers[q.id] = 'a'; }); // 'a' is highest score
      const result = scoreQuiz(answers);
      expect(result.readiness).toBe('ready');
      expect(result.percentage).toBeGreaterThanOrEqual(80);
    });

    it('should score low answers as not ready', () => {
      const answers = {};
      ADOPTION_QUIZ.forEach(q => { answers[q.id] = 'd'; }); // 'd' is lowest score
      const result = scoreQuiz(answers);
      expect(['not-ready', 'needs-preparation']).toContain(result.readiness);
    });

    it('should handle empty answers', () => {
      const result = scoreQuiz({});
      expect(result.score).toBe(0);
      expect(result.readiness).toBe('not-ready');
    });

    it('should provide feedback for weak areas', () => {
      const answers = {};
      ADOPTION_QUIZ.forEach(q => { answers[q.id] = 'd'; });
      const result = scoreQuiz(answers);
      expect(result.feedback.length).toBeGreaterThan(0);
    });

    it('should calculate percentage correctly', () => {
      const answers = {};
      ADOPTION_QUIZ.forEach(q => { answers[q.id] = 'a'; });
      const result = scoreQuiz(answers);
      expect(result.percentage).toBe(100);
    });
  });

  describe('Video Tutorials', () => {
    it('should track video progress', () => {
      const videos = [
        { id: 'v1', title: 'Intro', description: '', url: '', durationMinutes: 10, category: 'training', animalType: 'dog', order: 1 },
        { id: 'v2', title: 'Basics', description: '', url: '', durationMinutes: 15, category: 'training', animalType: 'dog', order: 2 },
      ];
      const progress = [
        { videoId: 'v1', watchedMinutes: 10, completed: true, bookmarked: false, lastWatchedAt: '2026-01-01' },
      ];
      const result = getVideoProgress(progress, videos);
      expect(result.completed).toBe(1);
      expect(result.total).toBe(2);
      expect(result.percentComplete).toBe(50);
    });

    it('should track bookmarked videos', () => {
      const progress = [
        { videoId: 'v1', watchedMinutes: 10, completed: true, bookmarked: true, lastWatchedAt: '2026-01-01' },
        { videoId: 'v2', watchedMinutes: 5, completed: false, bookmarked: false, lastWatchedAt: '2026-01-02' },
        { videoId: 'v3', watchedMinutes: 8, completed: true, bookmarked: true, lastWatchedAt: '2026-01-03' },
      ];
      const bookmarked = getBookmarkedVideos(progress);
      expect(bookmarked).toHaveLength(2);
      expect(bookmarked).toContain('v1');
      expect(bookmarked).toContain('v3');
    });
  });

  describe('Expert Q&A', () => {
    it('should submit a question', () => {
      const q = submitQuestion('user1', 'How often should I feed my puppy?', 'nutrition', 'dog');
      expect(q.status).toBe('open');
      expect(q.question).toContain('puppy');
    });

    it('should answer a question', () => {
      const ans = answerQuestion('qa1', 'expert1', 'Dr. Smith', 'Veterinarian', 'Feed 3 times a day.');
      expect(ans.questionId).toBe('qa1');
      expect(ans.isAccepted).toBe(false);
    });

    it('should accept an answer', () => {
      const ans = answerQuestion('qa1', 'expert1', 'Dr. Smith', 'Vet', 'Answer');
      const accepted = acceptAnswer(ans);
      expect(accepted.isAccepted).toBe(true);
    });
  });

  describe('Content Recommendation', () => {
    it('should recommend popular articles for new users', () => {
      const recs = recommendContent([]);
      expect(recs.length).toBeGreaterThan(0);
      // Should be sorted by popularity
      for (let i = 1; i < recs.length; i++) {
        expect(recs[i - 1].viewCount).toBeGreaterThanOrEqual(recs[i].viewCount);
      }
    });

    it('should recommend based on view history', () => {
      const history = [
        { articleId: 'a1', category: 'adoption-prep', animalType: 'dog' },
        { articleId: 'a3', category: 'training', animalType: 'dog' },
      ];
      const recs = recommendContent(history, 3);
      expect(recs.length).toBeGreaterThan(0);
      expect(recs.find(a => a.id === 'a1')).toBeUndefined(); // exclude viewed
      expect(recs.find(a => a.id === 'a3')).toBeUndefined();
    });

    it('should not recommend already viewed articles', () => {
      const history = ARTICLES.map(a => ({ articleId: a.id, category: a.category, animalType: a.animalType }));
      const recs = recommendContent(history);
      expect(recs).toHaveLength(0);
    });
  });

  describe('Multilingual Support', () => {
    it('should support at least 6 languages', () => {
      expect(SUPPORTED_LANGUAGES.length).toBeGreaterThanOrEqual(6);
    });

    it('should find available translations', () => {
      const translations = [
        { articleId: 'a1', language: 'es', title: 'Primeros dias', content: '...', translatedAt: '2026-01-15', status: 'published' },
        { articleId: 'a1', language: 'fr', title: 'Premiers jours', content: '...', translatedAt: '2026-01-15', status: 'draft' },
      ];
      const available = getAvailableTranslations(translations, 'a1');
      expect(available).toHaveLength(1);
      expect(available).toContain('es');
    });
  });

  describe('Content Analytics', () => {
    it('should calculate analytics', () => {
      const analytics = calculateContentAnalytics(ARTICLES);
      expect(analytics.totalArticles).toBe(ARTICLES.length);
      expect(analytics.totalViews).toBeGreaterThan(0);
      expect(analytics.totalBookmarks).toBeGreaterThan(0);
      expect(analytics.averageReadTime).toBeGreaterThan(0);
      expect(analytics.topArticles.length).toBeLessThanOrEqual(5);
    });

    it('should calculate views by category', () => {
      const analytics = calculateContentAnalytics(ARTICLES);
      expect(Object.keys(analytics.viewsByCategory).length).toBeGreaterThan(0);
    });

    it('should sort top articles by views', () => {
      const analytics = calculateContentAnalytics(ARTICLES);
      for (let i = 1; i < analytics.topArticles.length; i++) {
        expect(analytics.topArticles[i - 1].views).toBeGreaterThanOrEqual(analytics.topArticles[i].views);
      }
    });

    it('should handle empty input', () => {
      const analytics = calculateContentAnalytics([]);
      expect(analytics.totalArticles).toBe(0);
      expect(analytics.totalViews).toBe(0);
      expect(analytics.averageReadTime).toBe(0);
    });
  });
});
