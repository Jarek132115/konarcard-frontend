import { useMutation } from "@tanstack/react-query";
import { api } from '../services/api'; // Ensure correct path for the .js file

// Removed TypeScript interface definitions (WorkItem, WorksData)

export const buildWorksFormData = (data) => { // Removed type annotation for data
  const formData = new FormData();

  formData.append("user", data.user);

  data.works.forEach((work) => {
    // Note: The 'work_name' field here might not align with the 'works' array in BusinessCard model
    // which is currently just an array of image URLs (strings).
    // If you intend to save a 'name' per work item, your BusinessCard schema's 'works' array
    // would need to be updated to store objects like { name: string, imageUrl: string }.
    formData.append("work_name", work.work_name || ""); // Ensure it's a string, even if empty

    // This handles multiple images per work item, but the current BusinessCard.works is simpler.
    work.work_images.forEach((image) => {
      formData.append("work_images", image);
    });
  });

  return formData;
};

export const useCreateWorks = () => {
  return useMutation({
    mutationFn: (formData) => { // Removed type annotation for formData
      // Note: This endpoint '/add_works/' is not part of the current business card creation/update flow.
      // The current MyProfile.jsx uses buildBusinessCardFormData (from useCreateBiz)
      // to handle work image uploads directly within the main business card save.
      // If you are creating a separate system for managing individual 'Work' documents,
      // you would need corresponding backend routes (e.g., in workRoutes.js) and controllers.
      return api("/api/works/add_works", { // Adjusted to a more common API prefix
        method: "POST",
        body: formData,
        // The 'api' utility already handles 'Content-Type' for FormData automatically,
        // so explicitly setting 'Content-Type': 'multipart/form-data' is usually not needed here
        // and can sometimes cause issues if it's explicitly set.
        // headers: { "Content-Type": "multipart/form-data" }, // Removed as 'api' handles it.
      });
    },
  });
};