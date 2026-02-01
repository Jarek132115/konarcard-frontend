// src/hooks/useCreateBiz.js
import { useMutation } from "@tanstack/react-query";
import api from "../services/api";

export const buildBusinessCardFormData = (data = {}) => {
  const formData = new FormData();

  // ---- Alias normalisation (accept camelCase from UI and snake_case for backend) ----
  const normalized = {
    // theme + typography
    page_theme: data.page_theme ?? data.pageTheme,
    page_theme_variant: data.page_theme_variant ?? data.pageThemeVariant,
    font: data.font, // mapped to 'style'

    // headings + bio
    main_heading: data.main_heading ?? data.mainHeading,
    sub_heading: data.sub_heading ?? data.subHeading,
    job_title: data.job_title,
    full_name: data.full_name,
    bio: data.bio,

    // contact
    contact_email: data.contact_email,
    phone_number: data.phone_number,

    // optional name
    business_card_name: data.business_card_name ?? data.businessName,

    // images & works
    cover_photo: data.cover_photo ?? data.coverPhoto,
    avatar: data.avatar,
    works: data.works ?? data.workImages, // mixed: urls + {file,preview} + File

    // arrays
    services: data.services,
    reviews: data.reviews,

    // existing image removal flags
    cover_photo_removed: data.cover_photo_removed,
    avatar_removed: data.avatar_removed,

    // display modes / layouts
    work_display_mode: data.work_display_mode ?? data.workDisplayMode,
    services_display_mode: data.services_display_mode ?? data.servicesDisplayMode,
    reviews_display_mode: data.reviews_display_mode ?? data.reviewsDisplayMode,
    about_me_layout: data.about_me_layout ?? data.aboutMeLayout,

    // styling
    button_bg_color: data.button_bg_color ?? data.buttonBgColor,
    button_text_color: data.button_text_color ?? data.buttonTextColor,
    text_alignment: data.text_alignment ?? data.textAlignment,

    // socials
    facebook_url: data.facebook_url,
    instagram_url: data.instagram_url,
    linkedin_url: data.linkedin_url,
    x_url: data.x_url,
    tiktok_url: data.tiktok_url,

    // ordering + visibility
    section_order: data.section_order ?? data.sectionOrder,

    show_main_section: data.show_main_section,
    show_about_me_section: data.show_about_me_section,
    show_work_section: data.show_work_section,
    show_services_section: data.show_services_section,
    show_reviews_section: data.show_reviews_section,
    show_contact_section: data.show_contact_section,
  };

  // ---- Simple string fields ----
  const simpleKeys = [
    "business_card_name",
    "page_theme",
    "page_theme_variant",
    "main_heading",
    "sub_heading",
    "job_title",
    "full_name",
    "bio",
    "contact_email",
    "phone_number",

    "work_display_mode",
    "services_display_mode",
    "reviews_display_mode",
    "about_me_layout",

    "button_bg_color",
    "button_text_color",
    "text_alignment",

    "facebook_url",
    "instagram_url",
    "linkedin_url",
    "x_url",
    "tiktok_url",
  ];

  simpleKeys.forEach((key) => {
    const val = normalized[key];
    if (val !== undefined && val !== null && val !== "") {
      formData.append(key, val);
    }
  });

  // ---- Map font -> style ----
  if (normalized.font) {
    formData.append("style", normalized.font);
  }

  // ---- Images (files) ----
  if (normalized.cover_photo instanceof File) {
    formData.append("cover_photo", normalized.cover_photo);
  }
  if (normalized.avatar instanceof File) {
    formData.append("avatar", normalized.avatar);
  }

  // ---- Works: mix of existing URLs and new files ----
  // ✅ New backend accepts BOTH "works" and "work_images".
  // We send files as "works" to match the new flow.
  // Existing URLs must be sent as "existing_works" (repeatable).
  if (Array.isArray(normalized.works)) {
    normalized.works.forEach((item) => {
      // New uploads (File)
      if (item instanceof File) {
        formData.append("works", item);
        return;
      }

      // New uploads (object with file)
      if (item && typeof item === "object" && item.file instanceof File) {
        formData.append("works", item.file);
        return;
      }

      // Existing URL (string)
      if (typeof item === "string" && item.startsWith("http")) {
        formData.append("existing_works", item);
        return;
      }

      // Existing URL (object with preview)
      if (
        item &&
        typeof item === "object" &&
        typeof item.preview === "string" &&
        item.preview.startsWith("http")
      ) {
        formData.append("existing_works", item.preview);
      }
    });
  }

  // ---- Arrays that must be JSON ----
  if (Array.isArray(normalized.services)) {
    formData.append("services", JSON.stringify(normalized.services));
  }
  if (Array.isArray(normalized.reviews)) {
    formData.append("reviews", JSON.stringify(normalized.reviews));
  }
  if (Array.isArray(normalized.section_order)) {
    formData.append("section_order", JSON.stringify(normalized.section_order));
  }

  // ---- Removal flags (booleans -> strings) ----
  if (typeof normalized.cover_photo_removed !== "undefined") {
    formData.append(
      "cover_photo_removed",
      String(Boolean(normalized.cover_photo_removed))
    );
  }
  if (typeof normalized.avatar_removed !== "undefined") {
    formData.append(
      "avatar_removed",
      String(Boolean(normalized.avatar_removed))
    );
  }

  // ---- Section visibility flags ----
  const flagKeys = [
    "show_main_section",
    "show_about_me_section",
    "show_work_section",
    "show_services_section",
    "show_reviews_section",
    "show_contact_section",
  ];
  flagKeys.forEach((k) => {
    if (typeof normalized[k] !== "undefined") {
      formData.append(k, String(Boolean(normalized[k])));
    }
  });

  // ❌ DO NOT append "user" anymore (JWT route uses req.user from token)

  return formData;
};

export const useCreateBusinessCard = () => {
  return useMutation({
    mutationFn: async (formData) => {
      const response = await api.post("/api/business-card", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // backend returns: { message, data: updatedCard }
      return response.data?.data ?? null;
    },
  });
};
