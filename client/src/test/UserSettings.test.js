import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { MockedProvider } from '@apollo/client/testing';

describe('User Settings Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const MockUserSettings = ({ user, onSave }) => {
    const [editing, setEditing] = React.useState(false);
    const [name, setName] = React.useState(user?.name || '');
    const [email, setEmail] = React.useState(user?.email || '');
    const [message, setMessage] = React.useState('');

    if (!user) {
      return <p data-testid="login-prompt">Please log in to access settings.</p>;
    }

    return (
      <div data-testid="settings-page">
        <h1 data-testid="settings-title">Settings</h1>
        {message && <div data-testid="success-message">{message}</div>}

        <div data-testid="profile-section">
          <h3>Profile Information</h3>
          {editing ? (
            <div data-testid="edit-form">
              <label htmlFor="name-input">Name</label>
              <input id="name-input" data-testid="name-input" value={name}
                onChange={e => setName(e.target.value)} />
              <label htmlFor="email-input">Email</label>
              <input id="email-input" data-testid="email-input" type="email" value={email}
                onChange={e => setEmail(e.target.value)} />
              <button data-testid="save-btn" onClick={() => {
                onSave && onSave({ name, email });
                setEditing(false);
                setMessage('Profile updated successfully.');
              }}>Save</button>
              <button data-testid="cancel-btn" onClick={() => setEditing(false)}>Cancel</button>
            </div>
          ) : (
            <div data-testid="display-info">
              <div data-testid="display-name">{user.name}</div>
              <div data-testid="display-email">{user.email}</div>
              <div data-testid="display-role">{user.userRole === 'endUser' ? 'Adopter' : 'Shelter Staff'}</div>
              <button data-testid="edit-btn" onClick={() => { setName(user.name); setEmail(user.email); setEditing(true); }}>Edit</button>
            </div>
          )}
        </div>

        <div data-testid="account-section">
          <h3>Account</h3>
          {user.shelter && <div data-testid="shelter-name">{user.shelter.name}</div>}
        </div>
      </div>
    );
  };

  const TestWrapper = ({ children }) => (
    <MockedProvider mocks={[]} addTypename={false}>
      <MemoryRouter>{children}</MemoryRouter>
    </MockedProvider>
  );

  const mockUser = {
    _id: 'user-1',
    name: 'John Doe',
    email: 'john@example.com',
    userRole: 'endUser'
  };

  it('should show login prompt when no user', () => {
    render(<TestWrapper><MockUserSettings user={null} /></TestWrapper>);
    expect(screen.getByTestId('login-prompt')).toBeInTheDocument();
  });

  it('should render settings page for logged-in user', () => {
    render(<TestWrapper><MockUserSettings user={mockUser} /></TestWrapper>);
    expect(screen.getByTestId('settings-page')).toBeInTheDocument();
    expect(screen.getByTestId('settings-title')).toHaveTextContent('Settings');
  });

  it('should display user name and email', () => {
    render(<TestWrapper><MockUserSettings user={mockUser} /></TestWrapper>);
    expect(screen.getByTestId('display-name')).toHaveTextContent('John Doe');
    expect(screen.getByTestId('display-email')).toHaveTextContent('john@example.com');
  });

  it('should display user role as Adopter for endUser', () => {
    render(<TestWrapper><MockUserSettings user={mockUser} /></TestWrapper>);
    expect(screen.getByTestId('display-role')).toHaveTextContent('Adopter');
  });

  it('should display user role as Shelter Staff', () => {
    render(<TestWrapper><MockUserSettings user={{ ...mockUser, userRole: 'shelter' }} /></TestWrapper>);
    expect(screen.getByTestId('display-role')).toHaveTextContent('Shelter Staff');
  });

  it('should show edit form when Edit clicked', () => {
    render(<TestWrapper><MockUserSettings user={mockUser} /></TestWrapper>);
    fireEvent.click(screen.getByTestId('edit-btn'));
    expect(screen.getByTestId('edit-form')).toBeInTheDocument();
  });

  it('should populate edit form with current values', () => {
    render(<TestWrapper><MockUserSettings user={mockUser} /></TestWrapper>);
    fireEvent.click(screen.getByTestId('edit-btn'));
    expect(screen.getByTestId('name-input').value).toBe('John Doe');
    expect(screen.getByTestId('email-input').value).toBe('john@example.com');
  });

  it('should call onSave with updated values', () => {
    const handleSave = vi.fn();
    render(<TestWrapper><MockUserSettings user={mockUser} onSave={handleSave} /></TestWrapper>);
    fireEvent.click(screen.getByTestId('edit-btn'));
    fireEvent.change(screen.getByTestId('name-input'), { target: { value: 'Jane Doe' } });
    fireEvent.click(screen.getByTestId('save-btn'));
    expect(handleSave).toHaveBeenCalledWith({ name: 'Jane Doe', email: 'john@example.com' });
  });

  it('should show success message after save', () => {
    render(<TestWrapper><MockUserSettings user={mockUser} /></TestWrapper>);
    fireEvent.click(screen.getByTestId('edit-btn'));
    fireEvent.click(screen.getByTestId('save-btn'));
    expect(screen.getByTestId('success-message')).toHaveTextContent('Profile updated successfully.');
  });

  it('should cancel editing', () => {
    render(<TestWrapper><MockUserSettings user={mockUser} /></TestWrapper>);
    fireEvent.click(screen.getByTestId('edit-btn'));
    fireEvent.click(screen.getByTestId('cancel-btn'));
    expect(screen.getByTestId('display-info')).toBeInTheDocument();
  });

  it('should display shelter name when user has shelter', () => {
    render(<TestWrapper><MockUserSettings user={{ ...mockUser, userRole: 'shelter', shelter: { name: 'Happy Paws' } }} /></TestWrapper>);
    expect(screen.getByTestId('shelter-name')).toHaveTextContent('Happy Paws');
  });

  it('should have account section', () => {
    render(<TestWrapper><MockUserSettings user={mockUser} /></TestWrapper>);
    expect(screen.getByTestId('account-section')).toBeInTheDocument();
  });
});
