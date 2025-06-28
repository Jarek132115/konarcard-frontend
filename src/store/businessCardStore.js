import { create } from "zustand";

const initialState = {
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
};

const useBusinessCardStore = create((set) => ({
  state: initialState,
  updateState: (newState) =>
    set((store) => ({
      state: { ...store.state, ...newState },
    })),
  resetState: () => set({ state: initialState }),
}));

export default useBusinessCardStore;