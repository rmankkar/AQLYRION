import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCreateShare, useShare } from '../../src/hooks/useShare.js';
import { shareApi } from '../../src/api/share.js';
import { useMutation, useQuery } from '@tanstack/react-query';

vi.mock('../../src/api/share.js', () => ({
  shareApi: {
    createShare: vi.fn(),
    getShare: vi.fn(),
  },
}));

const mockCreateShare = vi.mocked(shareApi.createShare);
const mockGetShare = vi.mocked(shareApi.getShare);
const mockUseMutation = vi.mocked(useMutation);
const mockUseQuery = vi.mocked(useQuery);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('useCreateShare', () => {
  it('calls shareApi.createShare with the provided arguments', async () => {
    const mockMutate = vi.fn();
    mockUseMutation.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    } as any);

    const { result } = renderHook(() => useCreateShare());

    act(() => {
      result.current.mutate({ tab: 'bugs', data: { bugs: [] }, title: 'Bug Report' });
    });

    expect(mockUseMutation).toHaveBeenCalled();
    expect(mockMutate).toHaveBeenCalledWith({ tab: 'bugs', data: { bugs: [] }, title: 'Bug Report' });
  });

  it('is not pending by default', () => {
    mockUseMutation.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as any);

    const { result } = renderHook(() => useCreateShare());

    expect(result.current.isPending).toBe(false);
  });
});

describe('useShare', () => {
  it('calls shareApi.getShare with the shareId', async () => {
    const snapshot = {
      shareId: 'test-id',
      tab: 'bugs',
      title: 'Bug Report',
      data: { bugs: [] },
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    };
    mockGetShare.mockResolvedValue(snapshot);

    mockUseQuery.mockReturnValue({
      data: snapshot,
      isLoading: false,
      error: null,
    } as any);

    const { result } = renderHook(() => useShare('test-id'));

    expect(mockUseQuery).toHaveBeenCalledWith({
      queryKey: ['share', 'test-id'],
      queryFn: expect.any(Function),
      enabled: true,
      retry: 1,
    });
    expect(result.current.data).toEqual(snapshot);
  });

  it('is disabled when shareId is empty', () => {
    mockUseQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
    } as any);

    renderHook(() => useShare(''));

    expect(mockUseQuery).toHaveBeenCalledWith({
      queryKey: ['share', ''],
      queryFn: expect.any(Function),
      enabled: false,
      retry: 1,
    });
  });
});
