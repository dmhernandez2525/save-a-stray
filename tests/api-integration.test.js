const request = require('supertest');

// Mock mongoose to prevent actual DB connections
jest.mock('mongoose', () => {
  const originalModule = jest.requireActual('mongoose');
  return {
    ...originalModule,
    connect: jest.fn().mockResolvedValue(true),
    model: jest.fn().mockImplementation((modelName) => {
      const mockModels = {
        user: {
          find: jest.fn().mockResolvedValue([]),
          findOne: jest.fn().mockResolvedValue(null),
          findById: jest.fn().mockResolvedValue(null)
        },
        animal: {
          find: jest.fn().mockResolvedValue([]),
          findById: jest.fn().mockResolvedValue(null)
        },
        shelter: {
          find: jest.fn().mockResolvedValue([]),
          findById: jest.fn().mockResolvedValue(null)
        },
        application: {
          find: jest.fn().mockResolvedValue([]),
          findById: jest.fn().mockResolvedValue(null)
        }
      };
      return mockModels[modelName] || {};
    }),
    Schema: originalModule.Schema
  };
});

// Mock passport
jest.mock('passport', () => ({
  use: jest.fn(),
  serializeUser: jest.fn(),
  deserializeUser: jest.fn(),
  initialize: jest.fn().mockReturnValue((req, res, next) => next()),
  session: jest.fn().mockReturnValue((req, res, next) => next()),
  authenticate: jest.fn().mockReturnValue((req, res, next) => next())
}));

// Mock passport-facebook
jest.mock('passport-facebook', () => ({
  Strategy: jest.fn().mockImplementation(() => ({}))
}));

// Mock config keys
jest.mock('../config/keys', () => ({
  MONGO_URI: 'mongodb://mock-db',
  secretOrKey: 'test-secret',
  fbookClient: 'mock-fb-client',
  fbookKey: 'mock-fb-key'
}));

// Mock auth service
jest.mock('../server/services/auth', () => ({
  register: jest.fn(),
  login: jest.fn(),
  logout: jest.fn(),
  verifyUser: jest.fn(),
  facebookRegister: jest.fn(),
  userId: jest.fn()
}));

describe('API Integration Tests', () => {
  let app;

  beforeAll(() => {
    // Import app after mocks are set up
    app = require('../server/server').default;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GraphQL Endpoint', () => {
    it('should respond to GraphQL endpoint', async () => {
      const response = await request(app)
        .post('/graphql')
        .set('Content-Type', 'application/json')
        .send({
          query: '{ __typename }'
        });

      // GraphQL endpoint should be accessible
      expect(response.status).toBeLessThan(500);
    });

    it('should handle introspection query', async () => {
      const response = await request(app)
        .post('/graphql')
        .set('Content-Type', 'application/json')
        .send({
          query: `
            query IntrospectionQuery {
              __schema {
                types {
                  name
                }
              }
            }
          `
        });

      expect(response.status).toBeLessThan(500);
    });

    it('should respond with correct content type', async () => {
      const response = await request(app)
        .post('/graphql')
        .set('Content-Type', 'application/json')
        .send({
          query: '{ __typename }'
        });

      expect(response.headers['content-type']).toMatch(/json/);
    });
  });

  describe('CORS Configuration', () => {
    it('should include CORS headers in response', async () => {
      const response = await request(app)
        .post('/graphql')
        .set('Content-Type', 'application/json')
        .send({
          query: '{ __typename }'
        });

      expect(response.headers['access-control-allow-origin']).toBeDefined();
    });

    it('should allow all origins', async () => {
      const response = await request(app)
        .options('/graphql')
        .set('Origin', 'http://localhost:3000');

      expect(response.status).toBeLessThan(500);
    });
  });

  describe('Server Configuration', () => {
    it('should export express app', () => {
      expect(app).toBeDefined();
      expect(typeof app).toBe('function');
    });

    it('should have graphql route configured', async () => {
      const response = await request(app)
        .post('/graphql')
        .set('Content-Type', 'application/json')
        .send({ query: '{ __typename }' });

      expect(response.status).not.toBe(404);
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed GraphQL queries gracefully', async () => {
      const response = await request(app)
        .post('/graphql')
        .set('Content-Type', 'application/json')
        .send({
          query: 'this is not valid graphql'
        });

      expect(response.status).toBeLessThan(500);
    });

    it('should handle missing query gracefully', async () => {
      const response = await request(app)
        .post('/graphql')
        .set('Content-Type', 'application/json')
        .send({});

      expect(response.status).toBeLessThan(500);
    });

    it('should handle invalid JSON gracefully', async () => {
      const response = await request(app)
        .post('/graphql')
        .set('Content-Type', 'application/json')
        .send('not json');

      expect(response.status).toBeLessThan(500);
    });
  });
});

