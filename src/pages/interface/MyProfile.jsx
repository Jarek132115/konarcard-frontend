// src/pages/MyProfile/MyProfile.jsx
import React, { useRef, useEffect, useState, useContext, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import PageHeader from "../../components/PageHeader";
import useBusinessCardStore, { previewPlaceholders } from "../../store/businessCardStore";
import { useQueryClient } from "@tanstack/react-query";
import { useFetchBusinessCard } from "../../hooks/useFetchBusinessCard";
import { useCreateBusinessCard, buildBusinessCardFormData } from "../../hooks/useCreateBiz";
import axios from "axios";
import { toast } from "react-hot-toast";
import ShareProfile from "../../components/ShareProfile";
import { AuthContext } from "../../components/AuthContext";
import api, { startTrial } from "../../services/api";
import LogoIcon from "../../assets/icons/Logo-Icon.svg";

export default function MyProfile() {
  const { state, updateState, resetState } = useBusinessCardStore();
  const createBusinessCard = useCreateBusinessCard();
  const queryClient = useQueryClient();
  const location = useLocation();

  const { user: authUser, loading: authLoading, fetchUser: refetchAuthUser } = useContext(AuthContext);

  const userId = authUser?._id;
  const userEmail = authUser?.email;
  const isSubscribed = !!authUser?.isSubscribed;
  const isUserVerified = !!authUser?.isVerified;
  const userUsername = authUser?.username;

  const { data: businessCard, isLoading: isCardLoading } = useFetchBusinessCard(userId);

  // Refs
  const fileInputRef = useRef(null);
  const avatarInputRef = useRef(null);
  const workImageInputRef = useRef(null);

  const previewWorkCarouselRef = useRef(null);
  const previewServicesCarouselRef = useRef(null);
  const previewReviewsCarouselRef = useRef(null);

  const activeBlobUrlsRef = useRef([]);
  const mpWrapRef = useRef(null); // mobile preview wrapper for dynamic height
  const handledPaymentRef = useRef(false);

  // Gate/throttle for Stripe sync -> auth refresh
  const syncGate = useRef({ inFlight: false, lastRun: 0 });

  // Local state
  const [showVerificationPrompt, setShowVerificationPrompt] = useState(false);
  const [verificationCodeInput, setVerificationCodeCode] = useState("");
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

  // Editor display toggles
  const [servicesDisplayMode, setServicesDisplayMode] = useState("list");
  const [reviewsDisplayMode, setReviewsDisplayMode] = useState("list");
  const [aboutMeLayout, setAboutMeLayout] = useState("side-by-side");

  const [showMainSection, setShowMainSection] = useState(true);
  const [showAboutMeSection, setShowAboutMeSection] = useState(true);
  const [showWorkSection, setShowWorkSection] = useState(true);
  const [showServicesSection, setShowServicesSection] = useState(true);
  const [showReviewsSection, setShowReviewsSection] = useState(true);
  const [showContactSection, setShowContactSection] = useState(true);

  const [previewOpen, setPreviewOpen] = useState(true);

  // ---- Cancel-at-period-end notice state (derived from /me/orders)
  const [subWillCancel, setSubWillCancel] = useState(false);
  const [subPeriodEnd, setSubPeriodEnd] = useState(null);

  // ---- Trial helpers
  const trialEndDate = useMemo(() => {
    if (!authUser?.trialExpires) return null;
    const d = new Date(authUser.trialExpires);
    return Number.isNaN(d.getTime()) ? null : d;
  }, [authUser?.trialExpires]);

  const trialDaysLeft = useMemo(() => {
    if (!trialEndDate) return null;
    const ms = trialEndDate.getTime() - Date.now();
    const days = Math.ceil(ms / (1000 * 60 * 60 * 24));
    return Math.max(0, days);
  }, [trialEndDate]);

  // IMPORTANT: Only consider trial "active" if NOT subscribed.
  const isTrialActive = !!(!isSubscribed && trialEndDate && trialEndDate.getTime() > Date.now());
  const hasTrialEnded = !!(trialEndDate && trialEndDate.getTime() <= Date.now());

  const hasSavedData = !!businessCard;
  const hasExchangeContact =
    (state.contact_email && state.contact_email.trim()) || (state.phone_number && state.phone_number.trim());

  // ---- Helpers ----

  // sync Stripe -> refresh auth user, but throttle and avoid overlap
  const syncStripeAndRefresh = async (opts = {}) => {
    const now = Date.now();
    const minIntervalMs = opts.minIntervalMs ?? 20000; // throttle window
    if (syncGate.current.inFlight) return;
    if (now - syncGate.current.lastRun < minIntervalMs) return;

    syncGate.current.inFlight = true;
    try {
      await api.post("/me/sync-subscriptions", { ts: now });
      if (typeof refetchAuthUser === "function") {
        await refetchAuthUser();
      }
      syncGate.current.lastRun = Date.now();
    } catch {
      // ignore network errors
    } finally {
      syncGate.current.inFlight = false;
    }
  };

  // ---- Effects

  // Stripe return handler — run once, independent of authLoading
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const sessionId = params.get("session_id");
    const paymentSuccess = params.get("payment_success");

    if ((sessionId || paymentSuccess === "true") && !handledPaymentRef.current) {
      handledPaymentRef.current = true;
      (async () => {
        await syncStripeAndRefresh({ minIntervalMs: 0 });
        toast.success("Subscription updated successfully!");
        // Clean the URL
        window.history.replaceState({}, document.title, location.pathname);
      })();
    }
  }, [location.search, location.pathname]); // deliberate: no authLoading here

  // Debounced window focus sync (covers Billing Portal / manual Stripe changes)
  useEffect(() => {
    let t = null;
    const onFocus = () => {
      if (document.visibilityState !== "visible") return;
      if (t) clearTimeout(t);
      t = setTimeout(() => {
        syncStripeAndRefresh();
      }, 350);
    };
    window.addEventListener("focus", onFocus);
    return () => {
      window.removeEventListener("focus", onFocus);
      if (t) clearTimeout(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // One initial sync on mount so banner reflects latest status after long idle
  useEffect(() => {
    syncStripeAndRefresh({ minIntervalMs: 0 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When subscribed, fetch orders to see if cancel_at_period_end is set and pull period end date for notice.
  useEffect(() => {
    let cancelled = false;
    const fetchSubFlags = async () => {
      if (!isSubscribed) {
        setSubWillCancel(false);
        setSubPeriodEnd(null);
        return;
      }
      try {
        const res = await api.get("/me/orders", { params: { ts: Date.now() } });
        const rows = Array.isArray(res?.data?.data) ? res.data.data : [];
        const subs = rows.filter((o) => (o.type || "").toLowerCase() === "subscription");
        if (!subs.length) {
          setSubWillCancel(false);
          setSubPeriodEnd(null);
          return;
        }
        subs.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        const s = subs[0];
        const willCancel = !!s.cancel_at_period_end;
        const periodEnd = s.currentPeriodEnd ? new Date(s.currentPeriodEnd) : null;
        if (!cancelled) {
          setSubWillCancel(willCancel);
          setSubPeriodEnd(periodEnd);
        }
      } catch {
        if (!cancelled) {
          setSubWillCancel(false);
          setSubPeriodEnd(null);
        }
      }
    };
    fetchSubFlags();
    return () => {
      cancelled = true;
    };
  }, [isSubscribed]);

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

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  useEffect(() => {
    if (!authLoading && authUser && !isUserVerified && userEmail) setShowVerificationPrompt(true);
    else if (!authLoading && isUserVerified) setShowVerificationPrompt(false);
  }, [authLoading, authUser, isUserVerified, userEmail]);

  // optional scroll-to-editor hook for mobile
  useEffect(() => {
    const wantScroll = localStorage.getItem("scrollToEditorOnLoad") === "1";
    if (!wantScroll) return;
    if (window.innerWidth <= 1000) {
      let tries = 0;
      const tick = () => {
        const el = document.getElementById("myprofile-editor") || document.querySelector(".myprofile-editor-anchor");
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
          try {
            localStorage.removeItem("scrollToEditorOnLoad");
          } catch { }
        } else if (tries < 20) {
          tries += 1;
          setTimeout(tick, 150);
        } else {
          try {
            localStorage.removeItem("scrollToEditorOnLoad");
          } catch { }
        }
      };
      tick();
    } else {
      try {
        localStorage.removeItem("scrollToEditorOnLoad");
      } catch { }
    }
  }, []);

  useEffect(() => {
    if (isCardLoading) return;

    if (businessCard) {
      updateState({
        businessName: businessCard.business_card_name || "",
        pageTheme: businessCard.page_theme || "light",
        font: businessCard.style || "Inter",
        mainHeading: businessCard.main_heading || "",
        subHeading: businessCard.sub_heading || "",
        job_title: businessCard.job_title || "",
        full_name: businessCard.full_name || "",
        bio: businessCard.bio || "",
        avatar: businessCard.avatar || null,
        coverPhoto: businessCard.cover_photo || null,
        workImages: (businessCard.works || []).map((url) => ({ file: null, preview: url })),
        services: businessCard.services || [],
        reviews: businessCard.reviews || [],
        contact_email: businessCard.contact_email || "",
        phone_number: businessCard.phone_number || "",
        workDisplayMode: businessCard.work_display_mode || "list",
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
    }
  }, [businessCard, isCardLoading, resetState, updateState]);

  useEffect(() => {
    return () => {
      activeBlobUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  // Keep mobile preview expanded to its content height (no cutting off)
  useEffect(() => {
    if (!isMobile) return;
    const el = mpWrapRef.current;
    if (!el) return;
    if (previewOpen) {
      el.style.maxHeight = el.scrollHeight + "px";
      el.style.opacity = "1";
      el.style.transform = "scale(1)";
    } else {
      el.style.maxHeight = "0px";
      el.style.opacity = "0";
      el.style.transform = "scale(.98)";
    }
  }, [isMobile, previewOpen, state, servicesDisplayMode, reviewsDisplayMode, aboutMeLayout]);

  // Helpers
  const createAndTrackBlobUrl = (file) => {
    const url = URL.createObjectURL(file);
    activeBlobUrlsRef.current.push(url);
    return url;
  };

  const handleImageUpload = (e) => {
    e.preventDefault();
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      updateState({ coverPhoto: createAndTrackBlobUrl(file) });
      setCoverPhotoFile(file);
      setCoverPhotoRemoved(false);
    }
  };

  const handleAvatarUpload = (e) => {
    e.preventDefault();
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      updateState({ avatar: createAndTrackBlobUrl(file) });
      setAvatarFile(file);
      setIsAvatarRemoved(false);
    }
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

  const handleAddWorkImage = (e) => {
    e.preventDefault();
    const files = Array.from(e.target.files || []).filter((f) => f && f.type.startsWith("image/"));
    if (!files.length) return;

    const previewItems = files.map((file) => ({ file, preview: createAndTrackBlobUrl(file) }));
    updateState({ workImages: [...state.workImages, ...previewItems] });
    setWorkImageFiles((prev) => [...prev, ...files]);
  };

  const handleRemoveWorkImage = (idx) => {
    const item = state.workImages?.[idx];
    if (item?.preview?.startsWith("blob:")) URL.revokeObjectURL(item.preview);
    updateState({ workImages: state.workImages.filter((_, i) => i !== idx) });
  };

  const handleAddService = () => updateState({ services: [...state.services, { name: "", price: "" }] });
  const handleServiceChange = (i, field, value) => {
    const arr = [...state.services];
    arr[i] = { ...arr[i], [field]: value };
    updateState({ services: arr });
  };
  const handleRemoveService = (i) => updateState({ services: state.services.filter((_, x) => x !== i) });

  const handleAddReview = () => updateState({ reviews: [...state.reviews, { name: "", text: "", rating: 5 }] });
  const handleReviewChange = (i, field, value) => {
    const arr = [...state.reviews];
    if (field === "rating") {
      const n = parseInt(value, 10);
      arr[i] = { ...arr[i], rating: Number.isFinite(n) ? Math.min(5, Math.max(0, n)) : 0 };
    } else {
      arr[i] = { ...arr[i], [field]: value };
    }
    updateState({ reviews: arr });
  };
  const handleRemoveReview = (i) => updateState({ reviews: state.reviews.filter((_, x) => x !== i) });

  const sendVerificationCode = async () => {
    if (!userEmail) return toast.error("Email not found. Please log in again.");
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/resend-code`, { email: userEmail });
      if (res.data.error) toast.error(res.data.error);
      else {
        toast.success("Verification code sent!");
        setResendCooldown(30);
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Could not resend code.");
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    if (!userEmail) return toast.error("Email not found. Cannot verify.");
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/verify-email`, {
        email: userEmail,
        code: verificationCodeInput,
      });
      if (res.data.error) toast.error(res.data.error);
      else {
        toast.success("Email verified successfully!");
        setShowVerificationPrompt(false);
        setVerificationCodeCode("");
        refetchAuthUser?.();
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Verification failed.");
    }
  };

  // Reset editor + files/blobs
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
    toast.success("Editor reset.");
  };

  // Smooth-scroll horizontal carousels
  const scrollCarousel = (ref, direction) => {
    const el = ref?.current;
    if (!el) return;
    const amount = el.clientWidth * 0.9;
    el.scrollBy({ left: direction === "left" ? -amount : amount, behavior: "smooth" });
  };

  const hasProfileChanges = () => {
    if (coverPhotoFile || avatarFile || workImageFiles.length || coverPhotoRemoved || isAvatarRemoved) return true;
    const original = businessCard || {};
    const norm = (v) => (v ?? "").toString().trim();

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

    return (
      state.businessName !== (original.business_card_name || "") ||
      state.pageTheme !== (original.page_theme || "light") ||
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
      showContactSection !== origShowContact
    );
  };

  const handleStartSubscription = async () => {
    try {
      const response = await api.post("/subscribe", {});
      if (response.data?.url) {
        // Send user to Stripe; on return we detect ?session_id=... and refresh
        window.location.href = response.data.url;
      } else {
        toast.error("Failed to start subscription. Please try again.");
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to start subscription.");
    }
  };

  const handleShareCard = () => {
    if (!isUserVerified) return toast.error("Please verify your email to share your card.");
    setShowShareModal(true);
  };
  const handleCloseShareModal = () => setShowShareModal(false);

  const ensureTrialIfNeeded = async () => {
    if (isSubscribed || isTrialActive) return;
    try {
      const res = await startTrial();
      if (res?.data?.trialExpires) toast.success("Your 14-day trial started!");
      else toast.success("Trial activated!");
      if (typeof refetchAuthUser === "function") await refetchAuthUser();
    } catch (err) {
      const msg = err?.response?.data?.error || "";
      if (!/already started/i.test(msg)) console.error("Failed to auto-start trial:", msg);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!hasProfileChanges()) return toast.error("You haven't made any changes.");
    if (!isSubscribed && !isTrialActive) await ensureTrialIfNeeded();

    const worksToUpload = state.workImages
      .map((item) => {
        if (item.file) return { file: item.file };
        if (item.preview && !item.preview.startsWith("blob:")) return item.preview;
        return null;
      })
      .filter(Boolean);

    const formData = buildBusinessCardFormData({
      business_card_name: state.businessName,
      page_theme: state.pageTheme,
      font: state.font,
      main_heading: state.mainHeading,
      sub_heading: state.subHeading,
      job_title: state.job_title,
      full_name: state.full_name,
      bio: state.bio,
      user: userId,
      cover_photo: coverPhotoFile,
      avatar: avatarFile,
      cover_photo_removed: coverPhotoRemoved,
      avatar_removed: isAvatarRemoved,
      works: worksToUpload,
      services: state.services.filter((s) => s.name || s.price),
      reviews: state.reviews.filter((r) => r.name || r.text),
      contact_email: state.contact_email,
      phone_number: state.phone_number,
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
    });

    try {
      await createBusinessCard.mutateAsync(formData);
      toast.success("Your page is Published!");
      queryClient.invalidateQueries(["businessCard", userId]);

      setCoverPhotoFile(null);
      setAvatarFile(null);
      setWorkImageFiles([]);
      setCoverPhotoRemoved(false);
      setIsAvatarRemoved(false);

      activeBlobUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      activeBlobUrlsRef.current = [];
    } catch (err) {
      toast.error(err.response?.data?.error || "Something went wrong while saving.");
    }
  };

  // Render
  const visitUrl = userUsername ? `https://www.konarcard.com/u/${userUsername}` : "#";

  // Desktop column scroll (preview + editor) — inside-column scroll only
  const columnScrollStyle = !isMobile
    ? { maxHeight: "calc(100vh - 140px)", overflow: "auto" }
    : undefined;

  const shouldShowPlaceholders = !hasSavedData;
  const previewFullName = state.full_name || (shouldShowPlaceholders ? previewPlaceholders.full_name : "");
  const previewJobTitle = state.job_title || (shouldShowPlaceholders ? previewPlaceholders.job_title : "");
  const previewBio = state.bio || (shouldShowPlaceholders ? previewPlaceholders.bio : "");
  const previewEmail = state.contact_email || (shouldShowPlaceholders ? previewPlaceholders.contact_email : "");
  const previewPhone = state.phone_number || (shouldShowPlaceholders ? previewPlaceholders.phone_number : "");
  const previewCoverPhotoSrc = state.coverPhoto ?? (shouldShowPlaceholders ? previewPlaceholders.coverPhoto : "");
  const previewAvatarSrc = state.avatar ?? (shouldShowPlaceholders ? previewPlaceholders.avatar : null);
  const previewWorkImages =
    state.workImages && state.workImages.length > 0
      ? state.workImages
      : shouldShowPlaceholders
        ? previewPlaceholders.workImages
        : [];
  const servicesForPreview =
    state.services && state.services.length > 0 ? state.services : shouldShowPlaceholders ? previewPlaceholders.services : [];
  const reviewsForPreview =
    state.reviews && state.reviews.length > 0 ? state.reviews : shouldShowPlaceholders ? previewPlaceholders.reviews : [];
  const isDarkMode = state.pageTheme === "dark";

  return (
    <div className={`app-layout ${sidebarOpen ? "sidebar-active" : ""}`}>
      {/* Mobile header */}
      <div className="myprofile-mobile-header">
        <div className="myprofile-brand">
          <img src={LogoIcon} alt="Konar" className="myprofile-logo" />
        </div>
        <button
          className={`sidebar-menu-toggle ${sidebarOpen ? "active" : ""}`}
          aria-label={sidebarOpen ? "Close menu" : "Open menu"}
          onClick={() => setSidebarOpen((s) => !s)}
        >
          <span></span><span></span><span></span>
        </button>
      </div>

      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <main className="main-content-container">
        <PageHeader onShareCard={handleShareCard} isMobile={isMobile} isSmallMobile={isSmallMobile} />

        <div className="myprofile-main-content">
          {!authLoading && !authUser && (
            <div className="content-card-box error-state">
              <p>User not loaded. Please ensure you are logged in.</p>
              <button onClick={() => (window.location.href = "/login")}>Go to Login</button>
            </div>
          )}

          {!authLoading && authUser && (
            <>
              {showVerificationPrompt && (
                <div className="content-card-box verification-prompt">
                  <p>⚠️ Your email is not verified!</p>
                  <p>
                    Please verify your email address (<strong>{userEmail}</strong>) to unlock all features, including saving changes to your business card.
                  </p>
                  <form onSubmit={handleVerifyCode}>
                    <input
                      type="text"
                      className="text-input"
                      placeholder="Enter 6-digit code"
                      value={verificationCodeInput}
                      onChange={(e) => setVerificationCodeCode(e.target.value)}
                      maxLength={6}
                    />
                    <button type="submit">Verify Email</button>
                    <button type="button" onClick={sendVerificationCode} disabled={resendCooldown > 0}>
                      {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend Code"}
                    </button>
                  </form>
                </div>
              )}

              {/* Cancellation notice if sub is set to end at period end */}
              {isSubscribed && subWillCancel && (
                <div className="trial-ended-banner" style={{ background: "#fff7ed", border: "1px solid #fed7aa" }}>
                  <p className="desktop-body-s" style={{ margin: 0 }}>
                    Your subscription is active but set to cancel at the end of the current period
                    {subPeriodEnd ? (
                      <> — <strong>{subPeriodEnd.toLocaleDateString()} {subPeriodEnd.toLocaleTimeString()}</strong></>
                    ) : null}
                    .
                  </p>
                </div>
              )}

              {/* Show trial banner ONLY if user is NOT subscribed */}
              {isTrialActive && !isSubscribed && (
                <div className="trial-banner">
                  <p className="desktop-body-s">
                    Your free trial ends on{" "}
                    <strong>{trialEndDate?.toLocaleDateString()}</strong>
                    {typeof trialDaysLeft === "number" ? (
                      <> — <strong>{trialDaysLeft} day{trialDaysLeft === 1 ? "" : "s"}</strong> left</>
                    ) : null}
                    .
                  </p>
                  <button className="blue-trial desktop-body-s" onClick={handleStartSubscription}>
                    Subscribe Now
                  </button>
                </div>
              )}

              {hasTrialEnded && !isSubscribed && (
                <div className="trial-ended-banner">
                  <p>
                    Your free trial has ended. <Link to="/subscription">Subscribe now</Link> to prevent your profile from being deleted.
                  </p>
                </div>
              )}

              <div className="myprofile-flex-container">
                {/* Preview column */}
                <div
                  className={`myprofile-content ${isMobile ? "myprofile-mock-phone-mobile-container" : ""}`}
                  style={columnScrollStyle}
                >
                  {isMobile ? (
                    <div
                      className={`mp-mobile-controls desktop-h6 ${previewOpen ? "is-open" : "is-collapsed"}`}
                      role="tablist"
                      aria-label="Preview controls"
                    >
                      {/* 2-up pill controls, 50% each, left aligned */}
                      <div
                        className="mp-pill"
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: 8,
                          width: "min(420px, 100%)",
                          justifyItems: "stretch",
                          width: "100%",
                        }}
                      >
                        <button
                          type="button"
                          role="tab"
                          aria-selected={previewOpen}
                          className={`mp-tab ${previewOpen ? "active" : ""}`}
                          onClick={() => setPreviewOpen((s) => !s)}
                          style={{ width: "100%" }}
                        >
                          {previewOpen ? "Hide Preview" : "Show Preview"}
                        </button>
                        <a
                          role="tab"
                          aria-selected={!previewOpen}
                          className={`mp-tab visit ${!previewOpen ? "active" : ""}`}
                          href={visitUrl}
                          target="_blank"
                          rel="noreferrer"
                          onClick={() => setPreviewOpen(false)}
                          style={{ width: "100%", textAlign: "center", justifyContent: "center" }}
                        >
                          Visit Page
                        </a>
                      </div>

                      <div
                        className="mp-preview-wrap"
                        ref={mpWrapRef}
                        style={{
                          maxHeight: previewOpen ? undefined : 0,
                          overflow: "hidden",
                          transition: "max-height .3s ease, opacity .3s ease, transform .3s ease",
                        }}
                      >
                        <div
                          className={`mock-phone mobile-preview ${isDarkMode ? "dark-mode" : ""}`}
                          style={{ fontFamily: state.font || previewPlaceholders.font }}
                        >
                          {/* allow inner scroll on mobile phone only */}
                          <div className="mock-phone-scrollable-content">
                            {/* MAIN */}
                            {showMainSection && (
                              <>
                                {(shouldShowPlaceholders || !!state.coverPhoto) && (
                                  <img src={previewCoverPhotoSrc} alt="Cover" className="mock-cover" />
                                )}
                                <h2 className="mock-title">
                                  {state.mainHeading ||
                                    (!hasSavedData ? previewPlaceholders.main_heading : "Your Main Heading Here")}
                                </h2>
                                <p className="mock-subtitle">
                                  {state.subHeading ||
                                    (!hasSavedData ? previewPlaceholders.sub_heading : "Your Tagline or Slogan Goes Here")}
                                </p>
                                {(shouldShowPlaceholders || hasExchangeContact) && (
                                  <button type="button" className="mock-button">
                                    Save My Number
                                  </button>
                                )}
                              </>
                            )}

                            {/* ABOUT */}
                            {showAboutMeSection &&
                              (previewFullName || previewJobTitle || previewBio || previewAvatarSrc) && (
                                <>
                                  <p className="mock-section-title">About me</p>
                                  <div className={`mock-about-container ${aboutMeLayout}`}>
                                    <div className="mock-about-content-group">
                                      <div className="mock-about-header-group">
                                        {previewAvatarSrc && (
                                          <img src={previewAvatarSrc} alt="Avatar" className="mock-avatar" />
                                        )}
                                        <div>
                                          <p className="mock-profile-name">{previewFullName}</p>
                                          <p className="mock-profile-role">{previewJobTitle}</p>
                                        </div>
                                      </div>
                                      <p className="mock-bio-text">{previewBio}</p>
                                    </div>
                                  </div>
                                </>
                              )}

                            {/* WORK */}
                            {showWorkSection && previewWorkImages.length > 0 && (
                              <>
                                <p className="mock-section-title">My Work</p>
                                <div className="work-preview-row-container">
                                  {state.workDisplayMode === "carousel" && (
                                    <div className="carousel-nav-buttons">
                                      <button
                                        type="button"
                                        className="carousel-nav-button left-arrow"
                                        onClick={() => scrollCarousel(previewWorkCarouselRef, "left")}
                                      >
                                        &#9664;
                                      </button>
                                      <button
                                        type="button"
                                        className="carousel-nav-button right-arrow"
                                        onClick={() => scrollCarousel(previewWorkCarouselRef, "right")}
                                      >
                                        &#9654;
                                      </button>
                                    </div>
                                  )}
                                  <div
                                    ref={previewWorkCarouselRef}
                                    className={`mock-work-gallery ${state.workDisplayMode}`}
                                  >
                                    {previewWorkImages.map((item, i) => (
                                      <div key={i} className="mock-work-image-item-wrapper">
                                        <img
                                          src={item.preview || item}
                                          alt={`work-${i}`}
                                          className="mock-work-image-item"
                                        />
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </>
                            )}

                            {/* SERVICES */}
                            {showServicesSection && (servicesForPreview.length > 0 || !hasSavedData) && (
                              <>
                                <p className="mock-section-title">My Services</p>
                                <div className="work-preview-row-container">
                                  {servicesDisplayMode === "carousel" && (
                                    <div className="carousel-nav-buttons">
                                      <button
                                        type="button"
                                        className="carousel-nav-button left-arrow"
                                        onClick={() => scrollCarousel(previewServicesCarouselRef, "left")}
                                      >
                                        &#9664;
                                      </button>
                                      <button
                                        type="button"
                                        className="carousel-nav-button right-arrow"
                                        onClick={() => scrollCarousel(previewServicesCarouselRef, "right")}
                                      >
                                        &#9654;
                                      </button>
                                    </div>
                                  )}
                                  <div
                                    ref={previewServicesCarouselRef}
                                    className={`mock-services-list ${servicesDisplayMode}`}
                                  >
                                    {servicesForPreview.map((s, i) => (
                                      <div key={i} className="mock-service-item">
                                        <p className="mock-service-name">{s.name}</p>
                                        <span className="mock-service-price">{s.price}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </>
                            )}

                            {/* REVIEWS */}
                            {showReviewsSection && (reviewsForPreview.length > 0 || !hasSavedData) && (
                              <>
                                <p className="mock-section-title">Reviews</p>
                                <div className="work-preview-row-container">
                                  {reviewsDisplayMode === "carousel" && (
                                    <div className="carousel-nav-buttons">
                                      <button
                                        type="button"
                                        className="carousel-nav-button left-arrow"
                                        onClick={() => scrollCarousel(previewReviewsCarouselRef, "left")}
                                      >
                                        &#9664;
                                      </button>
                                      <button
                                        type="button"
                                        className="carousel-nav-button right-arrow"
                                        onClick={() => scrollCarousel(previewReviewsCarouselRef, "right")}
                                      >
                                        &#9654;
                                      </button>
                                    </div>
                                  )}
                                  <div
                                    ref={previewReviewsCarouselRef}
                                    className={`mock-reviews-list ${reviewsDisplayMode}`}
                                  >
                                    {reviewsForPreview.map((r, i) => (
                                      <div key={i} className="mock-review-card">
                                        <div className="mock-star-rating">
                                          {Array(r.rating || 0)
                                            .fill()
                                            .map((_, idx) => (
                                              <span key={`f-${idx}`}>★</span>
                                            ))}
                                          {Array(Math.max(0, 5 - (r.rating || 0)))
                                            .fill()
                                            .map((_, idx) => (
                                              <span key={`e-${idx}`} className="empty-star">
                                                ★
                                              </span>
                                            ))}
                                        </div>
                                        <p className="mock-review-text">{`"${r.text}"`}</p>
                                        <p className="mock-reviewer-name">{r.name}</p>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </>
                            )}

                            {/* CONTACT */}
                            {showContactSection && (previewEmail || previewPhone) && (
                              <>
                                <p className="mock-section-title">Contact Details</p>
                                <div className="mock-contact-details">
                                  <div className="mock-contact-item">
                                    <p className="mock-contact-label">Email:</p>
                                    <p className="mock-contact-value">{previewEmail}</p>
                                  </div>
                                  <div className="mock-contact-item">
                                    <p className="mock-contact-label">Phone:</p>
                                    <p className="mock-contact-value">{previewPhone}</p>
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Desktop phone preview — column scroll only
                    <div
                      className={`mock-phone ${isDarkMode ? "dark-mode" : ""}`}
                      style={{ fontFamily: state.font || previewPlaceholders.font }}
                    >
                      <div className="mock-phone-scrollable-content desktop-no-inner-scroll">
                        {/* MAIN */}
                        {showMainSection && (
                          <>
                            {(shouldShowPlaceholders || !!state.coverPhoto) && (
                              <img src={previewCoverPhotoSrc} alt="Cover" className="mock-cover" />
                            )}
                            <h2 className="mock-title">
                              {state.mainHeading ||
                                (!hasSavedData ? previewPlaceholders.main_heading : "Your Main Heading Here")}
                            </h2>
                            <p className="mock-subtitle">
                              {state.subHeading ||
                                (!hasSavedData ? previewPlaceholders.sub_heading : "Your Tagline or Slogan Goes Here")}
                            </p>
                            {(shouldShowPlaceholders || hasExchangeContact) && (
                              <button type="button" className="mock-button">
                                Save My Number
                              </button>
                            )}
                          </>
                        )}

                        {/* ABOUT */}
                        {showAboutMeSection &&
                          (previewFullName || previewJobTitle || previewBio || previewAvatarSrc) && (
                            <>
                              <p className="mock-section-title">About me</p>
                              <div className={`mock-about-container ${aboutMeLayout}`}>
                                <div className="mock-about-content-group">
                                  <div className="mock-about-header-group">
                                    {previewAvatarSrc && (
                                      <img src={previewAvatarSrc} alt="Avatar" className="mock-avatar" />
                                    )}
                                    <div>
                                      <p className="mock-profile-name">{previewFullName}</p>
                                      <p className="mock-profile-role">{previewJobTitle}</p>
                                    </div>
                                  </div>
                                  <p className="mock-bio-text">{previewBio}</p>
                                </div>
                              </div>
                            </>
                          )}

                        {/* WORK */}
                        {showWorkSection && previewWorkImages.length > 0 && (
                          <>
                            <p className="mock-section-title">My Work</p>
                            <div className="work-preview-row-container">
                              {state.workDisplayMode === "carousel" && (
                                <div className="carousel-nav-buttons">
                                  <button
                                    type="button"
                                    className="carousel-nav-button left-arrow"
                                    onClick={() => scrollCarousel(previewWorkCarouselRef, "left")}
                                  >
                                    &#9664;
                                  </button>
                                  <button
                                    type="button"
                                    className="carousel-nav-button right-arrow"
                                    onClick={() => scrollCarousel(previewWorkCarouselRef, "right")}
                                  >
                                    &#9654;
                                  </button>
                                </div>
                              )}
                              <div ref={previewWorkCarouselRef} className={`mock-work-gallery ${state.workDisplayMode}`}>
                                {previewWorkImages.map((item, i) => (
                                  <div key={i} className="mock-work-image-item-wrapper">
                                    <img src={item.preview || item} alt={`work-${i}`} className="mock-work-image-item" />
                                  </div>
                                ))}
                              </div>
                            </div>
                          </>
                        )}

                        {/* SERVICES */}
                        {showServicesSection && (servicesForPreview.length > 0 || !hasSavedData) && (
                          <>
                            <p className="mock-section-title">My Services</p>
                            <div className="work-preview-row-container">
                              {servicesDisplayMode === "carousel" && (
                                <div className="carousel-nav-buttons">
                                  <button
                                    type="button"
                                    className="carousel-nav-button left-arrow"
                                    onClick={() => scrollCarousel(previewServicesCarouselRef, "left")}
                                  >
                                    &#9664;
                                  </button>
                                  <button
                                    type="button"
                                    className="carousel-nav-button right-arrow"
                                    onClick={() => scrollCarousel(previewServicesCarouselRef, "right")}
                                  >
                                    &#9654;
                                  </button>
                                </div>
                              )}
                              <div
                                ref={previewServicesCarouselRef}
                                className={`mock-services-list ${servicesDisplayMode}`}
                              >
                                {servicesForPreview.map((s, i) => (
                                  <div key={i} className="mock-service-item">
                                    <p className="mock-service-name">{s.name}</p>
                                    <span className="mock-service-price">{s.price}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </>
                        )}

                        {/* REVIEWS */}
                        {showReviewsSection && (reviewsForPreview.length > 0 || !hasSavedData) && (
                          <>
                            <p className="mock-section-title">Reviews</p>
                            <div className="work-preview-row-container">
                              {reviewsDisplayMode === "carousel" && (
                                <div className="carousel-nav-buttons">
                                  <button
                                    type="button"
                                    className="carousel-nav-button left-arrow"
                                    onClick={() => scrollCarousel(previewReviewsCarouselRef, "left")}
                                  >
                                    &#9664;
                                  </button>
                                  <button
                                    type="button"
                                    className="carousel-nav-button right-arrow"
                                    onClick={() => scrollCarousel(previewReviewsCarouselRef, "right")}
                                  >
                                    &#9654;
                                  </button>
                                </div>
                              )}
                              <div ref={previewReviewsCarouselRef} className={`mock-reviews-list ${reviewsDisplayMode}`}>
                                {reviewsForPreview.map((r, i) => (
                                  <div key={i} className="mock-review-card">
                                    <div className="mock-star-rating">
                                      {Array(r.rating || 0)
                                        .fill()
                                        .map((_, idx) => (
                                          <span key={`f-${idx}`}>★</span>
                                        ))}
                                      {Array(Math.max(0, 5 - (r.rating || 0)))
                                        .fill()
                                        .map((_, idx) => (
                                          <span key={`e-${idx}`} className="empty-star">
                                            ★
                                          </span>
                                        ))}
                                    </div>
                                    <p className="mock-review-text">{`"${r.text}"`}</p>
                                    <p className="mock-reviewer-name">{r.name}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </>
                        )}

                        {/* CONTACT */}
                        {showContactSection && (previewEmail || previewPhone) && (
                          <>
                            <p className="mock-section-title">Contact Details</p>
                            <div style={{ marginBottom: 20 }} className="mock-contact-details">
                              <div className="mock-contact-item">
                                <p className="mock-contact-label">Email:</p>
                                <p className="mock-contact-value">{previewEmail}</p>
                              </div>
                              <div className="mock-contact-item">
                                <p className="mock-contact-label">Phone:</p>
                                <p className="mock-contact-value">{previewPhone}</p>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Editor column */}
                <div className="myprofile-editor-wrapper" id="myprofile-editor" style={columnScrollStyle}>
                  {!isSubscribed && hasTrialEnded && (
                    <div className="subscription-overlay">
                      <div className="subscription-message">
                        <p className="desktop-h4">Subscription Required</p>
                        <p className="desktop-h6">
                          Your free trial has ended. Please subscribe to continue editing your profile.
                        </p>
                        <button className="blue-button" onClick={handleStartSubscription}>
                          Go to Subscription
                        </button>
                      </div>
                    </div>
                  )}

                  <form
                    onSubmit={handleSubmit}
                    className="myprofile-editor"
                    style={{
                      filter: !isSubscribed && hasTrialEnded ? "blur(5px)" : "none",
                      pointerEvents: !isSubscribed && hasTrialEnded ? "none" : "auto",
                    }}
                  >
                    <h2 className="editor-title">Edit Your Digital Business Card</h2>

                    {/* Theme */}
                    <div className="input-block">
                      <label>Page Theme</label>
                      <div className="option-row fit">
                        <button
                          type="button"
                          className={`theme-button ${state.pageTheme === "light" ? "is-active" : ""}`}
                          onClick={() => updateState({ pageTheme: "light" })}
                        >
                          Light Mode
                        </button>
                        <button
                          type="button"
                          className={`theme-button ${state.pageTheme === "dark" ? "is-active" : ""}`}
                          onClick={() => updateState({ pageTheme: "dark" })}
                        >
                          Dark Mode
                        </button>
                      </div>
                    </div>

                    {/* Fonts */}
                    <div className="input-block">
                      <label>Font</label>
                      <div className="option-row fit">
                        {["Inter", "Montserrat", "Poppins"].map((font) => (
                          <button
                            type="button"
                            key={font}
                            className={`font-button ${state.font === font ? "is-active" : ""}`}
                            onClick={() => updateState({ font })}
                            style={{
                              fontFamily:
                                `'${font}', system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif`,
                              fontWeight: 700,
                            }}
                          >
                            {font}
                          </button>
                        ))}
                      </div>
                    </div>

                    <hr className="divider" />
                    <div className="editor-section-header stacked">
                      <h3 className="editor-subtitle">Main Section</h3>
                      <button
                        type="button"
                        onClick={() => setShowMainSection(!showMainSection)}
                        className="toggle-button section-chip"
                      >
                        {showMainSection ? "Hide Section" : "Show Section"}
                      </button>
                    </div>
                    {showMainSection && (
                      <>
                        <div className="input-block">
                          <label htmlFor="coverPhoto">Cover Photo</label>
                          <input
                            ref={fileInputRef}
                            id="coverPhoto"
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            style={{ display: "none" }}
                          />
                          <div
                            className="editor-item-card work-image-item-wrapper cover-photo-card"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            {state.coverPhoto ? (
                              <img
                                src={state.coverPhoto || previewPlaceholders.coverPhoto}
                                alt="Cover"
                                className="work-image-preview"
                              />
                            ) : (
                              <span className="upload-text">+ Upload Cover Image</span>
                            )}
                            {state.coverPhoto && (
                              <button
                                type="button"
                                className="remove-image-button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveCoverPhoto();
                                }}
                              >
                                &times;
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="input-block tight">
                          <label htmlFor="mainHeading">Main Heading</label>
                          <input
                            id="mainHeading"
                            type="text"
                            className="text-input"
                            value={state.mainHeading || ""}
                            onChange={(e) => updateState({ mainHeading: e.target.value })}
                            placeholder={previewPlaceholders.main_heading}
                          />
                        </div>

                        <div className="input-block tight">
                          <label htmlFor="subHeading">Subheading</label>
                          <input
                            id="subHeading"
                            type="text"
                            className="text-input"
                            value={state.subHeading || ""}
                            onChange={(e) => updateState({ subHeading: e.target.value })}
                            placeholder={previewPlaceholders.sub_heading}
                          />
                        </div>
                      </>
                    )}

                    <hr className="divider" />
                    <div className="editor-section-header stacked">
                      <h3 className="editor-subtitle">About Me Section</h3>
                      <button
                        type="button"
                        onClick={() => setShowAboutMeSection(!showAboutMeSection)}
                        className="toggle-button section-chip"
                      >
                        {showAboutMeSection ? "Hide Section" : "Show Section"}
                      </button>
                    </div>
                    {showAboutMeSection && (
                      <>
                        <div className="input-block">
                          <label>Display Layout</label>
                          <div className="option-row fit">
                            <button
                              type="button"
                              className={`display-button ${aboutMeLayout === "side-by-side" ? "is-active" : ""}`}
                              onClick={() => setAboutMeLayout("side-by-side")}
                            >
                              Side by Side
                            </button>
                            <button
                              type="button"
                              className={`display-button ${aboutMeLayout === "stacked" ? "is-active" : ""}`}
                              onClick={() => setAboutMeLayout("stacked")}
                            >
                              Stacked
                            </button>
                          </div>
                        </div>

                        <div className="input-block">
                          <label htmlFor="avatar">Profile Photo</label>
                          <input
                            ref={avatarInputRef}
                            id="avatar"
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarUpload}
                            style={{ display: "none" }}
                          />
                          {/* Avatar tile identical to work image tile */}
                          <div
                            className="editor-item-card work-image-item-wrapper avatar-tile"
                            onClick={() => avatarInputRef.current?.click()}
                          >
                            {state.avatar ? (
                              <img src={state.avatar || ""} alt="Avatar preview" className="work-image-preview" />
                            ) : (
                              <span className="upload-text">+ Add a Profile Picture/Logo</span>
                            )}
                            {state.avatar && (
                              <button
                                type="button"
                                className="remove-image-button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveAvatar();
                                }}
                              >
                                &times;
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="input-block tight">
                          <label htmlFor="fullName">Full Name</label>
                          <input
                            id="fullName"
                            type="text"
                            className="text-input"
                            value={state.full_name || ""}
                            onChange={(e) => updateState({ full_name: e.target.value })}
                            placeholder={previewPlaceholders.full_name}
                          />
                        </div>

                        <div className="input-block tight">
                          <label htmlFor="jobTitle">Job Title</label>
                          <input
                            id="jobTitle"
                            type="text"
                            className="text-input"
                            value={state.job_title || ""}
                            onChange={(e) => updateState({ job_title: e.target.value })}
                            placeholder={previewPlaceholders.job_title}
                          />
                        </div>

                        <div className="input-block tight">
                          <label htmlFor="bio">About Me Description</label>
                          <textarea
                            id="bio"
                            rows={4}
                            className="text-input"
                            value={state.bio || ""}
                            onChange={(e) => updateState({ bio: e.target.value })}
                            placeholder={previewPlaceholders.bio}
                          />
                        </div>
                      </>
                    )}

                    <hr className="divider" />
                    <div className="editor-section-header stacked">
                      <h3 className="editor-subtitle">My Work Section</h3>
                      <button
                        type="button"
                        onClick={() => setShowWorkSection(!showWorkSection)}
                        className="toggle-button section-chip"
                      >
                        {showWorkSection ? "Hide Section" : "Show Section"}
                      </button>
                    </div>
                    {showWorkSection && (
                      <>
                        <div className="input-block">
                          <label>Display Layout</label>
                          <div className="option-row fit">
                            <button
                              type="button"
                              className={`display-button ${state.workDisplayMode === "list" ? "is-active" : ""}`}
                              onClick={() => updateState({ workDisplayMode: "list" })}
                            >
                              List
                            </button>
                            <button
                              type="button"
                              className={`display-button ${state.workDisplayMode === "grid" ? "is-active" : ""}`}
                              onClick={() => updateState({ workDisplayMode: "grid" })}
                            >
                              Grid
                            </button>
                            <button
                              type="button"
                              className={`display-button ${state.workDisplayMode === "carousel" ? "is-active" : ""}`}
                              onClick={() => updateState({ workDisplayMode: "carousel" })}
                            >
                              Carousel
                            </button>
                          </div>
                        </div>

                        <div className="input-block">
                          <label>Work Images</label>
                          <div className="editor-work-image-grid">
                            {state.workImages.map((item, i) => (
                              <div key={i} className="editor-item-card work-image-item-wrapper">
                                <img src={item.preview || item} alt={`work-${i}`} className="work-image-preview" />
                                <button
                                  type="button"
                                  className="remove-image-button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemoveWorkImage(i);
                                  }}
                                >
                                  &times;
                                </button>
                              </div>
                            ))}
                            {state.workImages.length < 10 && (
                              <div
                                className="add-work-image-placeholder"
                                onClick={() => workImageInputRef.current?.click()}
                              >
                                <span className="upload-text">+ Add image(s)</span>
                              </div>
                            )}
                          </div>
                          <input
                            ref={workImageInputRef}
                            type="file"
                            multiple
                            accept="image/*"
                            style={{ display: "none" }}
                            onChange={handleAddWorkImage}
                          />
                        </div>
                      </>
                    )}

                    <hr className="divider" />
                    <div className="editor-section-header stacked">
                      <h3 className="editor-subtitle">My Services Section</h3>
                      <button
                        type="button"
                        onClick={() => setShowServicesSection(!showServicesSection)}
                        className="toggle-button section-chip"
                      >
                        {showServicesSection ? "Hide Section" : "Show Section"}
                      </button>
                    </div>
                    {showServicesSection && (
                      <>
                        <div className="input-block">
                          <label>Display Layout</label>
                          <div className="option-row fit">
                            <button
                              type="button"
                              className={`display-button ${servicesDisplayMode === "list" ? "is-active" : ""}`}
                              onClick={() => setServicesDisplayMode("list")}
                            >
                              List
                            </button>
                            <button
                              type="button"
                              className={`display-button ${servicesDisplayMode === "carousel" ? "is-active" : ""}`}
                              onClick={() => setServicesDisplayMode("carousel")}
                            >
                              Carousel
                            </button>
                          </div>
                        </div>

                        <div className="input-block">
                          <label>Services</label>
                          <div className="editor-service-list">
                            {state.services.map((s, i) => (
                              <div
                                key={i}
                                className="editor-item-card mock-service-item-wrapper"
                                style={{
                                  display: "grid",
                                  gridTemplateColumns: "1fr 1fr auto",
                                  gap: 8,
                                  alignItems: "center",
                                }}
                              >
                                <input
                                  type="text"
                                  className="text-input"
                                  placeholder="Service Name"
                                  value={s.name || ""}
                                  onChange={(e) => handleServiceChange(i, "name", e.target.value)}
                                />
                                <input
                                  type="text"
                                  className="text-input"
                                  placeholder="Service Price/Detail"
                                  value={s.price || ""}
                                  onChange={(e) => handleServiceChange(i, "price", e.target.value)}
                                />
                                <button
                                  type="button"
                                  onClick={() => handleRemoveService(i)}
                                  className="remove-item-button"
                                >
                                  Remove
                                </button>
                              </div>
                            ))}
                          </div>
                          <button type="button" onClick={handleAddService} className="add-item-button">
                            + Add Service
                          </button>
                        </div>
                      </>
                    )}

                    <hr className="divider" />
                    <div className="editor-section-header stacked">
                      <h3 className="editor-subtitle">Reviews Section</h3>
                      <button
                        type="button"
                        onClick={() => setShowReviewsSection(!showReviewsSection)}
                        className="toggle-button section-chip"
                      >
                        {showReviewsSection ? "Hide Section" : "Show Section"}
                      </button>
                    </div>
                    {showReviewsSection && (
                      <>
                        <div className="input-block">
                          <label>Display Layout</label>
                          <div className="option-row fit">
                            <button
                              type="button"
                              className={`display-button ${reviewsDisplayMode === "list" ? "is-active" : ""}`}
                              onClick={() => setReviewsDisplayMode("list")}
                            >
                              List
                            </button>
                            <button
                              type="button"
                              className={`display-button ${reviewsDisplayMode === "carousel" ? "is-active" : ""}`}
                              onClick={() => setReviewsDisplayMode("carousel")}
                            >
                              Carousel
                            </button>
                          </div>
                        </div>

                        <div className="input-block">
                          <label>Reviews</label>
                          <div className="editor-reviews-list" style={{ display: "grid", gap: 8 }}>
                            {state.reviews.map((r, i) => (
                              <div
                                key={i}
                                className="editor-item-card mock-review-card-wrapper"
                                style={{
                                  display: "grid",
                                  gridTemplateColumns: "1fr 1fr 110px auto",
                                  gap: 8,
                                  alignItems: "center",
                                }}
                              >
                                <input
                                  type="text"
                                  className="text-input"
                                  placeholder="Reviewer Name"
                                  value={r.name || ""}
                                  onChange={(e) => handleReviewChange(i, "name", e.target.value)}
                                />
                                <textarea
                                  className="text-input"
                                  placeholder="Review text"
                                  rows={2}
                                  value={r.text || ""}
                                  onChange={(e) => handleReviewChange(i, "text", e.target.value)}
                                />
                                <input
                                  type="number"
                                  className="text-input"
                                  placeholder="Rating (1-5)"
                                  min="1"
                                  max="5"
                                  value={r.rating || ""}
                                  onChange={(e) => handleReviewChange(i, "rating", e.target.value)}
                                />
                                <button
                                  type="button"
                                  onClick={() => handleRemoveReview(i)}
                                  className="remove-item-button"
                                >
                                  Remove
                                </button>
                              </div>
                            ))}
                          </div>
                          <button type="button" onClick={handleAddReview} className="add-item-button">
                            + Add Review
                          </button>
                        </div>
                      </>
                    )}

                    <hr className="divider" />
                    <div className="editor-section-header stacked">
                      <h3 className="editor-subtitle">My Contact Details</h3>
                      <button
                        type="button"
                        onClick={() => setShowContactSection(!showContactSection)}
                        className="toggle-button section-chip"
                      >
                        {showContactSection ? "Hide Section" : "Show Section"}
                      </button>
                    </div>
                    {showContactSection && (
                      <>
                        <div className="input-block tight">
                          <label htmlFor="contactEmail">Email Address</label>
                          <input
                            id="contactEmail"
                            type="email"
                            className="text-input"
                            value={state.contact_email || ""}
                            onChange={(e) => updateState({ contact_email: e.target.value })}
                            placeholder={previewPlaceholders.contact_email}
                          />
                        </div>

                        <div className="input-block tight">
                          <label htmlFor="phoneNumber">Phone Number</label>
                          <input
                            id="phoneNumber"
                            type="tel"
                            className="text-input"
                            value={state.phone_number || ""}
                            onChange={(e) => updateState({ phone_number: e.target.value })}
                            placeholder={previewPlaceholders.phone_number}
                          />
                        </div>
                      </>
                    )}

                    <div className="button-group">
                      <button
                        type="button"
                        onClick={handleResetPage}
                        className="cta-black-button desktop-button"
                      >
                        Reset Page
                      </button>
                      <button type="submit" className="cta-blue-button desktop-button">
                        Publish Now
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      <ShareProfile
        isOpen={showShareModal}
        onClose={handleCloseShareModal}
        profileUrl={userUsername ? `https://www.konarcard.com/u/${userUsername}` : ""}
        qrCodeUrl={businessCard?.qrCodeUrl || ""}
        contactDetails={{
          full_name: businessCard?.full_name || "",
          job_title: businessCard?.job_title || "",
          business_card_name: businessCard?.business_card_name || "",
          bio: businessCard?.bio || "",
          isSubscribed: businessCard?.isSubscribed || false,
          contact_email: businessCard?.contact_email || "",
          phone_number: businessCard?.phone_number || "",
          username: userUsername || "",
        }}
        username={userUsername || ""}
      />
    </div>
  );
}
