import { create } from "zustand";

interface BusinessCardState {
  businessName: string;
  pageTheme: "light" | "dark";
  font: "Inter" | "Montserrat" | "Poppins";
  coverPhoto: string | null;
  coverPhotoFile?: File;
  mainHeading: string;
  subHeading: string;
  job_title?: string;
  full_name?: string;
  bio?: string;
  avatar?: string | null;
  avatarFile?: File;
  workImages?: { file: File; preview: string }[];
  services?: { name: string; price: string }[];
  reviews?: { name: string; text: string; rating: number }[];
  contact_email?: string;
  phone_number?: string;
  // REMOVED: website_url
}

interface BusinessCardStore {
  state: BusinessCardState;
  updateState: (newState: Partial<BusinessCardState>) => void;
  resetState: () => void;
}

const initialState: BusinessCardState = {
  businessName: "",
  pageTheme: "light",
  font: "Inter",
  coverPhoto: null,
  mainHeading: "",
  subHeading: "",
  job_title: "",
  full_name: "",
  bio: "",
  avatar: null,
  workImages: [],
  services: [],
  reviews: [],
  contact_email: "",
  phone_number: "",
  // REMOVED: website_url
};

const useBusinessCardStore = create<BusinessCardStore>((set) => ({
  state: initialState,
  updateState: (newState) =>
    set((store) => ({
      state: { ...store.state, ...newState },
    })),
  resetState: () => set({ state: initialState }),
}));

export default useBusinessCardStore;