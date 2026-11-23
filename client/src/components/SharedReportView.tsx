import { useState } from 'react';
import { useShare } from '../hooks/useShare.js';
import { AISummaryCard } from './AISummaryCard.js';

interface SharedReportViewProps {
  shareId: string;
  onClose: () => void;
}

function renderSnapshotValue(value: unknown): React.ReactNode {
  if (value === null || value === undefined) {
    return <span className="text-neutral-400 italic">—</span>;
  }

  if (Array.isArray(value)) {
    if (value.length === 0) return <span className="text-neutral-400 italic">(empty)</span>;

    if (value.every((item) => typeof item === 'object' && item !== null)) {
      return (
        <div className="mt-2 overflow-x-auto">
          <ExpandableTable items={value as Record<string, unknown>[]} />
        </div>
      );
    }

    return (
      <ul className="mt-2 list-disc list-inside space-y-1 text-sm text-neutral-700">
        {value.map((item, i) => (
          <li key={i} className="break-words">
            {renderSnapshotValue(item)}
          </li>
        ))}
      </ul>
    );
  }

  if (typeof value === 'object') {
    return (
      <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2 text-sm text-neutral-700">
        {Object.entries(value as Record<string, unknown>).map(([k, v]) => (
          <div key={k} className="flex flex-col gap-0.5 break-words">
            <span className="text-neutral-500 font-medium text-[11px] uppercase shrink-0">
              {k}
            </span>
            {renderSnapshotValue(v)}
          </div>
        ))}
      </div>
    );
  }

  // String → check if it's a URL (work item link) and render as hyperlink with ID only
  if (typeof value === 'string') {
    return renderWorkItemLink(value);
  }

  return <span className="text-neutral-700">{String(value)}</span>;
}

function renderWorkItemLink(value: string): React.ReactNode {
  const urlPattern = /^https?:\/\/.+/;
  if (!urlPattern.test(value)) {
    return <span className="text-neutral-700">{value}</span>;
  }

  // Extract work item ID from Azure DevOps URL patterns:
  // .../_workitems/edit/{id} or .../workitems/{id} or trailing /{id}
  const idMatch =
    value.match(/_workitems\/edit\/(\d+)/) ||
    value.match(/\/workitems\/(\d+)/) ||
    value.match(/\/(\d+)\/?$/);

  if (idMatch) {
    return (
      <a
        href={value}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary-600 hover:text-primary-700 underline-offset-2 hover:underline font-mono"
      >
        #{idMatch[1]}
      </a>
    );
  }

  // Fallback: show as link with full URL as text (truncated)
  return (
    <a
      href={value}
      target="_blank"
      rel="noopener noreferrer"
      className="text-primary-600 hover:text-primary-700 underline-offset-2 hover:underline text-xs truncate max-w-32"
      title={value}
    >
      {value}
    </a>
  );
}

