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
import api from "../../services/api";
import LogoIcon from "../../assets/icons/Logo-Icon.svg";

export default function MyProfile() {
  const { state, updateState, resetState } = useBusinessCardStore();
  const fileInputRef = useRef(null);
  const avatarInputRef = useRef(null);
  const workImageInputRef = useRef(null);
  const createBusinessCard = useCreateBusinessCard();
  const queryClient = useQueryClient();
  const previewWorkCarouselRef = useRef(null);
  const previewServicesCarouselRef = useRef(null);
  const previewReviewsCarouselRef = useRef(null);
  const activeBlobUrlsRef = useRef([]);

  const { user: authUser, loading: authLoading, fetchUser: refetchAuthUser } = useContext(AuthContext);
  const isSubscribed = authUser?.isSubscribed || false;
  const userId = authUser?._id;
  const userEmail = authUser?.email;
  const isUserVerified = authUser?.isVerified;
  const userUsername = authUser?.username;
  const { data: businessCard, isLoading: isCardLoading } = useFetchBusinessCard(userId);

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
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1000);
  const [isSmallMobile, setIsSmallMobile] = useState(window.innerWidth <= 600);

  const [servicesDisplayMode, setServicesDisplayMode] = useState("list");
  const [reviewsDisplayMode, setReviewsDisplayMode] = useState("list");
  const [aboutMeLayout, setAboutMeLayout] = useState("side-by-side");

  const [showMainSection, setShowMainSection] = useState(true);
  const [showAboutMeSection, setShowAboutMeSection] = useState(true);
  const [showWorkSection, setShowWorkSection] = useState(true);
  const [showServicesSection, setShowServicesSection] = useState(true);
  const [showReviewsSection, setShowReviewsSection] = useState(true);
  const [showContactSection, setShowContactSection] = useState(true);

  const location = useLocation();

  const isTrialActive = authUser && authUser.trialExpires && new Date(authUser.trialExpires) > new Date();
  const hasTrialEnded = authUser && authUser.trialExpires && new Date(authUser.trialExpires) <= new Date();

  const hasSavedData = !!businessCard;

  // Only show contact/CTA if we actually have contact info (or placeholders pre-first-save)
  const hasExchangeContact =
    (state.contact_email && state.contact_email.trim()) ||
    (state.phone_number && state.phone_number.trim());

  useEffect(() => {
    let handledRedirect = false;
    const checkSubscriptionStatus = async () => {
      if (authLoading || !authUser) return;
      const queryParams = new URLSearchParams(location.search);
      const paymentSuccess = queryParams.get("payment_success");

      if (paymentSuccess === "true" && !isSubscribed && !handledRedirect) {
        handledRedirect = true;
        if (typeof refetchAuthUser === "function") {
          await refetchAuthUser();
        }
        window.history.replaceState({}, document.title, location.pathname);
        toast.success("Subscription updated successfully!");
      }
    };

    checkSubscriptionStatus();
  }, [location.search, isSubscribed, authLoading, authUser, refetchAuthUser]);

  useEffect(() => {
    const handleResize = () => {
      const currentIsMobile = window.innerWidth <= 1000;
      const currentIsSmallMobile = window.innerWidth <= 600;
      setIsMobile(currentIsMobile);
      setIsSmallMobile(currentIsSmallMobile);
      if (!currentIsMobile && sidebarOpen) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [sidebarOpen]);

  useEffect(() => {
    if (sidebarOpen && isMobile) {
      document.body.classList.add("body-no-scroll");
    } else {
      document.body.classList.remove("body-no-scroll");
    }
  }, [sidebarOpen, isMobile]);

  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown((cooldown) => cooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  useEffect(() => {
    if (!authLoading && authUser && !isUserVerified && userEmail) {
      setShowVerificationPrompt(true);
    } else if (!authLoading && isUserVerified) {
      setShowVerificationPrompt(false);
    }
  }, [authLoading, authUser, isUserVerified, userEmail]);

  // hydrate state from DB
  useEffect(() => {
    if (!isCardLoading) {
      if (businessCard) {
        updateState({
          businessName: businessCard.business_card_name || "",
          pageTheme: businessCard.page_theme || "light",
          pageThemeVariant: businessCard.page_theme_variant || "subtle-light",
          font: businessCard.style || "Inter",

          // NEW: customization bits
          ctaButtonColor: businessCard.cta_button_color || "#111111",
          typographyConfig: businessCard.typography_config || {},
          socialLinks: businessCard.social_links || {
            facebook: "",
            instagram: "",
            tiktok: "",
            linkedin: "",
          },

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
    }
  }, [businessCard, isCardLoading, resetState, updateState]);

  useEffect(() => {
    return () => {
      activeBlobUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

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

  const handleAvatarUpload = (event) => {
    event.preventDefault();
    const file = event.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      updateState({ avatar: createAndTrackBlobUrl(file) });
      setAvatarFile(file);
      setIsAvatarRemoved(false);
    }
  };

  const handleAddWorkImage = (e) => {
    e.preventDefault();
    const files = Array.from(e.target.files || []);
    const newImageFiles = files.filter((file) => file && file.type.startsWith("image/"));
    if (newImageFiles.length === 0) return;

    const newPreviewItems = newImageFiles.map((file) => ({
      file: file,
      preview: createAndTrackBlobUrl(file),
    }));
    updateState({
      workImages: [...state.workImages, ...newPreviewItems],
    });
    setWorkImageFiles((prevFiles) => [...prevFiles, ...newImageFiles]);
  };

  const handleRemoveCoverPhoto = () => {
    const isLocalBlob = state.coverPhoto && state.coverPhoto.startsWith("blob:");
    if (!isLocalBlob && state.coverPhoto) setCoverPhotoRemoved(true);
    else setCoverPhotoRemoved(false);

    if (isLocalBlob) {
      URL.revokeObjectURL(state.coverPhoto);
      activeBlobUrlsRef.current = activeBlobUrlsRef.current.filter((u) => u !== state.coverPhoto);
      setActiveBlobUrls((prev) => prev.filter((url) => url !== state.coverPhoto));
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
      setActiveBlobUrls((prev) => prev.filter((url) => url !== state.avatar));
    }
    updateState({ avatar: null });
    setAvatarFile(null);
  };

  const handleRemoveWorkImage = (indexToRemove) => {
    const removedItem = state.workImages?.[indexToRemove];

    if (removedItem?.preview?.startsWith("blob:")) {
      URL.revokeObjectURL(removedItem.preview);
      activeBlobUrlsRef.current = activeBlobUrlsRef.current.filter((u) => u !== removedItem.preview);
      setActiveBlobUrls((prev) => prev.filter((u) => u !== removedItem.preview));
    }

    const newWorkImages = state.workImages.filter((_, i) => i !== indexToRemove);
    updateState({ workImages: newWorkImages });
  };

  const handleAddService = () => {
    updateState({ services: [...state.services, { name: "", price: "" }] });
  };

  const handleServiceChange = (index, field, value) => {
    const updated = [...state.services];
    updated[index] = { ...updated[index], [field]: value };
    updateState({ services: updated });
  };

  const handleRemoveService = (indexToRemove) => {
    updateState({
      services: state.services.filter((_, index) => index !== indexToRemove),
    });
  };

  const handleAddReview = () => {
    updateState({
      reviews: [...state.reviews, { name: "", text: "", rating: 5 }],
    });
  };

  const handleReviewChange = (index, field, value) => {
    const updated = [...state.reviews];
    if (field === "rating") {
      const parsedRating = parseInt(value);
      updated[index] = {
        ...updated[index],
        [field]: isNaN(parsedRating) ? 0 : Math.min(5, Math.max(0, parsedRating)),
      };
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    updateState({ reviews: updated });
  };

  const handleRemoveReview = (indexToRemove) => {
    updateState({
      reviews: state.reviews.filter((_, index) => index !== indexToRemove),
    });
  };

  const sendVerificationCode = async () => {
    if (!userEmail) {
      toast.error("Email not found. Please log in again.");
      return;
    }
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/resend-code`, { email: userEmail });
      if (res.data.error) {
        toast.error(res.data.error);
      } else {
        toast.success("Verification code sent!");
        setResendCooldown(30);
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Could not resend code.");
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    if (!userEmail) {
      toast.error("Email not found. Cannot verify.");
      return;
    }
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/verify-email`, {
        email: userEmail,
        code: verificationCodeInput,
      });

      if (res.data.error) {
        toast.error(res.data.error);
      } else {
        toast.success("Email verified successfully!");
        setShowVerificationPrompt(false);
        setVerificationCodeCode("");
        refetchAuthUser();
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Verification failed.");
    }
  };

  // --- helpers for deep compare of objects
  const safeJson = (obj) => {
    try {
      return JSON.stringify(obj || {});
    } catch {
      return "{}";
    }
  };

  // detect changes
  const hasProfileChanges = () => {
    if (coverPhotoFile || avatarFile || workImageFiles.length > 0 || coverPhotoRemoved || isAvatarRemoved) {
      return true;
    }

    const originalCard = businessCard || {};
    const normStr = (v) => (v ?? "").toString().trim();
    const normalizeServices = (arr) => (arr || []).map((s) => ({ name: normStr(s.name), price: normStr(s.price) }));
    const normalizeReviews = (arr) =>
      (arr || []).map((r) => ({
        name: normStr(r.name),
        text: normStr(r.text),
        rating: Number.isFinite(r.rating) ? Number(r.rating) : 0,
      }));

    const servicesChanged = (() => {
      const a = normalizeServices(state.services);
      const b = normalizeServices(originalCard.services);
      if (a.length !== b.length) return true;
      for (let i = 0; i < a.length; i++) {
        if (a[i].name !== b[i].name || a[i].price !== b[i].price) return true;
      }
      return false;
    })();

    const reviewsChanged = (() => {
      const a = normalizeReviews(state.reviews);
      const b = normalizeReviews(originalCard.reviews);
      if (a.length !== b.length) return true;
      for (let i = 0; i < a.length; i++) {
        if (a[i].name !== b[i].name || a[i].text !== b[i].text || a[i].rating !== b[i].rating) {
          return true;
        }
      }
      return false;
    })();

    const currentWorks = (state.workImages || [])
      .map((w) => (w?.preview && !w.preview.startsWith("blob:") ? w.preview : null))
      .filter(Boolean);
    const originalWorks = originalCard.works || [];
    const worksChanged = (() => {
      if (currentWorks.length !== originalWorks.length) return true;
      for (let i = 0; i < currentWorks.length; i++) {
        if (currentWorks[i] !== originalWorks[i]) return true;
      }
      return false;
    })();

    const origShowMain = originalCard.show_main_section !== false;
    const origShowAbout = originalCard.show_about_me_section !== false;
    const origShowWork = originalCard.show_work_section !== false;
    const origShowServices = originalCard.show_services_section !== false;
    const origShowReviews = originalCard.show_reviews_section !== false;
    const origShowContact = originalCard.show_contact_section !== false;

    const isStateDifferent =
      state.businessName !== (originalCard.business_card_name || "") ||
      state.pageTheme !== (originalCard.page_theme || "light") ||
      state.pageThemeVariant !== (originalCard.page_theme_variant || "subtle-light") ||
      state.font !== (originalCard.style || "Inter") ||
      state.ctaButtonColor !== (originalCard.cta_button_color || "#111111") ||
      safeJson(state.typographyConfig) !== safeJson(originalCard.typography_config) ||
      safeJson(state.socialLinks) !== safeJson(originalCard.social_links) ||
      state.mainHeading !== (originalCard.main_heading || "") ||
      state.subHeading !== (originalCard.sub_heading || "") ||
      state.job_title !== (originalCard.job_title || "") ||
      state.full_name !== (originalCard.full_name || "") ||
      state.bio !== (originalCard.bio || "") ||
      state.contact_email !== (originalCard.contact_email || "") ||
      state.phone_number !== (originalCard.phone_number || "") ||
      state.workDisplayMode !== (originalCard.work_display_mode || "list") ||
      servicesDisplayMode !== (originalCard.services_display_mode || "list") ||
      reviewsDisplayMode !== (originalCard.reviews_display_mode || "list") ||
      aboutMeLayout !== (originalCard.about_me_layout || "side-by-side") ||
      servicesChanged ||
      reviewsChanged ||
      worksChanged ||
      showMainSection !== origShowMain ||
      showAboutMeSection !== origShowAbout ||
      showWorkSection !== origShowWork ||
      showServicesSection !== origShowServices ||
      showReviewsSection !== origShowReviews ||
      showContactSection !== origShowContact;

    return isStateDifferent;
  };

  const handleSubmit = async (e, fromTrialStart = false) => {
    e.preventDefault();

    if (!isSubscribed && !isTrialActive && !fromTrialStart) {
      toast.error("Please start your free trial to publish your changes.");
      return;
    }

    if (!hasProfileChanges()) {
      if (isSubscribed || isTrialActive) {
        toast.error("You haven't made any changes.");
      } else {
        toast.error("Please start your trial to publish your changes.");
      }
      return;
    }

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
      page_theme_variant: state.pageThemeVariant,
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

      // NEW: customization payloads
      cta_button_color: state.ctaButtonColor,
      typography_config: state.typographyConfig,
      social_links: state.socialLinks,
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
    } catch (error) {
      toast.error(error.response?.data?.error || "Something went wrong while saving. Check console for details.");
    }
  };

  const handleActivateCard = () => toast.info("Activate Card functionality to be defined!");
  const handleShareCard = () => {
    if (!isUserVerified) {
      toast.error("Please verify your email to share your card.");
      return;
    }
    setShowShareModal(true);
  };
  const handleCloseShareModal = () => setShowShareModal(false);

  const handleStartSubscription = async () => {
    try {
      const response = await api.post("/subscribe", {});
      if (response.data && response.data.url) {
        window.location.href = response.data.url;
      } else {
        toast.error("Failed to start subscription. Please try again.");
      }
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to start subscription.");
    }
  };

  const handleResetPage = () => {
    if (window.confirm("Are you sure you want to reset all your changes? This cannot be undone.")) {
      if (businessCard) {
        updateState({
          businessName: businessCard.business_card_name || "",
          pageTheme: businessCard.page_theme || "light",
          pageThemeVariant: businessCard.page_theme_variant || "subtle-light",
          font: businessCard.style || "Inter",

          ctaButtonColor: businessCard.cta_button_color || "#111111",
          typographyConfig: businessCard.typography_config || {},
          socialLinks: businessCard.social_links || {
            facebook: "",
            instagram: "",
            tiktok: "",
            linkedin: "",
          },

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
      } else {
        resetState();
        setShowMainSection(true);
        setShowAboutMeSection(true);
        setShowWorkSection(true);
        setShowServicesSection(true);
        setShowReviewsSection(true);
        setShowContactSection(true);
      }

      setCoverPhotoFile(null);
      setAvatarFile(null);
      setWorkImageFiles([]);
      setCoverPhotoRemoved(false);
      setIsAvatarRemoved(false);
      activeBlobUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      activeBlobUrlsRef.current = [];
      setActiveBlobUrls([]);
      toast.success("Your page has been reset to the last published version.");
    }
  };

  const scrollCarousel = (ref, direction) => {
    if (ref.current) {
      const carousel = ref.current;
      const currentScroll = carousel.scrollLeft;
      const maxScroll = carousel.scrollWidth - carousel.offsetWidth;
      const itemWidth = carousel.offsetWidth;

      let newScrollPosition;
      if (direction === "left") {
        newScrollPosition = currentScroll - itemWidth;
        if (newScrollPosition < 0) newScrollPosition = maxScroll;
      } else {
        newScrollPosition = currentScroll + itemWidth;
        if (newScrollPosition >= maxScroll) newScrollPosition = 0;
      }
      carousel.scrollTo({ left: newScrollPosition, behavior: "smooth" });
    }
  };

  const shouldShowPlaceholders = !hasSavedData;

  const previewFullName = state.full_name || (shouldShowPlaceholders ? previewPlaceholders.full_name : "");
  const previewJobTitle = state.job_title || (shouldShowPlaceholders ? previewPlaceholders.job_title : "");
  const previewBio = state.bio || (shouldShowPlaceholders ? previewPlaceholders.bio : "");
  const previewEmail = state.contact_email || (shouldShowPlaceholders ? previewPlaceholders.contact_email : "");
  const previewPhone = state.phone_number || (shouldShowPlaceholders ? previewPlaceholders.phone_number : "");

  // Cover: show placeholder on fresh accounts; otherwise only show if set
  const previewCoverPhotoSrc = state.coverPhoto ?? (shouldShowPlaceholders ? previewPlaceholders.coverPhoto : "");
  const previewAvatarSrc = state.avatar ?? (shouldShowPlaceholders ? previewPlaceholders.avatar : null);

  // Work images placeholders still OK for fresh accounts
  const previewWorkImages =
    (state.workImages && state.workImages.length > 0) ? state.workImages : (shouldShowPlaceholders ? previewPlaceholders.workImages : []);

  const currentQrCodeUrl = businessCard?.qrCodeUrl || "";

  const getEditorImageSrc = (imageState, placeholderImage) => imageState || (shouldShowPlaceholders ? placeholderImage : "");
  const showAddImageText = (imageState) => !imageState;

  const isDarkMode = state.pageTheme === "dark";

  // Background colour preview by theme + variant
  const backgroundColor = (() => {
    if (state.pageTheme === "dark") {
      return state.pageThemeVariant === "pure-dark" ? "#000000" : "#111111";
    }
    // light
    return state.pageThemeVariant === "pure-light" ? "#FFFFFF" : "#F7F7F7";
  })();

  // Inline typography styles (fallback to defaults if not set)
  const tcfg = state.typographyConfig || {};
  const h1Style = {
    fontSize: tcfg?.mainHeading?.size ? `${tcfg.mainHeading.size}px` : undefined,
    fontWeight: tcfg?.mainHeading?.weight,
    color: tcfg?.mainHeading?.color,
  };
  const h2Style = {
    fontSize: tcfg?.subHeading?.size ? `${tcfg.subHeading.size}px` : undefined,
    fontWeight: tcfg?.subHeading?.weight,
    color: tcfg?.subHeading?.color,
  };
  const bioStyle = {
    fontSize: tcfg?.bio?.size ? `${tcfg.bio.size}px` : undefined,
    fontWeight: tcfg?.bio?.weight,
    color: tcfg?.bio?.color,
  };

  return (
    <div className={`app-layout ${sidebarOpen ? "sidebar-active" : ""}`}>
      <div className="myprofile-mobile-header">
        <Link to="/myprofile" className="myprofile-logo-link">
          <img src={LogoIcon} alt="Logo" className="myprofile-logo" />
        </Link>
        <div className={`sidebar-menu-toggle ${sidebarOpen ? "active" : ""}`} onClick={() => setSidebarOpen(!sidebarOpen)}>
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>

      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {sidebarOpen && isMobile && <div className="sidebar-overlay active" onClick={() => setSidebarOpen(false)}></div>}

      <main className="main-content-container">
        <PageHeader
          title={"My Profile"}
          onActivateCard={() => toast.info("Activate Card functionality to be defined!")}
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
                    <span role="img" aria-label="warning">
                      ⚠️
                    </span>
                    Your email is not verified!
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
                  <p>Publish your own live website in minutes for 14 days free.</p>
                  <button className="blue-button" onClick={(e) => handleSubmit(e, true)}>
                    Get Started
                  </button>
                </div>
              )}

              {isTrialActive && (
                <div className="trial-countdown-banner">
                  <p>
                    Your free trial ends on {new Date(authUser.trialExpires).toLocaleDateString()}. <Link to="/subscription">Subscribe now!</Link>
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
                <div className={`myprofile-content ${isMobile ? "myprofile-mock-phone-mobile-container" : ""}`}>
                  <div
                    className={`mock-phone mobile-preview ${isDarkMode ? "dark-mode" : ""}`}
                    style={{
                      fontFamily: state.font || previewPlaceholders.font,
                      backgroundColor,
                    }}
                  >
                    <div className="mock-phone-scrollable-content">
                      {showMainSection && (
                        <>
                          {(shouldShowPlaceholders || !!state.coverPhoto) && (
                            <img src={previewCoverPhotoSrc} alt="Cover" className="mock-cover" />
                          )}

                          <h2 className="mock-title" style={h1Style}>
                            {state.mainHeading || (!hasSavedData ? previewPlaceholders.main_heading : "Your Main Heading Here")}
                          </h2>
                          <p className="mock-subtitle" style={h2Style}>
                            {state.subHeading || (!hasSavedData ? previewPlaceholders.sub_heading : "Your Tagline or Slogan Goes Here")}
                          </p>

                          {(shouldShowPlaceholders || hasExchangeContact) && (
                            <button type="button" className="mock-button" style={{ backgroundColor: state.ctaButtonColor }}>
                              Save My Number
                            </button>
                          )}
                        </>
                      )}

                      {showAboutMeSection && (previewFullName || previewJobTitle || previewBio || previewAvatarSrc) && (
                        <>
                          <p className="mock-section-title">About me</p>
                          <div className={`mock-about-container ${aboutMeLayout}`}>
                            <div className="mock-about-content-group">
                              <div className="mock-about-header-group">
                                {previewAvatarSrc && <img src={previewAvatarSrc} alt="Avatar" className="mock-avatar" />}
                                <div>
                                  <p className="mock-profile-name">{previewFullName}</p>
                                  <p className="mock-profile-role">{previewJobTitle}</p>
                                </div>
                              </div>
                              <p className="mock-bio-text" style={bioStyle}>
                                {previewBio}
                              </p>
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
                              {(shouldShowPlaceholders ? previewPlaceholders.reviews : state.reviews).map((r, i) => (
                                <div key={i} className="mock-review-card">
                                  <div className="mock-star-rating">
                                    {Array(r.rating || 0)
                                      .fill()
                                      .map((_, starIdx) => (
                                        <span key={`filled-${starIdx}`}>★</span>
                                      ))}
                                    {Array(Math.max(0, 5 - (r.rating || 0)))
                                      .fill()
                                      .map((_, starIdx) => (
                                        <span key={`empty-${starIdx}`} className="empty-star">
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

                            {/* Optional: show social links if provided */}
                            {(state.socialLinks?.facebook ||
                              state.socialLinks?.instagram ||
                              state.socialLinks?.tiktok ||
                              state.socialLinks?.linkedin) && (
                                <div className="mock-contact-item">
                                  <p className="mock-contact-label">Social:</p>
                                  <div className="mock-contact-value">
                                    {state.socialLinks.facebook && (
                                      <a href={state.socialLinks.facebook} target="_blank" rel="noreferrer">
                                        Facebook
                                      </a>
                                    )}
                                    {state.socialLinks.instagram && (
                                      <>
                                        {" · "}
                                        <a href={state.socialLinks.instagram} target="_blank" rel="noreferrer">
                                          Instagram
                                        </a>
                                      </>
                                    )}
                                    {state.socialLinks.tiktok && (
                                      <>
                                        {" · "}
                                        <a href={state.socialLinks.tiktok} target="_blank" rel="noreferrer">
                                          TikTok
                                        </a>
                                      </>
                                    )}
                                    {state.socialLinks.linkedin && (
                                      <>
                                        {" · "}
                                        <a href={state.socialLinks.linkedin} target="_blank" rel="noreferrer">
                                          LinkedIn
                                        </a>
                                      </>
                                    )}
                                  </div>
                                </div>
                              )}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="myprofile-form">
                  <form onSubmit={handleSubmit}>
                    <div className="form-group">
                      <label>Business Name</label>
                      <input
                        type="text"
                        value={state.businessName}
                        onChange={(e) => updateState({ businessName: e.target.value })}
                      />
                    </div>

                    {/* Theme */}
                    <div className="form-group">
                      <label>Theme</label>
                      <select
                        value={state.pageTheme}
                        onChange={(e) => {
                          const newTheme = e.target.value;
                          updateState({
                            pageTheme: newTheme,
                            pageThemeVariant:
                              newTheme === "light" ? "subtle-light" : "subtle-dark",
                          });
                        }}
                      >
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                      </select>
                    </div>

                    {/* Theme Variant */}
                    <div className="form-group">
                      <label>Background Variant</label>
                      <select
                        value={state.pageThemeVariant}
                        onChange={(e) => updateState({ pageThemeVariant: e.target.value })}
                      >
                        {state.pageTheme === "light" ? (
                          <>
                            <option value="pure-light">Pure White</option>
                            <option value="subtle-light">Subtle White</option>
                          </>
                        ) : (
                          <>
                            <option value="pure-dark">Pure Black</option>
                            <option value="subtle-dark">Subtle Black</option>
                          </>
                        )}
                      </select>
                    </div>

                    {/* Fonts */}
                    <div className="form-group">
                      <label>Font</label>
                      <select
                        value={state.font}
                        onChange={(e) => updateState({ font: e.target.value })}
                      >
                        <option value="Inter">Inter</option>
                        <option value="Roboto">Roboto</option>
                        <option value="Open Sans">Open Sans</option>
                        <option value="Lora">Lora</option>
                        <option value="Work Sans">Work Sans</option>
                      </select>
                    </div>

                    {/* CTA Button Colour */}
                    <div className="form-group">
                      <label>Save My Contact Button Colour</label>
                      <input
                        type="color"
                        value={state.ctaButtonColor}
                        onChange={(e) => updateState({ ctaButtonColor: e.target.value })}
                      />
                    </div>

                    {/* Typography controls */}
                    <fieldset className="form-group">
                      <legend>Typography</legend>

                      {["mainHeading", "subHeading", "bio"].map((field) => (
                        <div key={field} className="typography-control">
                          <label>{field}</label>
                          <input
                            type="number"
                            placeholder="Size (px)"
                            value={state.typographyConfig?.[field]?.size || ""}
                            onChange={(e) =>
                              updateState({
                                typographyConfig: {
                                  ...state.typographyConfig,
                                  [field]: {
                                    ...state.typographyConfig?.[field],
                                    size: e.target.value,
                                  },
                                },
                              })
                            }
                          />
                          <select
                            value={state.typographyConfig?.[field]?.weight || ""}
                            onChange={(e) =>
                              updateState({
                                typographyConfig: {
                                  ...state.typographyConfig,
                                  [field]: {
                                    ...state.typographyConfig?.[field],
                                    weight: e.target.value,
                                  },
                                },
                              })
                            }
                          >
                            <option value="">Default Weight</option>
                            <option value="300">Light</option>
                            <option value="400">Normal</option>
                            <option value="500">Medium</option>
                            <option value="600">Semi-bold</option>
                            <option value="700">Bold</option>
                          </select>
                          <input
                            type="color"
                            value={state.typographyConfig?.[field]?.color || "#000000"}
                            onChange={(e) =>
                              updateState({
                                typographyConfig: {
                                  ...state.typographyConfig,
                                  [field]: {
                                    ...state.typographyConfig?.[field],
                                    color: e.target.value,
                                  },
                                },
                              })
                            }
                          />
                        </div>
                      ))}
                    </fieldset>

                    {/* Social media */}
                    <fieldset className="form-group">
                      <legend>Social Media Links</legend>
                      {["facebook", "instagram", "tiktok", "linkedin"].map((platform) => (
                        <div key={platform} className="social-input">
                          <label>{platform.charAt(0).toUpperCase() + platform.slice(1)}</label>
                          <input
                            type="url"
                            placeholder={`https://${platform}.com/yourprofile`}
                            value={state.socialLinks?.[platform] || ""}
                            onChange={(e) =>
                              updateState({
                                socialLinks: {
                                  ...state.socialLinks,
                                  [platform]: e.target.value,
                                },
                              })
                            }
                          />
                        </div>
                      ))}
                    </fieldset>

                    <div className="form-actions">
                      <button
                        type="submit"
                        className="blue-button"
                        disabled={createBusinessCard.isLoading}
                      >
                        {createBusinessCard.isLoading ? "Saving..." : "Save Changes"}
                      </button>
                      <button
                        type="button"
                        className="grey-button"
                        onClick={handleResetPage}
                      >
                        Reset
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      {showShareModal && (
        <ShareProfile
          onClose={handleCloseShareModal}
          profileUrl={`${window.location.origin}/profile/${userUsername}`}
          qrCodeUrl={currentQrCodeUrl}
        />
      )}
    </div>
  );
}
