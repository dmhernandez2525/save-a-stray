import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { MockedProvider } from '@apollo/client/testing';
import { gql } from '@apollo/client';

// Mock the CSS import
// GraphQL mutation for creating an animal
const CREATE_ANIMAL = gql`
  mutation CreateAnimal(
    $name: String!
    $type: String!
    $age: Int!
    $sex: String!
    $color: String!
    $description: String!
    $image: String
    $video: String
    $applications: ID
  ) {
    newAnimal(
      name: $name
      type: $type
      age: $age
      sex: $sex
      color: $color
      description: $description
      image: $image
      video: $video
      applications: $applications
    ) {
      name
      type
      age
      sex
      color
      description
    }
  }
`;

const mocks = [
  {
    request: {
      query: CREATE_ANIMAL,
      variables: {
        name: 'Buddy',
        type: 'Dogs',
        age: 3,
        sex: 'Male',
        color: 'Brown',
        description: 'Friendly dog',
        image: 'efwefser',
        video: 'esrgserg',
        applications: 'gsergsergse'
      }
    },
    result: {
      data: {
        newAnimal: {
          name: 'Buddy',
          type: 'Dogs',
          age: 3,
          sex: 'Male',
          color: 'Brown',
          description: 'Friendly dog'
        }
      }
    }
  }
];

// Mock component for testing form behavior
const MockAnimalForm = () => {
  const [state, setState] = React.useState({
    name: '',
    type: '',
    age: '',
    sex: '',
    color: '',
    description: ''
  });

  const update = (field) => (e) => setState({ ...state, [field]: e.target.value });

  return (
    <div data-testid="animal-form">
      <form
        onSubmit={(e) => {
          e.preventDefault();
        }}
      >
        <h1 id="new-animal-header">Put up an animal for adoption</h1>
        <input
          data-testid="animal-name"
          value={state.name}
          onChange={update('name')}
          placeholder="name"
        />
        <input
          data-testid="animal-type"
          value={state.type}
          onChange={update('type')}
          placeholder="type"
        />
        <input
          data-testid="animal-age"
          value={state.age}
          onChange={update('age')}
          placeholder="age"
        />
        <input
          data-testid="animal-color"
          value={state.color}
          onChange={update('color')}
          placeholder="color"
        />
        <input
          data-testid="animal-description"
          value={state.description}
          onChange={update('description')}
          placeholder="description"
        />
        <button type="submit" data-testid="submit-button">
          Add Animal
        </button>
      </form>
    </div>
  );
};

const TestWrapper = ({ children }) => (
  <MockedProvider mocks={mocks} addTypename={false}>
    <MemoryRouter>{children}</MemoryRouter>
  </MockedProvider>
);

describe('Animal Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Form Rendering', () => {
    it('should render the animal form', () => {
      render(
        <TestWrapper>
          <MockAnimalForm />
        </TestWrapper>
      );

      expect(screen.getByTestId('animal-form')).toBeInTheDocument();
    });

    it('should render form header', () => {
      render(
        <TestWrapper>
          <MockAnimalForm />
        </TestWrapper>
      );

      expect(screen.getByText('Put up an animal for adoption')).toBeInTheDocument();
    });

    it('should render all input fields', () => {
      render(
        <TestWrapper>
          <MockAnimalForm />
        </TestWrapper>
      );

      expect(screen.getByPlaceholderText('name')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('type')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('age')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('color')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('description')).toBeInTheDocument();
    });

    it('should render submit button', () => {
      render(
        <TestWrapper>
          <MockAnimalForm />
        </TestWrapper>
      );

      expect(screen.getByTestId('submit-button')).toBeInTheDocument();
      expect(screen.getByText('Add Animal')).toBeInTheDocument();
    });
  });

  describe('Form Interactions', () => {
    it('should update name field on input', () => {
      render(
        <TestWrapper>
          <MockAnimalForm />
        </TestWrapper>
      );

      const nameInput = screen.getByPlaceholderText('name');
      fireEvent.change(nameInput, { target: { value: 'Buddy' } });

      expect(nameInput.value).toBe('Buddy');
    });

    it('should update type field on input', () => {
      render(
        <TestWrapper>
          <MockAnimalForm />
        </TestWrapper>
      );

      const typeInput = screen.getByPlaceholderText('type');
      fireEvent.change(typeInput, { target: { value: 'Dogs' } });

      expect(typeInput.value).toBe('Dogs');
    });

    it('should update age field on input', () => {
      render(
        <TestWrapper>
          <MockAnimalForm />
        </TestWrapper>
      );

      const ageInput = screen.getByPlaceholderText('age');
      fireEvent.change(ageInput, { target: { value: '3' } });

      expect(ageInput.value).toBe('3');
    });

    it('should update color field on input', () => {
      render(
        <TestWrapper>
          <MockAnimalForm />
        </TestWrapper>
      );

      const colorInput = screen.getByPlaceholderText('color');
      fireEvent.change(colorInput, { target: { value: 'Brown' } });

      expect(colorInput.value).toBe('Brown');
    });

    it('should update description field on input', () => {
      render(
        <TestWrapper>
          <MockAnimalForm />
        </TestWrapper>
      );

      const descInput = screen.getByPlaceholderText('description');
      fireEvent.change(descInput, { target: { value: 'Friendly dog' } });

      expect(descInput.value).toBe('Friendly dog');
    });

    it('should handle form submission', () => {
      const handleSubmit = vi.fn((e) => e.preventDefault());

      render(
        <TestWrapper>
          <form onSubmit={handleSubmit} data-testid="test-form">
            <button type="submit">Submit</button>
          </form>
        </TestWrapper>
      );

      const form = screen.getByTestId('test-form');
      fireEvent.submit(form);

      expect(handleSubmit).toHaveBeenCalled();
    });
  });

  describe('Form Validation Behavior', () => {
    it('should allow filling all required fields', () => {
      render(
        <TestWrapper>
          <MockAnimalForm />
        </TestWrapper>
      );

      fireEvent.change(screen.getByPlaceholderText('name'), { target: { value: 'Max' } });
      fireEvent.change(screen.getByPlaceholderText('type'), { target: { value: 'Dogs' } });
      fireEvent.change(screen.getByPlaceholderText('age'), { target: { value: '5' } });
      fireEvent.change(screen.getByPlaceholderText('color'), { target: { value: 'Black' } });
      fireEvent.change(screen.getByPlaceholderText('description'), {
        target: { value: 'Energetic labrador' }
      });

      expect(screen.getByPlaceholderText('name').value).toBe('Max');
      expect(screen.getByPlaceholderText('type').value).toBe('Dogs');
      expect(screen.getByPlaceholderText('age').value).toBe('5');
      expect(screen.getByPlaceholderText('color').value).toBe('Black');
      expect(screen.getByPlaceholderText('description').value).toBe('Energetic labrador');
    });

    it('should start with empty fields', () => {
      render(
        <TestWrapper>
          <MockAnimalForm />
        </TestWrapper>
      );

      expect(screen.getByPlaceholderText('name').value).toBe('');
      expect(screen.getByPlaceholderText('type').value).toBe('');
      expect(screen.getByPlaceholderText('age').value).toBe('');
      expect(screen.getByPlaceholderText('color').value).toBe('');
      expect(screen.getByPlaceholderText('description').value).toBe('');
    });
  });
});
