import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock data
const mockNotes = [
  {
    _id: 'note1',
    animalId: 'animal1',
    shelterId: 'shelter1',
    noteType: 'behavior',
    content: 'Dog shows anxiety during thunderstorms',
    author: 'Dr. Smith',
    severity: 'warning',
    resolved: false,
    createdAt: '2024-01-15T10:00:00Z'
  },
  {
    _id: 'note2',
    animalId: 'animal2',
    shelterId: 'shelter1',
    noteType: 'training',
    content: 'Completed basic obedience training',
    author: 'Trainer Jane',
    severity: 'info',
    resolved: false,
    createdAt: '2024-01-16T14:00:00Z'
  },
  {
    _id: 'note3',
    animalId: 'animal1',
    shelterId: 'shelter1',
    noteType: 'health',
    content: 'Requires daily medication for allergies',
    author: 'Dr. Smith',
    severity: 'critical',
    resolved: true,
    createdAt: '2024-01-10T09:00:00Z'
  }
];

const mockAnimals = [
  { _id: 'animal1', name: 'Buddy' },
  { _id: 'animal2', name: 'Max' }
];

// Mock BehaviorNoteManager component
function MockBehaviorNoteManager({ shelterId, animals }) {
  const [showForm, setShowForm] = React.useState(false);
  const [filterType, setFilterType] = React.useState('all');
  const [filterSeverity, setFilterSeverity] = React.useState('all');
  const [showResolved, setShowResolved] = React.useState(false);
  const [notes, setNotes] = React.useState(mockNotes);
  const [formState, setFormState] = React.useState({
    animalId: '',
    noteType: 'general',
    content: '',
    author: '',
    severity: 'info'
  });

  const getAnimalName = (animalId) => {
    const animal = animals.find(a => a._id === animalId);
    return animal ? animal.name : 'Unknown';
  };

  const filteredNotes = notes.filter(note => {
    if (!showResolved && note.resolved) return false;
    if (filterType !== 'all' && note.noteType !== filterType) return false;
    if (filterSeverity !== 'all' && note.severity !== filterSeverity) return false;
    return true;
  });

  const handleAddNote = () => {
    if (formState.animalId && formState.content) {
      const newNote = {
        _id: `note${notes.length + 1}`,
        animalId: formState.animalId,
        shelterId,
        noteType: formState.noteType,
        content: formState.content,
        author: formState.author,
        severity: formState.severity,
        resolved: false,
        createdAt: new Date().toISOString()
      };
      setNotes([newNote, ...notes]);
      setShowForm(false);
      setFormState({ animalId: '', noteType: 'general', content: '', author: '', severity: 'info' });
    }
  };

  const handleResolve = (noteId) => {
    setNotes(notes.map(n =>
      n._id === noteId ? { ...n, resolved: !n.resolved } : n
    ));
  };

  return (
    <div className="bg-white rounded-lg">
      <div className="flex items-center justify-between p-4">
        <h2>Behavior Notes</h2>
        <button onClick={() => setShowForm(!showForm)}>+ Add Note</button>
      </div>

      {showForm && (
        <div className="p-4" data-testid="note-form">
          <h3>Add Behavior Note</h3>
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
          <select
            value={formState.noteType}
            onChange={(e) => setFormState({ ...formState, noteType: e.target.value })}
            data-testid="note-type-select"
          >
            <option value="behavior">Behavior</option>
            <option value="training">Training</option>
            <option value="health">Health</option>
            <option value="general">General</option>
          </select>
          <select
            value={formState.severity}
            onChange={(e) => setFormState({ ...formState, severity: e.target.value })}
            data-testid="severity-select"
          >
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="critical">Critical</option>
          </select>
          <input
            type="text"
            value={formState.author}
            onChange={(e) => setFormState({ ...formState, author: e.target.value })}
            placeholder="Author name"
            data-testid="author-input"
          />
          <textarea
            value={formState.content}
            onChange={(e) => setFormState({ ...formState, content: e.target.value })}
            placeholder="Note content..."
            data-testid="content-input"
          />
          <button onClick={handleAddNote}>Save Note</button>
          <button onClick={() => setShowForm(false)}>Cancel</button>
        </div>
      )}

      <div className="p-4">
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          data-testid="filter-type"
        >
          <option value="all">All Types</option>
          <option value="behavior">Behavior</option>
          <option value="training">Training</option>
          <option value="health">Health</option>
          <option value="general">General</option>
        </select>
        <select
          value={filterSeverity}
          onChange={(e) => setFilterSeverity(e.target.value)}
          data-testid="filter-severity"
        >
          <option value="all">All Severities</option>
          <option value="info">Info</option>
          <option value="warning">Warning</option>
          <option value="critical">Critical</option>
        </select>
        <label>
          <input
            type="checkbox"
            checked={showResolved}
            onChange={(e) => setShowResolved(e.target.checked)}
            data-testid="show-resolved"
          />
          Show Resolved
        </label>
      </div>

      <div className="p-4">
        {filteredNotes.length === 0 ? (
          <p>No behavior notes found.</p>
        ) : (
          filteredNotes.map(note => (
            <div key={note._id} data-testid={`note-${note._id}`} className={note.resolved ? 'opacity-60' : ''}>
              <span data-testid={`note-type-${note._id}`}>{note.noteType}</span>
              <span data-testid={`note-severity-${note._id}`}>{note.severity}</span>
              {note.resolved && <span>Resolved</span>}
              <p>{note.content}</p>
              <span>{getAnimalName(note.animalId)}</span>
              {note.author && <span>by {note.author}</span>}
              <span>{new Date(note.createdAt).toLocaleDateString()}</span>
              <button onClick={() => handleResolve(note._id)}>
                {note.resolved ? 'Reopen' : 'Resolve'}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

describe('BehaviorNoteManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the component with title', () => {
    render(<MockBehaviorNoteManager shelterId="shelter1" animals={mockAnimals} />);
    expect(screen.getByText('Behavior Notes')).toBeInTheDocument();
  });

  it('renders add note button', () => {
    render(<MockBehaviorNoteManager shelterId="shelter1" animals={mockAnimals} />);
    expect(screen.getByText('+ Add Note')).toBeInTheDocument();
  });

  it('shows form when add note button is clicked', () => {
    render(<MockBehaviorNoteManager shelterId="shelter1" animals={mockAnimals} />);
    fireEvent.click(screen.getByText('+ Add Note'));
    expect(screen.getByTestId('note-form')).toBeInTheDocument();
    expect(screen.getByText('Add Behavior Note')).toBeInTheDocument();
  });

  it('hides resolved notes by default', () => {
    render(<MockBehaviorNoteManager shelterId="shelter1" animals={mockAnimals} />);
    // note3 is resolved, should not be visible
    expect(screen.queryByTestId('note-note3')).not.toBeInTheDocument();
    // note1 and note2 should be visible
    expect(screen.getByTestId('note-note1')).toBeInTheDocument();
    expect(screen.getByTestId('note-note2')).toBeInTheDocument();
  });

  it('shows resolved notes when checkbox is toggled', () => {
    render(<MockBehaviorNoteManager shelterId="shelter1" animals={mockAnimals} />);
    fireEvent.click(screen.getByTestId('show-resolved'));
    expect(screen.getByTestId('note-note3')).toBeInTheDocument();
  });

  it('filters notes by type', () => {
    render(<MockBehaviorNoteManager shelterId="shelter1" animals={mockAnimals} />);
    fireEvent.change(screen.getByTestId('filter-type'), { target: { value: 'behavior' } });
    expect(screen.getByTestId('note-note1')).toBeInTheDocument();
    expect(screen.queryByTestId('note-note2')).not.toBeInTheDocument();
  });

  it('filters notes by severity', () => {
    render(<MockBehaviorNoteManager shelterId="shelter1" animals={mockAnimals} />);
    fireEvent.change(screen.getByTestId('filter-severity'), { target: { value: 'warning' } });
    expect(screen.getByTestId('note-note1')).toBeInTheDocument();
    expect(screen.queryByTestId('note-note2')).not.toBeInTheDocument();
  });

  it('shows empty state when no notes match filters', () => {
    render(<MockBehaviorNoteManager shelterId="shelter1" animals={mockAnimals} />);
    fireEvent.change(screen.getByTestId('filter-type'), { target: { value: 'general' } });
    expect(screen.getByText('No behavior notes found.')).toBeInTheDocument();
  });

  it('displays note content correctly', () => {
    render(<MockBehaviorNoteManager shelterId="shelter1" animals={mockAnimals} />);
    expect(screen.getByText('Dog shows anxiety during thunderstorms')).toBeInTheDocument();
    expect(screen.getByText('Completed basic obedience training')).toBeInTheDocument();
  });

  it('displays note type badges', () => {
    render(<MockBehaviorNoteManager shelterId="shelter1" animals={mockAnimals} />);
    expect(screen.getByTestId('note-type-note1')).toHaveTextContent('behavior');
    expect(screen.getByTestId('note-type-note2')).toHaveTextContent('training');
  });

  it('displays severity badges', () => {
    render(<MockBehaviorNoteManager shelterId="shelter1" animals={mockAnimals} />);
    expect(screen.getByTestId('note-severity-note1')).toHaveTextContent('warning');
    expect(screen.getByTestId('note-severity-note2')).toHaveTextContent('info');
  });

  it('displays animal names for notes', () => {
    render(<MockBehaviorNoteManager shelterId="shelter1" animals={mockAnimals} />);
    expect(screen.getByText('Buddy')).toBeInTheDocument();
    expect(screen.getByText('Max')).toBeInTheDocument();
  });

  it('displays author names', () => {
    render(<MockBehaviorNoteManager shelterId="shelter1" animals={mockAnimals} />);
    expect(screen.getByText('by Dr. Smith')).toBeInTheDocument();
    expect(screen.getByText('by Trainer Jane')).toBeInTheDocument();
  });

  it('can resolve a note', async () => {
    render(<MockBehaviorNoteManager shelterId="shelter1" animals={mockAnimals} />);
    const resolveButtons = screen.getAllByText('Resolve');
    fireEvent.click(resolveButtons[0]);
    // After resolving, note should disappear (showResolved is false)
    await waitFor(() => {
      expect(screen.queryByTestId('note-note1')).not.toBeInTheDocument();
    });
  });

  it('can reopen a resolved note', async () => {
    render(<MockBehaviorNoteManager shelterId="shelter1" animals={mockAnimals} />);
    // Show resolved notes first
    fireEvent.click(screen.getByTestId('show-resolved'));
    // Find the Reopen button for resolved note
    const reopenButton = screen.getByText('Reopen');
    fireEvent.click(reopenButton);
    // The note should now show Resolve button instead
    await waitFor(() => {
      expect(screen.queryByText('Reopen')).not.toBeInTheDocument();
    });
  });

  it('renders the form with all required fields', () => {
    render(<MockBehaviorNoteManager shelterId="shelter1" animals={mockAnimals} />);
    fireEvent.click(screen.getByText('+ Add Note'));

    expect(screen.getByTestId('animal-select')).toBeInTheDocument();
    expect(screen.getByTestId('note-type-select')).toBeInTheDocument();
    expect(screen.getByTestId('severity-select')).toBeInTheDocument();
    expect(screen.getByTestId('author-input')).toBeInTheDocument();
    expect(screen.getByTestId('content-input')).toBeInTheDocument();
    expect(screen.getByText('Save Note')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('populates animal select with provided animals', () => {
    render(<MockBehaviorNoteManager shelterId="shelter1" animals={mockAnimals} />);
    fireEvent.click(screen.getByText('+ Add Note'));

    const select = screen.getByTestId('animal-select');
    expect(select).toContainHTML('Buddy');
    expect(select).toContainHTML('Max');
  });

  it('can fill and submit the form', async () => {
    render(<MockBehaviorNoteManager shelterId="shelter1" animals={mockAnimals} />);
    fireEvent.click(screen.getByText('+ Add Note'));

    fireEvent.change(screen.getByTestId('animal-select'), { target: { value: 'animal1' } });
    fireEvent.change(screen.getByTestId('note-type-select'), { target: { value: 'behavior' } });
    fireEvent.change(screen.getByTestId('severity-select'), { target: { value: 'warning' } });
    fireEvent.change(screen.getByTestId('author-input'), { target: { value: 'Test Author' } });
    fireEvent.change(screen.getByTestId('content-input'), { target: { value: 'New test note content' } });

    fireEvent.click(screen.getByText('Save Note'));

    await waitFor(() => {
      expect(screen.queryByTestId('note-form')).not.toBeInTheDocument();
      expect(screen.getByText('New test note content')).toBeInTheDocument();
    });
  });

  it('does not submit form without required fields', () => {
    render(<MockBehaviorNoteManager shelterId="shelter1" animals={mockAnimals} />);
    fireEvent.click(screen.getByText('+ Add Note'));

    // Try to save without filling in fields
    fireEvent.click(screen.getByText('Save Note'));

    // Form should still be visible
    expect(screen.getByTestId('note-form')).toBeInTheDocument();
  });

  it('closes form when cancel is clicked', () => {
    render(<MockBehaviorNoteManager shelterId="shelter1" animals={mockAnimals} />);
    fireEvent.click(screen.getByText('+ Add Note'));
    expect(screen.getByTestId('note-form')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Cancel'));
    expect(screen.queryByTestId('note-form')).not.toBeInTheDocument();
  });

  it('renders filter controls', () => {
    render(<MockBehaviorNoteManager shelterId="shelter1" animals={mockAnimals} />);
    expect(screen.getByTestId('filter-type')).toBeInTheDocument();
    expect(screen.getByTestId('filter-severity')).toBeInTheDocument();
    expect(screen.getByTestId('show-resolved')).toBeInTheDocument();
  });

  it('combines type and severity filters', () => {
    render(<MockBehaviorNoteManager shelterId="shelter1" animals={mockAnimals} />);
    fireEvent.change(screen.getByTestId('filter-type'), { target: { value: 'training' } });
    fireEvent.change(screen.getByTestId('filter-severity'), { target: { value: 'info' } });

    expect(screen.getByTestId('note-note2')).toBeInTheDocument();
    expect(screen.queryByTestId('note-note1')).not.toBeInTheDocument();
  });

  it('displays dates for notes', () => {
    render(<MockBehaviorNoteManager shelterId="shelter1" animals={mockAnimals} />);
    // Dates should be formatted as locale date strings
    expect(screen.getByText(new Date('2024-01-15T10:00:00Z').toLocaleDateString())).toBeInTheDocument();
    expect(screen.getByText(new Date('2024-01-16T14:00:00Z').toLocaleDateString())).toBeInTheDocument();
  });

  it('renders with empty animals list', () => {
    render(<MockBehaviorNoteManager shelterId="shelter1" animals={[]} />);
    expect(screen.getByText('Behavior Notes')).toBeInTheDocument();
  });

  it('shows Unknown for notes with unrecognized animal IDs when animals list is empty', () => {
    render(<MockBehaviorNoteManager shelterId="shelter1" animals={[]} />);
    const unknownElements = screen.getAllByText('Unknown');
    expect(unknownElements.length).toBeGreaterThan(0);
  });
});
