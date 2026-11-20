import { useState } from 'react';
import { formatMarkdown } from '../utils/formatters.js';
import { useFetchAISummary, useAISummary, useAISummaryError, useClearAISummary } from '../hooks/useAISummary.js';

interface AISummaryCardProps {
  tab: string;
  data: Record<string, unknown>;
  context?: string;
}

export function AISummaryCard({ tab, data, context }: AISummaryCardProps) {
  const [isOpen, setIsOpen] = useState(true);
  const fetchAISummaryMutation = useFetchAISummary();
  const summary = useAISummary();
  const error = useAISummaryError();
  const clearAISummary = useClearAISummary();

  const isGenerating = fetchAISummaryMutation.isPending;

  const handleGenerate = () => {
    fetchAISummaryMutation.mutate({ tab, data, context });
  };

  const handleDismiss = () => {
    clearAISummary();
  };

  return (
    <div className="mb-6 rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-purple-50 shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
          <span>✨</span>
          AI Summary
        </h3>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-indigo-100 hover:text-white text-xs font-medium underline underline-offset-4"
        >
          {isOpen ? 'Hide' : 'Show'}
        </button>
      </div>

      {isOpen && (
        <div className="p-4 space-y-4">
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full py-3 px-4 rounded-lg font-semibold text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:from-indigo-300 disabled:to-purple-300 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            {isGenerating ? (
              <div className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Generating insights…</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <span className="text-xs">✨ Generate AI Summary</span>
              </div>
            )}
          </button>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3">
              <div className="flex items-start gap-2">
                <span className="text-red-600">⚠️</span>
                <div>
                  <p className="text-sm font-medium text-red-800">{error}</p>
                  <button
                    onClick={handleDismiss}
                    className="mt-1 text-xs font-medium text-red-600 underline underline-offset-2 hover:text-red-800"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          )}

          {summary && (
            <div className="rounded-lg border border-indigo-100 bg-white p-4 shadow-inner">
              <div className="flex items-start gap-2 mb-2">
                <span className="text-indigo-600">📋</span>
                <h4 className="text-xs font-semibold text-indigo-700 uppercase tracking-wider">Insights</h4>
              </div>
              <p
                className="text-sm text-indigo-900/90 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: formatMarkdown(summary) }}
              />
            </div>
          )}

          {!summary && !error && !isGenerating && (
            <div className="rounded-lg border border-indigo-100 bg-indigo-50/50 p-4 text-center">
              <p className="text-xs text-indigo-500 italic">
                Click "Generate AI Summary" to get AI-powered analysis of this report view.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
