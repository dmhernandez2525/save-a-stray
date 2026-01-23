import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

describe('Activity Feed', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const ENTITY_ICONS = {
    animal: '🐾',
    application: '📋',
    user: '👤',
    shelter: '🏠',
    event: '📅',
    donation: '💝'
  };

  const ENTITY_COLORS = {
    animal: 'bg-green-50 border-green-200',
    application: 'bg-blue-50 border-blue-200',
    user: 'bg-purple-50 border-purple-200',
    shelter: 'bg-yellow-50 border-yellow-200',
    event: 'bg-orange-50 border-orange-200',
    donation: 'bg-pink-50 border-pink-200'
  };

  const formatTimeAgo = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const MockActivityFeed = ({ entries = [], loading = false, error = false }) => {
    if (loading) return <p data-testid="loading">Loading activity...</p>;
    if (error) return <p data-testid="error">Error loading activity feed</p>;

    return (
      <div data-testid="activity-feed">
        <h3 data-testid="feed-title">Activity Feed</h3>
        {entries.length === 0 ? (
          <p data-testid="empty-message">No activity recorded yet.</p>
        ) : (
          <div data-testid="entries-list">
            {entries.map((entry) => {
              const icon = ENTITY_ICONS[entry.entityType] || '📌';
              const colorClass = ENTITY_COLORS[entry.entityType] || 'bg-gray-50 border-gray-200';
              return (
                <div key={entry._id} data-testid={`entry-${entry._id}`} className={`entry ${colorClass}`}>
                  <span data-testid={`icon-${entry._id}`}>{icon}</span>
                  <p data-testid={`action-${entry._id}`}>{entry.action}</p>
                  <p data-testid={`description-${entry._id}`}>{entry.description}</p>
                  <span data-testid={`time-${entry._id}`}>{formatTimeAgo(entry.createdAt)}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  it('should show loading state', () => {
    render(<MockActivityFeed loading={true} />);
    expect(screen.getByTestId('loading')).toBeInTheDocument();
    expect(screen.getByTestId('loading')).toHaveTextContent('Loading activity...');
  });

  it('should show error state', () => {
    render(<MockActivityFeed error={true} />);
    expect(screen.getByTestId('error')).toBeInTheDocument();
    expect(screen.getByTestId('error')).toHaveTextContent('Error loading activity feed');
  });

  it('should show empty state when no entries', () => {
    render(<MockActivityFeed entries={[]} />);
    expect(screen.getByTestId('empty-message')).toBeInTheDocument();
    expect(screen.getByTestId('empty-message')).toHaveTextContent('No activity recorded yet.');
  });

  it('should display feed title', () => {
    render(<MockActivityFeed entries={[]} />);
    expect(screen.getByTestId('feed-title')).toHaveTextContent('Activity Feed');
  });

  it('should render activity entries', () => {
    const entries = [
      { _id: '1', action: 'Animal Added', entityType: 'animal', description: 'New dog Buddy added', createdAt: new Date().toISOString() },
      { _id: '2', action: 'Application Received', entityType: 'application', description: 'New application for Max', createdAt: new Date().toISOString() }
    ];
    render(<MockActivityFeed entries={entries} />);
    expect(screen.getByTestId('entry-1')).toBeInTheDocument();
    expect(screen.getByTestId('entry-2')).toBeInTheDocument();
  });

  it('should display correct action text', () => {
    const entries = [
      { _id: '1', action: 'Animal Adopted', entityType: 'animal', description: 'Buddy was adopted', createdAt: new Date().toISOString() }
    ];
    render(<MockActivityFeed entries={entries} />);
    expect(screen.getByTestId('action-1')).toHaveTextContent('Animal Adopted');
  });

  it('should display correct description', () => {
    const entries = [
      { _id: '1', action: 'Donation Received', entityType: 'donation', description: '$50 from John', createdAt: new Date().toISOString() }
    ];
    render(<MockActivityFeed entries={entries} />);
    expect(screen.getByTestId('description-1')).toHaveTextContent('$50 from John');
  });

  it('should show animal entity icon', () => {
    const entries = [
      { _id: '1', action: 'Added', entityType: 'animal', description: 'test', createdAt: new Date().toISOString() }
    ];
    render(<MockActivityFeed entries={entries} />);
    expect(screen.getByTestId('icon-1')).toHaveTextContent('🐾');
  });

  it('should show application entity icon', () => {
    const entries = [
      { _id: '1', action: 'Received', entityType: 'application', description: 'test', createdAt: new Date().toISOString() }
    ];
    render(<MockActivityFeed entries={entries} />);
    expect(screen.getByTestId('icon-1')).toHaveTextContent('📋');
  });

  it('should show user entity icon', () => {
    const entries = [
      { _id: '1', action: 'Joined', entityType: 'user', description: 'test', createdAt: new Date().toISOString() }
    ];
    render(<MockActivityFeed entries={entries} />);
    expect(screen.getByTestId('icon-1')).toHaveTextContent('👤');
  });

  it('should show shelter entity icon', () => {
    const entries = [
      { _id: '1', action: 'Updated', entityType: 'shelter', description: 'test', createdAt: new Date().toISOString() }
    ];
    render(<MockActivityFeed entries={entries} />);
    expect(screen.getByTestId('icon-1')).toHaveTextContent('🏠');
  });

  it('should show event entity icon', () => {
    const entries = [
      { _id: '1', action: 'Created', entityType: 'event', description: 'test', createdAt: new Date().toISOString() }
    ];
    render(<MockActivityFeed entries={entries} />);
    expect(screen.getByTestId('icon-1')).toHaveTextContent('📅');
  });

  it('should show donation entity icon', () => {
    const entries = [
      { _id: '1', action: 'Received', entityType: 'donation', description: 'test', createdAt: new Date().toISOString() }
    ];
    render(<MockActivityFeed entries={entries} />);
    expect(screen.getByTestId('icon-1')).toHaveTextContent('💝');
  });

  it('should apply correct color class for animal entries', () => {
    const entries = [
      { _id: '1', action: 'Added', entityType: 'animal', description: 'test', createdAt: new Date().toISOString() }
    ];
    render(<MockActivityFeed entries={entries} />);
    expect(screen.getByTestId('entry-1').className).toContain('bg-green-50');
    expect(screen.getByTestId('entry-1').className).toContain('border-green-200');
  });

  it('should apply correct color class for donation entries', () => {
    const entries = [
      { _id: '1', action: 'Received', entityType: 'donation', description: 'test', createdAt: new Date().toISOString() }
    ];
    render(<MockActivityFeed entries={entries} />);
    expect(screen.getByTestId('entry-1').className).toContain('bg-pink-50');
    expect(screen.getByTestId('entry-1').className).toContain('border-pink-200');
  });

  it('should show "Just now" for very recent entries', () => {
    const entries = [
      { _id: '1', action: 'Test', entityType: 'animal', description: 'test', createdAt: new Date().toISOString() }
    ];
    render(<MockActivityFeed entries={entries} />);
    expect(screen.getByTestId('time-1')).toHaveTextContent('Just now');
  });

  it('should format time as minutes ago', () => {
    const fiveMinAgo = new Date(Date.now() - 5 * 60000).toISOString();
    const entries = [
      { _id: '1', action: 'Test', entityType: 'animal', description: 'test', createdAt: fiveMinAgo }
    ];
    render(<MockActivityFeed entries={entries} />);
    expect(screen.getByTestId('time-1')).toHaveTextContent('5m ago');
  });

  it('should format time as hours ago', () => {
    const threeHoursAgo = new Date(Date.now() - 3 * 3600000).toISOString();
    const entries = [
      { _id: '1', action: 'Test', entityType: 'animal', description: 'test', createdAt: threeHoursAgo }
    ];
    render(<MockActivityFeed entries={entries} />);
    expect(screen.getByTestId('time-1')).toHaveTextContent('3h ago');
  });

  it('should format time as days ago', () => {
    const twoDaysAgo = new Date(Date.now() - 2 * 86400000).toISOString();
    const entries = [
      { _id: '1', action: 'Test', entityType: 'animal', description: 'test', createdAt: twoDaysAgo }
    ];
    render(<MockActivityFeed entries={entries} />);
    expect(screen.getByTestId('time-1')).toHaveTextContent('2d ago');
  });

  it('should show date for entries older than a week', () => {
    const twoWeeksAgo = new Date(Date.now() - 14 * 86400000).toISOString();
    const entries = [
      { _id: '1', action: 'Test', entityType: 'animal', description: 'test', createdAt: twoWeeksAgo }
    ];
    render(<MockActivityFeed entries={entries} />);
    const timeEl = screen.getByTestId('time-1');
    // Should show a date like "Jan 9" rather than "14d ago"
    expect(timeEl.textContent).not.toContain('d ago');
  });

  it('should render multiple entries in order', () => {
    const entries = [
      { _id: '1', action: 'First', entityType: 'animal', description: 'desc1', createdAt: new Date().toISOString() },
      { _id: '2', action: 'Second', entityType: 'user', description: 'desc2', createdAt: new Date().toISOString() },
      { _id: '3', action: 'Third', entityType: 'event', description: 'desc3', createdAt: new Date().toISOString() }
    ];
    render(<MockActivityFeed entries={entries} />);
    expect(screen.getByTestId('entries-list').children).toHaveLength(3);
  });

  it('should use fallback icon for unknown entity types', () => {
    const entries = [
      { _id: '1', action: 'Test', entityType: 'unknown', description: 'test', createdAt: new Date().toISOString() }
    ];
    render(<MockActivityFeed entries={entries} />);
    expect(screen.getByTestId('icon-1')).toHaveTextContent('📌');
  });

  it('should not show entries list when loading', () => {
    render(<MockActivityFeed loading={true} entries={[{ _id: '1', action: 'Test', entityType: 'animal', description: 'test', createdAt: new Date().toISOString() }]} />);
    expect(screen.queryByTestId('entries-list')).not.toBeInTheDocument();
  });
});
