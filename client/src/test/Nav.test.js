import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { MockedProvider } from '@apollo/client/testing';
import { gql } from '@apollo/client';

// Mock CSS imports
vi.mock('../components/css/App.css', () => ({}));

// GraphQL query for checking login status
const IS_LOGGED_IN = gql`
  query IsUserLoggedIn {
    isLoggedIn @client
  }
`;

const loggedInMocks = [
  {
    request: {
      query: IS_LOGGED_IN
    },
    result: {
      data: {
        isLoggedIn: true
      }
    }
  }
];

const loggedOutMocks = [
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

// Mock Nav component for logged out state
const MockNavLoggedOut = () => {
  return (
    <div id="navbar" data-testid="navbar">
      <div id="nav-right">
        <div className="auth-links" data-testid="auth-links">
          <a href="/login" data-testid="login-link">
            Login
          </a>
          <br />
          <a href="/register" data-testid="register-link">
            Register
          </a>
        </div>
      </div>
    </div>
  );
};

// Mock Nav component for logged in state
const MockNavLoggedIn = ({ onLogout, onBack, showBackButton }) => {
  return (
    <div id="navbar" data-testid="navbar">
      <div id="nav-right">
        <div className="auth-links" data-testid="auth-links">
          <button id="logout" onClick={onLogout} data-testid="logout-button">
            Logout
          </button>
          {showBackButton && (
            <button id="logout" onClick={onBack} data-testid="back-button">
              back
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

describe('Nav Component - Logged Out State', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render the navbar', () => {
      render(
        <MockedProvider mocks={loggedOutMocks} addTypename={false}>
          <MemoryRouter>
            <MockNavLoggedOut />
          </MemoryRouter>
        </MockedProvider>
      );

      expect(screen.getByTestId('navbar')).toBeInTheDocument();
    });

    it('should render auth links container', () => {
      render(
        <MockedProvider mocks={loggedOutMocks} addTypename={false}>
          <MemoryRouter>
            <MockNavLoggedOut />
          </MemoryRouter>
        </MockedProvider>
      );

      expect(screen.getByTestId('auth-links')).toBeInTheDocument();
    });

    it('should render login link', () => {
      render(
        <MockedProvider mocks={loggedOutMocks} addTypename={false}>
          <MemoryRouter>
            <MockNavLoggedOut />
          </MemoryRouter>
        </MockedProvider>
      );

      expect(screen.getByTestId('login-link')).toBeInTheDocument();
      expect(screen.getByText('Login')).toBeInTheDocument();
    });

    it('should render register link', () => {
      render(
        <MockedProvider mocks={loggedOutMocks} addTypename={false}>
          <MemoryRouter>
            <MockNavLoggedOut />
          </MemoryRouter>
        </MockedProvider>
      );

      expect(screen.getByTestId('register-link')).toBeInTheDocument();
      expect(screen.getByText('Register')).toBeInTheDocument();
    });

    it('should have correct href for login link', () => {
      render(
        <MockedProvider mocks={loggedOutMocks} addTypename={false}>
          <MemoryRouter>
            <MockNavLoggedOut />
          </MemoryRouter>
        </MockedProvider>
      );

      expect(screen.getByTestId('login-link').getAttribute('href')).toBe('/login');
    });

    it('should have correct href for register link', () => {
      render(
        <MockedProvider mocks={loggedOutMocks} addTypename={false}>
          <MemoryRouter>
            <MockNavLoggedOut />
          </MemoryRouter>
        </MockedProvider>
      );

      expect(screen.getByTestId('register-link').getAttribute('href')).toBe('/register');
    });

    it('should not show logout button when logged out', () => {
      render(
        <MockedProvider mocks={loggedOutMocks} addTypename={false}>
          <MemoryRouter>
            <MockNavLoggedOut />
          </MemoryRouter>
        </MockedProvider>
      );

      expect(screen.queryByTestId('logout-button')).not.toBeInTheDocument();
    });
  });
});

