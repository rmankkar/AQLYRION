import { useMutation, useQueryClient } from '@tanstack/react-query';
import { adoApi } from '../api/ado.js';
import type { AISummaryRequest, AISummaryResponse } from '../types/ado.js';

export function useFetchAISummary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: AISummaryRequest) => adoApi.generateAISummary(request.tab, request.data, request.context),
    onSuccess: (data: AISummaryResponse) => {
      queryClient.setQueryData(['aiSummary'], data.summary);
    },
  });
}

export function useAISummary(): string | null {
  const queryClient = useQueryClient();
  return (queryClient.getQueryData(['aiSummary']) as string | null) ?? null;
}

export function useAISummaryError(): string | null {
  const queryClient = useQueryClient();
  return (queryClient.getQueryData(['aiSummaryError']) as string | null) ?? null;
}

export function useClearAISummary() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.setQueryData(['aiSummary'], null);
    queryClient.setQueryData(['aiSummaryError'], null);
  };
}
