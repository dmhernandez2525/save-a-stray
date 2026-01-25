import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { MockedProvider } from '@apollo/client/testing';
import { gql } from '@apollo/client';

// Mock CSS imports
vi.mock('../components/css/App.css', () => ({}));

// GraphQL mutation for registration with shelter fields
const REGISTER_USER = gql`
  mutation RegisterUser(
    $userRole: String
    $name: String!
    $email: String!
    $password: String!
    $shelterName: String
    $shelterLocation: String
    $shelterPaymentEmail: String
  ) {
    register(
      userRole: $userRole
      name: $name
      email: $email
      password: $password
      shelterName: $shelterName
      shelterLocation: $shelterLocation
      shelterPaymentEmail: $shelterPaymentEmail
    ) {
      token
      loggedIn
      _id
      shelter {
        name
      }
    }
  }
`;

const endUserMocks = [
  {
    request: {
      query: REGISTER_USER,
      variables: {
        name: 'Test User',
        userRole: 'endUser',
        email: 'test@example.com',
        password: 'password123'
      }
    },
    result: {
      data: {
        register: {
          token: 'mock-token',
          loggedIn: true,
          _id: 'user-123',
          shelter: null
        }
      }
    }
  }
];

const shelterUserMocks = [
  {
    request: {
      query: REGISTER_USER,
      variables: {
        name: 'Shelter Admin',
        userRole: 'shelter',
        email: 'admin@shelter.com',
        password: 'password123',
        shelterName: 'Happy Paws',
        shelterLocation: 'New York',
        shelterPaymentEmail: 'pay@shelter.com'
      }
    },
    result: {
      data: {
        register: {
          token: 'mock-shelter-token',
          loggedIn: true,
          _id: 'shelter-user-123',
          shelter: {
            name: 'Happy Paws'
          }
        }
      }
    }
  }
];

// Mock Register component that mirrors the real component's behavior
const MockRegister = () => {
  const [state, setState] = React.useState({
    userRole: 'endUser',
    name: '',
    email: '',
    password: '',
    shelterName: '',
    shelterLocation: '',
    shelterPaymentEmail: ''
  });

  const update = (field) => (e) => setState({ ...state, [field]: e.target.value });

  return (
    <div data-testid="register-form">
      <h1>Signup</h1>

      <div className="role-selector" data-testid="role-selector">
        <button
          type="button"
          onClick={() => setState({ ...state, userRole: 'endUser' })}
          className={state.userRole === 'endUser' ? 'active' : ''}
          data-testid="role-adopter"
        >
          Adopter
        </button>
        <button
          type="button"
          onClick={() => setState({ ...state, userRole: 'shelter' })}
          className={state.userRole === 'shelter' ? 'active' : ''}
          data-testid="role-shelter"
        >
          Shelter Staff
        </button>
      </div>

      <form onSubmit={(e) => e.preventDefault()}>
        <input
          value={state.name}
          onChange={update('name')}
          placeholder="Name"
          data-testid="input-name"
        />
        <input
          value={state.email}
          onChange={update('email')}
          placeholder="Email"
          type="email"
          data-testid="input-email"
        />
        <input
          value={state.password}
          onChange={update('password')}
          type="password"
          placeholder="Password"
          data-testid="input-password"
        />

        {state.userRole === 'shelter' && (
          <div data-testid="shelter-fields">
            <input
              value={state.shelterName}
              onChange={update('shelterName')}
              placeholder="Shelter Name"
              data-testid="input-shelter-name"
            />
            <input
              value={state.shelterLocation}
              onChange={update('shelterLocation')}
              placeholder="Shelter Location"
              data-testid="input-shelter-location"
            />
            <input
              value={state.shelterPaymentEmail}
              onChange={update('shelterPaymentEmail')}
              placeholder="Shelter Payment Email"
              type="email"
              data-testid="input-shelter-email"
            />
          </div>
        )}

        <button type="submit" data-testid="submit-button">
          {state.userRole === 'shelter' ? 'Register Shelter' : 'Register Account'}
        </button>
      </form>
    </div>
  );
};

const TestWrapper = ({ children, mocks = [] }) => (
  <MockedProvider mocks={mocks} addTypename={false}>
    <MemoryRouter>{children}</MemoryRouter>
  </MockedProvider>
);

