import { useQuery } from '@tanstack/react-query';
// Ensure the import path is correct for the now .js file
import { api } from '../api/api'; // Changed from '../services/api' to '../api/api' as api.ts was moved/renamed

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