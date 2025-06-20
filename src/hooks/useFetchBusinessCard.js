import { useQuery } from "@tanstack/react-query";
import { api } from '../services/api'; 

export const useFetchBusinessCard = (userId) => {
  return useQuery({
    queryKey: ["business-card", userId],
    queryFn: async () => {
      const response = await api(`/api/business-card/my_card`, { method: 'GET' });
      return response.data;
    },
    enabled: !!userId, 
  });
};