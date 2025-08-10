import React, { useRef, useEffect, useState, useContext } from "react";
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from "../../components/Sidebar";
import PageHeader from "../../components/PageHeader";
import useBusinessCardStore, { previewPlaceholders } from "../../store/businessCardStore";
import { useQueryClient } from "@tanstack/react-query";
import { useFetchBusinessCard, } from "../../hooks/useFetchBusinessCard";
import { useCreateBusinessCard, buildBusinessCardFormData, } from "../../hooks/useCreateBiz";
import axios from 'axios';
import { toast } from 'react-hot-toast';
import ShareProfile from "../../components/ShareProfile";
import { AuthContext } from '../../components/AuthContext';
import api from '../../services/api';
import LogoIcon from '../../assets/icons/Logo-Icon.svg';

export default function MyProfile() {
  const { state, updateState, resetState } = useBusinessCardStore();
  const fileInputRef = useRef(null);
  const avatarInputRef = useRef(null);
  const workImageInputRef = useRef(null);
  const createBusinessCard = useCreateBusinessCard();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const workCarouselRef = useRef(null);
  const previewWorkCarouselRef = useRef(null);
  const servicesCarouselRef = useRef(null);
  const previewServicesCarouselRef = useRef(null);
  const reviewsCarouselRef = useRef(null);
  const previewReviewsCarouselRef = useRef(null);

  const { user: authUser, loading: authLoading, fetchUser: refetchAuthUser } = useContext(AuthContext);
  const isSubscribed = authUser?.isSubscribed || false;
  const userId = authUser?._id;
  const userEmail = authUser?.email;
  const isUserVerified = authUser?.isVerified;
  const userUsername = authUser?.username;
  const { data: businessCard, isLoading: isCardLoading, refetch: refetchBusinessCard } = useFetchBusinessCard(userId);
  const [showVerificationPrompt, setShowVerificationPrompt] = useState(false);
  const [verificationCodeInput, setVerificationCodeCode] = useState('');
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
  const [hasAttemptedSave, setHasAttemptedSave] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const [servicesDisplayMode, setServicesDisplayMode] = useState('list');
  const [reviewsDisplayMode, setReviewsDisplayMode] = useState('list');
  const [aboutMeLayout, setAboutMeLayout] = useState('side-by-side');

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

  useEffect(() => {
    let handledRedirect = false;
    const checkSubscriptionStatus = async () => {
      if (authLoading || !authUser) {
        return;
      }
      const queryParams = new URLSearchParams(location.search);
      const paymentSuccess = queryParams.get('payment_success');

      if (paymentSuccess === 'true' && !isSubscribed && !handledRedirect) {
        handledRedirect = true;
        if (typeof refetchAuthUser === 'function') {
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

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [sidebarOpen]);

  useEffect(() => {
    if (sidebarOpen && isMobile) {
      document.body.classList.add('body-no-scroll');
    } else {
      document.body.classList.remove('body-no-scroll');
    }
  }, [sidebarOpen, isMobile]);

  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown(cooldown => cooldown - 1), 1000);
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

  useEffect(() => {
    if (!isCardLoading) {
      if (businessCard) {
        updateState({
          businessName: businessCard.business_card_name || '',
          pageTheme: businessCard.page_theme || 'light',
          font: businessCard.style || 'Inter',
          mainHeading: businessCard.main_heading || '',
          subHeading: businessCard.sub_heading || '',
          job_title: businessCard.job_title || '',
          full_name: businessCard.full_name || '',
          bio: businessCard.bio || '',
          avatar: businessCard.avatar || null,
          coverPhoto: businessCard.cover_photo || null,
          workImages: (businessCard.works || []).map(url => ({ file: null, preview: url })),
          services: businessCard.services || [],
          reviews: businessCard.reviews || [],
          contact_email: businessCard.contact_email || '',
          phone_number: businessCard.phone_number || '',
          workDisplayMode: businessCard.work_display_mode || 'list',
        });
        setServicesDisplayMode(businessCard.services_display_mode || 'list');
        setReviewsDisplayMode(businessCard.reviews_display_mode || 'list');
        setAboutMeLayout(businessCard.about_me_layout || 'side-by-side');

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
        setServicesDisplayMode('list');
        setReviewsDisplayMode('list');
        setAboutMeLayout('side-by-side');
        setShowMainSection(true);
        setShowAboutMeSection(true);
        setShowWorkSection(true);
        setShowServicesSection(true);
        setShowReviewsSection(true);
        setShowContactSection(true);
      }
    }
  }, [businessCard, isCardLoading]);


  useEffect(() => {
    return () => {
      activeBlobUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [activeBlobUrls]);

  const createAndTrackBlobUrl = (file) => {
    const blobUrl = URL.createObjectURL(file);
    setActiveBlobUrls(prev => [...prev, blobUrl]);
    return blobUrl;
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
    const newImageFiles = files.filter(file => file && file.type.startsWith("image/"));
    if (newImageFiles.length === 0) {
      return;
    }
    const newPreviewItems = newImageFiles.map(file => ({
      file: file,
      preview: createAndTrackBlobUrl(file),
    }));
    updateState({
      workImages: [...state.workImages, ...newPreviewItems],
    });
    setWorkImageFiles(prevFiles => [...prevFiles, ...newImageFiles]);
  };

  const handleRemoveCoverPhoto = () => {
    const isLocalBlob = state.coverPhoto && state.coverPhoto.startsWith('blob:');
    if (!isLocalBlob && state.coverPhoto) {
      setCoverPhotoRemoved(true);
    } else {
      setCoverPhotoRemoved(false);
    }

    if (isLocalBlob) {
      URL.revokeObjectURL(state.coverPhoto);
      setActiveBlobUrls(prev => prev.filter(url => url !== state.coverPhoto));
    }
    updateState({ coverPhoto: null });
    setCoverPhotoFile(null);
  };

  const handleRemoveAvatar = () => {
    const isLocalBlob = state.avatar && state.avatar.startsWith('blob:');
    if (!isLocalBlob && state.avatar) {
      setIsAvatarRemoved(true);
    } else {
      setIsAvatarRemoved(false);
    }

    if (isLocalBlob) {
      URL.revokeObjectURL(state.avatar);
      setActiveBlobUrls(prev => prev.filter(url => url !== state.avatar));
    }
    updateState({ avatar: null });
    setAvatarFile(null);
  };

  const handleRemoveWorkImage = (indexToRemove) => {
    const removedItem = state.workImages?.[indexToRemove];

    if (removedItem?.preview?.startsWith('blob:')) {
      URL.revokeObjectURL(removedItem.preview);
      setActiveBlobUrls(prev => prev.filter(url => url !== removedItem.preview));
    }

    const newWorkImages = state.workImages.filter((_, index) => index !== indexToRemove);
    updateState({ workImages: newWorkImages });

    setWorkImageFiles(prevFiles => prevFiles.filter(f => f !== removedItem.file));
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
    if (field === 'rating') {
      const parsedRating = parseInt(value);
      updated[index] = { ...updated[index], [field]: isNaN(parsedRating) ? 0 : Math.min(5, Math.max(0, parsedRating)) };
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
        toast.success('Verification code sent!');
        setResendCooldown(30);
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not resend code.');
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
        toast.success('Email verified successfully!');
        setShowVerificationPrompt(false);
        setVerificationCodeCode('');
        refetchAuthUser();
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Verification failed.');
    }
  };

  const handleStartTrialAndSave = async (e) => {
    if (!userId) {
      toast.error("User not loaded. Please log in again.");
      return;
    }

    try {
      const trialResponse = await api.post('/start-trial');
      if (trialResponse.data.success) {
        toast.success("14-day free trial started successfully!");
        await refetchAuthUser();
        await handleSubmit(e, true);
      }
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to start trial.");
    }
  };

  const hasProfileChanges = () => {
    if (coverPhotoFile || avatarFile || workImageFiles.length > 0 || coverPhotoRemoved || isAvatarRemoved) {
      return true;
    }

    const originalCard = businessCard || {};
    const isStateDifferent = (
      state.businessName !== (originalCard.business_card_name || '') ||
      state.pageTheme !== (originalCard.page_theme || 'light') ||
      state.font !== (originalCard.style || 'Inter') ||
      state.mainHeading !== (originalCard.main_heading || '') ||
      state.subHeading !== (originalCard.sub_heading || '') ||
      state.job_title !== (originalCard.job_title || '') ||
      state.full_name !== (originalCard.full_name || '') ||
      state.bio !== (originalCard.bio || '') ||
      state.contact_email !== (originalCard.contact_email || '') ||
      state.phone_number !== (originalCard.phone_number || '') ||
      state.services.length !== (originalCard.services?.length || 0) ||
      state.reviews.length !== (originalCard.reviews?.length || 0) ||
      state.workImages.length !== (originalCard.works?.length || 0) ||
      state.workDisplayMode !== (originalCard.work_display_mode || 'list') ||
      servicesDisplayMode !== (originalCard.services_display_mode || 'list') ||
      reviewsDisplayMode !== (originalCard.reviews_display_mode || 'list') ||
      aboutMeLayout !== (originalCard.about_me_layout || 'side-by-side')
    );
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
      .map(item => {
        if (item.file) {
          return { file: item.file };
        } else if (item.preview && !item.preview.startsWith('blob:')) {
          return item.preview;
        }
        return null;
      })
      .filter(item => item !== null);

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
      services: state.services.filter(s => s.name || s.price),
      reviews: state.reviews.filter(r => r.name || r.text),
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
      queryClient.invalidateQueries(['businessCard', userId]);
      setCoverPhotoFile(null);
      setAvatarFile(null);
      setWorkImageFiles([]);
      setCoverPhotoRemoved(false);
      setIsAvatarRemoved(false);
      activeBlobUrls.forEach(url => URL.revokeObjectURL(url));
      setActiveBlobUrls([]);
    } catch (error) {
      toast.error(error.response?.data?.error || "Something went wrong while saving. Check console for details.");
    }
  };

  const handleActivateCard = () => {
    toast.info("Activate Card functionality to be defined!");
  };

  const handleShareCard = () => {
    if (!isUserVerified) {
      toast.error("Please verify your email to share your card.");
      return;
    }
    setShowShareModal(true);
  };

  const handleCloseShareModal = () => {
    setShowShareModal(false);
  };

  const handleStartSubscription = async () => {
    try {
      const response = await api.post('/subscribe', {});
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
          businessName: businessCard.business_card_name || '',
          pageTheme: businessCard.page_theme || 'light',
          font: businessCard.style || 'Inter',
          mainHeading: businessCard.main_heading || '',
          subHeading: businessCard.sub_heading || '',
          job_title: businessCard.job_title || '',
          full_name: businessCard.full_name || '',
          bio: businessCard.bio || '',
          avatar: businessCard.avatar || null,
          coverPhoto: businessCard.cover_photo || null,
          workImages: (businessCard.works || []).map(url => ({ file: null, preview: url })),
          services: (businessCard.services || []),
          reviews: (businessCard.reviews || []),
          contact_email: businessCard.contact_email || '',
          phone_number: businessCard.phone_number || '',
          workDisplayMode: businessCard.work_display_mode || 'list',
        });
        setServicesDisplayMode(businessCard.services_display_mode || 'list');
        setReviewsDisplayMode(businessCard.reviews_display_mode || 'list');
        setAboutMeLayout(businessCard.about_me_layout || 'side-by-side');
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
      activeBlobUrls.forEach(url => URL.revokeObjectURL(url));
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

      if (direction === 'left') {
        newScrollPosition = currentScroll - itemWidth;
        if (newScrollPosition < 0) {
          newScrollPosition = maxScroll;
        }
      } else {
        newScrollPosition = currentScroll + itemWidth;
        if (newScrollPosition >= maxScroll) {
          newScrollPosition = 0;
        }
      }

      carousel.scrollTo({
        left: newScrollPosition,
        behavior: 'smooth'
      });
    }
  };

  // --- START: CORRECTED PREVIEW LOGIC & IMAGE SWAP ---

  // This checks if we should show placeholders at all
  const shouldShowPlaceholders = !hasSavedData;

  // Determine preview text source based on whether a user has saved data or not
  const previewMainHeading = state.mainHeading || (shouldShowPlaceholders ? previewPlaceholders.main_heading : '');
  const previewSubHeading = state.subHeading || (shouldShowPlaceholders ? previewPlaceholders.sub_heading : '');
  const previewFullName = state.full_name || (shouldShowPlaceholders ? previewPlaceholders.full_name : '');
  const previewJobTitle = state.job_title || (shouldShowPlaceholders ? previewPlaceholders.job_title : '');
  const previewBio = state.bio || (shouldShowPlaceholders ? previewPlaceholders.bio : '');
  const previewEmail = state.contact_email || (shouldShowPlaceholders ? previewPlaceholders.contact_email : '');
  const previewPhone = state.phone_number || (shouldShowPlaceholders ? previewPlaceholders.phone_number : '');

  // Image Swap Logic
  let previewCoverPhotoSrc = '';
  let previewAvatarSrc = '';
  let previewWorkImages = [];

  if (shouldShowPlaceholders) {
    // Before first save, show all template placeholders
    previewCoverPhotoSrc = previewPlaceholders.coverPhoto;
    previewAvatarSrc = previewPlaceholders.avatar;
    previewWorkImages = previewPlaceholders.workImages;
  } else {
    // After first save, check for a user-uploaded cover photo
    // and swap it with the first work image if both exist.

    // Use the first work image for the cover photo if it exists, otherwise use the saved cover photo.
    previewCoverPhotoSrc = state.workImages.length > 0 ? state.workImages[0].preview : state.coverPhoto;

    // Use the saved cover photo for the first work image if it exists.
    // The rest of the work images stay the same.
    if (state.coverPhoto && state.workImages.length > 0) {
      previewWorkImages = [{ preview: state.coverPhoto }, ...state.workImages.slice(1)];
    } else {
      previewWorkImages = state.workImages;
    }

    // The avatar and other images are not part of the swap, so they use the saved data directly.
    previewAvatarSrc = state.avatar;
  }
  // --- END: CORRECTED PREVIEW LOGIC & IMAGE SWAP ---

  const currentProfileUrl = userUsername ? `https://www.konarcard.com/u/${userUsername}` : '';
  const currentQrCodeUrl = businessCard?.qrCodeUrl || '';

  const contactDetailsForVCard = {
    full_name: businessCard?.full_name || '',
    job_title: businessCard?.job_title || '',
    business_card_name: businessCard?.business_card_name || '',
    bio: businessCard?.bio || '',
    isSubscribed: businessCard?.isSubscribed || false,
    contact_email: businessCard?.contact_email || '',
    phone_number: businessCard?.phone_number || '',
    username: userUsername || '',
  };

  const getEditorImageSrc = (imageState, placeholderImage) => {
    // The editor should only show placeholders if the user has no saved data yet.
    return imageState || (shouldShowPlaceholders ? placeholderImage : '');
  };

  const showAddImageText = (imageState) => {
    return !imageState;
  };

  const shouldBlurEditor = !isSubscribed && hasTrialEnded;
  const isDarkMode = state.pageTheme === "dark";

  return (
    <div className={`app-layout ${sidebarOpen ? 'sidebar-active' : ''}`}>
      <div className="myprofile-mobile-header">
        <Link to="/myprofile" className="myprofile-logo-link">
          <img src={LogoIcon} alt="Logo" className="myprofile-logo" />
        </Link>
        <div
          className={`sidebar-menu-toggle ${sidebarOpen ? 'active' : ''}`}
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>

      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {sidebarOpen && isMobile && (
        <div className="sidebar-overlay active" onClick={() => setSidebarOpen(false)}></div>
      )}

      <main className="main-content-container">
        <PageHeader
          title={"My Profile"}
          onActivateCard={handleActivateCard}
          onShareCard={handleShareCard}
          isMobile={isMobile}
          isSmallMobile={isSmallMobile}
        />

        <div className="myprofile-main-content">
          {!authLoading && !authUser && (
            <div className="content-card-box error-state">
              <p>User not loaded. Please ensure you are logged in.</p>
              <button onClick={() => window.location.href = '/login'}>Go to Login</button>
            </div>
          )}

          {!authLoading && authUser && (
            <>
              {showVerificationPrompt && (
                <div className="content-card-box verification-prompt">
                  <p>
                    <span role="img" aria-label="warning">⚠️</span>
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
                    <button type="submit">
                      Verify Email
                    </button>
                    <button
                      type="button"
                      onClick={sendVerificationCode}
                      disabled={resendCooldown > 0}
                    >
                      {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
                    </button>
                  </form>
                </div>
              )}

              {!isSubscribed && !isTrialActive && (
                <div className="trial-not-started-banner">
                  <p>Publish your own live website in minutes for 14 days free.</p>
                  <button className="blue-button" onClick={handleStartTrialAndSave}>
                    Get Started
                  </button>
                </div>
              )}

              {isTrialActive && (
                <div className="trial-countdown-banner">
                  <p>Your free trial ends on {new Date(authUser.trialExpires).toLocaleDateString()}. <Link to="/subscription">Subscribe now!</Link></p>
                </div>
              )}

              {hasTrialEnded && !isSubscribed && (
                <div className="trial-ended-banner">
                  <p>Your free trial has ended. <Link to="/subscription">Subscribe now</Link> to prevent your profile from being deleted.</p>
                </div>
              )}

              <div className="myprofile-flex-container">
                <div className={`myprofile-content ${isMobile ? 'myprofile-mock-phone-mobile-container' : ''}`}>
                  <div
                    className={`mock-phone ${isDarkMode ? "dark-mode" : ""}`}
                    style={{
                      fontFamily: state.font || previewPlaceholders.font
                    }}
                  >
                    <div className="mock-phone-scrollable-content">
                      {showMainSection && (
                        <>
                          <img
                            src={previewCoverPhotoSrc}
                            alt="Cover"
                            className="mock-cover"
                          />

                          <h2 className="mock-title">
                            {previewMainHeading}
                          </h2>
                          <p className="mock-subtitle">
                            {previewSubHeading}
                          </p>
                          <button
                            type="button"
                            className="mock-button"
                          >
                            Exchange Contact
                          </button>
                        </>
                      )}

                      {showAboutMeSection && (previewFullName || previewJobTitle || previewBio || previewAvatarSrc) && (
                        <>
                          <p className="mock-section-title">About me</p>
                          <div className={`mock-about-container ${aboutMeLayout}`}>
                            <div className="mock-about-content-group">
                              <div className="mock-about-header-group">
                                <img
                                  src={previewAvatarSrc}
                                  alt="Avatar"
                                  className="mock-avatar"
                                />
                                <div>
                                  <p className="mock-profile-name">
                                    {previewFullName}
                                  </p>
                                  <p className="mock-profile-role">
                                    {previewJobTitle}
                                  </p>
                                </div>
                              </div>
                              <p className="mock-bio-text">
                                {previewBio}
                              </p>
                            </div>
                          </div>
                        </>
                      )}

                      {showWorkSection && (previewWorkImages.length > 0) && (
                        <>
                          <p className="mock-section-title">My Work</p>
                          <div className="work-preview-row-container">
                            {state.workDisplayMode === 'carousel' && (
                              <div className="carousel-nav-buttons">
                                <button
                                  type="button"
                                  className="carousel-nav-button left-arrow"
                                  onClick={() => scrollCarousel(previewWorkCarouselRef, 'left')}
                                >
                                  &#9664;
                                </button>
                                <button
                                  type="button"
                                  className="carousel-nav-button right-arrow"
                                  onClick={() => scrollCarousel(previewWorkCarouselRef, 'right')}
                                >
                                  &#9654;
                                </button>
                              </div>
                            )}
                            <div ref={previewWorkCarouselRef} className={`mock-work-gallery ${state.workDisplayMode}`}>
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

                      {showServicesSection && (state.services.length > 0 || !hasSavedData) && (
                        <>
                          <p className="mock-section-title">My Services</p>
                          <div className="work-preview-row-container">
                            {servicesDisplayMode === 'carousel' && (
                              <div className="carousel-nav-buttons">
                                <button
                                  type="button"
                                  className="carousel-nav-button left-arrow"
                                  onClick={() => scrollCarousel(previewServicesCarouselRef, 'left')}
                                >
                                  &#9664;
                                </button>
                                <button
                                  type="button"
                                  className="carousel-nav-button right-arrow"
                                  onClick={() => scrollCarousel(previewServicesCarouselRef, 'right')}
                                >
                                  &#9654;
                                </button>
                              </div>
                            )}
                            <div ref={previewServicesCarouselRef} className={`mock-services-list ${servicesDisplayMode}`}>
                              {(shouldShowPlaceholders
                                ? previewPlaceholders.services
                                : state.services
                              ).map((s, i) => (
                                <div key={i} className="mock-service-item">
                                  <p className="mock-service-name">
                                    {s.name}
                                  </p>
                                  <span className="mock-service-price">
                                    {s.price}
                                  </span>
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
                            {reviewsDisplayMode === 'carousel' && (
                              <div className="carousel-nav-buttons">
                                <button
                                  type="button"
                                  className="carousel-nav-button left-arrow"
                                  onClick={() => scrollCarousel(previewReviewsCarouselRef, 'left')}
                                >
                                  &#9664;
                                </button>
                                <button
                                  type="button"
                                  className="carousel-nav-button right-arrow"
                                  onClick={() => scrollCarousel(previewReviewsCarouselRef, 'right')}
                                >
                                  &#9654;
                                </button>
                              </div>
                            )}
                            <div ref={previewReviewsCarouselRef} className={`mock-reviews-list ${reviewsDisplayMode}`}>
                              {(shouldShowPlaceholders
                                ? previewPlaceholders.reviews
                                : state.reviews
                              ).map((r, i) => (
                                <div key={i} className="mock-review-card">
                                  <div className="mock-star-rating">
                                    {Array(r.rating || 0).fill().map((_, starIdx) => (
                                      <span key={`filled-${starIdx}`}>★</span>
                                    ))}
                                    {Array(Math.max(0, 5 - (r.rating || 0))).fill().map((_, starIdx) => (
                                      <span key={`empty-${starIdx}`} className="empty-star">★</span>
                                    ))}
                                  </div>
                                  <p className="mock-review-text">
                                    {`"${r.text}"`}
                                  </p>
                                  <p className="mock-reviewer-name">
                                    {r.name}
                                  </p>
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
                              <p className="mock-contact-value">
                                {previewEmail}
                              </p>
                            </div>
                            <div className="mock-contact-item">
                              <p className="mock-contact-label">Phone:</p>
                              <p className="mock-contact-value">
                                {previewPhone}
                              </p>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="myprofile-editor-wrapper">
                  {shouldBlurEditor && (
                    <div className="subscription-overlay">
                      <div className="subscription-message">
                        <p className="desktop-h4">Subscription Required</p>
                        <p className="desktop-h6">Your free trial has ended. Please subscribe to continue editing your profile.</p>
                        <button className="blue-button" onClick={handleStartSubscription}>
                          Go to Subscription
                        </button>
                      </div>
                    </div>

                  )}

                  <form onSubmit={handleSubmit} className="myprofile-editor" style={{ filter: shouldBlurEditor ? 'blur(5px)' : 'none', pointerEvents: shouldBlurEditor ? 'none' : 'auto' }}>
                    <h2 className="editor-title">Create Your Digital Business Card</h2>

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

                    <div className="input-block">
                      <label>Font</label>
                      <div className="option-row">
                        {["Inter", "Montserrat", "Poppins"].map((font) => (
                          <button
                            type="button"
                            key={font}
                            className={`font-button ${state.font === font ? "is-active" : ""}`}
                            onClick={() => updateState({ font })}
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
                        {showMainSection ? 'Hide Section' : 'Show Section'}
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
                            className="image-upload-area cover-photo-upload"
                            onClick={() => fileInputRef.current.click()}
                          >
                            {showAddImageText(state.coverPhoto) && <span className="upload-text">Add Cover Photo</span>}
                            <img
                              src={getEditorImageSrc(state.coverPhoto, previewPlaceholders.coverPhoto)}
                              alt="Cover"
                              className="cover-preview"
                            />
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
                        </div>

                        <div className="input-block">
                          <label htmlFor="mainHeading">Main Heading</label>
                          <input
                            id="mainHeading"
                            type="text"
                            value={state.mainHeading || ''}
                            onChange={(e) => updateState({ mainHeading: e.target.value })}
                            placeholder={previewPlaceholders.mainHeading}
                          />
                        </div>

                        <div className="input-block">
                          <label htmlFor="subHeading">Subheading</label>
                          <input
                            id="subHeading"
                            type="text"
                            value={state.subHeading || ''}
                            onChange={(e) => updateState({ subHeading: e.target.value })}
                            placeholder={previewPlaceholders.subHeading}
                          />
                        </div>
                      </>
                    )}

                    <hr className="divider" />
                    <div className="editor-section-header">
                      <h3 className="editor-subtitle">About Me Section</h3>
                      <button type="button" onClick={() => setShowAboutMeSection(!showAboutMeSection)} className="toggle-button">
                        {showAboutMeSection ? 'Hide Section' : 'Show Section'}
                      </button>
                    </div>
                    {showAboutMeSection && (
                      <>
                        <div className="input-block">
                          <label>Display Layout</label>
                          <div className="option-row">
                            <button
                              type="button"
                              className={`display-button ${aboutMeLayout === 'side-by-side' ? 'is-active' : ''}`}
                              onClick={() => setAboutMeLayout('side-by-side')}
                            >
                              Side by Side
                            </button>
                            <button
                              type="button"
                              className={`display-button ${aboutMeLayout === 'stacked' ? 'is-active' : ''}`}
                              onClick={() => setAboutMeLayout('stacked')}
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
                          <div
                            className="image-upload-area avatar-upload"
                            onClick={() => avatarInputRef.current.click()}
                          >
                            {showAddImageText(state.avatar) && <span className="upload-text">Add Profile Photo</span>}
                            <img
                              src={state.avatar || ''}
                              alt="Avatar preview"
                              className="avatar-preview"
                            />
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
                          <div className="input-block">
                            <label htmlFor="fullName">Full Name</label>
                            <input
                              id="fullName"
                              type="text"
                              value={state.full_name || ''}
                              onChange={(e) => updateState({ full_name: e.target.value })}
                              placeholder={previewPlaceholders.full_name}
                            />
                          </div>

                          <div className="input-block">
                            <label htmlFor="jobTitle">Job Title</label>
                            <input
                              id="jobTitle"
                              type="text"
                              value={state.job_title || ''}
                              onChange={(e) => updateState({ job_title: e.target.value })}
                              placeholder={previewPlaceholders.job_title}
                            />
                          </div>

                          <div className="input-block">
                            <label htmlFor="bio">About Me Description</label>
                            <textarea
                              id="bio"
                              value={state.bio || ''}
                              onChange={(e) => updateState({ bio: e.target.value })}
                              rows={4}
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
                        {showWorkSection ? 'Hide Section' : 'Show Section'}
                      </button>
                    </div>
                    {showWorkSection && (
                      <>
                        <div className="input-block">
                          <label>Display Layout</label>
                          <div className="option-row">
                            <button
                              type="button"
                              className={`display-button ${state.workDisplayMode === 'list' ? 'is-active' : ''}`}
                              onClick={() => updateState({ workDisplayMode: 'list' })}
                            >
                              List
                            </button>
                            <button
                              type="button"
                              className={`display-button ${state.workDisplayMode === 'grid' ? 'is-active' : ''}`}
                              onClick={() => updateState({ workDisplayMode: 'grid' })}
                            >
                              Grid
                            </button>
                            <button
                              type="button"
                              className={`display-button ${state.workDisplayMode === 'carousel' ? 'is-active' : ''}`}
                              onClick={() => updateState({ workDisplayMode: 'carousel' })}
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
                                <img
                                  src={item.preview || item}
                                  alt={`work-${i}`}
                                  className="work-image-preview"
                                />
                                <button
                                  type="button"
                                  className="remove-image-button"
                                  onClick={(e) => { e.stopPropagation(); handleRemoveWorkImage(i); }}
                                >
                                  &times;
                                </button>
                              </div>
                            ))}
                            {state.workImages.length < 10 && (
                              <div
                                className="add-work-image-placeholder"
                                onClick={() => workImageInputRef.current.click()}
                              >
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
                        {showServicesSection ? 'Hide Section' : 'Show Section'}
                      </button>
                    </div>
                    {showServicesSection && (
                      <>
                        <div className="input-block">
                          <label>Display Layout</label>
                          <div className="option-row">
                            <button
                              type="button"
                              className={`display-button ${servicesDisplayMode === 'list' ? 'is-active' : ''}`}
                              onClick={() => setServicesDisplayMode('list')}
                            >
                              List
                            </button>
                            <button
                              type="button"
                              className={`display-button ${servicesDisplayMode === 'carousel' ? 'is-active' : ''}`}
                              onClick={() => setServicesDisplayMode('carousel')}
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
                                  value={s.name || ''}
                                  onChange={(e) => handleServiceChange(i, "name", e.target.value)}
                                />
                                <input
                                  type="text"
                                  placeholder="Service Price/Detail"
                                  value={s.price || ''}
                                  onChange={(e) => handleServiceChange(i, "price", e.target.value)}
                                />
                                <button type="button" onClick={() => handleRemoveService(i)} className="remove-item-button">Remove</button>
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
                        {showReviewsSection ? 'Hide Section' : 'Show Section'}
                      </button>
                    </div>
                    {showReviewsSection && (
                      <>
                        <div className="input-block">
                          <label>Display Layout</label>
                          <div className="option-row">
                            <button
                              type="button"
                              className={`display-button ${reviewsDisplayMode === 'list' ? 'is-active' : ''}`}
                              onClick={() => setReviewsDisplayMode('list')}
                            >
                              List
                            </button>
                            <button
                              type="button"
                              className={`display-button ${reviewsDisplayMode === 'carousel' ? 'is-active' : ''}`}
                              onClick={() => setReviewsDisplayMode('carousel')}
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
                                  value={r.name || ''}
                                  onChange={(e) => handleReviewChange(i, "name", e.target.value)}
                                />
                                <textarea
                                  placeholder="Review text"
                                  rows={2}
                                  value={r.text || ''}
                                  onChange={(e) => handleReviewChange(i, "text", e.target.value)}
                                />
                                <input
                                  type="number"
                                  placeholder="Rating (1-5)"
                                  min="1"
                                  max="5"
                                  value={r.rating || ''}
                                  onChange={(e) => handleReviewChange(i, "rating", parseInt(e.target.value) || 0)}
                                />
                                <button type="button" onClick={() => handleRemoveReview(i)} className="remove-item-button">Remove</button>
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
                      <h3 className="editor-subtitle">Exchange Contact Details</h3>
                      <button type="button" onClick={() => setShowContactSection(!showContactSection)} className="toggle-button">
                        {showContactSection ? 'Hide Section' : 'Show Section'}
                      </button>
                    </div>
                    {showContactSection && (
                      <>
                        <div className="input-block">
                          <label htmlFor="contactEmail">Email Address</label>
                          <input
                            id="contactEmail"
                            type="email"
                            value={state.contact_email || ''}
                            onChange={(e) => updateState({ contact_email: e.target.value })}
                            placeholder={previewPlaceholders.contact_email}
                          />
                        </div>

                        <div className="input-block">
                          <label htmlFor="phoneNumber">Phone Number</label>
                          <input
                            id="phoneNumber"
                            type="tel"
                            value={state.phone_number || ''}
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
                        className="ghost-button"
                      >
                        Reset Page
                      </button>
                      <button
                        type="submit"
                        className="black-button desktop-button"
                      >
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
        profileUrl={currentProfileUrl}
        qrCodeUrl={currentQrCodeUrl}
        contactDetails={contactDetailsForVCard}
        username={userUsername || ''}
      />
    </div>
  );
}