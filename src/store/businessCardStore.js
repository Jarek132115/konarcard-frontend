import { create } from "zustand";

const initialState = {
  businessName: "My Digital Business Card",
  pageTheme: "light",
  font: "Inter",
  coverPhoto: "/Interface-Preview/Cover-Photo1.png", 
  mainHeading: "Your Main Heading Here",
  subHeading: "Your Tagline or Slogan Goes Here",
  job_title: "Your Job Title",
  full_name: "Your Full Name",
  bio: "Welcome! This is your digital business card. Share your story, expertise, and how to connect with you. You can customize all content, colors, and fonts!",
  avatar: "/Interface-Preview/Profile-Pic.png", 
  workImages: [
    { file: null, preview: "/Interface-Preview/Work-Images1.png" },
    { file: null, preview: "/Interface-Preview/Work-Images2.png" },
    { file: null, preview: "/Interface-Preview/Work-Images3.png" },
  ],
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

const useBusinessCardStore = create((set) => ({
  state: initialState,
  updateState: (newState) =>
    set((store) => ({
      state: { ...store.state, ...newState },
    })),
  resetState: () => set({ state: initialState }),
}));

export default useBusinessCardStore;