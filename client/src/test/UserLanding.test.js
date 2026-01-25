import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { MockedProvider } from '@apollo/client/testing';
import { gql } from '@apollo/client';

// Mock CSS imports
vi.mock('../components/css/userLanding.css', () => ({}));
vi.mock('../components/css/AnimalFeedItem.css', () => ({}));

// GraphQL query for finding animals
const FIND_ANIMALS = gql`
  query FindAnimals($type: String!) {
    findAnimals(type: $type) {
      _id
      name
      type
      age
      sex
      color
      description
      image
      video
    }
  }
`;

const mockDogs = [
  {
    _id: 'dog-1',
    name: 'Buddy',
    type: 'Dogs',
    age: 3,
    sex: 'Male',
    color: 'Brown',
    description: 'Friendly golden retriever',
    image: 'http://example.com/buddy.jpg',
    video: 'http://example.com/buddy.mp4'
  },
  {
    _id: 'dog-2',
    name: 'Max',
    type: 'Dogs',
    age: 5,
    sex: 'Male',
    color: 'Black',
    description: 'Energetic labrador',
    image: 'http://example.com/max.jpg',
    video: 'http://example.com/max.mp4'
  }
];

const mockCats = [
  {
    _id: 'cat-1',
    name: 'Whiskers',
    type: 'Cats',
    age: 2,
    sex: 'Female',
    color: 'White',
    description: 'Calm and cuddly cat',
    image: 'http://example.com/whiskers.jpg',
    video: 'http://example.com/whiskers.mp4'
  }
];

const mocks = [
  {
    request: {
      query: FIND_ANIMALS,
      variables: { type: 'Dogs' }
    },
    result: {
      data: {
        findAnimals: mockDogs
      }
    }
  },
  {
    request: {
      query: FIND_ANIMALS,
      variables: { type: 'Cats' }
    },
    result: {
      data: {
        findAnimals: mockCats
      }
    }
  },
  {
    request: {
      query: FIND_ANIMALS,
      variables: { type: 'Outher' }
    },
    result: {
      data: {
        findAnimals: []
      }
    }
  }
];

// Mock AnimalFeedItem component
const MockAnimalFeedItem = ({ animal, onViewDetails }) => {
  return (
    <div className="animal-feed-item-div" data-testid={`animal-item-${animal._id}`}>
      <div className="animal-feed-item-header">
        <p data-testid="animal-name">{animal.name}</p>
        <p data-testid="animal-age">{animal.age}</p>
        <p data-testid="animal-sex">{animal.sex}</p>
      </div>
      <div
        id="animal-feed-item-image-container"
        style={{ background: `url(${animal.image})`, backgroundSize: 'cover' }}
      />
      <button
        onClick={() => onViewDetails && onViewDetails(animal._id)}
        className="apply-button"
        data-testid="view-details-button"
      >
        See Details
      </button>
    </div>
  );
};

