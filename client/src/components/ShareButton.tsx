import { useState } from 'react';
import { useCreateShare } from '../hooks/useShare.js';

interface ShareButtonProps {
  tab: string;
  data: Record<string, unknown>;
  title?: string;
}

export function ShareButton({ tab, data, title }: ShareButtonProps) {
  const createShare = useCreateShare();
  const [copied, setCopied] = useState(false);

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Fallback for browsers without clipboard API
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'absolute';
      textarea.style.left = '-9999px';
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
      } catch {
        // Ignore
      }
      document.body.removeChild(textarea);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    createShare.mutate(
      { tab, data, title },
      {
        onSuccess: (result) => {
          handleCopy(result.shareUrl);
        },
      }
    );
  };

  const isGenerating = createShare.isPending;

  return (
    <button
      onClick={handleShare}
      disabled={isGenerating}
      className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
    >
      {isGenerating ? (
        <svg className="animate-spin h-4 w-4 text-neutral-400" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      ) : (
        <span className="text-xs">🔗 Share</span>
      )}
      {copied && !isGenerating && (
        <span className="text-xs font-semibold text-green-600">Copied!</span>
      )}
    </button>
  );
}
