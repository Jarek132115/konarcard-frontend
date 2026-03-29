// src/hooks/useAuthUser.js
import { useCallback, useContext, useMemo } from "react";
import { AuthContext } from "../components/AuthContext";

export const useAuthUser = () => {
  const { user, initialized, hydrating, fetchUser } = useContext(AuthContext);

  const refetch = useCallback(async () => {
    return await fetchUser?.();
  }, [fetchUser]);

  return useMemo(() => {
    const isLoading = !initialized || hydrating;

    return {
      data: user ?? null,
      isLoading,
      isFetching: hydrating,
      isError: false,
      error: null,
      refetch,
    };
  }, [user, initialized, hydrating, refetch]);
};