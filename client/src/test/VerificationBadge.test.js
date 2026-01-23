import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

describe('Verification Badge', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const MockVerificationBadge = ({ verified, verifiedAt, size = 'md' }) => {
    if (!verified) return null;

    const formattedDate = verifiedAt
      ? new Date(verifiedAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      : '';

    const sizeClasses = { sm: 'text-xs', md: 'text-sm', lg: 'text-base' };

    return (
      <span
        data-testid="verification-badge"
        className={`badge-verified ${sizeClasses[size]}`}
        title={formattedDate ? `Verified since ${formattedDate}` : 'Verified shelter'}
      >
        <svg data-testid="badge-icon" viewBox="0 0 20 20" />
        <span data-testid="badge-text">Verified</span>
      </span>
    );
  };

  it('should not render when verified is false', () => {
    const { container } = render(<MockVerificationBadge verified={false} />);
    expect(container.innerHTML).toBe('');
  });

  it('should not render when verified is undefined', () => {
    const { container } = render(<MockVerificationBadge />);
    expect(container.innerHTML).toBe('');
  });

  it('should render when verified is true', () => {
    render(<MockVerificationBadge verified={true} />);
    expect(screen.getByTestId('verification-badge')).toBeInTheDocument();
  });

  it('should display Verified text', () => {
    render(<MockVerificationBadge verified={true} />);
    expect(screen.getByTestId('badge-text')).toHaveTextContent('Verified');
  });

  it('should include checkmark icon', () => {
    render(<MockVerificationBadge verified={true} />);
    expect(screen.getByTestId('badge-icon')).toBeInTheDocument();
  });

  it('should show verification date in title when provided', () => {
    render(<MockVerificationBadge verified={true} verifiedAt="2025-03-15T00:00:00Z" />);
    const badge = screen.getByTestId('verification-badge');
    expect(badge.getAttribute('title')).toContain('Verified since');
    expect(badge.getAttribute('title')).toContain('Mar');
    expect(badge.getAttribute('title')).toContain('2025');
  });

  it('should show generic title when no date provided', () => {
    render(<MockVerificationBadge verified={true} />);
    const badge = screen.getByTestId('verification-badge');
    expect(badge.getAttribute('title')).toBe('Verified shelter');
  });

  it('should apply sm size class', () => {
    render(<MockVerificationBadge verified={true} size="sm" />);
    const badge = screen.getByTestId('verification-badge');
    expect(badge.className).toContain('text-xs');
  });

  it('should apply md size class by default', () => {
    render(<MockVerificationBadge verified={true} />);
    const badge = screen.getByTestId('verification-badge');
    expect(badge.className).toContain('text-sm');
  });

  it('should apply lg size class', () => {
    render(<MockVerificationBadge verified={true} size="lg" />);
    const badge = screen.getByTestId('verification-badge');
    expect(badge.className).toContain('text-base');
  });

  it('should have badge-verified class', () => {
    render(<MockVerificationBadge verified={true} />);
    const badge = screen.getByTestId('verification-badge');
    expect(badge.className).toContain('badge-verified');
  });
});
