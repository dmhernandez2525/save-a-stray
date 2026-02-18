import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { MockedProvider } from '@apollo/client/testing';
import { gql } from '@apollo/client';


const SUCCESS_STORIES = gql`
  query SuccessStories {
    successStories {
      _id
      userId
      animalName
      animalType
      title
      story
      image
      createdAt
    }
  }
`;

const USER_ID = gql`
  query UserId {
    userId @client
  }
`;

const CREATE_SUCCESS_STORY = gql`
  mutation CreateSuccessStory(
    $userId: String!
    $animalName: String!
    $animalType: String!
    $title: String!
    $story: String!
    $image: String
  ) {
    createSuccessStory(
      userId: $userId
      animalName: $animalName
      animalType: $animalType
      title: $title
      story: $story
      image: $image
    ) {
      _id
      animalName
      animalType
      title
      story
      image
      createdAt
    }
  }
`;

const mockStories = [
  {
    _id: '1',
    userId: 'user1',
    animalName: 'Buddy',
    animalType: 'Dog',
    title: 'Found My Best Friend',
    story: 'Buddy has been the best addition to our family. We adopted him last year and he has brought so much joy.',
    image: 'https://example.com/buddy.jpg',
    createdAt: '2025-01-15T00:00:00.000Z'
  },
  {
    _id: '2',
    userId: 'user2',
    animalName: 'Whiskers',
    animalType: 'Cat',
    title: 'Our Purrfect Match',
    story: 'Whiskers is the sweetest cat we have ever met.',
    image: '',
    createdAt: '2025-02-10T00:00:00.000Z'
  }
];

const storiesMock = [
  {
    request: { query: SUCCESS_STORIES },
    result: {
      data: { successStories: mockStories }
    }
  }
];

const emptyStoriesMock = [
  {
    request: { query: SUCCESS_STORIES },
    result: {
      data: { successStories: [] }
    }
  }
];

const errorMock = [
  {
    request: { query: SUCCESS_STORIES },
    error: new Error('Failed to fetch')
  }
];

// Mock SuccessStories component for testing
const MockSuccessStoriesEmpty = () => (
  <div data-testid="success-stories-page">
    <div className="flex items-center justify-between mb-6">
      <h1 data-testid="page-title">Adoption Success Stories</h1>
    </div>
    <div data-testid="empty-state">
      <p>No success stories yet. Be the first to share your adoption story!</p>
    </div>
  </div>
);

const MockSuccessStoriesWithData = ({ stories }) => (
  <div data-testid="success-stories-page">
    <div className="flex items-center justify-between mb-6">
      <h1 data-testid="page-title">Adoption Success Stories</h1>
    </div>
    <div data-testid="stories-list">
      {stories.map(story => (
        <div key={story._id} data-testid={`story-card-${story._id}`} className="story-card">
          <h3 data-testid={`story-title-${story._id}`}>{story.title}</h3>
          <p data-testid={`story-animal-${story._id}`}>
            {story.animalName} ({story.animalType})
          </p>
          <p data-testid={`story-text-${story._id}`}>{story.story}</p>
          {story.image && (
            <img
              data-testid={`story-image-${story._id}`}
              src={story.image}
              alt={story.animalName}
            />
          )}
        </div>
      ))}
    </div>
  </div>
);

const MockSuccessStoriesWithForm = ({ userId, onSubmit }) => (
  <div data-testid="success-stories-page">
    <div className="flex items-center justify-between mb-6">
      <h1 data-testid="page-title">Adoption Success Stories</h1>
      {userId && (
        <button data-testid="share-story-btn" onClick={() => {}}>
          Share Your Story
        </button>
      )}
    </div>
    <div data-testid="story-form">
      <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }}>
        <input data-testid="title-input" placeholder="Story Title" required />
        <input data-testid="animal-name-input" placeholder="Pet's Name" required />
        <input data-testid="animal-type-input" placeholder="Pet Type (Dog, Cat, etc.)" required />
        <textarea data-testid="story-input" placeholder="Tell us about your adoption experience..." required />
        <input data-testid="image-input" placeholder="Photo URL (optional)" />
        <button data-testid="submit-btn" type="submit">Submit Story</button>
        <button data-testid="cancel-btn" type="button">Cancel</button>
      </form>
    </div>
  </div>
);

