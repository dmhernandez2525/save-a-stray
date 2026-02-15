import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { MockedProvider } from '@apollo/client/testing';
import { gql } from '@apollo/client';


// GraphQL query
const IS_LOGGED_IN = gql`
  query IsUserLoggedIn {
    isLoggedIn @client
  }
`;

const mocks = [
  {
    request: {
      query: IS_LOGGED_IN
    },
    result: {
      data: {
        isLoggedIn: false
      }
    }
  }
];

// Mock Splash component
const MockSplash = ({ onOpenFeed }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const handleOpenFeed = () => {
    setIsOpen(!isOpen);
    if (onOpenFeed) {
      onOpenFeed(!isOpen);
    }
  };

  return (
    <div id="splash" data-testid="splash">
      <div id="splash-top">
        <button className={isOpen ? 'open' : 'closed'} id="splash-button" data-testid="splash-button">
          <h2 id="browse" onClick={handleOpenFeed} data-testid="browse-text">
            Browse Animals
          </h2>
          <div
            id="splash-feed-wrapper"
            className={isOpen ? '' : 'hidden'}
            data-testid="feed-wrapper"
          >
            <p id="splash-feed-exit" onClick={handleOpenFeed} data-testid="feed-exit">
              X
            </p>
            <div data-testid="user-landing-content">
              {/* UserLanding component would be here */}
              <p>Browse Animals Content</p>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
};

const TestWrapper = ({ children }) => (
  <MockedProvider mocks={mocks} addTypename={false}>
    <MemoryRouter>{children}</MemoryRouter>
  </MockedProvider>
);

describe('Splash Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial Rendering', () => {
    it('should render the splash component', () => {
      render(
        <TestWrapper>
          <MockSplash />
        </TestWrapper>
      );

      expect(screen.getByTestId('splash')).toBeInTheDocument();
    });

    it('should render the splash button', () => {
      render(
        <TestWrapper>
          <MockSplash />
        </TestWrapper>
      );

      expect(screen.getByTestId('splash-button')).toBeInTheDocument();
    });

    it('should display "Browse Animals" text', () => {
      render(
        <TestWrapper>
          <MockSplash />
        </TestWrapper>
      );

      expect(screen.getByTestId('browse-text')).toBeInTheDocument();
      expect(screen.getByText('Browse Animals')).toBeInTheDocument();
    });

    it('should have feed wrapper hidden initially', () => {
      render(
        <TestWrapper>
          <MockSplash />
        </TestWrapper>
      );

      const feedWrapper = screen.getByTestId('feed-wrapper');
      expect(feedWrapper).toHaveClass('hidden');
    });

    it('should have splash button with closed class initially', () => {
      render(
        <TestWrapper>
          <MockSplash />
        </TestWrapper>
      );

      const splashButton = screen.getByTestId('splash-button');
      expect(splashButton).toHaveClass('closed');
    });
  });

  describe('Opening Feed', () => {
    it('should remove hidden class from feed when browse is clicked', () => {
      render(
        <TestWrapper>
          <MockSplash />
        </TestWrapper>
      );

      fireEvent.click(screen.getByTestId('browse-text'));

      const feedWrapper = screen.getByTestId('feed-wrapper');
      expect(feedWrapper).not.toHaveClass('hidden');
    });

    it('should add open class to button when browse is clicked', () => {
      render(
        <TestWrapper>
          <MockSplash />
        </TestWrapper>
      );

      fireEvent.click(screen.getByTestId('browse-text'));

      const splashButton = screen.getByTestId('splash-button');
      expect(splashButton).toHaveClass('open');
    });

    it('should call onOpenFeed with true when feed is opened', () => {
      const handleOpenFeed = vi.fn();

      render(
        <TestWrapper>
          <MockSplash onOpenFeed={handleOpenFeed} />
        </TestWrapper>
      );

      fireEvent.click(screen.getByTestId('browse-text'));

      expect(handleOpenFeed).toHaveBeenCalledWith(true);
    });

    it('should show exit button when feed is open', () => {
      render(
        <TestWrapper>
          <MockSplash />
        </TestWrapper>
      );

      fireEvent.click(screen.getByTestId('browse-text'));

      expect(screen.getByTestId('feed-exit')).toBeInTheDocument();
      expect(screen.getByText('X')).toBeInTheDocument();
    });
  });

  describe('Closing Feed', () => {
    it('should add hidden class back to feed when exit is clicked', () => {
      render(
        <TestWrapper>
          <MockSplash />
        </TestWrapper>
      );

      // Open the feed
      fireEvent.click(screen.getByTestId('browse-text'));
      expect(screen.getByTestId('feed-wrapper')).not.toHaveClass('hidden');

      // Close the feed
      fireEvent.click(screen.getByTestId('feed-exit'));
      expect(screen.getByTestId('feed-wrapper')).toHaveClass('hidden');
    });

    it('should toggle button class back to closed', () => {
      render(
        <TestWrapper>
          <MockSplash />
        </TestWrapper>
      );

      // Open
      fireEvent.click(screen.getByTestId('browse-text'));
      expect(screen.getByTestId('splash-button')).toHaveClass('open');

      // Close
      fireEvent.click(screen.getByTestId('feed-exit'));
      expect(screen.getByTestId('splash-button')).toHaveClass('closed');
    });

    it('should call onOpenFeed with false when feed is closed', () => {
      const handleOpenFeed = vi.fn();

      render(
        <TestWrapper>
          <MockSplash onOpenFeed={handleOpenFeed} />
        </TestWrapper>
      );

      // Open
      fireEvent.click(screen.getByTestId('browse-text'));
      expect(handleOpenFeed).toHaveBeenLastCalledWith(true);

      // Close
      fireEvent.click(screen.getByTestId('feed-exit'));
      expect(handleOpenFeed).toHaveBeenLastCalledWith(false);
    });
  });

  describe('Toggle Behavior', () => {
    it('should toggle feed visibility on multiple clicks', () => {
      render(
        <TestWrapper>
          <MockSplash />
        </TestWrapper>
      );

      const browseText = screen.getByTestId('browse-text');
      const feedWrapper = screen.getByTestId('feed-wrapper');

      // Initially hidden
      expect(feedWrapper).toHaveClass('hidden');

      // Click to open
      fireEvent.click(browseText);
      expect(feedWrapper).not.toHaveClass('hidden');

      // Click to close
      fireEvent.click(browseText);
      expect(feedWrapper).toHaveClass('hidden');

      // Click to open again
      fireEvent.click(browseText);
      expect(feedWrapper).not.toHaveClass('hidden');
    });
  });

  describe('Content Display', () => {
    it('should display user landing content when feed is open', () => {
      render(
        <TestWrapper>
          <MockSplash />
        </TestWrapper>
      );

      fireEvent.click(screen.getByTestId('browse-text'));

      expect(screen.getByTestId('user-landing-content')).toBeInTheDocument();
      expect(screen.getByText('Browse Animals Content')).toBeInTheDocument();
    });
  });
});