describe('GraphQL Schema Tests', () => {
  it('should have Query type defined', () => {
    const schema = require('../server/schema/schema').default;

    expect(schema).toBeDefined();
    expect(schema._queryType).toBeDefined();
  });

  it('should have Mutation type defined', () => {
    const schema = require('../server/schema/schema').default;

    expect(schema._mutationType).toBeDefined();
  });

  it('should have correct query fields', () => {
    const RootQueryType = require('../server/schema/types/root_query_type').default;
    const fields = RootQueryType.getFields();

    expect(fields.users).toBeDefined();
    expect(fields.user).toBeDefined();
    expect(fields.animals).toBeDefined();
    expect(fields.animal).toBeDefined();
    expect(fields.shelters).toBeDefined();
    expect(fields.shelter).toBeDefined();
    expect(fields.applications).toBeDefined();
    expect(fields.findAnimals).toBeDefined();
  });

  it('should have multi-field filter args on findAnimals', () => {
    const RootQueryType = require('../server/schema/types/root_query_type').default;
    const fields = RootQueryType.getFields();
    const findAnimalsArgs = fields.findAnimals.args;

    const argNames = findAnimalsArgs.map(arg => arg.name);
    expect(argNames).toContain('type');
    expect(argNames).toContain('breed');
    expect(argNames).toContain('sex');
    expect(argNames).toContain('color');
    expect(argNames).toContain('name');
    expect(argNames).toContain('status');
    expect(argNames).toContain('minAge');
    expect(argNames).toContain('maxAge');
  });

  it('should have pagination args (limit, offset) on findAnimals', () => {
    const RootQueryType = require('../server/schema/types/root_query_type').default;
    const fields = RootQueryType.getFields();
    const findAnimalsArgs = fields.findAnimals.args;

    const argNames = findAnimalsArgs.map(arg => arg.name);
    expect(argNames).toContain('limit');
    expect(argNames).toContain('offset');
  });

  it('should have updateAnimalStatus mutation', () => {
    const schema = require('../server/schema/schema').default;
    const mutationFields = schema._mutationType.getFields();

    expect(mutationFields.updateAnimalStatus).toBeDefined();
    const args = mutationFields.updateAnimalStatus.args.map(a => a.name);
    expect(args).toContain('_id');
    expect(args).toContain('status');
  });

  it('should have status field on AnimalType', () => {
    const AnimalType = require('../server/schema/types/animal_type').default;
    const fields = AnimalType.getFields();

    expect(fields.status).toBeDefined();
  });

  it('should have addFavorite and removeFavorite mutations', () => {
    const schema = require('../server/schema/schema').default;
    const mutationFields = schema._mutationType.getFields();

    expect(mutationFields.addFavorite).toBeDefined();
    expect(mutationFields.removeFavorite).toBeDefined();

    const addArgs = mutationFields.addFavorite.args.map(a => a.name);
    expect(addArgs).toContain('userId');
    expect(addArgs).toContain('animalId');

    const removeArgs = mutationFields.removeFavorite.args.map(a => a.name);
    expect(removeArgs).toContain('userId');
    expect(removeArgs).toContain('animalId');
  });

  it('should have userFavorites query', () => {
    const RootQueryType = require('../server/schema/types/root_query_type').default;
    const fields = RootQueryType.getFields();

    expect(fields.userFavorites).toBeDefined();
    const args = fields.userFavorites.args.map(a => a.name);
    expect(args).toContain('userId');
  });

  it('should have favorites and favoriteIds fields on UserType', () => {
    const UserType = require('../server/schema/types/user_type').default;
    const fields = UserType.getFields();

    expect(fields.favorites).toBeDefined();
    expect(fields.favoriteIds).toBeDefined();
  });

  it('should have status and submittedAt fields on ApplicationType', () => {
    const ApplicationType = require('../server/schema/types/application_type').default;
    const fields = ApplicationType.getFields();

    expect(fields.status).toBeDefined();
    expect(fields.submittedAt).toBeDefined();
  });

  it('should have updateApplicationStatus mutation', () => {
    const schema = require('../server/schema/schema').default;
    const mutationFields = schema._mutationType.getFields();

    expect(mutationFields.updateApplicationStatus).toBeDefined();
    const args = mutationFields.updateApplicationStatus.args.map(a => a.name);
    expect(args).toContain('_id');
    expect(args).toContain('status');
  });

  it('should have shelterApplications query', () => {
    const RootQueryType = require('../server/schema/types/root_query_type').default;
    const fields = RootQueryType.getFields();

    expect(fields.shelterApplications).toBeDefined();
    const args = fields.shelterApplications.args.map(a => a.name);
    expect(args).toContain('shelterId');
  });

  it('should have userApplications query', () => {
    const RootQueryType = require('../server/schema/types/root_query_type').default;
    const fields = RootQueryType.getFields();

    expect(fields.userApplications).toBeDefined();
    const args = fields.userApplications.args.map(a => a.name);
    expect(args).toContain('userId');
  });

  it('should have images field on AnimalType', () => {
    const AnimalType = require('../server/schema/types/animal_type').default;
    const fields = AnimalType.getFields();

    expect(fields.images).toBeDefined();
  });

  it('should have images arg on newAnimal and updateAnimal mutations', () => {
    const schema = require('../server/schema/schema').default;
    const mutationFields = schema._mutationType.getFields();

    const newAnimalArgs = mutationFields.newAnimal.args.map(a => a.name);
    expect(newAnimalArgs).toContain('images');

    const updateAnimalArgs = mutationFields.updateAnimal.args.map(a => a.name);
    expect(updateAnimalArgs).toContain('images');
  });

  it('should have shelter registration args on register mutation', () => {
    const schema = require('../server/schema/schema').default;
    const mutationFields = schema._mutationType.getFields();

    expect(mutationFields.register).toBeDefined();
    const args = mutationFields.register.args.map(a => a.name);
    expect(args).toContain('name');
    expect(args).toContain('email');
    expect(args).toContain('password');
    expect(args).toContain('userRole');
    expect(args).toContain('shelterId');
    expect(args).toContain('shelterName');
    expect(args).toContain('shelterLocation');
    expect(args).toContain('shelterPaymentEmail');
  });

  it('should have successStories query', () => {
    const RootQueryType = require('../server/schema/types/root_query_type').default;
    const fields = RootQueryType.getFields();

    expect(fields.successStories).toBeDefined();
  });

  it('should have SuccessStoryType with correct fields', () => {
    const SuccessStoryType = require('../server/schema/types/success_story_type').default;
    const fields = SuccessStoryType.getFields();

    expect(fields._id).toBeDefined();
    expect(fields.userId).toBeDefined();
    expect(fields.animalName).toBeDefined();
    expect(fields.animalType).toBeDefined();
    expect(fields.title).toBeDefined();
    expect(fields.story).toBeDefined();
    expect(fields.image).toBeDefined();
    expect(fields.createdAt).toBeDefined();
  });

  it('should have createSuccessStory mutation with correct args', () => {
    const schema = require('../server/schema/schema').default;
    const mutationFields = schema._mutationType.getFields();

    expect(mutationFields.createSuccessStory).toBeDefined();
    const args = mutationFields.createSuccessStory.args.map(a => a.name);
    expect(args).toContain('userId');
    expect(args).toContain('animalName');
    expect(args).toContain('animalType');
    expect(args).toContain('title');
    expect(args).toContain('story');
    expect(args).toContain('image');
  });

  it('should have similarAnimals query with correct args', () => {
    const RootQueryType = require('../server/schema/types/root_query_type').default;
    const fields = RootQueryType.getFields();

    expect(fields.similarAnimals).toBeDefined();
    const args = fields.similarAnimals.args.map(a => a.name);
    expect(args).toContain('animalId');
    expect(args).toContain('limit');
  });

  it('should have shelterAnalytics query with shelterId arg', () => {
    const RootQueryType = require('../server/schema/types/root_query_type').default;
    const fields = RootQueryType.getFields();

    expect(fields.shelterAnalytics).toBeDefined();
    const args = fields.shelterAnalytics.args.map(a => a.name);
    expect(args).toContain('shelterId');
  });

  it('should have ShelterAnalyticsType with all analytics fields', () => {
    const ShelterAnalyticsType = require('../server/schema/types/shelter_analytics_type').default;
    const fields = ShelterAnalyticsType.getFields();

    expect(fields.totalAnimals).toBeDefined();
    expect(fields.availableAnimals).toBeDefined();
    expect(fields.pendingAnimals).toBeDefined();
    expect(fields.adoptedAnimals).toBeDefined();
    expect(fields.adoptionRate).toBeDefined();
    expect(fields.totalApplications).toBeDefined();
    expect(fields.submittedApplications).toBeDefined();
    expect(fields.underReviewApplications).toBeDefined();
    expect(fields.approvedApplications).toBeDefined();
    expect(fields.rejectedApplications).toBeDefined();
    expect(fields.recentApplications).toBeDefined();
  });
});
