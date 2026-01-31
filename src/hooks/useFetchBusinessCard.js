// src/hooks/useFetchBusinessCard.js
import { useQuery } from "@tanstack/react-query";
import api from "../services/api";

export const useFetchBusinessCard = (userId) => {
  return useQuery({
    queryKey: ["businessCard", userId],
    enabled: !!userId,

    queryFn: async () => {
      // ✅ Backend route: GET /api/business-card/my_card
      // ✅ Backend returns: the card object directly (NOT { data: card })
      const res = await api.get("/api/business-card/my_card");
      return res?.data ?? null;
    },

    staleTime: 5 * 60 * 1000,

    // ✅ TanStack Query v5 uses gcTime instead of cacheTime
    // If you're on v4, rename gcTime -> cacheTime
    gcTime: 10 * 60 * 1000,

    refetchOnWindowFocus: false,
    refetchOnReconnect: false,

    // ✅ Don't retry 404 (means no card yet, not a real error)
    retry: (failureCount, error) => {
      const status = error?.response?.status;
      if (status === 404) return false;
      return failureCount < 1;
    },
  });
};
