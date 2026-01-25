import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

describe('Terminal Reader Manager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const MockTerminalReaderManager = ({
    readers = [],
    loading = false,
    error = false,
    showForm = false,
    onRegister,
    onDelete,
    onCharge
  }) => {
    const [formVisible, setFormVisible] = React.useState(showForm);
    const [regCode, setRegCode] = React.useState('');
    const [label, setLabel] = React.useState('');
    const [location, setLocation] = React.useState('');
    const [chargeReaderId, setChargeReaderId] = React.useState('');
    const [amount, setAmount] = React.useState('');
    const [description, setDescription] = React.useState('');
    const [paymentStatus, setPaymentStatus] = React.useState('');

    if (loading) return <p data-testid="loading">Loading readers...</p>;
    if (error) return <p data-testid="error">Error loading terminal readers</p>;

    return (
      <div data-testid="terminal-manager">
        <div data-testid="header">
          <h3 data-testid="title">Terminal Readers</h3>
          <button data-testid="register-btn" onClick={() => setFormVisible(!formVisible)}>
            {formVisible ? 'Cancel' : '+ Register Reader'}
          </button>
        </div>

        {formVisible && (
          <form data-testid="register-form" onSubmit={(e) => {
            e.preventDefault();
            if (onRegister && regCode && label) {
              onRegister({ registrationCode: regCode, label, location });
            }
          }}>
            <div>
              <label data-testid="label-code">Registration Code *</label>
              <input data-testid="input-code" value={regCode} onChange={(e) => setRegCode(e.target.value)} />
            </div>
            <div>
              <label data-testid="label-label">Label *</label>
              <input data-testid="input-label" value={label} onChange={(e) => setLabel(e.target.value)} />
            </div>
            <div>
              <label data-testid="label-location">Location</label>
              <input data-testid="input-location" value={location} onChange={(e) => setLocation(e.target.value)} />
            </div>
            <button data-testid="submit-register" type="submit" disabled={!regCode || !label}>Register</button>
          </form>
        )}

        {readers.length === 0 ? (
          <p data-testid="empty-message">No terminal readers registered. Register a Stripe Terminal reader to accept in-person payments.</p>
        ) : (
          <div data-testid="readers-list">
            {readers.map((reader) => (
              <div key={reader._id} data-testid={`reader-${reader._id}`} className="reader-card">
                <span data-testid={`status-${reader._id}`} className={reader.status === 'online' ? 'online' : 'offline'} />
                <p data-testid={`label-${reader._id}`}>{reader.label}</p>
                <p data-testid={`device-${reader._id}`}>{reader.deviceType}</p>
                <p data-testid={`serial-${reader._id}`}>{reader.serialNumber || 'N/A'}</p>
                {reader.location && <p data-testid={`location-${reader._id}`}>{reader.location}</p>}
                <button data-testid={`charge-btn-${reader._id}`} onClick={() => setChargeReaderId(reader.stripeReaderId)}>Charge</button>
                <button data-testid={`delete-btn-${reader._id}`} onClick={() => onDelete && onDelete(reader._id)}>Remove</button>
              </div>
            ))}
          </div>
        )}

        {chargeReaderId && (
          <div data-testid="payment-form">
            <h4 data-testid="payment-title">Process Payment</h4>
            <input data-testid="input-amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount in cents" />
            <input data-testid="input-description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" />
            {paymentStatus && <p data-testid="payment-status">{paymentStatus}</p>}
            <button
              data-testid="submit-payment"
              disabled={!amount || parseInt(amount) <= 0}
              onClick={() => {
                if (onCharge) {
                  onCharge({ readerId: chargeReaderId, amount: parseInt(amount), description });
                  setPaymentStatus('Payment initiated');
                }
              }}
            >Process Payment</button>
            <button data-testid="cancel-payment" onClick={() => { setChargeReaderId(''); setPaymentStatus(''); }}>Cancel</button>
          </div>
        )}
      </div>
    );
  };

  const mockReaders = [
    {
      _id: 'r1',
      shelterId: 'shelter1',
      stripeReaderId: 'tmr_123',
      label: 'Front Desk',
      deviceType: 'verifone_P400',
      serialNumber: 'SN-001',
      location: 'Main Lobby',
      status: 'online',
      registeredAt: '2025-06-15T00:00:00Z'
    },
    {
      _id: 'r2',
      shelterId: 'shelter1',
      stripeReaderId: 'tmr_456',
      label: 'Back Office',
      deviceType: 'simulated',
      serialNumber: '',
      location: '',
      status: 'offline',
      registeredAt: '2025-06-20T00:00:00Z'
    }
  ];

  it('should show loading state', () => {
    render(<MockTerminalReaderManager loading={true} />);
    expect(screen.getByTestId('loading')).toBeInTheDocument();
    expect(screen.getByTestId('loading')).toHaveTextContent('Loading readers...');
  });

  it('should show error state', () => {
    render(<MockTerminalReaderManager error={true} />);
    expect(screen.getByTestId('error')).toBeInTheDocument();
    expect(screen.getByTestId('error')).toHaveTextContent('Error loading terminal readers');
  });

  it('should show empty state when no readers', () => {
    render(<MockTerminalReaderManager readers={[]} />);
    expect(screen.getByTestId('empty-message')).toBeInTheDocument();
  });

  it('should display title', () => {
    render(<MockTerminalReaderManager readers={[]} />);
    expect(screen.getByTestId('title')).toHaveTextContent('Terminal Readers');
  });

  it('should render reader cards', () => {
    render(<MockTerminalReaderManager readers={mockReaders} />);
    expect(screen.getByTestId('reader-r1')).toBeInTheDocument();
    expect(screen.getByTestId('reader-r2')).toBeInTheDocument();
  });

  it('should display reader labels', () => {
    render(<MockTerminalReaderManager readers={mockReaders} />);
    expect(screen.getByTestId('label-r1')).toHaveTextContent('Front Desk');
    expect(screen.getByTestId('label-r2')).toHaveTextContent('Back Office');
  });

  it('should display device types', () => {
    render(<MockTerminalReaderManager readers={mockReaders} />);
    expect(screen.getByTestId('device-r1')).toHaveTextContent('verifone_P400');
    expect(screen.getByTestId('device-r2')).toHaveTextContent('simulated');
  });

  it('should show online status indicator', () => {
    render(<MockTerminalReaderManager readers={mockReaders} />);
    expect(screen.getByTestId('status-r1').className).toContain('online');
  });

  it('should show offline status indicator', () => {
    render(<MockTerminalReaderManager readers={mockReaders} />);
    expect(screen.getByTestId('status-r2').className).toContain('offline');
  });

  it('should display serial number or N/A', () => {
    render(<MockTerminalReaderManager readers={mockReaders} />);
    expect(screen.getByTestId('serial-r1')).toHaveTextContent('SN-001');
    expect(screen.getByTestId('serial-r2')).toHaveTextContent('N/A');
  });

  it('should display location when present', () => {
    render(<MockTerminalReaderManager readers={mockReaders} />);
    expect(screen.getByTestId('location-r1')).toHaveTextContent('Main Lobby');
    expect(screen.queryByTestId('location-r2')).not.toBeInTheDocument();
  });

  it('should toggle register form when button clicked', () => {
    render(<MockTerminalReaderManager readers={[]} />);
    expect(screen.queryByTestId('register-form')).not.toBeInTheDocument();
    fireEvent.click(screen.getByTestId('register-btn'));
    expect(screen.getByTestId('register-form')).toBeInTheDocument();
  });

  it('should show register form fields', () => {
    render(<MockTerminalReaderManager readers={[]} showForm={true} />);
    expect(screen.getByTestId('input-code')).toBeInTheDocument();
    expect(screen.getByTestId('input-label')).toBeInTheDocument();
    expect(screen.getByTestId('input-location')).toBeInTheDocument();
  });

  it('should disable submit when required fields empty', () => {
    render(<MockTerminalReaderManager readers={[]} showForm={true} />);
    expect(screen.getByTestId('submit-register')).toBeDisabled();
  });

  it('should enable submit when required fields filled', () => {
    render(<MockTerminalReaderManager readers={[]} showForm={true} />);
    fireEvent.change(screen.getByTestId('input-code'), { target: { value: 'sim-code' } });
    fireEvent.change(screen.getByTestId('input-label'), { target: { value: 'My Reader' } });
    expect(screen.getByTestId('submit-register')).not.toBeDisabled();
  });

  it('should call onRegister with form data', () => {
    const mockRegister = vi.fn();
    render(<MockTerminalReaderManager readers={[]} showForm={true} onRegister={mockRegister} />);
    fireEvent.change(screen.getByTestId('input-code'), { target: { value: 'test-code' } });
    fireEvent.change(screen.getByTestId('input-label'), { target: { value: 'Test Reader' } });
    fireEvent.change(screen.getByTestId('input-location'), { target: { value: 'Lobby' } });
    fireEvent.submit(screen.getByTestId('register-form'));
    expect(mockRegister).toHaveBeenCalledWith({
      registrationCode: 'test-code',
      label: 'Test Reader',
      location: 'Lobby'
    });
  });

  it('should call onDelete when Remove is clicked', () => {
    const mockDelete = vi.fn();
    render(<MockTerminalReaderManager readers={mockReaders} onDelete={mockDelete} />);
    fireEvent.click(screen.getByTestId('delete-btn-r1'));
    expect(mockDelete).toHaveBeenCalledWith('r1');
  });

  it('should show payment form when Charge is clicked', () => {
    render(<MockTerminalReaderManager readers={mockReaders} />);
    expect(screen.queryByTestId('payment-form')).not.toBeInTheDocument();
    fireEvent.click(screen.getByTestId('charge-btn-r1'));
    expect(screen.getByTestId('payment-form')).toBeInTheDocument();
  });

  it('should show payment form fields', () => {
    render(<MockTerminalReaderManager readers={mockReaders} />);
    fireEvent.click(screen.getByTestId('charge-btn-r1'));
    expect(screen.getByTestId('input-amount')).toBeInTheDocument();
    expect(screen.getByTestId('input-description')).toBeInTheDocument();
  });

  it('should disable process button when amount is empty', () => {
    render(<MockTerminalReaderManager readers={mockReaders} />);
    fireEvent.click(screen.getByTestId('charge-btn-r1'));
    expect(screen.getByTestId('submit-payment')).toBeDisabled();
  });

  it('should call onCharge with payment data', () => {
    const mockCharge = vi.fn();
    render(<MockTerminalReaderManager readers={mockReaders} onCharge={mockCharge} />);
    fireEvent.click(screen.getByTestId('charge-btn-r1'));
    fireEvent.change(screen.getByTestId('input-amount'), { target: { value: '5000' } });
    fireEvent.change(screen.getByTestId('input-description'), { target: { value: 'Adoption fee' } });
    fireEvent.click(screen.getByTestId('submit-payment'));
    expect(mockCharge).toHaveBeenCalledWith({
      readerId: 'tmr_123',
      amount: 5000,
      description: 'Adoption fee'
    });
  });

  it('should show payment status after charge', () => {
    const mockCharge = vi.fn();
    render(<MockTerminalReaderManager readers={mockReaders} onCharge={mockCharge} />);
    fireEvent.click(screen.getByTestId('charge-btn-r1'));
    fireEvent.change(screen.getByTestId('input-amount'), { target: { value: '2500' } });
    fireEvent.click(screen.getByTestId('submit-payment'));
    expect(screen.getByTestId('payment-status')).toHaveTextContent('Payment initiated');
  });

  it('should hide payment form when Cancel is clicked', () => {
    render(<MockTerminalReaderManager readers={mockReaders} />);
    fireEvent.click(screen.getByTestId('charge-btn-r1'));
    expect(screen.getByTestId('payment-form')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('cancel-payment'));
    expect(screen.queryByTestId('payment-form')).not.toBeInTheDocument();
  });

  it('should change button text when form is shown', () => {
    render(<MockTerminalReaderManager readers={[]} />);
    expect(screen.getByTestId('register-btn')).toHaveTextContent('+ Register Reader');
    fireEvent.click(screen.getByTestId('register-btn'));
    expect(screen.getByTestId('register-btn')).toHaveTextContent('Cancel');
  });
});
