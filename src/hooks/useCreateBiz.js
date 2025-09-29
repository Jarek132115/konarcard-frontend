import { useMutation } from "@tanstack/react-query";
import api from '../services/api';

export const buildBusinessCardFormData = (data = {}) => {
  const formData = new FormData();

  // ---- Alias normalisation (accept camelCase from UI and snake_case for backend) ----
  const normalized = {
    // theme + typography
    page_theme: data.page_theme ?? data.pageTheme,
    page_theme_variant: data.page_theme_variant ?? data.pageThemeVariant,
    font: data.font, // mapped to 'style' later

    // headings + bio
    main_heading: data.main_heading ?? data.mainHeading,
    sub_heading: data.sub_heading ?? data.subHeading,
    job_title: data.job_title,
    full_name: data.full_name,
    bio: data.bio,

    // contact
    contact_email: data.contact_email,
    phone_number: data.phone_number,

    // display modes
    work_display_mode: data.work_display_mode ?? data.workDisplayMode,
    services_display_mode: data.services_display_mode ?? data.servicesDisplayMode,
    reviews_display_mode: data.reviews_display_mode ?? data.reviewsDisplayMode,
    about_me_layout: data.about_me_layout ?? data.aboutMeLayout,

    // NEW: styling + alignment
    button_bg_color: data.button_bg_color ?? data.buttonBgColor,
    button_text_color: data.button_text_color ?? data.buttonTextColor,
    text_alignment: data.text_alignment ?? data.textAlignment,

    // NEW: socials
    facebook_url: data.facebook_url,
    instagram_url: data.instagram_url,
    linkedin_url: data.linkedin_url,
    x_url: data.x_url,
    tiktok_url: data.tiktok_url,

    // NEW: section order
    section_order: data.section_order ?? data.sectionOrder,

    // images & works
    cover_photo: data.cover_photo ?? data.coverPhoto,
    avatar: data.avatar,
    works: data.works ?? data.workImages,

    // existing image removal flags
    cover_photo_removed: data.cover_photo_removed,
    avatar_removed: data.avatar_removed,

    // visibility flags
    show_main_section: data.show_main_section,
    show_about_me_section: data.show_about_me_section,
    show_work_section: data.show_work_section,
    show_services_section: data.show_services_section,
    show_reviews_section: data.show_reviews_section,
    show_contact_section: data.show_contact_section,

    // optional
    business_card_name: data.business_card_name ?? data.businessName,
    user: data.user,
  };

  // ---- Simple string fields (frontend "font" will be mapped to backend "style") ----
  const simpleKeys = [
    'business_card_name',
    'page_theme',
    'page_theme_variant',
    'font', // mapped to 'style' below
    'main_heading',
    'sub_heading',
    'job_title',
    'full_name',
    'bio',
    'contact_email',
    'phone_number',
    'work_display_mode',
    'services_display_mode',
    'reviews_display_mode',
    'about_me_layout',

    // NEW
    'button_bg_color',
    'button_text_color',
    'text_alignment',

    'facebook_url',
    'instagram_url',
    'linkedin_url',
    'x_url',
    'tiktok_url',
  ];

  simpleKeys.forEach((key) => {
    const val = normalized[key];
    if (val !== undefined && val !== null && val !== '') {
      if (key === 'font') {
        formData.append('style', val);
      } else {
        formData.append(key, val);
      }
    }
  });

  // ---- Images (files) ----
  // Accept either File in normalized.cover_photo / normalized.avatar or ignore
  if (normalized.cover_photo instanceof File) {
    formData.append('cover_photo', normalized.cover_photo);
  }
  if (normalized.avatar instanceof File) {
    formData.append('avatar', normalized.avatar);
  }

  // ---- Works: mix of existing URLs and new files ----
  if (Array.isArray(normalized.works)) {
    normalized.works.forEach((item) => {
      // New uploads
      if (item && typeof item === 'object' && item.file instanceof File) {
        formData.append('works', item.file);
      } else if (item instanceof File) {
        formData.append('works', item);
      }
      // Existing URLs
      else if (typeof item === 'string' && item.startsWith('http')) {
        formData.append('existing_works', item);
      } else if (item && typeof item === 'object' && typeof item.preview === 'string' && item.preview.startsWith('http')) {
        formData.append('existing_works', item.preview);
      }
    });
  }

  // ---- Arrays that must be JSON ----
  if (Array.isArray(data.services)) {
    formData.append('services', JSON.stringify(data.services));
  }
  if (Array.isArray(data.reviews)) {
    formData.append('reviews', JSON.stringify(data.reviews));
  }

  // NEW: section_order as JSON
  if (Array.isArray(normalized.section_order)) {
    formData.append('section_order', JSON.stringify(normalized.section_order));
  }

  // ---- Removal flags (booleans → strings) ----
  if (typeof normalized.cover_photo_removed !== 'undefined') {
    formData.append('cover_photo_removed', String(Boolean(normalized.cover_photo_removed)));
  }
  if (typeof normalized.avatar_removed !== 'undefined') {
    formData.append('avatar_removed', String(Boolean(normalized.avatar_removed)));
  }

  // ---- Section visibility flags — always as strings ----
  const flagKeys = [
    'show_main_section',
    'show_about_me_section',
    'show_work_section',
    'show_services_section',
    'show_reviews_section',
    'show_contact_section',
  ];
  flagKeys.forEach((k) => {
    if (typeof normalized[k] !== 'undefined') {
      formData.append(k, String(Boolean(normalized[k])));
    }
  });

  // Optional: send user id (controller uses req.user; safe to omit)
  if (normalized.user) {
    formData.append('user', normalized.user);
  }

  return formData;
};

export const useCreateBusinessCard = () => {
  return useMutation({
    mutationFn: async (formData) => {
      const response = await api.post(
        '/api/business-card/create_business_card',
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      return response.data;
    },
  });
};
