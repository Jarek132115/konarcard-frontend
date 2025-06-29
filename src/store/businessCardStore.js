import { create } from "zustand";

const initialState = {
  businessName: "My Digital Business Card", // Default text
  pageTheme: "light",
  font: "Inter",
  coverPhoto: null,
  mainHeading: "Your Main Heading Here", // Default text
  subHeading: "Your Tagline or Slogan Goes Here", // Default text
  job_title: "Your Job Title", // Default text
  full_name: "Your Full Name", // Default text
  bio: "Welcome! This is your digital business card. Share your story, expertise, and how to connect with you. You can customize all content, colors, and fonts!", // Default text
  avatar: null,
  workImages: [],
  services: [ // Default services
    { name: "Service 1 Title", price: "Starting from $XX" },
    { name: "Service 2 Title", price: "Contact for Quote" },
    { name: "Service 3 Title", price: "View Pricing" },
  ],
  reviews: [ // Default reviews
    { name: "A Happy Client", text: "Exceptional service and an innovative way to connect!", rating: 5 },
    { name: "Another Satisfied User", text: "Clean design and very easy to navigate. Highly recommended!", rating: 4 },
  ],
  contact_email: "youremail@example.com", // Default text
  phone_number: "+123-456-7890", // Default text
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