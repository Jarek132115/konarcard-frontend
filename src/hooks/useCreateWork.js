import { useMutation } from "@tanstack/react-query";
import { api } from '../services/api'; // CORRECTED PATH
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
      return api("/api/works/add_works", {
        method: "POST",
        body: formData,
      });
    },
  });
};