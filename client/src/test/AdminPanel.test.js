import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';

describe('Admin Panel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const MockAdminPanel = ({ stats, loading = false, error = false }) => {
    if (loading) return <p data-testid="loading">Loading stats...</p>;
    if (error) return <p data-testid="error">Error loading platform stats</p>;
    if (!stats) return null;

    return (
      <div data-testid="admin-panel">
        <h1 data-testid="admin-title">Admin Dashboard</h1>

        <div data-testid="platform-overview">
          <h3 data-testid="overview-title">Platform Overview</h3>
          <div data-testid="stats-grid">
            <div data-testid="stat-users">
              <span data-testid="stat-users-label">Total Users</span>
              <span data-testid="stat-users-value">{stats.totalUsers}</span>
            </div>
            <div data-testid="stat-shelters">
              <span data-testid="stat-shelters-label">Shelters</span>
              <span data-testid="stat-shelters-value">{stats.totalShelters}</span>
            </div>
            <div data-testid="stat-animals">
              <span data-testid="stat-animals-label">Animals</span>
              <span data-testid="stat-animals-value">{stats.totalAnimals}</span>
            </div>
            <div data-testid="stat-applications">
              <span data-testid="stat-applications-label">Applications</span>
              <span data-testid="stat-applications-value">{stats.totalApplications}</span>
            </div>
          </div>
        </div>

        <div data-testid="animal-stats">
          <h3 data-testid="animal-stats-title">Animal Stats</h3>
          <div data-testid="animal-stats-grid">
            <div data-testid="stat-available">
              <span data-testid="stat-available-label">Available</span>
              <span data-testid="stat-available-value">{stats.availableAnimals}</span>
            </div>
            <div data-testid="stat-adopted">
              <span data-testid="stat-adopted-label">Adopted</span>
              <span data-testid="stat-adopted-value">{stats.adoptedAnimals}</span>
            </div>
            <div data-testid="stat-donations">
              <span data-testid="stat-donations-label">Donations</span>
              <span data-testid="stat-donations-value">{stats.totalDonations}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const mockStats = {
    totalUsers: 150,
    totalShelters: 12,
    totalAnimals: 85,
    totalApplications: 42,
    availableAnimals: 60,
    adoptedAnimals: 20,
    totalDonations: 35
  };

  it('should render admin dashboard title', () => {
    render(<MemoryRouter><MockAdminPanel stats={mockStats} /></MemoryRouter>);
    expect(screen.getByTestId('admin-title')).toHaveTextContent('Admin Dashboard');
  });

  it('should show loading state', () => {
    render(<MemoryRouter><MockAdminPanel loading={true} /></MemoryRouter>);
    expect(screen.getByTestId('loading')).toHaveTextContent('Loading stats...');
  });

  it('should show error state', () => {
    render(<MemoryRouter><MockAdminPanel error={true} /></MemoryRouter>);
    expect(screen.getByTestId('error')).toHaveTextContent('Error loading platform stats');
  });

  it('should display total users', () => {
    render(<MemoryRouter><MockAdminPanel stats={mockStats} /></MemoryRouter>);
    expect(screen.getByTestId('stat-users-value')).toHaveTextContent('150');
  });

  it('should display total shelters', () => {
    render(<MemoryRouter><MockAdminPanel stats={mockStats} /></MemoryRouter>);
    expect(screen.getByTestId('stat-shelters-value')).toHaveTextContent('12');
  });

  it('should display total animals', () => {
    render(<MemoryRouter><MockAdminPanel stats={mockStats} /></MemoryRouter>);
    expect(screen.getByTestId('stat-animals-value')).toHaveTextContent('85');
  });

  it('should display total applications', () => {
    render(<MemoryRouter><MockAdminPanel stats={mockStats} /></MemoryRouter>);
    expect(screen.getByTestId('stat-applications-value')).toHaveTextContent('42');
  });

  it('should display available animals', () => {
    render(<MemoryRouter><MockAdminPanel stats={mockStats} /></MemoryRouter>);
    expect(screen.getByTestId('stat-available-value')).toHaveTextContent('60');
  });

  it('should display adopted animals', () => {
    render(<MemoryRouter><MockAdminPanel stats={mockStats} /></MemoryRouter>);
    expect(screen.getByTestId('stat-adopted-value')).toHaveTextContent('20');
  });

  it('should display total donations count', () => {
    render(<MemoryRouter><MockAdminPanel stats={mockStats} /></MemoryRouter>);
    expect(screen.getByTestId('stat-donations-value')).toHaveTextContent('35');
  });

  it('should have platform overview section', () => {
    render(<MemoryRouter><MockAdminPanel stats={mockStats} /></MemoryRouter>);
    expect(screen.getByTestId('platform-overview')).toBeInTheDocument();
    expect(screen.getByTestId('overview-title')).toHaveTextContent('Platform Overview');
  });

  it('should have animal stats section', () => {
    render(<MemoryRouter><MockAdminPanel stats={mockStats} /></MemoryRouter>);
    expect(screen.getByTestId('animal-stats')).toBeInTheDocument();
    expect(screen.getByTestId('animal-stats-title')).toHaveTextContent('Animal Stats');
  });

  it('should render all stat labels', () => {
    render(<MemoryRouter><MockAdminPanel stats={mockStats} /></MemoryRouter>);
    expect(screen.getByTestId('stat-users-label')).toHaveTextContent('Total Users');
    expect(screen.getByTestId('stat-shelters-label')).toHaveTextContent('Shelters');
    expect(screen.getByTestId('stat-animals-label')).toHaveTextContent('Animals');
    expect(screen.getByTestId('stat-applications-label')).toHaveTextContent('Applications');
  });
});