function ExpandableTable({ items }: { items: Record<string, unknown>[] }) {
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  const firstItem = items[0];
  const keys = Object.keys(firstItem);

  // Separate keys that are arrays (nested data) from regular keys
  const nestedKeys = keys.filter(k => Array.isArray(firstItem[k]) && (firstItem[k] as unknown[]).length > 0);
  const regularKeys = keys.filter(k => !nestedKeys.includes(k));
  const hasNested = nestedKeys.length > 0;

  const toggleExpand = (rowIndex: number) => {
    setExpandedRows(prev => {
      const next = new Set(prev);
      if (next.has(rowIndex)) {
        next.delete(rowIndex);
      } else {
        next.add(rowIndex);
      }
      return next;
    });
  };

  return (
    <table className="w-full text-sm border-collapse">
      <thead>
        <tr className="border-b border-neutral-200 bg-neutral-50 text-left">
          {hasNested && <th className="px-4 py-3 text-[10px] font-semibold text-neutral-600 uppercase tracking-wider shrink-0"></th>}
          {regularKeys.map(key => (
            <th
              key={key}
              className="px-4 py-3 text-left text-[10px] font-semibold text-neutral-600 uppercase tracking-wider"
            >
              {key}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-neutral-100">
        {items.map((item, rowIndex) => {
          const isExpanded = expandedRows.has(rowIndex);
          const nestedKey = nestedKeys[0]; // handle primary nested key (e.g., bugs within user stories)
          const nestedItems = nestedKey ? (item[nestedKey] as unknown[]) : null;

          const rows: React.ReactNode[] = [
            // Main row
            <tr key={`${rowIndex}-main`}>
              {hasNested && (
                <td className="px-4 py-3 text-center">
                  {nestedItems && nestedItems.length > 0 ? (
                    <button
                      onClick={() => toggleExpand(rowIndex)}
                      className="flex items-center justify-center w-6 h-6 text-neutral-400 hover:text-neutral-600 transition-colors"
                      aria-label={isExpanded ? 'Collapse' : 'Expand'}
                      aria-expanded={isExpanded}
                    >
                      <svg
                        className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  ) : (
                    <span className="text-neutral-300">—</span>
                  )}
                </td>
              )}
              {regularKeys.map(key => {
                const cellValue = item[key];
                return (
                  <td key={key} className="px-4 py-3 text-neutral-700 align-top break-words">
                    {renderSnapshotValue(cellValue)}
                  </td>
                );
              })}
            </tr>,
          ];

          // Add expanded nested rows below the main row
          if (isExpanded && nestedItems && nestedItems.length > 0) {
            // Get all keys from the first nested item for table columns
            const nestedItemKeys =
              nestedItems.length > 0 ? Object.keys(nestedItems[0] as Record<string, unknown>) : [];

            rows.push(
              <tr key={`${rowIndex}-nested`}>
                <td colSpan={hasNested ? regularKeys.length + 1 : regularKeys.length} className="p-0">
                  <div className="bg-neutral-100 border-t border-neutral-200 p-4 overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="bg-neutral-200 text-left">
                          {nestedItemKeys.map(k => (
                            <th
                              key={k}
                              className="px-4 py-2 text-[10px] font-semibold text-neutral-600 uppercase tracking-wider"
                            >
                              {k}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-200">
                        {nestedItems.map((nestedItem, ni) => (
                          <tr key={`${rowIndex}-${ni}`}>
                            {nestedItemKeys.map(k => (
                              <td
                                key={k}
                                className="px-4 py-3 text-neutral-700 align-top break-words"
                              >
                                {renderSnapshotValue(
                                  (nestedItem as Record<string, unknown>)[k]
                                )}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </td>
              </tr>
            );
          }

          return rows;
        })}
      </tbody>
    </table>
  );
}

export function SharedReportView({ shareId, onClose }: SharedReportViewProps) {
  const { data: snapshot, isLoading, error } = useShare(shareId);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="flex flex-col items-center gap-3 animate-pulse">
          <div className="h-8 w-32 bg-neutral-200 rounded w-full" />
          <div className="h-4 w-20 bg-neutral-200 rounded" />
        </div>
        <p className="text-neutral-400 text-sm mt-4">Loading shared report…</p>
      </div>
    );
  }

  if (error || !snapshot) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
        <div className="bg-red-50 p-8 rounded-xl border border-red-100 shadow-sm">
          <h3 className="text-sm font-semibold text-red-800 mb-2">Shared report not found</h3>
          <p className="text-sm text-neutral-600 mb-6">
            This link may have expired or does not exist. Share links are retained for 7 days.
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const expiresAt = new Date(snapshot.expiresAt).toLocaleString();
  const createdAt = new Date(snapshot.createdAt).toLocaleString();

  return (
    <div className="px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-primary-100 text-primary-700 text-xs font-semibold uppercase tracking-wider mb-2">
              📊 {snapshot.tab}
            </span>
            <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">
              {snapshot.title}
            </h1>
            <p className="text-neutral-500 text-sm mt-1">
              Shared snapshot &nbsp;•&nbsp; Created {createdAt} &nbsp;•&nbsp; Expires {expiresAt}
            </p>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium rounded-lg border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50 transition-colors"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>

      {/* AI Summary Section */}
      <div className="mb-8">
        <AISummaryCard tab={snapshot.tab} data={snapshot.data} context={snapshot.title} />
      </div>

      {/* Report Data Section */}
      <div className="card p-0 rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-100 bg-neutral-50">
          <h2 className="text-sm font-semibold text-neutral-700 uppercase tracking-wider mb-0">
            Report Data
          </h2>
        </div>
        <div className="p-6">
          <div className="space-y-8">
            {Object.entries(snapshot.data).map(([key, value]) => (
              <div key={key}>
                <h3 className="text-sm font-medium text-primary-700 mb-2">{key}</h3>
                {renderSnapshotValue(value)}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-neutral-100">
          <p className="text-xs text-neutral-400">
            This is a read-only shared snapshot. No live ADO data is fetched.{' '}
            <span className="font-medium text-neutral-600">
              Snapshot expires on {expiresAt}.
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
