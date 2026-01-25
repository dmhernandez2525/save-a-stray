import React, { useState, useRef, useEffect } from "react";
import { Button } from "./ui/button";
import { Share2, Facebook, Twitter, Mail, Copy, Check } from "lucide-react";

interface ShareButtonsProps {
  title: string;
  text: string;
  url: string;
}

const ShareButtons: React.FC<ShareButtonsProps> = ({ title, text, url }) => {
  const [copied, setCopied] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getShareUrl = (platform: string): string => {
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
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      // Fallback for older browsers or permission denied
      const textArea = document.createElement("textarea");
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="relative inline-block" ref={menuRef}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowMenu(!showMenu)}
        className="gap-2"
        aria-expanded={showMenu}
        aria-haspopup="menu"
      >
        <Share2 className="h-4 w-4" />
        Share
      </Button>

      {showMenu && (
        <div
          className="absolute right-0 mt-2 w-48 bg-white dark:bg-warm-gray-800 rounded-xl shadow-lg border border-warm-gray-200 dark:border-warm-gray-700 z-50 py-2 animate-fade-in"
          role="menu"
          aria-label="Share options"
        >
          <a
            href={getShareUrl("facebook")}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-warm-gray-100 dark:hover:bg-warm-gray-700 no-underline transition-colors"
          >
            <Facebook className="h-4 w-4 text-blue-600" />
            Facebook
          </a>
          <a
            href={getShareUrl("twitter")}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-warm-gray-100 dark:hover:bg-warm-gray-700 no-underline transition-colors"
          >
            <Twitter className="h-4 w-4 text-sky-blue-500" />
            Twitter / X
          </a>
          <a
            href={getShareUrl("email")}
            className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-warm-gray-100 dark:hover:bg-warm-gray-700 no-underline transition-colors"
          >
            <Mail className="h-4 w-4 text-muted-foreground" />
            Email
          </a>
          <div className="border-t border-warm-gray-200 dark:border-warm-gray-700 my-1" />
          <button
            onClick={copyToClipboard}
            className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-warm-gray-100 dark:hover:bg-warm-gray-700 w-full text-left transition-colors"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 text-green-500" />
                <span className="text-green-600 dark:text-green-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 text-muted-foreground" />
                Copy Link
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default ShareButtons;
