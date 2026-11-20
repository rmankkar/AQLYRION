import { useMutation, useQuery } from '@tanstack/react-query';
import { shareApi } from '../api/share.js';

export function useCreateShare() {
  return useMutation({
    mutationFn: ({ tab, data, title }: { tab: string; data: Record<string, unknown>; title?: string }) =>
      shareApi.createShare(tab, data, title),
  });
}

export function useShare(shareId: string) {
  return useQuery({
    queryKey: ['share', shareId],
    queryFn: () => shareApi.getShare(shareId),
    enabled: !!shareId,
    retry: 1,
  });
}
