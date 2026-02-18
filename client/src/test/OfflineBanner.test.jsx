import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import React from 'react';

const MockOfflineBanner = ({ initialOnline = true }) => {
  const [online, setOnline] = React.useState(initialOnline);
  const [syncMessage, setSyncMessage] = React.useState(null);

  React.useEffect(() => {
    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  React.useEffect(() => {
    const handler = (e) => {
      const { replayed, remaining } = e.detail;
      if (replayed > 0) {
        setSyncMessage(`Synced ${replayed} queued action${replayed > 1 ? 's' : ''}`);
      }
      if (remaining > 0) {
        setSyncMessage(`${remaining} action${remaining > 1 ? 's' : ''} still pending`);
      }
    };
    window.addEventListener('sync-complete', handler);
    return () => window.removeEventListener('sync-complete', handler);
  }, []);

  if (online && !syncMessage) return null;

  return (
    <div data-testid="offline-banner" className={online ? 'online' : 'offline'}>
      {!online && 'You are offline. Changes will sync when reconnected.'}
      {online && syncMessage}
    </div>
  );
};

describe('OfflineBanner', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not be visible when online with no sync messages', () => {
    render(<MockOfflineBanner initialOnline={true} />);
    expect(screen.queryByTestId('offline-banner')).not.toBeInTheDocument();
  });

  it('should show offline message when offline', () => {
    render(<MockOfflineBanner initialOnline={false} />);
    expect(screen.getByTestId('offline-banner')).toBeInTheDocument();
    expect(screen.getByText(/You are offline/)).toBeInTheDocument();
  });

  it('should update when going offline', () => {
    render(<MockOfflineBanner initialOnline={true} />);
    expect(screen.queryByTestId('offline-banner')).not.toBeInTheDocument();

    act(() => { window.dispatchEvent(new Event('offline')); });
    expect(screen.getByTestId('offline-banner')).toBeInTheDocument();
    expect(screen.getByText(/You are offline/)).toBeInTheDocument();
  });

  it('should hide when coming back online', () => {
    render(<MockOfflineBanner initialOnline={false} />);
    expect(screen.getByTestId('offline-banner')).toBeInTheDocument();

    act(() => { window.dispatchEvent(new Event('online')); });
    expect(screen.queryByTestId('offline-banner')).not.toBeInTheDocument();
  });

  it('should show sync message when actions are replayed', () => {
    render(<MockOfflineBanner initialOnline={true} />);

    act(() => {
      window.dispatchEvent(new CustomEvent('sync-complete', {
        detail: { replayed: 3, remaining: 0 },
      }));
    });

    expect(screen.getByTestId('offline-banner')).toBeInTheDocument();
    expect(screen.getByText(/Synced 3 queued actions/)).toBeInTheDocument();
  });

  it('should show pending message when sync has remaining items', () => {
    render(<MockOfflineBanner initialOnline={true} />);

    act(() => {
      window.dispatchEvent(new CustomEvent('sync-complete', {
        detail: { replayed: 0, remaining: 2 },
      }));
    });

    expect(screen.getByText(/2 actions still pending/)).toBeInTheDocument();
  });

  it('should use correct singular form for single action', () => {
    render(<MockOfflineBanner initialOnline={true} />);

    act(() => {
      window.dispatchEvent(new CustomEvent('sync-complete', {
        detail: { replayed: 1, remaining: 0 },
      }));
    });

    expect(screen.getByText('Synced 1 queued action')).toBeInTheDocument();
  });

  it('should display changes will sync message', () => {
    render(<MockOfflineBanner initialOnline={false} />);
    expect(screen.getByText(/Changes will sync when reconnected/)).toBeInTheDocument();
  });
});
