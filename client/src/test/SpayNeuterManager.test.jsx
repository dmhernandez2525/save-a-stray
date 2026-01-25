import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

const MockSpayNeuterManager = ({ shelterId, animals = [] }) => {
  const [showForm, setShowForm] = React.useState(false);
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [formData, setFormData] = React.useState({
    animalId: '',
    procedureType: 'spay',
    scheduledDate: '',
    veterinarian: '',
    clinic: '',
    notes: '',
  });

  const records = [
    {
      _id: 'sn-1',
      animalId: 'animal-1',
      shelterId,
      procedureType: 'spay',
      status: 'scheduled',
      scheduledDate: '2024-07-20T00:00:00.000Z',
      completedDate: '',
      veterinarian: 'Dr. Smith',
      clinic: 'Happy Paws Clinic',
      notes: 'Pre-op checkup done',
      createdAt: '2024-07-01T00:00:00.000Z',
    },
    {
      _id: 'sn-2',
      animalId: 'animal-2',
      shelterId,
      procedureType: 'neuter',
      status: 'completed',
      scheduledDate: '2024-06-15T00:00:00.000Z',
      completedDate: '2024-06-15T00:00:00.000Z',
      veterinarian: 'Dr. Jones',
      clinic: '',
      notes: '',
      createdAt: '2024-06-01T00:00:00.000Z',
    },
    {
      _id: 'sn-3',
      animalId: 'animal-3',
      shelterId,
      procedureType: 'spay',
      status: 'cancelled',
      scheduledDate: '2024-05-10T00:00:00.000Z',
      completedDate: '',
      veterinarian: '',
      clinic: 'City Vet',
      notes: 'Animal too young',
      createdAt: '2024-05-01T00:00:00.000Z',
    },
  ];

  const STATUS_STYLES = {
    scheduled: 'bg-yellow-500',
    completed: 'bg-green-500',
    cancelled: 'bg-red-500',
  };

  const STATUS_LABELS = {
    scheduled: 'Scheduled',
    completed: 'Completed',
    cancelled: 'Cancelled',
  };

  const getAnimalName = (animalId) => {
    const animal = animals.find((a) => a._id === animalId);
    return animal?.name || 'Unknown';
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return 'N/A';
    return date.toLocaleDateString();
  };

  let filtered = records;
  if (statusFilter !== 'all') {
    filtered = filtered.filter((r) => r.status === statusFilter);
  }

  return (
    <div data-testid="spay-neuter-manager">
      <div className="flex items-center justify-between mb-4">
        <h2>Spay/Neuter Records</h2>
        <button
          data-testid="toggle-form-btn"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancel' : '+ Schedule'}
        </button>
      </div>

      {showForm && (
        <div data-testid="schedule-form">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!formData.animalId || !formData.procedureType) return;
              setShowForm(false);
              setFormData({
                animalId: '',
                procedureType: 'spay',
                scheduledDate: '',
                veterinarian: '',
                clinic: '',
                notes: '',
              });
            }}
          >
            <select
              data-testid="animal-select"
              value={formData.animalId}
              onChange={(e) => setFormData({ ...formData, animalId: e.target.value })}
              required
            >
              <option value="">Select animal</option>
              {animals.map((a) => (
                <option key={a._id} value={a._id}>{a.name}</option>
              ))}
            </select>
            <select
              data-testid="procedure-select"
              value={formData.procedureType}
              onChange={(e) => setFormData({ ...formData, procedureType: e.target.value })}
              required
            >
              <option value="spay">Spay</option>
              <option value="neuter">Neuter</option>
            </select>
            <input
              data-testid="scheduled-date-input"
              type="date"
              value={formData.scheduledDate}
              onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
            />
            <input
              data-testid="veterinarian-input"
              type="text"
              value={formData.veterinarian}
              onChange={(e) => setFormData({ ...formData, veterinarian: e.target.value })}
              placeholder="e.g. Dr. Smith"
            />
            <input
              data-testid="clinic-input"
              type="text"
              value={formData.clinic}
              onChange={(e) => setFormData({ ...formData, clinic: e.target.value })}
              placeholder="Clinic name"
            />
            <input
              data-testid="notes-input"
              type="text"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Optional notes"
            />
            <button type="submit" data-testid="submit-btn">Schedule Procedure</button>
          </form>
        </div>
      )}

      <div data-testid="status-filters">
        {['all', 'scheduled', 'completed', 'cancelled'].map((filter) => (
          <button
            key={filter}
            data-testid={`filter-${filter}`}
            onClick={() => setStatusFilter(filter)}
            className={statusFilter === filter ? 'active' : ''}
          >
            {filter === 'all' ? 'All' : STATUS_LABELS[filter]}
          </button>
        ))}
      </div>

      <div data-testid="record-list">
        {filtered.length === 0 ? (
          <p data-testid="empty-message">No spay/neuter records found.</p>
        ) : (
          filtered.map((record) => (
            <div key={record._id} data-testid={`record-${record._id}`} className="record-row">
              <span data-testid={`record-animal-${record._id}`}>{getAnimalName(record.animalId)}</span>
              <span data-testid={`record-procedure-${record._id}`}>{record.procedureType}</span>
              <span data-testid={`record-status-${record._id}`} className={STATUS_STYLES[record.status]}>
                {STATUS_LABELS[record.status]}
              </span>
              {record.scheduledDate && (
                <span data-testid={`record-scheduled-${record._id}`}>Scheduled: {formatDate(record.scheduledDate)}</span>
              )}
              {record.completedDate && (
                <span data-testid={`record-completed-${record._id}`}>Completed: {formatDate(record.completedDate)}</span>
              )}
              {record.veterinarian && (
                <span data-testid={`record-vet-${record._id}`}>Vet: {record.veterinarian}</span>
              )}
              {record.clinic && (
                <span data-testid={`record-clinic-${record._id}`}>Clinic: {record.clinic}</span>
              )}
              {record.notes && (
                <span data-testid={`record-notes-${record._id}`}>{record.notes}</span>
              )}
              {record.status === 'scheduled' && (
                <div data-testid={`record-actions-${record._id}`}>
                  <button data-testid={`complete-btn-${record._id}`}>Complete</button>
                  <button data-testid={`cancel-btn-${record._id}`}>Cancel</button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

describe('SpayNeuterManager Component', () => {
  const defaultAnimals = [
    { _id: 'animal-1', name: 'Bella' },
    { _id: 'animal-2', name: 'Charlie' },
    { _id: 'animal-3', name: 'Daisy' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render the spay neuter manager', () => {
      render(<MockSpayNeuterManager shelterId="shelter-1" animals={defaultAnimals} />);
      expect(screen.getByTestId('spay-neuter-manager')).toBeInTheDocument();
    });

    it('should display the title', () => {
      render(<MockSpayNeuterManager shelterId="shelter-1" animals={defaultAnimals} />);
      expect(screen.getByText('Spay/Neuter Records')).toBeInTheDocument();
    });

    it('should display schedule button', () => {
      render(<MockSpayNeuterManager shelterId="shelter-1" animals={defaultAnimals} />);
      expect(screen.getByText('+ Schedule')).toBeInTheDocument();
    });

    it('should display status filter buttons', () => {
      render(<MockSpayNeuterManager shelterId="shelter-1" animals={defaultAnimals} />);
      expect(screen.getByTestId('filter-all')).toBeInTheDocument();
      expect(screen.getByTestId('filter-scheduled')).toBeInTheDocument();
      expect(screen.getByTestId('filter-completed')).toBeInTheDocument();
      expect(screen.getByTestId('filter-cancelled')).toBeInTheDocument();
    });
  });

  describe('Record List', () => {
    it('should display all records initially', () => {
      render(<MockSpayNeuterManager shelterId="shelter-1" animals={defaultAnimals} />);
      expect(screen.getByTestId('record-sn-1')).toBeInTheDocument();
      expect(screen.getByTestId('record-sn-2')).toBeInTheDocument();
      expect(screen.getByTestId('record-sn-3')).toBeInTheDocument();
    });

    it('should display animal names', () => {
      render(<MockSpayNeuterManager shelterId="shelter-1" animals={defaultAnimals} />);
      expect(screen.getByTestId('record-animal-sn-1')).toHaveTextContent('Bella');
      expect(screen.getByTestId('record-animal-sn-2')).toHaveTextContent('Charlie');
      expect(screen.getByTestId('record-animal-sn-3')).toHaveTextContent('Daisy');
    });

    it('should display procedure types', () => {
      render(<MockSpayNeuterManager shelterId="shelter-1" animals={defaultAnimals} />);
      expect(screen.getByTestId('record-procedure-sn-1')).toHaveTextContent('spay');
      expect(screen.getByTestId('record-procedure-sn-2')).toHaveTextContent('neuter');
      expect(screen.getByTestId('record-procedure-sn-3')).toHaveTextContent('spay');
    });

    it('should display status badges', () => {
      render(<MockSpayNeuterManager shelterId="shelter-1" animals={defaultAnimals} />);
      expect(screen.getByTestId('record-status-sn-1')).toHaveTextContent('Scheduled');
      expect(screen.getByTestId('record-status-sn-2')).toHaveTextContent('Completed');
      expect(screen.getByTestId('record-status-sn-3')).toHaveTextContent('Cancelled');
    });

    it('should display veterinarian when available', () => {
      render(<MockSpayNeuterManager shelterId="shelter-1" animals={defaultAnimals} />);
      expect(screen.getByTestId('record-vet-sn-1')).toHaveTextContent('Vet: Dr. Smith');
      expect(screen.getByTestId('record-vet-sn-2')).toHaveTextContent('Vet: Dr. Jones');
      expect(screen.queryByTestId('record-vet-sn-3')).not.toBeInTheDocument();
    });

    it('should display clinic when available', () => {
      render(<MockSpayNeuterManager shelterId="shelter-1" animals={defaultAnimals} />);
      expect(screen.getByTestId('record-clinic-sn-1')).toHaveTextContent('Clinic: Happy Paws Clinic');
      expect(screen.queryByTestId('record-clinic-sn-2')).not.toBeInTheDocument();
      expect(screen.getByTestId('record-clinic-sn-3')).toHaveTextContent('Clinic: City Vet');
    });

    it('should display notes when available', () => {
      render(<MockSpayNeuterManager shelterId="shelter-1" animals={defaultAnimals} />);
      expect(screen.getByTestId('record-notes-sn-1')).toHaveTextContent('Pre-op checkup done');
      expect(screen.queryByTestId('record-notes-sn-2')).not.toBeInTheDocument();
      expect(screen.getByTestId('record-notes-sn-3')).toHaveTextContent('Animal too young');
    });

    it('should show action buttons only for scheduled records', () => {
      render(<MockSpayNeuterManager shelterId="shelter-1" animals={defaultAnimals} />);
      expect(screen.getByTestId('record-actions-sn-1')).toBeInTheDocument();
      expect(screen.queryByTestId('record-actions-sn-2')).not.toBeInTheDocument();
      expect(screen.queryByTestId('record-actions-sn-3')).not.toBeInTheDocument();
    });

    it('should show Complete and Cancel buttons for scheduled', () => {
      render(<MockSpayNeuterManager shelterId="shelter-1" animals={defaultAnimals} />);
      expect(screen.getByTestId('complete-btn-sn-1')).toBeInTheDocument();
      expect(screen.getByTestId('cancel-btn-sn-1')).toBeInTheDocument();
    });
  });

  describe('Status Filtering', () => {
    it('should filter by scheduled status', () => {
      render(<MockSpayNeuterManager shelterId="shelter-1" animals={defaultAnimals} />);
      fireEvent.click(screen.getByTestId('filter-scheduled'));
      expect(screen.getByTestId('record-sn-1')).toBeInTheDocument();
      expect(screen.queryByTestId('record-sn-2')).not.toBeInTheDocument();
      expect(screen.queryByTestId('record-sn-3')).not.toBeInTheDocument();
    });

    it('should filter by completed status', () => {
      render(<MockSpayNeuterManager shelterId="shelter-1" animals={defaultAnimals} />);
      fireEvent.click(screen.getByTestId('filter-completed'));
      expect(screen.queryByTestId('record-sn-1')).not.toBeInTheDocument();
      expect(screen.getByTestId('record-sn-2')).toBeInTheDocument();
      expect(screen.queryByTestId('record-sn-3')).not.toBeInTheDocument();
    });

    it('should filter by cancelled status', () => {
      render(<MockSpayNeuterManager shelterId="shelter-1" animals={defaultAnimals} />);
      fireEvent.click(screen.getByTestId('filter-cancelled'));
      expect(screen.queryByTestId('record-sn-1')).not.toBeInTheDocument();
      expect(screen.queryByTestId('record-sn-2')).not.toBeInTheDocument();
      expect(screen.getByTestId('record-sn-3')).toBeInTheDocument();
    });

    it('should show all when All filter clicked', () => {
      render(<MockSpayNeuterManager shelterId="shelter-1" animals={defaultAnimals} />);
      fireEvent.click(screen.getByTestId('filter-cancelled'));
      fireEvent.click(screen.getByTestId('filter-all'));
      expect(screen.getByTestId('record-sn-1')).toBeInTheDocument();
      expect(screen.getByTestId('record-sn-2')).toBeInTheDocument();
      expect(screen.getByTestId('record-sn-3')).toBeInTheDocument();
    });
  });

  describe('Schedule Form', () => {
    it('should not show form initially', () => {
      render(<MockSpayNeuterManager shelterId="shelter-1" animals={defaultAnimals} />);
      expect(screen.queryByTestId('schedule-form')).not.toBeInTheDocument();
    });

    it('should show form when schedule button clicked', () => {
      render(<MockSpayNeuterManager shelterId="shelter-1" animals={defaultAnimals} />);
      fireEvent.click(screen.getByTestId('toggle-form-btn'));
      expect(screen.getByTestId('schedule-form')).toBeInTheDocument();
    });

    it('should hide form when cancel clicked', () => {
      render(<MockSpayNeuterManager shelterId="shelter-1" animals={defaultAnimals} />);
      fireEvent.click(screen.getByTestId('toggle-form-btn'));
      expect(screen.getByTestId('schedule-form')).toBeInTheDocument();
      fireEvent.click(screen.getByTestId('toggle-form-btn'));
      expect(screen.queryByTestId('schedule-form')).not.toBeInTheDocument();
    });

    it('should show Cancel text when form is open', () => {
      render(<MockSpayNeuterManager shelterId="shelter-1" animals={defaultAnimals} />);
      fireEvent.click(screen.getByTestId('toggle-form-btn'));
      expect(screen.getByTestId('toggle-form-btn')).toHaveTextContent('Cancel');
    });

    it('should render all form fields', () => {
      render(<MockSpayNeuterManager shelterId="shelter-1" animals={defaultAnimals} />);
      fireEvent.click(screen.getByTestId('toggle-form-btn'));
      expect(screen.getByTestId('animal-select')).toBeInTheDocument();
      expect(screen.getByTestId('procedure-select')).toBeInTheDocument();
      expect(screen.getByTestId('scheduled-date-input')).toBeInTheDocument();
      expect(screen.getByTestId('veterinarian-input')).toBeInTheDocument();
      expect(screen.getByTestId('clinic-input')).toBeInTheDocument();
      expect(screen.getByTestId('notes-input')).toBeInTheDocument();
      expect(screen.getByTestId('submit-btn')).toBeInTheDocument();
    });

    it('should display animal options in select', () => {
      render(<MockSpayNeuterManager shelterId="shelter-1" animals={defaultAnimals} />);
      fireEvent.click(screen.getByTestId('toggle-form-btn'));
      const select = screen.getByTestId('animal-select');
      expect(select).toContainHTML('Bella');
      expect(select).toContainHTML('Charlie');
      expect(select).toContainHTML('Daisy');
    });

    it('should have spay and neuter procedure options', () => {
      render(<MockSpayNeuterManager shelterId="shelter-1" animals={defaultAnimals} />);
      fireEvent.click(screen.getByTestId('toggle-form-btn'));
      const select = screen.getByTestId('procedure-select');
      expect(select).toContainHTML('Spay');
      expect(select).toContainHTML('Neuter');
    });

    it('should default procedure to spay', () => {
      render(<MockSpayNeuterManager shelterId="shelter-1" animals={defaultAnimals} />);
      fireEvent.click(screen.getByTestId('toggle-form-btn'));
      expect(screen.getByTestId('procedure-select').value).toBe('spay');
    });

    it('should update veterinarian input', () => {
      render(<MockSpayNeuterManager shelterId="shelter-1" animals={defaultAnimals} />);
      fireEvent.click(screen.getByTestId('toggle-form-btn'));
      const input = screen.getByTestId('veterinarian-input');
      fireEvent.change(input, { target: { value: 'Dr. Wilson' } });
      expect(input.value).toBe('Dr. Wilson');
    });

    it('should update clinic input', () => {
      render(<MockSpayNeuterManager shelterId="shelter-1" animals={defaultAnimals} />);
      fireEvent.click(screen.getByTestId('toggle-form-btn'));
      const input = screen.getByTestId('clinic-input');
      fireEvent.change(input, { target: { value: 'Animal Care Center' } });
      expect(input.value).toBe('Animal Care Center');
    });

    it('should update notes input', () => {
      render(<MockSpayNeuterManager shelterId="shelter-1" animals={defaultAnimals} />);
      fireEvent.click(screen.getByTestId('toggle-form-btn'));
      const input = screen.getByTestId('notes-input');
      fireEvent.change(input, { target: { value: 'Needs fasting' } });
      expect(input.value).toBe('Needs fasting');
    });

    it('should change procedure selection', () => {
      render(<MockSpayNeuterManager shelterId="shelter-1" animals={defaultAnimals} />);
      fireEvent.click(screen.getByTestId('toggle-form-btn'));
      const select = screen.getByTestId('procedure-select');
      fireEvent.change(select, { target: { value: 'neuter' } });
      expect(select.value).toBe('neuter');
    });
  });

  describe('Date Display', () => {
    it('should display scheduled dates', () => {
      render(<MockSpayNeuterManager shelterId="shelter-1" animals={defaultAnimals} />);
      expect(screen.getByTestId('record-scheduled-sn-1')).toBeInTheDocument();
      expect(screen.getByTestId('record-scheduled-sn-2')).toBeInTheDocument();
      expect(screen.getByTestId('record-scheduled-sn-3')).toBeInTheDocument();
    });

    it('should display completed date when available', () => {
      render(<MockSpayNeuterManager shelterId="shelter-1" animals={defaultAnimals} />);
      expect(screen.queryByTestId('record-completed-sn-1')).not.toBeInTheDocument();
      expect(screen.getByTestId('record-completed-sn-2')).toBeInTheDocument();
      expect(screen.queryByTestId('record-completed-sn-3')).not.toBeInTheDocument();
    });
  });
});
