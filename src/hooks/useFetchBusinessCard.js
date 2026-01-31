// src/hooks/useFetchBusinessCard.js
import { useQuery } from "@tanstack/react-query";
import api from "../services/api";

export const useFetchBusinessCard = (userId) => {
  return useQuery({
    queryKey: ["businessCard", userId],
    enabled: !!userId,

    queryFn: async () => {
      // Backend route: GET /api/business-card/my_card
      // Backend returns: card object directly (NOT { data: card })

      // IMPORTANT:
      // - If your api.baseURL already includes "/api", change this to:
      //   api.get("/business-card/my_card")
      const res = await api.get("/api/business-card/my_card");
      return res?.data ?? null;
    },

    staleTime: 5 * 60 * 1000,

    // TanStack Query v5 uses gcTime (v4 uses cacheTime)
    gcTime: 10 * 60 * 1000,

    refetchOnWindowFocus: false,
    refetchOnReconnect: false,

    // Don't retry 404 (means no card yet)
    retry: (failureCount, error) => {
      const status = error?.response?.status;
      if (status === 404) return false;
      return failureCount < 1;
    },
  });
};