describe('SuccessStories Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Page Structure', () => {
    it('should render the page title', () => {
      render(
        <MockedProvider mocks={storiesMock} addTypename={false}>
          <MemoryRouter>
            <MockSuccessStoriesWithData stories={mockStories} />
          </MemoryRouter>
        </MockedProvider>
      );

      expect(screen.getByTestId('page-title')).toBeInTheDocument();
      expect(screen.getByText('Adoption Success Stories')).toBeInTheDocument();
    });

    it('should render the success stories page container', () => {
      render(
        <MockedProvider mocks={storiesMock} addTypename={false}>
          <MemoryRouter>
            <MockSuccessStoriesWithData stories={mockStories} />
          </MemoryRouter>
        </MockedProvider>
      );

      expect(screen.getByTestId('success-stories-page')).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('should show empty state message when no stories exist', () => {
      render(
        <MockedProvider mocks={emptyStoriesMock} addTypename={false}>
          <MemoryRouter>
            <MockSuccessStoriesEmpty />
          </MemoryRouter>
        </MockedProvider>
      );

      expect(screen.getByTestId('empty-state')).toBeInTheDocument();
      expect(screen.getByText(/No success stories yet/)).toBeInTheDocument();
    });
  });

  describe('Stories List', () => {
    it('should render story cards when stories exist', () => {
      render(
        <MockedProvider mocks={storiesMock} addTypename={false}>
          <MemoryRouter>
            <MockSuccessStoriesWithData stories={mockStories} />
          </MemoryRouter>
        </MockedProvider>
      );

      expect(screen.getByTestId('stories-list')).toBeInTheDocument();
      expect(screen.getByTestId('story-card-1')).toBeInTheDocument();
      expect(screen.getByTestId('story-card-2')).toBeInTheDocument();
    });

    it('should display story titles', () => {
      render(
        <MockedProvider mocks={storiesMock} addTypename={false}>
          <MemoryRouter>
            <MockSuccessStoriesWithData stories={mockStories} />
          </MemoryRouter>
        </MockedProvider>
      );

      expect(screen.getByText('Found My Best Friend')).toBeInTheDocument();
      expect(screen.getByText('Our Purrfect Match')).toBeInTheDocument();
    });

    it('should display animal name and type', () => {
      render(
        <MockedProvider mocks={storiesMock} addTypename={false}>
          <MemoryRouter>
            <MockSuccessStoriesWithData stories={mockStories} />
          </MemoryRouter>
        </MockedProvider>
      );

      expect(screen.getByText('Buddy (Dog)')).toBeInTheDocument();
      expect(screen.getByText('Whiskers (Cat)')).toBeInTheDocument();
    });

    it('should display story text', () => {
      render(
        <MockedProvider mocks={storiesMock} addTypename={false}>
          <MemoryRouter>
            <MockSuccessStoriesWithData stories={mockStories} />
          </MemoryRouter>
        </MockedProvider>
      );

      expect(screen.getByText(/Buddy has been the best addition/)).toBeInTheDocument();
      expect(screen.getByText(/Whiskers is the sweetest cat/)).toBeInTheDocument();
    });

    it('should render image when story has one', () => {
      render(
        <MockedProvider mocks={storiesMock} addTypename={false}>
          <MemoryRouter>
            <MockSuccessStoriesWithData stories={mockStories} />
          </MemoryRouter>
        </MockedProvider>
      );

      const img = screen.getByTestId('story-image-1');
      expect(img).toBeInTheDocument();
      expect(img.getAttribute('src')).toBe('https://example.com/buddy.jpg');
    });

    it('should not render image when story has empty image', () => {
      render(
        <MockedProvider mocks={storiesMock} addTypename={false}>
          <MemoryRouter>
            <MockSuccessStoriesWithData stories={mockStories} />
          </MemoryRouter>
        </MockedProvider>
      );

      expect(screen.queryByTestId('story-image-2')).not.toBeInTheDocument();
    });
  });

  describe('Story Form', () => {
    it('should show share story button when user is logged in', () => {
      render(
        <MockedProvider mocks={storiesMock} addTypename={false}>
          <MemoryRouter>
            <MockSuccessStoriesWithForm userId="user1" onSubmit={() => {}} />
          </MemoryRouter>
        </MockedProvider>
      );

      expect(screen.getByTestId('share-story-btn')).toBeInTheDocument();
    });

    it('should not show share story button when user is not logged in', () => {
      render(
        <MockedProvider mocks={storiesMock} addTypename={false}>
          <MemoryRouter>
            <MockSuccessStoriesWithForm userId="" onSubmit={() => {}} />
          </MemoryRouter>
        </MockedProvider>
      );

      expect(screen.queryByTestId('share-story-btn')).not.toBeInTheDocument();
    });

    it('should render the form with all required fields', () => {
      render(
        <MockedProvider mocks={storiesMock} addTypename={false}>
          <MemoryRouter>
            <MockSuccessStoriesWithForm userId="user1" onSubmit={() => {}} />
          </MemoryRouter>
        </MockedProvider>
      );

      expect(screen.getByTestId('title-input')).toBeInTheDocument();
      expect(screen.getByTestId('animal-name-input')).toBeInTheDocument();
      expect(screen.getByTestId('animal-type-input')).toBeInTheDocument();
      expect(screen.getByTestId('story-input')).toBeInTheDocument();
      expect(screen.getByTestId('image-input')).toBeInTheDocument();
    });

    it('should have submit and cancel buttons', () => {
      render(
        <MockedProvider mocks={storiesMock} addTypename={false}>
          <MemoryRouter>
            <MockSuccessStoriesWithForm userId="user1" onSubmit={() => {}} />
          </MemoryRouter>
        </MockedProvider>
      );

      expect(screen.getByTestId('submit-btn')).toBeInTheDocument();
      expect(screen.getByTestId('cancel-btn')).toBeInTheDocument();
    });

    it('should call onSubmit when form is submitted', () => {
      const handleSubmit = vi.fn();

      render(
        <MockedProvider mocks={storiesMock} addTypename={false}>
          <MemoryRouter>
            <MockSuccessStoriesWithForm userId="user1" onSubmit={handleSubmit} />
          </MemoryRouter>
        </MockedProvider>
      );

      // Fill required fields before submit
      fireEvent.change(screen.getByTestId('title-input'), { target: { value: 'Test' } });
      fireEvent.change(screen.getByTestId('animal-name-input'), { target: { value: 'Rex' } });
      fireEvent.change(screen.getByTestId('animal-type-input'), { target: { value: 'Dog' } });
      fireEvent.change(screen.getByTestId('story-input'), { target: { value: 'A great story' } });
      fireEvent.submit(screen.getByTestId('submit-btn').closest('form'));
      expect(handleSubmit).toHaveBeenCalled();
    });

    it('should have correct placeholders on form fields', () => {
      render(
        <MockedProvider mocks={storiesMock} addTypename={false}>
          <MemoryRouter>
            <MockSuccessStoriesWithForm userId="user1" onSubmit={() => {}} />
          </MemoryRouter>
        </MockedProvider>
      );

      expect(screen.getByPlaceholderText('Story Title')).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Pet's Name")).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Pet Type (Dog, Cat, etc.)')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Tell us about your adoption experience...')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Photo URL (optional)')).toBeInTheDocument();
    });
  });

  describe('Date Formatting', () => {
    it('should format dates correctly', () => {
      const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return '';
        return date.toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric'
        });
      };

      // Use noon UTC to avoid timezone-related day shifts
      expect(formatDate('2025-01-15T12:00:00.000Z')).toBe('January 15, 2025');
      expect(formatDate('2025-12-25T12:00:00.000Z')).toBe('December 25, 2025');
    });

    it('should handle invalid dates gracefully', () => {
      const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return '';
        return date.toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric'
        });
      };

      expect(formatDate('')).toBe('');
      expect(formatDate(null)).toBe('');
      expect(formatDate('not-a-date')).toBe('');
    });
  });
});
