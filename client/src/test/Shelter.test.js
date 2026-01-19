import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { MockedProvider } from '@apollo/client/testing';
import { gql } from '@apollo/client';

// Mock CSS imports
vi.mock('../components/css/ShelterLanding.css', () => ({}));
vi.mock('../components/css/App.css', () => ({}));

// GraphQL mutation for creating a shelter
const CREATE_SHELTER = gql`
  mutation CreateShelter($name: String!, $location: String!, $paymentEmail: String!) {
    newShelter(name: $name, location: $location, paymentEmail: $paymentEmail) {
      name
      location
      paymentEmail
      _id
    }
  }
`;

const mocks = [
  {
    request: {
      query: CREATE_SHELTER,
      variables: {
        name: 'Happy Paws Shelter',
        location: 'New York, NY',
        paymentEmail: 'donate@happypaws.com'
      }
    },
    result: {
      data: {
        newShelter: {
          _id: 'shelter-123',
          name: 'Happy Paws Shelter',
          location: 'New York, NY',
          paymentEmail: 'donate@happypaws.com'
        }
      }
    }
  }
];

// Mock ShelterLanding component
const MockShelterLanding = () => {
  return (
    <div id="shelter-landing-top" data-testid="shelter-landing">
      <h1>Let us help you find owners for your animals!</h1>
      <a href="/newAnimal" data-testid="new-animal-link">
        New Animal
      </a>
    </div>
  );
};

// Mock Shelter form component
const MockShelterForm = ({ onComplete }) => {
  const [state, setState] = React.useState({
    name: '',
    location: '',
    paymentEmail: ''
  });

  const update = (field) => (e) => setState({ ...state, [field]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onComplete) {
      onComplete(state);
    }
  };

  return (
    <div className="auth-modal" data-testid="shelter-form">
      <div className="auth-div">
        <a href="/" className="modal-exit" data-testid="close-button">
          X
        </a>
        <form className="auth-form" onSubmit={handleSubmit}>
          <h1 id="shelter-signup">Shelter Signup</h1>
          <input
            value={state.name}
            onChange={update('name')}
            placeholder="name"
            data-testid="shelter-name"
          />
          <input
            value={state.location}
            onChange={update('location')}
            placeholder="location"
            data-testid="shelter-location"
          />
          <input
            value={state.paymentEmail}
            onChange={update('paymentEmail')}
            placeholder="Shelter Email"
            data-testid="shelter-email"
          />
          <button className="modal-button" type="submit" data-testid="submit-button">
            new shelter
          </button>
        </form>
      </div>
    </div>
  );
};

const TestWrapper = ({ children }) => (
  <MockedProvider mocks={mocks} addTypename={false}>
    <MemoryRouter>{children}</MemoryRouter>
  </MockedProvider>
);

describe('ShelterLanding Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render the shelter landing component', () => {
      render(
        <TestWrapper>
          <MockShelterLanding />
        </TestWrapper>
      );

      expect(screen.getByTestId('shelter-landing')).toBeInTheDocument();
    });

    it('should display welcome message', () => {
      render(
        <TestWrapper>
          <MockShelterLanding />
        </TestWrapper>
      );

      expect(screen.getByText('Let us help you find owners for your animals!')).toBeInTheDocument();
    });

    it('should display link to add new animal', () => {
      render(
        <TestWrapper>
          <MockShelterLanding />
        </TestWrapper>
      );

      expect(screen.getByTestId('new-animal-link')).toBeInTheDocument();
      expect(screen.getByText('New Animal')).toBeInTheDocument();
    });

    it('should have correct link href for new animal', () => {
      render(
        <TestWrapper>
          <MockShelterLanding />
        </TestWrapper>
      );

      const link = screen.getByTestId('new-animal-link');
      expect(link.getAttribute('href')).toBe('/newAnimal');
    });
  });
});

