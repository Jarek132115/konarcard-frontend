// frontend/src/hooks/useFetchBusinessCard.js
import { useQuery } from "@tanstack/react-query";
import api from "../services/api";

/**
 * Fetch the logged-in user's BusinessCard (JWT-based).
 *
 * Backend:
 *  GET /api/business-card/my_card
 *
 * Usage:
 *  const { data } = useFetchBusinessCard(userId)
 *
 * Returns:
 *  - null if no card exists yet (404)
 *  - BusinessCard object otherwise
 */
export const useFetchBusinessCard = (userId) => {
  return useQuery({
    // IMPORTANT: same key as useMyBusinessCard so cache is shared
    queryKey: ["businessCard", "me"],

    // Only run once user is known
    enabled: !!userId,

    queryFn: async () => {
      try {
        const res = await api.get("/api/business-card/my_card");

        // Backend returns the card object directly
        return res?.data ?? null;
      } catch (err) {
        const status = err?.response?.status;

        // No card created yet
        if (status === 404) return null;

        throw err;
      }
    },

    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,   // TanStack v5

    refetchOnWindowFocus: false,
    refetchOnReconnect: false,

    retry: (failureCount, error) => {
      const status = error?.response?.status;
      if (status === 404) return false;
      return failureCount < 1;
    },
  });
};
