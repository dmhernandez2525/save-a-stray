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

  it('should have NotificationType with correct fields', () => {
    const NotificationType = require('../server/schema/types/notification_type').default;
    const fields = NotificationType.getFields();

    expect(fields._id).toBeDefined();
    expect(fields.userId).toBeDefined();
    expect(fields.message).toBeDefined();
    expect(fields.type).toBeDefined();
    expect(fields.read).toBeDefined();
    expect(fields.link).toBeDefined();
    expect(fields.createdAt).toBeDefined();
  });

  it('should have userNotifications query', () => {
    const RootQueryType = require('../server/schema/types/root_query_type').default;
    const fields = RootQueryType.getFields();

    expect(fields.userNotifications).toBeDefined();
    const args = fields.userNotifications.args.map(a => a.name);
    expect(args).toContain('userId');
  });

  it('should have markNotificationRead mutation', () => {
    const schema = require('../server/schema/schema').default;
    const mutationFields = schema._mutationType.getFields();

    expect(mutationFields.markNotificationRead).toBeDefined();
    expect(mutationFields.markAllNotificationsRead).toBeDefined();
  });

  it('should have ReviewType with correct fields', () => {
    const ReviewType = require('../server/schema/types/review_type').default;
    const fields = ReviewType.getFields();

    expect(fields._id).toBeDefined();
    expect(fields.userId).toBeDefined();
    expect(fields.shelterId).toBeDefined();
    expect(fields.rating).toBeDefined();
    expect(fields.comment).toBeDefined();
    expect(fields.createdAt).toBeDefined();
  });

  it('should have shelterReviews query', () => {
    const RootQueryType = require('../server/schema/types/root_query_type').default;
    const fields = RootQueryType.getFields();

    expect(fields.shelterReviews).toBeDefined();
    const args = fields.shelterReviews.args.map(a => a.name);
    expect(args).toContain('shelterId');
  });

  it('should have createReview mutation with correct args', () => {
    const schema = require('../server/schema/schema').default;
    const mutationFields = schema._mutationType.getFields();

    expect(mutationFields.createReview).toBeDefined();
    const args = mutationFields.createReview.args.map(a => a.name);
    expect(args).toContain('userId');
    expect(args).toContain('shelterId');
    expect(args).toContain('rating');
    expect(args).toContain('comment');
  });

  it('should have medicalRecords field on AnimalType', () => {
    const AnimalType = require('../server/schema/types/animal_type').default;
    const fields = AnimalType.getFields();

    expect(fields.medicalRecords).toBeDefined();
  });

  it('should have MedicalRecordType with correct fields', () => {
    const MedicalRecordType = require('../server/schema/types/medical_record_type').default;
    const fields = MedicalRecordType.getFields();

    expect(fields._id).toBeDefined();
    expect(fields.date).toBeDefined();
    expect(fields.recordType).toBeDefined();
    expect(fields.description).toBeDefined();
    expect(fields.veterinarian).toBeDefined();
  });

  it('should have addMedicalRecord mutation with correct args', () => {
    const schema = require('../server/schema/schema').default;
    const mutationFields = schema._mutationType.getFields();

    expect(mutationFields.addMedicalRecord).toBeDefined();
    const args = mutationFields.addMedicalRecord.args.map(a => a.name);
    expect(args).toContain('animalId');
    expect(args).toContain('date');
    expect(args).toContain('recordType');
    expect(args).toContain('description');
    expect(args).toContain('veterinarian');
  });

  it('should have updateUser mutation with name and email args', () => {
    const schema = require('../server/schema/schema').default;
    const mutationFields = schema._mutationType.getFields();

    expect(mutationFields.updateUser).toBeDefined();
    const args = mutationFields.updateUser.args.map(a => a.name);
    expect(args).toContain('_id');
    expect(args).toContain('name');
    expect(args).toContain('email');
  });

  it('should have contact fields on ShelterType', () => {
    const ShelterType = require('../server/schema/types/shelter_type').default;
    const fields = ShelterType.getFields();

    expect(fields.phone).toBeDefined();
    expect(fields.email).toBeDefined();
    expect(fields.website).toBeDefined();
    expect(fields.hours).toBeDefined();
    expect(fields.description).toBeDefined();
  });

  it('should have contact args on editShelter mutation', () => {
    const schema = require('../server/schema/schema').default;
    const mutationFields = schema._mutationType.getFields();

    const editArgs = mutationFields.editShelter.args.map(a => a.name);
    expect(editArgs).toContain('phone');
    expect(editArgs).toContain('email');
    expect(editArgs).toContain('website');
    expect(editArgs).toContain('hours');
    expect(editArgs).toContain('description');
  });

  it('should have contact args on newShelter mutation', () => {
    const schema = require('../server/schema/schema').default;
    const mutationFields = schema._mutationType.getFields();

    const newArgs = mutationFields.newShelter.args.map(a => a.name);
    expect(newArgs).toContain('phone');
    expect(newArgs).toContain('email');
    expect(newArgs).toContain('website');
    expect(newArgs).toContain('hours');
    expect(newArgs).toContain('description');
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

  it('should have shelterStaff query with shelterId arg', () => {
    const RootQueryType = require('../server/schema/types/root_query_type').default;
    const fields = RootQueryType.getFields();
    expect(fields.shelterStaff).toBeDefined();
    expect(fields.shelterStaff.args).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'shelterId' })
      ])
    );
  });

  it('should have addShelterStaff mutation with shelterId and email args', () => {
    const mutation = require('../server/schema/mutations').default;
    const fields = mutation.getFields();
    expect(fields.addShelterStaff).toBeDefined();
    const argNames = fields.addShelterStaff.args.map(a => a.name);
    expect(argNames).toContain('shelterId');
    expect(argNames).toContain('email');
  });

  it('should have removeShelterStaff mutation with shelterId and userId args', () => {
    const mutation = require('../server/schema/mutations').default;
    const fields = mutation.getFields();
    expect(fields.removeShelterStaff).toBeDefined();
    const argNames = fields.removeShelterStaff.args.map(a => a.name);
    expect(argNames).toContain('shelterId');
    expect(argNames).toContain('userId');
  });

  it('should return ShelterType from addShelterStaff mutation', () => {
    const mutation = require('../server/schema/mutations').default;
    const ShelterType = require('../server/schema/types/shelter_type').default;
    const fields = mutation.getFields();
    expect(fields.addShelterStaff.type).toBe(ShelterType);
  });

  it('should return ShelterType from removeShelterStaff mutation', () => {
    const mutation = require('../server/schema/mutations').default;
    const ShelterType = require('../server/schema/types/shelter_type').default;
    const fields = mutation.getFields();
    expect(fields.removeShelterStaff.type).toBe(ShelterType);
  });

  it('should have bulkCreateAnimals mutation with animals and shelterId args', () => {
    const mutation = require('../server/schema/mutations').default;
    const fields = mutation.getFields();
    expect(fields.bulkCreateAnimals).toBeDefined();
    const argNames = fields.bulkCreateAnimals.args.map(a => a.name);
    expect(argNames).toContain('animals');
    expect(argNames).toContain('shelterId');
  });

  it('should return list of AnimalType from bulkCreateAnimals', () => {
    const mutation = require('../server/schema/mutations').default;
    const { GraphQLList } = require('graphql');
    const fields = mutation.getFields();
    expect(fields.bulkCreateAnimals.type).toBeInstanceOf(GraphQLList);
  });

  it('should have AnimalInput type with required fields', () => {
    const mutation = require('../server/schema/mutations').default;
    const fields = mutation.getFields();
    const animalsArg = fields.bulkCreateAnimals.args.find(a => a.name === 'animals');
    expect(animalsArg).toBeDefined();
  });

  it('should have EventType with correct fields', () => {
    const EventType = require('../server/schema/types/event_type').default;
    const fields = EventType.getFields();
    expect(fields._id).toBeDefined();
    expect(fields.shelterId).toBeDefined();
    expect(fields.title).toBeDefined();
    expect(fields.description).toBeDefined();
    expect(fields.date).toBeDefined();
    expect(fields.endDate).toBeDefined();
    expect(fields.location).toBeDefined();
    expect(fields.eventType).toBeDefined();
  });

  it('should have shelterEvents query with shelterId arg', () => {
    const RootQueryType = require('../server/schema/types/root_query_type').default;
    const fields = RootQueryType.getFields();
    expect(fields.shelterEvents).toBeDefined();
    expect(fields.shelterEvents.args).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'shelterId' })
      ])
    );
  });

  it('should have createEvent mutation with correct args', () => {
    const mutation = require('../server/schema/mutations').default;
    const fields = mutation.getFields();
    expect(fields.createEvent).toBeDefined();
    const argNames = fields.createEvent.args.map(a => a.name);
    expect(argNames).toContain('shelterId');
    expect(argNames).toContain('title');
    expect(argNames).toContain('date');
    expect(argNames).toContain('eventType');
    expect(argNames).toContain('location');
    expect(argNames).toContain('description');
  });

  it('should have deleteEvent mutation with _id arg', () => {
    const mutation = require('../server/schema/mutations').default;
    const fields = mutation.getFields();
    expect(fields.deleteEvent).toBeDefined();
    const argNames = fields.deleteEvent.args.map(a => a.name);
    expect(argNames).toContain('_id');
  });

  it('should have DonationType with correct fields', () => {
    const DonationType = require('../server/schema/types/donation_type').default;
    const fields = DonationType.getFields();
    expect(fields._id).toBeDefined();
    expect(fields.shelterId).toBeDefined();
    expect(fields.donorName).toBeDefined();
    expect(fields.amount).toBeDefined();
    expect(fields.message).toBeDefined();
    expect(fields.createdAt).toBeDefined();
  });

  it('should have shelterDonations query with shelterId arg', () => {
    const RootQueryType = require('../server/schema/types/root_query_type').default;
    const fields = RootQueryType.getFields();
    expect(fields.shelterDonations).toBeDefined();
    expect(fields.shelterDonations.args).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'shelterId' })
      ])
    );
  });

  it('should have createDonation mutation with correct args', () => {
    const mutation = require('../server/schema/mutations').default;
    const fields = mutation.getFields();
    expect(fields.createDonation).toBeDefined();
    const argNames = fields.createDonation.args.map(a => a.name);
    expect(argNames).toContain('shelterId');
    expect(argNames).toContain('donorName');
    expect(argNames).toContain('amount');
    expect(argNames).toContain('message');
  });

  it('should return DonationType from createDonation mutation', () => {
    const mutation = require('../server/schema/mutations').default;
    const DonationType = require('../server/schema/types/donation_type').default;
    const fields = mutation.getFields();
    expect(fields.createDonation.type).toBe(DonationType);
  });

  it('should have PlatformStatsType with all stat fields', () => {
    const PlatformStatsType = require('../server/schema/types/platform_stats_type').default;
    const fields = PlatformStatsType.getFields();
    expect(fields.totalUsers).toBeDefined();
    expect(fields.totalShelters).toBeDefined();
    expect(fields.totalAnimals).toBeDefined();
    expect(fields.totalApplications).toBeDefined();
    expect(fields.availableAnimals).toBeDefined();
    expect(fields.adoptedAnimals).toBeDefined();
    expect(fields.totalDonations).toBeDefined();
  });

  it('should have platformStats query', () => {
    const RootQueryType = require('../server/schema/types/root_query_type').default;
    const fields = RootQueryType.getFields();
    expect(fields.platformStats).toBeDefined();
  });

  it('should return PlatformStatsType from platformStats query', () => {
    const RootQueryType = require('../server/schema/types/root_query_type').default;
    const PlatformStatsType = require('../server/schema/types/platform_stats_type').default;
    const fields = RootQueryType.getFields();
    expect(fields.platformStats.type).toBe(PlatformStatsType);
  });

  it('should have FosterType with all foster fields', () => {
    const FosterType = require('../server/schema/types/foster_type').default;
    const fields = FosterType.getFields();
    expect(fields._id).toBeDefined();
    expect(fields.shelterId).toBeDefined();
    expect(fields.animalId).toBeDefined();
    expect(fields.userId).toBeDefined();
    expect(fields.fosterName).toBeDefined();
    expect(fields.fosterEmail).toBeDefined();
    expect(fields.startDate).toBeDefined();
    expect(fields.endDate).toBeDefined();
    expect(fields.status).toBeDefined();
    expect(fields.notes).toBeDefined();
    expect(fields.createdAt).toBeDefined();
  });

  it('should have shelterFosters query', () => {
    const RootQueryType = require('../server/schema/types/root_query_type').default;
    const fields = RootQueryType.getFields();
    expect(fields.shelterFosters).toBeDefined();
  });

  it('should have createFoster mutation', () => {
    const mutation = require('../server/schema/mutations').default;
    const fields = mutation.getFields();
    expect(fields.createFoster).toBeDefined();
    expect(fields.createFoster.args).toBeDefined();
  });

  it('should have updateFosterStatus mutation', () => {
    const mutation = require('../server/schema/mutations').default;
    const fields = mutation.getFields();
    expect(fields.updateFosterStatus).toBeDefined();
    expect(fields.updateFosterStatus.args).toBeDefined();
  });

  it('should return FosterType from createFoster mutation', () => {
    const mutation = require('../server/schema/mutations').default;
    const FosterType = require('../server/schema/types/foster_type').default;
    const fields = mutation.getFields();
    expect(fields.createFoster.type).toBe(FosterType);
  });

  it('should have SavedSearchType with correct fields', () => {
    const SavedSearchType = require('../server/schema/types/saved_search_type').default;
    const fields = SavedSearchType.getFields();
    expect(fields._id).toBeDefined();
    expect(fields.userId).toBeDefined();
    expect(fields.name).toBeDefined();
    expect(fields.filters).toBeDefined();
    expect(fields.createdAt).toBeDefined();
  });

  it('should have userSavedSearches query', () => {
    const RootQueryType = require('../server/schema/types/root_query_type').default;
    const fields = RootQueryType.getFields();
    expect(fields.userSavedSearches).toBeDefined();
  });

  it('should have createSavedSearch mutation', () => {
    const mutation = require('../server/schema/mutations').default;
    const fields = mutation.getFields();
    expect(fields.createSavedSearch).toBeDefined();
    expect(fields.createSavedSearch.args).toBeDefined();
  });

  it('should have deleteSavedSearch mutation', () => {
    const mutation = require('../server/schema/mutations').default;
    const fields = mutation.getFields();
    expect(fields.deleteSavedSearch).toBeDefined();
  });

  it('should return SavedSearchType from createSavedSearch mutation', () => {
    const mutation = require('../server/schema/mutations').default;
    const SavedSearchType = require('../server/schema/types/saved_search_type').default;
    const fields = mutation.getFields();
    expect(fields.createSavedSearch.type).toBe(SavedSearchType);
  });

  it('should have ApplicationTemplateType with correct fields', () => {
    const ApplicationTemplateType = require('../server/schema/types/application_template_type').default;
    const fields = ApplicationTemplateType.getFields();
    expect(fields._id).toBeDefined();
    expect(fields.shelterId).toBeDefined();
    expect(fields.name).toBeDefined();
    expect(fields.fields).toBeDefined();
    expect(fields.createdAt).toBeDefined();
  });

  it('should have shelterApplicationTemplates query', () => {
    const RootQueryType = require('../server/schema/types/root_query_type').default;
    const fields = RootQueryType.getFields();
    expect(fields.shelterApplicationTemplates).toBeDefined();
  });

  it('should have createApplicationTemplate mutation', () => {
    const mutation = require('../server/schema/mutations').default;
    const fields = mutation.getFields();
    expect(fields.createApplicationTemplate).toBeDefined();
  });

  it('should have deleteApplicationTemplate mutation', () => {
    const mutation = require('../server/schema/mutations').default;
    const fields = mutation.getFields();
    expect(fields.deleteApplicationTemplate).toBeDefined();
  });

  it('should return ApplicationTemplateType from createApplicationTemplate mutation', () => {
    const mutation = require('../server/schema/mutations').default;
    const ApplicationTemplateType = require('../server/schema/types/application_template_type').default;
    const fields = mutation.getFields();
    expect(fields.createApplicationTemplate.type).toBe(ApplicationTemplateType);
  });

  it('should have verified and verifiedAt fields on ShelterType', () => {
    const ShelterType = require('../server/schema/types/shelter_type').default;
    const fields = ShelterType.getFields();
    expect(fields.verified).toBeDefined();
    expect(fields.verifiedAt).toBeDefined();
  });

  it('should have verifyShelter mutation', () => {
    const mutation = require('../server/schema/mutations').default;
    const fields = mutation.getFields();
    expect(fields.verifyShelter).toBeDefined();
    expect(fields.verifyShelter.args).toBeDefined();
  });

  it('should return ShelterType from verifyShelter mutation', () => {
    const mutation = require('../server/schema/mutations').default;
    const ShelterType = require('../server/schema/types/shelter_type').default;
    const fields = mutation.getFields();
    expect(fields.verifyShelter.type).toBe(ShelterType);
  });
});
