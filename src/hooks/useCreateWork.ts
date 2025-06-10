import { useMutation } from "@tanstack/react-query";
import { api } from "../services/api";

type WorkItem = {
  work_name: string;
  work_images: File[];
};

type WorksData = {
  user: string;
  works: WorkItem[];
};

export const buildWorksFormData = (data: WorksData): FormData => {
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
    mutationFn: (formData: FormData) => {
      return api("/add_works/", {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    },
  });
};
