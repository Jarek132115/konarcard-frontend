// src/pages/website/MyProfile.jsx
import React, { useRef, useEffect, useState, useContext } from "react";
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
  /* =========================
     STORES / HOOKS / CONTEXT
     ========================= */
  const { state, updateState, resetState } = useBusinessCardStore();
  const createBusinessCard = useCreateBusinessCard();
  const queryClient = useQueryClient();
  const location = useLocation();

  const {
    user: authUser,
    loading: authLoading,
    fetchUser: refetchAuthUser,
  } = useContext(AuthContext);

  const userId = authUser?._id;
  const userEmail = authUser?.email;
  const isSubscribed = !!authUser?.isSubscribed;
  const isUserVerified = !!authUser?.isVerified;
  const userUsername = authUser?.username;

  const { data: businessCard, isLoading: isCardLoading } = useFetchBusinessCard(userId);

  /* =========================
     LOCAL REFS
     ========================= */
  const fileInputRef = useRef(null);
  const avatarInputRef = useRef(null);
  const workImageInputRef = useRef(null);

  // preview carousels
  const previewWorkCarouselRef = useRef(null);
  const previewServicesCarouselRef = useRef(null);
  const previewReviewsCarouselRef = useRef(null);

  // track blob URLs to revoke on unmount
  const activeBlobUrlsRef = useRef([]);

  /* =========================
     LOCAL STATE
     ========================= */
  const [showVerificationPrompt, setShowVerificationPrompt] = useState(false);
  const [verificationCodeInput, setVerificationCodeCode] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const [showShareModal, setShowShareModal] = useState(false);

  const [coverPhotoFile, setCoverPhotoFile] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [workImageFiles, setWorkImageFiles] = useState([]);
  const [coverPhotoRemoved, setCoverPhotoRemoved] = useState(false);
  const [isAvatarRemoved, setIsAvatarRemoved] = useState(false);
  const [activeBlobUrls, setActiveBlobUrls] = useState([]);

  const [sidebarOpen, setSidebarOpen] = useState(false);

  // responsive flags (use matchMedia so they’re correct immediately)
  const mqDesktopToMobile = "(max-width: 1000px)";
  const mqSmallMobile = "(max-width: 600px)";
  const [isMobile, setIsMobile] = useState(window.matchMedia(mqDesktopToMobile).matches);
  const [isSmallMobile, setIsSmallMobile] = useState(window.matchMedia(mqSmallMobile).matches);

  // editor display toggles
  const [servicesDisplayMode, setServicesDisplayMode] = useState("list");
  const [reviewsDisplayMode, setReviewsDisplayMode] = useState("list");
  const [aboutMeLayout, setAboutMeLayout] = useState("side-by-side");

  const [showMainSection, setShowMainSection] = useState(true);
  const [showAboutMeSection, setShowAboutMeSection] = useState(true);
  const [showWorkSection, setShowWorkSection] = useState(true);
  const [showServicesSection, setShowServicesSection] = useState(true);
  const [showReviewsSection, setShowReviewsSection] = useState(true);
  const [showContactSection, setShowContactSection] = useState(true);

  /* =========================
     TRIAL/PLAN STATUS
     ========================= */
  const isTrialActive = !!(authUser && authUser.trialExpires && new Date(authUser.trialExpires) > new Date());
  const hasTrialEnded = !!(authUser && authUser.trialExpires && new Date(authUser.trialExpires) <= new Date());

  const hasSavedData = !!businessCard;
  const hasExchangeContact =
    (state.contact_email && state.contact_email.trim()) ||
    (state.phone_number && state.phone_number.trim());

  /* =========================
     EFFECTS
     ========================= */

  // handle payment_success query and refresh user
  useEffect(() => {
    let handled = false;

    const run = async () => {
      if (authLoading || !authUser) return;
      const params = new URLSearchParams(location.search);
      const paymentSuccess = params.get("payment_success");
      if (paymentSuccess === "true" && !isSubscribed && !handled) {
        handled = true;
        if (typeof refetchAuthUser === "function") await refetchAuthUser();
        window.history.replaceState({}, document.title, location.pathname);
        toast.success("Subscription updated successfully!");
      }
    };

    run();
  }, [location.search, isSubscribed, authLoading, authUser, refetchAuthUser]);

  // responsive listeners (matchMedia is better for first render)
  useEffect(() => {
    const mm1 = window.matchMedia(mqDesktopToMobile);
    const mm2 = window.matchMedia(mqSmallMobile);

    const onChange = () => {
      setIsMobile(mm1.matches);
      setIsSmallMobile(mm2.matches);
      if (!mm1.matches && sidebarOpen) setSidebarOpen(false); // close when switching to desktop
    };

    mm1.addEventListener("change", onChange);
    mm2.addEventListener("change", onChange);
    return () => {
      mm1.removeEventListener("change", onChange);
      mm2.removeEventListener("change", onChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sidebarOpen]);

  // lock body scroll when the sidebar is open on mobile
  useEffect(() => {
    if (sidebarOpen && isMobile) document.body.classList.add("body-no-scroll");
    else document.body.classList.remove("body-no-scroll");
  }, [sidebarOpen, isMobile]);

  // resend cooldown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  // verification prompt
  useEffect(() => {
    if (!authLoading && authUser && !isUserVerified && userEmail) setShowVerificationPrompt(true);
    else if (!authLoading && isUserVerified) setShowVerificationPrompt(false);
  }, [authLoading, authUser, isUserVerified, userEmail]);

  // hydrate editor with server data
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

  // revoke blobs on unmount
  useEffect(() => {
    return () => {
      activeBlobUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  /* =========================
     HELPERS
     ========================= */
  const createAndTrackBlobUrl = (file) => {
    const url = URL.createObjectURL(file);
    activeBlobUrlsRef.current.push(url);
    setActiveBlobUrls((prev) => [...prev, url]);
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

    if (isLocalBlob) {
      URL.revokeObjectURL(state.coverPhoto);
      activeBlobUrlsRef.current = activeBlobUrlsRef.current.filter((u) => u !== state.coverPhoto);
      setActiveBlobUrls((prev) => prev.filter((u) => u !== state.coverPhoto));
    }
    updateState({ coverPhoto: null });
    setCoverPhotoFile(null);
  };

  const handleRemoveAvatar = () => {
    const isLocalBlob = state.avatar && state.avatar.startsWith("blob:");
    if (!isLocalBlob && state.avatar) setIsAvatarRemoved(true);
    else setIsAvatarRemoved(false);

    if (isLocalBlob) {
      URL.revokeObjectURL(state.avatar);
      activeBlobUrlsRef.current = activeBlobUrlsRef.current.filter((u) => u !== state.avatar);
      setActiveBlobUrls((prev) => prev.filter((u) => u !== state.avatar));
    }
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
    if (item?.preview?.startsWith("blob:")) {
      URL.revokeObjectURL(item.preview);
      activeBlobUrlsRef.current = activeBlobUrlsRef.current.filter((u) => u !== item.preview);
      setActiveBlobUrls((prev) => prev.filter((u) => u !== item.preview));
    }
    updateState({ workImages: state.workImages.filter((_, i) => i !== idx) });
  };

  const handleAddService = () => updateState({ services: [...state.services, { name: "", price: "" }] });
  const handleServiceChange = (i, field, value) => {
    const arr = [...state.services];
    arr[i] = { ...arr[i], [field]: value };
    updateState({ services: arr });
  };
  const handleRemoveService = (i) => updateState({ services: state.services.filter((_, x) => x !== i) });

  const handleAddReview = () =>
    updateState({ reviews: [...state.reviews, { name: "", text: "", rating: 5 }] });

  const handleReviewChange = (i, field, value) => {
    const arr = [...state.reviews];
    if (field === "rating") {
      const n = parseInt(value);
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
        refetchAuthUser();
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Verification failed.");
    }
  };

  // compare changes to determine if publish is needed
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isSubscribed && !isTrialActive) return toast.error("Please start your free trial to publish your changes.");
    if (!hasProfileChanges()) return toast.error("You haven't made any changes.");

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
      setActiveBlobUrls([]);
    } catch (err) {
      toast.error(err.response?.data?.error || "Something went wrong while saving.");
    }
  };

  const handleStartTrial = async () => {
    if (isSubscribed || isTrialActive) return toast("Your plan is already active.", { icon: "ℹ️" });
    try {
      const res = await startTrial();
      if (res?.data?.trialExpires) toast.success("Your 14-day trial is now active!");
      else toast.success("Trial activated!");
      if (typeof refetchAuthUser === "function") await refetchAuthUser();
    } catch (err) {
      toast.error(err?.response?.data?.error || "Could not start trial. Please try again.");
    }
  };

  const handleStartSubscription = async () => {
    try {
      const response = await api.post("/subscribe", {});
      if (response.data?.url) window.location.href = response.data.url;
      else toast.error("Failed to start subscription. Please try again.");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to start subscription.");
    }
  };

  const handleShareCard = () => {
    if (!isUserVerified) return toast.error("Please verify your email to share your card.");
    setShowShareModal(true);
  };
  const handleCloseShareModal = () => setShowShareModal(false);

  const handleResetPage = async () => {
    if (!window.confirm("Are you sure you want to reset everything? This will delete your published profile and restore the default template.")) return;
    try {
      await api.delete("/api/business-card/my_card");
      activeBlobUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      activeBlobUrlsRef.current = [];
      setActiveBlobUrls([]);

      setCoverPhotoFile(null);
      setAvatarFile(null);
      setWorkImageFiles([]);
      setCoverPhotoRemoved(false);
      setIsAvatarRemoved(false);

      resetState();
      await queryClient.invalidateQueries(["businessCard", userId]);
      queryClient.setQueryData(["businessCard", userId], null);
      toast.success("Your page has been reset to the default template.");
    } catch (err) {
      console.error("Reset failed", err);
      toast.error(err?.response?.data?.error || "Failed to reset page.");
    }
  };

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
  const currentQrCodeUrl = businessCard?.qrCodeUrl || "";
  const getEditorImageSrc = (img, ph) => img || (shouldShowPlaceholders ? ph : "");
  const showAddImageText = (img) => !img;
  const isDarkMode = state.pageTheme === "dark";

  /* =========================
     RENDER
     ========================= */
  return (
    <div className={`app-layout ${sidebarOpen ? "sidebar-active" : ""}`}>
      {/* Mobile header (fixed) */}
      <div className="myprofile-mobile-header">
        <button
          className="sidebar-menu-toggle"
          aria-label="Open menu"
          onClick={() => setSidebarOpen(true)}
        >
          <span></span><span></span><span></span>
        </button>

        <div className="myprofile-brand">
          <img src={LogoIcon} alt="Konar" className="myprofile-logo" />
        </div>
      </div>

      {/* Sidebar + overlay */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      {sidebarOpen && isMobile && (
        <div className="sidebar-overlay active" onClick={() => setSidebarOpen(false)} />
      )}

      {/* MAIN */}
      <main className="main-content-container">
        {/* Page header (shows user name/email + Share) */}
        <PageHeader
          title={"My Profile"}
          onActivateCard={handleStartTrial}
          onShareCard={handleShareCard}
          isMobile={isMobile}
          isSmallMobile={isSmallMobile}
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
                  <p>
                    <span role="img" aria-label="warning">⚠️</span> Your email is not verified!
                  </p>
                  <p>
                    Please verify your email address (<strong>{userEmail}</strong>) to unlock all features, including saving changes to your business card.
                  </p>
                  <form onSubmit={handleVerifyCode}>
                    <input
                      type="text"
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

              {!isSubscribed && !isTrialActive && (
                <div className="trial-not-started-banner">
                  <p><strong>Activate my website</strong> — 14 days free, no card required.</p>
                  <button className="blue-button" onClick={handleStartTrial}>Activate</button>
                </div>
              )}

              {isTrialActive && (
                <div className="trial-countdown-banner">
                  <p>
                    Your free trial ends on {new Date(authUser.trialExpires).toLocaleDateString()}.{" "}
                    <Link to="/subscription">Subscribe now!</Link>
                  </p>
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
                {/* Phone preview */}
                <div className={`myprofile-content ${isMobile ? "myprofile-mock-phone-mobile-container" : ""}`}>
                  <div
                    className={`mock-phone mobile-preview ${isDarkMode ? "dark-mode" : ""}`}
                    style={{ fontFamily: state.font || previewPlaceholders.font }}
                  >
                    <div className="mock-phone-scrollable-content">
                      {showMainSection && (
                        <>
                          {(shouldShowPlaceholders || !!state.coverPhoto) && (
                            <img src={previewCoverPhotoSrc} alt="Cover" className="mock-cover" />
                          )}

                          <h2 className="mock-title">
                            {state.mainHeading || (!hasSavedData ? previewPlaceholders.main_heading : "Your Main Heading Here")}
                          </h2>
                          <p className="mock-subtitle">
                            {state.subHeading || (!hasSavedData ? previewPlaceholders.sub_heading : "Your Tagline or Slogan Goes Here")}
                          </p>

                          {(shouldShowPlaceholders || hasExchangeContact) && (
                            <button type="button" className="mock-button">Save My Number</button>
                          )}
                        </>
                      )}

                      {showAboutMeSection && (previewFullName || previewJobTitle || previewBio || previewAvatarSrc) && (
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

                      {showServicesSection && (state.services.length > 0 || !hasSavedData) && (
                        <>
                          <p className="mock-section-title">My Services</p>
                          <div className="work-preview-row-container">
                            {servicesDisplayMode === "carousel" && (
                              <div className="carousel-nav-buttons">
                                <button type="button" className="carousel-nav-button left-arrow" onClick={() => scrollCarousel(previewServicesCarouselRef, "left")}>
                                  &#9664;
                                </button>
                                <button type="button" className="carousel-nav-button right-arrow" onClick={() => scrollCarousel(previewServicesCarouselRef, "right")}>
                                  &#9654;
                                </button>
                              </div>
                            )}
                            <div ref={previewServicesCarouselRef} className={`mock-services-list ${servicesDisplayMode}`}>
                              {(shouldShowPlaceholders ? previewPlaceholders.services : state.services).map((s, i) => (
                                <div key={i} className="mock-service-item">
                                  <p className="mock-service-name">{s.name}</p>
                                  <span className="mock-service-price">{s.price}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </>
                      )}

                      {showReviewsSection && (state.reviews.length > 0 || !hasSavedData) && (
                        <>
                          <p className="mock-section-title">Reviews</p>
                          <div className="work-preview-row-container">
                            {reviewsDisplayMode === "carousel" && (
                              <div className="carousel-nav-buttons">
                                <button type="button" className="carousel-nav-button left-arrow" onClick={() => scrollCarousel(previewReviewsCarouselRef, "left")}>
                                  &#9664;
                                </button>
                                <button type="button" className="carousel-nav-button right-arrow" onClick={() => scrollCarousel(previewReviewsCarouselRef, "right")}>
                                  &#9654;
                                </button>
                              </div>
                            )}
                            <div ref={previewReviewsCarouselRef} className={`mock-reviews-list ${reviewsDisplayMode}`}>
                              {(shouldShowPlaceholders ? previewPlaceholders.reviews : state.reviews).map((r, i) => (
                                <div key={i} className="mock-review-card">
                                  <div className="mock-star-rating">
                                    {Array(r.rating || 0).fill().map((_, idx) => <span key={`f-${idx}`}>★</span>)}
                                    {Array(Math.max(0, 5 - (r.rating || 0))).fill().map((_, idx) => <span key={`e-${idx}`} className="empty-star">★</span>)}
                                  </div>
                                  <p className="mock-review-text">{`"${r.text}"`}</p>
                                  <p className="mock-reviewer-name">{r.name}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </>
                      )}

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

                {/* Editor */}
                <div className="myprofile-editor-wrapper">
                  {(!isSubscribed && hasTrialEnded) && (
                    <div className="subscription-overlay">
                      <div className="subscription-message">
                        <p className="desktop-h4">Subscription Required</p>
                        <p className="desktop-h6">Your free trial has ended. Please subscribe to continue editing your profile.</p>
                        <button className="blue-button" onClick={handleStartSubscription}>Go to Subscription</button>
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
                    <h2 className="editor-title">Create Your Digital Business Card</h2>

                    {/* Theme */}
                    <div className="input-block">
                      <label>Page Theme</label>
                      <div className="option-row">
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
                      <div className="option-row">
                        {["Inter", "Montserrat", "Poppins"].map((font) => (
                          <button
                            type="button"
                            key={font}
                            className={`font-button ${state.font === font ? "is-active" : ""}`}
                            onClick={() => updateState({ font })}
                            style={{ fontFamily: `'${font}', system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif`, fontWeight: 700 }}
                          >
                            {font}
                          </button>
                        ))}
                      </div>
                    </div>

                    <hr className="divider" />
                    <div className="editor-section-header">
                      <h3 className="editor-subtitle">Main Section</h3>
                      <button type="button" onClick={() => setShowMainSection(!showMainSection)} className="toggle-button">
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
                          <div className="image-upload-area cover-photo-upload" onClick={() => fileInputRef.current?.click()}>
                            {showAddImageText(state.coverPhoto) && <span className="upload-text">Add Cover Photo</span>}
                            <img src={getEditorImageSrc(state.coverPhoto, previewPlaceholders.coverPhoto)} alt="Cover" className="cover-preview" />
                            {state.coverPhoto && (
                              <button type="button" className="remove-image-button" onClick={(e) => { e.stopPropagation(); handleRemoveCoverPhoto(); }}>
                                &times;
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="input-block">
                          <label htmlFor="mainHeading">Main Heading</label>
                          <input
                            id="mainHeading"
                            type="text"
                            value={state.mainHeading || ""}
                            onChange={(e) => updateState({ mainHeading: e.target.value })}
                            placeholder={previewPlaceholders.main_heading}
                          />
                        </div>

                        <div className="input-block">
                          <label htmlFor="subHeading">Subheading</label>
                          <input
                            id="subHeading"
                            type="text"
                            value={state.subHeading || ""}
                            onChange={(e) => updateState({ subHeading: e.target.value })}
                            placeholder={previewPlaceholders.sub_heading}
                          />
                        </div>
                      </>
                    )}

                    <hr className="divider" />
                    <div className="editor-section-header">
                      <h3 className="editor-subtitle">About Me Section</h3>
                      <button type="button" onClick={() => setShowAboutMeSection(!showAboutMeSection)} className="toggle-button">
                        {showAboutMeSection ? "Hide Section" : "Show Section"}
                      </button>
                    </div>
                    {showAboutMeSection && (
                      <>
                        <div className="input-block">
                          <label>Display Layout</label>
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
                          <div className="image-upload-area avatar-upload" onClick={() => avatarInputRef.current?.click()}>
                            {showAddImageText(state.avatar) && <span className="upload-text">Add Profile Photo</span>}
                            <img src={state.avatar || ""} alt="Avatar preview" className="avatar-preview" />
                            {state.avatar && (
                              <button type="button" className="remove-image-button" onClick={(e) => { e.stopPropagation(); handleRemoveAvatar(); }}>
                                &times;
                              </button>
                            )}
                          </div>

                          <div className="input-block">
                            <label htmlFor="fullName">Full Name</label>
                            <input
                              id="fullName"
                              type="text"
                              value={state.full_name || ""}
                              onChange={(e) => updateState({ full_name: e.target.value })}
                              placeholder={previewPlaceholders.full_name}
                            />
                          </div>

                          <div className="input-block">
                            <label htmlFor="jobTitle">Job Title</label>
                            <input
                              id="jobTitle"
                              type="text"
                              value={state.job_title || ""}
                              onChange={(e) => updateState({ job_title: e.target.value })}
                              placeholder={previewPlaceholders.job_title}
                            />
                          </div>

                          <div className="input-block">
                            <label htmlFor="bio">About Me Description</label>
                            <textarea
                              id="bio"
                              rows={4}
                              value={state.bio || ""}
                              onChange={(e) => updateState({ bio: e.target.value })}
                              placeholder={previewPlaceholders.bio}
                            />
                          </div>
                        </div>
                      </>
                    )}

                    <hr className="divider" />
                    <div className="editor-section-header">
                      <h3 className="editor-subtitle">My Work Section</h3>
                      <button type="button" onClick={() => setShowWorkSection(!showWorkSection)} className="toggle-button">
                        {showWorkSection ? "Hide Section" : "Show Section"}
                      </button>
                    </div>
                    {showWorkSection && (
                      <>
                        <div className="input-block">
                          <label>Display Layout</label>
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
                        </div>

                        <div className="input-block">
                          <label>Work Images</label>
                          <div className="editor-work-image-grid">
                            {state.workImages.map((item, i) => (
                              <div key={i} className="editor-item-card work-image-item-wrapper">
                                <img src={item.preview || item} alt={`work-${i}`} className="work-image-preview" />
                                <button type="button" className="remove-image-button" onClick={(e) => { e.stopPropagation(); handleRemoveWorkImage(i); }}>
                                  &times;
                                </button>
                              </div>
                            ))}
                            {state.workImages.length < 10 && (
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
                        </div>
                      </>
                    )}

                    <hr className="divider" />
                    <div className="editor-section-header">
                      <h3 className="editor-subtitle">My Services Section</h3>
                      <button type="button" onClick={() => setShowServicesSection(!showServicesSection)} className="toggle-button">
                        {showServicesSection ? "Hide Section" : "Show Section"}
                      </button>
                    </div>
                    {showServicesSection && (
                      <>
                        <div className="input-block">
                          <label>Display Layout</label>
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
                        </div>

                        <div className="input-block">
                          <label>Services</label>
                          <div className="editor-service-list">
                            {state.services.map((s, i) => (
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
                        </div>
                      </>
                    )}

                    <hr className="divider" />
                    <div className="editor-section-header">
                      <h3 className="editor-subtitle">Reviews Section</h3>
                      <button type="button" onClick={() => setShowReviewsSection(!showReviewsSection)} className="toggle-button">
                        {showReviewsSection ? "Hide Section" : "Show Section"}
                      </button>
                    </div>
                    {showReviewsSection && (
                      <>
                        <div className="input-block">
                          <label>Display Layout</label>
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
                        </div>

                        <div className="input-block">
                          <label>Reviews</label>
                          <div className="editor-reviews-list">
                            {state.reviews.map((r, i) => (
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
                                  onChange={(e) => handleReviewChange(i, "rating", parseInt(e.target.value) || 0)}
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
                        </div>
                      </>
                    )}

                    <hr className="divider" />
                    <div className="editor-section-header">
                      <h3 className="editor-subtitle">My Contact Details</h3>
                      <button type="button" onClick={() => setShowContactSection(!showContactSection)} className="toggle-button">
                        {showContactSection ? "Hide Section" : "Show Section"}
                      </button>
                    </div>
                    {showContactSection && (
                      <>
                        <div className="input-block">
                          <label htmlFor="contactEmail">Email Address</label>
                          <input
                            id="contactEmail"
                            type="email"
                            value={state.contact_email || ""}
                            onChange={(e) => updateState({ contact_email: e.target.value })}
                            placeholder={previewPlaceholders.contact_email}
                          />
                        </div>

                        <div className="input-block">
                          <label htmlFor="phoneNumber">Phone Number</label>
                          <input
                            id="phoneNumber"
                            type="tel"
                            value={state.phone_number || ""}
                            onChange={(e) => updateState({ phone_number: e.target.value })}
                            placeholder={previewPlaceholders.phone_number}
                          />
                        </div>
                      </>
                    )}

                    <div className="button-group">
                      <button type="button" onClick={handleResetPage} className="black-button desktop-button">
                        Reset Page
                      </button>
                      <button type="submit" className="blue-button desktop-button">
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
        qrCodeUrl={currentQrCodeUrl}
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
