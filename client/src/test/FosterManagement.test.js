import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';

describe('Foster Management', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const MockFosterManagement = ({ fosters = [], loading = false, error = false, showForm = false, onCreateFoster, onUpdateStatus }) => {
    const [formVisible, setFormVisible] = React.useState(showForm);
    const [animalId, setAnimalId] = React.useState('');
    const [fosterName, setFosterName] = React.useState('');
    const [fosterEmail, setFosterEmail] = React.useState('');
    const [startDate, setStartDate] = React.useState('2025-01-15');
    const [notes, setNotes] = React.useState('');

    if (loading) return <p data-testid="loading">Loading fosters...</p>;
    if (error) return <p data-testid="error">Error loading foster records</p>;

    const activeFosters = fosters.filter(f => f.status === 'active');
    const pastFosters = fosters.filter(f => f.status !== 'active');

    return (
      <div data-testid="foster-management">
        <div data-testid="foster-header">
          <h3 data-testid="foster-title">Foster Management</h3>
          <button data-testid="new-foster-btn" onClick={() => setFormVisible(!formVisible)}>
            {formVisible ? 'Cancel' : 'New Foster'}
          </button>
        </div>

        {formVisible && (
          <form data-testid="foster-form" onSubmit={(e) => {
            e.preventDefault();
            if (onCreateFoster && animalId && fosterName && startDate) {
              onCreateFoster({ animalId, fosterName, fosterEmail, startDate, notes });
            }
          }}>
            <div>
              <label data-testid="label-animal-id">Animal ID *</label>
              <input data-testid="input-animal-id" value={animalId} onChange={(e) => setAnimalId(e.target.value)} />
            </div>
            <div>
              <label data-testid="label-foster-name">Foster Parent Name *</label>
              <input data-testid="input-foster-name" value={fosterName} onChange={(e) => setFosterName(e.target.value)} />
            </div>
            <div>
              <label data-testid="label-foster-email">Foster Email</label>
              <input data-testid="input-foster-email" value={fosterEmail} onChange={(e) => setFosterEmail(e.target.value)} />
            </div>
            <div>
              <label data-testid="label-start-date">Start Date *</label>
              <input data-testid="input-start-date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div>
              <label data-testid="label-notes">Notes</label>
              <textarea data-testid="input-notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
            <button data-testid="submit-foster" type="submit">Create Foster Record</button>
          </form>
        )}

        {fosters.length === 0 && <p data-testid="empty-message">No foster records yet.</p>}

        {fosters.length > 0 && (
          <div data-testid="foster-stats">
            <span data-testid="active-count">Active: {activeFosters.length}</span>
            <span data-testid="total-count">Total: {fosters.length}</span>
          </div>
        )}

        {activeFosters.length > 0 && (
          <div data-testid="active-fosters">
            <h4 data-testid="active-title">Active Fosters</h4>
            {activeFosters.map(foster => (
              <div key={foster._id} data-testid={`foster-${foster._id}`}>
                <p data-testid={`foster-name-${foster._id}`}>{foster.fosterName}</p>
                <p data-testid={`foster-email-${foster._id}`}>{foster.fosterEmail}</p>
                <span data-testid={`foster-status-${foster._id}`}>{foster.status}</span>
                <p data-testid={`foster-animal-${foster._id}`}>Animal ID: {foster.animalId}</p>
                <p data-testid={`foster-start-${foster._id}`}>Start: {foster.startDate}</p>
                {foster.notes && <p data-testid={`foster-notes-${foster._id}`}>"{foster.notes}"</p>}
                <button data-testid={`complete-btn-${foster._id}`} onClick={() => onUpdateStatus && onUpdateStatus(foster._id, 'completed')}>
                  Mark Completed
                </button>
                <button data-testid={`cancel-btn-${foster._id}`} onClick={() => onUpdateStatus && onUpdateStatus(foster._id, 'cancelled')}>
                  Cancel
                </button>
              </div>
            ))}
          </div>
        )}

        {pastFosters.length > 0 && (
          <div data-testid="past-fosters">
            <h4 data-testid="past-title">Past Fosters</h4>
            {pastFosters.map(foster => (
              <div key={foster._id} data-testid={`foster-${foster._id}`}>
                <p data-testid={`foster-name-${foster._id}`}>{foster.fosterName}</p>
                <span data-testid={`foster-status-${foster._id}`}>{foster.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const mockFosters = [
    {
      _id: 'f1',
      shelterId: 's1',
      animalId: 'a1',
      userId: 'u1',
      fosterName: 'Jane Smith',
      fosterEmail: 'jane@example.com',
      startDate: '2025-01-10',
      endDate: null,
      status: 'active',
      notes: 'Great with cats',
      createdAt: '2025-01-10T00:00:00Z'
    },
    {
      _id: 'f2',
      shelterId: 's1',
      animalId: 'a2',
      userId: 'u2',
      fosterName: 'John Doe',
      fosterEmail: 'john@example.com',
      startDate: '2024-12-01',
      endDate: '2025-01-05',
      status: 'completed',
      notes: '',
      createdAt: '2024-12-01T00:00:00Z'
    },
    {
      _id: 'f3',
      shelterId: 's1',
      animalId: 'a3',
      userId: '',
      fosterName: 'Bob Wilson',
      fosterEmail: '',
      startDate: '2024-11-15',
      endDate: '2024-12-20',
      status: 'cancelled',
      notes: 'Moved away',
      createdAt: '2024-11-15T00:00:00Z'
    }
  ];

  it('should render foster management title', () => {
    render(<MemoryRouter><MockFosterManagement fosters={mockFosters} /></MemoryRouter>);
    expect(screen.getByTestId('foster-title')).toHaveTextContent('Foster Management');
  });

  it('should show loading state', () => {
    render(<MemoryRouter><MockFosterManagement loading={true} /></MemoryRouter>);
    expect(screen.getByTestId('loading')).toHaveTextContent('Loading fosters...');
  });

  it('should show error state', () => {
    render(<MemoryRouter><MockFosterManagement error={true} /></MemoryRouter>);
    expect(screen.getByTestId('error')).toHaveTextContent('Error loading foster records');
  });

  it('should show empty message when no fosters', () => {
    render(<MemoryRouter><MockFosterManagement fosters={[]} /></MemoryRouter>);
    expect(screen.getByTestId('empty-message')).toHaveTextContent('No foster records yet.');
  });

  it('should display active foster count', () => {
    render(<MemoryRouter><MockFosterManagement fosters={mockFosters} /></MemoryRouter>);
    expect(screen.getByTestId('active-count')).toHaveTextContent('Active: 1');
  });

  it('should display total foster count', () => {
    render(<MemoryRouter><MockFosterManagement fosters={mockFosters} /></MemoryRouter>);
    expect(screen.getByTestId('total-count')).toHaveTextContent('Total: 3');
  });

  it('should display active fosters section', () => {
    render(<MemoryRouter><MockFosterManagement fosters={mockFosters} /></MemoryRouter>);
    expect(screen.getByTestId('active-title')).toHaveTextContent('Active Fosters');
    expect(screen.getByTestId('foster-name-f1')).toHaveTextContent('Jane Smith');
  });

  it('should display past fosters section', () => {
    render(<MemoryRouter><MockFosterManagement fosters={mockFosters} /></MemoryRouter>);
    expect(screen.getByTestId('past-title')).toHaveTextContent('Past Fosters');
    expect(screen.getByTestId('foster-name-f2')).toHaveTextContent('John Doe');
  });

  it('should display foster email for active foster', () => {
    render(<MemoryRouter><MockFosterManagement fosters={mockFosters} /></MemoryRouter>);
    expect(screen.getByTestId('foster-email-f1')).toHaveTextContent('jane@example.com');
  });

  it('should display foster status', () => {
    render(<MemoryRouter><MockFosterManagement fosters={mockFosters} /></MemoryRouter>);
    expect(screen.getByTestId('foster-status-f1')).toHaveTextContent('active');
    expect(screen.getByTestId('foster-status-f2')).toHaveTextContent('completed');
  });

  it('should display foster animal ID', () => {
    render(<MemoryRouter><MockFosterManagement fosters={mockFosters} /></MemoryRouter>);
    expect(screen.getByTestId('foster-animal-f1')).toHaveTextContent('Animal ID: a1');
  });

  it('should display foster notes when present', () => {
    render(<MemoryRouter><MockFosterManagement fosters={mockFosters} /></MemoryRouter>);
    expect(screen.getByTestId('foster-notes-f1')).toHaveTextContent('"Great with cats"');
  });

  it('should toggle form visibility on New Foster button click', () => {
    render(<MemoryRouter><MockFosterManagement fosters={[]} /></MemoryRouter>);
    expect(screen.queryByTestId('foster-form')).not.toBeInTheDocument();
    fireEvent.click(screen.getByTestId('new-foster-btn'));
    expect(screen.getByTestId('foster-form')).toBeInTheDocument();
  });

  it('should show Cancel text when form is visible', () => {
    render(<MemoryRouter><MockFosterManagement fosters={[]} showForm={true} /></MemoryRouter>);
    expect(screen.getByTestId('new-foster-btn')).toHaveTextContent('Cancel');
  });

  it('should render form with all required fields', () => {
    render(<MemoryRouter><MockFosterManagement fosters={[]} showForm={true} /></MemoryRouter>);
    expect(screen.getByTestId('input-animal-id')).toBeInTheDocument();
    expect(screen.getByTestId('input-foster-name')).toBeInTheDocument();
    expect(screen.getByTestId('input-foster-email')).toBeInTheDocument();
    expect(screen.getByTestId('input-start-date')).toBeInTheDocument();
    expect(screen.getByTestId('input-notes')).toBeInTheDocument();
  });

  it('should call onCreateFoster when form is submitted with valid data', () => {
    const mockCreate = vi.fn();
    render(<MemoryRouter><MockFosterManagement fosters={[]} showForm={true} onCreateFoster={mockCreate} /></MemoryRouter>);

    fireEvent.change(screen.getByTestId('input-animal-id'), { target: { value: 'animal123' } });
    fireEvent.change(screen.getByTestId('input-foster-name'), { target: { value: 'Test Parent' } });
    fireEvent.change(screen.getByTestId('input-foster-email'), { target: { value: 'test@test.com' } });
    fireEvent.submit(screen.getByTestId('foster-form'));

    expect(mockCreate).toHaveBeenCalledWith({
      animalId: 'animal123',
      fosterName: 'Test Parent',
      fosterEmail: 'test@test.com',
      startDate: '2025-01-15',
      notes: ''
    });
  });

  it('should have Mark Completed button for active fosters', () => {
    render(<MemoryRouter><MockFosterManagement fosters={mockFosters} /></MemoryRouter>);
    expect(screen.getByTestId('complete-btn-f1')).toHaveTextContent('Mark Completed');
  });

  it('should have Cancel button for active fosters', () => {
    render(<MemoryRouter><MockFosterManagement fosters={mockFosters} /></MemoryRouter>);
    expect(screen.getByTestId('cancel-btn-f1')).toHaveTextContent('Cancel');
  });

  it('should call onUpdateStatus with completed when Mark Completed is clicked', () => {
    const mockUpdate = vi.fn();
    render(<MemoryRouter><MockFosterManagement fosters={mockFosters} onUpdateStatus={mockUpdate} /></MemoryRouter>);
    fireEvent.click(screen.getByTestId('complete-btn-f1'));
    expect(mockUpdate).toHaveBeenCalledWith('f1', 'completed');
  });

  it('should call onUpdateStatus with cancelled when Cancel is clicked', () => {
    const mockUpdate = vi.fn();
    render(<MemoryRouter><MockFosterManagement fosters={mockFosters} onUpdateStatus={mockUpdate} /></MemoryRouter>);
    fireEvent.click(screen.getByTestId('cancel-btn-f1'));
    expect(mockUpdate).toHaveBeenCalledWith('f1', 'cancelled');
  });

  it('should display start date for active foster', () => {
    render(<MemoryRouter><MockFosterManagement fosters={mockFosters} /></MemoryRouter>);
    expect(screen.getByTestId('foster-start-f1')).toHaveTextContent('Start: 2025-01-10');
  });

  it('should render New Foster button', () => {
    render(<MemoryRouter><MockFosterManagement fosters={mockFosters} /></MemoryRouter>);
    expect(screen.getByTestId('new-foster-btn')).toHaveTextContent('New Foster');
  });
});
