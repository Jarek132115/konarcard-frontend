import React, { useEffect, useState, useContext, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

import DashboardLayout from "../../components/Dashboard/DashboardLayout";
import PageHeader from "../../components/Dashboard/PageHeader";
import ShareProfile from "../../components/ShareProfile";

import useBusinessCardStore from "../../store/businessCardStore";
import { useQueryClient, useQuery } from "@tanstack/react-query";

import { AuthContext } from "../../components/AuthContext";
import api from "../../services/api";

import Preview from "../../components/Dashboard/Preview";
import Editor from "../../components/Dashboard/Editor";

import { useSaveMyBusinessCard } from "../../hooks/useBusinessCard";

import "../../styling/dashboard/myprofile.css";

const norm = (v) => (v ?? "").toString().trim();
const isBlobUrl = (v) => typeof v === "string" && v.startsWith("blob:");

const safeRevoke = (url) => {
  if (!url || typeof url !== "string") return;
  if (!url.startsWith("blob:")) return;
  try {
    URL.revokeObjectURL(url);
  } catch { }
};

const revokeAllLocalPreviews = (st) => {
  safeRevoke(st?.coverPhotoPreview);
  safeRevoke(st?.logoPreview);
  safeRevoke(st?.avatarPreview);
  (st?.workImages || []).forEach((w) => safeRevoke(w?.preview));
};

const normaliseServicesForSave = (services = []) =>
  (Array.isArray(services) ? services : [])
    .map((s) => ({
      name: norm(s?.name),
      description: norm(s?.description || s?.price),
      // keep legacy backend compatibility
      price: norm(s?.description || s?.price),
    }))
    .filter((s) => s.name || s.description);

const normaliseReviewsForSave = (reviews = []) =>
  (Array.isArray(reviews) ? reviews : [])
    .map((r) => ({
      name: norm(r?.name),
      text: norm(r?.text),
      rating: Number(r?.rating) || 5,
    }))
    .filter((r) => r.name || r.text);

const buildBusinessCardFormData = ({
  profile_slug,
  template_id,
  theme_mode,

  business_card_name,
  business_name,
  trade_title,
  location,

  main_heading,
  sub_heading,

  job_title,
  full_name,
  bio,

  cover_photo,
  logo,
  avatar,

  works_existing_urls,
  work_images_files,

  services,
  reviews,

  contact_email,
  phone_number,

  cover_photo_removed,
  logo_removed,
  avatar_removed,

  show_main_section,
  show_about_me_section,
  show_work_section,
  show_services_section,
  show_reviews_section,
  show_contact_section,

  facebook_url,
  instagram_url,
  linkedin_url,
  x_url,
  tiktok_url,
}) => {
  const fd = new FormData();

  fd.append("profile_slug", (profile_slug || "main").toString());
  fd.append("template_id", (template_id || "template-1").toString());
  fd.append("theme_mode", (theme_mode || "light").toString());

  // New preferred fields
  fd.append("business_name", business_name || "");
  fd.append("trade_title", trade_title || "");
  fd.append("location", location || "");

  // Legacy-compatible fields
  fd.append("business_card_name", business_card_name || business_name || "");
  fd.append("main_heading", main_heading || business_name || "");
  fd.append("sub_heading", sub_heading || trade_title || "");

  // About
  fd.append("job_title", job_title || "");
  fd.append("full_name", full_name || "");
  fd.append("bio", bio || "");

  // Contact
  fd.append("contact_email", contact_email || "");
  fd.append("phone_number", phone_number || "");

  // Arrays
  fd.append("services", JSON.stringify(Array.isArray(services) ? services : []));
  fd.append("reviews", JSON.stringify(Array.isArray(reviews) ? reviews : []));

  // Existing works URLs
  const existing = Array.isArray(works_existing_urls)
    ? works_existing_urls.filter(Boolean)
    : [];
  existing.forEach((url) => fd.append("existing_works", url));

  // New uploads
  if (cover_photo instanceof File) fd.append("cover_photo", cover_photo);

  // Prefer new key, but also append avatar for backend compatibility
  if (logo instanceof File) {
    fd.append("logo", logo);
    fd.append("avatar", logo);
  } else if (avatar instanceof File) {
    fd.append("avatar", avatar);
  }

  const workFiles = Array.isArray(work_images_files) ? work_images_files : [];
  workFiles.forEach((f) => {
    if (f instanceof File) fd.append("works", f);
  });

  // Removed flags
  fd.append("cover_photo_removed", cover_photo_removed ? "1" : "0");
  fd.append("logo_removed", logo_removed ? "1" : "0");
  fd.append("avatar_removed", avatar_removed ? "1" : "0");

  // Show / hide section toggles
  fd.append("show_main_section", show_main_section === false ? "0" : "1");
  fd.append("show_about_me_section", show_about_me_section === false ? "0" : "1");
  fd.append("show_work_section", show_work_section === false ? "0" : "1");
  fd.append("show_services_section", show_services_section === false ? "0" : "1");
  fd.append("show_reviews_section", show_reviews_section === false ? "0" : "1");
  fd.append("show_contact_section", show_contact_section === false ? "0" : "1");

  // Socials
  fd.append("facebook_url", facebook_url || "");
  fd.append("instagram_url", instagram_url || "");
  fd.append("linkedin_url", linkedin_url || "");
  fd.append("x_url", x_url || "");
  fd.append("tiktok_url", tiktok_url || "");

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

const calcCompletionPctFromState = (st) => {
  const checks = [
    !!norm(st?.business_name || st?.businessName || st?.mainHeading),
    !!norm(st?.trade_title || st?.subHeading),
    !!norm(st?.location),
    !!norm(st?.full_name),
    !!norm(st?.job_title),
    !!norm(st?.bio),
    !!norm(st?.logo) || !!norm(st?.logoPreview) || !!norm(st?.avatar) || !!norm(st?.avatarPreview),
    !!norm(st?.coverPhoto) || !!norm(st?.coverPhotoPreview),
    Array.isArray(st?.workImages) && st.workImages.length > 0,
    Array.isArray(st?.services) && st.services.length > 0,
    Array.isArray(st?.reviews) && st.reviews.length > 0,
    !!norm(st?.contact_email),
    !!norm(st?.phone_number),
  ];

  const total = checks.length;
  const done = checks.filter(Boolean).length;
  return total ? Math.round((done / total) * 100) : 0;
};

const pctTone = (pct) => {
  if (pct >= 80) return "good";
  if (pct >= 40) return "mid";
  return "bad";
};

export default function MyProfile() {
  const { state, updateState, resetState } = useBusinessCardStore();
  const queryClient = useQueryClient();
  const location = useLocation();
  const navigate = useNavigate();

  const { user: authUser, hydrating: authLoading, fetchUser: refetchAuthUser } =
    useContext(AuthContext);

  const userEmail = authUser?.email;

  const plan = String(authUser?.plan || "free").toLowerCase();
  const isTeams = plan === "teams";
  const isPlus = plan === "plus";
  const isFree = !isPlus && !isTeams;

  const isUserVerified = !!authUser?.isVerified;
  const userUsername = authUser?.username;

  const activeSlug = useMemo(() => getSlugFromSearch(location.search), [location.search]);

  const { data: businessCard, isLoading: isCardLoading, isError: isCardError } =
    useQuery({
      queryKey: ["businessCard", "profile", activeSlug],
      queryFn: async () => {
        const res = await api.get(
          `/api/business-card/profiles/${encodeURIComponent(activeSlug)}`
        );
        return res?.data?.data ?? null;
      },
      enabled: !!authUser && !!activeSlug,
      staleTime: 30 * 1000,
      retry: 1,
    });

  useEffect(() => {
    if (!authUser) return;
    if (isCardLoading) return;
    if (businessCard) return;

    (async () => {
      try {
        const res = await api.get("/api/business-card/profiles");
        const list = res?.data?.data || [];
        const first = Array.isArray(list) && list.length ? list[0] : null;

        const firstSlug = (first?.profile_slug || "").toString().trim();
        if (!firstSlug) return;
        if (firstSlug === activeSlug) return;

        const url = new URL(window.location.href);
        url.searchParams.set("slug", firstSlug);
        window.history.replaceState({}, document.title, url.toString());
        navigate(url.pathname + url.search, { replace: true });
      } catch { }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authUser, isCardLoading, businessCard, activeSlug]);

  const saveBusinessCard = useSaveMyBusinessCard();

  const [showVerificationPrompt, setShowVerificationPrompt] = useState(false);
  const [verificationCodeInput, setVerificationCodeInput] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const [showShareModal, setShowShareModal] = useState(false);

  const [coverPhotoRemoved, setCoverPhotoRemoved] = useState(false);
  const [logoRemoved, setLogoRemoved] = useState(false);

  const mqDesktopToMobile = "(max-width: 1000px)";
  const mqSmallMobile = "(max-width: 520px)";
  const [isMobile, setIsMobile] = useState(() =>
    window.matchMedia(mqDesktopToMobile).matches
  );
  const [isSmallMobile, setIsSmallMobile] = useState(() =>
    window.matchMedia(mqSmallMobile).matches
  );

  const [showMainSection, setShowMainSection] = useState(true);
  const [showAboutMeSection, setShowAboutMeSection] = useState(true);
  const [showWorkSection, setShowWorkSection] = useState(true);
  const [showServicesSection, setShowServicesSection] = useState(true);
  const [showReviewsSection, setShowReviewsSection] = useState(true);
  const [showContactSection, setShowContactSection] = useState(true);

  const hasExchangeContact =
    (state.contact_email && state.contact_email.trim()) ||
    (state.phone_number && state.phone_number.trim());

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

  useEffect(() => {
    const mm1 = window.matchMedia(mqDesktopToMobile);
    const mm2 = window.matchMedia(mqSmallMobile);

    const onChange = () => {
      setIsMobile(mm1.matches);
      setIsSmallMobile(mm2.matches);
    };

    mm1.addEventListener("change", onChange);
    mm2.addEventListener("change", onChange);

    return () => {
      mm1.removeEventListener("change", onChange);
      mm2.removeEventListener("change", onChange);
    };
  }, []);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  useEffect(() => {
    if (!authLoading && authUser && !isUserVerified && userEmail) {
      setShowVerificationPrompt(true);
    } else if (!authLoading && isUserVerified) {
      setShowVerificationPrompt(false);
    }
  }, [authLoading, authUser, isUserVerified, userEmail]);

  useEffect(() => {
    if (isCardLoading) return;

    revokeAllLocalPreviews(state);

    if (businessCard) {
      updateState({
        templateId: businessCard.template_id || "template-1",
        themeMode: businessCard.theme_mode || businessCard.page_theme || "light",
        pageTheme: businessCard.theme_mode || businessCard.page_theme || "light",

        business_name:
          businessCard.business_name ||
          businessCard.business_card_name ||
          businessCard.main_heading ||
          "",
        businessName:
          businessCard.business_card_name ||
          businessCard.business_name ||
          businessCard.main_heading ||
          "",

        trade_title:
          businessCard.trade_title ||
          businessCard.sub_heading ||
          "",
        location: businessCard.location || "",

        mainHeading:
          businessCard.main_heading ||
          businessCard.business_name ||
          businessCard.business_card_name ||
          "",
        subHeading:
          businessCard.sub_heading ||
          businessCard.trade_title ||
          "",

        job_title: businessCard.job_title || "",
        full_name: businessCard.full_name || "",
        bio: businessCard.bio || "",

        logo: businessCard.logo || businessCard.avatar || null,
        avatar: businessCard.avatar || businessCard.logo || null,
        coverPhoto: businessCard.cover_photo || null,

        logoPreview: "",
        avatarPreview: "",
        coverPhotoPreview: "",

        logoFile: null,
        avatarFile: null,
        coverPhotoFile: null,

        workImages: (businessCard.works || []).map((url) => ({
          file: null,
          preview: url,
        })),

        services: (businessCard.services || []).map((s) => ({
          name: s?.name || "",
          description: s?.description || s?.price || "",
          price: s?.price || s?.description || "",
        })),

        reviews: (businessCard.reviews || []).map((r) => ({
          name: r?.name || "",
          text: r?.text || "",
          rating: Number(r?.rating) || 5,
        })),

        contact_email: businessCard.contact_email || "",
        phone_number: businessCard.phone_number || "",

        facebook_url: businessCard.facebook_url || "",
        instagram_url: businessCard.instagram_url || "",
        linkedin_url: businessCard.linkedin_url || "",
        x_url: businessCard.x_url || "",
        tiktok_url: businessCard.tiktok_url || "",
      });

      setShowMainSection(businessCard.show_main_section !== false);
      setShowAboutMeSection(businessCard.show_about_me_section !== false);
      setShowWorkSection(businessCard.show_work_section !== false);
      setShowServicesSection(businessCard.show_services_section !== false);
      setShowReviewsSection(businessCard.show_reviews_section !== false);
      setShowContactSection(businessCard.show_contact_section !== false);

      setCoverPhotoRemoved(false);
      setLogoRemoved(false);
    } else {
      resetState();

      setShowMainSection(true);
      setShowAboutMeSection(true);
      setShowWorkSection(true);
      setShowServicesSection(true);
      setShowReviewsSection(true);
      setShowContactSection(true);

      updateState({
        templateId: "template-1",
        themeMode: "light",
        pageTheme: "light",

        business_name: "",
        businessName: "",
        trade_title: "",
        location: "",

        mainHeading: "",
        subHeading: "",

        job_title: "",
        full_name: "",
        bio: "",

        facebook_url: "",
        instagram_url: "",
        linkedin_url: "",
        x_url: "",
        tiktok_url: "",

        contact_email: "",
        phone_number: "",

        logo: null,
        avatar: null,
        coverPhoto: null,

        logoPreview: "",
        avatarPreview: "",
        coverPhotoPreview: "",

        logoFile: null,
        avatarFile: null,
        coverPhotoFile: null,

        workImages: [],
        services: [],
        reviews: [],
      });

      setCoverPhotoRemoved(false);
      setLogoRemoved(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [businessCard, isCardLoading, resetState, updateState]);

  const onCoverUpload = (file) => {
    if (!file || !file.type?.startsWith("image/")) return;

    safeRevoke(state.coverPhotoPreview);
    const url = URL.createObjectURL(file);

    updateState({
      coverPhotoPreview: url,
      coverPhotoFile: file,
    });

    setCoverPhotoRemoved(false);
  };

  const onAvatarUpload = (file) => {
    if (!file || !file.type?.startsWith("image/")) return;

    safeRevoke(state.logoPreview);
    safeRevoke(state.avatarPreview);

    const url = URL.createObjectURL(file);

    updateState({
      logoPreview: url,
      avatarPreview: url,
      logoFile: file,
      avatarFile: file,
    });

    setLogoRemoved(false);
  };

  const onAddWorkImages = (files) => {
    const valid = Array.from(files || []).filter((f) => f && f.type.startsWith("image/"));
    if (!valid.length) return;

    const items = valid.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    const existing = Array.isArray(state.workImages) ? state.workImages : [];
    const maxWorks = isFree ? 6 : 12;
    const merged = [...existing, ...items].slice(0, maxWorks);

    updateState({ workImages: merged });
  };

  const handleRemoveCoverPhoto = () => {
    if (state.coverPhoto && !isBlobUrl(state.coverPhoto)) setCoverPhotoRemoved(true);
    else setCoverPhotoRemoved(false);

    safeRevoke(state.coverPhotoPreview);

    updateState({
      coverPhoto: null,
      coverPhotoPreview: "",
      coverPhotoFile: null,
    });
  };

  const handleRemoveAvatar = () => {
    const existingLogoOrAvatar = state.logo || state.avatar;
    if (existingLogoOrAvatar && !isBlobUrl(existingLogoOrAvatar)) setLogoRemoved(true);
    else setLogoRemoved(false);

    safeRevoke(state.logoPreview);
    safeRevoke(state.avatarPreview);

    updateState({
      logo: null,
      avatar: null,
      logoPreview: "",
      avatarPreview: "",
      logoFile: null,
      avatarFile: null,
    });
  };

  const handleRemoveWorkImage = (idx) => {
    const item = state.workImages?.[idx];
    safeRevoke(item?.preview);
    updateState({
      workImages: (state.workImages || []).filter((_, i) => i !== idx),
    });
  };

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
      const res = await api.post("/verify-email", {
        email: userEmail,
        code: verificationCodeInput,
      });
      if (res.data?.error) return toast.error(res.data.error);

      toast.success("Email verified successfully!");
      setShowVerificationPrompt(false);
      setVerificationCodeInput("");
      await refetchAuthUser?.();
    } catch (err) {
      toast.error(err?.response?.data?.error || "Verification failed.");
    }
  };

  const handleResetPage = () => {
    revokeAllLocalPreviews(state);
    resetState();

    setShowMainSection(true);
    setShowAboutMeSection(true);
    setShowWorkSection(true);
    setShowServicesSection(true);
    setShowReviewsSection(true);
    setShowContactSection(true);

    setCoverPhotoRemoved(false);
    setLogoRemoved(false);

    updateState({
      templateId: "template-1",
      themeMode: "light",
      pageTheme: "light",

      business_name: "",
      businessName: "",
      trade_title: "",
      location: "",

      mainHeading: "",
      subHeading: "",

      job_title: "",
      full_name: "",
      bio: "",

      contact_email: "",
      phone_number: "",

      facebook_url: "",
      instagram_url: "",
      linkedin_url: "",
      x_url: "",
      tiktok_url: "",

      logo: null,
      avatar: null,
      coverPhoto: null,

      logoPreview: "",
      avatarPreview: "",
      coverPhotoPreview: "",

      logoFile: null,
      avatarFile: null,
      coverPhotoFile: null,

      workImages: [],
      services: [],
      reviews: [],
    });

    toast.success("Editor reset.");
  };

  const hasProfileChanges = () => {
    const hasNewFiles =
      state.coverPhotoFile instanceof File ||
      state.logoFile instanceof File ||
      state.avatarFile instanceof File ||
      (state.workImages || []).some((w) => w?.file instanceof File);

    if (hasNewFiles || coverPhotoRemoved || logoRemoved) return true;

    const original = businessCard || {};

    const normalizeServices = (arr) =>
      (arr || []).map((s) => ({
        name: norm(s?.name),
        description: norm(s?.description || s?.price),
      }));

    const normalizeReviews = (arr) =>
      (arr || []).map((r) => ({
        name: norm(r?.name),
        text: norm(r?.text),
        rating: Number(r?.rating) || 0,
      }));

    const servicesChanged = (() => {
      const a = normalizeServices(state.services);
      const b = normalizeServices(original.services);
      if (a.length !== b.length) return true;
      for (let i = 0; i < a.length; i++) {
        if (a[i].name !== b[i].name || a[i].description !== b[i].description) return true;
      }
      return false;
    })();

    const reviewsChanged = (() => {
      const a = normalizeReviews(state.reviews);
      const b = normalizeReviews(original.reviews);
      if (a.length !== b.length) return true;
      for (let i = 0; i < a.length; i++) {
        if (
          a[i].name !== b[i].name ||
          a[i].text !== b[i].text ||
          a[i].rating !== b[i].rating
        ) {
          return true;
        }
      }
      return false;
    })();

    const currentWorks = (state.workImages || [])
      .map((w) => (w?.preview && !w.preview.startsWith("blob:") ? w.preview : null))
      .filter(Boolean);

    const originalWorks = original.works || [];

    const worksChanged = (() => {
      if (currentWorks.length !== originalWorks.length) return true;
      for (let i = 0; i < currentWorks.length; i++) {
        if (currentWorks[i] !== originalWorks[i]) return true;
      }
      return false;
    })();

    const origTemplate = original.template_id || "template-1";
    const currentTemplate = state.templateId || "template-1";

    const origTheme = original.theme_mode || original.page_theme || "light";
    const currentTheme = state.themeMode || state.pageTheme || "light";

    const origShowMain = original.show_main_section !== false;
    const origShowAbout = original.show_about_me_section !== false;
    const origShowWork = original.show_work_section !== false;
    const origShowServices = original.show_services_section !== false;
    const origShowReviews = original.show_reviews_section !== false;
    const origShowContact = original.show_contact_section !== false;

    const originalBusinessName =
      original.business_name ||
      original.business_card_name ||
      original.main_heading ||
      "";

    const originalTradeTitle =
      original.trade_title ||
      original.sub_heading ||
      "";

    const originalLogo =
      original.logo ||
      original.avatar ||
      "";

    const currentLogo =
      state.logo ||
      state.avatar ||
      "";

    return (
      currentTemplate !== origTemplate ||
      currentTheme !== origTheme ||

      norm(state.business_name || state.businessName || state.mainHeading) !== norm(originalBusinessName) ||
      norm(state.trade_title || state.subHeading) !== norm(originalTradeTitle) ||
      norm(state.location) !== norm(original.location || "") ||

      norm(state.job_title) !== norm(original.job_title || "") ||
      norm(state.full_name) !== norm(original.full_name || "") ||
      norm(state.bio) !== norm(original.bio || "") ||

      norm(currentLogo) !== norm(originalLogo) ||

      norm(state.contact_email) !== norm(original.contact_email || "") ||
      norm(state.phone_number) !== norm(original.phone_number || "") ||

      servicesChanged ||
      reviewsChanged ||
      worksChanged ||

      showMainSection !== origShowMain ||
      showAboutMeSection !== origShowAbout ||
      showWorkSection !== origShowWork ||
      showServicesSection !== origShowServices ||
      showReviewsSection !== origShowReviews ||
      showContactSection !== origShowContact ||

      norm(state.facebook_url) !== norm(original.facebook_url || "") ||
      norm(state.instagram_url) !== norm(original.instagram_url || "") ||
      norm(state.linkedin_url) !== norm(original.linkedin_url || "") ||
      norm(state.x_url) !== norm(original.x_url || "") ||
      norm(state.tiktok_url) !== norm(original.tiktok_url || "")
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

    const servicesPayload = normaliseServicesForSave(state.services);
    const reviewsPayload = normaliseReviewsForSave(state.reviews);

    const formData = buildBusinessCardFormData({
      profile_slug: activeSlug,
      template_id: state.templateId || "template-1",
      theme_mode: state.themeMode || state.pageTheme || "light",

      business_card_name:
        state.business_name ||
        state.businessName ||
        state.mainHeading ||
        "",
      business_name:
        state.business_name ||
        state.businessName ||
        state.mainHeading ||
        "",
      trade_title:
        state.trade_title ||
        state.subHeading ||
        "",
      location: state.location || "",

      main_heading:
        state.mainHeading ||
        state.business_name ||
        state.businessName ||
        "",
      sub_heading:
        state.subHeading ||
        state.trade_title ||
        "",

      job_title: state.job_title,
      full_name: state.full_name,
      bio: state.bio,

      cover_photo: state.coverPhotoFile,
      logo: state.logoFile,
      avatar: state.avatarFile,

      works_existing_urls: existingWorkUrls,
      work_images_files: newWorkFiles,

      services: servicesPayload,
      reviews: reviewsPayload,

      contact_email: state.contact_email,
      phone_number: state.phone_number,

      cover_photo_removed: coverPhotoRemoved,
      logo_removed: logoRemoved,
      avatar_removed: logoRemoved,

      show_main_section: showMainSection,
      show_about_me_section: showAboutMeSection,
      show_work_section: showWorkSection,
      show_services_section: showServicesSection,
      show_reviews_section: showReviewsSection,
      show_contact_section: showContactSection,

      facebook_url: state.facebook_url,
      instagram_url: state.instagram_url,
      linkedin_url: state.linkedin_url,
      x_url: state.x_url,
      tiktok_url: state.tiktok_url,
    });

    try {
      await saveBusinessCard.mutateAsync(formData);
      toast.success("Saved ✅");

      queryClient.invalidateQueries({ queryKey: ["businessCard", "me"] });
      queryClient.invalidateQueries({ queryKey: ["businessCard", "profiles"] });
      queryClient.invalidateQueries({ queryKey: ["businessCard", "profile", activeSlug] });

      revokeAllLocalPreviews(state);

      updateState({
        coverPhotoPreview: "",
        logoPreview: "",
        avatarPreview: "",
        coverPhotoFile: null,
        logoFile: null,
        avatarFile: null,
      });

      setCoverPhotoRemoved(false);
      setLogoRemoved(false);
    } catch (err) {
      toast.error(
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        "Something went wrong while saving."
      );
    }
  };

  const handleStartSubscription = () => navigate("/pricing");

  const handleShareCard = () => {
    if (!isUserVerified) return toast.error("Please verify your email to share your page.");
    setShowShareModal(true);
  };

  const visitUrl = useMemo(() => {
    if (!userUsername) return "#";
    if (!activeSlug || activeSlug === "main") return `${window.location.origin}/u/${userUsername}`;
    return `${window.location.origin}/u/${userUsername}/${encodeURIComponent(activeSlug)}`;
  }, [userUsername, activeSlug]);

  const completionPct = useMemo(() => calcCompletionPctFromState(state), [state]);
  const completionTone = useMemo(() => pctTone(completionPct), [completionPct]);

  const isLive = useMemo(() => {
    if (businessCard?.is_live === true) return true;
    if (businessCard?.published === true) return true;
    if (String(businessCard?.status || "").toLowerCase() === "live") return true;
    return completionPct >= 60;
  }, [businessCard, completionPct]);

  return (
    <DashboardLayout title={null} subtitle={null} hideDesktopHeader>
      <div className="myprofile-shell">
        <PageHeader
          title={`${activeSlug} Profile`}
          subtitle="Update your card — changes go live when you publish."
          onShareCard={handleShareCard}
          visitUrl={visitUrl}
          isMobile={isMobile}
          isSmallMobile={isSmallMobile}
          rightSlot={null}
        />

        {!authLoading && !authUser && (
          <section className="profiles-card myprofile-card">
            <h2 className="profiles-card-title">User not loaded</h2>
            <p className="profiles-muted">Please ensure you are logged in.</p>
            <div className="profiles-actions-row">
              <button
                className="profiles-btn profiles-btn-primary"
                onClick={() => (window.location.href = "/login")}
              >
                Go to Login
              </button>
            </div>
          </section>
        )}

        {!authLoading && authUser && (
          <>
            {isCardError && (
              <section className="profiles-card myprofile-card">
                <h2 className="profiles-card-title">Couldn’t load this profile</h2>
                <p className="profiles-muted">
                  Try again, or go back to Profiles and select a different profile.
                </p>
                <div className="profiles-actions-row">
                  <button
                    className="profiles-btn profiles-btn-primary"
                    onClick={() =>
                      queryClient.invalidateQueries({
                        queryKey: ["businessCard", "profile", activeSlug],
                      })
                    }
                  >
                    Retry
                  </button>
                  <button className="profiles-btn profiles-btn-ghost" onClick={() => navigate("/profiles")}>
                    Back to Profiles
                  </button>
                </div>
              </section>
            )}

            {showVerificationPrompt && (
              <section className="profiles-card myprofile-card myprofile-warn">
                <h2 className="profiles-card-title">Email not verified</h2>
                <p className="profiles-muted">
                  Verify your email (<strong>{userEmail}</strong>) to enable sharing features.
                </p>

                <form onSubmit={handleVerifyCode} className="myprofile-verify">
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

                  <div className="profiles-actions-row">
                    <button type="submit" className="profiles-btn profiles-btn-primary">
                      Verify Email
                    </button>

                    <button
                      type="button"
                      className="profiles-btn profiles-btn-ghost"
                      onClick={sendVerificationCode}
                      disabled={resendCooldown > 0}
                    >
                      {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend Code"}
                    </button>
                  </div>
                </form>
              </section>
            )}

            <div className="myprofile-grid">
              <section className="myprofile-editorCol">
                <div className="myprofile-editorSurface">
                  <div className="myprofile-editorBody">
                    <Editor
                      state={state}
                      updateState={updateState}
                      isSubscribed={!isFree}
                      hasTrialEnded={false}
                      onStartSubscription={handleStartSubscription}
                      onResetPage={handleResetPage}
                      onSubmit={handleSubmit}
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
                    />
                  </div>
                </div>
              </section>

              <aside className="profiles-card myprofile-cardShell myprofile-previewCard">
                <div className="myprofile-previewFrame myprofile-previewFrame--full">
                  <Preview
                    state={state}
                    isMobile={isMobile}
                    hasSavedData={!!businessCard}
                    showMainSection={showMainSection}
                    showAboutMeSection={showAboutMeSection}
                    showWorkSection={showWorkSection}
                    showServicesSection={showServicesSection}
                    showReviewsSection={showReviewsSection}
                    showContactSection={showContactSection}
                    hasExchangeContact={hasExchangeContact}
                    visitUrl={visitUrl}
                    isLive={isLive}
                    completionPct={completionPct}
                    completionTone={completionTone}
                    columnScrollStyle={{ height: "100%", maxHeight: "100%" }}
                  />
                </div>
              </aside>
            </div>
          </>
        )}
      </div>

      <ShareProfile
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        profileUrl={visitUrl}
        qrCodeUrl={businessCard?.qr_code_url || ""}
        contactDetails={{
          full_name: businessCard?.full_name || "",
          job_title: businessCard?.job_title || "",
          business_card_name:
            businessCard?.business_name ||
            businessCard?.business_card_name ||
            "",
          bio: businessCard?.bio || "",
          isSubscribed: !isFree,
          contact_email: businessCard?.contact_email || "",
          phone_number: businessCard?.phone_number || "",
          username: userUsername || "",
        }}
        username={userUsername || ""}
      />
    </DashboardLayout>
  );
}