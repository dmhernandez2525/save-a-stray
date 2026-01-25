import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

const MockAdoptionFeeManager = ({ shelterId, animals = [] }) => {
  const [showForm, setShowForm] = React.useState(false);
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [formData, setFormData] = React.useState({
    animalId: '',
    amount: '',
    currency: 'USD',
    description: '',
  });
  const [markPaidId, setMarkPaidId] = React.useState('');
  const [paidBy, setPaidBy] = React.useState('');
  const [waiveId, setWaiveId] = React.useState('');
  const [waivedReason, setWaivedReason] = React.useState('');

  const fees = [
    {
      _id: 'fee-1',
      animalId: 'animal-1',
      shelterId,
      amount: 150,
      currency: 'USD',
      description: 'Standard adoption fee',
      waived: false,
      waivedReason: '',
      paidAt: '',
      paidBy: '',
      status: 'pending',
      createdAt: '2024-06-01T00:00:00.000Z',
    },
    {
      _id: 'fee-2',
      animalId: 'animal-2',
      shelterId,
      amount: 200,
      currency: 'USD',
      description: '',
      waived: false,
      waivedReason: '',
      paidAt: '2024-07-15T00:00:00.000Z',
      paidBy: 'John Doe',
      status: 'paid',
      createdAt: '2024-05-20T00:00:00.000Z',
    },
    {
      _id: 'fee-3',
      animalId: 'animal-3',
      shelterId,
      amount: 100,
      currency: 'EUR',
      description: 'Senior animal discount',
      waived: true,
      waivedReason: 'Special needs animal',
      paidAt: '',
      paidBy: '',
      status: 'waived',
      createdAt: '2024-04-10T00:00:00.000Z',
    },
  ];

  const STATUS_STYLES = {
    pending: 'bg-yellow-500',
    paid: 'bg-green-500',
    waived: 'bg-blue-500',
    refunded: 'bg-gray-500',
  };

  const STATUS_LABELS = {
    pending: 'Pending',
    paid: 'Paid',
    waived: 'Waived',
    refunded: 'Refunded',
  };

  const getAnimalName = (animalId) => {
    const animal = animals.find((a) => a._id === animalId);
    return animal?.name || 'Unknown';
  };

  const formatCurrency = (amount, currency) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency || 'USD' }).format(amount);
  };

  let filtered = fees;
  if (statusFilter !== 'all') {
    filtered = filtered.filter((f) => f.status === statusFilter);
  }

  return (
    <div data-testid="adoption-fee-manager">
      <div className="flex items-center justify-between mb-4">
        <h2>Adoption Fees</h2>
        <button
          data-testid="toggle-form-btn"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancel' : '+ Set Fee'}
        </button>
      </div>

      {showForm && (
        <div data-testid="fee-form">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!formData.animalId || !formData.amount) return;
              setShowForm(false);
              setFormData({ animalId: '', amount: '', currency: 'USD', description: '' });
            }}
          >
            <select
              data-testid="animal-select"
              value={formData.animalId}
              onChange={(e) => setFormData({ ...formData, animalId: e.target.value })}
              required
            >
              <option value="">Select animal</option>
              {animals.map((a) => (
                <option key={a._id} value={a._id}>{a.name}</option>
              ))}
            </select>
            <input
              data-testid="amount-input"
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="0.00"
              required
            />
            <select
              data-testid="currency-select"
              value={formData.currency}
              onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
              <option value="CAD">CAD</option>
            </select>
            <input
              data-testid="description-input"
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Optional description"
            />
            <button type="submit" data-testid="save-fee-btn">Save Fee</button>
          </form>
        </div>
      )}

      <div data-testid="status-filters">
        {['all', 'pending', 'paid', 'waived', 'refunded'].map((filter) => (
          <button
            key={filter}
            data-testid={`filter-${filter}`}
            onClick={() => setStatusFilter(filter)}
            className={statusFilter === filter ? 'active' : ''}
          >
            {filter === 'all' ? 'All' : STATUS_LABELS[filter]}
          </button>
        ))}
      </div>

      <div data-testid="fee-list">
        {filtered.length === 0 ? (
          <p data-testid="empty-message">No adoption fees found.</p>
        ) : (
          filtered.map((fee) => (
            <div key={fee._id} data-testid={`fee-${fee._id}`} className="fee-row">
              <span data-testid={`fee-animal-${fee._id}`}>{getAnimalName(fee.animalId)}</span>
              <span data-testid={`fee-amount-${fee._id}`}>{formatCurrency(fee.amount, fee.currency)}</span>
              <span data-testid={`fee-status-${fee._id}`} className={STATUS_STYLES[fee.status]}>
                {STATUS_LABELS[fee.status]}
              </span>
              {fee.description && (
                <span data-testid={`fee-desc-${fee._id}`}>{fee.description}</span>
              )}
              {fee.waived && fee.waivedReason && (
                <span data-testid={`fee-waived-reason-${fee._id}`}>Waived: {fee.waivedReason}</span>
              )}
              {fee.paidBy && (
                <span data-testid={`fee-paid-by-${fee._id}`}>Paid by: {fee.paidBy}</span>
              )}
              {fee.status === 'pending' && (
                <div data-testid={`fee-actions-${fee._id}`}>
                  {markPaidId === fee._id ? (
                    <div data-testid={`mark-paid-form-${fee._id}`}>
                      <input
                        data-testid={`paid-by-input-${fee._id}`}
                        type="text"
                        value={paidBy}
                        onChange={(e) => setPaidBy(e.target.value)}
                        placeholder="Paid by"
                      />
                      <button
                        data-testid={`confirm-paid-${fee._id}`}
                        onClick={() => { setMarkPaidId(''); setPaidBy(''); }}
                      >
                        Confirm
                      </button>
                    </div>
                  ) : (
                    <button
                      data-testid={`mark-paid-btn-${fee._id}`}
                      onClick={() => setMarkPaidId(fee._id)}
                    >
                      Mark Paid
                    </button>
                  )}
                  {waiveId === fee._id ? (
                    <div data-testid={`waive-form-${fee._id}`}>
                      <input
                        data-testid={`waive-reason-input-${fee._id}`}
                        type="text"
                        value={waivedReason}
                        onChange={(e) => setWaivedReason(e.target.value)}
                        placeholder="Reason"
                      />
                      <button
                        data-testid={`confirm-waive-${fee._id}`}
                        onClick={() => { setWaiveId(''); setWaivedReason(''); }}
                      >
                        Confirm
                      </button>
                    </div>
                  ) : (
                    <button
                      data-testid={`waive-btn-${fee._id}`}
                      onClick={() => setWaiveId(fee._id)}
                    >
                      Waive
                    </button>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

describe('AdoptionFeeManager Component', () => {
  const defaultAnimals = [
    { _id: 'animal-1', name: 'Buddy' },
    { _id: 'animal-2', name: 'Max' },
    { _id: 'animal-3', name: 'Luna' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render the adoption fee manager', () => {
      render(<MockAdoptionFeeManager shelterId="shelter-1" animals={defaultAnimals} />);
      expect(screen.getByTestId('adoption-fee-manager')).toBeInTheDocument();
    });

    it('should display the title', () => {
      render(<MockAdoptionFeeManager shelterId="shelter-1" animals={defaultAnimals} />);
      expect(screen.getByText('Adoption Fees')).toBeInTheDocument();
    });

    it('should display set fee button', () => {
      render(<MockAdoptionFeeManager shelterId="shelter-1" animals={defaultAnimals} />);
      expect(screen.getByText('+ Set Fee')).toBeInTheDocument();
    });

    it('should display status filter buttons', () => {
      render(<MockAdoptionFeeManager shelterId="shelter-1" animals={defaultAnimals} />);
      expect(screen.getByTestId('filter-all')).toBeInTheDocument();
      expect(screen.getByTestId('filter-pending')).toBeInTheDocument();
      expect(screen.getByTestId('filter-paid')).toBeInTheDocument();
      expect(screen.getByTestId('filter-waived')).toBeInTheDocument();
      expect(screen.getByTestId('filter-refunded')).toBeInTheDocument();
    });
  });

  describe('Fee List', () => {
    it('should display all fees initially', () => {
      render(<MockAdoptionFeeManager shelterId="shelter-1" animals={defaultAnimals} />);
      expect(screen.getByTestId('fee-fee-1')).toBeInTheDocument();
      expect(screen.getByTestId('fee-fee-2')).toBeInTheDocument();
      expect(screen.getByTestId('fee-fee-3')).toBeInTheDocument();
    });

    it('should display animal names for fees', () => {
      render(<MockAdoptionFeeManager shelterId="shelter-1" animals={defaultAnimals} />);
      expect(screen.getByTestId('fee-animal-fee-1')).toHaveTextContent('Buddy');
      expect(screen.getByTestId('fee-animal-fee-2')).toHaveTextContent('Max');
      expect(screen.getByTestId('fee-animal-fee-3')).toHaveTextContent('Luna');
    });

    it('should display formatted amounts', () => {
      render(<MockAdoptionFeeManager shelterId="shelter-1" animals={defaultAnimals} />);
      expect(screen.getByTestId('fee-amount-fee-1')).toHaveTextContent('$150.00');
      expect(screen.getByTestId('fee-amount-fee-2')).toHaveTextContent('$200.00');
    });

    it('should display EUR currency for fee-3', () => {
      render(<MockAdoptionFeeManager shelterId="shelter-1" animals={defaultAnimals} />);
      const amount = screen.getByTestId('fee-amount-fee-3');
      expect(amount.textContent).toContain('100');
    });

    it('should display status badges', () => {
      render(<MockAdoptionFeeManager shelterId="shelter-1" animals={defaultAnimals} />);
      expect(screen.getByTestId('fee-status-fee-1')).toHaveTextContent('Pending');
      expect(screen.getByTestId('fee-status-fee-2')).toHaveTextContent('Paid');
      expect(screen.getByTestId('fee-status-fee-3')).toHaveTextContent('Waived');
    });

    it('should display description when available', () => {
      render(<MockAdoptionFeeManager shelterId="shelter-1" animals={defaultAnimals} />);
      expect(screen.getByTestId('fee-desc-fee-1')).toHaveTextContent('Standard adoption fee');
      expect(screen.queryByTestId('fee-desc-fee-2')).not.toBeInTheDocument();
      expect(screen.getByTestId('fee-desc-fee-3')).toHaveTextContent('Senior animal discount');
    });

    it('should display waived reason when applicable', () => {
      render(<MockAdoptionFeeManager shelterId="shelter-1" animals={defaultAnimals} />);
      expect(screen.getByTestId('fee-waived-reason-fee-3')).toHaveTextContent('Special needs animal');
      expect(screen.queryByTestId('fee-waived-reason-fee-1')).not.toBeInTheDocument();
    });

    it('should display paid by when applicable', () => {
      render(<MockAdoptionFeeManager shelterId="shelter-1" animals={defaultAnimals} />);
      expect(screen.getByTestId('fee-paid-by-fee-2')).toHaveTextContent('Paid by: John Doe');
      expect(screen.queryByTestId('fee-paid-by-fee-1')).not.toBeInTheDocument();
    });

    it('should show action buttons only for pending fees', () => {
      render(<MockAdoptionFeeManager shelterId="shelter-1" animals={defaultAnimals} />);
      expect(screen.getByTestId('fee-actions-fee-1')).toBeInTheDocument();
      expect(screen.queryByTestId('fee-actions-fee-2')).not.toBeInTheDocument();
      expect(screen.queryByTestId('fee-actions-fee-3')).not.toBeInTheDocument();
    });
  });

  describe('Status Filtering', () => {
    it('should filter by pending status', () => {
      render(<MockAdoptionFeeManager shelterId="shelter-1" animals={defaultAnimals} />);
      fireEvent.click(screen.getByTestId('filter-pending'));
      expect(screen.getByTestId('fee-fee-1')).toBeInTheDocument();
      expect(screen.queryByTestId('fee-fee-2')).not.toBeInTheDocument();
      expect(screen.queryByTestId('fee-fee-3')).not.toBeInTheDocument();
    });

    it('should filter by paid status', () => {
      render(<MockAdoptionFeeManager shelterId="shelter-1" animals={defaultAnimals} />);
      fireEvent.click(screen.getByTestId('filter-paid'));
      expect(screen.queryByTestId('fee-fee-1')).not.toBeInTheDocument();
      expect(screen.getByTestId('fee-fee-2')).toBeInTheDocument();
      expect(screen.queryByTestId('fee-fee-3')).not.toBeInTheDocument();
    });

    it('should filter by waived status', () => {
      render(<MockAdoptionFeeManager shelterId="shelter-1" animals={defaultAnimals} />);
      fireEvent.click(screen.getByTestId('filter-waived'));
      expect(screen.queryByTestId('fee-fee-1')).not.toBeInTheDocument();
      expect(screen.queryByTestId('fee-fee-2')).not.toBeInTheDocument();
      expect(screen.getByTestId('fee-fee-3')).toBeInTheDocument();
    });

    it('should show all when All filter clicked', () => {
      render(<MockAdoptionFeeManager shelterId="shelter-1" animals={defaultAnimals} />);
      fireEvent.click(screen.getByTestId('filter-paid'));
      fireEvent.click(screen.getByTestId('filter-all'));
      expect(screen.getByTestId('fee-fee-1')).toBeInTheDocument();
      expect(screen.getByTestId('fee-fee-2')).toBeInTheDocument();
      expect(screen.getByTestId('fee-fee-3')).toBeInTheDocument();
    });

    it('should show empty message when refunded filter has no results', () => {
      render(<MockAdoptionFeeManager shelterId="shelter-1" animals={defaultAnimals} />);
      fireEvent.click(screen.getByTestId('filter-refunded'));
      expect(screen.getByTestId('empty-message')).toBeInTheDocument();
    });
  });

  describe('Mark Paid Action', () => {
    it('should show Mark Paid button for pending fees', () => {
      render(<MockAdoptionFeeManager shelterId="shelter-1" animals={defaultAnimals} />);
      expect(screen.getByTestId('mark-paid-btn-fee-1')).toBeInTheDocument();
    });

    it('should show paid by form when Mark Paid clicked', () => {
      render(<MockAdoptionFeeManager shelterId="shelter-1" animals={defaultAnimals} />);
      fireEvent.click(screen.getByTestId('mark-paid-btn-fee-1'));
      expect(screen.getByTestId('mark-paid-form-fee-1')).toBeInTheDocument();
      expect(screen.getByTestId('paid-by-input-fee-1')).toBeInTheDocument();
      expect(screen.getByTestId('confirm-paid-fee-1')).toBeInTheDocument();
    });

    it('should update paid by input', () => {
      render(<MockAdoptionFeeManager shelterId="shelter-1" animals={defaultAnimals} />);
      fireEvent.click(screen.getByTestId('mark-paid-btn-fee-1'));
      const input = screen.getByTestId('paid-by-input-fee-1');
      fireEvent.change(input, { target: { value: 'Jane Smith' } });
      expect(input.value).toBe('Jane Smith');
    });
  });

  describe('Waive Action', () => {
    it('should show Waive button for pending fees', () => {
      render(<MockAdoptionFeeManager shelterId="shelter-1" animals={defaultAnimals} />);
      expect(screen.getByTestId('waive-btn-fee-1')).toBeInTheDocument();
    });

    it('should show waive reason form when Waive clicked', () => {
      render(<MockAdoptionFeeManager shelterId="shelter-1" animals={defaultAnimals} />);
      fireEvent.click(screen.getByTestId('waive-btn-fee-1'));
      expect(screen.getByTestId('waive-form-fee-1')).toBeInTheDocument();
      expect(screen.getByTestId('waive-reason-input-fee-1')).toBeInTheDocument();
      expect(screen.getByTestId('confirm-waive-fee-1')).toBeInTheDocument();
    });

    it('should update waive reason input', () => {
      render(<MockAdoptionFeeManager shelterId="shelter-1" animals={defaultAnimals} />);
      fireEvent.click(screen.getByTestId('waive-btn-fee-1'));
      const input = screen.getByTestId('waive-reason-input-fee-1');
      fireEvent.change(input, { target: { value: 'Foster parent' } });
      expect(input.value).toBe('Foster parent');
    });
  });

  describe('Add Fee Form', () => {
    it('should not show form initially', () => {
      render(<MockAdoptionFeeManager shelterId="shelter-1" animals={defaultAnimals} />);
      expect(screen.queryByTestId('fee-form')).not.toBeInTheDocument();
    });

    it('should show form when set fee button clicked', () => {
      render(<MockAdoptionFeeManager shelterId="shelter-1" animals={defaultAnimals} />);
      fireEvent.click(screen.getByTestId('toggle-form-btn'));
      expect(screen.getByTestId('fee-form')).toBeInTheDocument();
    });

    it('should hide form when cancel clicked', () => {
      render(<MockAdoptionFeeManager shelterId="shelter-1" animals={defaultAnimals} />);
      fireEvent.click(screen.getByTestId('toggle-form-btn'));
      expect(screen.getByTestId('fee-form')).toBeInTheDocument();
      fireEvent.click(screen.getByTestId('toggle-form-btn'));
      expect(screen.queryByTestId('fee-form')).not.toBeInTheDocument();
    });

    it('should show Cancel text when form is open', () => {
      render(<MockAdoptionFeeManager shelterId="shelter-1" animals={defaultAnimals} />);
      fireEvent.click(screen.getByTestId('toggle-form-btn'));
      expect(screen.getByTestId('toggle-form-btn')).toHaveTextContent('Cancel');
    });

    it('should render all form fields', () => {
      render(<MockAdoptionFeeManager shelterId="shelter-1" animals={defaultAnimals} />);
      fireEvent.click(screen.getByTestId('toggle-form-btn'));
      expect(screen.getByTestId('animal-select')).toBeInTheDocument();
      expect(screen.getByTestId('amount-input')).toBeInTheDocument();
      expect(screen.getByTestId('currency-select')).toBeInTheDocument();
      expect(screen.getByTestId('description-input')).toBeInTheDocument();
      expect(screen.getByTestId('save-fee-btn')).toBeInTheDocument();
    });

    it('should display animal options in select', () => {
      render(<MockAdoptionFeeManager shelterId="shelter-1" animals={defaultAnimals} />);
      fireEvent.click(screen.getByTestId('toggle-form-btn'));
      const select = screen.getByTestId('animal-select');
      expect(select).toContainHTML('Buddy');
      expect(select).toContainHTML('Max');
      expect(select).toContainHTML('Luna');
    });

    it('should update amount input', () => {
      render(<MockAdoptionFeeManager shelterId="shelter-1" animals={defaultAnimals} />);
      fireEvent.click(screen.getByTestId('toggle-form-btn'));
      const input = screen.getByTestId('amount-input');
      fireEvent.change(input, { target: { value: '250' } });
      expect(input.value).toBe('250');
    });

    it('should update description input', () => {
      render(<MockAdoptionFeeManager shelterId="shelter-1" animals={defaultAnimals} />);
      fireEvent.click(screen.getByTestId('toggle-form-btn'));
      const input = screen.getByTestId('description-input');
      fireEvent.change(input, { target: { value: 'Includes spay/neuter' } });
      expect(input.value).toBe('Includes spay/neuter');
    });

    it('should change currency selection', () => {
      render(<MockAdoptionFeeManager shelterId="shelter-1" animals={defaultAnimals} />);
      fireEvent.click(screen.getByTestId('toggle-form-btn'));
      const select = screen.getByTestId('currency-select');
      fireEvent.change(select, { target: { value: 'EUR' } });
      expect(select.value).toBe('EUR');
    });

    it('should default currency to USD', () => {
      render(<MockAdoptionFeeManager shelterId="shelter-1" animals={defaultAnimals} />);
      fireEvent.click(screen.getByTestId('toggle-form-btn'));
      expect(screen.getByTestId('currency-select').value).toBe('USD');
    });
  });
});
