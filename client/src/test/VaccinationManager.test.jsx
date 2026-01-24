import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

// Mock VaccinationManager component
const MockVaccinationManager = ({ shelterId, animals = [] }) => {
  const [showForm, setShowForm] = React.useState(false);
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [animalFilter, setAnimalFilter] = React.useState('all');
  const [formData, setFormData] = React.useState({
    vaccineName: '',
    animalId: '',
    batchNumber: '',
    administeredBy: '',
    administeredDate: '',
    expirationDate: '',
    notes: '',
  });

  const vaccinations = [
    {
      _id: 'vac-1',
      animalId: 'animal-1',
      shelterId,
      vaccineName: 'Rabies',
      batchNumber: 'RB-2024-001',
      administeredBy: 'Dr. Smith',
      administeredDate: '2024-06-15T00:00:00.000Z',
      expirationDate: '2025-06-15T00:00:00.000Z',
      status: 'current',
      notes: 'Annual booster',
      createdAt: '2024-06-15T00:00:00.000Z',
    },
    {
      _id: 'vac-2',
      animalId: 'animal-2',
      shelterId,
      vaccineName: 'Distemper',
      batchNumber: '',
      administeredBy: 'Dr. Jones',
      administeredDate: '2023-01-10T00:00:00.000Z',
      expirationDate: '2024-01-10T00:00:00.000Z',
      status: 'expired',
      notes: '',
      createdAt: '2023-01-10T00:00:00.000Z',
    },
    {
      _id: 'vac-3',
      animalId: 'animal-1',
      shelterId,
      vaccineName: 'Bordetella',
      batchNumber: 'BD-2024-050',
      administeredBy: '',
      administeredDate: '',
      expirationDate: '',
      status: 'due',
      notes: 'Needs scheduling',
      createdAt: '2024-08-01T00:00:00.000Z',
    },
  ];

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

  let filtered = vaccinations;
  if (statusFilter !== 'all') {
    filtered = filtered.filter((v) => v.status === statusFilter);
  }
  if (animalFilter !== 'all') {
    filtered = filtered.filter((v) => v.animalId === animalFilter);
  }

  const STATUS_STYLES = {
    current: 'bg-green-500',
    expired: 'bg-red-500',
    due: 'bg-yellow-500',
  };

  const STATUS_LABELS = {
    current: 'Current',
    expired: 'Expired',
    due: 'Due',
  };

  return (
    <div data-testid="vaccination-manager">
      <div className="flex items-center justify-between mb-4">
        <h2>Vaccination Records</h2>
        <button
          data-testid="toggle-form-btn"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancel' : '+ Add Vaccination'}
        </button>
      </div>

      {showForm && (
        <div data-testid="vaccination-form">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!formData.vaccineName || !formData.animalId) return;
              setShowForm(false);
              setFormData({
                vaccineName: '',
                animalId: '',
                batchNumber: '',
                administeredBy: '',
                administeredDate: '',
                expirationDate: '',
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
            <input
              data-testid="vaccine-name-input"
              type="text"
              value={formData.vaccineName}
              onChange={(e) => setFormData({ ...formData, vaccineName: e.target.value })}
              placeholder="e.g. Rabies"
              required
            />
            <input
              data-testid="batch-number-input"
              type="text"
              value={formData.batchNumber}
              onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
              placeholder="Optional"
            />
            <input
              data-testid="administered-by-input"
              type="text"
              value={formData.administeredBy}
              onChange={(e) => setFormData({ ...formData, administeredBy: e.target.value })}
              placeholder="e.g. Dr. Smith"
            />
            <input
              data-testid="administered-date-input"
              type="date"
              value={formData.administeredDate}
              onChange={(e) => setFormData({ ...formData, administeredDate: e.target.value })}
            />
            <input
              data-testid="expiration-date-input"
              type="date"
              value={formData.expirationDate}
              onChange={(e) => setFormData({ ...formData, expirationDate: e.target.value })}
            />
            <textarea
              data-testid="notes-input"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Optional notes"
            />
            <button type="submit" data-testid="save-vaccination-btn">Save Vaccination</button>
          </form>
        </div>
      )}

      <div className="flex gap-2 mb-4" data-testid="status-filters">
        {['all', 'current', 'due', 'expired'].map((filter) => (
          <button
            key={filter}
            data-testid={`filter-${filter}`}
            onClick={() => setStatusFilter(filter)}
            className={statusFilter === filter ? 'active' : ''}
          >
            {filter === 'all' ? 'All' : STATUS_LABELS[filter]}
          </button>
        ))}
        {animals.length > 0 && (
          <select
            data-testid="animal-filter"
            value={animalFilter}
            onChange={(e) => setAnimalFilter(e.target.value)}
          >
            <option value="all">All Animals</option>
            {animals.map((a) => (
              <option key={a._id} value={a._id}>{a.name}</option>
            ))}
          </select>
        )}
      </div>

      <div data-testid="vaccination-list">
        {filtered.length === 0 ? (
          <p data-testid="empty-message">No vaccination records found.</p>
        ) : (
          filtered.map((vac) => (
            <div key={vac._id} data-testid={`vaccination-${vac._id}`} className="vaccination-row">
              <span data-testid={`vaccine-name-${vac._id}`}>{vac.vaccineName}</span>
              <span data-testid={`vaccine-status-${vac._id}`} className={STATUS_STYLES[vac.status]}>
                {STATUS_LABELS[vac.status]}
              </span>
              <span data-testid={`vaccine-animal-${vac._id}`}>{getAnimalName(vac.animalId)}</span>
              {vac.administeredBy && (
                <span data-testid={`vaccine-vet-${vac._id}`}>by {vac.administeredBy}</span>
              )}
              <span data-testid={`vaccine-date-${vac._id}`}>
                Administered: {formatDate(vac.administeredDate)}
              </span>
              {vac.expirationDate && (
                <span data-testid={`vaccine-expiry-${vac._id}`}>
                  Expires: {formatDate(vac.expirationDate)}
                </span>
              )}
              {vac.batchNumber && (
                <span data-testid={`vaccine-batch-${vac._id}`}>Batch: {vac.batchNumber}</span>
              )}
              {vac.notes && (
                <span data-testid={`vaccine-notes-${vac._id}`}>{vac.notes}</span>
              )}
              <select
                data-testid={`status-select-${vac._id}`}
                value={vac.status}
                onChange={() => {}}
              >
                <option value="current">Current</option>
                <option value="expired">Expired</option>
                <option value="due">Due</option>
              </select>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

describe('VaccinationManager Component', () => {
  const defaultAnimals = [
    { _id: 'animal-1', name: 'Buddy' },
    { _id: 'animal-2', name: 'Max' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render the vaccination manager', () => {
      render(<MockVaccinationManager shelterId="shelter-1" animals={defaultAnimals} />);
      expect(screen.getByTestId('vaccination-manager')).toBeInTheDocument();
    });

    it('should display the title', () => {
      render(<MockVaccinationManager shelterId="shelter-1" animals={defaultAnimals} />);
      expect(screen.getByText('Vaccination Records')).toBeInTheDocument();
    });

    it('should display add vaccination button', () => {
      render(<MockVaccinationManager shelterId="shelter-1" animals={defaultAnimals} />);
      expect(screen.getByText('+ Add Vaccination')).toBeInTheDocument();
    });

    it('should display status filter buttons', () => {
      render(<MockVaccinationManager shelterId="shelter-1" animals={defaultAnimals} />);
      expect(screen.getByTestId('filter-all')).toBeInTheDocument();
      expect(screen.getByTestId('filter-current')).toBeInTheDocument();
      expect(screen.getByTestId('filter-due')).toBeInTheDocument();
      expect(screen.getByTestId('filter-expired')).toBeInTheDocument();
    });

    it('should display animal filter dropdown', () => {
      render(<MockVaccinationManager shelterId="shelter-1" animals={defaultAnimals} />);
      expect(screen.getByTestId('animal-filter')).toBeInTheDocument();
    });

    it('should not display animal filter when no animals', () => {
      render(<MockVaccinationManager shelterId="shelter-1" animals={[]} />);
      expect(screen.queryByTestId('animal-filter')).not.toBeInTheDocument();
    });
  });

  describe('Vaccination List', () => {
    it('should display all vaccinations initially', () => {
      render(<MockVaccinationManager shelterId="shelter-1" animals={defaultAnimals} />);
      expect(screen.getByTestId('vaccination-vac-1')).toBeInTheDocument();
      expect(screen.getByTestId('vaccination-vac-2')).toBeInTheDocument();
      expect(screen.getByTestId('vaccination-vac-3')).toBeInTheDocument();
    });

    it('should display vaccine names', () => {
      render(<MockVaccinationManager shelterId="shelter-1" animals={defaultAnimals} />);
      expect(screen.getByText('Rabies')).toBeInTheDocument();
      expect(screen.getByText('Distemper')).toBeInTheDocument();
      expect(screen.getByText('Bordetella')).toBeInTheDocument();
    });

    it('should display vaccination status badges', () => {
      render(<MockVaccinationManager shelterId="shelter-1" animals={defaultAnimals} />);
      expect(screen.getByTestId('vaccine-status-vac-1')).toHaveTextContent('Current');
      expect(screen.getByTestId('vaccine-status-vac-2')).toHaveTextContent('Expired');
      expect(screen.getByTestId('vaccine-status-vac-3')).toHaveTextContent('Due');
    });

    it('should display animal names for vaccinations', () => {
      render(<MockVaccinationManager shelterId="shelter-1" animals={defaultAnimals} />);
      expect(screen.getByTestId('vaccine-animal-vac-1')).toHaveTextContent('Buddy');
      expect(screen.getByTestId('vaccine-animal-vac-2')).toHaveTextContent('Max');
    });

    it('should display vet information when available', () => {
      render(<MockVaccinationManager shelterId="shelter-1" animals={defaultAnimals} />);
      expect(screen.getByTestId('vaccine-vet-vac-1')).toHaveTextContent('by Dr. Smith');
      expect(screen.getByTestId('vaccine-vet-vac-2')).toHaveTextContent('by Dr. Jones');
      expect(screen.queryByTestId('vaccine-vet-vac-3')).not.toBeInTheDocument();
    });

    it('should display batch numbers when available', () => {
      render(<MockVaccinationManager shelterId="shelter-1" animals={defaultAnimals} />);
      expect(screen.getByTestId('vaccine-batch-vac-1')).toHaveTextContent('Batch: RB-2024-001');
      expect(screen.queryByTestId('vaccine-batch-vac-2')).not.toBeInTheDocument();
      expect(screen.getByTestId('vaccine-batch-vac-3')).toHaveTextContent('Batch: BD-2024-050');
    });

    it('should display notes when available', () => {
      render(<MockVaccinationManager shelterId="shelter-1" animals={defaultAnimals} />);
      expect(screen.getByTestId('vaccine-notes-vac-1')).toHaveTextContent('Annual booster');
      expect(screen.queryByTestId('vaccine-notes-vac-2')).not.toBeInTheDocument();
      expect(screen.getByTestId('vaccine-notes-vac-3')).toHaveTextContent('Needs scheduling');
    });

    it('should display status change dropdown for each vaccination', () => {
      render(<MockVaccinationManager shelterId="shelter-1" animals={defaultAnimals} />);
      expect(screen.getByTestId('status-select-vac-1')).toBeInTheDocument();
      expect(screen.getByTestId('status-select-vac-2')).toBeInTheDocument();
      expect(screen.getByTestId('status-select-vac-3')).toBeInTheDocument();
    });
  });

  describe('Status Filtering', () => {
    it('should filter by current status', () => {
      render(<MockVaccinationManager shelterId="shelter-1" animals={defaultAnimals} />);
      fireEvent.click(screen.getByTestId('filter-current'));
      expect(screen.getByTestId('vaccination-vac-1')).toBeInTheDocument();
      expect(screen.queryByTestId('vaccination-vac-2')).not.toBeInTheDocument();
      expect(screen.queryByTestId('vaccination-vac-3')).not.toBeInTheDocument();
    });

    it('should filter by expired status', () => {
      render(<MockVaccinationManager shelterId="shelter-1" animals={defaultAnimals} />);
      fireEvent.click(screen.getByTestId('filter-expired'));
      expect(screen.queryByTestId('vaccination-vac-1')).not.toBeInTheDocument();
      expect(screen.getByTestId('vaccination-vac-2')).toBeInTheDocument();
      expect(screen.queryByTestId('vaccination-vac-3')).not.toBeInTheDocument();
    });

    it('should filter by due status', () => {
      render(<MockVaccinationManager shelterId="shelter-1" animals={defaultAnimals} />);
      fireEvent.click(screen.getByTestId('filter-due'));
      expect(screen.queryByTestId('vaccination-vac-1')).not.toBeInTheDocument();
      expect(screen.queryByTestId('vaccination-vac-2')).not.toBeInTheDocument();
      expect(screen.getByTestId('vaccination-vac-3')).toBeInTheDocument();
    });

    it('should show all vaccinations when All filter clicked', () => {
      render(<MockVaccinationManager shelterId="shelter-1" animals={defaultAnimals} />);
      fireEvent.click(screen.getByTestId('filter-expired'));
      fireEvent.click(screen.getByTestId('filter-all'));
      expect(screen.getByTestId('vaccination-vac-1')).toBeInTheDocument();
      expect(screen.getByTestId('vaccination-vac-2')).toBeInTheDocument();
      expect(screen.getByTestId('vaccination-vac-3')).toBeInTheDocument();
    });

    it('should display empty message when no records match filter', () => {
      render(<MockVaccinationManager shelterId="shelter-1" animals={defaultAnimals} />);
      // Filter by animal that has no vaccinations
      fireEvent.change(screen.getByTestId('animal-filter'), { target: { value: 'animal-999' } });
      expect(screen.getByTestId('empty-message')).toBeInTheDocument();
    });
  });

  describe('Animal Filtering', () => {
    it('should filter by specific animal', () => {
      render(<MockVaccinationManager shelterId="shelter-1" animals={defaultAnimals} />);
      fireEvent.change(screen.getByTestId('animal-filter'), { target: { value: 'animal-1' } });
      expect(screen.getByTestId('vaccination-vac-1')).toBeInTheDocument();
      expect(screen.queryByTestId('vaccination-vac-2')).not.toBeInTheDocument();
      expect(screen.getByTestId('vaccination-vac-3')).toBeInTheDocument();
    });

    it('should show all animals when All Animals selected', () => {
      render(<MockVaccinationManager shelterId="shelter-1" animals={defaultAnimals} />);
      fireEvent.change(screen.getByTestId('animal-filter'), { target: { value: 'animal-1' } });
      fireEvent.change(screen.getByTestId('animal-filter'), { target: { value: 'all' } });
      expect(screen.getByTestId('vaccination-vac-1')).toBeInTheDocument();
      expect(screen.getByTestId('vaccination-vac-2')).toBeInTheDocument();
      expect(screen.getByTestId('vaccination-vac-3')).toBeInTheDocument();
    });
  });

  describe('Add Vaccination Form', () => {
    it('should not show form initially', () => {
      render(<MockVaccinationManager shelterId="shelter-1" animals={defaultAnimals} />);
      expect(screen.queryByTestId('vaccination-form')).not.toBeInTheDocument();
    });

    it('should show form when add button clicked', () => {
      render(<MockVaccinationManager shelterId="shelter-1" animals={defaultAnimals} />);
      fireEvent.click(screen.getByTestId('toggle-form-btn'));
      expect(screen.getByTestId('vaccination-form')).toBeInTheDocument();
    });

    it('should hide form when cancel clicked', () => {
      render(<MockVaccinationManager shelterId="shelter-1" animals={defaultAnimals} />);
      fireEvent.click(screen.getByTestId('toggle-form-btn'));
      expect(screen.getByTestId('vaccination-form')).toBeInTheDocument();
      fireEvent.click(screen.getByTestId('toggle-form-btn'));
      expect(screen.queryByTestId('vaccination-form')).not.toBeInTheDocument();
    });

    it('should display button text as Cancel when form is open', () => {
      render(<MockVaccinationManager shelterId="shelter-1" animals={defaultAnimals} />);
      fireEvent.click(screen.getByTestId('toggle-form-btn'));
      expect(screen.getByTestId('toggle-form-btn')).toHaveTextContent('Cancel');
    });

    it('should render all form fields', () => {
      render(<MockVaccinationManager shelterId="shelter-1" animals={defaultAnimals} />);
      fireEvent.click(screen.getByTestId('toggle-form-btn'));
      expect(screen.getByTestId('animal-select')).toBeInTheDocument();
      expect(screen.getByTestId('vaccine-name-input')).toBeInTheDocument();
      expect(screen.getByTestId('batch-number-input')).toBeInTheDocument();
      expect(screen.getByTestId('administered-by-input')).toBeInTheDocument();
      expect(screen.getByTestId('administered-date-input')).toBeInTheDocument();
      expect(screen.getByTestId('expiration-date-input')).toBeInTheDocument();
      expect(screen.getByTestId('notes-input')).toBeInTheDocument();
      expect(screen.getByTestId('save-vaccination-btn')).toBeInTheDocument();
    });

    it('should display animal options in select', () => {
      render(<MockVaccinationManager shelterId="shelter-1" animals={defaultAnimals} />);
      fireEvent.click(screen.getByTestId('toggle-form-btn'));
      const select = screen.getByTestId('animal-select');
      expect(select).toContainHTML('Buddy');
      expect(select).toContainHTML('Max');
    });

    it('should update vaccine name input', () => {
      render(<MockVaccinationManager shelterId="shelter-1" animals={defaultAnimals} />);
      fireEvent.click(screen.getByTestId('toggle-form-btn'));
      const input = screen.getByTestId('vaccine-name-input');
      fireEvent.change(input, { target: { value: 'Parvovirus' } });
      expect(input.value).toBe('Parvovirus');
    });

    it('should update batch number input', () => {
      render(<MockVaccinationManager shelterId="shelter-1" animals={defaultAnimals} />);
      fireEvent.click(screen.getByTestId('toggle-form-btn'));
      const input = screen.getByTestId('batch-number-input');
      fireEvent.change(input, { target: { value: 'PV-2024-100' } });
      expect(input.value).toBe('PV-2024-100');
    });

    it('should update administered by input', () => {
      render(<MockVaccinationManager shelterId="shelter-1" animals={defaultAnimals} />);
      fireEvent.click(screen.getByTestId('toggle-form-btn'));
      const input = screen.getByTestId('administered-by-input');
      fireEvent.change(input, { target: { value: 'Dr. Wilson' } });
      expect(input.value).toBe('Dr. Wilson');
    });

    it('should update notes input', () => {
      render(<MockVaccinationManager shelterId="shelter-1" animals={defaultAnimals} />);
      fireEvent.click(screen.getByTestId('toggle-form-btn'));
      const input = screen.getByTestId('notes-input');
      fireEvent.change(input, { target: { value: 'First dose' } });
      expect(input.value).toBe('First dose');
    });

    it('should select an animal from dropdown', () => {
      render(<MockVaccinationManager shelterId="shelter-1" animals={defaultAnimals} />);
      fireEvent.click(screen.getByTestId('toggle-form-btn'));
      const select = screen.getByTestId('animal-select');
      fireEvent.change(select, { target: { value: 'animal-1' } });
      expect(select.value).toBe('animal-1');
    });
  });

  describe('Date Display', () => {
    it('should format administered dates', () => {
      render(<MockVaccinationManager shelterId="shelter-1" animals={defaultAnimals} />);
      const dateEl = screen.getByTestId('vaccine-date-vac-1');
      expect(dateEl.textContent).toContain('Administered:');
      expect(dateEl.textContent).not.toContain('N/A');
    });

    it('should show N/A for missing dates', () => {
      render(<MockVaccinationManager shelterId="shelter-1" animals={defaultAnimals} />);
      const dateEl = screen.getByTestId('vaccine-date-vac-3');
      expect(dateEl.textContent).toContain('N/A');
    });

    it('should display expiration dates when available', () => {
      render(<MockVaccinationManager shelterId="shelter-1" animals={defaultAnimals} />);
      expect(screen.getByTestId('vaccine-expiry-vac-1')).toBeInTheDocument();
      expect(screen.getByTestId('vaccine-expiry-vac-2')).toBeInTheDocument();
      expect(screen.queryByTestId('vaccine-expiry-vac-3')).not.toBeInTheDocument();
    });
  });
});
