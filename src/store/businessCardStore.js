// frontend/src/store/businessCardStore.js
import { create } from "zustand";

export const DEFAULT_SECTION_ORDER = ["main", "about", "work", "services", "reviews", "contact"];

/**
 * Placeholders shown in preview/editor when fields empty.
 * Keep keys matching what your Editor/Preview use.
 */
export const previewPlaceholders = {
  coverPhoto: "",
  main_heading: "Your main heading",
  sub_heading: "Your subheading",
  full_name: "Your name",
  job_title: "Your job title",
  bio: "Write a short bio about yourself",
  contact_email: "email@example.com",
  phone_number: "+44 0000 000000",
};

/**
 * Default editor state
 */
const defaultState = {
  // Template
  templateId: "template-1",

  // Branding / theme
  businessName: "",
  pageTheme: "light",
  pageThemeVariant: "subtle-light",
  font: "Inter",
  textAlignment: "left",

  // Main header section
  coverPhoto: null,
  mainHeading: "",
  subHeading: "",

  // About section
  avatar: null,
  full_name: "",
  job_title: "",
  bio: "",
  aboutMeLayout: "side-by-side",

  // Work section
  workImages: [], // [{file, preview}] or string urls
  workDisplayMode: "list",

  // Services / reviews
  services: [],
  reviews: [],

  // Contact
  contact_email: "",
  phone_number: "",
  facebook_url: "",
  instagram_url: "",
  linkedin_url: "",
  x_url: "",
  tiktok_url: "",

  // Buttons
  buttonBgColor: "#F47629",
  buttonTextColor: "white",

  // Section controls
  sectionOrder: DEFAULT_SECTION_ORDER,

  // Optional upgrade banner flags (safe defaults)
  upgradeRequired: false,
  upgradeReason: "",
};

const useBusinessCardStore = create((set, get) => ({
  state: { ...defaultState },

  updateState: (patch) =>
    set((s) => ({
      state: {
        ...s.state,
        ...(typeof patch === "function" ? patch(s.state) : patch),
      },
    })),

  resetState: () => set({ state: { ...defaultState } }),

  /**
   * These were used in older Editor versions.
   * Keep them here so imports won’t break.
   * Your subscription gating is handled in MyProfile/Editor props now.
   */
  checkLimit: () => true,
  lockTemplateIfNeeded: () => true,
}));

export default useBusinessCardStore;
