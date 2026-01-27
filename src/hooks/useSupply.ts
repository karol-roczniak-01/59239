import type { Supply } from "@/utils/types";
import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";

// Updated to include optional phone and paymentIntentId
export interface CreateSupplyInput {
  demandId: number;
  content: string;
  email: string;
  phone?: string; // Made optional
  userId: number;
  paymentIntentId: string;
}

// ===== API FUNCTIONS ======

export const createSupply = async (input: CreateSupplyInput): Promise<Supply> => {
  const res = await fetch('/api/supply', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'Failed to create supply');
  }
  const data = await res.json();
  return data.supply;
};

export const fetchSupplyById = async (supplyId: number): Promise<Supply> => {
  const res = await fetch(`/api/supply/${supplyId}`);
  if (!res.ok) throw new Error('Failed to fetch supply');
  const data = await res.json();
  return data.supply;
};

export const fetchSupplyByDemandId = async (demandId: number): Promise<Supply[]> => {
  const res = await fetch(`/api/supply/demand/${demandId}`);
  if (!res.ok) throw new Error('Failed to fetch supply for demand');
  const data = await res.json();
  return data.supply;
};

export const fetchSupplyByUserId = async (userId: number): Promise<Supply[]> => {
  const res = await fetch(`/api/supply/user/${userId}`);
  if (!res.ok) throw new Error('Failed to fetch user supply');
  const data = await res.json();
  return data.supply;
};

export const deleteSupply = async (supplyId: number): Promise<void> => {
  const res = await fetch(`/api/supply/${supplyId}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'Failed to delete supply');
  }
};

// ===== QUERIES =====

export const supplyByIdQueryOptions = (supplyId: number) =>
  queryOptions({
    queryKey: ['supply', 'by-id', supplyId],
    queryFn: () => fetchSupplyById(supplyId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,
  });

export const supplyByDemandIdQueryOptions = (demandId: number) =>
  queryOptions({
    queryKey: ['supply', 'by-demand', demandId],
    queryFn: () => fetchSupplyByDemandId(demandId),
    staleTime: 2 * 60 * 1000, // 2 minutes (supply can be added frequently)
    gcTime: 10 * 60 * 1000,
  });

export const supplyByUserIdQueryOptions = (userId: number) =>
  queryOptions({
    queryKey: ['supply', 'by-user', userId],
    queryFn: () => fetchSupplyByUserId(userId),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000,
  });

// ===== MUTATIONS =====

export const useCreateSupply = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createSupply,
    onSuccess: (newSupply) => {
      // Invalidate supply for this demand
      queryClient.invalidateQueries({ 
        queryKey: ['supply', 'by-demand', newSupply.demandId] 
      });
      
      // Invalidate user's supply list
      queryClient.invalidateQueries({ 
        queryKey: ['supply', 'by-user', newSupply.userId] 
      });
    },
  });
};

export const useDeleteSupply = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteSupply,
    onSuccess: () => {
      // Invalidate all supply queries to refresh lists
      queryClient.invalidateQueries({ 
        queryKey: ['supply'] 
      });
    },
  });
};