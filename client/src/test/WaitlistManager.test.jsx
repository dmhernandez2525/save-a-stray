import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';

const mockEntries = [
  {
    _id: 'w1',
    animalId: 'animal1',
    shelterId: 'shelter1',
    userId: 'user1',
    userName: 'Alice Johnson',
    userEmail: 'alice@example.com',
    userPhone: '555-0101',
    position: 1,
    status: 'waiting',
    notes: 'Very interested in this dog',
    createdAt: '2024-02-01T00:00:00.000Z'
  },
  {
    _id: 'w2',
    animalId: 'animal1',
    shelterId: 'shelter1',
    userId: 'user2',
    userName: 'Bob Smith',
    userEmail: 'bob@example.com',
    userPhone: '',
    position: 2,
    status: 'waiting',
    notes: '',
    createdAt: '2024-02-05T00:00:00.000Z'
  },
  {
    _id: 'w3',
    animalId: 'animal2',
    shelterId: 'shelter1',
    userId: '',
    userName: 'Carol Davis',
    userEmail: 'carol@example.com',
    userPhone: '555-0303',
    position: 1,
    status: 'notified',
    notes: 'Called on 2/10',
    createdAt: '2024-01-20T00:00:00.000Z'
  },
  {
    _id: 'w4',
    animalId: 'animal3',
    shelterId: 'shelter1',
    userId: '',
    userName: 'Dave Wilson',
    userEmail: 'dave@example.com',
    userPhone: '',
    position: 1,
    status: 'expired',
    notes: '',
    createdAt: '2024-01-10T00:00:00.000Z'
  }
];

