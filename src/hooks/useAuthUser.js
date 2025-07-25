import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api'; 

export const useAuthUser = () => {
  return useQuery({
    queryKey: ['authUser'],
    queryFn: async () => {
      const { data } = await api('/profile', {
        method: 'GET',
        credentials: 'include',
      });
      if (!data || data.error) {
        throw new Error(data?.error || 'Failed to load user');
      }

      return data; 
    },
  });
};