// ── Test Factories ───────────────────────────────────────────
// Centralized test data generators for consistent, realistic mock data

let idCounter = 1;

function generateId() {
  return `${Date.now().toString(36)}${(idCounter++).toString(36)}`;
}

// ── Animal Factory ────────────────────────────────────────────

const ANIMAL_DEFAULTS = {
  name: 'Buddy',
  type: 'dog',
  breed: 'Labrador Retriever',
  age: 3,
  sex: 'male',
  color: 'Golden',
  status: 'available',
  description: 'A friendly and playful dog looking for a forever home.',
  image: 'https://example.com/animals/buddy.jpg',
  video: '',
  size: 'medium',
  temperament: 'friendly',
  energyLevel: 'moderate',
  houseTrained: true,
  goodWithKids: true,
  goodWithDogs: true,
  goodWithCats: false,
  specialNeeds: '',
  microchipId: '',
  adoptionFee: 150,
};

export function createAnimal(overrides = {}) {
  return { _id: generateId(), ...ANIMAL_DEFAULTS, ...overrides };
}

export function createAnimalList(count = 5, overrides = {}) {
  const types = ['dog', 'cat', 'rabbit', 'bird'];
  const names = ['Buddy', 'Luna', 'Max', 'Bella', 'Charlie', 'Lucy', 'Cooper', 'Daisy', 'Rocky', 'Molly'];
  return Array.from({ length: count }, (_, i) => createAnimal({
    name: names[i % names.length],
    type: types[i % types.length],
    age: (i % 12) + 1,
    ...overrides,
  }));
}

// ── User Factory ──────────────────────────────────────────────

const USER_DEFAULTS = {
  name: 'Test User',
  email: 'test@example.com',
  role: 'user',
  date: new Date().toISOString(),
  favorites: [],
  image: '',
};

export function createUser(overrides = {}) {
  return { _id: generateId(), ...USER_DEFAULTS, ...overrides };
}

export function createAdmin(overrides = {}) {
  return createUser({ role: 'admin', name: 'Admin User', email: 'admin@example.com', ...overrides });
}

export function createShelterStaff(overrides = {}) {
  return createUser({ role: 'shelter_staff', name: 'Staff User', email: 'staff@example.com', ...overrides });
}

// ── Shelter Factory ───────────────────────────────────────────

const SHELTER_DEFAULTS = {
  name: 'Happy Paws Shelter',
  address: '123 Main St, Springfield, IL 62701',
  phone: '555-0100',
  email: 'info@happypaws.org',
  website: 'https://happypaws.org',
  description: 'A no-kill shelter dedicated to finding forever homes.',
  animals: [],
  maxCapacity: 100,
  location: 'Springfield, IL',
  coordinates: { type: 'Point', coordinates: [-89.6501, 39.7817] },
};

export function createShelter(overrides = {}) {
  return { _id: generateId(), ...SHELTER_DEFAULTS, ...overrides };
}

// ── Application Factory ───────────────────────────────────────

const APPLICATION_DEFAULTS = {
  userId: 'user1',
  animalId: 'animal1',
  shelterId: 'shelter1',
  status: 'submitted',
  isDraft: false,
  submittedAt: new Date().toISOString(),
  reviewedAt: null,
  answers: {},
};

export function createApplication(overrides = {}) {
  return { _id: generateId(), ...APPLICATION_DEFAULTS, ...overrides };
}

export function createDraftApplication(overrides = {}) {
  return createApplication({ status: 'draft', isDraft: true, submittedAt: null, ...overrides });
}

// ── Event Factory ─────────────────────────────────────────────

const EVENT_DEFAULTS = {
  title: 'Adoption Day',
  description: 'Come meet our available pets!',
  shelterId: 'shelter1',
  date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  location: 'Happy Paws Shelter',
  maxAttendees: 50,
  attendeeCount: 0,
};

export function createEvent(overrides = {}) {
  return { _id: generateId(), ...EVENT_DEFAULTS, ...overrides };
}

// ── Donation Factory ──────────────────────────────────────────

const DONATION_DEFAULTS = {
  userId: 'user1',
  shelterId: 'shelter1',
  amount: 5000,
  currency: 'usd',
  status: 'completed',
  recurring: false,
  createdAt: new Date().toISOString(),
};

export function createDonation(overrides = {}) {
  return { _id: generateId(), ...DONATION_DEFAULTS, ...overrides };
}

// ── Success Story Factory ─────────────────────────────────────

export function createSuccessStory(overrides = {}) {
  return {
    _id: generateId(),
    title: 'Buddy Found His Forever Home',
    body: 'After 3 months at the shelter, Buddy was adopted by the Smith family.',
    animalId: 'animal1',
    userId: 'user1',
    shelterId: 'shelter1',
    image: 'https://example.com/stories/buddy.jpg',
    approved: true,
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

// ── Message Factory ───────────────────────────────────────────

export function createMessage(overrides = {}) {
  return {
    _id: generateId(),
    senderId: 'user1',
    receiverId: 'user2',
    content: 'Hello! I am interested in adopting Buddy.',
    read: false,
    archived: false,
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

// ── Notification Factory ──────────────────────────────────────

export function createNotification(overrides = {}) {
  return {
    _id: generateId(),
    userId: 'user1',
    type: 'application_update',
    title: 'Application Status Updated',
    message: 'Your application for Buddy has been reviewed.',
    read: false,
    link: '/applications/app1',
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

// ── GraphQL Context Factory ───────────────────────────────────

export function createGraphQLContext(overrides = {}) {
  return {
    userId: 'user1',
    userRole: 'user',
    shelterId: null,
    sessionId: 'session1',
    ...overrides,
  };
}

export function createAdminContext(overrides = {}) {
  return createGraphQLContext({ userRole: 'admin', ...overrides });
}

export function createShelterContext(overrides = {}) {
  return createGraphQLContext({
    userRole: 'shelter_staff',
    shelterId: 'shelter1',
    ...overrides,
  });
}

// ── API Response Factories ────────────────────────────────────

export function createPaginatedResponse(data, overrides = {}) {
  return {
    data,
    pagination: {
      total: data.length,
      limit: 20,
      offset: 0,
      hasMore: false,
      ...overrides,
    },
  };
}

export function createErrorResponse(message = 'Something went wrong', status = 500) {
  return { error: message, status };
}

// ── Batch Factories ───────────────────────────────────────────

export function createBatchAnimals(count, shelterType = 'mixed') {
  const configs = {
    dogs: { type: 'dog', breeds: ['Labrador', 'German Shepherd', 'Golden Retriever', 'Bulldog', 'Poodle'] },
    cats: { type: 'cat', breeds: ['Persian', 'Siamese', 'Maine Coon', 'Ragdoll', 'Bengal'] },
    mixed: { type: null, breeds: ['Labrador', 'Persian', 'German Shepherd', 'Siamese', 'Rabbit'] },
  };
  const config = configs[shelterType] || configs.mixed;
  const types = config.type ? [config.type] : ['dog', 'cat', 'rabbit'];

  return Array.from({ length: count }, (_, i) => createAnimal({
    name: `Animal ${i + 1}`,
    type: types[i % types.length],
    breed: config.breeds[i % config.breeds.length],
    age: Math.floor(Math.random() * 15) + 1,
    sex: i % 2 === 0 ? 'male' : 'female',
    status: i < count * 0.8 ? 'available' : 'adopted',
  }));
}