function MockWaitlistManager({ shelterId, initialData, initialLoading, initialError }) {
  const [showForm, setShowForm] = React.useState(false);
  const [entries, setEntries] = React.useState(initialData || []);
  const [loading] = React.useState(initialLoading || false);
  const [error] = React.useState(initialError || null);
  const [filterStatus, setFilterStatus] = React.useState('all');
  const [formData, setFormData] = React.useState({
    animalId: '', userName: '', userEmail: '', userPhone: '', notes: ''
  });

  const handleJoinWaitlist = () => {
    if (!formData.animalId.trim() || !formData.userName.trim() || !formData.userEmail.trim()) return;
    const maxPos = entries.filter(e => e.animalId === formData.animalId && e.status === 'waiting')
      .reduce((max, e) => Math.max(max, e.position), 0);
    const newEntry = {
      _id: `w${Date.now()}`,
      animalId: formData.animalId.trim(),
      shelterId,
      userId: '',
      userName: formData.userName.trim(),
      userEmail: formData.userEmail.trim(),
      userPhone: formData.userPhone.trim(),
      position: maxPos + 1,
      status: 'waiting',
      notes: formData.notes.trim(),
      createdAt: new Date().toISOString()
    };
    setEntries([...entries, newEntry]);
    setShowForm(false);
    setFormData({ animalId: '', userName: '', userEmail: '', userPhone: '', notes: '' });
  };

  const handleRemove = (id) => {
    setEntries(entries.filter(e => e._id !== id));
  };

  const handleUpdateStatus = (id, status) => {
    setEntries(entries.map(e => e._id === id ? { ...e, status } : e));
  };

  const filteredEntries = filterStatus === 'all' ? entries : entries.filter(e => e.status === filterStatus);
  const waitingCount = entries.filter(e => e.status === 'waiting').length;
  const notifiedCount = entries.filter(e => e.status === 'notified').length;

  return (
    <div data-testid="waitlist-manager">
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <h3>Waitlist Management</h3>
        {!showForm && (
          <button data-testid="add-waitlist-btn" onClick={() => setShowForm(true)}>Add to Waitlist</button>
        )}
      </div>

      {showForm && (
        <div data-testid="waitlist-form">
          <h4>Add to Waitlist</h4>
          <input data-testid="waitlist-animal-input" value={formData.animalId} onChange={e => setFormData({ ...formData, animalId: e.target.value })} placeholder="Animal ID" />
          <input data-testid="waitlist-name-input" value={formData.userName} onChange={e => setFormData({ ...formData, userName: e.target.value })} placeholder="Applicant name" />
          <input data-testid="waitlist-email-input" value={formData.userEmail} onChange={e => setFormData({ ...formData, userEmail: e.target.value })} placeholder="email@example.com" />
          <input data-testid="waitlist-phone-input" value={formData.userPhone} onChange={e => setFormData({ ...formData, userPhone: e.target.value })} placeholder="(555) 123-4567" />
          <input data-testid="waitlist-notes-input" value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} placeholder="Notes" />
          <button data-testid="submit-waitlist" onClick={handleJoinWaitlist}>Add to Waitlist</button>
          <button data-testid="cancel-waitlist" onClick={() => setShowForm(false)}>Cancel</button>
        </div>
      )}

      <div>
        {['all', 'waiting', 'notified', 'expired', 'adopted'].map(status => (
          <button key={status} data-testid={`filter-${status}`} onClick={() => setFilterStatus(status)}
            className={filterStatus === status ? 'active' : ''}>
            {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {loading && <p data-testid="loading">Loading waitlist...</p>}
      {error && <p data-testid="error">Error: {error.message}</p>}
      {!loading && !error && entries.length === 0 && (
        <p data-testid="empty">No waitlist entries yet.</p>
      )}

      {!loading && !error && entries.length > 0 && (
        <div>
          <div data-testid="waitlist-stats">
            <span data-testid="waiting-count">{waitingCount}</span>
            <span data-testid="notified-count">{notifiedCount}</span>
          </div>
          <div data-testid="waitlist-list">
            {filteredEntries.length === 0 ? (
              <p data-testid="filtered-empty">No entries with this status.</p>
            ) : (
              filteredEntries.map(entry => (
                <div key={entry._id} data-testid="waitlist-entry">
                  <span data-testid="waitlist-position">{entry.position}</span>
                  <span data-testid="waitlist-name">{entry.userName}</span>
                  <span data-testid="waitlist-status">
                    {entry.status === 'waiting' ? 'Waiting' : entry.status === 'notified' ? 'Notified' : entry.status === 'expired' ? 'Expired' : 'Adopted'}
                  </span>
                  <span data-testid="waitlist-email">{entry.userEmail}</span>
                  {entry.userPhone && <span data-testid="waitlist-phone">{entry.userPhone}</span>}
                  {entry.notes && <p data-testid="waitlist-notes">{entry.notes}</p>}
                  {entry.status === 'waiting' && (
                    <button data-testid="notify-btn" onClick={() => handleUpdateStatus(entry._id, 'notified')}>Notify</button>
                  )}
                  <button data-testid="remove-btn" onClick={() => handleRemove(entry._id)}>Remove</button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

describe('WaitlistManager', () => {
  describe('Loading State', () => {
    it('should show loading message', () => {
      render(<MockWaitlistManager shelterId="shelter1" initialLoading={true} />);
      expect(screen.getByTestId('loading')).toBeInTheDocument();
      expect(screen.getByText('Loading waitlist...')).toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('should show error message', () => {
      render(<MockWaitlistManager shelterId="shelter1" initialError={{ message: 'Network error' }} />);
      expect(screen.getByTestId('error')).toBeInTheDocument();
      expect(screen.getByText('Error: Network error')).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('should show empty message when no entries', () => {
      render(<MockWaitlistManager shelterId="shelter1" initialData={[]} />);
      expect(screen.getByTestId('empty')).toBeInTheDocument();
      expect(screen.getByText('No waitlist entries yet.')).toBeInTheDocument();
    });
  });

  describe('Waitlist Entries', () => {
    it('should render all entries', () => {
      render(<MockWaitlistManager shelterId="shelter1" initialData={mockEntries} />);
      const entries = screen.getAllByTestId('waitlist-entry');
      expect(entries).toHaveLength(4);
    });

    it('should display user names', () => {
      render(<MockWaitlistManager shelterId="shelter1" initialData={mockEntries} />);
      expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
      expect(screen.getByText('Bob Smith')).toBeInTheDocument();
      expect(screen.getByText('Carol Davis')).toBeInTheDocument();
      expect(screen.getByText('Dave Wilson')).toBeInTheDocument();
    });

    it('should display positions', () => {
      render(<MockWaitlistManager shelterId="shelter1" initialData={mockEntries} />);
      const positions = screen.getAllByTestId('waitlist-position');
      expect(positions[0]).toHaveTextContent('1');
      expect(positions[1]).toHaveTextContent('2');
    });

    it('should display status badges', () => {
      render(<MockWaitlistManager shelterId="shelter1" initialData={mockEntries} />);
      const statuses = screen.getAllByTestId('waitlist-status');
      expect(statuses[0]).toHaveTextContent('Waiting');
      expect(statuses[1]).toHaveTextContent('Waiting');
      expect(statuses[2]).toHaveTextContent('Notified');
      expect(statuses[3]).toHaveTextContent('Expired');
    });

    it('should display emails', () => {
      render(<MockWaitlistManager shelterId="shelter1" initialData={mockEntries} />);
      expect(screen.getByText('alice@example.com')).toBeInTheDocument();
      expect(screen.getByText('bob@example.com')).toBeInTheDocument();
    });

    it('should display phone when present', () => {
      render(<MockWaitlistManager shelterId="shelter1" initialData={mockEntries} />);
      expect(screen.getByText('555-0101')).toBeInTheDocument();
      expect(screen.getByText('555-0303')).toBeInTheDocument();
    });

    it('should display notes when present', () => {
      render(<MockWaitlistManager shelterId="shelter1" initialData={mockEntries} />);
      expect(screen.getByText('Very interested in this dog')).toBeInTheDocument();
      expect(screen.getByText('Called on 2/10')).toBeInTheDocument();
    });

    it('should not show phone when empty', () => {
      render(<MockWaitlistManager shelterId="shelter1" initialData={[mockEntries[1]]} />);
      expect(screen.queryByTestId('waitlist-phone')).not.toBeInTheDocument();
    });
  });

  describe('Stats Summary', () => {
    it('should show waiting count', () => {
      render(<MockWaitlistManager shelterId="shelter1" initialData={mockEntries} />);
      expect(screen.getByTestId('waiting-count')).toHaveTextContent('2');
    });

    it('should show notified count', () => {
      render(<MockWaitlistManager shelterId="shelter1" initialData={mockEntries} />);
      expect(screen.getByTestId('notified-count')).toHaveTextContent('1');
    });
  });

  describe('Status Filtering', () => {
    it('should show all entries by default', () => {
      render(<MockWaitlistManager shelterId="shelter1" initialData={mockEntries} />);
      expect(screen.getAllByTestId('waitlist-entry')).toHaveLength(4);
    });

    it('should filter by waiting status', async () => {
      render(<MockWaitlistManager shelterId="shelter1" initialData={mockEntries} />);
      fireEvent.click(screen.getByTestId('filter-waiting'));
      await waitFor(() => {
        expect(screen.getAllByTestId('waitlist-entry')).toHaveLength(2);
      });
    });

    it('should filter by notified status', async () => {
      render(<MockWaitlistManager shelterId="shelter1" initialData={mockEntries} />);
      fireEvent.click(screen.getByTestId('filter-notified'));
      await waitFor(() => {
        expect(screen.getAllByTestId('waitlist-entry')).toHaveLength(1);
      });
    });

    it('should show empty message when filter has no results', async () => {
      render(<MockWaitlistManager shelterId="shelter1" initialData={mockEntries} />);
      fireEvent.click(screen.getByTestId('filter-adopted'));
      await waitFor(() => {
        expect(screen.getByTestId('filtered-empty')).toBeInTheDocument();
      });
    });

    it('should show all entries when All filter clicked', async () => {
      render(<MockWaitlistManager shelterId="shelter1" initialData={mockEntries} />);
      fireEvent.click(screen.getByTestId('filter-waiting'));
      await waitFor(() => {
        expect(screen.getAllByTestId('waitlist-entry')).toHaveLength(2);
      });
      fireEvent.click(screen.getByTestId('filter-all'));
      await waitFor(() => {
        expect(screen.getAllByTestId('waitlist-entry')).toHaveLength(4);
      });
    });
  });

  describe('Add to Waitlist Form', () => {
    it('should show form when button clicked', () => {
      render(<MockWaitlistManager shelterId="shelter1" initialData={[]} />);
      fireEvent.click(screen.getByTestId('add-waitlist-btn'));
      expect(screen.getByTestId('waitlist-form')).toBeInTheDocument();
    });

    it('should hide form when Cancel clicked', () => {
      render(<MockWaitlistManager shelterId="shelter1" initialData={[]} />);
      fireEvent.click(screen.getByTestId('add-waitlist-btn'));
      fireEvent.click(screen.getByTestId('cancel-waitlist'));
      expect(screen.queryByTestId('waitlist-form')).not.toBeInTheDocument();
    });

    it('should add entry when form submitted with valid data', async () => {
      render(<MockWaitlistManager shelterId="shelter1" initialData={[]} />);
      fireEvent.click(screen.getByTestId('add-waitlist-btn'));
      fireEvent.change(screen.getByTestId('waitlist-animal-input'), { target: { value: 'animal1' } });
      fireEvent.change(screen.getByTestId('waitlist-name-input'), { target: { value: 'New Person' } });
      fireEvent.change(screen.getByTestId('waitlist-email-input'), { target: { value: 'new@example.com' } });
      fireEvent.click(screen.getByTestId('submit-waitlist'));
      await waitFor(() => {
        expect(screen.getByText('New Person')).toBeInTheDocument();
      });
    });

    it('should not submit with empty animal ID', () => {
      render(<MockWaitlistManager shelterId="shelter1" initialData={[]} />);
      fireEvent.click(screen.getByTestId('add-waitlist-btn'));
      fireEvent.change(screen.getByTestId('waitlist-name-input'), { target: { value: 'Test' } });
      fireEvent.change(screen.getByTestId('waitlist-email-input'), { target: { value: 'test@test.com' } });
      fireEvent.click(screen.getByTestId('submit-waitlist'));
      expect(screen.getByTestId('waitlist-form')).toBeInTheDocument();
      expect(screen.queryByTestId('waitlist-entry')).not.toBeInTheDocument();
    });

    it('should not submit with empty name', () => {
      render(<MockWaitlistManager shelterId="shelter1" initialData={[]} />);
      fireEvent.click(screen.getByTestId('add-waitlist-btn'));
      fireEvent.change(screen.getByTestId('waitlist-animal-input'), { target: { value: 'animal1' } });
      fireEvent.change(screen.getByTestId('waitlist-email-input'), { target: { value: 'test@test.com' } });
      fireEvent.click(screen.getByTestId('submit-waitlist'));
      expect(screen.getByTestId('waitlist-form')).toBeInTheDocument();
    });

    it('should not submit with empty email', () => {
      render(<MockWaitlistManager shelterId="shelter1" initialData={[]} />);
      fireEvent.click(screen.getByTestId('add-waitlist-btn'));
      fireEvent.change(screen.getByTestId('waitlist-animal-input'), { target: { value: 'animal1' } });
      fireEvent.change(screen.getByTestId('waitlist-name-input'), { target: { value: 'Test' } });
      fireEvent.click(screen.getByTestId('submit-waitlist'));
      expect(screen.getByTestId('waitlist-form')).toBeInTheDocument();
    });

    it('should assign correct position to new entries', async () => {
      render(<MockWaitlistManager shelterId="shelter1" initialData={[mockEntries[0]]} />);
      fireEvent.click(screen.getByTestId('add-waitlist-btn'));
      fireEvent.change(screen.getByTestId('waitlist-animal-input'), { target: { value: 'animal1' } });
      fireEvent.change(screen.getByTestId('waitlist-name-input'), { target: { value: 'New Entry' } });
      fireEvent.change(screen.getByTestId('waitlist-email-input'), { target: { value: 'new@test.com' } });
      fireEvent.click(screen.getByTestId('submit-waitlist'));
      await waitFor(() => {
        const positions = screen.getAllByTestId('waitlist-position');
        expect(positions[positions.length - 1]).toHaveTextContent('2');
      });
    });
  });

  describe('Status Actions', () => {
    it('should show Notify button for waiting entries', () => {
      render(<MockWaitlistManager shelterId="shelter1" initialData={[mockEntries[0]]} />);
      expect(screen.getByTestId('notify-btn')).toBeInTheDocument();
    });

    it('should not show Notify button for non-waiting entries', () => {
      render(<MockWaitlistManager shelterId="shelter1" initialData={[mockEntries[2]]} />);
      expect(screen.queryByTestId('notify-btn')).not.toBeInTheDocument();
    });

    it('should update status to notified when Notify clicked', async () => {
      render(<MockWaitlistManager shelterId="shelter1" initialData={[mockEntries[0]]} />);
      fireEvent.click(screen.getByTestId('notify-btn'));
      await waitFor(() => {
        expect(screen.getByTestId('waitlist-status')).toHaveTextContent('Notified');
      });
    });

    it('should show Remove button for all entries', () => {
      render(<MockWaitlistManager shelterId="shelter1" initialData={mockEntries} />);
      expect(screen.getAllByTestId('remove-btn')).toHaveLength(4);
    });

    it('should remove entry when Remove clicked', async () => {
      render(<MockWaitlistManager shelterId="shelter1" initialData={[mockEntries[0], mockEntries[1]]} />);
      const removeButtons = screen.getAllByTestId('remove-btn');
      fireEvent.click(removeButtons[0]);
      await waitFor(() => {
        expect(screen.getAllByTestId('waitlist-entry')).toHaveLength(1);
        expect(screen.getByText('Bob Smith')).toBeInTheDocument();
      });
    });
  });

  describe('Component Structure', () => {
    it('should render the waitlist manager container', () => {
      render(<MockWaitlistManager shelterId="shelter1" initialData={[]} />);
      expect(screen.getByTestId('waitlist-manager')).toBeInTheDocument();
    });

    it('should show title', () => {
      render(<MockWaitlistManager shelterId="shelter1" initialData={[]} />);
      expect(screen.getByText('Waitlist Management')).toBeInTheDocument();
    });

    it('should show Add to Waitlist button', () => {
      render(<MockWaitlistManager shelterId="shelter1" initialData={[]} />);
      expect(screen.getByTestId('add-waitlist-btn')).toBeInTheDocument();
    });

    it('should have filter buttons', () => {
      render(<MockWaitlistManager shelterId="shelter1" initialData={[]} />);
      expect(screen.getByTestId('filter-all')).toBeInTheDocument();
      expect(screen.getByTestId('filter-waiting')).toBeInTheDocument();
      expect(screen.getByTestId('filter-notified')).toBeInTheDocument();
      expect(screen.getByTestId('filter-expired')).toBeInTheDocument();
      expect(screen.getByTestId('filter-adopted')).toBeInTheDocument();
    });
  });
});