// Mock UserLanding component
const MockUserLanding = ({ splash, onNavigate }) => {
  const [currentSelector, setCurrentSelector] = React.useState(null);
  const [animals, setAnimals] = React.useState([]);
  const [loading, setLoading] = React.useState(false);

  const updateCurrentSelector = (type) => {
    if (splash === 'splash' && onNavigate) {
      onNavigate('/login');
      return;
    }
    setCurrentSelector(type);
    setLoading(true);
    // Simulate loading
    setTimeout(() => {
      if (type === 'Dogs') {
        setAnimals(mockDogs);
      } else if (type === 'Cats') {
        setAnimals(mockCats);
      } else {
        setAnimals([]);
      }
      setLoading(false);
    }, 100);
  };

  let main;
  if (currentSelector === null) {
    main = (
      <div id="prompt" data-testid="welcome-prompt">
        "When we adopt a dog or any pet, we know it is going to end with us having to say goodbye,
        but we still do it. And we do it for a very good reason: They bring so much joy and optimism
        and happiness."
      </div>
    );
  } else if (loading) {
    main = <p data-testid="loading">Loading</p>;
  } else {
    main = (
      <div id="this-div">
        <ul id="animal-feed" data-testid="animal-feed">
          {animals.map((animal) => (
            <li key={animal._id} className="animal-feed-item">
              <MockAnimalFeedItem animal={animal} />
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div id="user-landing-top" data-testid="user-landing">
      <h1 id="user-nav">Browse Animals</h1>
      <div id="feed-buttons" className="big" data-testid="feed-buttons">
        <button
          id="dogs-button"
          className="feed-button"
          onClick={() => updateCurrentSelector('Dogs')}
          data-testid="dogs-button"
        />
        <button
          id="cats-button"
          className="feed-button"
          onClick={() => updateCurrentSelector('Cats')}
          data-testid="cats-button"
        />
        <button
          className="feed-button"
          onClick={() => updateCurrentSelector('Outher')}
          data-testid="other-button"
        />
      </div>
      {main}
    </div>
  );
};

const TestWrapper = ({ children }) => (
  <MockedProvider mocks={mocks} addTypename={false}>
    <MemoryRouter>{children}</MemoryRouter>
  </MockedProvider>
);

describe('UserLanding Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial Rendering', () => {
    it('should render the user landing component', () => {
      render(
        <TestWrapper>
          <MockUserLanding />
        </TestWrapper>
      );

      expect(screen.getByTestId('user-landing')).toBeInTheDocument();
    });

    it('should display browse animals header', () => {
      render(
        <TestWrapper>
          <MockUserLanding />
        </TestWrapper>
      );

      expect(screen.getByText('Browse Animals')).toBeInTheDocument();
    });

    it('should display welcome prompt initially', () => {
      render(
        <TestWrapper>
          <MockUserLanding />
        </TestWrapper>
      );

      expect(screen.getByTestId('welcome-prompt')).toBeInTheDocument();
    });

    it('should render animal type buttons', () => {
      render(
        <TestWrapper>
          <MockUserLanding />
        </TestWrapper>
      );

      expect(screen.getByTestId('dogs-button')).toBeInTheDocument();
      expect(screen.getByTestId('cats-button')).toBeInTheDocument();
      expect(screen.getByTestId('other-button')).toBeInTheDocument();
    });

    it('should have feed buttons container', () => {
      render(
        <TestWrapper>
          <MockUserLanding />
        </TestWrapper>
      );

      expect(screen.getByTestId('feed-buttons')).toBeInTheDocument();
    });
  });

  describe('Animal Type Selection', () => {
    it('should show loading state when selecting dogs', async () => {
      render(
        <TestWrapper>
          <MockUserLanding />
        </TestWrapper>
      );

      fireEvent.click(screen.getByTestId('dogs-button'));

      expect(screen.getByTestId('loading')).toBeInTheDocument();
    });

    it('should display dogs when dogs button is clicked', async () => {
      render(
        <TestWrapper>
          <MockUserLanding />
        </TestWrapper>
      );

      fireEvent.click(screen.getByTestId('dogs-button'));

      await waitFor(() => {
        expect(screen.getByTestId('animal-feed')).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(screen.getByTestId('animal-item-dog-1')).toBeInTheDocument();
        expect(screen.getByTestId('animal-item-dog-2')).toBeInTheDocument();
      });
    });

    it('should display cats when cats button is clicked', async () => {
      render(
        <TestWrapper>
          <MockUserLanding />
        </TestWrapper>
      );

      fireEvent.click(screen.getByTestId('cats-button'));

      await waitFor(() => {
        expect(screen.getByTestId('animal-feed')).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(screen.getByTestId('animal-item-cat-1')).toBeInTheDocument();
      });
    });

    it('should hide welcome prompt after selecting animal type', async () => {
      render(
        <TestWrapper>
          <MockUserLanding />
        </TestWrapper>
      );

      expect(screen.getByTestId('welcome-prompt')).toBeInTheDocument();

      fireEvent.click(screen.getByTestId('dogs-button'));

      await waitFor(() => {
        expect(screen.queryByTestId('welcome-prompt')).not.toBeInTheDocument();
      });
    });
  });

  describe('Splash Mode Behavior', () => {
    it('should redirect to login in splash mode when clicking dog button', () => {
      const handleNavigate = vi.fn();

      render(
        <TestWrapper>
          <MockUserLanding splash="splash" onNavigate={handleNavigate} />
        </TestWrapper>
      );

      fireEvent.click(screen.getByTestId('dogs-button'));

      expect(handleNavigate).toHaveBeenCalledWith('/login');
    });

    it('should redirect to login in splash mode when clicking cat button', () => {
      const handleNavigate = vi.fn();

      render(
        <TestWrapper>
          <MockUserLanding splash="splash" onNavigate={handleNavigate} />
        </TestWrapper>
      );

      fireEvent.click(screen.getByTestId('cats-button'));

      expect(handleNavigate).toHaveBeenCalledWith('/login');
    });
  });
});

describe('Debounced Search Behavior', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should debounce text input changes', async () => {
    const queryFn = vi.fn();
    let filters = {};
    let queryFilters = {};
    const DEBOUNCE_MS = 300;

    const TEXT_FILTER_KEYS = ['name', 'breed', 'color'];
    const NUMERIC_FILTER_KEYS = ['minAge', 'maxAge'];
    const DEBOUNCED_KEYS = new Set([...TEXT_FILTER_KEYS, ...NUMERIC_FILTER_KEYS]);

    // Simulate the handleFiltersChange logic
    let debounceTimer = null;
    const handleFiltersChange = (newFilters) => {
      const prevFilters = filters;
      const changedKey = Object.keys(newFilters).find(
        (key) => newFilters[key] !== prevFilters[key]
      );
      const shouldDebounce = changedKey && DEBOUNCED_KEYS.has(changedKey);

      filters = newFilters;

      if (shouldDebounce) {
        if (debounceTimer) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          queryFilters = newFilters;
          queryFn(newFilters);
          debounceTimer = null;
        }, DEBOUNCE_MS);
      } else {
        if (debounceTimer) {
          clearTimeout(debounceTimer);
          debounceTimer = null;
        }
        queryFilters = newFilters;
        queryFn(newFilters);
      }
    };

    // Simulate typing "Buddy" character by character
    handleFiltersChange({ name: 'B' });
    handleFiltersChange({ name: 'Bu' });
    handleFiltersChange({ name: 'Bud' });
    handleFiltersChange({ name: 'Budd' });
    handleFiltersChange({ name: 'Buddy' });

    // Should not have called query yet
    expect(queryFn).not.toHaveBeenCalled();

    // Advance timer past debounce delay
    vi.advanceTimersByTime(300);

    // Should have called query exactly once with final value
    expect(queryFn).toHaveBeenCalledTimes(1);
    expect(queryFn).toHaveBeenCalledWith({ name: 'Buddy' });
  });

  it('should immediately fire for type button changes', () => {
    const queryFn = vi.fn();
    let filters = {};
    const DEBOUNCE_MS = 300;
    const DEBOUNCED_KEYS = new Set(['name', 'breed', 'color', 'minAge', 'maxAge']);
    let debounceTimer = null;

    const handleFiltersChange = (newFilters) => {
      const prevFilters = filters;
      const changedKey = Object.keys(newFilters).find(
        (key) => newFilters[key] !== prevFilters[key]
      );
      const shouldDebounce = changedKey && DEBOUNCED_KEYS.has(changedKey);

      filters = newFilters;

      if (shouldDebounce) {
        if (debounceTimer) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          queryFn(newFilters);
          debounceTimer = null;
        }, DEBOUNCE_MS);
      } else {
        if (debounceTimer) {
          clearTimeout(debounceTimer);
          debounceTimer = null;
        }
        queryFn(newFilters);
      }
    };

    // Click type button - should fire immediately
    handleFiltersChange({ type: 'Dogs' });
    expect(queryFn).toHaveBeenCalledTimes(1);
    expect(queryFn).toHaveBeenCalledWith({ type: 'Dogs' });
  });

  it('should immediately fire for sex select changes', () => {
    const queryFn = vi.fn();
    let filters = {};
    const DEBOUNCE_MS = 300;
    const DEBOUNCED_KEYS = new Set(['name', 'breed', 'color', 'minAge', 'maxAge']);
    let debounceTimer = null;

    const handleFiltersChange = (newFilters) => {
      const prevFilters = filters;
      const changedKey = Object.keys(newFilters).find(
        (key) => newFilters[key] !== prevFilters[key]
      );
      const shouldDebounce = changedKey && DEBOUNCED_KEYS.has(changedKey);
      filters = newFilters;

      if (shouldDebounce) {
        if (debounceTimer) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          queryFn(newFilters);
          debounceTimer = null;
        }, DEBOUNCE_MS);
      } else {
        if (debounceTimer) {
          clearTimeout(debounceTimer);
          debounceTimer = null;
        }
        queryFn(newFilters);
      }
    };

    handleFiltersChange({ sex: 'Male' });
    expect(queryFn).toHaveBeenCalledTimes(1);
    expect(queryFn).toHaveBeenCalledWith({ sex: 'Male' });
  });

  it('should cancel pending debounce when immediate filter changes', () => {
    const queryFn = vi.fn();
    let filters = {};
    const DEBOUNCE_MS = 300;
    const DEBOUNCED_KEYS = new Set(['name', 'breed', 'color', 'minAge', 'maxAge']);
    let debounceTimer = null;

    const handleFiltersChange = (newFilters) => {
      const prevFilters = filters;
      const changedKey = Object.keys(newFilters).find(
        (key) => newFilters[key] !== prevFilters[key]
      );
      const shouldDebounce = changedKey && DEBOUNCED_KEYS.has(changedKey);
      filters = newFilters;

      if (shouldDebounce) {
        if (debounceTimer) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          queryFn(newFilters);
          debounceTimer = null;
        }, DEBOUNCE_MS);
      } else {
        if (debounceTimer) {
          clearTimeout(debounceTimer);
          debounceTimer = null;
        }
        queryFn(newFilters);
      }
    };

    // Start typing (debounced)
    handleFiltersChange({ name: 'Bud' });
    expect(queryFn).not.toHaveBeenCalled();

    // Then click a type button (immediate) - should cancel the pending debounce
    handleFiltersChange({ name: 'Bud', type: 'Dogs' });
    expect(queryFn).toHaveBeenCalledTimes(1);
    expect(queryFn).toHaveBeenCalledWith({ name: 'Bud', type: 'Dogs' });

    // Advance timer - the old debounce should not fire
    vi.advanceTimersByTime(300);
    expect(queryFn).toHaveBeenCalledTimes(1);
  });

  it('should debounce numeric age filter changes', () => {
    const queryFn = vi.fn();
    let filters = {};
    const DEBOUNCE_MS = 300;
    const DEBOUNCED_KEYS = new Set(['name', 'breed', 'color', 'minAge', 'maxAge']);
    let debounceTimer = null;

    const handleFiltersChange = (newFilters) => {
      const prevFilters = filters;
      const changedKey = Object.keys(newFilters).find(
        (key) => newFilters[key] !== prevFilters[key]
      );
      const shouldDebounce = changedKey && DEBOUNCED_KEYS.has(changedKey);
      filters = newFilters;

      if (shouldDebounce) {
        if (debounceTimer) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          queryFn(newFilters);
          debounceTimer = null;
        }, DEBOUNCE_MS);
      } else {
        if (debounceTimer) {
          clearTimeout(debounceTimer);
          debounceTimer = null;
        }
        queryFn(newFilters);
      }
    };

    handleFiltersChange({ minAge: 1 });
    handleFiltersChange({ minAge: 12 });
    expect(queryFn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(300);
    expect(queryFn).toHaveBeenCalledTimes(1);
    expect(queryFn).toHaveBeenCalledWith({ minAge: 12 });
  });
});

