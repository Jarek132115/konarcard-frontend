import { useQuery } from "@tanstack/react-query";
import { api } from "../services/api";

export const useFetchBusinessCard = (userId: string) => {
  return useQuery({
    queryKey: ["business-card", userId],
    queryFn: async () => {
      const res = await api(`/api/business-card/my_card?user=${userId}`);
      return res.data;
    },
    enabled: !!userId, // only run when userId is available
  });
};
