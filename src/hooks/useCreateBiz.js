import { useMutation } from "@tanstack/react-query";
import api from '../services/api';

export const buildBusinessCardFormData = (data = {}) => {
  const formData = new FormData();

  // Simple string fields (frontend "font" will be mapped to backend "style")
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
  ];

  simpleKeys.forEach((key) => {
    const val = data[key];
    if (val !== undefined && val !== null) {
      if (key === 'font') {
        formData.append('style', val);
      } else {
        formData.append(key, val);
      }
    }
  });

  // Images (files)
  if (data.cover_photo instanceof File) {
    formData.append('cover_photo', data.cover_photo);
  }
  if (data.avatar instanceof File) {
    formData.append('avatar', data.avatar);
  }

  // Works: mix of existing URLs and new files
  if (Array.isArray(data.works)) {
    data.works.forEach((item) => {
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

  // Arrays that must be JSON
  if (Array.isArray(data.services)) {
    formData.append('services', JSON.stringify(data.services));
  }
  if (Array.isArray(data.reviews)) {
    formData.append('reviews', JSON.stringify(data.reviews));
  }

  // Removal flags (booleans → strings)
  if (typeof data.cover_photo_removed !== 'undefined') {
    formData.append('cover_photo_removed', String(Boolean(data.cover_photo_removed)));
  }
  if (typeof data.avatar_removed !== 'undefined') {
    formData.append('avatar_removed', String(Boolean(data.avatar_removed)));
  }

  // Section visibility flags — always as strings
  const flagKeys = [
    'show_main_section',
    'show_about_me_section',
    'show_work_section',
    'show_services_section',
    'show_reviews_section',
    'show_contact_section',
  ];
  flagKeys.forEach((k) => {
    if (typeof data[k] !== 'undefined') {
      formData.append(k, String(Boolean(data[k])));
    }
  });

  // Optional: send user id if needed (controller uses req.user; safe to omit)
  if (data.user) {
    formData.append('user', data.user);
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
