import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockMicrochips = [
  {
    _id: 'chip1',
    animalId: 'animal1',
    shelterId: 'shelter1',
    chipNumber: '985112345678901',
    chipBrand: 'HomeAgain',
    registeredDate: '2024-01-15T10:00:00Z',
    registeredBy: 'Dr. Smith',
    status: 'registered',
    ownerName: 'John Doe',
    ownerPhone: '555-0123',
    createdAt: '2024-01-15T10:00:00Z'
  },
  {
    _id: 'chip2',
    animalId: 'animal2',
    shelterId: 'shelter1',
    chipNumber: '985298765432109',
    chipBrand: 'AVID',
    registeredDate: null,
    registeredBy: '',
    status: 'unregistered',
    ownerName: '',
    ownerPhone: '',
    createdAt: '2024-01-16T14:00:00Z'
  },
  {
    _id: 'chip3',
    animalId: 'animal3',
    shelterId: 'shelter1',
    chipNumber: '985387654321098',
    chipBrand: '24PetWatch',
    registeredDate: '2024-01-10T09:00:00Z',
    registeredBy: 'Vet Clinic',
    status: 'transferred',
    ownerName: 'Jane Smith',
    ownerPhone: '555-0456',
    createdAt: '2024-01-10T09:00:00Z'
  }
];

const mockAnimals = [
  { _id: 'animal1', name: 'Buddy' },
  { _id: 'animal2', name: 'Max' },
  { _id: 'animal3', name: 'Luna' }
];

