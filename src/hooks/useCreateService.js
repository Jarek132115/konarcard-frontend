import { useMutation } from "@tanstack/react-query";
import { api } from '../services/api'; // Ensure correct path for the .js file

// Removed TypeScript interface definition (ServiceData)

export const useCreateService = () => {
  return useMutation({
    mutationFn: (data) => { // Removed type annotation for data
      // Note: The /api/service/create_service endpoint (if this is for a standalone Service model)
      // would need to be defined in your backend's serviceRoutes.js and protected by JWT.
      // Current MyProfile.jsx uses buildBusinessCardFormData to save services embedded in BusinessCard.
      return api("/api/service/create_service", { // Assumed backend route path
        method: "POST",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json",
        },
      });
    },
  });
};