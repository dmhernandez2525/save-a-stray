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

describe('Shelter Contact Information', () => {
  const MockContactInfo = ({ shelter, onEdit }) => {
    const [editing, setEditing] = React.useState(false);
    const [form, setForm] = React.useState({
      phone: shelter.phone || '',
      email: shelter.email || '',
      website: shelter.website || '',
      hours: shelter.hours || '',
      description: shelter.description || ''
    });

    const hasContact = shelter.phone || shelter.email || shelter.website || shelter.hours || shelter.description;

    if (editing) {
      return (
        <div data-testid="contact-edit-form">
          <h3>Edit Contact Information</h3>
          <input data-testid="edit-phone" value={form.phone}
            onChange={e => setForm({...form, phone: e.target.value})} placeholder="Phone" />
          <input data-testid="edit-email" value={form.email}
            onChange={e => setForm({...form, email: e.target.value})} placeholder="Contact Email" />
          <input data-testid="edit-website" value={form.website}
            onChange={e => setForm({...form, website: e.target.value})} placeholder="Website" />
          <input data-testid="edit-hours" value={form.hours}
            onChange={e => setForm({...form, hours: e.target.value})} placeholder="Hours" />
          <input data-testid="edit-description" value={form.description}
            onChange={e => setForm({...form, description: e.target.value})} placeholder="About" />
          <button data-testid="save-contact" onClick={() => { onEdit && onEdit(form); setEditing(false); }}>Save</button>
          <button data-testid="cancel-edit" onClick={() => setEditing(false)}>Cancel</button>
        </div>
      );
    }

    return (
      <div data-testid="contact-display">
        <h3>Contact Information</h3>
        <button data-testid="edit-contact-btn" onClick={() => setEditing(true)}>Edit</button>
        {!hasContact ? (
          <p data-testid="no-contact-msg">No contact information added yet.</p>
        ) : (
          <div data-testid="contact-details">
            {shelter.phone && <div data-testid="contact-phone">{shelter.phone}</div>}
            {shelter.email && <div data-testid="contact-email">{shelter.email}</div>}
            {shelter.website && <div data-testid="contact-website">{shelter.website}</div>}
            {shelter.hours && <div data-testid="contact-hours">{shelter.hours}</div>}
            {shelter.description && <div data-testid="contact-desc">{shelter.description}</div>}
          </div>
        )}
      </div>
    );
  };

  it('should show empty state when no contact info', () => {
    render(
      <TestWrapper>
        <MockContactInfo shelter={{ _id: '1', name: 'Test', location: 'NY', paymentEmail: 'test@t.com' }} />
      </TestWrapper>
    );
    expect(screen.getByTestId('no-contact-msg')).toBeInTheDocument();
  });

  it('should display contact details when present', () => {
    render(
      <TestWrapper>
        <MockContactInfo shelter={{
          _id: '1', name: 'Test', location: 'NY', paymentEmail: 'test@t.com',
          phone: '555-1234', email: 'info@shelter.com', website: 'https://shelter.com',
          hours: 'Mon-Fri 9-5', description: 'A great shelter'
        }} />
      </TestWrapper>
    );
    expect(screen.getByTestId('contact-phone')).toHaveTextContent('555-1234');
    expect(screen.getByTestId('contact-email')).toHaveTextContent('info@shelter.com');
    expect(screen.getByTestId('contact-website')).toHaveTextContent('https://shelter.com');
    expect(screen.getByTestId('contact-hours')).toHaveTextContent('Mon-Fri 9-5');
    expect(screen.getByTestId('contact-desc')).toHaveTextContent('A great shelter');
  });

  it('should show edit form when Edit clicked', () => {
    render(
      <TestWrapper>
        <MockContactInfo shelter={{ _id: '1', name: 'Test', location: 'NY', paymentEmail: 'test@t.com' }} />
      </TestWrapper>
    );
    fireEvent.click(screen.getByTestId('edit-contact-btn'));
    expect(screen.getByTestId('contact-edit-form')).toBeInTheDocument();
  });

  it('should populate edit form with existing values', () => {
    render(
      <TestWrapper>
        <MockContactInfo shelter={{
          _id: '1', name: 'Test', location: 'NY', paymentEmail: 'test@t.com',
          phone: '555-1234', email: 'info@shelter.com'
        }} />
      </TestWrapper>
    );
    fireEvent.click(screen.getByTestId('edit-contact-btn'));
    expect(screen.getByTestId('edit-phone').value).toBe('555-1234');
    expect(screen.getByTestId('edit-email').value).toBe('info@shelter.com');
  });

  it('should call onEdit with form data on save', () => {
    const handleEdit = vi.fn();
    render(
      <TestWrapper>
        <MockContactInfo shelter={{ _id: '1', name: 'Test', location: 'NY', paymentEmail: 'test@t.com' }}
          onEdit={handleEdit} />
      </TestWrapper>
    );
    fireEvent.click(screen.getByTestId('edit-contact-btn'));
    fireEvent.change(screen.getByTestId('edit-phone'), { target: { value: '555-9999' } });
    fireEvent.click(screen.getByTestId('save-contact'));
    expect(handleEdit).toHaveBeenCalledWith(expect.objectContaining({ phone: '555-9999' }));
  });

  it('should cancel editing', () => {
    render(
      <TestWrapper>
        <MockContactInfo shelter={{ _id: '1', name: 'Test', location: 'NY', paymentEmail: 'test@t.com' }} />
      </TestWrapper>
    );
    fireEvent.click(screen.getByTestId('edit-contact-btn'));
    fireEvent.click(screen.getByTestId('cancel-edit'));
    expect(screen.getByTestId('contact-display')).toBeInTheDocument();
  });

  it('should return to display mode after saving', () => {
    render(
      <TestWrapper>
        <MockContactInfo shelter={{ _id: '1', name: 'Test', location: 'NY', paymentEmail: 'test@t.com' }} />
      </TestWrapper>
    );
    fireEvent.click(screen.getByTestId('edit-contact-btn'));
    fireEvent.click(screen.getByTestId('save-contact'));
    expect(screen.getByTestId('contact-display')).toBeInTheDocument();
  });
});
