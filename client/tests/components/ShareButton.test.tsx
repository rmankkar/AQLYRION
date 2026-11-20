import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { ShareButton } from '../../src/components/ShareButton.js';
import { shareApi } from '../../src/api/share.js';
import { useMutation } from '@tanstack/react-query';

vi.mock('../../src/api/share.js', () => ({
  shareApi: {
    createShare: vi.fn(),
    getShare: vi.fn(),
  },
}));

const mockCreateShare = vi.mocked(shareApi.createShare);
const mockUseMutation = vi.mocked(useMutation);

const mockClipboard = {
  writeText: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
  Object.defineProperty(navigator, 'clipboard', {
    value: mockClipboard,
    configurable: true,
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('ShareButton', () => {
  it('renders with "Share" label', () => {
    mockUseMutation.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as any);

    render(<ShareButton tab="bugs" data={{ bugs: [] }} title="Bug Report" />);

    expect(screen.getByText('🔗 Share')).toBeInTheDocument();
  });

  it('calls createShare on click', () => {
    const mockMutate = vi.fn();
    mockUseMutation.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    } as any);

    render(<ShareButton tab="bugs" data={{ bugs: [] }} title="Bug Report" />);

    fireEvent.click(screen.getByText('🔗 Share'));

    expect(mockMutate).toHaveBeenCalledWith(
      { tab: 'bugs', data: { bugs: [] }, title: 'Bug Report' },
      expect.objectContaining({ onSuccess: expect.any(Function) })
    );
  });

  it('shows loading state while pending', () => {
    mockUseMutation.mockReturnValue({
      mutate: vi.fn(),
      isPending: true,
    } as any);

    render(<ShareButton tab="bugs" data={{ bugs: [] }} title="Bug Report" />);

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    // The "Share" text should not be visible when pending (spinner shown instead)
    expect(screen.queryByText('🔗 Share')).not.toBeInTheDocument();
  });

  it('copies share URL to clipboard on success', async () => {
    const mockMutate = vi.fn();
    const onSuccessFn = vi.fn();
    mockUseMutation.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    } as any);

    mockClipboard.writeText.mockResolvedValue(undefined);

    render(<ShareButton tab="bugs" data={{ bugs: [] }} title="Bug Report" />);

    fireEvent.click(screen.getByText('🔗 Share'));

    // Extract the onSuccess callback from the second argument of mutate
    expect(mockMutate).toHaveBeenCalled();
    const callArgs = mockMutate.mock.calls[0];
    const onSuccess = callArgs[1]?.onSuccess;
    expect(typeof onSuccess).toBe('function');

    // Simulate successful share creation
    await act(async () => {
      onSuccess!({ shareId: 'abc-123', shareUrl: 'http://localhost:5173/shared/abc-123' });
    });

    expect(mockClipboard.writeText).toHaveBeenCalledWith('http://localhost:5173/shared/abc-123');
    expect(screen.getByText('Copied!')).toBeInTheDocument();
  });
});
