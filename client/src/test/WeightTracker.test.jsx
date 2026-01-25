import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React, { useState } from 'react';

// Mock WeightTracker component
const UNIT_LABELS = {
  lbs: "lbs",
  kg: "kg",
};

const MockWeightTracker = ({ shelterId, animals = [], initialRecords = [] }) => {
  const [records, setRecords] = useState(initialRecords);
  const [showForm, setShowForm] = useState(false);
  const [animalFilter, setAnimalFilter] = useState("all");
  const [formData, setFormData] = useState({
    animalId: "",
    weight: "",
    unit: "lbs",
    recordedAt: "",
    recordedBy: "",
    notes: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.animalId || !formData.weight) return;
    const newRecord = {
      _id: `record-${Date.now()}`,
      ...formData,
      weight: parseFloat(formData.weight),
      shelterId,
      createdAt: new Date().toISOString(),
    };
    setRecords([newRecord, ...records]);
    setShowForm(false);
    setFormData({
      animalId: "",
      weight: "",
      unit: "lbs",
      recordedAt: "",
      recordedBy: "",
      notes: "",
    });
  };

  const handleDelete = (id) => {
    setRecords(records.filter(r => r._id !== id));
  };

  const filteredRecords = animalFilter === "all"
    ? records
    : records.filter(r => r.animalId === animalFilter);

  const getAnimalName = (animalId) => {
    const animal = animals.find(a => a._id === animalId);
    return animal?.name || "Unknown";
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "N/A";
    return date.toLocaleDateString();
  };

  return (
    <div data-testid="weight-tracker">
      <div className="header">
        <h2>Weight Tracking</h2>
        <button onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "+ Record Weight"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} data-testid="weight-form">
          <select
            value={formData.animalId}
            onChange={(e) => setFormData({ ...formData, animalId: e.target.value })}
            data-testid="animal-select"
            required
          >
            <option value="">Select animal</option>
            {animals.map((a) => (
              <option key={a._id} value={a._id}>{a.name}</option>
            ))}
          </select>
          <input
            type="number"
            step="0.1"
            value={formData.weight}
            onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
            data-testid="weight-input"
            placeholder="Weight"
            required
          />
          <select
            value={formData.unit}
            onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
            data-testid="unit-select"
          >
            <option value="lbs">lbs</option>
            <option value="kg">kg</option>
          </select>
          <input
            type="date"
            value={formData.recordedAt}
            onChange={(e) => setFormData({ ...formData, recordedAt: e.target.value })}
            data-testid="date-input"
          />
          <input
            type="text"
            value={formData.recordedBy}
            onChange={(e) => setFormData({ ...formData, recordedBy: e.target.value })}
            placeholder="Recorded by"
            data-testid="recorded-by-input"
          />
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Notes"
            data-testid="notes-input"
          />
          <button type="submit">Save Weight Record</button>
        </form>
      )}

      <div className="filters" data-testid="animal-filters">
        <button
          onClick={() => setAnimalFilter("all")}
          className={animalFilter === "all" ? "active" : ""}
        >
          All Animals
        </button>
        {animals.map((animal) => (
          <button
            key={animal._id}
            onClick={() => setAnimalFilter(animal._id)}
            className={animalFilter === animal._id ? "active" : ""}
          >
            {animal.name}
          </button>
        ))}
      </div>

      <div className="records-list" data-testid="records-list">
        {filteredRecords.length === 0 ? (
          <p>No weight records found.</p>
        ) : (
          filteredRecords.map((record) => (
            <div key={record._id} className="record-row" data-testid={`record-${record._id}`}>
              <span className="animal-name">{getAnimalName(record.animalId)}</span>
              <span className="weight">{record.weight} {UNIT_LABELS[record.unit]}</span>
              <span className="date">{formatDate(record.recordedAt)}</span>
              {record.recordedBy && <span className="recorded-by">Recorded by: {record.recordedBy}</span>}
              {record.notes && <span className="notes">{record.notes}</span>}
              <button onClick={() => handleDelete(record._id)} data-testid={`delete-${record._id}`}>
                Delete
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

describe('WeightTracker', () => {
  const mockAnimals = [
    { _id: 'animal-1', name: 'Max' },
    { _id: 'animal-2', name: 'Luna' },
    { _id: 'animal-3', name: 'Charlie' },
  ];

  const mockRecords = [
    {
      _id: 'record-1',
      animalId: 'animal-1',
      shelterId: 'shelter-1',
      weight: 25.5,
      unit: 'lbs',
      recordedAt: '2024-01-15',
      recordedBy: 'John Staff',
      notes: 'Healthy weight',
      createdAt: '2024-01-15T10:00:00Z',
    },
    {
      _id: 'record-2',
      animalId: 'animal-1',
      shelterId: 'shelter-1',
      weight: 24.0,
      unit: 'lbs',
      recordedAt: '2024-01-08',
      recordedBy: 'Jane Staff',
      notes: 'Initial weigh-in',
      createdAt: '2024-01-08T14:00:00Z',
    },
    {
      _id: 'record-3',
      animalId: 'animal-2',
      shelterId: 'shelter-1',
      weight: 15.2,
      unit: 'kg',
      recordedAt: '2024-01-16',
      recordedBy: 'John Staff',
      notes: '',
      createdAt: '2024-01-16T09:00:00Z',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('should render weight tracker with header', () => {
      render(<MockWeightTracker shelterId="shelter-1" animals={mockAnimals} />);

      expect(screen.getByText('Weight Tracking')).toBeInTheDocument();
      expect(screen.getByText('+ Record Weight')).toBeInTheDocument();
    });

    it('should display existing records', () => {
      render(
        <MockWeightTracker
          shelterId="shelter-1"
          animals={mockAnimals}
          initialRecords={mockRecords}
        />
      );

      expect(screen.getByText('25.5 lbs')).toBeInTheDocument();
      expect(screen.getByText('24 lbs')).toBeInTheDocument();
      expect(screen.getByText('15.2 kg')).toBeInTheDocument();
    });

    it('should display record details correctly', () => {
      render(
        <MockWeightTracker
          shelterId="shelter-1"
          animals={mockAnimals}
          initialRecords={[mockRecords[0]]}
        />
      );

      // Max appears in both filter button and record
      const maxElements = screen.getAllByText('Max');
      expect(maxElements.length).toBeGreaterThan(0);
      expect(screen.getByText('25.5 lbs')).toBeInTheDocument();
      expect(screen.getByText('Recorded by: John Staff')).toBeInTheDocument();
      expect(screen.getByText('Healthy weight')).toBeInTheDocument();
    });

    it('should show empty state when no records', () => {
      render(<MockWeightTracker shelterId="shelter-1" animals={mockAnimals} />);

      expect(screen.getByText('No weight records found.')).toBeInTheDocument();
    });
  });

  describe('Form Toggle', () => {
    it('should toggle form visibility when button is clicked', () => {
      render(<MockWeightTracker shelterId="shelter-1" animals={mockAnimals} />);

      expect(screen.queryByTestId('weight-form')).not.toBeInTheDocument();

      fireEvent.click(screen.getByText('+ Record Weight'));
      expect(screen.getByTestId('weight-form')).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();

      fireEvent.click(screen.getByText('Cancel'));
      expect(screen.queryByTestId('weight-form')).not.toBeInTheDocument();
    });
  });

  describe('Form Submission', () => {
    it('should create new weight record when form is submitted', async () => {
      render(<MockWeightTracker shelterId="shelter-1" animals={mockAnimals} />);

      fireEvent.click(screen.getByText('+ Record Weight'));

      fireEvent.change(screen.getByTestId('animal-select'), { target: { value: 'animal-1' } });
      fireEvent.change(screen.getByTestId('weight-input'), { target: { value: '30.5' } });
      fireEvent.change(screen.getByTestId('unit-select'), { target: { value: 'lbs' } });
      fireEvent.change(screen.getByTestId('recorded-by-input'), { target: { value: 'Test Staff' } });
      fireEvent.change(screen.getByTestId('notes-input'), { target: { value: 'Test notes' } });

      fireEvent.click(screen.getByText('Save Weight Record'));

      await waitFor(() => {
        expect(screen.getByText('30.5 lbs')).toBeInTheDocument();
        expect(screen.getByText('Recorded by: Test Staff')).toBeInTheDocument();
        expect(screen.getByText('Test notes')).toBeInTheDocument();
      });
    });

    it('should hide form after successful submission', async () => {
      render(<MockWeightTracker shelterId="shelter-1" animals={mockAnimals} />);

      fireEvent.click(screen.getByText('+ Record Weight'));
      fireEvent.change(screen.getByTestId('animal-select'), { target: { value: 'animal-1' } });
      fireEvent.change(screen.getByTestId('weight-input'), { target: { value: '25' } });
      fireEvent.click(screen.getByText('Save Weight Record'));

      await waitFor(() => {
        expect(screen.queryByTestId('weight-form')).not.toBeInTheDocument();
      });
    });
  });

  describe('Animal Filtering', () => {
    it('should render animal filter buttons', () => {
      render(
        <MockWeightTracker
          shelterId="shelter-1"
          animals={mockAnimals}
          initialRecords={mockRecords}
        />
      );

      expect(screen.getByText('All Animals')).toBeInTheDocument();
      // Max appears in both filter and record list
      const maxButtons = screen.getAllByText('Max');
      expect(maxButtons.length).toBeGreaterThanOrEqual(1);
    });

    it('should filter records by animal', async () => {
      render(
        <MockWeightTracker
          shelterId="shelter-1"
          animals={mockAnimals}
          initialRecords={mockRecords}
        />
      );

      // Initially should show all records
      expect(screen.getByText('25.5 lbs')).toBeInTheDocument();
      expect(screen.getByText('15.2 kg')).toBeInTheDocument();

      // Click Luna filter button
      const lunaButtons = screen.getAllByText('Luna');
      fireEvent.click(lunaButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('15.2 kg')).toBeInTheDocument();
        expect(screen.queryByText('25.5 lbs')).not.toBeInTheDocument();
      });
    });

    it('should show all records when All Animals filter is selected', async () => {
      render(
        <MockWeightTracker
          shelterId="shelter-1"
          animals={mockAnimals}
          initialRecords={mockRecords}
        />
      );

      const lunaButtons = screen.getAllByText('Luna');
      fireEvent.click(lunaButtons[0]);

      await waitFor(() => {
        expect(screen.queryByText('25.5 lbs')).not.toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('All Animals'));

      await waitFor(() => {
        expect(screen.getByText('25.5 lbs')).toBeInTheDocument();
        expect(screen.getByText('15.2 kg')).toBeInTheDocument();
      });
    });
  });

  describe('Delete Functionality', () => {
    it('should delete a weight record', async () => {
      render(
        <MockWeightTracker
          shelterId="shelter-1"
          animals={mockAnimals}
          initialRecords={[mockRecords[0]]}
        />
      );

      expect(screen.getByText('25.5 lbs')).toBeInTheDocument();

      fireEvent.click(screen.getByTestId('delete-record-1'));

      await waitFor(() => {
        expect(screen.queryByText('25.5 lbs')).not.toBeInTheDocument();
        expect(screen.getByText('No weight records found.')).toBeInTheDocument();
      });
    });
  });

  describe('Unit Options', () => {
    it('should have unit options in form', () => {
      render(<MockWeightTracker shelterId="shelter-1" animals={mockAnimals} />);

      fireEvent.click(screen.getByText('+ Record Weight'));

      const unitSelect = screen.getByTestId('unit-select');
      const options = unitSelect.querySelectorAll('option');

      expect(options.length).toBe(2);
      expect(options[0].value).toBe('lbs');
      expect(options[1].value).toBe('kg');
    });

    it('should display different units correctly', () => {
      render(
        <MockWeightTracker
          shelterId="shelter-1"
          animals={mockAnimals}
          initialRecords={mockRecords}
        />
      );

      expect(screen.getByText('25.5 lbs')).toBeInTheDocument();
      expect(screen.getByText('15.2 kg')).toBeInTheDocument();
    });
  });

  describe('Date Formatting', () => {
    it('should handle missing dates gracefully', () => {
      const recordWithoutDate = {
        ...mockRecords[0],
        _id: 'record-no-date',
        recordedAt: '',
      };

      render(
        <MockWeightTracker
          shelterId="shelter-1"
          animals={mockAnimals}
          initialRecords={[recordWithoutDate]}
        />
      );

      expect(screen.getByText('N/A')).toBeInTheDocument();
    });
  });

  describe('Animal Selection', () => {
    it('should display animal options in form', () => {
      render(<MockWeightTracker shelterId="shelter-1" animals={mockAnimals} />);

      fireEvent.click(screen.getByText('+ Record Weight'));

      const animalSelect = screen.getByTestId('animal-select');
      const options = animalSelect.querySelectorAll('option');

      expect(options.length).toBe(4); // placeholder + 3 animals
      expect(options[1].textContent).toBe('Max');
      expect(options[2].textContent).toBe('Luna');
      expect(options[3].textContent).toBe('Charlie');
    });

    it('should show Unknown for records with missing animal', () => {
      const recordWithMissingAnimal = {
        ...mockRecords[0],
        _id: 'record-unknown',
        animalId: 'non-existent',
      };

      render(
        <MockWeightTracker
          shelterId="shelter-1"
          animals={mockAnimals}
          initialRecords={[recordWithMissingAnimal]}
        />
      );

      expect(screen.getByText('Unknown')).toBeInTheDocument();
    });
  });

  describe('Optional Fields', () => {
    it('should not display empty optional fields', () => {
      const recordWithoutOptionals = {
        _id: 'record-minimal',
        animalId: 'animal-1',
        shelterId: 'shelter-1',
        weight: 20,
        unit: 'lbs',
        recordedAt: '2024-01-15',
        recordedBy: '',
        notes: '',
        createdAt: '2024-01-15T10:00:00Z',
      };

      render(
        <MockWeightTracker
          shelterId="shelter-1"
          animals={mockAnimals}
          initialRecords={[recordWithoutOptionals]}
        />
      );

      expect(screen.queryByText(/Recorded by:/)).not.toBeInTheDocument();
    });
  });
});
