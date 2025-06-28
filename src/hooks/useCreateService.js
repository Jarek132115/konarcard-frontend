import { useMutation } from "@tanstack/react-query";
import api from '../services/api'; // <--- CRUCIAL FIX: Changed to DEFAULT IMPORT (no curly braces)

export const useCreateService = () => {
  return useMutation({
    mutationFn: (data) => {
      // CRUCIAL FIX: Use api.post() method now that 'api' is an axios instance.
      // Pass 'data' object directly, api.post will handle JSON.stringify and Content-Type.
      return api.post("/api/service/create_service", data);
    },
  });
};