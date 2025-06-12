import { useMutation } from "@tanstack/react-query";
// Ensure the import path is correct for the now .js file
import { api } from '../services/api'; // CORRECTED PATH
// Removed TypeScript interface definition (BusinessCardData)
// You can keep this as a comment for documentation if you like, but it's not functional JS
/*
type BusinessCardData = {
  business_card_name?: string;
  page_theme?: string;
  style?: string;
  main_heading?: string;
  sub_heading?: string;
  cover_photo?: File | null;
  user: string;
  bio?: string;
  job_title?: string;
  full_name?: string;
  avatar?: string | null;
  avatarFile?: File;
  workImages?: { file: File; preview: string }[];
  services?: { name: string; price: string }[];
  reviews?: { name: string; text: string; rating: number }[];
  contact_email?: string;
  phone_number?: string;
};
*/

// Removed type annotation for data
export const buildBusinessCardFormData = (data) => {
  const formData = new FormData();

  formData.append("business_card_name", data.business_card_name || "");
  formData.append("page_theme", data.page_theme || "light");
  formData.append("style", data.style || "Inter");
  formData.append("main_heading", data.main_heading || "");
  formData.append("sub_heading", data.sub_heading || "");
  formData.append("user", data.user);
  formData.append("bio", data.bio || "");
  formData.append("job_title", data.job_title || "");
  formData.append("full_name", data.full_name || "");

  if (data.cover_photo) {
    formData.append("cover_photo", data.cover_photo);
  }

  if (data.avatar) {
    formData.append("avatar", data.avatar);
  }

  if (data.works && data.works.length > 0) {
    data.works.forEach((workImage) => {
      if (workImage.file) {
        formData.append(`work_images`, workImage.file);
      } else if (workImage.preview && !workImage.preview.startsWith('blob:')) {
        formData.append(`existing_works`, workImage.preview);
      }
    });
  }

  if (data.services) {
    formData.append("services", JSON.stringify(data.services));
  }

  if (data.reviews) {
    formData.append("reviews", JSON.stringify(data.reviews));
  }

  formData.append("contact_email", data.contact_email || "");
  formData.append("phone_number", data.phone_number || "");
  // REMOVED: formData.append("website_url", data.website_url || "");

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