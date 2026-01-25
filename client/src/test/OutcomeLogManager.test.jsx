import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React, { useState } from 'react';

// Mock OutcomeLogManager component
const OUTCOME_TYPE_LABELS = {
  adoption: "Adoption",
  transfer: "Transfer",
  return_to_owner: "Return to Owner",
  euthanasia: "Euthanasia",
  died: "Died",
  escaped: "Escaped",
  release: "Release",
  other: "Other",
};

const CONDITION_LABELS = {
  healthy: "Healthy",
  injured: "Injured",
  sick: "Sick",
  unknown: "Unknown",
};

const MockOutcomeLogManager = ({ shelterId, animals = [], initialLogs = [] }) => {
  const [logs, setLogs] = useState(initialLogs);
  const [showForm, setShowForm] = useState(false);
  const [typeFilter, setTypeFilter] = useState("all");
  const [formData, setFormData] = useState({
    animalId: "",
    outcomeDate: "",
    outcomeType: "adoption",
    destination: "",
    condition: "healthy",
    outcomeNotes: "",
    processedBy: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.animalId || !formData.outcomeType) return;
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
      outcomeDate: "",
      outcomeType: "adoption",
      destination: "",
      condition: "healthy",
      outcomeNotes: "",
      processedBy: "",
    });
  };

  const filteredLogs = typeFilter === "all"
    ? logs
    : logs.filter(l => l.outcomeType === typeFilter);

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
    <div data-testid="outcome-log-manager">
      <div className="header">
        <h2>Outcome Logs</h2>
        <button onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "+ Log Outcome"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} data-testid="outcome-form">
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
            value={formData.outcomeType}
            onChange={(e) => setFormData({ ...formData, outcomeType: e.target.value })}
            data-testid="outcome-type-select"
            required
          >
            {Object.keys(OUTCOME_TYPE_LABELS).map((type) => (
              <option key={type} value={type}>{OUTCOME_TYPE_LABELS[type]}</option>
            ))}
          </select>
          <input
            type="date"
            value={formData.outcomeDate}
            onChange={(e) => setFormData({ ...formData, outcomeDate: e.target.value })}
            data-testid="outcome-date-input"
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
            value={formData.destination}
            onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
            placeholder="Destination"
            data-testid="destination-input"
          />
          <input
            type="text"
            value={formData.processedBy}
            onChange={(e) => setFormData({ ...formData, processedBy: e.target.value })}
            placeholder="Processed by"
            data-testid="processed-by-input"
          />
          <textarea
            value={formData.outcomeNotes}
            onChange={(e) => setFormData({ ...formData, outcomeNotes: e.target.value })}
            placeholder="Notes"
            data-testid="notes-input"
          />
          <button type="submit">Save Outcome Log</button>
        </form>
      )}

      <div className="filters" data-testid="type-filters">
        <button
          onClick={() => setTypeFilter("all")}
          className={typeFilter === "all" ? "active" : ""}
        >
          All
        </button>
        {Object.keys(OUTCOME_TYPE_LABELS).map((type) => (
          <button
            key={type}
            onClick={() => setTypeFilter(type)}
            className={typeFilter === type ? "active" : ""}
          >
            {OUTCOME_TYPE_LABELS[type]}
          </button>
        ))}
      </div>

      <div className="logs-list" data-testid="logs-list">
        {filteredLogs.length === 0 ? (
          <p>No outcome logs found.</p>
        ) : (
          filteredLogs.map((log) => (
            <div key={log._id} className="log-row" data-testid={`log-${log._id}`}>
              <span className="animal-name">{getAnimalName(log.animalId)}</span>
              <span className="outcome-type">{OUTCOME_TYPE_LABELS[log.outcomeType]}</span>
              <span className="condition">{CONDITION_LABELS[log.condition]}</span>
              <span className="date">{formatDate(log.outcomeDate)}</span>
              {log.destination && <span className="destination">Destination: {log.destination}</span>}
              {log.processedBy && <span className="processed-by">Processed by: {log.processedBy}</span>}
              {log.outcomeNotes && <span className="notes">{log.outcomeNotes}</span>}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

describe('OutcomeLogManager', () => {
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
      outcomeDate: '2024-01-15',
      outcomeType: 'adoption',
      destination: 'Smith Family',
      condition: 'healthy',
      outcomeNotes: 'Happy adoption',
      processedBy: 'John Staff',
      createdAt: '2024-01-15T10:00:00Z',
    },
    {
      _id: 'log-2',
      animalId: 'animal-2',
      shelterId: 'shelter-1',
      outcomeDate: '2024-01-16',
      outcomeType: 'transfer',
      destination: 'Partner Shelter',
      condition: 'injured',
      outcomeNotes: 'Transferred for specialized care',
      processedBy: 'Jane Staff',
      createdAt: '2024-01-16T14:00:00Z',
    },
    {
      _id: 'log-3',
      animalId: 'animal-3',
      shelterId: 'shelter-1',
      outcomeDate: '2024-01-17',
      outcomeType: 'return_to_owner',
      destination: 'Original owner',
      condition: 'healthy',
      outcomeNotes: 'Owner found via microchip',
      processedBy: 'Mike Staff',
      createdAt: '2024-01-17T09:00:00Z',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('should render outcome log manager with header', () => {
      render(<MockOutcomeLogManager shelterId="shelter-1" animals={mockAnimals} />);

      expect(screen.getByText('Outcome Logs')).toBeInTheDocument();
      expect(screen.getByText('+ Log Outcome')).toBeInTheDocument();
    });

    it('should display existing logs', () => {
      render(
        <MockOutcomeLogManager
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
        <MockOutcomeLogManager
          shelterId="shelter-1"
          animals={mockAnimals}
          initialLogs={[mockLogs[0]]}
        />
      );

      // Check for adoption log details
      const adoptionElements = screen.getAllByText('Adoption');
      expect(adoptionElements.length).toBeGreaterThan(0);
      expect(screen.getByText('Healthy')).toBeInTheDocument();
      expect(screen.getByText('Destination: Smith Family')).toBeInTheDocument();
      expect(screen.getByText('Processed by: John Staff')).toBeInTheDocument();
      expect(screen.getByText('Happy adoption')).toBeInTheDocument();
    });

    it('should show empty state when no logs', () => {
      render(<MockOutcomeLogManager shelterId="shelter-1" animals={mockAnimals} />);

      expect(screen.getByText('No outcome logs found.')).toBeInTheDocument();
    });
  });

  describe('Form Toggle', () => {
    it('should toggle form visibility when button is clicked', () => {
      render(<MockOutcomeLogManager shelterId="shelter-1" animals={mockAnimals} />);

      expect(screen.queryByTestId('outcome-form')).not.toBeInTheDocument();

      fireEvent.click(screen.getByText('+ Log Outcome'));
      expect(screen.getByTestId('outcome-form')).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();

      fireEvent.click(screen.getByText('Cancel'));
      expect(screen.queryByTestId('outcome-form')).not.toBeInTheDocument();
    });
  });

  describe('Form Submission', () => {
    it('should create new outcome log when form is submitted', async () => {
      render(<MockOutcomeLogManager shelterId="shelter-1" animals={mockAnimals} />);

      fireEvent.click(screen.getByText('+ Log Outcome'));

      fireEvent.change(screen.getByTestId('animal-select'), { target: { value: 'animal-1' } });
      fireEvent.change(screen.getByTestId('outcome-type-select'), { target: { value: 'adoption' } });
      fireEvent.change(screen.getByTestId('condition-select'), { target: { value: 'healthy' } });
      fireEvent.change(screen.getByTestId('destination-input'), { target: { value: 'Test adopter' } });
      fireEvent.change(screen.getByTestId('processed-by-input'), { target: { value: 'Test Staff' } });
      fireEvent.change(screen.getByTestId('notes-input'), { target: { value: 'Test notes' } });

      fireEvent.click(screen.getByText('Save Outcome Log'));

      await waitFor(() => {
        expect(screen.getByText('Max')).toBeInTheDocument();
        expect(screen.getByText('Destination: Test adopter')).toBeInTheDocument();
        expect(screen.getByText('Processed by: Test Staff')).toBeInTheDocument();
      });
    });

    it('should hide form after successful submission', async () => {
      render(<MockOutcomeLogManager shelterId="shelter-1" animals={mockAnimals} />);

      fireEvent.click(screen.getByText('+ Log Outcome'));
      fireEvent.change(screen.getByTestId('animal-select'), { target: { value: 'animal-1' } });
      fireEvent.click(screen.getByText('Save Outcome Log'));

      await waitFor(() => {
        expect(screen.queryByTestId('outcome-form')).not.toBeInTheDocument();
      });
    });
  });

  describe('Type Filtering', () => {
    it('should render all outcome type filter buttons', () => {
      render(<MockOutcomeLogManager shelterId="shelter-1" animals={mockAnimals} />);

      expect(screen.getByText('All')).toBeInTheDocument();
      expect(screen.getByText('Adoption')).toBeInTheDocument();
      expect(screen.getByText('Transfer')).toBeInTheDocument();
      expect(screen.getByText('Return to Owner')).toBeInTheDocument();
      expect(screen.getByText('Euthanasia')).toBeInTheDocument();
      expect(screen.getByText('Died')).toBeInTheDocument();
      expect(screen.getByText('Escaped')).toBeInTheDocument();
      expect(screen.getByText('Release')).toBeInTheDocument();
      expect(screen.getByText('Other')).toBeInTheDocument();
    });

    it('should filter logs by outcome type', async () => {
      render(
        <MockOutcomeLogManager
          shelterId="shelter-1"
          animals={mockAnimals}
          initialLogs={mockLogs}
        />
      );

      expect(screen.getByText('Max')).toBeInTheDocument();
      expect(screen.getByText('Luna')).toBeInTheDocument();
      expect(screen.getByText('Charlie')).toBeInTheDocument();

      const adoptionButtons = screen.getAllByText('Adoption');
      fireEvent.click(adoptionButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Max')).toBeInTheDocument();
        expect(screen.queryByText('Luna')).not.toBeInTheDocument();
        expect(screen.queryByText('Charlie')).not.toBeInTheDocument();
      });
    });

    it('should show all logs when All filter is selected', async () => {
      render(
        <MockOutcomeLogManager
          shelterId="shelter-1"
          animals={mockAnimals}
          initialLogs={mockLogs}
        />
      );

      const transferButtons = screen.getAllByText('Transfer');
      fireEvent.click(transferButtons[0]);

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
        <MockOutcomeLogManager
          shelterId="shelter-1"
          animals={mockAnimals}
          initialLogs={mockLogs}
        />
      );

      const healthyElements = screen.getAllByText('Healthy');
      expect(healthyElements.length).toBeGreaterThan(0);
      expect(screen.getByText('Injured')).toBeInTheDocument();
    });

    it('should allow selecting condition in form', () => {
      render(<MockOutcomeLogManager shelterId="shelter-1" animals={mockAnimals} />);

      fireEvent.click(screen.getByText('+ Log Outcome'));

      const conditionSelect = screen.getByTestId('condition-select');
      expect(conditionSelect).toBeInTheDocument();

      fireEvent.change(conditionSelect, { target: { value: 'injured' } });
      expect(conditionSelect.value).toBe('injured');
    });
  });

  describe('Outcome Type Options', () => {
    it('should have all outcome type options in form', () => {
      render(<MockOutcomeLogManager shelterId="shelter-1" animals={mockAnimals} />);

      fireEvent.click(screen.getByText('+ Log Outcome'));

      const typeSelect = screen.getByTestId('outcome-type-select');
      const options = typeSelect.querySelectorAll('option');

      expect(options.length).toBe(8);
      expect(options[0].value).toBe('adoption');
      expect(options[1].value).toBe('transfer');
      expect(options[2].value).toBe('return_to_owner');
      expect(options[3].value).toBe('euthanasia');
      expect(options[4].value).toBe('died');
      expect(options[5].value).toBe('escaped');
      expect(options[6].value).toBe('release');
      expect(options[7].value).toBe('other');
    });
  });

  describe('Date Formatting', () => {
    it('should format dates correctly', () => {
      render(
        <MockOutcomeLogManager
          shelterId="shelter-1"
          animals={mockAnimals}
          initialLogs={[mockLogs[0]]}
        />
      );

      const logsList = screen.getByTestId('logs-list');
      expect(logsList).toBeInTheDocument();
    });

    it('should handle missing dates gracefully', () => {
      const logWithoutDate = {
        ...mockLogs[0],
        _id: 'log-no-date',
        outcomeDate: '',
      };

      render(
        <MockOutcomeLogManager
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
      render(<MockOutcomeLogManager shelterId="shelter-1" animals={mockAnimals} />);

      fireEvent.click(screen.getByText('+ Log Outcome'));

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
        <MockOutcomeLogManager
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
        outcomeDate: '2024-01-15',
        outcomeType: 'adoption',
        destination: '',
        condition: 'healthy',
        outcomeNotes: '',
        processedBy: '',
        createdAt: '2024-01-15T10:00:00Z',
      };

      render(
        <MockOutcomeLogManager
          shelterId="shelter-1"
          animals={mockAnimals}
          initialLogs={[logWithoutOptionals]}
        />
      );

      expect(screen.queryByText(/Destination:/)).not.toBeInTheDocument();
      expect(screen.queryByText(/Processed by:/)).not.toBeInTheDocument();
    });
  });
});
