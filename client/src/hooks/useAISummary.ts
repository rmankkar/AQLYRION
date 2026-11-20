import { useMutation, useQueryClient } from '@tanstack/react-query';
import { adoApi } from '../api/ado.js';
import type { AISummaryRequest, AISummaryResponse } from '../types/ado.js';

export function useFetchAISummary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: AISummaryRequest) => adoApi.generateAISummary(request.tab, request.data, request.context),
    onSuccess: (data: AISummaryResponse, variables: AISummaryRequest) => {
      queryClient.setQueryData(['aiSummary', variables.tab], data.summary);
    },
  });
}

export function useAISummary(tab: string): string | null {
  const queryClient = useQueryClient();
  return (queryClient.getQueryData(['aiSummary', tab]) as string | null) ?? null;
}

export function useAISummaryError(tab: string): string | null {
  const queryClient = useQueryClient();
  return (queryClient.getQueryData(['aiSummaryError', tab]) as string | null) ?? null;
}

export function useClearAISummary(tab: string) {
  const queryClient = useQueryClient();
  return () => {
    queryClient.setQueryData(['aiSummary', tab], null);
    queryClient.setQueryData(['aiSummaryError', tab], null);
  };
}
