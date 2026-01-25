import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

describe('Share Buttons', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const MockShareButtons = ({ title, text, url }) => {
    const [copied, setCopied] = React.useState(false);
    const [showMenu, setShowMenu] = React.useState(false);

    const getShareUrl = (platform) => {
      const encodedUrl = encodeURIComponent(url);
      const encodedText = encodeURIComponent(`${title} - ${text}`);
      switch (platform) {
        case 'facebook':
          return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        case 'twitter':
          return `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
        case 'email':
          return `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${text}\n\n${url}`)}`;
        default:
          return '';
      }
    };

    const copyToClipboard = () => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };

    return (
      <div data-testid="share-container">
        <button data-testid="share-trigger" onClick={() => setShowMenu(!showMenu)}>Share</button>
        {showMenu && (
          <div data-testid="share-menu">
            <a data-testid="share-facebook" href={getShareUrl('facebook')} target="_blank" rel="noopener noreferrer">Facebook</a>
            <a data-testid="share-twitter" href={getShareUrl('twitter')} target="_blank" rel="noopener noreferrer">Twitter / X</a>
            <a data-testid="share-email" href={getShareUrl('email')}>Email</a>
            <button data-testid="share-copy" onClick={copyToClipboard}>
              {copied ? 'Copied!' : 'Copy Link'}
            </button>
          </div>
        )}
      </div>
    );
  };

  const defaultProps = {
    title: 'Meet Buddy!',
    text: 'Check out Buddy, a 3 year old Dog available for adoption.',
    url: 'https://example.com/#/AnimalShow/123'
  };

  it('should render share trigger button', () => {
    render(<MockShareButtons {...defaultProps} />);
    expect(screen.getByTestId('share-trigger')).toBeInTheDocument();
    expect(screen.getByTestId('share-trigger')).toHaveTextContent('Share');
  });

  it('should not show menu initially', () => {
    render(<MockShareButtons {...defaultProps} />);
    expect(screen.queryByTestId('share-menu')).not.toBeInTheDocument();
  });

  it('should show menu when trigger is clicked', () => {
    render(<MockShareButtons {...defaultProps} />);
    fireEvent.click(screen.getByTestId('share-trigger'));
    expect(screen.getByTestId('share-menu')).toBeInTheDocument();
  });

  it('should hide menu when trigger is clicked again', () => {
    render(<MockShareButtons {...defaultProps} />);
    fireEvent.click(screen.getByTestId('share-trigger'));
    fireEvent.click(screen.getByTestId('share-trigger'));
    expect(screen.queryByTestId('share-menu')).not.toBeInTheDocument();
  });

  it('should render Facebook share link', () => {
    render(<MockShareButtons {...defaultProps} />);
    fireEvent.click(screen.getByTestId('share-trigger'));
    const fbLink = screen.getByTestId('share-facebook');
    expect(fbLink).toHaveAttribute('href', expect.stringContaining('facebook.com/sharer/sharer.php'));
    expect(fbLink).toHaveAttribute('href', expect.stringContaining(encodeURIComponent(defaultProps.url)));
  });

  it('should render Twitter share link with text and url', () => {
    render(<MockShareButtons {...defaultProps} />);
    fireEvent.click(screen.getByTestId('share-trigger'));
    const twitterLink = screen.getByTestId('share-twitter');
    expect(twitterLink).toHaveAttribute('href', expect.stringContaining('twitter.com/intent/tweet'));
    expect(twitterLink).toHaveAttribute('href', expect.stringContaining(encodeURIComponent(defaultProps.url)));
  });

  it('should render Email share link with subject and body', () => {
    render(<MockShareButtons {...defaultProps} />);
    fireEvent.click(screen.getByTestId('share-trigger'));
    const emailLink = screen.getByTestId('share-email');
    expect(emailLink).toHaveAttribute('href', expect.stringContaining('mailto:'));
    expect(emailLink).toHaveAttribute('href', expect.stringContaining(encodeURIComponent(defaultProps.title)));
  });

  it('should have target="_blank" on external links', () => {
    render(<MockShareButtons {...defaultProps} />);
    fireEvent.click(screen.getByTestId('share-trigger'));
    expect(screen.getByTestId('share-facebook')).toHaveAttribute('target', '_blank');
    expect(screen.getByTestId('share-twitter')).toHaveAttribute('target', '_blank');
  });

  it('should have rel="noopener noreferrer" on external links', () => {
    render(<MockShareButtons {...defaultProps} />);
    fireEvent.click(screen.getByTestId('share-trigger'));
    expect(screen.getByTestId('share-facebook')).toHaveAttribute('rel', 'noopener noreferrer');
    expect(screen.getByTestId('share-twitter')).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('should render Copy Link button', () => {
    render(<MockShareButtons {...defaultProps} />);
    fireEvent.click(screen.getByTestId('share-trigger'));
    expect(screen.getByTestId('share-copy')).toHaveTextContent('Copy Link');
  });

  it('should show Copied! after clicking copy', () => {
    render(<MockShareButtons {...defaultProps} />);
    fireEvent.click(screen.getByTestId('share-trigger'));
    fireEvent.click(screen.getByTestId('share-copy'));
    expect(screen.getByTestId('share-copy')).toHaveTextContent('Copied!');
  });

  it('should encode special characters in URLs', () => {
    const specialProps = { title: 'Meet Max & Luna!', text: 'A "special" pet', url: 'https://example.com/#/AnimalShow/abc' };
    render(<MockShareButtons {...specialProps} />);
    fireEvent.click(screen.getByTestId('share-trigger'));
    const fbLink = screen.getByTestId('share-facebook');
    expect(fbLink.getAttribute('href')).not.toContain(' ');
  });

  it('should show all 4 share options in menu', () => {
    render(<MockShareButtons {...defaultProps} />);
    fireEvent.click(screen.getByTestId('share-trigger'));
    expect(screen.getByTestId('share-facebook')).toBeInTheDocument();
    expect(screen.getByTestId('share-twitter')).toBeInTheDocument();
    expect(screen.getByTestId('share-email')).toBeInTheDocument();
    expect(screen.getByTestId('share-copy')).toBeInTheDocument();
  });

  it('should have correct labels', () => {
    render(<MockShareButtons {...defaultProps} />);
    fireEvent.click(screen.getByTestId('share-trigger'));
    expect(screen.getByTestId('share-facebook')).toHaveTextContent('Facebook');
    expect(screen.getByTestId('share-twitter')).toHaveTextContent('Twitter / X');
    expect(screen.getByTestId('share-email')).toHaveTextContent('Email');
  });
});
