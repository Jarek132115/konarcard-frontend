// src/hooks/useAuthUser.js
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';

export const useAuthUser = () => {
  return useQuery({
    queryKey: ['authUser'],
    queryFn: async () => {
      const res = await api.get('/profile');
      const data = res?.data?.data || null;

      if (!data) {
        throw new Error('Failed to load user');
      }

      return data;
    },
    retry: false,
    staleTime: 60_000,
  });
};
