// src/hooks/useAuthUser.js
import { useQuery } from "@tanstack/react-query";
import api from "../services/api";

export const useAuthUser = () => {
  return useQuery({
    queryKey: ["authUser"],

    queryFn: async () => {
      const res = await api.get("/profile");

      const status = Number(res?.status || 0);

      // Because axios validateStatus allows <500,
      // we must manually handle auth errors
      if (status === 401 || status === 403) {
        return null;
      }

      if (status >= 400) {
        throw new Error(res?.data?.error || "Failed to load user");
      }

      const data = res?.data?.data || null;

      if (!data) {
        throw new Error("Invalid profile response");
      }

      return data;
    },

    retry: false,

    // Prevent constant refetching
    staleTime: 60 * 1000,

    // If user becomes null don't keep retrying
    refetchOnWindowFocus: false,
  });
};