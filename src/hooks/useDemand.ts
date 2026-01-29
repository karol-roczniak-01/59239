import type { CreateDemandInput, Demand, RateLimitInfo, SearchResponse } from "@/utils/types";
import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";

// ===== API FUNCTIONS ======

export const createDemand = async (input: CreateDemandInput): Promise<Demand> => {
  const res = await fetch('/api/demand', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error('Failed to create demand');
  const data = await res.json();
  return data.demand;
};

export const searchDemand = async (query: string, userId: string): Promise<SearchResponse> => {
  const res = await fetch(`/api/demand/search?q=${encodeURIComponent(query)}&userId=${userId}`);
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to search demand');
  }
  const data = await res.json();
  return data;
};

export const fetchRateLimitStatus = async (userId: string): Promise<RateLimitInfo> => {
  const res = await fetch(`/api/demand/search/limit?userId=${userId}`);
  if (!res.ok) throw new Error('Failed to fetch rate limit status');
  const data = await res.json();
  return data;
};

export const fetchDemandById = async (demandId: string, userId?: string): Promise<{ demand: Demand, hasApplied: boolean }> => {
  const url = userId 
    ? `/api/demand/${demandId}?userId=${userId}`
    : `/api/demand/${demandId}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch demand');
  const data = await res.json();
  return data;
};

export const fetchDemandByUserId = async (userId: string): Promise<Demand[]> => {
  const res = await fetch(`/api/demand/user/${userId}`);
  if (!res.ok) throw new Error('Failed to fetch user demand');
  const data = await res.json();
  return data.demand;
};

// ===== QUERIES =====

export const demandByIdQueryOptions = (demandId: string, userId?: string) =>
  queryOptions({
    queryKey: ['demand', 'by-id', demandId, userId],
    queryFn: () => fetchDemandById(demandId, userId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,
  });

export const demandByUserIdQueryOptions = (userId: string) =>
  queryOptions({
    queryKey: ['demand', 'by-user', userId],
    queryFn: () => fetchDemandByUserId(userId),
    staleTime: 2 * 60 * 1000, // 2 minutes (user's demand might change)
    gcTime: 10 * 60 * 1000,
  });

export const searchDemandQueryOptions = (query: string, userId: string) =>
  queryOptions({
    queryKey: ['demand', 'search', query, userId],
    queryFn: () => searchDemand(query, userId),
    staleTime: 5 * 60 * 1000, // 5 minutes - keep results fresh while navigating
    gcTime: 10 * 60 * 1000, // 10 minutes - keep in cache even when unmounted
    enabled: !!query && query.length >= 30 && !!userId, // Only search if query is 30+ chars and userId exists
  });

export const rateLimitStatusQueryOptions = (userId: string) =>
  queryOptions({
    queryKey: ['rateLimit', 'status', userId],
    queryFn: () => fetchRateLimitStatus(userId),
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000,
    enabled: !!userId,
  });

// ===== MUTATIONS =====

export const useCreateDemand = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createDemand,
    onSuccess: (newDemand) => {
      // Invalidate user's demand list
      queryClient.invalidateQueries({ 
        queryKey: ['demand', 'by-user', newDemand.userId] 
      });
      
      // Optionally invalidate search results
      queryClient.invalidateQueries({ 
        queryKey: ['demand', 'search'] 
      });
    },
  });
};