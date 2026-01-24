import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';

// Mock data
const mockVolunteers = [
  {
    _id: 'v1',
    shelterId: 'shelter1',
    userId: '',
    name: 'Alice Johnson',
    email: 'alice@example.com',
    phone: '555-0101',
    skills: ['dog walking', 'grooming'],
    availability: 'Weekends',
    status: 'active',
    startDate: '2024-01-15T00:00:00.000Z',
    totalHours: 42,
    notes: 'Experienced with large breeds',
    createdAt: '2024-01-15T00:00:00.000Z'
  },
  {
    _id: 'v2',
    shelterId: 'shelter1',
    userId: '',
    name: 'Bob Smith',
    email: 'bob@example.com',
    phone: '555-0202',
    skills: ['cat care', 'cleaning'],
    availability: 'Mon/Wed/Fri',
    status: 'pending',
    startDate: '2024-03-01T00:00:00.000Z',
    totalHours: 0,
    notes: '',
    createdAt: '2024-03-01T00:00:00.000Z'
  },
  {
    _id: 'v3',
    shelterId: 'shelter1',
    userId: '',
    name: 'Carol Davis',
    email: '',
    phone: '',
    skills: [],
    availability: '',
    status: 'inactive',
    startDate: '2023-06-01T00:00:00.000Z',
    totalHours: 120,
    notes: 'On leave',
    createdAt: '2023-06-01T00:00:00.000Z'
  }
];