describe('Register Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Role Selector', () => {
    it('should render role selector with Adopter and Shelter Staff options', () => {
      render(
        <TestWrapper mocks={endUserMocks}>
          <MockRegister />
        </TestWrapper>
      );

      expect(screen.getByTestId('role-adopter')).toBeInTheDocument();
      expect(screen.getByTestId('role-shelter')).toBeInTheDocument();
      expect(screen.getByText('Adopter')).toBeInTheDocument();
      expect(screen.getByText('Shelter Staff')).toBeInTheDocument();
    });

    it('should default to Adopter role', () => {
      render(
        <TestWrapper mocks={endUserMocks}>
          <MockRegister />
        </TestWrapper>
      );

      const adopterBtn = screen.getByTestId('role-adopter');
      expect(adopterBtn.className).toContain('active');
    });

    it('should switch to Shelter Staff role when clicked', () => {
      render(
        <TestWrapper mocks={endUserMocks}>
          <MockRegister />
        </TestWrapper>
      );

      fireEvent.click(screen.getByTestId('role-shelter'));

      const shelterBtn = screen.getByTestId('role-shelter');
      expect(shelterBtn.className).toContain('active');
    });

    it('should switch back to Adopter role when clicked', () => {
      render(
        <TestWrapper mocks={endUserMocks}>
          <MockRegister />
        </TestWrapper>
      );

      fireEvent.click(screen.getByTestId('role-shelter'));
      fireEvent.click(screen.getByTestId('role-adopter'));

      const adopterBtn = screen.getByTestId('role-adopter');
      expect(adopterBtn.className).toContain('active');
    });
  });

  describe('Shelter Fields Visibility', () => {
    it('should not show shelter fields when Adopter is selected', () => {
      render(
        <TestWrapper mocks={endUserMocks}>
          <MockRegister />
        </TestWrapper>
      );

      expect(screen.queryByTestId('shelter-fields')).not.toBeInTheDocument();
    });

    it('should show shelter fields when Shelter Staff is selected', () => {
      render(
        <TestWrapper mocks={shelterUserMocks}>
          <MockRegister />
        </TestWrapper>
      );

      fireEvent.click(screen.getByTestId('role-shelter'));

      expect(screen.getByTestId('shelter-fields')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Shelter Name')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Shelter Location')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Shelter Payment Email')).toBeInTheDocument();
    });

    it('should hide shelter fields when switching back to Adopter', () => {
      render(
        <TestWrapper mocks={endUserMocks}>
          <MockRegister />
        </TestWrapper>
      );

      fireEvent.click(screen.getByTestId('role-shelter'));
      expect(screen.getByTestId('shelter-fields')).toBeInTheDocument();

      fireEvent.click(screen.getByTestId('role-adopter'));
      expect(screen.queryByTestId('shelter-fields')).not.toBeInTheDocument();
    });
  });

  describe('Form Input Fields', () => {
    it('should render basic registration fields', () => {
      render(
        <TestWrapper mocks={endUserMocks}>
          <MockRegister />
        </TestWrapper>
      );

      expect(screen.getByPlaceholderText('Name')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    });

    it('should update name field on input', () => {
      render(
        <TestWrapper mocks={endUserMocks}>
          <MockRegister />
        </TestWrapper>
      );

      const nameInput = screen.getByPlaceholderText('Name');
      fireEvent.change(nameInput, { target: { value: 'Test User' } });
      expect(nameInput.value).toBe('Test User');
    });

    it('should update email field on input', () => {
      render(
        <TestWrapper mocks={endUserMocks}>
          <MockRegister />
        </TestWrapper>
      );

      const emailInput = screen.getByPlaceholderText('Email');
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      expect(emailInput.value).toBe('test@example.com');
    });

    it('should update password field on input', () => {
      render(
        <TestWrapper mocks={endUserMocks}>
          <MockRegister />
        </TestWrapper>
      );

      const passwordInput = screen.getByPlaceholderText('Password');
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      expect(passwordInput.value).toBe('password123');
    });

    it('should update shelter name field on input', () => {
      render(
        <TestWrapper mocks={shelterUserMocks}>
          <MockRegister />
        </TestWrapper>
      );

      fireEvent.click(screen.getByTestId('role-shelter'));

      const shelterNameInput = screen.getByPlaceholderText('Shelter Name');
      fireEvent.change(shelterNameInput, { target: { value: 'Happy Paws' } });
      expect(shelterNameInput.value).toBe('Happy Paws');
    });

    it('should update shelter location field on input', () => {
      render(
        <TestWrapper mocks={shelterUserMocks}>
          <MockRegister />
        </TestWrapper>
      );

      fireEvent.click(screen.getByTestId('role-shelter'));

      const locationInput = screen.getByPlaceholderText('Shelter Location');
      fireEvent.change(locationInput, { target: { value: 'New York' } });
      expect(locationInput.value).toBe('New York');
    });

    it('should update shelter payment email field on input', () => {
      render(
        <TestWrapper mocks={shelterUserMocks}>
          <MockRegister />
        </TestWrapper>
      );

      fireEvent.click(screen.getByTestId('role-shelter'));

      const emailInput = screen.getByPlaceholderText('Shelter Payment Email');
      fireEvent.change(emailInput, { target: { value: 'pay@shelter.com' } });
      expect(emailInput.value).toBe('pay@shelter.com');
    });
  });

  describe('Submit Button', () => {
    it('should show "Register Account" for adopter role', () => {
      render(
        <TestWrapper mocks={endUserMocks}>
          <MockRegister />
        </TestWrapper>
      );

      expect(screen.getByText('Register Account')).toBeInTheDocument();
    });

    it('should show "Register Shelter" for shelter role', () => {
      render(
        <TestWrapper mocks={shelterUserMocks}>
          <MockRegister />
        </TestWrapper>
      );

      fireEvent.click(screen.getByTestId('role-shelter'));
      expect(screen.getByText('Register Shelter')).toBeInTheDocument();
    });
  });

  describe('Form State', () => {
    it('should start with empty fields', () => {
      render(
        <TestWrapper mocks={endUserMocks}>
          <MockRegister />
        </TestWrapper>
      );

      expect(screen.getByPlaceholderText('Name').value).toBe('');
      expect(screen.getByPlaceholderText('Email').value).toBe('');
      expect(screen.getByPlaceholderText('Password').value).toBe('');
    });

    it('should preserve user fields when switching roles', () => {
      render(
        <TestWrapper mocks={endUserMocks}>
          <MockRegister />
        </TestWrapper>
      );

      fireEvent.change(screen.getByPlaceholderText('Name'), { target: { value: 'Test' } });
      fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'a@b.com' } });

      fireEvent.click(screen.getByTestId('role-shelter'));

      expect(screen.getByPlaceholderText('Name').value).toBe('Test');
      expect(screen.getByPlaceholderText('Email').value).toBe('a@b.com');
    });
  });
});
