import { useMutation } from "@tanstack/react-query";
// Ensure the import path is correct for the now .js file
import { api } from '../services/api'; // CORRECTED PATH
export const useCreateService = () => {
  return useMutation({
    mutationFn: (data) => {
      return api("/api/service/create_service", { // Added /api/service/ prefix to match common backend routing
        method: "POST",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json",
        },
      });
    },
  });
};