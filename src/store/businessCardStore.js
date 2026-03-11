import { create } from "zustand";

export const DEFAULT_SECTION_ORDER = ["main", "about", "work", "services", "reviews", "contact"];

/**
 * Placeholders shown in preview/editor when fields are empty.
 * Keep old + new keys during transition so existing components do not break.
 */
export const previewPlaceholders = {
  coverPhoto: "",
  logo: "",
  business_name: "Your business name",
  trade_title: "Your trade title",
  location: "Your location",
  main_heading: "Your business name",
  sub_heading: "Your trade title",
  full_name: "Your name",
  job_title: "Your trade",
  bio: "Write a short bio about yourself",
  contact_email: "email@example.com",
  phone_number: "+44 0000 000000",
};

/**
 * Default editor state
 * Keep legacy keys temporarily for backward compatibility with older preview/template code.
 */
const defaultState = {
  // Template
  templateId: "template-1",
  themeMode: "light", // new preferred key
  pageTheme: "light", // legacy compatibility
  pageThemeVariant: "subtle-light",

  // Typography / layout
  font: "Inter",
  textAlignment: "left",

  // Branding / business identity
  businessName: "", // legacy compatibility
  business_name: "",
  trade_title: "",
  location: "",

  // Main section
  coverPhoto: null,
  coverPhotoPreview: "",

  logo: null,
  logoPreview: "",

  mainHeading: "", // legacy compatibility
  subHeading: "", // legacy compatibility

  // About section
  avatar: null, // legacy compatibility
  avatarPreview: "", // legacy compatibility

  full_name: "",
  job_title: "",
  bio: "",
  aboutMeLayout: "side-by-side",

  // Work section
  workImages: [], // [{ file, preview }] or string urls
  workDisplayMode: "grid",

  // Services / reviews
  services: [], // [{ name, description, price? }]
  reviews: [], // [{ name, text, rating }]

  // Contact
  contact_email: "",
  phone_number: "",
  facebook_url: "",
  instagram_url: "",
  linkedin_url: "",
  x_url: "",
  tiktok_url: "",

  // Legacy color controls (keep temporarily until old templates are removed)
  buttonBgColor: "#F47629",
  buttonTextColor: "white",

  // Section controls
  sectionOrder: DEFAULT_SECTION_ORDER,

  // Optional upgrade banner flags
  upgradeRequired: false,
  upgradeReason: "",
};

const normaliseStatePatch = (currentState, patch) => {
  const next = { ...patch };

  // Keep business_name <-> mainHeading in sync
  if (Object.prototype.hasOwnProperty.call(next, "business_name") && !Object.prototype.hasOwnProperty.call(next, "mainHeading")) {
    next.mainHeading = next.business_name;
  }
  if (Object.prototype.hasOwnProperty.call(next, "mainHeading") && !Object.prototype.hasOwnProperty.call(next, "business_name")) {
    next.business_name = next.mainHeading;
  }

  // Keep trade_title <-> subHeading in sync
  if (Object.prototype.hasOwnProperty.call(next, "trade_title") && !Object.prototype.hasOwnProperty.call(next, "subHeading")) {
    next.subHeading = next.trade_title;
  }
  if (Object.prototype.hasOwnProperty.call(next, "subHeading") && !Object.prototype.hasOwnProperty.call(next, "trade_title")) {
    next.trade_title = next.subHeading;
  }

  // Keep logo <-> avatar in sync temporarily
  if (Object.prototype.hasOwnProperty.call(next, "logo") && !Object.prototype.hasOwnProperty.call(next, "avatar")) {
    next.avatar = next.logo;
  }
  if (Object.prototype.hasOwnProperty.call(next, "avatar") && !Object.prototype.hasOwnProperty.call(next, "logo")) {
    next.logo = next.avatar;
  }

  if (Object.prototype.hasOwnProperty.call(next, "logoPreview") && !Object.prototype.hasOwnProperty.call(next, "avatarPreview")) {
    next.avatarPreview = next.logoPreview;
  }
  if (Object.prototype.hasOwnProperty.call(next, "avatarPreview") && !Object.prototype.hasOwnProperty.call(next, "logoPreview")) {
    next.logoPreview = next.avatarPreview;
  }

  // Keep themeMode <-> pageTheme aligned
  if (Object.prototype.hasOwnProperty.call(next, "themeMode") && !Object.prototype.hasOwnProperty.call(next, "pageTheme")) {
    next.pageTheme = next.themeMode;
  }
  if (Object.prototype.hasOwnProperty.call(next, "pageTheme") && !Object.prototype.hasOwnProperty.call(next, "themeMode")) {
    next.themeMode = next.pageTheme;
  }

  // Normalise services so old { name, price } becomes { name, description, price }
  if (Array.isArray(next.services)) {
    next.services = next.services.map((service) => ({
      name: service?.name || "",
      description: service?.description || service?.price || "",
      price: service?.price || service?.description || "",
    }));
  }

  // Normalise reviews
  if (Array.isArray(next.reviews)) {
    next.reviews = next.reviews.map((review) => ({
      name: review?.name || "",
      text: review?.text || "",
      rating: review?.rating || 5,
    }));
  }

  // Normalise work images array
  if (Array.isArray(next.workImages)) {
    next.workImages = next.workImages.filter(Boolean);
  }

  return {
    ...currentState,
    ...next,
  };
};

const useBusinessCardStore = create((set) => ({
  state: { ...defaultState },

  updateState: (patch) =>
    set((store) => {
      const resolvedPatch =
        typeof patch === "function" ? patch(store.state) : patch;

      return {
        state: normaliseStatePatch(store.state, resolvedPatch || {}),
      };
    }),

  resetState: () => set({ state: { ...defaultState } }),

  /**
   * Legacy helpers retained so older imports do not break.
   * Subscription gating is handled elsewhere.
   */
  checkLimit: () => true,
  lockTemplateIfNeeded: () => true,
}));

export default useBusinessCardStore;