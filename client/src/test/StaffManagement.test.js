import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';

describe('Staff Management', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const MockStaffManagement = ({ staff = [], onAddStaff, onRemoveStaff }) => {
    const [email, setEmail] = React.useState('');
    const [error, setError] = React.useState('');
    const [success, setSuccess] = React.useState('');

    const handleAdd = () => {
      if (!email.trim()) return;
      if (onAddStaff) {
        const result = onAddStaff(email.trim());
        if (result && result.error) {
          setError(result.error);
        } else {
          setEmail('');
          setError('');
          setSuccess('Staff member added successfully.');
        }
      }
    };

    return (
      <div data-testid="staff-management">
        <h3 data-testid="staff-title">Staff Members</h3>

        {staff.length === 0 ? (
          <p data-testid="empty-message">No staff members yet. Add team members by their email address.</p>
        ) : (
          <div data-testid="staff-list">
            {staff.map(member => (
              <div key={member._id} data-testid={`staff-member-${member._id}`} className="staff-row">
                <span data-testid={`staff-name-${member._id}`}>{member.name}</span>
                <span data-testid={`staff-email-${member._id}`}>{member.email}</span>
                <button
                  data-testid={`remove-btn-${member._id}`}
                  onClick={() => onRemoveStaff && onRemoveStaff(member._id)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}

        {error && <p data-testid="error-message">{error}</p>}
        {success && <p data-testid="success-message">{success}</p>}

        <div data-testid="add-staff-form">
          <input
            data-testid="email-input"
            type="email"
            placeholder="Enter staff member's email"
            value={email}
            onChange={e => { setEmail(e.target.value); setError(''); }}
          />
          <button
            data-testid="add-staff-btn"
            disabled={!email.trim()}
            onClick={handleAdd}
          >
            Add Staff
          </button>
        </div>
      </div>
    );
  };

  const mockStaff = [
    { _id: 'user-1', name: 'Alice Smith', email: 'alice@example.com' },
    { _id: 'user-2', name: 'Bob Johnson', email: 'bob@example.com' }
  ];

  it('should render staff management title', () => {
    render(<MemoryRouter><MockStaffManagement /></MemoryRouter>);
    expect(screen.getByTestId('staff-title')).toHaveTextContent('Staff Members');
  });

  it('should show empty message when no staff', () => {
    render(<MemoryRouter><MockStaffManagement staff={[]} /></MemoryRouter>);
    expect(screen.getByTestId('empty-message')).toHaveTextContent('No staff members yet');
  });

  it('should display staff members', () => {
    render(<MemoryRouter><MockStaffManagement staff={mockStaff} /></MemoryRouter>);
    expect(screen.getByTestId('staff-name-user-1')).toHaveTextContent('Alice Smith');
    expect(screen.getByTestId('staff-email-user-1')).toHaveTextContent('alice@example.com');
    expect(screen.getByTestId('staff-name-user-2')).toHaveTextContent('Bob Johnson');
  });

  it('should show remove button for each staff member', () => {
    render(<MemoryRouter><MockStaffManagement staff={mockStaff} /></MemoryRouter>);
    expect(screen.getByTestId('remove-btn-user-1')).toBeInTheDocument();
    expect(screen.getByTestId('remove-btn-user-2')).toBeInTheDocument();
  });

  it('should call onRemoveStaff when remove is clicked', () => {
    const handleRemove = vi.fn();
    render(<MemoryRouter><MockStaffManagement staff={mockStaff} onRemoveStaff={handleRemove} /></MemoryRouter>);
    fireEvent.click(screen.getByTestId('remove-btn-user-1'));
    expect(handleRemove).toHaveBeenCalledWith('user-1');
  });

  it('should render email input and add button', () => {
    render(<MemoryRouter><MockStaffManagement /></MemoryRouter>);
    expect(screen.getByTestId('email-input')).toBeInTheDocument();
    expect(screen.getByTestId('add-staff-btn')).toBeInTheDocument();
  });

  it('should have disabled add button when email is empty', () => {
    render(<MemoryRouter><MockStaffManagement /></MemoryRouter>);
    expect(screen.getByTestId('add-staff-btn')).toBeDisabled();
  });

  it('should enable add button when email is entered', () => {
    render(<MemoryRouter><MockStaffManagement /></MemoryRouter>);
    fireEvent.change(screen.getByTestId('email-input'), { target: { value: 'new@example.com' } });
    expect(screen.getByTestId('add-staff-btn')).not.toBeDisabled();
  });

  it('should call onAddStaff with email when add is clicked', () => {
    const handleAdd = vi.fn(() => ({}));
    render(<MemoryRouter><MockStaffManagement onAddStaff={handleAdd} /></MemoryRouter>);
    fireEvent.change(screen.getByTestId('email-input'), { target: { value: 'new@example.com' } });
    fireEvent.click(screen.getByTestId('add-staff-btn'));
    expect(handleAdd).toHaveBeenCalledWith('new@example.com');
  });

  it('should clear email and show success after successful add', () => {
    const handleAdd = vi.fn(() => ({}));
    render(<MemoryRouter><MockStaffManagement onAddStaff={handleAdd} /></MemoryRouter>);
    fireEvent.change(screen.getByTestId('email-input'), { target: { value: 'new@example.com' } });
    fireEvent.click(screen.getByTestId('add-staff-btn'));
    expect(screen.getByTestId('email-input').value).toBe('');
    expect(screen.getByTestId('success-message')).toHaveTextContent('Staff member added successfully.');
  });

  it('should show error message on failed add', () => {
    const handleAdd = vi.fn(() => ({ error: 'User not found with that email' }));
    render(<MemoryRouter><MockStaffManagement onAddStaff={handleAdd} /></MemoryRouter>);
    fireEvent.change(screen.getByTestId('email-input'), { target: { value: 'notfound@example.com' } });
    fireEvent.click(screen.getByTestId('add-staff-btn'));
    expect(screen.getByTestId('error-message')).toHaveTextContent('User not found with that email');
  });

  it('should clear error when typing new email', () => {
    const handleAdd = vi.fn(() => ({ error: 'User not found' }));
    render(<MemoryRouter><MockStaffManagement onAddStaff={handleAdd} /></MemoryRouter>);
    fireEvent.change(screen.getByTestId('email-input'), { target: { value: 'bad@email.com' } });
    fireEvent.click(screen.getByTestId('add-staff-btn'));
    expect(screen.getByTestId('error-message')).toBeInTheDocument();
    fireEvent.change(screen.getByTestId('email-input'), { target: { value: 'new@email.com' } });
    expect(screen.queryByTestId('error-message')).not.toBeInTheDocument();
  });

  it('should have correct placeholder text', () => {
    render(<MemoryRouter><MockStaffManagement /></MemoryRouter>);
    expect(screen.getByTestId('email-input')).toHaveAttribute('placeholder', "Enter staff member's email");
  });

  it('should render staff list container when staff exist', () => {
    render(<MemoryRouter><MockStaffManagement staff={mockStaff} /></MemoryRouter>);
    expect(screen.getByTestId('staff-list')).toBeInTheDocument();
  });
});
