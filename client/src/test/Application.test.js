import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

describe('Multi-Step Application Form', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Mock multi-step form component
  const MockApplicationForm = ({ onSubmit }) => {
    const [step, setStep] = React.useState(0);
    const [formData, setFormData] = React.useState({
      firstName: '', lastName: '', email: '', phoneNumber: '',
      streetAddress: '', city: '', state: '', housing: '', housingType: '',
      activityLevel: ''
    });
    const [errors, setErrors] = React.useState({});

    const STEPS = [
      { title: 'Personal Information' },
      { title: 'Housing Details' },
      { title: 'Review & Submit' }
    ];

    const validateStep = (currentStep) => {
      const newErrors = {};
      if (currentStep === 0) {
        if (!formData.firstName) newErrors.firstName = 'First name is required';
        if (!formData.lastName) newErrors.lastName = 'Last name is required';
        if (!formData.email) newErrors.email = 'Email is required';
        if (!formData.phoneNumber) newErrors.phoneNumber = 'Phone number is required';
      }
      if (currentStep === 1) {
        if (!formData.streetAddress) newErrors.streetAddress = 'Street address is required';
        if (!formData.city) newErrors.city = 'City is required';
        if (!formData.state) newErrors.state = 'State is required';
        if (!formData.housing) newErrors.housing = 'Housing type is required';
        if (!formData.housingType) newErrors.housingType = 'Own/Rent is required';
      }
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };

    const nextStep = () => {
      if (validateStep(step)) setStep(s => s + 1);
    };
    const prevStep = () => setStep(s => Math.max(0, s - 1));

    const updateField = (field, value) => {
      setFormData(prev => ({ ...prev, [field]: value }));
      setErrors({});
    };

    return (
      <div data-testid="application-form">
        <h1>Application for Adoption</h1>
        <div data-testid="step-indicator">
          {STEPS.map((s, i) => (
            <span key={i} data-testid={`step-${i}`} className={
              i < step ? 'completed' : i === step ? 'active' : 'pending'
            }>
              {s.title}
            </span>
          ))}
        </div>
        <p data-testid="current-step">Step {step + 1} of 3</p>

        {step === 0 && (
          <div data-testid="step-0-content">
            <input data-testid="firstName-input" placeholder="First name"
              value={formData.firstName}
              onChange={e => updateField('firstName', e.target.value)} />
            {errors.firstName && <p data-testid="firstName-error">{errors.firstName}</p>}

            <input data-testid="lastName-input" placeholder="Last name"
              value={formData.lastName}
              onChange={e => updateField('lastName', e.target.value)} />
            {errors.lastName && <p data-testid="lastName-error">{errors.lastName}</p>}

            <input data-testid="email-input" placeholder="Email" type="email"
              value={formData.email}
              onChange={e => updateField('email', e.target.value)} />
            {errors.email && <p data-testid="email-error">{errors.email}</p>}

            <input data-testid="phone-input" placeholder="Phone"
              value={formData.phoneNumber}
              onChange={e => updateField('phoneNumber', e.target.value)} />
            {errors.phoneNumber && <p data-testid="phone-error">{errors.phoneNumber}</p>}
          </div>
        )}

        {step === 1 && (
          <div data-testid="step-1-content">
            <input data-testid="address-input" placeholder="Street address"
              value={formData.streetAddress}
              onChange={e => updateField('streetAddress', e.target.value)} />
            {errors.streetAddress && <p data-testid="address-error">{errors.streetAddress}</p>}

            <input data-testid="city-input" placeholder="City"
              value={formData.city}
              onChange={e => updateField('city', e.target.value)} />
            {errors.city && <p data-testid="city-error">{errors.city}</p>}

            <input data-testid="state-input" placeholder="State"
              value={formData.state}
              onChange={e => updateField('state', e.target.value)} />
            {errors.state && <p data-testid="state-error">{errors.state}</p>}

            <select data-testid="housing-select"
              value={formData.housing}
              onChange={e => updateField('housing', e.target.value)}>
              <option value="">Select...</option>
              <option value="House">House</option>
              <option value="Apartment">Apartment</option>
            </select>
            {errors.housing && <p data-testid="housing-error">{errors.housing}</p>}

            <select data-testid="own-rent-select"
              value={formData.housingType}
              onChange={e => updateField('housingType', e.target.value)}>
              <option value="">Select...</option>
              <option value="Own">Own</option>
              <option value="Rent">Rent</option>
            </select>
            {errors.housingType && <p data-testid="own-rent-error">{errors.housingType}</p>}
          </div>
        )}

        {step === 2 && (
          <div data-testid="step-2-content">
            <div data-testid="review-name">{formData.firstName} {formData.lastName}</div>
            <div data-testid="review-email">{formData.email}</div>
            <div data-testid="review-phone">{formData.phoneNumber}</div>
            <div data-testid="review-address">
              {formData.streetAddress}, {formData.city}, {formData.state}
            </div>
            <div data-testid="review-housing">{formData.housing} ({formData.housingType})</div>
          </div>
        )}

        <div>
          {step > 0 && <button data-testid="back-btn" onClick={prevStep}>Back</button>}
          {step < 2 ? (
            <button data-testid="next-btn" onClick={nextStep}>Next</button>
          ) : (
            <button data-testid="submit-btn" onClick={() => onSubmit && onSubmit(formData)}>
              Submit Application
            </button>
          )}
        </div>
      </div>
    );
  };

  describe('Step Navigation', () => {
    it('should start on step 1', () => {
      render(<MockApplicationForm />);
      expect(screen.getByTestId('current-step')).toHaveTextContent('Step 1 of 3');
      expect(screen.getByTestId('step-0-content')).toBeInTheDocument();
    });

    it('should show Next button on step 1', () => {
      render(<MockApplicationForm />);
      expect(screen.getByTestId('next-btn')).toBeInTheDocument();
      expect(screen.queryByTestId('back-btn')).not.toBeInTheDocument();
    });

    it('should not advance without required fields', () => {
      render(<MockApplicationForm />);
      fireEvent.click(screen.getByTestId('next-btn'));
      // Still on step 1
      expect(screen.getByTestId('step-0-content')).toBeInTheDocument();
    });

    it('should show validation errors on step 1 when fields empty', () => {
      render(<MockApplicationForm />);
      fireEvent.click(screen.getByTestId('next-btn'));
      expect(screen.getByTestId('firstName-error')).toBeInTheDocument();
      expect(screen.getByTestId('lastName-error')).toBeInTheDocument();
      expect(screen.getByTestId('email-error')).toBeInTheDocument();
      expect(screen.getByTestId('phone-error')).toBeInTheDocument();
    });

    it('should advance to step 2 when fields are valid', () => {
      render(<MockApplicationForm />);
      fireEvent.change(screen.getByTestId('firstName-input'), { target: { value: 'John' } });
      fireEvent.change(screen.getByTestId('lastName-input'), { target: { value: 'Doe' } });
      fireEvent.change(screen.getByTestId('email-input'), { target: { value: 'john@test.com' } });
      fireEvent.change(screen.getByTestId('phone-input'), { target: { value: '555-1234' } });
      fireEvent.click(screen.getByTestId('next-btn'));

      expect(screen.getByTestId('current-step')).toHaveTextContent('Step 2 of 3');
      expect(screen.getByTestId('step-1-content')).toBeInTheDocument();
    });

    it('should show Back button on step 2', () => {
      render(<MockApplicationForm />);
      fireEvent.change(screen.getByTestId('firstName-input'), { target: { value: 'John' } });
      fireEvent.change(screen.getByTestId('lastName-input'), { target: { value: 'Doe' } });
      fireEvent.change(screen.getByTestId('email-input'), { target: { value: 'john@test.com' } });
      fireEvent.change(screen.getByTestId('phone-input'), { target: { value: '555-1234' } });
      fireEvent.click(screen.getByTestId('next-btn'));

      expect(screen.getByTestId('back-btn')).toBeInTheDocument();
    });

    it('should go back to step 1 when Back is clicked', () => {
      render(<MockApplicationForm />);
      fireEvent.change(screen.getByTestId('firstName-input'), { target: { value: 'John' } });
      fireEvent.change(screen.getByTestId('lastName-input'), { target: { value: 'Doe' } });
      fireEvent.change(screen.getByTestId('email-input'), { target: { value: 'john@test.com' } });
      fireEvent.change(screen.getByTestId('phone-input'), { target: { value: '555-1234' } });
      fireEvent.click(screen.getByTestId('next-btn'));
      fireEvent.click(screen.getByTestId('back-btn'));

      expect(screen.getByTestId('current-step')).toHaveTextContent('Step 1 of 3');
    });

    it('should preserve data when navigating back', () => {
      render(<MockApplicationForm />);
      fireEvent.change(screen.getByTestId('firstName-input'), { target: { value: 'John' } });
      fireEvent.change(screen.getByTestId('lastName-input'), { target: { value: 'Doe' } });
      fireEvent.change(screen.getByTestId('email-input'), { target: { value: 'john@test.com' } });
      fireEvent.change(screen.getByTestId('phone-input'), { target: { value: '555-1234' } });
      fireEvent.click(screen.getByTestId('next-btn'));
      fireEvent.click(screen.getByTestId('back-btn'));

      expect(screen.getByTestId('firstName-input').value).toBe('John');
      expect(screen.getByTestId('lastName-input').value).toBe('Doe');
    });
  });

  describe('Step 2 Validation', () => {
    const goToStep2 = () => {
      fireEvent.change(screen.getByTestId('firstName-input'), { target: { value: 'John' } });
      fireEvent.change(screen.getByTestId('lastName-input'), { target: { value: 'Doe' } });
      fireEvent.change(screen.getByTestId('email-input'), { target: { value: 'john@test.com' } });
      fireEvent.change(screen.getByTestId('phone-input'), { target: { value: '555-1234' } });
      fireEvent.click(screen.getByTestId('next-btn'));
    };

    it('should show validation errors on step 2 when fields empty', () => {
      render(<MockApplicationForm />);
      goToStep2();
      fireEvent.click(screen.getByTestId('next-btn'));

      expect(screen.getByTestId('address-error')).toBeInTheDocument();
      expect(screen.getByTestId('city-error')).toBeInTheDocument();
      expect(screen.getByTestId('state-error')).toBeInTheDocument();
    });

    it('should advance to review step when step 2 is valid', () => {
      render(<MockApplicationForm />);
      goToStep2();
      fireEvent.change(screen.getByTestId('address-input'), { target: { value: '123 Main St' } });
      fireEvent.change(screen.getByTestId('city-input'), { target: { value: 'Springfield' } });
      fireEvent.change(screen.getByTestId('state-input'), { target: { value: 'IL' } });
      fireEvent.change(screen.getByTestId('housing-select'), { target: { value: 'House' } });
      fireEvent.change(screen.getByTestId('own-rent-select'), { target: { value: 'Own' } });
      fireEvent.click(screen.getByTestId('next-btn'));

      expect(screen.getByTestId('current-step')).toHaveTextContent('Step 3 of 3');
      expect(screen.getByTestId('step-2-content')).toBeInTheDocument();
    });
  });

  describe('Review Step', () => {
    const goToReview = () => {
      fireEvent.change(screen.getByTestId('firstName-input'), { target: { value: 'John' } });
      fireEvent.change(screen.getByTestId('lastName-input'), { target: { value: 'Doe' } });
      fireEvent.change(screen.getByTestId('email-input'), { target: { value: 'john@test.com' } });
      fireEvent.change(screen.getByTestId('phone-input'), { target: { value: '555-1234' } });
      fireEvent.click(screen.getByTestId('next-btn'));
      fireEvent.change(screen.getByTestId('address-input'), { target: { value: '123 Main St' } });
      fireEvent.change(screen.getByTestId('city-input'), { target: { value: 'Springfield' } });
      fireEvent.change(screen.getByTestId('state-input'), { target: { value: 'IL' } });
      fireEvent.change(screen.getByTestId('housing-select'), { target: { value: 'House' } });
      fireEvent.change(screen.getByTestId('own-rent-select'), { target: { value: 'Own' } });
      fireEvent.click(screen.getByTestId('next-btn'));
    };

    it('should display all entered data in review', () => {
      render(<MockApplicationForm />);
      goToReview();

      expect(screen.getByTestId('review-name')).toHaveTextContent('John Doe');
      expect(screen.getByTestId('review-email')).toHaveTextContent('john@test.com');
      expect(screen.getByTestId('review-phone')).toHaveTextContent('555-1234');
      expect(screen.getByTestId('review-address')).toHaveTextContent('123 Main St, Springfield, IL');
      expect(screen.getByTestId('review-housing')).toHaveTextContent('House (Own)');
    });

    it('should show Submit button on review step', () => {
      render(<MockApplicationForm />);
      goToReview();

      expect(screen.getByTestId('submit-btn')).toBeInTheDocument();
      expect(screen.queryByTestId('next-btn')).not.toBeInTheDocument();
    });

    it('should call onSubmit with form data when submitted', () => {
      const handleSubmit = vi.fn();
      render(<MockApplicationForm onSubmit={handleSubmit} />);
      goToReview();

      fireEvent.click(screen.getByTestId('submit-btn'));
      expect(handleSubmit).toHaveBeenCalledWith(expect.objectContaining({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@test.com',
        phoneNumber: '555-1234',
        streetAddress: '123 Main St',
        city: 'Springfield',
        state: 'IL',
        housing: 'House',
        housingType: 'Own'
      }));
    });
  });

  describe('Step Indicator', () => {
    it('should render all step labels', () => {
      render(<MockApplicationForm />);
      expect(screen.getByTestId('step-0')).toHaveTextContent('Personal Information');
      expect(screen.getByTestId('step-1')).toHaveTextContent('Housing Details');
      expect(screen.getByTestId('step-2')).toHaveTextContent('Review & Submit');
    });

    it('should mark current step as active', () => {
      render(<MockApplicationForm />);
      expect(screen.getByTestId('step-0').className).toContain('active');
      expect(screen.getByTestId('step-1').className).toContain('pending');
    });

    it('should mark completed steps', () => {
      render(<MockApplicationForm />);
      fireEvent.change(screen.getByTestId('firstName-input'), { target: { value: 'J' } });
      fireEvent.change(screen.getByTestId('lastName-input'), { target: { value: 'D' } });
      fireEvent.change(screen.getByTestId('email-input'), { target: { value: 'j@t.com' } });
      fireEvent.change(screen.getByTestId('phone-input'), { target: { value: '5' } });
      fireEvent.click(screen.getByTestId('next-btn'));

      expect(screen.getByTestId('step-0').className).toContain('completed');
      expect(screen.getByTestId('step-1').className).toContain('active');
    });
  });

  describe('Error Clearing', () => {
    it('should clear errors when user starts typing', () => {
      render(<MockApplicationForm />);
      fireEvent.click(screen.getByTestId('next-btn'));
      expect(screen.getByTestId('firstName-error')).toBeInTheDocument();

      fireEvent.change(screen.getByTestId('firstName-input'), { target: { value: 'J' } });
      expect(screen.queryByTestId('firstName-error')).not.toBeInTheDocument();
    });
  });
});
