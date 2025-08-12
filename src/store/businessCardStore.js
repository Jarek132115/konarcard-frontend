import { create } from "zustand";

const initialState = {
  businessName: "",
  pageTheme: "light",
  pageThemeVariant: "subtle-light",
  font: "Inter",

  coverPhoto: null,
  avatar: null,
  workImages: [],
  workDisplayMode: "list", // Already added

  mainHeading: "",
  subHeading: "",
  job_title: "",
  full_name: "",
  bio: "",

  services: [],
  servicesDisplayMode: "list", // New
  reviews: [],
  reviewsDisplayMode: "list", // New
  aboutMeLayout: "side-by-side", // New

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

export const previewPlaceholders = {
  businessName: "Elite Bathrooms & Renovations",
  pageTheme: "light",
  pageThemeVariant: "subtle-light",

  coverPhoto: "/Interface-Preview/Cover-Photo1.png", // You can swap with a bathroom renovation photo
  avatar: "/Interface-Preview/Profile-Pic.png",

  workImages: [
    { file: null, preview: "/Interface-Preview/Work-Images1.png" },
    { file: null, preview: "/Interface-Preview/Work-Images2.png" },
    { file: null, preview: "/Interface-Preview/Work-Images3.png" },
  ],
  workDisplayMode: "list",
  servicesDisplayMode: "list",
  reviewsDisplayMode: "list",
  aboutMeLayout: "side-by-side",

  // Both camelCase & snake_case so it works with your component
  mainHeading: "Transforming Bathrooms, Elevating Homes",
  subHeading: "Premium bathroom renovations with unmatched craftsmanship",
  main_heading: "Transforming Bathrooms, Elevating Homes",
  sub_heading: "Premium bathroom renovations with unmatched craftsmanship",

  job_title: "Bathroom Renovation Specialist",
  full_name: "James Carter",
  bio:
    "With over 15 years of experience in luxury bathroom renovations, I specialize in creating functional, stylish, and timeless spaces. From modern wet rooms to classic claw-foot tubs, my goal is to bring your dream bathroom to life — on time and within budget. Every project is built on quality craftsmanship, premium materials, and a personal touch that ensures your satisfaction.",

  services: [
    { name: "Full Bathroom Renovation", price: "Starting from £4,995" },
    { name: "Shower & Wet Room Installation", price: "Starting from £1,995" },
    { name: "Custom Vanity & Cabinetry", price: "Starting from £995" },
    { name: "Tiling & Flooring", price: "Starting from £495" },
  ],

  reviews: [
    {
      name: "Sarah Mitchell",
      text: "James completely transformed our outdated bathroom into a spa-like retreat. Impeccable attention to detail!",
      rating: 5,
    },
    {
      name: "Daniel Hughes",
      text: "Professional, punctual, and the quality of work was outstanding. Highly recommend for any bathroom project.",
      rating: 5,
    },
    {
      name: "Laura Evans",
      text: "We love our new walk-in shower! James guided us through every step and made the process stress-free.",
      rating: 4,
    },
  ],

  contact_email: "info@elitebathrooms.co.uk",
  phone_number: "+44 7700 900123",
};
