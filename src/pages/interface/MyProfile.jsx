import React, { useRef, useEffect, useState, useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import PageHeader from "../../components/PageHeader";
import ShareProfile from "../../components/ShareProfile";
import useBusinessCardStore, { previewPlaceholders } from "../../store/businessCardStore";
import { useQueryClient } from "@tanstack/react-query";
import { useFetchBusinessCard } from "../../hooks/useFetchBusinessCard";
import { useCreateBusinessCard, buildBusinessCardFormData } from "../../hooks/useCreateBiz";
import api, { startTrial } from "../../services/api";
import { toast } from "react-hot-toast";
import { AuthContext } from "../../components/AuthContext";
import LogoIcon from "../../assets/icons/Logo-Icon.svg";

export default function MyProfile() {
  const { state, updateState, resetState } = useBusinessCardStore();
  const createBusinessCard = useCreateBusinessCard();
  const queryClient = useQueryClient();
  const location = useLocation();
  const { user: authUser, fetchUser } = useContext(AuthContext);

  const userId = authUser?._id;
  const userEmail = authUser?.email;
  const userUsername = authUser?.username || "";
  const isSubscribed = !!authUser?.isSubscribed;
  const isVerified = !!authUser?.isVerified;

  const { data: businessCard } = useFetchBusinessCard(userId);

  /* Local State */
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1000);
  const [isSmallMobile, setIsSmallMobile] = useState(window.innerWidth <= 600);
  const [showShareModal, setShowShareModal] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(true);

  const [showVerificationPrompt, setShowVerificationPrompt] = useState(false);
  const [verificationCodeInput, setVerificationCodeInput] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  const [coverPhotoFile, setCoverPhotoFile] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [workImageFiles, setWorkImageFiles] = useState([]);
  const [coverPhotoRemoved, setCoverPhotoRemoved] = useState(false);
  const [isAvatarRemoved, setIsAvatarRemoved] = useState(false);

  /* Section toggles */
  const [showMainSection, setShowMainSection] = useState(true);
  const [showAboutMeSection, setShowAboutMeSection] = useState(true);
  const [showWorkSection, setShowWorkSection] = useState(true);
  const [showServicesSection, setShowServicesSection] = useState(true);
  const [showReviewsSection, setShowReviewsSection] = useState(true);
  const [showContactSection, setShowContactSection] = useState(true);

  const [servicesDisplayMode, setServicesDisplayMode] = useState("list");
  const [reviewsDisplayMode, setReviewsDisplayMode] = useState("list");
  const [aboutMeLayout, setAboutMeLayout] = useState("side-by-side");

  /* Refs */
  const fileInputRef = useRef(null);
  const avatarInputRef = useRef(null);
  const workImageInputRef = useRef(null);
  const previewWorkCarouselRef = useRef(null);
  const previewServicesCarouselRef = useRef(null);
  const previewReviewsCarouselRef = useRef(null);
  const activeBlobUrlsRef = useRef([]);

  /* Trial */
  const isTrialActive =
    !!(authUser && authUser.trialExpires && new Date(authUser.trialExpires) > new Date());
  const hasTrialEnded =
    !!(authUser && authUser.trialExpires && new Date(authUser.trialExpires) <= new Date());

  /* Effects */
  useEffect(() => {
    const onResize = () => {
      const m = window.innerWidth <= 1000;
      const sm = window.innerWidth <= 600;
      setIsMobile(m);
      setIsSmallMobile(sm);

      // Fix condition: close sidebar if window grows above desktop breakpoint
      if (window.innerWidth > 1000 && sidebarOpen) setSidebarOpen(false);
    };

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [sidebarOpen]);


  useEffect(() => {
    if (sidebarOpen && isMobile) document.body.classList.add("body-no-scroll");
    else document.body.classList.remove("body-no-scroll");
  }, [sidebarOpen, isMobile]);


  useEffect(() => {
    if (!authUser) return;
    setShowVerificationPrompt(!isVerified && !!userEmail);
  }, [authUser, isVerified, userEmail]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  useEffect(() => {
    if (!businessCard) return;
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
  }, [businessCard, updateState]);

  useEffect(() => {
    return () => {
      activeBlobUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  /* Preview Computed */
  const hasSavedData = !!businessCard;
  const shouldShowPlaceholders = !hasSavedData;
  const previewFullName =
    state.full_name || (shouldShowPlaceholders ? previewPlaceholders.full_name : "");
  const previewJobTitle =
    state.job_title || (shouldShowPlaceholders ? previewPlaceholders.job_title : "");
  const previewBio = state.bio || (shouldShowPlaceholders ? previewPlaceholders.bio : "");
  const previewEmail =
    state.contact_email || (shouldShowPlaceholders ? previewPlaceholders.contact_email : "");
  const previewPhone =
    state.phone_number || (shouldShowPlaceholders ? previewPlaceholders.phone_number : "");
  const previewCoverPhotoSrc = state.coverPhoto ?? (shouldShowPlaceholders ? previewPlaceholders.coverPhoto : "");
  const previewAvatarSrc = state.avatar ?? (shouldShowPlaceholders ? previewPlaceholders.avatar : null);
  const previewWorkImages =
    state.workImages && state.workImages.length > 0
      ? state.workImages
      : shouldShowPlaceholders
        ? previewPlaceholders.workImages
        : [];
  const servicesForPreview =
    state.services && state.services.length > 0
      ? state.services
      : shouldShowPlaceholders
        ? previewPlaceholders.services
        : [];
  const reviewsForPreview =
    state.reviews && state.reviews.length > 0
      ? state.reviews
      : shouldShowPlaceholders
        ? previewPlaceholders.reviews
        : [];
  const hasExchangeContact =
    (state.contact_email && state.contact_email.trim()) ||
    (state.phone_number && state.phone_number.trim());
  const isDarkMode = state.pageTheme === "dark";
  const visitUrl = userUsername ? `https://www.konarcard.com/u/${userUsername}` : "#";
  /* =========================
     HELPERS / ACTIONS
     ========================= */
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
    updateState({ workImages: [...(state.workImages || []), ...previewItems] });
    setWorkImageFiles((prev) => [...prev, ...files]);
  };

  const handleRemoveWorkImage = (idx) => {
    const item = state.workImages?.[idx];
    if (item?.preview?.startsWith("blob:")) URL.revokeObjectURL(item.preview);
    updateState({ workImages: state.workImages.filter((_, i) => i !== idx) });
  };

  const handleAddService = () =>
    updateState({ services: [...(state.services || []), { name: "", price: "" }] });

  const handleServiceChange = (i, field, value) => {
    const arr = [...state.services];
    arr[i] = { ...arr[i], [field]: value };
    updateState({ services: arr });
  };

  const handleRemoveService = (i) =>
    updateState({ services: state.services.filter((_, x) => x !== i) });

  const handleAddReview = () =>
    updateState({ reviews: [...(state.reviews || []), { name: "", text: "", rating: 5 }] });

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

  const handleRemoveReview = (i) =>
    updateState({ reviews: state.reviews.filter((_, x) => x !== i) });

  const scrollCarousel = (ref, dir) => {
    const el = ref.current;
    if (!el) return;
    const w = el.offsetWidth;
    const max = el.scrollWidth - w;
    let next = dir === "left" ? el.scrollLeft - w : el.scrollLeft + w;
    if (next < 0) next = max;
    if (next >= max) next = 0;
    el.scrollTo({ left: next, behavior: "smooth" });
  };

  const sendVerificationCode = async () => {
    if (!userEmail) return toast.error("Email not found. Please log in again.");
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/resend-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail }),
      });
      const data = await res.json();
      if (data?.error) toast.error(data.error);
      else {
        toast.success("Verification code sent!");
        setResendCooldown(30);
      }
    } catch {
      toast.error("Could not resend code.");
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    if (!userEmail) return toast.error("Email not found. Cannot verify.");
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/verify-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail, code: verificationCodeInput }),
      });
      const data = await res.json();
      if (data?.error) toast.error(data.error);
      else {
        toast.success("Email verified successfully!");
        setShowVerificationPrompt(false);
        setVerificationCodeInput("");
        if (typeof fetchUser === "function") await fetchUser();
      }
    } catch {
      toast.error("Verification failed.");
    }
  };

  const ensureTrialIfNeeded = async () => {
    if (isSubscribed || isTrialActive) return;
    try {
      const res = await startTrial();
      if (res?.data?.trialExpires) toast.success("Your 14-day trial started!");
      else toast.success("Trial activated!");
      if (typeof fetchUser === "function") await fetchUser();
    } catch (err) {
      const msg = err?.response?.data?.error || "";
      if (!/already started/i.test(msg)) console.error("Failed to auto-start trial:", msg);
    }
  };

  const hasProfileChanges = () => {
    if (coverPhotoFile || avatarFile || workImageFiles.length || coverPhotoRemoved || isAvatarRemoved)
      return true;

    const original = businessCard || {};
    const norm = (v) => (v ?? "").toString().trim();

    const normalizeServices = (arr) =>
      (arr || []).map((s) => ({ name: norm(s.name), price: norm(s.price) }));
    const normalizeReviews = (arr) =>
      (arr || []).map((r) => ({ name: norm(r.name), text: norm(r.text), rating: Number(r.rating) || 0 }));

    const servicesChanged = (() => {
      const a = normalizeServices(state.services);
      const b = normalizeServices(original.services);
      if (a.length !== b.length) return true;
      for (let i = 0; i < a.length; i++)
        if (a[i].name !== b[i].name || a[i].price !== b[i].price) return true;
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
      if (response.data?.url) window.location.href = response.data.url;
      else toast.error("Failed to start subscription. Please try again.");
    } catch (err) {
      toast.error(err?.response?.data?.error || "Failed to start subscription.");
    }
  };

  const handleResetPage = async () => {
    if (
      !window.confirm(
        "Are you sure you want to reset everything? This will delete your published profile and restore the default template."
      )
    )
      return;
    try {
      await api.delete("/api/business-card/my_card");

      activeBlobUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      activeBlobUrlsRef.current = [];

      setCoverPhotoFile(null);
      setAvatarFile(null);
      setWorkImageFiles([]);
      setCoverPhotoRemoved(false);
      setIsAvatarRemoved(false);

      updateState({
        businessName: "",
        pageTheme: "light",
        font: "Inter",
        mainHeading: "",
        subHeading: "",
        job_title: "",
        full_name: "",
        bio: "",
        avatar: null,
        coverPhoto: null,
        workImages: [],
        services: [],
        reviews: [],
        contact_email: "",
        phone_number: "",
        workDisplayMode: "list",
      });

      await queryClient.invalidateQueries(["businessCard", userId]);
      queryClient.setQueryData(["businessCard", userId], null);
      toast.success("Your page has been reset to the default template.");
    } catch (err) {
      console.error("Reset failed", err);
      toast.error(err?.response?.data?.error || "Failed to reset page.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!hasProfileChanges()) return toast.error("You haven't made any changes.");
    if (!isSubscribed && !isTrialActive) await ensureTrialIfNeeded();

    const worksToUpload = (state.workImages || [])
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
      services: (state.services || []).filter((s) => s.name || s.price),
      reviews: (state.reviews || []).filter((r) => r.name || r.text),
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
      toast.error(err?.response?.data?.error || "Something went wrong while saving.");
    }
  };

  /* =========================
     RENDER — HEADER + PREVIEW
     ========================= */
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
        <PageHeader onShareCard={() => {
          if (!isVerified) return toast.error("Please verify your email to share your card.");
          setShowShareModal(true);
        }} isMobile={isMobile} isSmallMobile={isSmallMobile} />

        <div className="myprofile-main-content">
          {!authUser && (
            <div className="content-card-box error-state">
              <p>User not loaded. Please ensure you are logged in.</p>
              <button onClick={() => (window.location.href = "/login")}>Go to Login</button>
            </div>
          )}

          {authUser && (
            <>
              {showVerificationPrompt && (
                <div className="content-card-box verification-prompt">
                  <p>⚠️ Your email is not verified!</p>
                  <p>
                    Please verify your email address (<strong>{userEmail}</strong>) to unlock all features,
                    including saving changes to your business card.
                  </p>
                  <form onSubmit={handleVerifyCode}>
                    <input
                      type="text"
                      placeholder="Enter 6-digit code"
                      value={verificationCodeInput}
                      onChange={(e) => setVerificationCodeInput(e.target.value)}
                      maxLength={6}
                    />
                    <button type="submit">Verify Email</button>
                    <button type="button" onClick={sendVerificationCode} disabled={resendCooldown > 0}>
                      {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend Code"}
                    </button>
                  </form>
                </div>
              )}

              {isTrialActive && (
                <div className="trial-banner">
                  <p className="desktop-body-s">
                    Your free trial ends on{" "}
                    <strong>{new Date(authUser.trialExpires).toLocaleDateString()}</strong>.
                  </p>
                  <button className="blue-trial desktop-body-s" onClick={handleStartSubscription}>
                    Subscribe Now
                  </button>
                </div>
              )}

              {hasTrialEnded && !isSubscribed && (
                <div className="trial-ended-banner">
                  <p>
                    Your free trial has ended. <Link to="/subscription">Subscribe now</Link> to prevent your
                    profile from being deleted.
                  </p>
                </div>
              )}

              <div className="myprofile-flex-container">
                {/* ===== PREVIEW COLUMN (full-width on mobile, NO inner scrolling) ===== */}
                <div className="myprofile-content">
                  {/* Always-visible control ABOVE the preview on mobile */}
                  {isMobile && (
                    <div className={`mp-mobile-controls ${previewOpen ? "is-open" : "is-collapsed"}`} role="tablist" aria-label="Preview controls">
                      <div className="mp-pill">
                        <button
                          type="button"
                          role="tab"
                          aria-selected={previewOpen}
                          className={`mp-tab ${previewOpen ? "active" : ""}`}
                          onClick={() => setPreviewOpen((s) => !s)}
                        >
                          {previewOpen ? "Hide Preview" : "Show Preview"}
                        </button>
                        <a
                          role="tab"
                          aria-selected={!previewOpen}
                          className="mp-tab visit"
                          href={visitUrl}
                          target="_blank"
                          rel="noreferrer"
                          onClick={() => setPreviewOpen(false)}
                        >
                          Visit Page
                        </a>
                      </div>
                      {/* keep pill bottom for subtle separation */}
                      <div className="mp-pill-bottom" aria-hidden="true" />
                    </div>
                  )}

                  {/* PREVIEW (on mobile: hidden when toggled off; on desktop: always shown) */}
                  {(!isMobile || previewOpen) && (
                    <div
                      className={`mock-phone ${isDarkMode ? "dark-mode" : ""}`}
                      style={{ fontFamily: state.font || previewPlaceholders.font }}
                    >
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
                              <button type="button" className="mock-button">Save My Number</button>
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
                                      {Array(r.rating || 0).fill().map((_, idx) => <span key={`f-${idx}`}>★</span>)}
                                      {Array(Math.max(0, 5 - (r.rating || 0))).fill().map((_, idx) => (
                                        <span key={`e-${idx}`} className="empty-star">★</span>
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
                  )}
                </div>
                {/* ===== EDITOR COLUMN (full-width on mobile; page scrolls) ===== */}
                <div className="myprofile-editor-container">
                  <div className="settings-card">
                    <div className="settings-head">
                      <div>
                        <h3 className="desktop-h5">Profile Editor</h3>
                        <p className="desktop-body-s">Edit your card details below and preview them instantly.</p>
                      </div>
                      <span className="pricing-badge pill-blue">Editor</span>
                    </div>

                    <div className="settings-divider" />

                    <form onSubmit={handleSubmit} className="editor-form">
                      {/* Business Name */}
                      <label className="profile-label">Business Name</label>
                      <input
                        type="text"
                        className="text-input"
                        value={state.businessName || ""}
                        onChange={(e) => updateState({ businessName: e.target.value })}
                        placeholder="Enter your business name"
                      />

                      {/* Main Heading */}
                      <label className="profile-label">Main Heading</label>
                      <input
                        type="text"
                        className="text-input"
                        value={state.mainHeading || ""}
                        onChange={(e) => updateState({ mainHeading: e.target.value })}
                        placeholder="Main headline for your page"
                      />

                      {/* Sub Heading */}
                      <label className="profile-label">Sub Heading</label>
                      <input
                        type="text"
                        className="text-input"
                        value={state.subHeading || ""}
                        onChange={(e) => updateState({ subHeading: e.target.value })}
                        placeholder="Tagline or slogan"
                      />

                      {/* Job Title */}
                      <label className="profile-label">Job Title</label>
                      <input
                        type="text"
                        className="text-input"
                        value={state.job_title || ""}
                        onChange={(e) => updateState({ job_title: e.target.value })}
                        placeholder="e.g. Web Developer"
                      />

                      {/* Full Name */}
                      <label className="profile-label">Full Name</label>
                      <input
                        type="text"
                        className="text-input"
                        value={state.full_name || ""}
                        onChange={(e) => updateState({ full_name: e.target.value })}
                        placeholder="Your name"
                      />

                      {/* Bio */}
                      <label className="profile-label">Bio</label>
                      <textarea
                        className="text-input"
                        rows={4}
                        value={state.bio || ""}
                        onChange={(e) => updateState({ bio: e.target.value })}
                        placeholder="Tell people about yourself..."
                      />

                      {/* Email */}
                      <label className="profile-label">Contact Email</label>
                      <input
                        type="email"
                        className="text-input"
                        value={state.contact_email || ""}
                        onChange={(e) => updateState({ contact_email: e.target.value })}
                        placeholder="your@email.com"
                      />

                      {/* Phone */}
                      <label className="profile-label">Phone Number</label>
                      <input
                        type="tel"
                        className="text-input"
                        value={state.phone_number || ""}
                        onChange={(e) => updateState({ phone_number: e.target.value })}
                        placeholder="e.g. +44 7000 000000"
                      />

                      {/* ====== Sections ====== */}
                      <div className="settings-divider" />

                      {/* Main Section controls (cover + headings already above) */}
                      <div className="editor-section-header">
                        <h3 className="editor-subtitle">Main Section</h3>
                        <button type="button" onClick={() => setShowMainSection(!showMainSection)} className="toggle-button">
                          {showMainSection ? "Hide Section" : "Show Section"}
                        </button>
                      </div>
                      {showMainSection && (
                        <>
                          <label className="profile-label">Cover Photo</label>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            style={{ display: "none" }}
                            onChange={handleImageUpload}
                          />
                          <div
                            className="editor-item-card work-image-item-wrapper cover-photo-card"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            {state.coverPhoto ? (
                              <img
                                src={state.coverPhoto}
                                alt="Cover"
                                className="work-image-preview"
                              />
                            ) : (
                              <span className="upload-text">Add Cover Photo</span>
                            )}
                            {state.coverPhoto && (
                              <button
                                type="button"
                                className="remove-image-button"
                                onClick={(e) => { e.stopPropagation(); handleRemoveCoverPhoto(); }}
                              >
                                &times;
                              </button>
                            )}
                          </div>
                        </>
                      )}

                      <div className="settings-divider" />

                      {/* About Me */}
                      <div className="editor-section-header">
                        <h3 className="editor-subtitle">About Me Section</h3>
                        <button type="button" onClick={() => setShowAboutMeSection(!showAboutMeSection)} className="toggle-button">
                          {showAboutMeSection ? "Hide Section" : "Show Section"}
                        </button>
                      </div>
                      {showAboutMeSection && (
                        <>
                          <label className="profile-label">Display Layout</label>
                          <div className="option-row">
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

                          <label className="profile-label">Profile Photo</label>
                          <input
                            ref={avatarInputRef}
                            type="file"
                            accept="image/*"
                            style={{ display: "none" }}
                            onChange={handleAvatarUpload}
                          />
                          <div className="image-upload-area avatar-upload" onClick={() => avatarInputRef.current?.click()}>
                            {!state.avatar && <span className="upload-text">Add Profile Photo</span>}
                            <img src={state.avatar || ""} alt="Avatar preview" className="avatar-preview" />
                            {state.avatar && (
                              <button
                                type="button"
                                className="remove-image-button"
                                onClick={(e) => { e.stopPropagation(); handleRemoveAvatar(); }}
                              >
                                &times;
                              </button>
                            )}
                          </div>
                        </>
                      )}

                      <div className="settings-divider" />

                      {/* Work */}
                      <div className="editor-section-header">
                        <h3 className="editor-subtitle">My Work Section</h3>
                        <button type="button" onClick={() => setShowWorkSection(!showWorkSection)} className="toggle-button">
                          {showWorkSection ? "Hide Section" : "Show Section"}
                        </button>
                      </div>
                      {showWorkSection && (
                        <>
                          <label className="profile-label">Display Layout</label>
                          <div className="option-row">
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

                          <label className="profile-label">Work Images</label>
                          <div className="editor-work-image-grid">
                            {(state.workImages || []).map((item, i) => (
                              <div key={i} className="editor-item-card work-image-item-wrapper">
                                <img src={item.preview || item} alt={`work-${i}`} className="work-image-preview" />
                                <button
                                  type="button"
                                  className="remove-image-button"
                                  onClick={(e) => { e.stopPropagation(); handleRemoveWorkImage(i); }}
                                >
                                  &times;
                                </button>
                              </div>
                            ))}
                            {(state.workImages || []).length < 10 && (
                              <div className="add-work-image-placeholder" onClick={() => workImageInputRef.current?.click()}>
                                <span className="upload-text">Add Work Image(s)</span>
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
                        </>
                      )}

                      <div className="settings-divider" />

                      {/* Services */}
                      <div className="editor-section-header">
                        <h3 className="editor-subtitle">My Services Section</h3>
                        <button type="button" onClick={() => setShowServicesSection(!showServicesSection)} className="toggle-button">
                          {showServicesSection ? "Hide Section" : "Show Section"}
                        </button>
                      </div>
                      {showServicesSection && (
                        <>
                          <label className="profile-label">Display Layout</label>
                          <div className="option-row">
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

                          <label className="profile-label">Services</label>
                          <div className="editor-service-list">
                            {(state.services || []).map((s, i) => (
                              <div key={i} className="editor-item-card mock-service-item-wrapper">
                                <input
                                  type="text"
                                  placeholder="Service Name"
                                  value={s.name || ""}
                                  onChange={(e) => handleServiceChange(i, "name", e.target.value)}
                                />
                                <input
                                  type="text"
                                  placeholder="Service Price/Detail"
                                  value={s.price || ""}
                                  onChange={(e) => handleServiceChange(i, "price", e.target.value)}
                                />
                                <button type="button" onClick={() => handleRemoveService(i)} className="remove-item-button">
                                  Remove
                                </button>
                              </div>
                            ))}
                          </div>
                          <button type="button" onClick={handleAddService} className="add-item-button">
                            + Add Service
                          </button>
                        </>
                      )}

                      <div className="settings-divider" />

                      {/* Reviews */}
                      <div className="editor-section-header">
                        <h3 className="editor-subtitle">Reviews Section</h3>
                        <button type="button" onClick={() => setShowReviewsSection(!showReviewsSection)} className="toggle-button">
                          {showReviewsSection ? "Hide Section" : "Show Section"}
                        </button>
                      </div>
                      {showReviewsSection && (
                        <>
                          <label className="profile-label">Display Layout</label>
                          <div className="option-row">
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

                          <label className="profile-label">Reviews</label>
                          <div className="editor-reviews-list">
                            {(state.reviews || []).map((r, i) => (
                              <div key={i} className="editor-item-card mock-review-card-wrapper">
                                <input
                                  type="text"
                                  placeholder="Reviewer Name"
                                  value={r.name || ""}
                                  onChange={(e) => handleReviewChange(i, "name", e.target.value)}
                                />
                                <textarea
                                  placeholder="Review text"
                                  rows={2}
                                  value={r.text || ""}
                                  onChange={(e) => handleReviewChange(i, "text", e.target.value)}
                                />
                                <input
                                  type="number"
                                  placeholder="Rating (1-5)"
                                  min="1"
                                  max="5"
                                  value={r.rating || ""}
                                  onChange={(e) => handleReviewChange(i, "rating", e.target.value)}
                                />
                                <button type="button" onClick={() => handleRemoveReview(i)} className="remove-item-button">
                                  Remove
                                </button>
                              </div>
                            ))}
                          </div>
                          <button type="button" onClick={handleAddReview} className="add-item-button">
                            + Add Review
                          </button>
                        </>
                      )}

                      <div className="settings-divider" />

                      {/* Contact toggler (fields already at top) */}
                      <div className="editor-section-header">
                        <h3 className="editor-subtitle">My Contact Details</h3>
                        <button type="button" onClick={() => setShowContactSection(!showContactSection)} className="toggle-button">
                          {showContactSection ? "Hide Section" : "Show Section"}
                        </button>
                      </div>

                      {/* Actions */}
                      <div className="settings-actions">
                        <button type="button" onClick={handleResetPage} className="cta-black-button desktop-button">
                          Reset to Default
                        </button>
                        <button type="submit" className="cta-blue-button desktop-button">
                          Publish Changes
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      {/* Share modal */}
      <ShareProfile
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        profileUrl={visitUrl}
        contactDetails={{
          full_name: state.full_name,
          job_title: state.job_title,
          business_card_name: state.businessName,
          bio: state.bio,
          contact_email: state.contact_email,
          phone_number: state.phone_number,
          username: userUsername,
        }}
        username={userUsername}
      />
    </div>
  );
}
