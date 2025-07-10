// frontend/src/store/businessCardStore.js

import { create } from "zustand";

const initialState = {
  // Theme and Font can still have defaults as they are selected options
  businessName: "", // FIX: Set to empty for editable field, preview will use placeholder
  pageTheme: "light",
  font: "Inter",

  // FIX: Set image paths to null for a truly "empty" initial state for the editor
  coverPhoto: null,
  avatar: null,
  workImages: [], // FIX: Start with an empty array for work images

  // FIX: Set text fields to empty strings for a truly "empty" initial state for the editor
  mainHeading: "",
  subHeading: "",
  job_title: "",
  full_name: "",
  bio: "",

  // FIX: Services and Reviews should start empty arrays to match the "empty editor" requirement
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
  resetState: () => set({ state: initialState }), // resetState now sets to these empty fields
}));

export default useBusinessCardStore;

// FIX: Export previewPlaceholders so it can be imported by MyProfile.jsx
// This object holds the visual template data specifically for the preview section.
export const previewPlaceholders = {
  businessName: "My Digital Business Card", // Placeholder for preview title
  coverPhoto: "/Interface-Preview/Cover-Photo1.png", // Placeholder image path
  avatar: "/Interface-Preview/Profile-Pic.png", // Placeholder image path
  workImages: [ // Placeholder work images
    { file: null, preview: "/Interface-Preview/Work-Images1.png" },
    { file: null, preview: "/Interface-Preview/Work-Images2.png" },
    { file: null, preview: "/Interface-Preview/Work-Images3.png" },
  ],
  // Text placeholders
  mainHeading: "Your Main Heading Here",
  subHeading: "Your Tagline or Slogan Goes Here",
  job_title: "Your Job Title",
  full_name: "Your Full Name",
  bio: "Welcome! This is your digital business card. Share your story, expertise, and how to connect with you. You can customize all content, colors, and fonts!",
  services: [
    { name: "Service 1 Title", price: "Starting from £195" },
    { name: "Service 2 Title", price: "Starting from £295" },
    { name: "Service 3 Title", price: "Starting from £395" },
  ],
  reviews: [
    { name: "A Happy Client", text: "Exceptional service and an innovative way to connect!", rating: 5 },
    { name: "Another Satisfied User", text: "Clean design and very easy to navigate. Highly recommended!", rating: 4 },
    { name: "Another Satisfied User", text: "Clean design and very easy to navigate. Highly recommended!", rating: 4 },
  ],
  contact_email: "youremail@example.com",
  phone_number: "+123-456-7890",
};