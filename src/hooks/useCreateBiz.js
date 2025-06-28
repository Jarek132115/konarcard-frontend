import { useMutation } from "@tanstack/react-query";
import api from '../services/api'; // <--- CRUCIAL FIX: Changed to DEFAULT IMPORT (no curly braces)

export const buildBusinessCardFormData = (data) => {
  const formData = new FormData();

  // Append simple key-value pairs
  for (const key in data) {
    if (data.hasOwnProperty(key)) {
      // IMPORTANT: Skip file fields here as they are appended separately below.
      // Also skip 'works' and 'existing_works' as they are handled in their own block.
      if (key === 'cover_photo' || key === 'avatar' || key === 'works' || key === 'existing_works') {
        continue;
      }
      if (Array.isArray(data[key])) {
        // Handle arrays of objects (like services, reviews) by stringifying them
        formData.append(key, JSON.stringify(data[key]));
      } else {
        formData.append(key, data[key]);
      }
    }
  }

  // Append file for cover photo
  if (data.cover_photo instanceof File) {
    formData.append('cover_photo', data.cover_photo);
  }
  // Append file for avatar
  if (data.avatar instanceof File) {
    formData.append('avatar', data.avatar);
  }

  // Append files for works (new files) and existing work URLs
  if (data.works && Array.isArray(data.works)) {
    data.works.forEach((item) => { // Removed 'index' as it's no longer needed for file appending
      if (item && typeof item === 'object' && item.file instanceof File) { // For new files from Zustand state { file, preview }
        formData.append('works', item.file); // FIX: Append with simple 'works' field name
      } else if (item instanceof File) { // For raw File objects (less common if using Zustand)
        formData.append('works', item); // FIX: Append with simple 'works' field name
      } else if (typeof item === 'string' && item.startsWith('http')) { // For existing S3 URLs (direct strings)
        formData.append('existing_works', item);
      } else if (item && typeof item === 'object' && item.preview && typeof item.preview === 'string') { // For existing S3 URLs from Zustand state { file: null, preview }
        formData.append('existing_works', item.preview);
      }
    });
  }


  // Flags for removed images
  formData.append('cover_photo_removed', data.cover_photo_removed ? 'true' : 'false');
  formData.append('avatar_removed', data.avatar_removed ? 'true' : 'false');

  return formData;
};


export const useCreateBusinessCard = () => {
  return useMutation({
    mutationFn: async (formData) => {
      const response = await api.post('/api/business-card/create_business_card', formData, {
        headers: {
          // Axios automatically sets Content-Type for FormData, so no manual setting needed
        }
      });
      return response.data; // Backend should return { message: ..., data: ... }
    },
  });
};