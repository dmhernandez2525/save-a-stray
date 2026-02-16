import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import { apiKeyAuthMiddleware, hasScope } from '../middleware/api-key-auth';
import { AnimalDocument } from '../models/Animal';
import { ShelterDocument } from '../models/Shelter';
import { ApplicationDocument } from '../models/Application';
import { EventDocument } from '../models/Event';
import { SuccessStoryDocument } from '../models/SuccessStory';

const router = Router();

const Animal = mongoose.model<AnimalDocument>('animal');
const Shelter = mongoose.model<ShelterDocument>('shelter');
const Application = mongoose.model<ApplicationDocument>('application');
const EventModel = mongoose.model<EventDocument>('event');
const SuccessStoryModel = mongoose.model<SuccessStoryDocument>('successStory');

// All v1 routes require API key
router.use(apiKeyAuthMiddleware);

const MAX_LIMIT = 100;
const DEFAULT_LIMIT = 20;

function parsePagination(req: Request): { limit: number; offset: number } {
  const limit = Math.min(Math.max(parseInt(req.query.limit as string, 10) || DEFAULT_LIMIT, 1), MAX_LIMIT);
  const offset = Math.max(parseInt(req.query.offset as string, 10) || 0, 0);
  return { limit, offset };
}

// ── API Info ──────────────────────────────────────────────────

router.get('/', (_req: Request, res: Response) => {
  res.json({
    version: 'v1',
    documentation: '/api/v1/docs',
    endpoints: [
      'GET /api/v1/animals',
      'GET /api/v1/animals/:id',
      'GET /api/v1/animals/search',
      'GET /api/v1/shelters',
      'GET /api/v1/shelters/:id',
      'GET /api/v1/shelters/:id/animals',
      'GET /api/v1/events',
      'GET /api/v1/success-stories',
      'GET /api/v1/stats',
    ],
  });
});

// ── Animals ──────────────────────────────────────────────────

router.get('/animals', async (req: Request, res: Response) => {
  if (!hasScope(req, 'read:animals')) {
    res.status(403).json({ error: 'Missing scope: read:animals' });
    return;
  }

  const { limit, offset } = parsePagination(req);
  const filter: Record<string, unknown> = {};

  if (req.query.status) filter.status = req.query.status;
  if (req.query.type) filter.type = req.query.type;
  if (req.query.breed) filter.breed = { $regex: req.query.breed, $options: 'i' };

  try {
    const [animals, total] = await Promise.all([
      Animal.find(filter)
        .select('-medicalRecords -applications')
        .skip(offset)
        .limit(limit)
        .lean(),
      Animal.countDocuments(filter),
    ]);

    res.json({
      data: animals,
      pagination: { total, limit, offset, hasMore: offset + limit < total },
    });
  } catch {
    res.status(500).json({ error: 'Failed to fetch animals.' });
  }
});

router.get('/animals/search', async (req: Request, res: Response) => {
  if (!hasScope(req, 'read:animals')) {
    res.status(403).json({ error: 'Missing scope: read:animals' });
    return;
  }

  const { limit, offset } = parsePagination(req);
  const q = req.query.q as string;
  if (!q) {
    res.status(400).json({ error: 'Query parameter "q" is required.' });
    return;
  }

  try {
    const filter = {
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { breed: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { type: { $regex: q, $options: 'i' } },
      ],
    };

    const [animals, total] = await Promise.all([
      Animal.find(filter).select('-medicalRecords -applications').skip(offset).limit(limit).lean(),
      Animal.countDocuments(filter),
    ]);

    res.json({
      data: animals,
      pagination: { total, limit, offset, hasMore: offset + limit < total },
      query: q,
    });
  } catch {
    res.status(500).json({ error: 'Search failed.' });
  }
});

router.get('/animals/:id', async (req: Request, res: Response) => {
  if (!hasScope(req, 'read:animals')) {
    res.status(403).json({ error: 'Missing scope: read:animals' });
    return;
  }

  try {
    const animal = await Animal.findById(req.params.id).select('-applications').lean();
    if (!animal) {
      res.status(404).json({ error: 'Animal not found.' });
      return;
    }
    res.json({ data: animal });
  } catch {
    res.status(500).json({ error: 'Failed to fetch animal.' });
  }
});

// ── Shelters ──────────────────────────────────────────────────

router.get('/shelters', async (req: Request, res: Response) => {
  if (!hasScope(req, 'read:shelters')) {
    res.status(403).json({ error: 'Missing scope: read:shelters' });
    return;
  }

  const { limit, offset } = parsePagination(req);

  try {
    const [shelters, total] = await Promise.all([
      Shelter.find({}).select('-users -animals').skip(offset).limit(limit).lean(),
      Shelter.countDocuments({}),
    ]);

    res.json({
      data: shelters,
      pagination: { total, limit, offset, hasMore: offset + limit < total },
    });
  } catch {
    res.status(500).json({ error: 'Failed to fetch shelters.' });
  }
});

router.get('/shelters/:id', async (req: Request, res: Response) => {
  if (!hasScope(req, 'read:shelters')) {
    res.status(403).json({ error: 'Missing scope: read:shelters' });
    return;
  }

  try {
    const shelter = await Shelter.findById(req.params.id).select('-users').lean();
    if (!shelter) {
      res.status(404).json({ error: 'Shelter not found.' });
      return;
    }
    res.json({ data: shelter });
  } catch {
    res.status(500).json({ error: 'Failed to fetch shelter.' });
  }
});

