import { useQuery } from "@tanstack/react-query";
import api from '../services/api'; // <--- CRUCIAL FIX: Changed to DEFAULT IMPORT (no curly braces)

export const useFetchBusinessCard = (userId) => {
  return useQuery({
    queryKey: ["businessCard", userId],
    queryFn: async () => {
      if (!userId) {
        return null; // Return null if no userId to prevent unnecessary API call
      }
      try {
        // CRUCIAL FIX: Use api.get() method now that 'api' is an axios instance
        const response = await api.get(`/api/business-card/my_card`);
        return response.data.data; // Backend returns { data: card }
      } catch (error) {
        console.error("Error fetching business card:", error);
        throw error; // Re-throw to let useQuery handle error state
      }
    },
    enabled: !!userId, // Only enable query if userId exists
    // Add staleTime/cacheTime or other react-query options as needed
    staleTime: 5 * 60 * 1000, // Data considered fresh for 5 minutes
    cacheTime: 10 * 60 * 1000, // Data stays in cache for 10 minutes
    retry: 1, // Retry once on failure
  });
};