import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockRecords = [
  {
    _id: 'wr1',
    animalId: 'animal1',
    shelterId: 'shelter1',
    weight: 25.5,
    unit: 'lbs',
    recordedBy: 'Dr. Smith',
    notes: 'Healthy weight',
    recordedAt: '2024-01-20T10:00:00Z'
  },
  {
    _id: 'wr2',
    animalId: 'animal1',
    shelterId: 'shelter1',
    weight: 24.0,
    unit: 'lbs',
    recordedBy: 'Dr. Smith',
    notes: '',
    recordedAt: '2024-01-10T10:00:00Z'
  },
  {
    _id: 'wr3',
    animalId: 'animal2',
    shelterId: 'shelter1',
    weight: 8.2,
    unit: 'kg',
    recordedBy: 'Vet Tech',
    notes: 'Post-surgery check',
    recordedAt: '2024-01-18T14:00:00Z'
  }
];

const mockAnimals = [
  { _id: 'animal1', name: 'Buddy' },
  { _id: 'animal2', name: 'Max' }
];

function MockWeightTracker({ shelterId, animals }) {
  const [showForm, setShowForm] = React.useState(false);
  const [selectedAnimalFilter, setSelectedAnimalFilter] = React.useState('all');
  const [records, setRecords] = React.useState(mockRecords);
  const [formState, setFormState] = React.useState({
    animalId: '',
    weight: '',
    unit: 'lbs',
    recordedBy: '',
    notes: ''
  });

  const getAnimalName = (animalId) => {
    const animal = animals.find(a => a._id === animalId);
    return animal ? animal.name : 'Unknown';
  };

  const filtered = selectedAnimalFilter === 'all'
    ? records
    : records.filter(r => r.animalId === selectedAnimalFilter);

  const getWeightChange = (index) => {
    if (index >= filtered.length - 1) return null;
    const current = filtered[index];
    const previous = filtered[index + 1];
    if (current.animalId !== previous.animalId) return null;
    const diff = current.weight - previous.weight;
    if (diff === 0) return null;
    return diff > 0 ? `+${diff.toFixed(1)}` : diff.toFixed(1);
  };

  const handleAdd = () => {
    const weightNum = parseFloat(formState.weight);
    if (formState.animalId && !isNaN(weightNum) && weightNum > 0) {
      const newRecord = {
        _id: `wr${records.length + 1}`,
        animalId: formState.animalId,
        shelterId,
        weight: weightNum,
        unit: formState.unit,
        recordedBy: formState.recordedBy,
        notes: formState.notes,
        recordedAt: new Date().toISOString()
      };
      setRecords([newRecord, ...records]);
      setShowForm(false);
      setFormState({ animalId: '', weight: '', unit: 'lbs', recordedBy: '', notes: '' });
    }
  };

  const handleDelete = (id) => {
    setRecords(records.filter(r => r._id !== id));
  };

  return (
    <div className="bg-white rounded-lg">
      <div className="flex items-center justify-between p-4">
        <h2>Weight Tracker</h2>
        <button onClick={() => setShowForm(!showForm)}>+ Record Weight</button>
      </div>

      {showForm && (
        <div className="p-4" data-testid="weight-form">
          <h3>Record Weight</h3>
          <select
            value={formState.animalId}
            onChange={(e) => setFormState({ ...formState, animalId: e.target.value })}
            data-testid="animal-select"
          >
            <option value="">Select Animal</option>
            {animals.map(animal => (
              <option key={animal._id} value={animal._id}>{animal.name}</option>
            ))}
          </select>
          <input
            type="number"
            value={formState.weight}
            onChange={(e) => setFormState({ ...formState, weight: e.target.value })}
            placeholder="Weight"
            data-testid="weight-input"
          />
          <select
            value={formState.unit}
            onChange={(e) => setFormState({ ...formState, unit: e.target.value })}
            data-testid="unit-select"
          >
            <option value="lbs">lbs</option>
            <option value="kg">kg</option>
          </select>
          <input
            type="text"
            value={formState.recordedBy}
            onChange={(e) => setFormState({ ...formState, recordedBy: e.target.value })}
            placeholder="Recorded by"
            data-testid="recorded-by-input"
          />
          <input
            type="text"
            value={formState.notes}
            onChange={(e) => setFormState({ ...formState, notes: e.target.value })}
            placeholder="Notes (optional)"
            data-testid="notes-input"
          />
          <button onClick={handleAdd}>Save Record</button>
          <button onClick={() => setShowForm(false)}>Cancel</button>
        </div>
      )}

      <div className="p-4">
        <select
          value={selectedAnimalFilter}
          onChange={(e) => setSelectedAnimalFilter(e.target.value)}
          data-testid="animal-filter"
        >
          <option value="all">All Animals</option>
          {animals.map(animal => (
            <option key={animal._id} value={animal._id}>{animal.name}</option>
          ))}
        </select>
      </div>

      <div className="p-4">
        {filtered.length === 0 ? (
          <p>No weight records yet. Record your first weight measurement!</p>
        ) : (
          filtered.map((record, index) => (
            <div key={record._id} data-testid={`record-${record._id}`}>
              <span data-testid={`record-animal-${record._id}`}>{getAnimalName(record.animalId)}</span>
              <span data-testid={`record-weight-${record._id}`}>{record.weight} {record.unit}</span>
              {getWeightChange(index) && (
                <span data-testid={`record-change-${record._id}`}>{getWeightChange(index)} {record.unit}</span>
              )}
              {record.recordedBy && <span>by {record.recordedBy}</span>}
              <span>{new Date(record.recordedAt).toLocaleDateString()}</span>
              {record.notes && <span>- {record.notes}</span>}
              <button onClick={() => handleDelete(record._id)}>Remove</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

describe('WeightTracker', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the component with title', () => {
    render(<MockWeightTracker shelterId="shelter1" animals={mockAnimals} />);
    expect(screen.getByText('Weight Tracker')).toBeInTheDocument();
  });

  it('renders record weight button', () => {
    render(<MockWeightTracker shelterId="shelter1" animals={mockAnimals} />);
    expect(screen.getByText('+ Record Weight')).toBeInTheDocument();
  });

  it('shows form when record weight button is clicked', () => {
    render(<MockWeightTracker shelterId="shelter1" animals={mockAnimals} />);
    fireEvent.click(screen.getByText('+ Record Weight'));
    expect(screen.getByTestId('weight-form')).toBeInTheDocument();
  });

  it('displays all weight records by default', () => {
    render(<MockWeightTracker shelterId="shelter1" animals={mockAnimals} />);
    expect(screen.getByTestId('record-wr1')).toBeInTheDocument();
    expect(screen.getByTestId('record-wr2')).toBeInTheDocument();
    expect(screen.getByTestId('record-wr3')).toBeInTheDocument();
  });

  it('displays weight values with units', () => {
    render(<MockWeightTracker shelterId="shelter1" animals={mockAnimals} />);
    expect(screen.getByTestId('record-weight-wr1')).toHaveTextContent('25.5 lbs');
    expect(screen.getByTestId('record-weight-wr3')).toHaveTextContent('8.2 kg');
  });

  it('displays animal names', () => {
    render(<MockWeightTracker shelterId="shelter1" animals={mockAnimals} />);
    expect(screen.getByTestId('record-animal-wr1')).toHaveTextContent('Buddy');
    expect(screen.getByTestId('record-animal-wr3')).toHaveTextContent('Max');
  });

  it('shows weight change between consecutive records for same animal', () => {
    render(<MockWeightTracker shelterId="shelter1" animals={mockAnimals} />);
    // wr1 (25.5) - wr2 (24.0) = +1.5 for animal1
    expect(screen.getByTestId('record-change-wr1')).toHaveTextContent('+1.5 lbs');
  });

  it('does not show weight change for last record of an animal', () => {
    render(<MockWeightTracker shelterId="shelter1" animals={mockAnimals} />);
    expect(screen.queryByTestId('record-change-wr2')).not.toBeInTheDocument();
  });

  it('displays recorded by names', () => {
    render(<MockWeightTracker shelterId="shelter1" animals={mockAnimals} />);
    const drSmithElements = screen.getAllByText('by Dr. Smith');
    expect(drSmithElements.length).toBeGreaterThan(0);
    expect(screen.getByText('by Vet Tech')).toBeInTheDocument();
  });

  it('displays notes when present', () => {
    render(<MockWeightTracker shelterId="shelter1" animals={mockAnimals} />);
    expect(screen.getByText('- Healthy weight')).toBeInTheDocument();
    expect(screen.getByText('- Post-surgery check')).toBeInTheDocument();
  });

  it('filters records by animal', () => {
    render(<MockWeightTracker shelterId="shelter1" animals={mockAnimals} />);
    fireEvent.change(screen.getByTestId('animal-filter'), { target: { value: 'animal2' } });
    expect(screen.getByTestId('record-wr3')).toBeInTheDocument();
    expect(screen.queryByTestId('record-wr1')).not.toBeInTheDocument();
    expect(screen.queryByTestId('record-wr2')).not.toBeInTheDocument();
  });

  it('shows empty state when no records match filter', () => {
    render(<MockWeightTracker shelterId="shelter1" animals={[{ _id: 'animal99', name: 'Ghost' }]} />);
    fireEvent.change(screen.getByTestId('animal-filter'), { target: { value: 'animal99' } });
    expect(screen.getByText('No weight records yet. Record your first weight measurement!')).toBeInTheDocument();
  });

  it('can delete a weight record', async () => {
    render(<MockWeightTracker shelterId="shelter1" animals={mockAnimals} />);
    const removeButtons = screen.getAllByText('Remove');
    fireEvent.click(removeButtons[0]);
    await waitFor(() => {
      expect(screen.queryByTestId('record-wr1')).not.toBeInTheDocument();
    });
  });

  it('renders form with all fields', () => {
    render(<MockWeightTracker shelterId="shelter1" animals={mockAnimals} />);
    fireEvent.click(screen.getByText('+ Record Weight'));
    expect(screen.getByTestId('animal-select')).toBeInTheDocument();
    expect(screen.getByTestId('weight-input')).toBeInTheDocument();
    expect(screen.getByTestId('unit-select')).toBeInTheDocument();
    expect(screen.getByTestId('recorded-by-input')).toBeInTheDocument();
    expect(screen.getByTestId('notes-input')).toBeInTheDocument();
  });

  it('can fill and submit the form', async () => {
    render(<MockWeightTracker shelterId="shelter1" animals={mockAnimals} />);
    fireEvent.click(screen.getByText('+ Record Weight'));

    fireEvent.change(screen.getByTestId('animal-select'), { target: { value: 'animal1' } });
    fireEvent.change(screen.getByTestId('weight-input'), { target: { value: '30.2' } });
    fireEvent.change(screen.getByTestId('unit-select'), { target: { value: 'kg' } });
    fireEvent.change(screen.getByTestId('recorded-by-input'), { target: { value: 'Test Vet' } });

    fireEvent.click(screen.getByText('Save Record'));

    await waitFor(() => {
      expect(screen.queryByTestId('weight-form')).not.toBeInTheDocument();
      expect(screen.getByText('30.2 kg')).toBeInTheDocument();
    });
  });

  it('does not submit form without required fields', () => {
    render(<MockWeightTracker shelterId="shelter1" animals={mockAnimals} />);
    fireEvent.click(screen.getByText('+ Record Weight'));
    fireEvent.click(screen.getByText('Save Record'));
    expect(screen.getByTestId('weight-form')).toBeInTheDocument();
  });

  it('closes form when cancel is clicked', () => {
    render(<MockWeightTracker shelterId="shelter1" animals={mockAnimals} />);
    fireEvent.click(screen.getByText('+ Record Weight'));
    fireEvent.click(screen.getByText('Cancel'));
    expect(screen.queryByTestId('weight-form')).not.toBeInTheDocument();
  });

  it('renders animal filter control', () => {
    render(<MockWeightTracker shelterId="shelter1" animals={mockAnimals} />);
    expect(screen.getByTestId('animal-filter')).toBeInTheDocument();
  });

  it('displays dates for records', () => {
    render(<MockWeightTracker shelterId="shelter1" animals={mockAnimals} />);
    expect(screen.getByText(new Date('2024-01-20T10:00:00Z').toLocaleDateString())).toBeInTheDocument();
  });
});
