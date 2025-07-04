import { useMutation } from "@tanstack/react-query";
import api from '../services/api'; 

export const buildBusinessCardFormData = (data) => {
  const formData = new FormData();

  for (const key in data) {
    if (data.hasOwnProperty(key)) {
      if (key === 'cover_photo' || key === 'avatar' || key === 'works' || key === 'existing_works') {
        continue;
      }
      if (Array.isArray(data[key])) {
        formData.append(key, JSON.stringify(data[key]));
      } else {
        formData.append(key, data[key]);
      }
    }
  }

  if (data.cover_photo instanceof File) {
    formData.append('cover_photo', data.cover_photo);
  }
  if (data.avatar instanceof File) {
    formData.append('avatar', data.avatar);
  }

  if (data.works && Array.isArray(data.works)) {
    data.works.forEach((item) => { 
      if (item && typeof item === 'object' && item.file instanceof File) { 
        formData.append('works', item.file); 
      } else if (item instanceof File) { 
        formData.append('works', item); 
      } else if (typeof item === 'string' && item.startsWith('http')) { 
        formData.append('existing_works', item);
      } else if (item && typeof item === 'object' && item.preview && typeof item.preview === 'string') { 
        formData.append('existing_works', item.preview);
      }
    });
  }

  formData.append('cover_photo_removed', data.cover_photo_removed ? 'true' : 'false');
  formData.append('avatar_removed', data.avatar_removed ? 'true' : 'false');

  return formData;
};


export const useCreateBusinessCard = () => {
  return useMutation({
    mutationFn: async (formData) => {
      const response = await api.post('/api/business-card/create_business_card', formData, {
        headers: {
        }
      });
      return response.data; 
    },
  });
};