import { useShare } from '../hooks/useShare.js';

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
        <div className="overflow-x-auto mt-2">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50">
                {Object.keys(value[0] as Record<string, unknown>).map((key) => (
                  <th key={key} className="text-left pb-2 pr-4 font-semibold text-neutral-600 uppercase tracking-widest text-[10px]">
                    {key}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {value.map((item, rowIndex) => (
                <tr key={rowIndex} className="hover:bg-neutral-50/50 transition-colors">
                  {Object.values(item as Record<string, unknown>).map((cell, cellIndex) => (
                    <td key={cellIndex} className="pb-2 pr-4 text-neutral-700 align-top">
                      {renderSnapshotValue(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
    return (
      <ul className="list-disc list-inside mt-2 space-y-1 text-sm text-neutral-700">
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
      <div className="mt-2 space-y-1 text-sm text-neutral-700">
        {Object.entries(value as Record<string, unknown>).map(([k, v]) => (
          <div key={k} className="flex gap-2 break-words">
            <span className="text-neutral-500 font-medium text-[11px] uppercase">{k}:</span>
            {renderSnapshotValue(v)}
          </div>
        ))}
      </div>
    );
  }
  return <span className="text-neutral-700">{String(value)}</span>;
}

export function SharedReportView({ shareId, onClose }: SharedReportViewProps) {
  const { data: snapshot, isLoading, error } = useShare(shareId);

  if (isLoading) {
    return (
      <div className="card p-8 text-center">
        <p className="text-neutral-500">Loading shared report…</p>
      </div>
    );
  }

  if (error || !snapshot) {
    return (
      <div className="card p-8 text-center">
        <h3 className="text-sm font-semibold text-red-800 mb-2">Shared report not found</h3>
        <p className="text-sm text-neutral-600 mb-4">
          This link may have expired or does not exist. Share links are retained for 7 days.
        </p>
        <button
          onClick={onClose}
          className="px-3 py-1.5 text-sm font-medium rounded-lg border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  const expiresAt = new Date(snapshot.expiresAt).toLocaleString();
  const createdAt = new Date(snapshot.createdAt).toLocaleString();

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-neutral-900">{snapshot.title}</h1>
          <p className="text-sm text-neutral-500">
            Shared snapshot • {snapshot.tab} • Created {createdAt} • Expires {expiresAt}
          </p>
        </div>
        <button
          onClick={onClose}
          className="px-3 py-1.5 text-sm font-medium rounded-lg border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50"
        >
          ← Back to Dashboard
        </button>
      </div>

      <div className="card p-6">
        <div className="mb-4">
          <h2 className="text-sm font-semibold text-neutral-700 uppercase tracking-wider mb-3">Report Data</h2>
          <div className="space-y-4">
            {Object.entries(snapshot.data).map(([key, value]) => (
              <div key={key}>
                <h3 className="text-sm font-medium text-primary-700 mb-1">{key}</h3>
                {renderSnapshotValue(value)}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-neutral-200 text-xs text-neutral-400">
          This is a read-only shared snapshot. No live ADO data is fetched. The snapshot expires on{' '}
          {expiresAt}.
        </div>
      </div>
    </div>
  );
}
