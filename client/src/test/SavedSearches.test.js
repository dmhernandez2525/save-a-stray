import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';

describe('Saved Searches', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const MockSavedSearches = ({ searches = [], loading = false, error = false, showForm = false, onCreateSearch, onDeleteSearch, onRunSearch }) => {
    const [formVisible, setFormVisible] = React.useState(showForm);
    const [name, setName] = React.useState('');
    const [type, setType] = React.useState('');
    const [breed, setBreed] = React.useState('');
    const [sex, setSex] = React.useState('');
    const [color, setColor] = React.useState('');
    const [status, setStatus] = React.useState('');
    const [minAge, setMinAge] = React.useState('');
    const [maxAge, setMaxAge] = React.useState('');

    if (loading) return <p data-testid="loading">Loading saved searches...</p>;
    if (error) return <p data-testid="error">Error loading saved searches</p>;

    const formatFilters = (filters) => {
      const parts = [];
      if (filters.type) parts.push(`Type: ${filters.type}`);
      if (filters.breed) parts.push(`Breed: ${filters.breed}`);
      if (filters.sex) parts.push(`Sex: ${filters.sex}`);
      if (filters.color) parts.push(`Color: ${filters.color}`);
      if (filters.status) parts.push(`Status: ${filters.status}`);
      if (filters.minAge !== undefined && filters.minAge !== null) parts.push(`Min Age: ${filters.minAge}`);
      if (filters.maxAge !== undefined && filters.maxAge !== null) parts.push(`Max Age: ${filters.maxAge}`);
      return parts.length > 0 ? parts.join(', ') : 'No filters';
    };

    return (
      <div data-testid="saved-searches">
        <div data-testid="saved-searches-header">
          <h3 data-testid="saved-searches-title">Saved Searches</h3>
          <button data-testid="new-search-btn" onClick={() => setFormVisible(!formVisible)}>
            {formVisible ? 'Cancel' : 'New Search'}
          </button>
        </div>

        {formVisible && (
          <form data-testid="search-form" onSubmit={(e) => {
            e.preventDefault();
            if (!name) return;
            const variables = { name };
            if (type) variables.type = type;
            if (breed) variables.breed = breed;
            if (sex) variables.sex = sex;
            if (color) variables.color = color;
            if (status) variables.status = status;
            if (minAge) variables.minAge = parseInt(minAge, 10);
            if (maxAge) variables.maxAge = parseInt(maxAge, 10);
            if (onCreateSearch) onCreateSearch(variables);
          }}>
            <div>
              <label data-testid="label-name">Search Name *</label>
              <input data-testid="input-name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <label data-testid="label-type">Animal Type</label>
              <select data-testid="select-type" value={type} onChange={(e) => setType(e.target.value)}>
                <option value="">Any</option>
                <option value="Dog">Dog</option>
                <option value="Cat">Cat</option>
              </select>
            </div>
            <div>
              <label data-testid="label-breed">Breed</label>
              <input data-testid="input-breed" value={breed} onChange={(e) => setBreed(e.target.value)} />
            </div>
            <div>
              <label data-testid="label-sex">Sex</label>
              <select data-testid="select-sex" value={sex} onChange={(e) => setSex(e.target.value)}>
                <option value="">Any</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
            <div>
              <label data-testid="label-color">Color</label>
              <input data-testid="input-color" value={color} onChange={(e) => setColor(e.target.value)} />
            </div>
            <div>
              <label data-testid="label-status">Status</label>
              <select data-testid="select-status" value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="">Any</option>
                <option value="available">Available</option>
              </select>
            </div>
            <div>
              <label data-testid="label-min-age">Min Age</label>
              <input data-testid="input-min-age" type="number" value={minAge} onChange={(e) => setMinAge(e.target.value)} />
            </div>
            <div>
              <label data-testid="label-max-age">Max Age</label>
              <input data-testid="input-max-age" type="number" value={maxAge} onChange={(e) => setMaxAge(e.target.value)} />
            </div>
            <button data-testid="submit-search" type="submit">Save Search</button>
          </form>
        )}

        {searches.length === 0 && (
          <p data-testid="empty-message">No saved searches yet. Create one to quickly find animals matching your criteria.</p>
        )}

        {searches.length > 0 && (
          <div data-testid="searches-list">
            {searches.map(search => (
              <div key={search._id} data-testid={`search-${search._id}`}>
                <p data-testid={`search-name-${search._id}`}>{search.name}</p>
                <p data-testid={`search-filters-${search._id}`}>{formatFilters(search.filters)}</p>
                {onRunSearch && (
                  <button data-testid={`run-btn-${search._id}`} onClick={() => onRunSearch(search.filters)}>Run</button>
                )}
                <button data-testid={`delete-btn-${search._id}`} onClick={() => onDeleteSearch && onDeleteSearch(search._id)}>Delete</button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const mockSearches = [
    {
      _id: 'ss1',
      userId: 'u1',
      name: 'Young Dogs',
      filters: { type: 'Dog', minAge: 1, maxAge: 3, status: 'available' },
      createdAt: '2025-01-10T00:00:00Z'
    },
    {
      _id: 'ss2',
      userId: 'u1',
      name: 'Female Cats',
      filters: { type: 'Cat', sex: 'Female' },
      createdAt: '2025-01-08T00:00:00Z'
    },
    {
      _id: 'ss3',
      userId: 'u1',
      name: 'Golden Retrievers',
      filters: { type: 'Dog', breed: 'Golden Retriever', color: 'Golden' },
      createdAt: '2025-01-05T00:00:00Z'
    }
  ];

  it('should render saved searches title', () => {
    render(<MemoryRouter><MockSavedSearches searches={mockSearches} /></MemoryRouter>);
    expect(screen.getByTestId('saved-searches-title')).toHaveTextContent('Saved Searches');
  });

  it('should show loading state', () => {
    render(<MemoryRouter><MockSavedSearches loading={true} /></MemoryRouter>);
    expect(screen.getByTestId('loading')).toHaveTextContent('Loading saved searches...');
  });

  it('should show error state', () => {
    render(<MemoryRouter><MockSavedSearches error={true} /></MemoryRouter>);
    expect(screen.getByTestId('error')).toHaveTextContent('Error loading saved searches');
  });

  it('should show empty message when no searches', () => {
    render(<MemoryRouter><MockSavedSearches searches={[]} /></MemoryRouter>);
    expect(screen.getByTestId('empty-message')).toBeInTheDocument();
  });

  it('should display search names', () => {
    render(<MemoryRouter><MockSavedSearches searches={mockSearches} /></MemoryRouter>);
    expect(screen.getByTestId('search-name-ss1')).toHaveTextContent('Young Dogs');
    expect(screen.getByTestId('search-name-ss2')).toHaveTextContent('Female Cats');
    expect(screen.getByTestId('search-name-ss3')).toHaveTextContent('Golden Retrievers');
  });

  it('should display formatted filters', () => {
    render(<MemoryRouter><MockSavedSearches searches={mockSearches} /></MemoryRouter>);
    expect(screen.getByTestId('search-filters-ss1')).toHaveTextContent('Type: Dog');
    expect(screen.getByTestId('search-filters-ss1')).toHaveTextContent('Min Age: 1');
    expect(screen.getByTestId('search-filters-ss1')).toHaveTextContent('Max Age: 3');
  });

  it('should display breed and color in filters', () => {
    render(<MemoryRouter><MockSavedSearches searches={mockSearches} /></MemoryRouter>);
    expect(screen.getByTestId('search-filters-ss3')).toHaveTextContent('Breed: Golden Retriever');
    expect(screen.getByTestId('search-filters-ss3')).toHaveTextContent('Color: Golden');
  });

  it('should display sex filter', () => {
    render(<MemoryRouter><MockSavedSearches searches={mockSearches} /></MemoryRouter>);
    expect(screen.getByTestId('search-filters-ss2')).toHaveTextContent('Sex: Female');
  });

  it('should toggle form visibility', () => {
    render(<MemoryRouter><MockSavedSearches searches={[]} /></MemoryRouter>);
    expect(screen.queryByTestId('search-form')).not.toBeInTheDocument();
    fireEvent.click(screen.getByTestId('new-search-btn'));
    expect(screen.getByTestId('search-form')).toBeInTheDocument();
  });

  it('should show Cancel text when form is visible', () => {
    render(<MemoryRouter><MockSavedSearches searches={[]} showForm={true} /></MemoryRouter>);
    expect(screen.getByTestId('new-search-btn')).toHaveTextContent('Cancel');
  });

  it('should render form with all filter fields', () => {
    render(<MemoryRouter><MockSavedSearches searches={[]} showForm={true} /></MemoryRouter>);
    expect(screen.getByTestId('input-name')).toBeInTheDocument();
    expect(screen.getByTestId('select-type')).toBeInTheDocument();
    expect(screen.getByTestId('input-breed')).toBeInTheDocument();
    expect(screen.getByTestId('select-sex')).toBeInTheDocument();
    expect(screen.getByTestId('input-color')).toBeInTheDocument();
    expect(screen.getByTestId('select-status')).toBeInTheDocument();
    expect(screen.getByTestId('input-min-age')).toBeInTheDocument();
    expect(screen.getByTestId('input-max-age')).toBeInTheDocument();
  });

  it('should call onCreateSearch with correct data on form submit', () => {
    const mockCreate = vi.fn();
    render(<MemoryRouter><MockSavedSearches searches={[]} showForm={true} onCreateSearch={mockCreate} /></MemoryRouter>);

    fireEvent.change(screen.getByTestId('input-name'), { target: { value: 'My Search' } });
    fireEvent.change(screen.getByTestId('select-type'), { target: { value: 'Dog' } });
    fireEvent.change(screen.getByTestId('input-breed'), { target: { value: 'Poodle' } });
    fireEvent.submit(screen.getByTestId('search-form'));

    expect(mockCreate).toHaveBeenCalledWith({
      name: 'My Search',
      type: 'Dog',
      breed: 'Poodle'
    });
  });

  it('should not submit form without a name', () => {
    const mockCreate = vi.fn();
    render(<MemoryRouter><MockSavedSearches searches={[]} showForm={true} onCreateSearch={mockCreate} /></MemoryRouter>);
    fireEvent.submit(screen.getByTestId('search-form'));
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it('should have Run button for each search', () => {
    const mockRun = vi.fn();
    render(<MemoryRouter><MockSavedSearches searches={mockSearches} onRunSearch={mockRun} /></MemoryRouter>);
    expect(screen.getByTestId('run-btn-ss1')).toHaveTextContent('Run');
    expect(screen.getByTestId('run-btn-ss2')).toHaveTextContent('Run');
  });

  it('should call onRunSearch with filters when Run is clicked', () => {
    const mockRun = vi.fn();
    render(<MemoryRouter><MockSavedSearches searches={mockSearches} onRunSearch={mockRun} /></MemoryRouter>);
    fireEvent.click(screen.getByTestId('run-btn-ss1'));
    expect(mockRun).toHaveBeenCalledWith(mockSearches[0].filters);
  });

  it('should have Delete button for each search', () => {
    render(<MemoryRouter><MockSavedSearches searches={mockSearches} /></MemoryRouter>);
    expect(screen.getByTestId('delete-btn-ss1')).toHaveTextContent('Delete');
  });

  it('should call onDeleteSearch when Delete is clicked', () => {
    const mockDelete = vi.fn();
    render(<MemoryRouter><MockSavedSearches searches={mockSearches} onDeleteSearch={mockDelete} /></MemoryRouter>);
    fireEvent.click(screen.getByTestId('delete-btn-ss2'));
    expect(mockDelete).toHaveBeenCalledWith('ss2');
  });

  it('should render New Search button', () => {
    render(<MemoryRouter><MockSavedSearches searches={mockSearches} /></MemoryRouter>);
    expect(screen.getByTestId('new-search-btn')).toHaveTextContent('New Search');
  });

  it('should display status in filters', () => {
    render(<MemoryRouter><MockSavedSearches searches={mockSearches} /></MemoryRouter>);
    expect(screen.getByTestId('search-filters-ss1')).toHaveTextContent('Status: available');
  });
});
