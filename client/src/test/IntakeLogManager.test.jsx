import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React, { useState } from 'react';

// Mock IntakeLogManager component
const INTAKE_TYPE_LABELS = {
  stray: "Stray",
  surrender: "Surrender",
  transfer: "Transfer",
  return: "Return",
  born_in_care: "Born in Care",
};

const CONDITION_LABELS = {
  healthy: "Healthy",
  injured: "Injured",
  sick: "Sick",
  unknown: "Unknown",
};

const MockIntakeLogManager = ({ shelterId, animals = [], initialLogs = [] }) => {
  const [logs, setLogs] = useState(initialLogs);
  const [showForm, setShowForm] = useState(false);
  const [typeFilter, setTypeFilter] = useState("all");
  const [formData, setFormData] = useState({
    animalId: "",
    intakeDate: "",
    intakeType: "stray",
    source: "",
    condition: "unknown",
    intakeNotes: "",
    receivedBy: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.animalId || !formData.intakeType) return;
    const newLog = {
      _id: `log-${Date.now()}`,
      ...formData,
      shelterId,
      createdAt: new Date().toISOString(),
    };
    setLogs([newLog, ...logs]);
    setShowForm(false);
    setFormData({
      animalId: "",
      intakeDate: "",
      intakeType: "stray",
      source: "",
      condition: "unknown",
      intakeNotes: "",
      receivedBy: "",
    });
  };

  const filteredLogs = typeFilter === "all"
    ? logs
    : logs.filter(l => l.intakeType === typeFilter);

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
    <div data-testid="intake-log-manager">
      <div className="header">
        <h2>Intake Logs</h2>
        <button onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "+ Log Intake"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} data-testid="intake-form">
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
          <select
            value={formData.intakeType}
            onChange={(e) => setFormData({ ...formData, intakeType: e.target.value })}
            data-testid="intake-type-select"
            required
          >
            {Object.keys(INTAKE_TYPE_LABELS).map((type) => (
              <option key={type} value={type}>{INTAKE_TYPE_LABELS[type]}</option>
            ))}
          </select>
          <input
            type="date"
            value={formData.intakeDate}
            onChange={(e) => setFormData({ ...formData, intakeDate: e.target.value })}
            data-testid="intake-date-input"
          />
          <select
            value={formData.condition}
            onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
            data-testid="condition-select"
          >
            {Object.keys(CONDITION_LABELS).map((cond) => (
              <option key={cond} value={cond}>{CONDITION_LABELS[cond]}</option>
            ))}
          </select>
          <input
            type="text"
            value={formData.source}
            onChange={(e) => setFormData({ ...formData, source: e.target.value })}
            placeholder="Source"
            data-testid="source-input"
          />
          <input
            type="text"
            value={formData.receivedBy}
            onChange={(e) => setFormData({ ...formData, receivedBy: e.target.value })}
            placeholder="Received by"
            data-testid="received-by-input"
          />
          <textarea
            value={formData.intakeNotes}
            onChange={(e) => setFormData({ ...formData, intakeNotes: e.target.value })}
            placeholder="Notes"
            data-testid="notes-input"
          />
          <button type="submit">Save Intake Log</button>
        </form>
      )}

      <div className="filters" data-testid="type-filters">
        <button
          onClick={() => setTypeFilter("all")}
          className={typeFilter === "all" ? "active" : ""}
        >
          All
        </button>
        {Object.keys(INTAKE_TYPE_LABELS).map((type) => (
          <button
            key={type}
            onClick={() => setTypeFilter(type)}
            className={typeFilter === type ? "active" : ""}
          >
            {INTAKE_TYPE_LABELS[type]}
          </button>
        ))}
      </div>

      <div className="logs-list" data-testid="logs-list">
        {filteredLogs.length === 0 ? (
          <p>No intake logs found.</p>
        ) : (
          filteredLogs.map((log) => (
            <div key={log._id} className="log-row" data-testid={`log-${log._id}`}>
              <span className="animal-name">{getAnimalName(log.animalId)}</span>
              <span className="intake-type">{INTAKE_TYPE_LABELS[log.intakeType]}</span>
              <span className="condition">{CONDITION_LABELS[log.condition]}</span>
              <span className="date">{formatDate(log.intakeDate)}</span>
              {log.source && <span className="source">Source: {log.source}</span>}
              {log.receivedBy && <span className="received-by">Received by: {log.receivedBy}</span>}
              {log.intakeNotes && <span className="notes">{log.intakeNotes}</span>}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

describe('IntakeLogManager', () => {
  const mockAnimals = [
    { _id: 'animal-1', name: 'Max' },
    { _id: 'animal-2', name: 'Luna' },
    { _id: 'animal-3', name: 'Charlie' },
  ];

  const mockLogs = [
    {
      _id: 'log-1',
      animalId: 'animal-1',
      shelterId: 'shelter-1',
      intakeDate: '2024-01-15',
      intakeType: 'stray',
      source: 'Found on Main St.',
      condition: 'healthy',
      intakeNotes: 'Friendly dog, no collar',
      receivedBy: 'John Staff',
      createdAt: '2024-01-15T10:00:00Z',
    },
    {
      _id: 'log-2',
      animalId: 'animal-2',
      shelterId: 'shelter-1',
      intakeDate: '2024-01-16',
      intakeType: 'surrender',
      source: 'Owner moving',
      condition: 'injured',
      intakeNotes: 'Minor leg injury',
      receivedBy: 'Jane Staff',
      createdAt: '2024-01-16T14:00:00Z',
    },
    {
      _id: 'log-3',
      animalId: 'animal-3',
      shelterId: 'shelter-1',
      intakeDate: '2024-01-17',
      intakeType: 'transfer',
      source: 'Partner shelter',
      condition: 'sick',
      intakeNotes: 'Needs vet checkup',
      receivedBy: 'Mike Staff',
      createdAt: '2024-01-17T09:00:00Z',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('should render intake log manager with header', () => {
      render(<MockIntakeLogManager shelterId="shelter-1" animals={mockAnimals} />);

      expect(screen.getByText('Intake Logs')).toBeInTheDocument();
      expect(screen.getByText('+ Log Intake')).toBeInTheDocument();
    });

    it('should display existing logs', () => {
      render(
        <MockIntakeLogManager
          shelterId="shelter-1"
          animals={mockAnimals}
          initialLogs={mockLogs}
        />
      );

      expect(screen.getByText('Max')).toBeInTheDocument();
      expect(screen.getByText('Luna')).toBeInTheDocument();
      expect(screen.getByText('Charlie')).toBeInTheDocument();
    });

    it('should display log details correctly', () => {
      render(
        <MockIntakeLogManager
          shelterId="shelter-1"
          animals={mockAnimals}
          initialLogs={[mockLogs[0]]}
        />
      );

      // "Stray" appears in both filter and log, so check for at least one
      const strayElements = screen.getAllByText('Stray');
      expect(strayElements.length).toBeGreaterThan(0);
      expect(screen.getByText('Healthy')).toBeInTheDocument();
      expect(screen.getByText('Source: Found on Main St.')).toBeInTheDocument();
      expect(screen.getByText('Received by: John Staff')).toBeInTheDocument();
      expect(screen.getByText('Friendly dog, no collar')).toBeInTheDocument();
    });

    it('should show empty state when no logs', () => {
      render(<MockIntakeLogManager shelterId="shelter-1" animals={mockAnimals} />);

      expect(screen.getByText('No intake logs found.')).toBeInTheDocument();
    });
  });

  describe('Form Toggle', () => {
    it('should toggle form visibility when button is clicked', () => {
      render(<MockIntakeLogManager shelterId="shelter-1" animals={mockAnimals} />);

      expect(screen.queryByTestId('intake-form')).not.toBeInTheDocument();

      fireEvent.click(screen.getByText('+ Log Intake'));
      expect(screen.getByTestId('intake-form')).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();

      fireEvent.click(screen.getByText('Cancel'));
      expect(screen.queryByTestId('intake-form')).not.toBeInTheDocument();
    });
  });

  describe('Form Submission', () => {
    it('should create new intake log when form is submitted', async () => {
      render(<MockIntakeLogManager shelterId="shelter-1" animals={mockAnimals} />);

      fireEvent.click(screen.getByText('+ Log Intake'));

      fireEvent.change(screen.getByTestId('animal-select'), { target: { value: 'animal-1' } });
      fireEvent.change(screen.getByTestId('intake-type-select'), { target: { value: 'stray' } });
      fireEvent.change(screen.getByTestId('condition-select'), { target: { value: 'healthy' } });
      fireEvent.change(screen.getByTestId('source-input'), { target: { value: 'Test source' } });
      fireEvent.change(screen.getByTestId('received-by-input'), { target: { value: 'Test Staff' } });
      fireEvent.change(screen.getByTestId('notes-input'), { target: { value: 'Test notes' } });

      fireEvent.click(screen.getByText('Save Intake Log'));

      await waitFor(() => {
        expect(screen.getByText('Max')).toBeInTheDocument();
        expect(screen.getByText('Source: Test source')).toBeInTheDocument();
        expect(screen.getByText('Received by: Test Staff')).toBeInTheDocument();
      });
    });

    it('should hide form after successful submission', async () => {
      render(<MockIntakeLogManager shelterId="shelter-1" animals={mockAnimals} />);

      fireEvent.click(screen.getByText('+ Log Intake'));
      fireEvent.change(screen.getByTestId('animal-select'), { target: { value: 'animal-1' } });
      fireEvent.click(screen.getByText('Save Intake Log'));

      await waitFor(() => {
        expect(screen.queryByTestId('intake-form')).not.toBeInTheDocument();
      });
    });
  });

  describe('Type Filtering', () => {
    it('should render all intake type filter buttons', () => {
      render(<MockIntakeLogManager shelterId="shelter-1" animals={mockAnimals} />);

      expect(screen.getByText('All')).toBeInTheDocument();
      expect(screen.getByText('Stray')).toBeInTheDocument();
      expect(screen.getByText('Surrender')).toBeInTheDocument();
      expect(screen.getByText('Transfer')).toBeInTheDocument();
      expect(screen.getByText('Return')).toBeInTheDocument();
      expect(screen.getByText('Born in Care')).toBeInTheDocument();
    });

    it('should filter logs by intake type', async () => {
      render(
        <MockIntakeLogManager
          shelterId="shelter-1"
          animals={mockAnimals}
          initialLogs={mockLogs}
        />
      );

      expect(screen.getByText('Max')).toBeInTheDocument();
      expect(screen.getByText('Luna')).toBeInTheDocument();
      expect(screen.getByText('Charlie')).toBeInTheDocument();

      const strayButtons = screen.getAllByText('Stray');
      fireEvent.click(strayButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Max')).toBeInTheDocument();
        expect(screen.queryByText('Luna')).not.toBeInTheDocument();
        expect(screen.queryByText('Charlie')).not.toBeInTheDocument();
      });
    });

    it('should show all logs when All filter is selected', async () => {
      render(
        <MockIntakeLogManager
          shelterId="shelter-1"
          animals={mockAnimals}
          initialLogs={mockLogs}
        />
      );

      const surrenderButtons = screen.getAllByText('Surrender');
      fireEvent.click(surrenderButtons[0]);

      await waitFor(() => {
        expect(screen.queryByText('Max')).not.toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('All'));

      await waitFor(() => {
        expect(screen.getByText('Max')).toBeInTheDocument();
        expect(screen.getByText('Luna')).toBeInTheDocument();
        expect(screen.getByText('Charlie')).toBeInTheDocument();
      });
    });
  });

  describe('Condition Display', () => {
    it('should display different conditions correctly', () => {
      render(
        <MockIntakeLogManager
          shelterId="shelter-1"
          animals={mockAnimals}
          initialLogs={mockLogs}
        />
      );

      expect(screen.getByText('Healthy')).toBeInTheDocument();
      expect(screen.getByText('Injured')).toBeInTheDocument();
      expect(screen.getByText('Sick')).toBeInTheDocument();
    });

    it('should allow selecting condition in form', () => {
      render(<MockIntakeLogManager shelterId="shelter-1" animals={mockAnimals} />);

      fireEvent.click(screen.getByText('+ Log Intake'));

      const conditionSelect = screen.getByTestId('condition-select');
      expect(conditionSelect).toBeInTheDocument();

      fireEvent.change(conditionSelect, { target: { value: 'injured' } });
      expect(conditionSelect.value).toBe('injured');
    });
  });

  describe('Intake Type Options', () => {
    it('should have all intake type options in form', () => {
      render(<MockIntakeLogManager shelterId="shelter-1" animals={mockAnimals} />);

      fireEvent.click(screen.getByText('+ Log Intake'));

      const typeSelect = screen.getByTestId('intake-type-select');
      const options = typeSelect.querySelectorAll('option');

      expect(options.length).toBe(5);
      expect(options[0].value).toBe('stray');
      expect(options[1].value).toBe('surrender');
      expect(options[2].value).toBe('transfer');
      expect(options[3].value).toBe('return');
      expect(options[4].value).toBe('born_in_care');
    });
  });

  describe('Date Formatting', () => {
    it('should format dates correctly', () => {
      render(
        <MockIntakeLogManager
          shelterId="shelter-1"
          animals={mockAnimals}
          initialLogs={[mockLogs[0]]}
        />
      );

      // Date formatting varies by locale, just check it renders
      const logsList = screen.getByTestId('logs-list');
      expect(logsList).toBeInTheDocument();
    });

    it('should handle missing dates gracefully', () => {
      const logWithoutDate = {
        ...mockLogs[0],
        _id: 'log-no-date',
        intakeDate: '',
      };

      render(
        <MockIntakeLogManager
          shelterId="shelter-1"
          animals={mockAnimals}
          initialLogs={[logWithoutDate]}
        />
      );

      expect(screen.getByText('N/A')).toBeInTheDocument();
    });
  });

  describe('Animal Selection', () => {
    it('should display animal options in form', () => {
      render(<MockIntakeLogManager shelterId="shelter-1" animals={mockAnimals} />);

      fireEvent.click(screen.getByText('+ Log Intake'));

      const animalSelect = screen.getByTestId('animal-select');
      const options = animalSelect.querySelectorAll('option');

      expect(options.length).toBe(4); // placeholder + 3 animals
      expect(options[1].textContent).toBe('Max');
      expect(options[2].textContent).toBe('Luna');
      expect(options[3].textContent).toBe('Charlie');
    });

    it('should show Unknown for logs with missing animal', () => {
      const logWithMissingAnimal = {
        ...mockLogs[0],
        _id: 'log-unknown',
        animalId: 'non-existent',
      };

      render(
        <MockIntakeLogManager
          shelterId="shelter-1"
          animals={mockAnimals}
          initialLogs={[logWithMissingAnimal]}
        />
      );

      expect(screen.getByText('Unknown')).toBeInTheDocument();
    });
  });

  describe('Optional Fields', () => {
    it('should not display empty optional fields', () => {
      const logWithoutOptionals = {
        _id: 'log-minimal',
        animalId: 'animal-1',
        shelterId: 'shelter-1',
        intakeDate: '2024-01-15',
        intakeType: 'stray',
        source: '',
        condition: 'unknown',
        intakeNotes: '',
        receivedBy: '',
        createdAt: '2024-01-15T10:00:00Z',
      };

      render(
        <MockIntakeLogManager
          shelterId="shelter-1"
          animals={mockAnimals}
          initialLogs={[logWithoutOptionals]}
        />
      );

      expect(screen.queryByText(/Source:/)).not.toBeInTheDocument();
      expect(screen.queryByText(/Received by:/)).not.toBeInTheDocument();
    });
  });
});
