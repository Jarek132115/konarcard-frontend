import { useMutation } from "@tanstack/react-query";
import { api } from "../services/api";

type ServiceData = {
  service_name: string;
  service_details: string;
  user: string;
};

export const useCreateService = () => {
  return useMutation({
    mutationFn: (data: ServiceData) => {
      return api("/create_service", {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json",
        },
      });
    },
  });
};
