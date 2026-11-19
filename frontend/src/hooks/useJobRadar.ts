import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getSummary,
  getListings,
  getListingDetail,
  getChanges,
  reviewChange,
  getSources,
  getRuns,
  triggerRefresh,
  getTracker,
  updateTracker,
  getMetrics,
} from '../lib/api';
import type { TrackerItem, TrackerStage } from '../types';

export function useSummary() {
  return useQuery({
    queryKey: ['summary'],
    queryFn: getSummary,
    refetchInterval: 30000, // Background refresh every 30s
  });
}

export function useListings(params?: Record<string, string | number | boolean | undefined | null>) {
  return useQuery({
    queryKey: ['listings', params],
    queryFn: () => getListings(params),
    placeholderData: (previousData) => previousData,
  });
}

export function useListingDetail(entityId: string | null) {
  return useQuery({
    queryKey: ['listing', entityId],
    queryFn: () => (entityId ? getListingDetail(entityId) : null),
    enabled: !!entityId,
  });
}

export function useChanges(params?: Record<string, string | number | undefined | null>) {
  return useQuery({
    queryKey: ['changes', params],
    queryFn: () => getChanges(params),
  });
}

export function useReviewChange() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action }: { id: number; action: 'verify' | 'dismiss' }) =>
      reviewChange(id, action),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['changes'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
    },
  });
}

export function useSources() {
  return useQuery({
    queryKey: ['sources'],
    queryFn: getSources,
    refetchInterval: 60000,
  });
}

export function useRuns(sourceId?: string, page: number = 1) {
  return useQuery({
    queryKey: ['runs', sourceId, page],
    queryFn: () => getRuns(sourceId, page),
  });
}

export function useRefresh() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body?: { source_id?: string; mode?: 'live' | 'fixture' }) =>
      triggerRefresh(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['summary'] });
      queryClient.invalidateQueries({ queryKey: ['sources'] });
      queryClient.invalidateQueries({ queryKey: ['runs'] });
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      queryClient.invalidateQueries({ queryKey: ['changes'] });
    },
  });
}

export function useTracker() {
  return useQuery({
    queryKey: ['tracker'],
    queryFn: getTracker,
  });
}

export function useUpdateTracker() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      entityId,
      status,
      notes,
    }: {
      entityId: string;
      status: TrackerStage | string;
      notes?: string | null;
    }) => updateTracker(entityId, status, notes),
    onMutate: async ({ entityId, status, notes }) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['tracker'] });
      const previous = queryClient.getQueryData<TrackerItem[]>(['tracker']);
      if (previous) {
        const next = [...previous];
        const idx = next.findIndex((item) => item.entity_id === entityId);
        if (idx >= 0) {
          next[idx] = { ...next[idx], status: status as TrackerStage, notes: notes ?? next[idx].notes };
        } else {
          next.push({
            entity_id: entityId,
            status: status as TrackerStage,
            notes: notes ?? null,
            updated_at: new Date().toISOString(),
          });
        }
        queryClient.setQueryData(['tracker'], next);
      }
      return { previous };
    },
    onError: (_err, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['tracker'], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tracker'] });
    },
  });
}

export function useMetrics() {
  return useQuery({
    queryKey: ['metrics'],
    queryFn: getMetrics,
  });
}