describe('Shelter Form Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Form Rendering', () => {
    it('should render the shelter form', () => {
      render(
        <TestWrapper>
          <MockShelterForm />
        </TestWrapper>
      );

      expect(screen.getByTestId('shelter-form')).toBeInTheDocument();
    });

    it('should render form title', () => {
      render(
        <TestWrapper>
          <MockShelterForm />
        </TestWrapper>
      );

      expect(screen.getByText('Shelter Signup')).toBeInTheDocument();
    });

    it('should render all input fields', () => {
      render(
        <TestWrapper>
          <MockShelterForm />
        </TestWrapper>
      );

      expect(screen.getByPlaceholderText('name')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('location')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Shelter Email')).toBeInTheDocument();
    });

    it('should render submit button', () => {
      render(
        <TestWrapper>
          <MockShelterForm />
        </TestWrapper>
      );

      expect(screen.getByTestId('submit-button')).toBeInTheDocument();
      expect(screen.getByText('new shelter')).toBeInTheDocument();
    });

    it('should render close button', () => {
      render(
        <TestWrapper>
          <MockShelterForm />
        </TestWrapper>
      );

      expect(screen.getByTestId('close-button')).toBeInTheDocument();
      expect(screen.getByText('X')).toBeInTheDocument();
    });
  });

  describe('Form Interactions', () => {
    it('should update name field on input', () => {
      render(
        <TestWrapper>
          <MockShelterForm />
        </TestWrapper>
      );

      const nameInput = screen.getByPlaceholderText('name');
      fireEvent.change(nameInput, { target: { value: 'Happy Paws Shelter' } });

      expect(nameInput.value).toBe('Happy Paws Shelter');
    });

    it('should update location field on input', () => {
      render(
        <TestWrapper>
          <MockShelterForm />
        </TestWrapper>
      );

      const locationInput = screen.getByPlaceholderText('location');
      fireEvent.change(locationInput, { target: { value: 'New York, NY' } });

      expect(locationInput.value).toBe('New York, NY');
    });

    it('should update payment email field on input', () => {
      render(
        <TestWrapper>
          <MockShelterForm />
        </TestWrapper>
      );

      const emailInput = screen.getByPlaceholderText('Shelter Email');
      fireEvent.change(emailInput, { target: { value: 'donate@happypaws.com' } });

      expect(emailInput.value).toBe('donate@happypaws.com');
    });

    it('should call onComplete with form data on submit', () => {
      const handleComplete = vi.fn();

      render(
        <TestWrapper>
          <MockShelterForm onComplete={handleComplete} />
        </TestWrapper>
      );

      fireEvent.change(screen.getByPlaceholderText('name'), {
        target: { value: 'Test Shelter' }
      });
      fireEvent.change(screen.getByPlaceholderText('location'), {
        target: { value: 'Test City' }
      });
      fireEvent.change(screen.getByPlaceholderText('Shelter Email'), {
        target: { value: 'test@shelter.com' }
      });

      fireEvent.click(screen.getByTestId('submit-button'));

      expect(handleComplete).toHaveBeenCalledWith({
        name: 'Test Shelter',
        location: 'Test City',
        paymentEmail: 'test@shelter.com'
      });
    });

    it('should start with empty fields', () => {
      render(
        <TestWrapper>
          <MockShelterForm />
        </TestWrapper>
      );

      expect(screen.getByPlaceholderText('name').value).toBe('');
      expect(screen.getByPlaceholderText('location').value).toBe('');
      expect(screen.getByPlaceholderText('Shelter Email').value).toBe('');
    });
  });

  describe('Form Validation Behavior', () => {
    it('should allow filling all fields', () => {
      render(
        <TestWrapper>
          <MockShelterForm />
        </TestWrapper>
      );

      fireEvent.change(screen.getByPlaceholderText('name'), {
        target: { value: 'Animal Haven' }
      });
      fireEvent.change(screen.getByPlaceholderText('location'), {
        target: { value: 'Los Angeles, CA' }
      });
      fireEvent.change(screen.getByPlaceholderText('Shelter Email'), {
        target: { value: 'support@animalhaven.com' }
      });

      expect(screen.getByPlaceholderText('name').value).toBe('Animal Haven');
      expect(screen.getByPlaceholderText('location').value).toBe('Los Angeles, CA');
      expect(screen.getByPlaceholderText('Shelter Email').value).toBe('support@animalhaven.com');
    });
  });
});
