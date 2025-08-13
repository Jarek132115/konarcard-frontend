import { create } from "zustand";

const initialState = {
  businessName: "",
  pageTheme: "light",
  pageThemeVariant: "subtle-light",
  font: "Inter",

  // NEW: CTA button color
  ctaButtonColor: "#111111",

  // NEW: Typography settings object
  typographyConfig: {},

  // NEW: Social links
  socialLinks: {
    facebook: "",
    instagram: "",
    tiktok: "",
    linkedin: "",
  },

  coverPhoto: null,
  avatar: null,
  workImages: [],
  workDisplayMode: "list",

  mainHeading: "",
  subHeading: "",
  job_title: "",
  full_name: "",
  bio: "",

  services: [],
  servicesDisplayMode: "list",
  reviews: [],
  reviewsDisplayMode: "list",
  aboutMeLayout: "side-by-side",

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
  font: "Inter",

  // NEW: CTA button color
  ctaButtonColor: "#111111",

  // NEW: Typography example config
  typographyConfig: {
    mainHeading: { size: 32, weight: 700, color: "#111111" },
    subHeading: { size: 18, weight: 400, color: "#555555" },
  },

  // NEW: Social links placeholder
  socialLinks: {
    facebook: "https://facebook.com/example",
    instagram: "https://instagram.com/example",
    tiktok: "https://tiktok.com/@example",
    linkedin: "https://linkedin.com/in/example",
  },

  coverPhoto: "/Interface-Preview/Cover-Photo1.png",
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

  mainHeading: "Transforming Bathrooms, Elevating Homes",
  subHeading: "Premium bathroom renovations with unmatched craftsmanship",
  main_heading: "Transforming Bathrooms, Elevating Homes",
  sub_heading: "Premium bathroom renovations with unmatched craftsmanship",

  job_title: "Bathroom Renovation Specialist",
  full_name: "James Carter",
  bio:
    "With 15 years of experience in luxury bathroom renovations, I create stylish, functional spaces tailored to each client. From modern wet rooms to classic designs, every project blends quality craftsmanship with attention to detail.",

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
