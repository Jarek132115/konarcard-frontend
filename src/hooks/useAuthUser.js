import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api'; 

export const useAuthUser = () => {
  return useQuery({
    queryKey: ['authUser'],
    queryFn: async () => {
      // Removed type annotation for 'data'
      const { data } = await api('/profile', {
        method: 'GET',
        credentials: 'include',
      });
      if (!data || data.error) {
        throw new Error(data?.error || 'Failed to load user');
      }

      return data; // Return the user data
    },
  });
};