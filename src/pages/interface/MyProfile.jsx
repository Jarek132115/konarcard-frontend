// frontend/src/pages/interface/MyProfile.jsx
import React, { useEffect, useState, useContext, useMemo, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

import Sidebar from "../../components/Dashboard/Sidebar";
import PageHeader from "../../components/Dashboard/PageHeader";
import ShareProfile from "../../components/ShareProfile";

import useBusinessCardStore from "../../store/businessCardStore";
import { useQueryClient, useQuery } from "@tanstack/react-query";

import { AuthContext } from "../../components/AuthContext";
import api from "../../services/api";

import LogoIcon from "../../assets/icons/Logo-Icon.svg";

// extracted components
import Preview from "../../components/Dashboard/Preview";
import Editor from "../../components/Dashboard/Editor";

// ✅ ONLY use save hook (upsert). We will do slug-fetch manually.
import { useSaveMyBusinessCard } from "../../hooks/useBusinessCard";

const DEFAULT_SECTION_ORDER = ["main", "about", "work", "services", "reviews", "contact"];
const norm = (v) => (v ?? "").toString().trim();

/**
 * Build FormData for BusinessCard UPSERT endpoint.
 * IMPORTANT: supports profile_slug (multi-profile).
 */
const buildBusinessCardFormData = ({
  profile_slug,

  template_id,

  business_card_name,
  page_theme,
  page_theme_variant,
  style,
  main_heading,
  sub_heading,
  job_title,
  full_name,
  bio,

  cover_photo,
  avatar,

  works_existing_urls,
  work_images_files,

  services,
  reviews,

  contact_email,
  phone_number,

  cover_photo_removed,
  avatar_removed,
  work_display_mode,
  services_display_mode,
  reviews_display_mode,
  about_me_layout,

  show_main_section,
  show_about_me_section,
  show_work_section,
  show_services_section,
  show_reviews_section,
  show_contact_section,

  button_bg_color,
  button_text_color,
  text_alignment,

  facebook_url,
  instagram_url,
  linkedin_url,
  x_url,
  tiktok_url,

  section_order,
}) => {
  const fd = new FormData();

  fd.append("profile_slug", (profile_slug || "main").toString());
  if (template_id) fd.append("template_id", template_id.toString());

  fd.append("business_card_name", business_card_name || "");
  fd.append("page_theme", page_theme || "light");
  if (page_theme_variant) fd.append("page_theme_variant", page_theme_variant);

  fd.append("style", style || "Inter");
  fd.append("main_heading", main_heading || "");
  fd.append("sub_heading", sub_heading || "");
  fd.append("job_title", job_title || "");
  fd.append("full_name", full_name || "");
  fd.append("bio", bio || "");

  fd.append("contact_email", contact_email || "");
  fd.append("phone_number", phone_number || "");

  fd.append("services", JSON.stringify(Array.isArray(services) ? services : []));
  fd.append("reviews", JSON.stringify(Array.isArray(reviews) ? reviews : []));

  const existing = Array.isArray(works_existing_urls) ? works_existing_urls.filter(Boolean) : [];
  existing.forEach((url) => fd.append("existing_works", url));

  if (cover_photo instanceof File) fd.append("cover_photo", cover_photo);
  if (avatar instanceof File) fd.append("avatar", avatar);

  const workFiles = Array.isArray(work_images_files) ? work_images_files : [];
  workFiles.forEach((f) => {
    if (f instanceof File) fd.append("works", f);
  });

  fd.append("cover_photo_removed", cover_photo_removed ? "1" : "0");
  fd.append("avatar_removed", avatar_removed ? "1" : "0");

  fd.append("work_display_mode", work_display_mode || "");
  fd.append("services_display_mode", services_display_mode || "");
  fd.append("reviews_display_mode", reviews_display_mode || "");
  fd.append("about_me_layout", about_me_layout || "");

  fd.append("show_main_section", show_main_section === false ? "0" : "1");
  fd.append("show_about_me_section", show_about_me_section === false ? "0" : "1");
  fd.append("show_work_section", show_work_section === false ? "0" : "1");
  fd.append("show_services_section", show_services_section === false ? "0" : "1");
  fd.append("show_reviews_section", show_reviews_section === false ? "0" : "1");
  fd.append("show_contact_section", show_contact_section === false ? "0" : "1");

  fd.append("button_bg_color", button_bg_color || "");
  fd.append("button_text_color", button_text_color || "");
  fd.append("text_alignment", text_alignment || "");

  fd.append("facebook_url", facebook_url || "");
  fd.append("instagram_url", instagram_url || "");
  fd.append("linkedin_url", linkedin_url || "");
  fd.append("x_url", x_url || "");
  fd.append("tiktok_url", tiktok_url || "");

  fd.append("section_order", JSON.stringify(Array.isArray(section_order) ? section_order : DEFAULT_SECTION_ORDER));

  return fd;
};

function getSlugFromSearch(search) {
  try {
    const params = new URLSearchParams(search || "");
    const raw = (params.get("slug") || "").toString().trim().toLowerCase();
    return raw || "main";
  } catch {
    return "main";
  }
}

export default function MyProfile() {
  const { state, updateState, resetState } = useBusinessCardStore();
  const queryClient = useQueryClient();
  const location = useLocation();
  const navigate = useNavigate();

  const { user: authUser, hydrating: authLoading, fetchUser: refetchAuthUser } = useContext(AuthContext);

  const userEmail = authUser?.email;

  // ✅ NEW PLANS:
  const plan = String(authUser?.plan || "free").toLowerCase();
  const isTeams = plan === "teams";
  const isPlus = plan === "plus";
  const isFree = !isPlus && !isTeams;

  // Verified email only required for sharing (NOT saving)
  const isUserVerified = !!authUser?.isVerified;
  const userUsername = authUser?.username;

  const activeSlug = useMemo(() => getSlugFromSearch(location.search), [location.search]);

  // ✅ Fetch the specific profile card by slug
  const { data: businessCard, isLoading: isCardLoading, isError: isCardError } = useQuery({
    queryKey: ["businessCard", "profile", activeSlug],
    queryFn: async () => {
      const res = await api.get(`/api/business-card/profiles/${encodeURIComponent(activeSlug)}`);
      return res?.data?.data ?? null;
    },
    enabled: !!authUser && !!activeSlug,
    staleTime: 30 * 1000,
    retry: 1,
  });

  // ✅ If /profiles/:slug returns null, fallback to first existing profile and redirect URL.
  useEffect(() => {
    if (!authUser) return;
    if (isCardLoading) return;
    if (businessCard) return;

    // if the requested slug isn't found, look for any existing profile
    (async () => {
      try {
        const res = await api.get("/api/business-card/profiles");
        const list = res?.data?.data || [];
        const first = Array.isArray(list) && list.length ? list[0] : null;

        const firstSlug = (first?.profile_slug || "").toString().trim();
        if (!firstSlug) return;

        // already on correct slug -> nothing
        if (firstSlug === activeSlug) return;

        // rewrite URL to the real slug so editor loads real data
        const url = new URL(window.location.href);
        url.searchParams.set("slug", firstSlug);
        window.history.replaceState({}, document.title, url.toString());

        // force react-router to re-render same page with new search
        navigate(url.pathname + url.search, { replace: true });
      } catch {
        // ignore
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authUser, isCardLoading, businessCard, activeSlug]);

  const saveBusinessCard = useSaveMyBusinessCard();

  const activeBlobUrlsRef = useRef([]);
  const handledPaymentRef = useRef(false);

  const [showVerificationPrompt, setShowVerificationPrompt] = useState(false);
  const [verificationCodeInput, setVerificationCodeInput] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const [showShareModal, setShowShareModal] = useState(false);

  const [coverPhotoFile, setCoverPhotoFile] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [workImageFiles, setWorkImageFiles] = useState([]);
  const [coverPhotoRemoved, setCoverPhotoRemoved] = useState(false);
  const [isAvatarRemoved, setIsAvatarRemoved] = useState(false);

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const mqDesktopToMobile = "(max-width: 1000px)";
  const mqSmallMobile = "(max-width: 600px)";
  const [isMobile, setIsMobile] = useState(() => window.matchMedia(mqDesktopToMobile).matches);
  const [isSmallMobile, setIsSmallMobile] = useState(() => window.matchMedia(mqSmallMobile).matches);

  const [servicesDisplayMode, setServicesDisplayMode] = useState("list");
  const [reviewsDisplayMode, setReviewsDisplayMode] = useState("list");
  const [aboutMeLayout, setAboutMeLayout] = useState("side-by-side");

  const [showMainSection, setShowMainSection] = useState(true);
  const [showAboutMeSection, setShowAboutMeSection] = useState(true);
  const [showWorkSection, setShowWorkSection] = useState(true);
  const [showServicesSection, setShowServicesSection] = useState(true);
  const [showReviewsSection, setShowReviewsSection] = useState(true);
  const [showContactSection, setShowContactSection] = useState(true);

  const hasSavedData = !!businessCard;
  const hasExchangeContact =
    (state.contact_email && state.contact_email.trim()) || (state.phone_number && state.phone_number.trim());

  // ==========================
  // 1) Stripe return handler
  // ==========================
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const sessionId = params.get("session_id");
    const paymentSuccess = params.get("payment_success");
    const subscribed = params.get("subscribed");

    const isStripeReturn = !!sessionId || paymentSuccess === "true";
    if (!isStripeReturn) return;

    const key = `kc_stripe_handled_v1:${sessionId || paymentSuccess || "unknown"}`;
    try {
      if (sessionStorage.getItem(key) === "1") return;
      sessionStorage.setItem(key, "1");
    } catch { }

    if (handledPaymentRef.current) return;
    handledPaymentRef.current = true;

    (async () => {
      try {
        await api.post("/me/sync-subscriptions", { ts: Date.now() });
      } catch { }

      try {
        await refetchAuthUser?.();
      } catch { }

      const toastId = "kc-subscription-toast";
      if (subscribed === "1") toast.success("Plan updated ✅", { id: toastId });
      else toast.success("Plan updated successfully!", { id: toastId });

      try {
        const clean = new URL(window.location.href);
        const slug = clean.searchParams.get("slug");
        clean.search = "";
        if (slug) clean.searchParams.set("slug", slug);
        window.history.replaceState({}, document.title, clean.toString());
      } catch { }
    })();
  }, [location.search, refetchAuthUser]);

  // ==========================
  // 2) Media query + body scroll
  // ==========================
  useEffect(() => {
    const mm1 = window.matchMedia(mqDesktopToMobile);
    const mm2 = window.matchMedia(mqSmallMobile);

    const onChange = () => {
      setIsMobile(mm1.matches);
      setIsSmallMobile(mm2.matches);
      if (!mm1.matches && sidebarOpen) setSidebarOpen(false);
    };

    mm1.addEventListener("change", onChange);
    mm2.addEventListener("change", onChange);

    return () => {
      mm1.removeEventListener("change", onChange);
      mm2.removeEventListener("change", onChange);
    };
  }, [sidebarOpen]);

  useEffect(() => {
    if (sidebarOpen && isMobile) document.body.classList.add("body-no-scroll");
    else document.body.classList.remove("body-no-scroll");
  }, [sidebarOpen, isMobile]);

  // ==========================
  // 3) Verification cooldown + prompt
  // ==========================
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  useEffect(() => {
    if (!authLoading && authUser && !isUserVerified && userEmail) setShowVerificationPrompt(true);
    else if (!authLoading && isUserVerified) setShowVerificationPrompt(false);
  }, [authLoading, authUser, isUserVerified, userEmail]);

  // ==========================
  // 4) Hydrate editor
  // ==========================
  useEffect(() => {
    if (isCardLoading) return;

    if (businessCard) {
      updateState({
        templateId: businessCard.template_id || "template-1",

        businessName: businessCard.business_card_name || "",
        pageTheme: businessCard.page_theme || "light",
        pageThemeVariant: businessCard.page_theme_variant || "subtle-light",
        font: businessCard.style || "Inter",

        mainHeading: businessCard.main_heading || "",
        subHeading: businessCard.sub_heading || "",
        job_title: businessCard.job_title || "",
        full_name: businessCard.full_name || "",
        bio: businessCard.bio || "",

        avatar: businessCard.avatar || null,
        coverPhoto: businessCard.cover_photo || null,
        workImages: (businessCard.works || []).map((url) => ({ file: null, preview: url })),
        workDisplayMode: businessCard.work_display_mode || "list",

        services: businessCard.services || [],
        reviews: businessCard.reviews || [],

        contact_email: businessCard.contact_email || "",
        phone_number: businessCard.phone_number || "",

        buttonBgColor: businessCard.button_bg_color || "#F47629",
        buttonTextColor:
          (businessCard.button_text_color || "white").toLowerCase() === "black" ? "black" : "white",
        textAlignment: ["left", "center", "right"].includes((businessCard.text_alignment || "").toLowerCase())
          ? businessCard.text_alignment
          : "left",

        facebook_url: businessCard.facebook_url || "",
        instagram_url: businessCard.instagram_url || "",
        linkedin_url: businessCard.linkedin_url || "",
        x_url: businessCard.x_url || "",
        tiktok_url: businessCard.tiktok_url || "",

        sectionOrder:
          Array.isArray(businessCard.section_order) && businessCard.section_order.length
            ? businessCard.section_order
            : DEFAULT_SECTION_ORDER,
      });

      setServicesDisplayMode(businessCard.services_display_mode || "list");
      setReviewsDisplayMode(businessCard.reviews_display_mode || "list");
      setAboutMeLayout(businessCard.about_me_layout || "side-by-side");

      setShowMainSection(businessCard.show_main_section !== false);
      setShowAboutMeSection(businessCard.show_about_me_section !== false);
      setShowWorkSection(businessCard.show_work_section !== false);
      setShowServicesSection(businessCard.show_services_section !== false);
      setShowReviewsSection(businessCard.show_reviews_section !== false);
      setShowContactSection(businessCard.show_contact_section !== false);

      setCoverPhotoFile(null);
      setAvatarFile(null);
      setWorkImageFiles([]);
      setCoverPhotoRemoved(false);
      setIsAvatarRemoved(false);
    } else {
      resetState();
      setServicesDisplayMode("list");
      setReviewsDisplayMode("list");
      setAboutMeLayout("side-by-side");

      setShowMainSection(true);
      setShowAboutMeSection(true);
      setShowWorkSection(true);
      setShowServicesSection(true);
      setShowReviewsSection(true);
      setShowContactSection(true);

      updateState({
        templateId: "template-1",
        buttonBgColor: "#F47629",
        buttonTextColor: "white",
        textAlignment: "left",
        facebook_url: "",
        instagram_url: "",
        linkedin_url: "",
        x_url: "",
        tiktok_url: "",
        sectionOrder: DEFAULT_SECTION_ORDER,
      });
    }
  }, [businessCard, isCardLoading, resetState, updateState]);

  // Cleanup blob URLs
  useEffect(() => {
    return () => {
      activeBlobUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  const createAndTrackBlobUrl = (file) => {
    const url = URL.createObjectURL(file);
    activeBlobUrlsRef.current.push(url);
    return url;
  };

  const onCoverUpload = (file) => {
    if (!file || !file.type?.startsWith("image/")) return;
    updateState({ coverPhoto: createAndTrackBlobUrl(file) });
    setCoverPhotoFile(file);
    setCoverPhotoRemoved(false);
  };

  const onAvatarUpload = (file) => {
    if (!file || !file.type?.startsWith("image/")) return;
    updateState({ avatar: createAndTrackBlobUrl(file) });
    setAvatarFile(file);
    setIsAvatarRemoved(false);
  };

  const onAddWorkImages = (files) => {
    const valid = Array.from(files || []).filter((f) => f && f.type.startsWith("image/"));
    if (!valid.length) return;
    const previewItems = valid.map((file) => ({ file, preview: createAndTrackBlobUrl(file) }));
    updateState({ workImages: [...(state.workImages || []), ...previewItems] });
    setWorkImageFiles((prev) => [...prev, ...valid]);
  };

  const handleRemoveCoverPhoto = () => {
    const isLocalBlob = state.coverPhoto && state.coverPhoto.startsWith("blob:");
    if (!isLocalBlob && state.coverPhoto) setCoverPhotoRemoved(true);
    else setCoverPhotoRemoved(false);

    if (isLocalBlob) URL.revokeObjectURL(state.coverPhoto);
    updateState({ coverPhoto: null });
    setCoverPhotoFile(null);
  };

  const handleRemoveAvatar = () => {
    const isLocalBlob = state.avatar && state.avatar.startsWith("blob:");
    if (!isLocalBlob && state.avatar) setIsAvatarRemoved(true);
    else setIsAvatarRemoved(false);

    if (isLocalBlob) URL.revokeObjectURL(state.avatar);
    updateState({ avatar: null });
    setAvatarFile(null);
  };

  const handleRemoveWorkImage = (idx) => {
    const item = state.workImages?.[idx];
    if (item?.preview?.startsWith("blob:")) URL.revokeObjectURL(item.preview);
    updateState({ workImages: state.workImages.filter((_, i) => i !== idx) });
  };

  // Verification helpers
  const sendVerificationCode = async () => {
    if (!userEmail) return toast.error("Email not found. Please log in again.");
    try {
      const res = await api.post("/resend-code", { email: userEmail });
      if (res.data?.error) toast.error(res.data.error);
      else {
        toast.success("Verification code sent!");
        setResendCooldown(30);
      }
    } catch (err) {
      toast.error(err?.response?.data?.error || "Could not resend code.");
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    if (!userEmail) return toast.error("Email not found. Cannot verify.");

    try {
      const res = await api.post("/verify-email", { email: userEmail, code: verificationCodeInput });
      if (res.data?.error) return toast.error(res.data.error);

      toast.success("Email verified successfully!");
      setShowVerificationPrompt(false);
      setVerificationCodeInput("");
      await refetchAuthUser?.();
    } catch (err) {
      toast.error(err?.response?.data?.error || "Verification failed.");
    }
  };

  const arraysEqual = (a = [], b = []) => {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
    return true;
  };

  const handleResetPage = () => {
    resetState();
    setServicesDisplayMode("list");
    setReviewsDisplayMode("list");
    setAboutMeLayout("side-by-side");

    setShowMainSection(true);
    setShowAboutMeSection(true);
    setShowWorkSection(true);
    setShowServicesSection(true);
    setShowReviewsSection(true);
    setShowContactSection(true);

    setCoverPhotoFile(null);
    setAvatarFile(null);
    setWorkImageFiles([]);
    setCoverPhotoRemoved(false);
    setIsAvatarRemoved(false);

    activeBlobUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    activeBlobUrlsRef.current = [];

    updateState({
      templateId: "template-1",
      buttonBgColor: "#F47629",
      buttonTextColor: "white",
      textAlignment: "left",
      facebook_url: "",
      instagram_url: "",
      linkedin_url: "",
      x_url: "",
      tiktok_url: "",
      sectionOrder: DEFAULT_SECTION_ORDER,
    });

    toast.success("Editor reset.");
  };

  const hasProfileChanges = () => {
    if (coverPhotoFile || avatarFile || workImageFiles.length || coverPhotoRemoved || isAvatarRemoved) return true;
    const original = businessCard || {};

    const normalizeServices = (arr) => (arr || []).map((s) => ({ name: norm(s.name), price: norm(s.price) }));
    const normalizeReviews = (arr) =>
      (arr || []).map((r) => ({ name: norm(r.name), text: norm(r.text), rating: Number(r.rating) || 0 }));

    const servicesChanged = (() => {
      const a = normalizeServices(state.services);
      const b = normalizeServices(original.services);
      if (a.length !== b.length) return true;
      for (let i = 0; i < a.length; i++) if (a[i].name !== b[i].name || a[i].price !== b[i].price) return true;
      return false;
    })();

    const reviewsChanged = (() => {
      const a = normalizeReviews(state.reviews);
      const b = normalizeReviews(original.reviews);
      if (a.length !== b.length) return true;
      for (let i = 0; i < a.length; i++)
        if (a[i].name !== b[i].name || a[i].text !== b[i].text || a[i].rating !== b[i].rating) return true;
      return false;
    })();

    const currentWorks = (state.workImages || [])
      .map((w) => (w?.preview && !w.preview.startsWith("blob:") ? w.preview : null))
      .filter(Boolean);

    const originalWorks = original.works || [];

    const worksChanged = (() => {
      if (currentWorks.length !== originalWorks.length) return true;
      for (let i = 0; i < currentWorks.length; i++) if (currentWorks[i] !== originalWorks[i]) return true;
      return false;
    })();

    const origShowMain = original.show_main_section !== false;
    const origShowAbout = original.show_about_me_section !== false;
    const origShowWork = original.show_work_section !== false;
    const origShowServices = original.show_services_section !== false;
    const origShowReviews = original.show_reviews_section !== false;
    const origShowContact = original.show_contact_section !== false;

    const origButtonBg = original.button_bg_color || "#F47629";
    const origButtonText = (original.button_text_color || "white").toLowerCase() === "black" ? "black" : "white";
    const origAlign = ["left", "center", "right"].includes((original.text_alignment || "").toLowerCase())
      ? original.text_alignment
      : "left";

    const origSectionOrder =
      Array.isArray(original.section_order) && original.section_order.length ? original.section_order : DEFAULT_SECTION_ORDER;

    const origTemplate = original.template_id || "template-1";
    const currentTemplate = state.templateId || "template-1";

    return (
      currentTemplate !== origTemplate ||
      state.businessName !== (original.business_card_name || "") ||
      state.pageTheme !== (original.page_theme || "light") ||
      (state.pageThemeVariant || "subtle-light") !== (original.page_theme_variant || "subtle-light") ||
      state.font !== (original.style || "Inter") ||
      state.mainHeading !== (original.main_heading || "") ||
      state.subHeading !== (original.sub_heading || "") ||
      state.job_title !== (original.job_title || "") ||
      state.full_name !== (original.full_name || "") ||
      state.bio !== (original.bio || "") ||
      state.contact_email !== (original.contact_email || "") ||
      state.phone_number !== (original.phone_number || "") ||
      state.workDisplayMode !== (original.work_display_mode || "list") ||
      servicesDisplayMode !== (original.services_display_mode || "list") ||
      reviewsDisplayMode !== (original.reviews_display_mode || "list") ||
      aboutMeLayout !== (original.about_me_layout || "side-by-side") ||
      servicesChanged ||
      reviewsChanged ||
      worksChanged ||
      showMainSection !== origShowMain ||
      showAboutMeSection !== origShowAbout ||
      showWorkSection !== origShowWork ||
      showServicesSection !== origShowServices ||
      showReviewsSection !== origShowReviews ||
      showContactSection !== origShowContact ||
      state.buttonBgColor !== origButtonBg ||
      state.buttonTextColor !== origButtonText ||
      state.textAlignment !== origAlign ||
      state.facebook_url !== (original.facebook_url || "") ||
      state.instagram_url !== (original.instagram_url || "") ||
      state.linkedin_url !== (original.linkedin_url || "") ||
      state.x_url !== (original.x_url || "") ||
      state.tiktok_url !== (original.tiktok_url || "") ||
      !arraysEqual(state.sectionOrder || [], origSectionOrder)
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!hasProfileChanges()) return toast.error("You haven't made any changes.");

    const existingWorkUrls = (state.workImages || [])
      .map((item) => (item?.preview && !item.preview.startsWith("blob:") ? item.preview : null))
      .filter(Boolean);

    const newWorkFiles = (state.workImages || [])
      .map((item) => (item?.file instanceof File ? item.file : null))
      .filter(Boolean);

    const formData = buildBusinessCardFormData({
      profile_slug: activeSlug,

      template_id: state.templateId || "template-1",

      business_card_name: state.businessName,
      page_theme: state.pageTheme,
      page_theme_variant: state.pageThemeVariant || "subtle-light",
      style: state.font,
      main_heading: state.mainHeading,
      sub_heading: state.subHeading,
      job_title: state.job_title,
      full_name: state.full_name,
      bio: state.bio,

      cover_photo: coverPhotoFile,
      avatar: avatarFile,

      works_existing_urls: existingWorkUrls,
      work_images_files: newWorkFiles,

      services: (state.services || []).filter((s) => s?.name || s?.price),
      reviews: (state.reviews || []).filter((r) => r?.name || r?.text),

      contact_email: state.contact_email,
      phone_number: state.phone_number,

      cover_photo_removed: coverPhotoRemoved,
      avatar_removed: isAvatarRemoved,

      work_display_mode: state.workDisplayMode,
      services_display_mode: servicesDisplayMode,
      reviews_display_mode: reviewsDisplayMode,
      about_me_layout: aboutMeLayout,

      show_main_section: showMainSection,
      show_about_me_section: showAboutMeSection,
      show_work_section: showWorkSection,
      show_services_section: showServicesSection,
      show_reviews_section: showReviewsSection,
      show_contact_section: showContactSection,

      button_bg_color: state.buttonBgColor,
      button_text_color: state.buttonTextColor,
      text_alignment: state.textAlignment,

      facebook_url: state.facebook_url,
      instagram_url: state.instagram_url,
      linkedin_url: state.linkedin_url,
      x_url: state.x_url,
      tiktok_url: state.tiktok_url,

      section_order: state.sectionOrder && state.sectionOrder.length ? state.sectionOrder : DEFAULT_SECTION_ORDER,
    });

    try {
      await saveBusinessCard.mutateAsync(formData);
      toast.success("Saved ✅");

      queryClient.invalidateQueries({ queryKey: ["businessCard", "me"] });
      queryClient.invalidateQueries({ queryKey: ["businessCard", "profiles"] });
      queryClient.invalidateQueries({ queryKey: ["businessCard", "profile", activeSlug] });

      setCoverPhotoFile(null);
      setAvatarFile(null);
      setWorkImageFiles([]);
      setCoverPhotoRemoved(false);
      setIsAvatarRemoved(false);

      activeBlobUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      activeBlobUrlsRef.current = [];
    } catch (err) {
      toast.error(err?.response?.data?.error || err?.response?.data?.message || "Something went wrong while saving.");
    }
  };

  const handleStartSubscription = () => navigate("/pricing");

  const handleShareCard = () => {
    if (!isUserVerified) return toast.error("Please verify your email to share your page.");
    setShowShareModal(true);
  };
  const handleCloseShareModal = () => setShowShareModal(false);

  const visitUrl = useMemo(() => {
    if (!userUsername) return "#";
    if (!activeSlug || activeSlug === "main") return `${window.location.origin}/u/${userUsername}`;
    return `${window.location.origin}/u/${userUsername}/${encodeURIComponent(activeSlug)}`;
  }, [userUsername, activeSlug]);

  const columnScrollStyle = !isMobile ? { maxHeight: "calc(100vh - 140px)", overflow: "auto" } : undefined;

  return (
    <div className={`app-layout ${sidebarOpen ? "sidebar-active" : ""}`}>
      <div className="myprofile-mobile-header">
        <div className="myprofile-brand">
          <img src={LogoIcon} alt="Konar" className="myprofile-logo" />
        </div>

        <button
          className={`sidebar-menu-toggle ${sidebarOpen ? "active" : ""}`}
          aria-label={sidebarOpen ? "Close menu" : "Open menu"}
          onClick={() => setSidebarOpen((s) => !s)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <main className="main-content-container">
        <PageHeader isMobile={isMobile} isSmallMobile={isSmallMobile} onShareCard={handleShareCard} visitUrl={visitUrl} />

        <div className="myprofile-main-content">
          {!authLoading && !authUser && (
            <div className="content-card-box error-state">
              <p>User not loaded. Please ensure you are logged in.</p>
              <button onClick={() => (window.location.href = "/login")}>Go to Login</button>
            </div>
          )}

          {!authLoading && authUser && (
            <>
              {isCardError && (
                <div className="content-card-box error-state">
                  <p>Couldn’t load this profile.</p>
                  <p style={{ opacity: 0.8, marginTop: 8 }}>Try again, or go back to Profiles and select a different profile.</p>
                  <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                    <button
                      className="desktop-button navy-button"
                      onClick={() =>
                        queryClient.invalidateQueries({
                          queryKey: ["businessCard", "profile", activeSlug],
                        })
                      }
                    >
                      Retry
                    </button>

                    <button className="desktop-button orange-button" onClick={() => navigate("/profiles")}>
                      Back to Profiles
                    </button>
                  </div>
                </div>
              )}

              {showVerificationPrompt && (
                <div className="content-card-box verification-prompt">
                  <p>⚠️ Your email is not verified!</p>
                  <p>
                    Please verify your email address (<strong>{userEmail}</strong>) to enable sharing features.
                  </p>

                  <form onSubmit={handleVerifyCode} className="verification-form">
                    <input
                      type="text"
                      className="text-input"
                      placeholder="Enter 6-digit code"
                      value={verificationCodeInput}
                      onChange={(e) => setVerificationCodeInput(e.target.value)}
                      maxLength={6}
                      inputMode="numeric"
                      pattern="[0-9]*"
                    />

                    <div className="verification-actions">
                      <button type="submit" className="desktop-button navy-button">
                        Verify Email
                      </button>

                      <button
                        type="button"
                        className="desktop-button orange-button"
                        onClick={sendVerificationCode}
                        disabled={resendCooldown > 0}
                      >
                        {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend Code"}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Plan badge */}
              <div className="trial-banner" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <p className="desktop-body-s" style={{ margin: 0 }}>
                  Plan: <strong>{isTeams ? "Teams" : isPlus ? "Plus" : "Free"}</strong>
                </p>
                {isFree ? (
                  <button className="blue-trial desktop-body-s" onClick={handleStartSubscription}>
                    Upgrade
                  </button>
                ) : null}
              </div>

              <div className="myprofile-flex-container">
                <div style={columnScrollStyle}>
                  <Preview
                    state={state}
                    isMobile={isMobile}
                    hasSavedData={!!businessCard}
                    servicesDisplayMode={servicesDisplayMode}
                    reviewsDisplayMode={reviewsDisplayMode}
                    aboutMeLayout={aboutMeLayout}
                    showMainSection={showMainSection}
                    showAboutMeSection={showAboutMeSection}
                    showWorkSection={showWorkSection}
                    showServicesSection={showServicesSection}
                    showReviewsSection={showReviewsSection}
                    showContactSection={showContactSection}
                    hasExchangeContact={hasExchangeContact}
                    visitUrl={visitUrl}
                    columnScrollStyle={columnScrollStyle}
                  />
                </div>

                <Editor
                  state={state}
                  updateState={updateState}
                  isSubscribed={!isFree}
                  hasTrialEnded={false}
                  onStartSubscription={handleStartSubscription}
                  onResetPage={handleResetPage}
                  onSubmit={handleSubmit}
                  servicesDisplayMode={servicesDisplayMode}
                  setServicesDisplayMode={setServicesDisplayMode}
                  reviewsDisplayMode={reviewsDisplayMode}
                  setReviewsDisplayMode={setReviewsDisplayMode}
                  aboutMeLayout={aboutMeLayout}
                  setAboutMeLayout={setAboutMeLayout}
                  showMainSection={showMainSection}
                  setShowMainSection={setShowMainSection}
                  showAboutMeSection={showAboutMeSection}
                  setShowAboutMeSection={setShowAboutMeSection}
                  showWorkSection={showWorkSection}
                  setShowWorkSection={setShowWorkSection}
                  showServicesSection={showServicesSection}
                  setShowServicesSection={setShowServicesSection}
                  showReviewsSection={showReviewsSection}
                  setShowReviewsSection={setShowReviewsSection}
                  showContactSection={showContactSection}
                  setShowContactSection={setShowContactSection}
                  onCoverUpload={onCoverUpload}
                  onRemoveCover={handleRemoveCoverPhoto}
                  onAvatarUpload={onAvatarUpload}
                  onRemoveAvatar={handleRemoveAvatar}
                  onAddWorkImages={onAddWorkImages}
                  onRemoveWorkImage={handleRemoveWorkImage}
                  columnScrollStyle={columnScrollStyle}
                />
              </div>
            </>
          )}
        </div>
      </main>

      <ShareProfile
        isOpen={showShareModal}
        onClose={handleCloseShareModal}
        profileUrl={visitUrl}
        qrCodeUrl={businessCard?.qr_code_url || ""}
        contactDetails={{
          full_name: businessCard?.full_name || "",
          job_title: businessCard?.job_title || "",
          business_card_name: businessCard?.business_card_name || "",
          bio: businessCard?.bio || "",
          isSubscribed: !isFree,
          contact_email: businessCard?.contact_email || "",
          phone_number: businessCard?.phone_number || "",
          username: userUsername || "",
        }}
        username={userUsername || ""}
      />
    </div>
  );
}