router.get('/shelters/:id/animals', async (req: Request, res: Response) => {
  if (!hasScope(req, 'read:animals')) {
    res.status(403).json({ error: 'Missing scope: read:animals' });
    return;
  }

  const { limit, offset } = parsePagination(req);

  try {
    const shelter = await Shelter.findById(req.params.id).lean();
    if (!shelter) {
      res.status(404).json({ error: 'Shelter not found.' });
      return;
    }

    const animalIds = (shelter.animals ?? []).map(id => id.toString());
    if (animalIds.length === 0) {
      res.json({ data: [], pagination: { total: 0, limit, offset, hasMore: false } });
      return;
    }

    const filter: Record<string, unknown> = { _id: { $in: animalIds } };
    if (req.query.status) filter.status = req.query.status;

    const [animals, total] = await Promise.all([
      Animal.find(filter).select('-medicalRecords -applications').skip(offset).limit(limit).lean(),
      Animal.countDocuments(filter),
    ]);

    res.json({
      data: animals,
      pagination: { total, limit, offset, hasMore: offset + limit < total },
    });
  } catch {
    res.status(500).json({ error: 'Failed to fetch shelter animals.' });
  }
});

// ── Events ──────────────────────────────────────────────────

router.get('/events', async (req: Request, res: Response) => {
  if (!hasScope(req, 'read:events')) {
    res.status(403).json({ error: 'Missing scope: read:events' });
    return;
  }

  const { limit, offset } = parsePagination(req);

  try {
    const [events, total] = await Promise.all([
      EventModel.find({}).skip(offset).limit(limit).lean(),
      EventModel.countDocuments({}),
    ]);

    res.json({
      data: events,
      pagination: { total, limit, offset, hasMore: offset + limit < total },
    });
  } catch {
    res.status(500).json({ error: 'Failed to fetch events.' });
  }
});

// ── Success Stories ──────────────────────────────────────────

router.get('/success-stories', async (req: Request, res: Response) => {
  if (!hasScope(req, 'read:stories')) {
    res.status(403).json({ error: 'Missing scope: read:stories' });
    return;
  }

  const { limit, offset } = parsePagination(req);

  try {
    const [stories, total] = await Promise.all([
      SuccessStoryModel.find({}).skip(offset).limit(limit).lean(),
      SuccessStoryModel.countDocuments({}),
    ]);

    res.json({
      data: stories,
      pagination: { total, limit, offset, hasMore: offset + limit < total },
    });
  } catch {
    res.status(500).json({ error: 'Failed to fetch success stories.' });
  }
});

// ── Platform Stats ──────────────────────────────────────────

router.get('/stats', async (req: Request, res: Response) => {
  if (!hasScope(req, 'read:stats')) {
    res.status(403).json({ error: 'Missing scope: read:stats' });
    return;
  }

  try {
    const [totalAnimals, availableAnimals, adoptedAnimals, totalShelters, totalApplications] = await Promise.all([
      Animal.countDocuments({}),
      Animal.countDocuments({ status: 'available' }),
      Animal.countDocuments({ status: 'adopted' }),
      Shelter.countDocuments({}),
      Application.countDocuments({}),
    ]);

    res.json({
      data: {
        totalAnimals,
        availableAnimals,
        adoptedAnimals,
        totalShelters,
        totalApplications,
        adoptionRate: totalAnimals > 0 ? Math.round((adoptedAnimals / totalAnimals) * 1000) / 1000 : 0,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch {
    res.status(500).json({ error: 'Failed to fetch stats.' });
  }
});

// ── API Docs ──────────────────────────────────────────────────

router.get('/docs', (_req: Request, res: Response) => {
  res.json({
    openapi: '3.0.3',
    info: {
      title: 'Save A Stray API',
      version: '1.0.0',
      description: 'Public REST API for the Save A Stray pet adoption platform',
    },
    servers: [{ url: '/api/v1', description: 'Version 1' }],
    paths: {
      '/animals': {
        get: {
          summary: 'List animals',
          parameters: [
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
            { name: 'offset', in: 'query', schema: { type: 'integer', default: 0 } },
            { name: 'status', in: 'query', schema: { type: 'string', enum: ['available', 'pending', 'adopted'] } },
            { name: 'type', in: 'query', schema: { type: 'string' } },
            { name: 'breed', in: 'query', schema: { type: 'string' } },
          ],
          responses: { '200': { description: 'List of animals with pagination' } },
        },
      },
      '/animals/search': {
        get: {
          summary: 'Search animals',
          parameters: [{ name: 'q', in: 'query', required: true, schema: { type: 'string' } }],
          responses: { '200': { description: 'Search results' } },
        },
      },
      '/animals/{id}': {
        get: {
          summary: 'Get animal by ID',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { '200': { description: 'Animal details' }, '404': { description: 'Not found' } },
        },
      },
      '/shelters': {
        get: {
          summary: 'List shelters',
          responses: { '200': { description: 'List of shelters with pagination' } },
        },
      },
      '/shelters/{id}': {
        get: {
          summary: 'Get shelter by ID',
          responses: { '200': { description: 'Shelter details' }, '404': { description: 'Not found' } },
        },
      },
      '/shelters/{id}/animals': {
        get: {
          summary: 'List animals for a shelter',
          responses: { '200': { description: 'Shelter animals with pagination' } },
        },
      },
      '/events': { get: { summary: 'List events', responses: { '200': { description: 'Events list' } } } },
      '/success-stories': { get: { summary: 'List success stories', responses: { '200': { description: 'Stories list' } } } },
      '/stats': { get: { summary: 'Platform statistics', responses: { '200': { description: 'Platform stats' } } } },
    },
    components: {
      securitySchemes: {
        ApiKeyAuth: { type: 'apiKey', in: 'header', name: 'X-API-Key' },
      },
    },
    security: [{ ApiKeyAuth: [] }],
  });
});

export default router;
