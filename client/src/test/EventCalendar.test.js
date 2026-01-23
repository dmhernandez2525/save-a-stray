import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';

describe('Event Calendar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const MockEventCalendar = ({ events = [], onCreateEvent, onDeleteEvent }) => {
    const [showForm, setShowForm] = React.useState(false);
    const [form, setForm] = React.useState({
      title: '', description: '', date: '', endDate: '', location: '', eventType: 'other'
    });

    const updateForm = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

    const typeLabels = {
      adoption_day: 'Adoption Day', fundraiser: 'Fundraiser',
      volunteer: 'Volunteer', education: 'Education', other: 'Other'
    };

    return (
      <div data-testid="event-calendar">
        <div className="header">
          <h3 data-testid="events-title">Events</h3>
          <button data-testid="toggle-form-btn" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : '+ New Event'}
          </button>
        </div>

        {showForm && (
          <div data-testid="event-form">
            <input data-testid="event-title-input" value={form.title}
              onChange={e => updateForm('title', e.target.value)} placeholder="Event name" />
            <select data-testid="event-type-select" value={form.eventType}
              onChange={e => updateForm('eventType', e.target.value)}>
              {Object.entries(typeLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <input data-testid="event-date-input" type="datetime-local" value={form.date}
              onChange={e => updateForm('date', e.target.value)} />
            <input data-testid="event-end-input" type="datetime-local" value={form.endDate}
              onChange={e => updateForm('endDate', e.target.value)} />
            <input data-testid="event-location-input" value={form.location}
              onChange={e => updateForm('location', e.target.value)} placeholder="Event location" />
            <input data-testid="event-description-input" value={form.description}
              onChange={e => updateForm('description', e.target.value)} placeholder="Brief description" />
            <button data-testid="create-event-btn" disabled={!form.title || !form.date}
              onClick={() => {
                if (onCreateEvent) onCreateEvent(form);
                setShowForm(false);
                setForm({ title: '', description: '', date: '', endDate: '', location: '', eventType: 'other' });
              }}>
              Create Event
            </button>
          </div>
        )}

        {events.length === 0 ? (
          <p data-testid="empty-message">No events scheduled. Create your first event to engage with the community.</p>
        ) : (
          <div data-testid="events-list">
            {events.map(event => (
              <div key={event._id} data-testid={`event-${event._id}`}>
                <span data-testid={`event-title-${event._id}`}>{event.title}</span>
                <span data-testid={`event-type-${event._id}`}>{typeLabels[event.eventType] || 'Other'}</span>
                <span data-testid={`event-date-${event._id}`}>{new Date(event.date).toLocaleDateString()}</span>
                {event.location && <span data-testid={`event-location-${event._id}`}>{event.location}</span>}
                {event.description && <span data-testid={`event-desc-${event._id}`}>{event.description}</span>}
                <button data-testid={`delete-event-${event._id}`}
                  onClick={() => onDeleteEvent && onDeleteEvent(event._id)}>Delete</button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const mockEvents = [
    { _id: 'e1', title: 'Adoption Day', description: 'Meet our animals', date: '2025-03-15T10:00:00Z', location: 'Main Park', eventType: 'adoption_day' },
    { _id: 'e2', title: 'Fundraiser Gala', description: '', date: '2025-04-01T18:00:00Z', location: '', eventType: 'fundraiser' }
  ];

  it('should render events title', () => {
    render(<MemoryRouter><MockEventCalendar /></MemoryRouter>);
    expect(screen.getByTestId('events-title')).toHaveTextContent('Events');
  });

  it('should show empty message when no events', () => {
    render(<MemoryRouter><MockEventCalendar events={[]} /></MemoryRouter>);
    expect(screen.getByTestId('empty-message')).toBeInTheDocument();
  });

  it('should show new event button', () => {
    render(<MemoryRouter><MockEventCalendar /></MemoryRouter>);
    expect(screen.getByTestId('toggle-form-btn')).toHaveTextContent('+ New Event');
  });

  it('should toggle form when button clicked', () => {
    render(<MemoryRouter><MockEventCalendar /></MemoryRouter>);
    fireEvent.click(screen.getByTestId('toggle-form-btn'));
    expect(screen.getByTestId('event-form')).toBeInTheDocument();
    expect(screen.getByTestId('toggle-form-btn')).toHaveTextContent('Cancel');
  });

  it('should render form fields', () => {
    render(<MemoryRouter><MockEventCalendar /></MemoryRouter>);
    fireEvent.click(screen.getByTestId('toggle-form-btn'));
    expect(screen.getByTestId('event-title-input')).toBeInTheDocument();
    expect(screen.getByTestId('event-type-select')).toBeInTheDocument();
    expect(screen.getByTestId('event-date-input')).toBeInTheDocument();
    expect(screen.getByTestId('event-location-input')).toBeInTheDocument();
    expect(screen.getByTestId('event-description-input')).toBeInTheDocument();
  });

  it('should have create button disabled when title/date empty', () => {
    render(<MemoryRouter><MockEventCalendar /></MemoryRouter>);
    fireEvent.click(screen.getByTestId('toggle-form-btn'));
    expect(screen.getByTestId('create-event-btn')).toBeDisabled();
  });

  it('should enable create button when title and date filled', () => {
    render(<MemoryRouter><MockEventCalendar /></MemoryRouter>);
    fireEvent.click(screen.getByTestId('toggle-form-btn'));
    fireEvent.change(screen.getByTestId('event-title-input'), { target: { value: 'Test Event' } });
    fireEvent.change(screen.getByTestId('event-date-input'), { target: { value: '2025-03-15T10:00' } });
    expect(screen.getByTestId('create-event-btn')).not.toBeDisabled();
  });

  it('should call onCreateEvent with form data', () => {
    const handleCreate = vi.fn();
    render(<MemoryRouter><MockEventCalendar onCreateEvent={handleCreate} /></MemoryRouter>);
    fireEvent.click(screen.getByTestId('toggle-form-btn'));
    fireEvent.change(screen.getByTestId('event-title-input'), { target: { value: 'Test Event' } });
    fireEvent.change(screen.getByTestId('event-date-input'), { target: { value: '2025-03-15T10:00' } });
    fireEvent.change(screen.getByTestId('event-type-select'), { target: { value: 'adoption_day' } });
    fireEvent.click(screen.getByTestId('create-event-btn'));
    expect(handleCreate).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Test Event', date: '2025-03-15T10:00', eventType: 'adoption_day'
    }));
  });

  it('should hide form after creating event', () => {
    render(<MemoryRouter><MockEventCalendar onCreateEvent={vi.fn()} /></MemoryRouter>);
    fireEvent.click(screen.getByTestId('toggle-form-btn'));
    fireEvent.change(screen.getByTestId('event-title-input'), { target: { value: 'Test' } });
    fireEvent.change(screen.getByTestId('event-date-input'), { target: { value: '2025-03-15T10:00' } });
    fireEvent.click(screen.getByTestId('create-event-btn'));
    expect(screen.queryByTestId('event-form')).not.toBeInTheDocument();
  });

  it('should display events list', () => {
    render(<MemoryRouter><MockEventCalendar events={mockEvents} /></MemoryRouter>);
    expect(screen.getByTestId('events-list')).toBeInTheDocument();
    expect(screen.getByTestId('event-title-e1')).toHaveTextContent('Adoption Day');
    expect(screen.getByTestId('event-title-e2')).toHaveTextContent('Fundraiser Gala');
  });

  it('should display event type label', () => {
    render(<MemoryRouter><MockEventCalendar events={mockEvents} /></MemoryRouter>);
    expect(screen.getByTestId('event-type-e1')).toHaveTextContent('Adoption Day');
    expect(screen.getByTestId('event-type-e2')).toHaveTextContent('Fundraiser');
  });

  it('should display event location when present', () => {
    render(<MemoryRouter><MockEventCalendar events={mockEvents} /></MemoryRouter>);
    expect(screen.getByTestId('event-location-e1')).toHaveTextContent('Main Park');
    expect(screen.queryByTestId('event-location-e2')).not.toBeInTheDocument();
  });

  it('should display event description when present', () => {
    render(<MemoryRouter><MockEventCalendar events={mockEvents} /></MemoryRouter>);
    expect(screen.getByTestId('event-desc-e1')).toHaveTextContent('Meet our animals');
  });

  it('should show delete button for each event', () => {
    render(<MemoryRouter><MockEventCalendar events={mockEvents} /></MemoryRouter>);
    expect(screen.getByTestId('delete-event-e1')).toBeInTheDocument();
    expect(screen.getByTestId('delete-event-e2')).toBeInTheDocument();
  });

  it('should call onDeleteEvent when delete clicked', () => {
    const handleDelete = vi.fn();
    render(<MemoryRouter><MockEventCalendar events={mockEvents} onDeleteEvent={handleDelete} /></MemoryRouter>);
    fireEvent.click(screen.getByTestId('delete-event-e1'));
    expect(handleDelete).toHaveBeenCalledWith('e1');
  });

  it('should have event type select with all options', () => {
    render(<MemoryRouter><MockEventCalendar /></MemoryRouter>);
    fireEvent.click(screen.getByTestId('toggle-form-btn'));
    const select = screen.getByTestId('event-type-select');
    expect(select.querySelectorAll('option')).toHaveLength(5);
  });
});
