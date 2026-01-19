import '@testing-library/jest-dom';

// Mock localStorage for tests with working storage
const createLocalStorageMock = () => {
  let store = {};
  return {
    getItem: vi.fn((key) => store[key] || null),
    setItem: vi.fn((key, value) => {
      store[key] = String(value);
    }),
    removeItem: vi.fn((key) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: vi.fn((i) => Object.keys(store)[i] || null),
  };
};

global.localStorage = createLocalStorageMock();

// Reset mocks and storage before each test
beforeEach(() => {
  vi.clearAllMocks();
  global.localStorage.clear();
  global.localStorage = createLocalStorageMock();
});