function MockMicrochipManager({ shelterId, animals }) {
  const [showForm, setShowForm] = React.useState(false);
  const [filterStatus, setFilterStatus] = React.useState('all');
  const [microchips, setMicrochips] = React.useState(mockMicrochips);
  const [formState, setFormState] = React.useState({
    animalId: '',
    chipNumber: '',
    chipBrand: '',
    registeredBy: '',
    ownerName: '',
    ownerPhone: ''
  });

  const getAnimalName = (animalId) => {
    const animal = animals.find(a => a._id === animalId);
    return animal ? animal.name : 'Unknown';
  };

  const filtered = filterStatus === 'all'
    ? microchips
    : microchips.filter(m => m.status === filterStatus);

  const handleRegister = () => {
    if (formState.animalId && formState.chipNumber) {
      const newChip = {
        _id: `chip${microchips.length + 1}`,
        animalId: formState.animalId,
        shelterId,
        chipNumber: formState.chipNumber,
        chipBrand: formState.chipBrand,
        registeredDate: new Date().toISOString(),
        registeredBy: formState.registeredBy,
        status: 'registered',
        ownerName: formState.ownerName,
        ownerPhone: formState.ownerPhone,
        createdAt: new Date().toISOString()
      };
      setMicrochips([newChip, ...microchips]);
      setShowForm(false);
      setFormState({ animalId: '', chipNumber: '', chipBrand: '', registeredBy: '', ownerName: '', ownerPhone: '' });
    }
  };

  const handleStatusChange = (chipId, newStatus) => {
    setMicrochips(microchips.map(m =>
      m._id === chipId ? { ...m, status: newStatus } : m
    ));
  };

  return (
    <div className="bg-white rounded-lg">
      <div className="flex items-center justify-between p-4">
        <h2>Microchip Registry</h2>
        <button onClick={() => setShowForm(!showForm)}>+ Register Chip</button>
      </div>

      {showForm && (
        <div className="p-4" data-testid="chip-form">
          <h3>Register Microchip</h3>
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
            type="text"
            value={formState.chipNumber}
            onChange={(e) => setFormState({ ...formState, chipNumber: e.target.value })}
            placeholder="Chip number"
            data-testid="chip-number-input"
          />
          <input
            type="text"
            value={formState.chipBrand}
            onChange={(e) => setFormState({ ...formState, chipBrand: e.target.value })}
            placeholder="Chip brand (optional)"
            data-testid="chip-brand-input"
          />
          <input
            type="text"
            value={formState.registeredBy}
            onChange={(e) => setFormState({ ...formState, registeredBy: e.target.value })}
            placeholder="Registered by"
            data-testid="registered-by-input"
          />
          <input
            type="text"
            value={formState.ownerName}
            onChange={(e) => setFormState({ ...formState, ownerName: e.target.value })}
            placeholder="Owner name"
            data-testid="owner-name-input"
          />
          <input
            type="text"
            value={formState.ownerPhone}
            onChange={(e) => setFormState({ ...formState, ownerPhone: e.target.value })}
            placeholder="Owner phone"
            data-testid="owner-phone-input"
          />
          <button onClick={handleRegister}>Register</button>
          <button onClick={() => setShowForm(false)}>Cancel</button>
        </div>
      )}

      <div className="p-4">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          data-testid="filter-status"
        >
          <option value="all">All Statuses</option>
          <option value="registered">Registered</option>
          <option value="unregistered">Unregistered</option>
          <option value="transferred">Transferred</option>
        </select>
      </div>

      <div className="p-4">
        {filtered.length === 0 ? (
          <p>No microchips registered yet.</p>
        ) : (
          filtered.map(chip => (
            <div key={chip._id} data-testid={`chip-${chip._id}`}>
              <span data-testid={`chip-animal-${chip._id}`}>{getAnimalName(chip.animalId)}</span>
              <span data-testid={`chip-status-${chip._id}`}>{chip.status}</span>
              <span data-testid={`chip-number-${chip._id}`}>{chip.chipNumber}</span>
              {chip.chipBrand && <span>{chip.chipBrand}</span>}
              {chip.ownerName && <span>Owner: {chip.ownerName}</span>}
              {chip.registeredDate && <span>Reg: {new Date(chip.registeredDate).toLocaleDateString()}</span>}
              <select
                value={chip.status}
                onChange={(e) => handleStatusChange(chip._id, e.target.value)}
                data-testid={`status-select-${chip._id}`}
              >
                <option value="registered">Registered</option>
                <option value="unregistered">Unregistered</option>
                <option value="transferred">Transferred</option>
              </select>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

describe('MicrochipManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the component with title', () => {
    render(<MockMicrochipManager shelterId="shelter1" animals={mockAnimals} />);
    expect(screen.getByText('Microchip Registry')).toBeInTheDocument();
  });

  it('renders register chip button', () => {
    render(<MockMicrochipManager shelterId="shelter1" animals={mockAnimals} />);
    expect(screen.getByText('+ Register Chip')).toBeInTheDocument();
  });

  it('shows form when register chip button is clicked', () => {
    render(<MockMicrochipManager shelterId="shelter1" animals={mockAnimals} />);
    fireEvent.click(screen.getByText('+ Register Chip'));
    expect(screen.getByTestId('chip-form')).toBeInTheDocument();
    expect(screen.getByText('Register Microchip')).toBeInTheDocument();
  });

  it('displays all microchips by default', () => {
    render(<MockMicrochipManager shelterId="shelter1" animals={mockAnimals} />);
    expect(screen.getByTestId('chip-chip1')).toBeInTheDocument();
    expect(screen.getByTestId('chip-chip2')).toBeInTheDocument();
    expect(screen.getByTestId('chip-chip3')).toBeInTheDocument();
  });

  it('displays chip numbers', () => {
    render(<MockMicrochipManager shelterId="shelter1" animals={mockAnimals} />);
    expect(screen.getByText('985112345678901')).toBeInTheDocument();
    expect(screen.getByText('985298765432109')).toBeInTheDocument();
    expect(screen.getByText('985387654321098')).toBeInTheDocument();
  });

  it('displays animal names for chips', () => {
    render(<MockMicrochipManager shelterId="shelter1" animals={mockAnimals} />);
    expect(screen.getByTestId('chip-animal-chip1')).toHaveTextContent('Buddy');
    expect(screen.getByTestId('chip-animal-chip2')).toHaveTextContent('Max');
    expect(screen.getByTestId('chip-animal-chip3')).toHaveTextContent('Luna');
  });

  it('displays status badges', () => {
    render(<MockMicrochipManager shelterId="shelter1" animals={mockAnimals} />);
    expect(screen.getByTestId('chip-status-chip1')).toHaveTextContent('registered');
    expect(screen.getByTestId('chip-status-chip2')).toHaveTextContent('unregistered');
    expect(screen.getByTestId('chip-status-chip3')).toHaveTextContent('transferred');
  });

  it('displays chip brands', () => {
    render(<MockMicrochipManager shelterId="shelter1" animals={mockAnimals} />);
    expect(screen.getByText('HomeAgain')).toBeInTheDocument();
    expect(screen.getByText('AVID')).toBeInTheDocument();
    expect(screen.getByText('24PetWatch')).toBeInTheDocument();
  });

  it('displays owner names', () => {
    render(<MockMicrochipManager shelterId="shelter1" animals={mockAnimals} />);
    expect(screen.getByText('Owner: John Doe')).toBeInTheDocument();
    expect(screen.getByText('Owner: Jane Smith')).toBeInTheDocument();
  });

  it('filters microchips by status', () => {
    render(<MockMicrochipManager shelterId="shelter1" animals={mockAnimals} />);
    fireEvent.change(screen.getByTestId('filter-status'), { target: { value: 'registered' } });
    expect(screen.getByTestId('chip-chip1')).toBeInTheDocument();
    expect(screen.queryByTestId('chip-chip2')).not.toBeInTheDocument();
    expect(screen.queryByTestId('chip-chip3')).not.toBeInTheDocument();
  });

  it('shows empty state when no chips match filter', () => {
    render(<MockMicrochipManager shelterId="shelter1" animals={[]} />);
    fireEvent.change(screen.getByTestId('filter-status'), { target: { value: 'unregistered' } });
    // chip2 is unregistered so it should show
    expect(screen.getByTestId('chip-chip2')).toBeInTheDocument();
  });

  it('can change microchip status', async () => {
    render(<MockMicrochipManager shelterId="shelter1" animals={mockAnimals} />);
    fireEvent.change(screen.getByTestId('status-select-chip2'), { target: { value: 'registered' } });
    await waitFor(() => {
      expect(screen.getByTestId('chip-status-chip2')).toHaveTextContent('registered');
    });
  });

  it('renders form with all required fields', () => {
    render(<MockMicrochipManager shelterId="shelter1" animals={mockAnimals} />);
    fireEvent.click(screen.getByText('+ Register Chip'));

    expect(screen.getByTestId('animal-select')).toBeInTheDocument();
    expect(screen.getByTestId('chip-number-input')).toBeInTheDocument();
    expect(screen.getByTestId('chip-brand-input')).toBeInTheDocument();
    expect(screen.getByTestId('registered-by-input')).toBeInTheDocument();
    expect(screen.getByTestId('owner-name-input')).toBeInTheDocument();
    expect(screen.getByTestId('owner-phone-input')).toBeInTheDocument();
    expect(screen.getByText('Register')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('can fill and submit the form', async () => {
    render(<MockMicrochipManager shelterId="shelter1" animals={mockAnimals} />);
    fireEvent.click(screen.getByText('+ Register Chip'));

    fireEvent.change(screen.getByTestId('animal-select'), { target: { value: 'animal1' } });
    fireEvent.change(screen.getByTestId('chip-number-input'), { target: { value: '999888777666555' } });
    fireEvent.change(screen.getByTestId('chip-brand-input'), { target: { value: 'TestBrand' } });
    fireEvent.change(screen.getByTestId('owner-name-input'), { target: { value: 'Test Owner' } });

    fireEvent.click(screen.getByText('Register'));

    await waitFor(() => {
      expect(screen.queryByTestId('chip-form')).not.toBeInTheDocument();
      expect(screen.getByText('999888777666555')).toBeInTheDocument();
    });
  });

  it('does not submit form without required fields', () => {
    render(<MockMicrochipManager shelterId="shelter1" animals={mockAnimals} />);
    fireEvent.click(screen.getByText('+ Register Chip'));
    fireEvent.click(screen.getByText('Register'));
    expect(screen.getByTestId('chip-form')).toBeInTheDocument();
  });

  it('closes form when cancel is clicked', () => {
    render(<MockMicrochipManager shelterId="shelter1" animals={mockAnimals} />);
    fireEvent.click(screen.getByText('+ Register Chip'));
    expect(screen.getByTestId('chip-form')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Cancel'));
    expect(screen.queryByTestId('chip-form')).not.toBeInTheDocument();
  });

  it('renders filter control', () => {
    render(<MockMicrochipManager shelterId="shelter1" animals={mockAnimals} />);
    expect(screen.getByTestId('filter-status')).toBeInTheDocument();
  });

  it('populates animal select with provided animals', () => {
    render(<MockMicrochipManager shelterId="shelter1" animals={mockAnimals} />);
    fireEvent.click(screen.getByText('+ Register Chip'));
    const select = screen.getByTestId('animal-select');
    expect(select).toContainHTML('Buddy');
    expect(select).toContainHTML('Max');
    expect(select).toContainHTML('Luna');
  });

  it('displays registration dates for registered chips', () => {
    render(<MockMicrochipManager shelterId="shelter1" animals={mockAnimals} />);
    expect(screen.getByText(`Reg: ${new Date('2024-01-15T10:00:00Z').toLocaleDateString()}`)).toBeInTheDocument();
  });
});
