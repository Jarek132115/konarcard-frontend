import { useMutation } from "@tanstack/react-query";
import { api } from '../services/api'; // Ensure correct path for the .js file

// Removed TypeScript interface definition (BusinessCardData)

export const buildBusinessCardFormData = (data) => { // Removed type annotation for data
  const formData = new FormData();

  formData.append("business_card_name", data.business_card_name || "");
  formData.append("page_theme", data.page_theme || "light");
  formData.append("style", data.style || "Inter");
  formData.append("main_heading", data.main_heading || "");
  formData.append("sub_heading", data.sub_heading || "");
  formData.append("user", data.user); // The backend will prioritize JWT userId, but still good to send
  formData.append("bio", data.bio || "");
  formData.append("job_title", data.job_title || "");
  formData.append("full_name", data.full_name || "");

  // Handle cover photo: send file if present, or flag removal
  if (data.cover_photo instanceof File) { // Check if it's a new File object
    formData.append("cover_photo", data.cover_photo);
  } else if (data.cover_photo === null) { // If explicitly set to null (removed by user)
    formData.append("cover_photo_removed", "true");
  }

  // Handle avatar: send file if present, or flag removal
  if (data.avatar instanceof File) { // Check if it's a new File object
    formData.append("avatar", data.avatar);
  } else if (data.avatar === null) { // If explicitly set to null (removed by user)
    formData.append("avatar_removed", "true");
  }

  // Handle work images: send new files and existing URLs
  if (data.works && data.works.length > 0) {
    data.works.forEach((workImage) => {
      if (workImage.file instanceof File) { // It's a new file to upload
        formData.append(`work_images`, workImage.file);
      } else if (workImage.preview && !workImage.preview.startsWith('blob:')) {
        // It's an existing S3 URL to retain
        formData.append(`existing_works`, workImage.preview);
      }
    });
  }

  // Convert services and reviews arrays to JSON strings
  if (data.services) {
    formData.append("services", JSON.stringify(data.services));
  }

  if (data.reviews) {
    formData.append("reviews", JSON.stringify(data.reviews));
  }

  formData.append("contact_email", data.contact_email || "");
  formData.append("phone_number", data.phone_number || "");

  return formData;
};

export const useCreateBusinessCard = () => {
  return useMutation({
    mutationFn: (formData) => // Removed type annotation for formData
      api("/api/business-card/create_business_card", {
        method: "POST",
        body: formData,
      }),
  });
};