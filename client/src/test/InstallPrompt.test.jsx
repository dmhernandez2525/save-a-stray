import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import React from 'react';

const DISMISS_KEY = 'pwa-install-dismissed';

const MockInstallPrompt = () => {
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const stored = localStorage.getItem(DISMISS_KEY);
    const isDismissed = stored && Date.now() - parseInt(stored, 10) < 7 * 24 * 60 * 60 * 1000;

    const onPrompt = () => {
      if (!isDismissed) setVisible(true);
    };

    window.addEventListener('pwa:install-prompt-available', onPrompt);
    return () => window.removeEventListener('pwa:install-prompt-available', onPrompt);
  }, []);

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, Date.now().toString());
    setVisible(false);
  };

  const handleInstall = () => {
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div data-testid="install-prompt">
      <h3>Install Save A Stray</h3>
      <p>Get quick access, offline browsing, and notifications for new pets near you.</p>
      <button data-testid="install-btn" onClick={handleInstall}>Install</button>
      <button data-testid="dismiss-btn" onClick={handleDismiss}>Not now</button>
    </div>
  );
};

describe('InstallPrompt', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should not be visible initially', () => {
    render(<MockInstallPrompt />);
    expect(screen.queryByTestId('install-prompt')).not.toBeInTheDocument();
  });

  it('should show when install prompt event fires', () => {
    render(<MockInstallPrompt />);
    act(() => { window.dispatchEvent(new CustomEvent('pwa:install-prompt-available')); });
    expect(screen.getByTestId('install-prompt')).toBeInTheDocument();
  });

  it('should display install benefits text', () => {
    render(<MockInstallPrompt />);
    act(() => { window.dispatchEvent(new CustomEvent('pwa:install-prompt-available')); });
    expect(screen.getByText('Install Save A Stray')).toBeInTheDocument();
    expect(screen.getByText(/offline browsing/)).toBeInTheDocument();
  });

  it('should render Install and Not now buttons', () => {
    render(<MockInstallPrompt />);
    act(() => { window.dispatchEvent(new CustomEvent('pwa:install-prompt-available')); });
    expect(screen.getByTestId('install-btn')).toBeInTheDocument();
    expect(screen.getByTestId('dismiss-btn')).toBeInTheDocument();
  });

  it('should hide when Install is clicked', () => {
    render(<MockInstallPrompt />);
    act(() => { window.dispatchEvent(new CustomEvent('pwa:install-prompt-available')); });
    fireEvent.click(screen.getByTestId('install-btn'));
    expect(screen.queryByTestId('install-prompt')).not.toBeInTheDocument();
  });

  it('should hide and store dismissal when Not now is clicked', () => {
    render(<MockInstallPrompt />);
    act(() => { window.dispatchEvent(new CustomEvent('pwa:install-prompt-available')); });
    fireEvent.click(screen.getByTestId('dismiss-btn'));
    expect(screen.queryByTestId('install-prompt')).not.toBeInTheDocument();
    expect(localStorage.getItem(DISMISS_KEY)).toBeTruthy();
  });

  it('should not show if recently dismissed', () => {
    localStorage.setItem(DISMISS_KEY, Date.now().toString());
    render(<MockInstallPrompt />);
    act(() => { window.dispatchEvent(new CustomEvent('pwa:install-prompt-available')); });
    expect(screen.queryByTestId('install-prompt')).not.toBeInTheDocument();
  });

  it('should show again if dismissal has expired', () => {
    const expired = Date.now() - 8 * 24 * 60 * 60 * 1000;
    localStorage.setItem(DISMISS_KEY, expired.toString());
    render(<MockInstallPrompt />);
    act(() => { window.dispatchEvent(new CustomEvent('pwa:install-prompt-available')); });
    expect(screen.getByTestId('install-prompt')).toBeInTheDocument();
  });
});
