// src/pages/MyProfile/MyProfile.jsx  — FULL FILE PART 1/2
import React, { useEffect, useState, useContext, useMemo, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import PageHeader from "../../components/PageHeader";
import useBusinessCardStore from "../../store/businessCardStore";
import { useQueryClient } from "@tanstack/react-query";
import { useFetchBusinessCard } from "../../hooks/useFetchBusinessCard";
import { useCreateBusinessCard, buildBusinessCardFormData } from "../../hooks/useCreateBiz";
import axios from "axios";
import { toast } from "react-hot-toast";
import ShareProfile from "../../components/ShareProfile";
import { AuthContext } from "../../components/AuthContext";
import api, { startTrial } from "../../services/api";
import LogoIcon from "../../assets/icons/Logo-Icon.svg";

// NEW: extracted components
import Preview from "../../components/Preview";
import Editor from "../../components/Editor";

export default function MyProfile() {
  const { state, updateState, resetState } = useBusinessCardStore();
  const createBusinessCard = useCreateBusinessCard();
  const queryClient = useQueryClient();
  const location = useLocation();

  const { user: authUser, loading: authLoading, fetchUser: refetchAuthUser } = useContext(AuthContext);

  const userId = authUser?._id;
  const userEmail = authUser?.email;
  const isSubscribed = !!authUser?.isSubscribed; // ← single source of truth
  const isUserVerified = !!authUser?.isVerified;
  const userUsername = authUser?.username;

  const { data: businessCard, isLoading: isCardLoading } = useFetchBusinessCard(userId);

  // Refs
  const activeBlobUrlsRef = useRef([]);
  const handledPaymentRef = useRef(false);

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

  // ---- Trial helpers (derived strictly from authUser; never poll here)
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

  // Only show a trial if NOT subscribed
  const isTrialActive = !!(!isSubscribed && trialEndDate && trialEndDate.getTime() > Date.now());
  const hasTrialEnded = !!(!isSubscribed && trialEndDate && trialEndDate.getTime() <= Date.now());

  const hasSavedData = !!businessCard;
  const hasExchangeContact =
    (state.contact_email && state.contact_email.trim()) || (state.phone_number && state.phone_number.trim());

  // ============== EFFECTS (minimal; no loops) ==============

  // 1) Handle a one-time return from Stripe, then clear the URL and refresh auth.
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const sessionId = params.get("session_id");
    const paymentSuccess = params.get("payment_success");

    if ((sessionId || paymentSuccess === "true") && !handledPaymentRef.current) {
      handledPaymentRef.current = true;
      (async () => {
        try {
          await api.post("/me/sync-subscriptions", { ts: Date.now() }); // backend pulls latest from Stripe
        } catch { /* swallow */ }
        try {
          await refetchAuthUser?.(); // refresh isSubscribed / trialExpires
        } catch { /* swallow */ }
        toast.success("Subscription updated successfully!");
        window.history.replaceState({}, document.title, location.pathname); // prevent re-trigger
      })();
    }
  }, [location.search, location.pathname, refetchAuthUser]);

  // 2) Media query + body scroll management
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

  // 3) Verification code cooldown + prompt visibility
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  useEffect(() => {
    if (!authLoading && authUser && !isUserVerified && userEmail) setShowVerificationPrompt(true);
    else if (!authLoading && isUserVerified) setShowVerificationPrompt(false);
  }, [authLoading, authUser, isUserVerified, userEmail]);

  // 4) Optional scroll-to-editor on load (mobile convenience)
  useEffect(() => {
    const wantScroll = localStorage.getItem("scrollToEditorOnLoad") === "1";
    if (!wantScroll) return;
    if (window.innerWidth <= 1000) {
      let tries = 0;
      const tick = () => {
        const el = document.getElementById("myprofile-editor") || document.querySelector(".myprofile-editor-anchor");
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
          try { localStorage.removeItem("scrollToEditorOnLoad"); } catch { }
        } else if (tries < 20) {
          tries += 1;
          setTimeout(tick, 150);
        } else {
          try { localStorage.removeItem("scrollToEditorOnLoad"); } catch { }
        }
      };
      tick();
    } else {
      try { localStorage.removeItem("scrollToEditorOnLoad"); } catch { }
    }
  }, []);

  // 5) Hydrate editor when card loads
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

  // 6) Cleanup
  useEffect(() => {
    return () => {
      activeBlobUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);
  // src/pages/MyProfile/MyProfile.jsx  — FULL FILE PART 2/2

  // ================= HANDLERS & HELPERS =================

  const createAndTrackBlobUrl = (file) => {
    const url = URL.createObjectURL(file);
    activeBlobUrlsRef.current.push(url);
    return url;
  };

  // New: file handlers adapted for <Editor />
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

  // Only attempt to start a trial when saving if not subscribed and not already in trial
  const ensureTrialIfNeeded = async () => {
    if (isSubscribed || isTrialActive) return;
    try {
      const res = await startTrial();
      if (res?.data?.trialExpires) toast.success("Your 14-day trial started!");
      else toast.success("Trial activated!");
      await refetchAuthUser?.();
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

  // ================= RENDER =================

  const visitUrl = userUsername ? `https://www.konarcard.com/u/${userUsername}` : "#";

  const columnScrollStyle = !isMobile
    ? { maxHeight: "calc(100vh - 140px)", overflow: "auto" }
    : undefined;

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
        <PageHeader
          isMobile={isMobile}
          isSmallMobile={isSmallMobile}
          onShareCard={handleShareCard}
          visitUrl={visitUrl}
        />

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

              {/* SUBSCRIPTION / TRIAL BANNERS */}
              {!isSubscribed && isTrialActive && (
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

              {!isSubscribed && hasTrialEnded && (
                <div className="trial-ended-banner">
                  <p>
                    Your free trial has ended. <Link to="/subscription">Subscribe now</Link> to prevent your profile from being deleted.
                  </p>
                </div>
              )}

              <div className="myprofile-flex-container">
                {/* Preview column */}
                <div style={columnScrollStyle}>
                  <Preview
                    state={state}
                    isMobile={isMobile}
                    hasSavedData={hasSavedData}
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
                  />
                </div>

                {/* Editor column */}
                <Editor
                  state={state}
                  updateState={updateState}
                  isSubscribed={isSubscribed}
                  hasTrialEnded={hasTrialEnded}
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
