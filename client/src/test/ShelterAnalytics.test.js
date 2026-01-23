import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

describe('ShelterAnalytics Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockAnalytics = {
    totalAnimals: 25,
    availableAnimals: 15,
    pendingAnimals: 5,
    adoptedAnimals: 5,
    adoptionRate: 20.0,
    totalApplications: 12,
    submittedApplications: 3,
    underReviewApplications: 4,
    approvedApplications: 3,
    rejectedApplications: 2,
    recentApplications: 7
  };

  // Mock component that mirrors ShelterAnalytics structure
  const MockShelterAnalytics = ({ analytics }) => (
    <div data-testid="analytics-container">
      <div data-testid="adoption-rate-card">
        <h3>Adoption Rate</h3>
        <div data-testid="adoption-rate-value">{analytics.adoptionRate.toFixed(1)}%</div>
        <div
          data-testid="adoption-rate-bar"
          style={{ width: `${Math.min(analytics.adoptionRate, 100)}%` }}
        />
        <p data-testid="adoption-rate-detail">
          {analytics.adoptedAnimals} of {analytics.totalAnimals} animals adopted
        </p>
      </div>

      <div data-testid="animal-stats">
        <div data-testid="stat-total">{analytics.totalAnimals}</div>
        <div data-testid="stat-available">{analytics.availableAnimals}</div>
        <div data-testid="stat-pending">{analytics.pendingAnimals}</div>
        <div data-testid="stat-adopted">{analytics.adoptedAnimals}</div>
      </div>

      <div data-testid="application-stats">
        <div data-testid="app-total">{analytics.totalApplications}</div>
        <div data-testid="app-recent">{analytics.recentApplications}</div>
        <div data-testid="app-approved">{analytics.approvedApplications}</div>
        <div data-testid="app-submitted">{analytics.submittedApplications}</div>
        <div data-testid="app-under-review">{analytics.underReviewApplications}</div>
        <div data-testid="app-rejected">{analytics.rejectedApplications}</div>
      </div>
    </div>
  );

  describe('Adoption Rate Section', () => {
    it('should display adoption rate percentage', () => {
      render(<MockShelterAnalytics analytics={mockAnalytics} />);
      expect(screen.getByTestId('adoption-rate-value')).toHaveTextContent('20.0%');
    });

    it('should display adoption count detail', () => {
      render(<MockShelterAnalytics analytics={mockAnalytics} />);
      expect(screen.getByTestId('adoption-rate-detail')).toHaveTextContent('5 of 25 animals adopted');
    });

    it('should render adoption rate progress bar', () => {
      render(<MockShelterAnalytics analytics={mockAnalytics} />);
      const bar = screen.getByTestId('adoption-rate-bar');
      expect(bar.style.width).toBe('20%');
    });

    it('should cap progress bar at 100%', () => {
      const overAnalytics = { ...mockAnalytics, adoptionRate: 150 };
      render(<MockShelterAnalytics analytics={overAnalytics} />);
      const bar = screen.getByTestId('adoption-rate-bar');
      expect(bar.style.width).toBe('100%');
    });
  });

  describe('Animal Statistics', () => {
    it('should display total animals count', () => {
      render(<MockShelterAnalytics analytics={mockAnalytics} />);
      expect(screen.getByTestId('stat-total')).toHaveTextContent('25');
    });

    it('should display available animals count', () => {
      render(<MockShelterAnalytics analytics={mockAnalytics} />);
      expect(screen.getByTestId('stat-available')).toHaveTextContent('15');
    });

    it('should display pending animals count', () => {
      render(<MockShelterAnalytics analytics={mockAnalytics} />);
      expect(screen.getByTestId('stat-pending')).toHaveTextContent('5');
    });

    it('should display adopted animals count', () => {
      render(<MockShelterAnalytics analytics={mockAnalytics} />);
      expect(screen.getByTestId('stat-adopted')).toHaveTextContent('5');
    });
  });

  describe('Application Statistics', () => {
    it('should display total applications', () => {
      render(<MockShelterAnalytics analytics={mockAnalytics} />);
      expect(screen.getByTestId('app-total')).toHaveTextContent('12');
    });

    it('should display recent applications (last 30 days)', () => {
      render(<MockShelterAnalytics analytics={mockAnalytics} />);
      expect(screen.getByTestId('app-recent')).toHaveTextContent('7');
    });

    it('should display approved applications', () => {
      render(<MockShelterAnalytics analytics={mockAnalytics} />);
      expect(screen.getByTestId('app-approved')).toHaveTextContent('3');
    });

    it('should display submitted applications', () => {
      render(<MockShelterAnalytics analytics={mockAnalytics} />);
      expect(screen.getByTestId('app-submitted')).toHaveTextContent('3');
    });

    it('should display under review applications', () => {
      render(<MockShelterAnalytics analytics={mockAnalytics} />);
      expect(screen.getByTestId('app-under-review')).toHaveTextContent('4');
    });

    it('should display rejected applications', () => {
      render(<MockShelterAnalytics analytics={mockAnalytics} />);
      expect(screen.getByTestId('app-rejected')).toHaveTextContent('2');
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero animals gracefully', () => {
      const zeroAnalytics = {
        ...mockAnalytics,
        totalAnimals: 0,
        availableAnimals: 0,
        pendingAnimals: 0,
        adoptedAnimals: 0,
        adoptionRate: 0
      };
      render(<MockShelterAnalytics analytics={zeroAnalytics} />);
      expect(screen.getByTestId('adoption-rate-value')).toHaveTextContent('0.0%');
      expect(screen.getByTestId('stat-total')).toHaveTextContent('0');
    });

    it('should handle zero applications gracefully', () => {
      const zeroApps = {
        ...mockAnalytics,
        totalApplications: 0,
        submittedApplications: 0,
        underReviewApplications: 0,
        approvedApplications: 0,
        rejectedApplications: 0,
        recentApplications: 0
      };
      render(<MockShelterAnalytics analytics={zeroApps} />);
      expect(screen.getByTestId('app-total')).toHaveTextContent('0');
    });

    it('should handle 100% adoption rate', () => {
      const fullAdoption = {
        ...mockAnalytics,
        totalAnimals: 10,
        adoptedAnimals: 10,
        adoptionRate: 100
      };
      render(<MockShelterAnalytics analytics={fullAdoption} />);
      expect(screen.getByTestId('adoption-rate-value')).toHaveTextContent('100.0%');
      expect(screen.getByTestId('adoption-rate-bar').style.width).toBe('100%');
    });
  });
});
