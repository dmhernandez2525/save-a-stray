import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "./ui/button";
import { Share2, Facebook, Twitter, Mail, Copy, Check } from "lucide-react";

// =============================================================================
// Types
// =============================================================================

interface ShareButtonsProps {
  title: string;
  text: string;
  url: string;
}

interface ShareOption {
  id: string;
  label: string;
  icon: typeof Facebook;
  iconColor: string;
  action: "link" | "copy";
  getUrl?: () => string;
}

// =============================================================================
// Utilities
// =============================================================================

function buildShareUrl(platform: string, title: string, text: string, url: string): string {
  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent(`${title} - ${text}`);

  switch (platform) {
    case "facebook":
      return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
    case "twitter":
      return `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
    case "email":
      return `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${text}\n\n${url}`)}`;
    default:
      return "";
  }
}

async function copyToClipboard(text: string): Promise<boolean> {
  // Try modern clipboard API first
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fall through to fallback
    }
  }

  // Fallback for older browsers
  try {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-9999px";
    textArea.setAttribute("readonly", "");
    document.body.appendChild(textArea);
    textArea.select();
    const success = document.execCommand("copy");
    document.body.removeChild(textArea);
    return success;
  } catch {
    return false;
  }
}

// =============================================================================
// Component
// =============================================================================

/**
 * Share button with dropdown menu for sharing content on social platforms.
 * Supports Facebook, Twitter/X, Email, and copy-to-clipboard.
 */
export default function ShareButtons({ title, text, url }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const handleCopy = useCallback(async () => {
    const success = await copyToClipboard(url);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [url]);

  const menuItemClass = `flex items-center gap-3 px-4 py-2.5 text-sm text-foreground
    hover:bg-warm-gray-100 dark:hover:bg-warm-gray-700 w-full text-left transition-colors`;

  return (
    <div className="relative inline-block" ref={containerRef}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen((prev) => !prev)}
        className="gap-2"
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-controls="share-menu"
      >
        <Share2 className="h-4 w-4" aria-hidden="true" />
        Share
      </Button>

      {isOpen && (
        <div
          id="share-menu"
          ref={menuRef}
          className="absolute right-0 mt-2 w-48 bg-white dark:bg-warm-gray-800 rounded-xl shadow-lg
            border border-warm-gray-200 dark:border-warm-gray-700 z-50 py-2 animate-fade-in"
          role="menu"
          aria-label="Share options"
        >
          {/* Facebook */}
          <a
            href={buildShareUrl("facebook", title, text, url)}
            target="_blank"
            rel="noopener noreferrer"
            role="menuitem"
            className={`${menuItemClass} no-underline`}
            onClick={() => setIsOpen(false)}
          >
            <Facebook className="h-4 w-4 text-blue-600" aria-hidden="true" />
            Facebook
          </a>

          {/* Twitter */}
          <a
            href={buildShareUrl("twitter", title, text, url)}
            target="_blank"
            rel="noopener noreferrer"
            role="menuitem"
            className={`${menuItemClass} no-underline`}
            onClick={() => setIsOpen(false)}
          >
            <Twitter className="h-4 w-4 text-sky-blue-500" aria-hidden="true" />
            Twitter / X
          </a>

          {/* Email */}
          <a
            href={buildShareUrl("email", title, text, url)}
            role="menuitem"
            className={`${menuItemClass} no-underline`}
            onClick={() => setIsOpen(false)}
          >
            <Mail className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            Email
          </a>

          <div className="border-t border-warm-gray-200 dark:border-warm-gray-700 my-1" role="separator" />

          {/* Copy Link */}
          <button
            type="button"
            role="menuitem"
            onClick={handleCopy}
            className={menuItemClass}
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 text-green-500" aria-hidden="true" />
                <span className="text-green-600 dark:text-green-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                Copy Link
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
