import { useQuery } from "@tanstack/react-query";
import api from "../services/api";

export const useFetchBusinessCard = (userId) => {
  return useQuery({
    queryKey: ["businessCard", userId],
    enabled: !!userId,

    queryFn: async () => {
      const res = await api.get("/api/business-card/my_card");
      return res?.data?.data ?? null;
    },

    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000, // ✅ react-query v5 uses gcTime (cacheTime is deprecated)
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,

    // ✅ Only retry if it's NOT a 404
    retry: (failureCount, error) => {
      const status = error?.response?.status;
      if (status === 404) return false;
      return failureCount < 1;
    },

    // ✅ Don't spam console repeatedly (keep a single clean warning)
    onError: (error) => {
      const status = error?.response?.status;
      if (status === 404) {
        console.warn("Business card not found yet (404).");
        return;
      }
      console.error("Error fetching business card:", error);
    },
  });
};
