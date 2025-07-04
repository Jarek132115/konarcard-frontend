import { useQuery } from "@tanstack/react-query";
import api from '../services/api'; 

export const useFetchBusinessCard = (userId) => {
  return useQuery({
    queryKey: ["businessCard", userId],
    queryFn: async () => {
      if (!userId) {
        return null;
      }
      try {
        const response = await api.get(`/api/business-card/my_card`);
        return response.data.data;
      } catch (error) {
        console.error("Error fetching business card:", error);
        throw error; 
      }
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, 
    cacheTime: 10 * 60 * 1000, 
    retry: 1, 
  });
};