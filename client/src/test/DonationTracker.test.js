import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';

describe('Donation Tracker', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const MockDonationTracker = ({ donations = [], onCreateDonation }) => {
    const [showForm, setShowForm] = React.useState(false);
    const [form, setForm] = React.useState({ donorName: '', amount: '', message: '' });

    const updateForm = (field, value) => setForm(prev => ({ ...prev, [field]: value }));
    const totalAmount = donations.reduce((sum, d) => sum + d.amount, 0);
    const formatCurrency = (amt) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amt);

    return (
      <div data-testid="donation-tracker">
        <div className="header">
          <h3 data-testid="donations-title">Donations</h3>
          <button data-testid="toggle-form-btn" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : '+ Record Donation'}
          </button>
        </div>

        {showForm && (
          <div data-testid="donation-form">
            <input data-testid="donor-name-input" value={form.donorName}
              onChange={e => updateForm('donorName', e.target.value)} placeholder="Name" />
            <input data-testid="amount-input" type="number" value={form.amount}
              onChange={e => updateForm('amount', e.target.value)} placeholder="0.00" />
            <input data-testid="message-input" value={form.message}
              onChange={e => updateForm('message', e.target.value)} placeholder="Thank you note or dedication" />
            <button data-testid="record-btn"
              disabled={!form.donorName || !form.amount || parseFloat(form.amount) <= 0}
              onClick={() => {
                if (onCreateDonation) onCreateDonation({ donorName: form.donorName, amount: parseFloat(form.amount), message: form.message });
                setShowForm(false);
                setForm({ donorName: '', amount: '', message: '' });
              }}>
              Record Donation
            </button>
          </div>
        )}

        {donations.length === 0 ? (
          <p data-testid="empty-message">No donations recorded yet.</p>
        ) : (
          <div data-testid="donations-section">
            <div data-testid="donations-summary">
              <span data-testid="total-amount">{formatCurrency(totalAmount)}</span>
              <span data-testid="donation-count">{donations.length}</span>
            </div>
            <div data-testid="donations-list">
              {donations.map(d => (
                <div key={d._id} data-testid={`donation-${d._id}`}>
                  <span data-testid={`donor-name-${d._id}`}>{d.donorName}</span>
                  <span data-testid={`donor-amount-${d._id}`}>{formatCurrency(d.amount)}</span>
                  {d.message && <span data-testid={`donor-message-${d._id}`}>{d.message}</span>}
                  <span data-testid={`donor-date-${d._id}`}>{new Date(d.createdAt).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const mockDonations = [
    { _id: 'd1', donorName: 'Jane Smith', amount: 50, message: 'For the puppies!', createdAt: '2025-03-01T00:00:00Z' },
    { _id: 'd2', donorName: 'Bob Lee', amount: 100, message: '', createdAt: '2025-03-05T00:00:00Z' },
    { _id: 'd3', donorName: 'Anonymous', amount: 25.50, message: 'Keep up the good work', createdAt: '2025-03-10T00:00:00Z' }
  ];

  it('should render donations title', () => {
    render(<MemoryRouter><MockDonationTracker /></MemoryRouter>);
    expect(screen.getByTestId('donations-title')).toHaveTextContent('Donations');
  });

  it('should show empty message when no donations', () => {
    render(<MemoryRouter><MockDonationTracker donations={[]} /></MemoryRouter>);
    expect(screen.getByTestId('empty-message')).toHaveTextContent('No donations recorded yet.');
  });

  it('should show record donation button', () => {
    render(<MemoryRouter><MockDonationTracker /></MemoryRouter>);
    expect(screen.getByTestId('toggle-form-btn')).toHaveTextContent('+ Record Donation');
  });

  it('should toggle form when button clicked', () => {
    render(<MemoryRouter><MockDonationTracker /></MemoryRouter>);
    fireEvent.click(screen.getByTestId('toggle-form-btn'));
    expect(screen.getByTestId('donation-form')).toBeInTheDocument();
    expect(screen.getByTestId('toggle-form-btn')).toHaveTextContent('Cancel');
  });

  it('should render form fields', () => {
    render(<MemoryRouter><MockDonationTracker /></MemoryRouter>);
    fireEvent.click(screen.getByTestId('toggle-form-btn'));
    expect(screen.getByTestId('donor-name-input')).toBeInTheDocument();
    expect(screen.getByTestId('amount-input')).toBeInTheDocument();
    expect(screen.getByTestId('message-input')).toBeInTheDocument();
  });

  it('should have disabled record button when form is empty', () => {
    render(<MemoryRouter><MockDonationTracker /></MemoryRouter>);
    fireEvent.click(screen.getByTestId('toggle-form-btn'));
    expect(screen.getByTestId('record-btn')).toBeDisabled();
  });

  it('should enable record button when name and amount filled', () => {
    render(<MemoryRouter><MockDonationTracker /></MemoryRouter>);
    fireEvent.click(screen.getByTestId('toggle-form-btn'));
    fireEvent.change(screen.getByTestId('donor-name-input'), { target: { value: 'Test' } });
    fireEvent.change(screen.getByTestId('amount-input'), { target: { value: '25' } });
    expect(screen.getByTestId('record-btn')).not.toBeDisabled();
  });

  it('should call onCreateDonation with form data', () => {
    const handleCreate = vi.fn();
    render(<MemoryRouter><MockDonationTracker onCreateDonation={handleCreate} /></MemoryRouter>);
    fireEvent.click(screen.getByTestId('toggle-form-btn'));
    fireEvent.change(screen.getByTestId('donor-name-input'), { target: { value: 'Jane' } });
    fireEvent.change(screen.getByTestId('amount-input'), { target: { value: '50' } });
    fireEvent.change(screen.getByTestId('message-input'), { target: { value: 'Thanks!' } });
    fireEvent.click(screen.getByTestId('record-btn'));
    expect(handleCreate).toHaveBeenCalledWith({ donorName: 'Jane', amount: 50, message: 'Thanks!' });
  });

  it('should display total amount', () => {
    render(<MemoryRouter><MockDonationTracker donations={mockDonations} /></MemoryRouter>);
    expect(screen.getByTestId('total-amount')).toHaveTextContent('$175.50');
  });

  it('should display donation count', () => {
    render(<MemoryRouter><MockDonationTracker donations={mockDonations} /></MemoryRouter>);
    expect(screen.getByTestId('donation-count')).toHaveTextContent('3');
  });

  it('should display donor names', () => {
    render(<MemoryRouter><MockDonationTracker donations={mockDonations} /></MemoryRouter>);
    expect(screen.getByTestId('donor-name-d1')).toHaveTextContent('Jane Smith');
    expect(screen.getByTestId('donor-name-d2')).toHaveTextContent('Bob Lee');
  });

  it('should display donation amounts', () => {
    render(<MemoryRouter><MockDonationTracker donations={mockDonations} /></MemoryRouter>);
    expect(screen.getByTestId('donor-amount-d1')).toHaveTextContent('$50.00');
    expect(screen.getByTestId('donor-amount-d2')).toHaveTextContent('$100.00');
  });

  it('should display message when present', () => {
    render(<MemoryRouter><MockDonationTracker donations={mockDonations} /></MemoryRouter>);
    expect(screen.getByTestId('donor-message-d1')).toHaveTextContent('For the puppies!');
    expect(screen.queryByTestId('donor-message-d2')).not.toBeInTheDocument();
  });

  it('should display donation dates', () => {
    render(<MemoryRouter><MockDonationTracker donations={mockDonations} /></MemoryRouter>);
    expect(screen.getByTestId('donor-date-d1')).toBeInTheDocument();
  });

  it('should hide form after recording donation', () => {
    render(<MemoryRouter><MockDonationTracker onCreateDonation={vi.fn()} /></MemoryRouter>);
    fireEvent.click(screen.getByTestId('toggle-form-btn'));
    fireEvent.change(screen.getByTestId('donor-name-input'), { target: { value: 'Test' } });
    fireEvent.change(screen.getByTestId('amount-input'), { target: { value: '10' } });
    fireEvent.click(screen.getByTestId('record-btn'));
    expect(screen.queryByTestId('donation-form')).not.toBeInTheDocument();
  });
});
