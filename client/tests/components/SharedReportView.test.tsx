import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SharedReportView } from '../../src/components/SharedReportView.js';
import { useShare } from '../../src/hooks/useShare.js';

vi.mock('../../src/hooks/useShare.js', () => ({
  useShare: vi.fn(),
}));

vi.mock('../../src/hooks/useAISummary.js', () => ({
  useFetchAISummary: vi.fn(() => ({ mutateAsync: vi.fn(), isPending: false })),
  useAISummary: vi.fn(() => null),
  useAISummaryError: vi.fn(() => null),
  useClearAISummary: vi.fn(() => vi.fn()),
}));

const mockUseShare = vi.mocked(useShare);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('SharedReportView', () => {
  it('renders loading state while fetching', () => {
    mockUseShare.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as any);

    render(<SharedReportView shareId='test-id' onClose={vi.fn()} />);

    expect(screen.getByText(/Loading shared report/i)).toBeInTheDocument();
  });

  it('renders not found state when snapshot is null', () => {
    mockUseShare.mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
    } as any);

    render(<SharedReportView shareId='nonexistent' onClose={vi.fn()} />);

    expect(screen.getByText(/Shared report not found/i)).toBeInTheDocument();
  });

  it('renders snapshot data when found', () => {
    const snapshot = {
      shareId: 'test-id',
      tab: 'bugs',
      title: 'Bug Report',
      data: {
        bugs: [{ id: 1, title: 'Bug 1', status: 'Open' }],
        totalOpenBugs: 1,
      },
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    };
    mockUseShare.mockReturnValue({
      data: snapshot,
      isLoading: false,
      error: null,
    } as any);

    render(<SharedReportView shareId='test-id' onClose={vi.fn()} />);

    expect(screen.getByText('Bug Report')).toBeInTheDocument();
    expect(screen.getByText('Bug 1')).toBeInTheDocument();
    expect(screen.getByText(/Back to Dashboard/i)).toBeInTheDocument();
  });

  it('calls onClose when Back button is clicked', () => {
    const onClose = vi.fn();
    const snapshot = {
      shareId: 'test-id',
      tab: 'bugs',
      title: 'Bug Report',
      data: {},
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    };
    mockUseShare.mockReturnValue({
      data: snapshot,
      isLoading: false,
      error: null,
    } as any);

    render(<SharedReportView shareId='test-id' onClose={onClose} />);

    fireEvent.click(screen.getByText(/Back to Dashboard/i));
    expect(onClose).toHaveBeenCalled();
  });
});