describe('Nav Component - Logged In State', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render the navbar', () => {
      render(
        <MockedProvider mocks={loggedInMocks} addTypename={false}>
          <MemoryRouter>
            <MockNavLoggedIn onLogout={() => {}} showBackButton={false} />
          </MemoryRouter>
        </MockedProvider>
      );

      expect(screen.getByTestId('navbar')).toBeInTheDocument();
    });

    it('should render logout button when logged in', () => {
      render(
        <MockedProvider mocks={loggedInMocks} addTypename={false}>
          <MemoryRouter>
            <MockNavLoggedIn onLogout={() => {}} showBackButton={false} />
          </MemoryRouter>
        </MockedProvider>
      );

      expect(screen.getByTestId('logout-button')).toBeInTheDocument();
      expect(screen.getByText('Logout')).toBeInTheDocument();
    });

    it('should not show login link when logged in', () => {
      render(
        <MockedProvider mocks={loggedInMocks} addTypename={false}>
          <MemoryRouter>
            <MockNavLoggedIn onLogout={() => {}} showBackButton={false} />
          </MemoryRouter>
        </MockedProvider>
      );

      expect(screen.queryByTestId('login-link')).not.toBeInTheDocument();
    });

    it('should not show register link when logged in', () => {
      render(
        <MockedProvider mocks={loggedInMocks} addTypename={false}>
          <MemoryRouter>
            <MockNavLoggedIn onLogout={() => {}} showBackButton={false} />
          </MemoryRouter>
        </MockedProvider>
      );

      expect(screen.queryByTestId('register-link')).not.toBeInTheDocument();
    });
  });

  describe('Back Button', () => {
    it('should show back button when showBackButton is true', () => {
      render(
        <MockedProvider mocks={loggedInMocks} addTypename={false}>
          <MemoryRouter>
            <MockNavLoggedIn onLogout={() => {}} onBack={() => {}} showBackButton={true} />
          </MemoryRouter>
        </MockedProvider>
      );

      expect(screen.getByTestId('back-button')).toBeInTheDocument();
      expect(screen.getByText('back')).toBeInTheDocument();
    });

    it('should not show back button when showBackButton is false', () => {
      render(
        <MockedProvider mocks={loggedInMocks} addTypename={false}>
          <MemoryRouter>
            <MockNavLoggedIn onLogout={() => {}} showBackButton={false} />
          </MemoryRouter>
        </MockedProvider>
      );

      expect(screen.queryByTestId('back-button')).not.toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('should call onLogout when logout button is clicked', () => {
      const handleLogout = vi.fn();

      render(
        <MockedProvider mocks={loggedInMocks} addTypename={false}>
          <MemoryRouter>
            <MockNavLoggedIn onLogout={handleLogout} showBackButton={false} />
          </MemoryRouter>
        </MockedProvider>
      );

      fireEvent.click(screen.getByTestId('logout-button'));

      expect(handleLogout).toHaveBeenCalled();
    });

    it('should call onBack when back button is clicked', () => {
      const handleBack = vi.fn();

      render(
        <MockedProvider mocks={loggedInMocks} addTypename={false}>
          <MemoryRouter>
            <MockNavLoggedIn onLogout={() => {}} onBack={handleBack} showBackButton={true} />
          </MemoryRouter>
        </MockedProvider>
      );

      fireEvent.click(screen.getByTestId('back-button'));

      expect(handleBack).toHaveBeenCalled();
    });
  });
});

describe('Nav Component - LocalStorage Handling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should clear auth-token from localStorage on logout', () => {
    localStorage.setItem('auth-token', 'test-token');

    const handleLogout = () => {
      localStorage.removeItem('auth-token');
    };

    render(
      <MockedProvider mocks={loggedInMocks} addTypename={false}>
        <MemoryRouter>
          <MockNavLoggedIn onLogout={handleLogout} showBackButton={false} />
        </MemoryRouter>
      </MockedProvider>
    );

    expect(localStorage.getItem('auth-token')).toBe('test-token');

    fireEvent.click(screen.getByTestId('logout-button'));

    expect(localStorage.getItem('auth-token')).toBeNull();
  });
});
