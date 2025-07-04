import { useMutation } from "@tanstack/react-query";
import api from '../services/api'; 

export const useCreateService = () => {
  return useMutation({
    mutationFn: (data) => {
      return api.post("/api/service/create_service", data);
    },
  });
};