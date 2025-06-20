import { create } from "zustand";

// Removed TypeScript interface definitions (BusinessCardState, BusinessCardStore)
// You can keep them as comments in your original .ts file for documentation if you like.

const initialState = {
  businessName: "",
  pageTheme: "light",
  font: "Inter",
  coverPhoto: null,
  coverPhotoFile: undefined, // Explicitly set to undefined or null if no file initially
  mainHeading: "",
  subHeading: "",
  job_title: "",
  full_name: "",
  bio: "",
  avatar: null,
  avatarFile: undefined,   // Explicitly set to undefined or null if no file initially
  workImages: [],
  services: [],
  reviews: [],
  contact_email: "",
  phone_number: "",
  // REMOVED: website_url (as per your schema)
};

// Removed type annotation for create<BusinessCardStore>
const useBusinessCardStore = create((set) => ({
  state: initialState,
  updateState: (newState) =>
    set((store) => ({
      state: { ...store.state, ...newState },
    })),
  resetState: () => set({ state: initialState }),
}));

export default useBusinessCardStore;