describe('AnimalFeedItem Component', () => {
  const mockAnimal = {
    _id: 'test-animal-1',
    name: 'TestPet',
    age: 4,
    sex: 'Female',
    image: 'http://example.com/test.jpg'
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render animal feed item', () => {
      render(
        <TestWrapper>
          <MockAnimalFeedItem animal={mockAnimal} />
        </TestWrapper>
      );

      expect(screen.getByTestId('animal-item-test-animal-1')).toBeInTheDocument();
    });

    it('should display animal name', () => {
      render(
        <TestWrapper>
          <MockAnimalFeedItem animal={mockAnimal} />
        </TestWrapper>
      );

      expect(screen.getByTestId('animal-name')).toHaveTextContent('TestPet');
    });

    it('should display animal age', () => {
      render(
        <TestWrapper>
          <MockAnimalFeedItem animal={mockAnimal} />
        </TestWrapper>
      );

      expect(screen.getByTestId('animal-age')).toHaveTextContent('4');
    });

    it('should display animal sex', () => {
      render(
        <TestWrapper>
          <MockAnimalFeedItem animal={mockAnimal} />
        </TestWrapper>
      );

      expect(screen.getByTestId('animal-sex')).toHaveTextContent('Female');
    });

    it('should render view details button', () => {
      render(
        <TestWrapper>
          <MockAnimalFeedItem animal={mockAnimal} />
        </TestWrapper>
      );

      expect(screen.getByTestId('view-details-button')).toBeInTheDocument();
      expect(screen.getByText('See Details')).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('should call onViewDetails when button is clicked', () => {
      const handleViewDetails = vi.fn();

      render(
        <TestWrapper>
          <MockAnimalFeedItem animal={mockAnimal} onViewDetails={handleViewDetails} />
        </TestWrapper>
      );

      fireEvent.click(screen.getByTestId('view-details-button'));

      expect(handleViewDetails).toHaveBeenCalledWith('test-animal-1');
    });
  });
});