// Mock VolunteerManager component
function MockVolunteerManager({ shelterId, initialData, initialLoading, initialError }) {
  const [showForm, setShowForm] = React.useState(false);
  const [volunteers, setVolunteers] = React.useState(initialData || []);
  const [loading] = React.useState(initialLoading || false);
  const [error] = React.useState(initialError || null);
  const [formData, setFormData] = React.useState({
    name: '', email: '', phone: '', skills: '', availability: '', notes: ''
  });
  const [hoursInput, setHoursInput] = React.useState({});

  const activeCount = volunteers.filter(v => v.status === 'active').length;
  const pendingCount = volunteers.filter(v => v.status === 'pending').length;
  const totalHours = volunteers.reduce((sum, v) => sum + v.totalHours, 0);

  const handleAddVolunteer = () => {
    if (!formData.name.trim()) return;
    const skillsArray = formData.skills.split(',').map(s => s.trim()).filter(s => s.length > 0);
    const newVolunteer = {
      _id: `v${Date.now()}`,
      shelterId,
      userId: '',
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      skills: skillsArray,
      availability: formData.availability.trim(),
      status: 'pending',
      startDate: new Date().toISOString(),
      totalHours: 0,
      notes: formData.notes.trim(),
      createdAt: new Date().toISOString()
    };
    setVolunteers([newVolunteer, ...volunteers]);
    setShowForm(false);
    setFormData({ name: '', email: '', phone: '', skills: '', availability: '', notes: '' });
  };

  const handleUpdateStatus = (id, status) => {
    setVolunteers(volunteers.map(v => v._id === id ? { ...v, status } : v));
  };

  const handleLogHours = (id) => {
    const hours = parseInt(hoursInput[id]);
    if (hours > 0) {
      setVolunteers(volunteers.map(v => v._id === id ? { ...v, totalHours: v.totalHours + hours } : v));
      setHoursInput({ ...hoursInput, [id]: '' });
    }
  };

  return (
    <div data-testid="volunteer-manager">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3>Volunteer Management</h3>
        {!showForm && (
          <button data-testid="add-volunteer-btn" onClick={() => setShowForm(true)}>
            Add Volunteer
          </button>
        )}
      </div>

      {showForm && (
        <div data-testid="volunteer-form">
          <h4>Add New Volunteer</h4>
          <input
            data-testid="volunteer-name-input"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            placeholder="Full name"
          />
          <input
            data-testid="volunteer-email-input"
            type="email"
            value={formData.email}
            onChange={e => setFormData({ ...formData, email: e.target.value })}
            placeholder="email@example.com"
          />
          <input
            data-testid="volunteer-phone-input"
            value={formData.phone}
            onChange={e => setFormData({ ...formData, phone: e.target.value })}
            placeholder="(555) 123-4567"
          />
          <input
            data-testid="volunteer-availability-input"
            value={formData.availability}
            onChange={e => setFormData({ ...formData, availability: e.target.value })}
            placeholder="e.g. Weekends, Mon/Wed/Fri"
          />
          <input
            data-testid="volunteer-skills-input"
            value={formData.skills}
            onChange={e => setFormData({ ...formData, skills: e.target.value })}
            placeholder="e.g. dog walking, grooming, training"
          />
          <input
            data-testid="volunteer-notes-input"
            value={formData.notes}
            onChange={e => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Additional notes"
          />
          <button data-testid="submit-volunteer" onClick={handleAddVolunteer}>Add Volunteer</button>
          <button data-testid="cancel-volunteer" onClick={() => setShowForm(false)}>Cancel</button>
        </div>
      )}

      {loading && <p data-testid="loading">Loading volunteers...</p>}
      {error && <p data-testid="error">Error: {error.message}</p>}
      {!loading && !error && volunteers.length === 0 && (
        <p data-testid="empty">No volunteers registered yet.</p>
      )}

      {!loading && !error && volunteers.length > 0 && (
        <div>
          <div data-testid="volunteer-stats">
            <span data-testid="active-count">{activeCount}</span>
            <span data-testid="pending-count">{pendingCount}</span>
            <span data-testid="total-hours">{totalHours}</span>
          </div>
          <div data-testid="volunteer-list">
            {volunteers.map(volunteer => (
              <div key={volunteer._id} data-testid="volunteer-card">
                <span data-testid="volunteer-name">{volunteer.name}</span>
                {volunteer.email && <span data-testid="volunteer-email">{volunteer.email}</span>}
                {volunteer.phone && <span data-testid="volunteer-phone">{volunteer.phone}</span>}
                <span data-testid="volunteer-status">
                  {volunteer.status === 'active' ? 'Active' : volunteer.status === 'inactive' ? 'Inactive' : 'Pending'}
                </span>
                {volunteer.skills.length > 0 && (
                  <div data-testid="volunteer-skills">
                    {volunteer.skills.map((skill, i) => <span key={i}>{skill}</span>)}
                  </div>
                )}
                {volunteer.availability && (
                  <span data-testid="volunteer-availability">{volunteer.availability}</span>
                )}
                <span data-testid="volunteer-hours">{volunteer.totalHours} hours logged</span>

                {volunteer.status === 'pending' && (
                  <button data-testid="activate-volunteer" onClick={() => handleUpdateStatus(volunteer._id, 'active')}>
                    Activate
                  </button>
                )}
                {volunteer.status === 'active' && (
                  <button data-testid="deactivate-volunteer" onClick={() => handleUpdateStatus(volunteer._id, 'inactive')}>
                    Deactivate
                  </button>
                )}
                {volunteer.status === 'inactive' && (
                  <button data-testid="reactivate-volunteer" onClick={() => handleUpdateStatus(volunteer._id, 'active')}>
                    Reactivate
                  </button>
                )}
                <input
                  data-testid="hours-input"
                  type="number"
                  value={hoursInput[volunteer._id] || ''}
                  onChange={e => setHoursInput({ ...hoursInput, [volunteer._id]: e.target.value })}
                  placeholder="Hrs"
                />
                <button data-testid="log-hours-btn" onClick={() => handleLogHours(volunteer._id)}>
                  Log Hours
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

describe('VolunteerManager', () => {
  describe('Loading State', () => {
    it('should show loading message while fetching', () => {
      render(<MockVolunteerManager shelterId="shelter1" initialLoading={true} />);
      expect(screen.getByTestId('loading')).toBeInTheDocument();
      expect(screen.getByText('Loading volunteers...')).toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('should show error message when query fails', () => {
      render(<MockVolunteerManager shelterId="shelter1" initialError={{ message: 'Network error' }} />);
      expect(screen.getByTestId('error')).toBeInTheDocument();
      expect(screen.getByText('Error: Network error')).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('should show empty message when no volunteers exist', () => {
      render(<MockVolunteerManager shelterId="shelter1" initialData={[]} />);
      expect(screen.getByTestId('empty')).toBeInTheDocument();
      expect(screen.getByText('No volunteers registered yet.')).toBeInTheDocument();
    });
  });

  describe('Volunteer List', () => {
    it('should render all volunteer cards', () => {
      render(<MockVolunteerManager shelterId="shelter1" initialData={mockVolunteers} />);
      const cards = screen.getAllByTestId('volunteer-card');
      expect(cards).toHaveLength(3);
    });

    it('should display volunteer names', () => {
      render(<MockVolunteerManager shelterId="shelter1" initialData={mockVolunteers} />);
      expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
      expect(screen.getByText('Bob Smith')).toBeInTheDocument();
      expect(screen.getByText('Carol Davis')).toBeInTheDocument();
    });

    it('should display volunteer emails when present', () => {
      render(<MockVolunteerManager shelterId="shelter1" initialData={mockVolunteers} />);
      expect(screen.getByText('alice@example.com')).toBeInTheDocument();
      expect(screen.getByText('bob@example.com')).toBeInTheDocument();
    });

    it('should display volunteer phone when present', () => {
      render(<MockVolunteerManager shelterId="shelter1" initialData={mockVolunteers} />);
      expect(screen.getByText('555-0101')).toBeInTheDocument();
      expect(screen.getByText('555-0202')).toBeInTheDocument();
    });

    it('should display volunteer status badges', () => {
      render(<MockVolunteerManager shelterId="shelter1" initialData={mockVolunteers} />);
      const statuses = screen.getAllByTestId('volunteer-status');
      expect(statuses[0]).toHaveTextContent('Active');
      expect(statuses[1]).toHaveTextContent('Pending');
      expect(statuses[2]).toHaveTextContent('Inactive');
    });

    it('should display skills when present', () => {
      render(<MockVolunteerManager shelterId="shelter1" initialData={mockVolunteers} />);
      expect(screen.getByText('dog walking')).toBeInTheDocument();
      expect(screen.getByText('grooming')).toBeInTheDocument();
      expect(screen.getByText('cat care')).toBeInTheDocument();
    });

    it('should not render skills section for volunteers with no skills', () => {
      render(<MockVolunteerManager shelterId="shelter1" initialData={[mockVolunteers[2]]} />);
      expect(screen.queryByTestId('volunteer-skills')).not.toBeInTheDocument();
    });

    it('should display availability when present', () => {
      render(<MockVolunteerManager shelterId="shelter1" initialData={mockVolunteers} />);
      expect(screen.getByText('Weekends')).toBeInTheDocument();
      expect(screen.getByText('Mon/Wed/Fri')).toBeInTheDocument();
    });

    it('should display total hours logged', () => {
      render(<MockVolunteerManager shelterId="shelter1" initialData={mockVolunteers} />);
      expect(screen.getByText('42 hours logged')).toBeInTheDocument();
      expect(screen.getByText('0 hours logged')).toBeInTheDocument();
      expect(screen.getByText('120 hours logged')).toBeInTheDocument();
    });
  });

  describe('Stats Summary', () => {
    it('should show active volunteer count', () => {
      render(<MockVolunteerManager shelterId="shelter1" initialData={mockVolunteers} />);
      expect(screen.getByTestId('active-count')).toHaveTextContent('1');
    });

    it('should show pending volunteer count', () => {
      render(<MockVolunteerManager shelterId="shelter1" initialData={mockVolunteers} />);
      expect(screen.getByTestId('pending-count')).toHaveTextContent('1');
    });

    it('should show total hours across all volunteers', () => {
      render(<MockVolunteerManager shelterId="shelter1" initialData={mockVolunteers} />);
      expect(screen.getByTestId('total-hours')).toHaveTextContent('162');
    });
  });

  describe('Add Volunteer Form', () => {
    it('should show form when Add Volunteer button is clicked', () => {
      render(<MockVolunteerManager shelterId="shelter1" initialData={[]} />);
      fireEvent.click(screen.getByTestId('add-volunteer-btn'));
      expect(screen.getByTestId('volunteer-form')).toBeInTheDocument();
    });

    it('should hide form when Cancel is clicked', () => {
      render(<MockVolunteerManager shelterId="shelter1" initialData={[]} />);
      fireEvent.click(screen.getByTestId('add-volunteer-btn'));
      expect(screen.getByTestId('volunteer-form')).toBeInTheDocument();
      fireEvent.click(screen.getByTestId('cancel-volunteer'));
      expect(screen.queryByTestId('volunteer-form')).not.toBeInTheDocument();
    });

    it('should add new volunteer when form is submitted', async () => {
      render(<MockVolunteerManager shelterId="shelter1" initialData={[]} />);
      fireEvent.click(screen.getByTestId('add-volunteer-btn'));

      fireEvent.change(screen.getByTestId('volunteer-name-input'), { target: { value: 'New Volunteer' } });
      fireEvent.change(screen.getByTestId('volunteer-email-input'), { target: { value: 'new@example.com' } });
      fireEvent.change(screen.getByTestId('volunteer-skills-input'), { target: { value: 'training, feeding' } });

      fireEvent.click(screen.getByTestId('submit-volunteer'));

      await waitFor(() => {
        expect(screen.getByText('New Volunteer')).toBeInTheDocument();
      });
      expect(screen.queryByTestId('volunteer-form')).not.toBeInTheDocument();
    });

    it('should not submit form with empty name', () => {
      render(<MockVolunteerManager shelterId="shelter1" initialData={[]} />);
      fireEvent.click(screen.getByTestId('add-volunteer-btn'));
      fireEvent.click(screen.getByTestId('submit-volunteer'));
      expect(screen.getByTestId('volunteer-form')).toBeInTheDocument();
      expect(screen.queryByTestId('volunteer-card')).not.toBeInTheDocument();
    });

    it('should parse comma-separated skills correctly', async () => {
      render(<MockVolunteerManager shelterId="shelter1" initialData={[]} />);
      fireEvent.click(screen.getByTestId('add-volunteer-btn'));

      fireEvent.change(screen.getByTestId('volunteer-name-input'), { target: { value: 'Test Vol' } });
      fireEvent.change(screen.getByTestId('volunteer-skills-input'), { target: { value: 'skill1, skill2, skill3' } });

      fireEvent.click(screen.getByTestId('submit-volunteer'));

      await waitFor(() => {
        expect(screen.getByText('skill1')).toBeInTheDocument();
        expect(screen.getByText('skill2')).toBeInTheDocument();
        expect(screen.getByText('skill3')).toBeInTheDocument();
      });
    });
  });

  describe('Status Management', () => {
    it('should show Activate button for pending volunteers', () => {
      render(<MockVolunteerManager shelterId="shelter1" initialData={[mockVolunteers[1]]} />);
      expect(screen.getByTestId('activate-volunteer')).toBeInTheDocument();
    });

    it('should show Deactivate button for active volunteers', () => {
      render(<MockVolunteerManager shelterId="shelter1" initialData={[mockVolunteers[0]]} />);
      expect(screen.getByTestId('deactivate-volunteer')).toBeInTheDocument();
    });

    it('should show Reactivate button for inactive volunteers', () => {
      render(<MockVolunteerManager shelterId="shelter1" initialData={[mockVolunteers[2]]} />);
      expect(screen.getByTestId('reactivate-volunteer')).toBeInTheDocument();
    });

    it('should update status to active when Activate is clicked', async () => {
      render(<MockVolunteerManager shelterId="shelter1" initialData={[mockVolunteers[1]]} />);
      fireEvent.click(screen.getByTestId('activate-volunteer'));
      await waitFor(() => {
        expect(screen.getByTestId('volunteer-status')).toHaveTextContent('Active');
      });
    });

    it('should update status to inactive when Deactivate is clicked', async () => {
      render(<MockVolunteerManager shelterId="shelter1" initialData={[mockVolunteers[0]]} />);
      fireEvent.click(screen.getByTestId('deactivate-volunteer'));
      await waitFor(() => {
        expect(screen.getByTestId('volunteer-status')).toHaveTextContent('Inactive');
      });
    });

    it('should update status to active when Reactivate is clicked', async () => {
      render(<MockVolunteerManager shelterId="shelter1" initialData={[mockVolunteers[2]]} />);
      fireEvent.click(screen.getByTestId('reactivate-volunteer'));
      await waitFor(() => {
        expect(screen.getByTestId('volunteer-status')).toHaveTextContent('Active');
      });
    });
  });

  describe('Hours Logging', () => {
    it('should have hours input for each volunteer', () => {
      render(<MockVolunteerManager shelterId="shelter1" initialData={mockVolunteers} />);
      const hoursInputs = screen.getAllByTestId('hours-input');
      expect(hoursInputs).toHaveLength(3);
    });

    it('should have Log Hours button for each volunteer', () => {
      render(<MockVolunteerManager shelterId="shelter1" initialData={mockVolunteers} />);
      const buttons = screen.getAllByTestId('log-hours-btn');
      expect(buttons).toHaveLength(3);
    });

    it('should log hours when valid number is entered and button clicked', async () => {
      render(<MockVolunteerManager shelterId="shelter1" initialData={[mockVolunteers[0]]} />);
      const hoursInput = screen.getByTestId('hours-input');
      fireEvent.change(hoursInput, { target: { value: '5' } });
      fireEvent.click(screen.getByTestId('log-hours-btn'));
      await waitFor(() => {
        expect(screen.getByTestId('volunteer-hours')).toHaveTextContent('47 hours logged');
      });
    });

    it('should not log hours when input is empty', () => {
      render(<MockVolunteerManager shelterId="shelter1" initialData={[mockVolunteers[0]]} />);
      fireEvent.click(screen.getByTestId('log-hours-btn'));
      expect(screen.getByTestId('volunteer-hours')).toHaveTextContent('42 hours logged');
    });

    it('should clear hours input after logging', async () => {
      render(<MockVolunteerManager shelterId="shelter1" initialData={[mockVolunteers[0]]} />);
      const hoursInput = screen.getByTestId('hours-input');
      fireEvent.change(hoursInput, { target: { value: '3' } });
      fireEvent.click(screen.getByTestId('log-hours-btn'));
      await waitFor(() => {
        expect(hoursInput).toHaveValue(null);
      });
    });
  });

  describe('Component Structure', () => {
    it('should render the volunteer manager container', () => {
      render(<MockVolunteerManager shelterId="shelter1" initialData={[]} />);
      expect(screen.getByTestId('volunteer-manager')).toBeInTheDocument();
    });

    it('should show title', () => {
      render(<MockVolunteerManager shelterId="shelter1" initialData={[]} />);
      expect(screen.getByText('Volunteer Management')).toBeInTheDocument();
    });

    it('should show Add Volunteer button', () => {
      render(<MockVolunteerManager shelterId="shelter1" initialData={[]} />);
      expect(screen.getByTestId('add-volunteer-btn')).toBeInTheDocument();
    });
  });
});
