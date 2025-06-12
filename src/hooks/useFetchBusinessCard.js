import { useQuery } from "@tanstack/react-query";
// Ensure the import path is correct for the now .js file
import { api } from '../services/api'; // CORRECTED PATH
export const useFetchBusinessCard = (userId) => { // Removed type annotation for userId
  return useQuery({
    queryKey: ["business-card", userId],
    queryFn: async () => {
      // Removed type annotation for res
      const { data } = await api(`/api/business-card/my_card?userId=${userId}`); // Changed from ?user= to ?userId= based on typical backend query param name
      return data; // Assuming api returns { data, status, ok } and we want the actual data
    },
    enabled: !!userId, // only run when userId is available
  });
};