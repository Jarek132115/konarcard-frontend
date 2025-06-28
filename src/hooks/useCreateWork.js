import { useMutation } from "@tanstack/react-query";
import api from '../services/api'; // <--- CRUCIAL FIX: Changed to DEFAULT IMPORT (no curly braces)

export const buildWorksFormData = (data) => {
  const formData = new FormData();

  formData.append("user", data.user);

  data.works.forEach((work) => {
    formData.append("work_name", work.work_name);

    work.work_images.forEach((image) => {
      formData.append("work_images", image);
    });
  });

  return formData;
};

export const useCreateWorks = () => {
  return useMutation({
    mutationFn: (formData) => {
      // CRUCIAL FIX: Use api.post() method now that 'api' is an axios instance.
      // Axios handles FormData automatically, no need to set Content-Type header manually.
      return api.post("/api/works/add_works", formData);
    },
  });
};