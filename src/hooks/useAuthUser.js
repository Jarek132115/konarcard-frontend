import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api'; // Ensure correct path for the .js file

export const useAuthUser = () => { // Removed type annotation for useAuthUser
  return useQuery({
    queryKey: ['authUser'],
    queryFn: async () => {
      const response = await api('/profile', { // Renamed 'data' to 'response' for clarity of api utility output
        method: 'GET',
        // credentials: 'include', // This is handled by api.js or not needed for JWT
      });

      // api utility now returns { data, status, ok }. Check response.ok first.
      if (!response.ok) {
        throw new Error(response.data?.error || response.data?.message || 'Failed to load user via useAuthUser hook');
      }

      return response.data; // Return the actual user data from the response
    },
  });
};