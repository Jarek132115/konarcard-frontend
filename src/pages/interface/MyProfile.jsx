import React, { useRef, useEffect, useState, useContext } from "react";
import { Link, useLocation } from 'react-router-dom';
import Sidebar from "../../components/Sidebar";
import PageHeader from "../../components/PageHeader";
import useBusinessCardStore, { previewPlaceholders } from "../../store/businessCardStore";
import { useQueryClient } from "@tanstack/react-query";
import {
  useFetchBusinessCard,
} from "../../hooks/useFetchBusinessCard";
import {
  useCreateBusinessCard,
  buildBusinessCardFormData,
} from "../../hooks/useCreateBiz";
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

  const { user: authUser, loading: authLoading, fetchUser: refetchAuthUser } = useContext(AuthContext);
  const isSubscribed = authUser?.isSubscribed || false;
  const userId = authUser?._id;
  const userEmail = authUser?.email;
  const isUserVerified = authUser?.isVerified;
  const userUsername = authUser?.username;
  const { data: businessCard, isLoading: isCardLoading } = useFetchBusinessCard(userId);
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

  const location = useLocation();

  const [hasLoadedInitialCardData, setHasLoadedInitialCardData] = useState(false);

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
    if (!isCardLoading && authUser && !hasLoadedInitialCardData) {
      setHasLoadedInitialCardData(true);

      activeBlobUrls.forEach(url => URL.revokeObjectURL(url));
      setActiveBlobUrls([]);

      if (isSubscribed && businessCard) {
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
        });
      } else {
        resetState();
      }

      setCoverPhotoFile(null);
      setAvatarFile(null);
      setWorkImageFiles([]);
      setCoverPhotoRemoved(false);
      setIsAvatarRemoved(false);
    }
  }, [businessCard, isCardLoading, authUser, isSubscribed, updateState, resetState, activeBlobUrls, hasLoadedInitialCardData]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (authLoading) {
      toast.info("User data is still loading. Please wait a moment.");
      return;
    }
    if (!userId) {
      toast.error("User not logged in or loaded. Please log in again to save changes.");
      return;
    }
    if (!isUserVerified) {
      toast.error("Please verify your email address to save changes.");
      return;
    }
    if (!isSubscribed) {
      toast.error("Please subscribe to edit your profile.");
      return;
    }

    const worksToUpload = state.workImages
      .map(item => {
        if (item.file) {
          return { file: item.file };
        }
        else if (item.preview && !item.preview.startsWith('blob:')) {
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
      services: state.services,
      reviews: state.reviews,
      contact_email: state.contact_email,
      phone_number: state.phone_number,
    });

    try {
      const response = await createBusinessCard.mutateAsync(formData);
      toast.success("Business card saved successfully!");

      activeBlobUrls.forEach(url => URL.revokeObjectURL(url));
      setActiveBlobUrls([]);

      setCoverPhotoFile(null);
      setAvatarFile(null);
      setWorkImageFiles([]);
      setCoverPhotoRemoved(false);
      setIsAvatarRemoved(false);

      if (response.data && response.data.data) {
        const fetchedCardData = response.data.data;
        updateState({
          businessName: fetchedCardData.business_card_name || '',
          pageTheme: fetchedCardData.page_theme || 'light',
          font: fetchedCardData.style || 'Inter',
          mainHeading: fetchedCardData.main_heading || '',
          subHeading: fetchedCardData.sub_heading || '',
          job_title: fetchedCardData.job_title || '',
          full_name: fetchedCardData.full_name || '',
          bio: fetchedCardData.bio || '',
          avatar: fetchedCardData.avatar || null,
          coverPhoto: fetchedCardData.cover_photo || null,
          workImages: (fetchedCardData.works || []).map(url => ({ file: null, preview: url })),
          services: (fetchedCardData.services || []),
          reviews: (fetchedCardData.reviews || []),
          contact_email: fetchedCardData.contact_email || '',
          phone_number: fetchedCardData.phone_number || '',
        });
      } else {
        resetState();
      }

      queryClient.invalidateQueries(['businessCard', userId]);

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

  const currentProfileUrl = userUsername ? `https://www.konarcard.com/u/${userUsername}` : '';
  const currentQrCodeUrl = businessCard?.qrCodeUrl || '';

  const contactDetailsForVCard = {
    full_name: businessCard?.full_name || '',
    job_title: businessCard?.job_title || '',
    business_card_name: businessCard?.business_card_name || '',
    bio: businessCard?.bio || '',
    contact_email: businessCard?.contact_email || '',
    phone_number: businessCard?.phone_number || '',
    username: userUsername || '',
  };

  const getEditorValue = (fieldValue) => {
    return fieldValue || '';
  };

  const getEditorImageSrc = (imageState) => {
    return imageState || '';
  };

  const showAddImageText = (imageState) => {
    return !imageState;
  };

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

              {!isSubscribed && isMobile && (
                <div className="subscription-overlay-mobile">
                  <div className="subscription-message">
                    <p className="desktop-h4">Unlock Your Profile!</p>
                    <p className="desktop-body">Subscribe for a 7-day free trial and unlock all features.</p>
                    <button className="blue-button desktop-button" onClick={handleStartSubscription}>
                      Start Your Free Trial Now!
                    </button>
                  </div>
                </div>
              )}

              <div className="myprofile-flex-container">
                <div className={`myprofile-content ${isMobile ? 'myprofile-mock-phone-mobile-container' : ''}`}>
                  <div
                    className={`mock-phone ${(isSubscribed && (state.pageTheme === "dark" || (state.pageTheme === "" && businessCard?.page_theme === "dark"))) ||
                      (!isSubscribed && previewPlaceholders.pageTheme === "dark")
                      ? "dark-mode" : ""
                      }`}
                    style={{
                      fontFamily: !isSubscribed
                        ? previewPlaceholders.font
                        : (state.font || businessCard?.style || previewPlaceholders.font)
                    }}
                  >
                    <div className="mock-phone-scrollable-content">
                      <img
                        src={
                          !isSubscribed
                            ? previewPlaceholders.coverPhoto
                            : (state.coverPhoto || businessCard?.cover_photo || previewPlaceholders.coverPhoto)
                        }
                        alt="Cover"
                        className="mock-cover"
                      />

                      <h2 className="mock-title">
                        {
                          !isSubscribed
                            ? previewPlaceholders.mainHeading
                            : (state.mainHeading || businessCard?.main_heading || previewPlaceholders.mainHeading)
                        }
                      </h2>
                      <p className="mock-subtitle">
                        {
                          !isSubscribed
                            ? previewPlaceholders.subHeading
                            : (state.subHeading || businessCard?.sub_heading || previewPlaceholders.subHeading)
                        }
                      </p>
                      <button
                        type="button"
                        className="mock-button"
                      >
                        Exchange Contact
                      </button>

                      {!isSubscribed || (isSubscribed && (
                        state.full_name || state.job_title || state.bio || state.avatar ||
                        businessCard?.full_name || businessCard?.job_title || businessCard?.bio || businessCard?.avatar ||
                        previewPlaceholders.full_name || previewPlaceholders.job_title || previewPlaceholders.bio || previewPlaceholders.avatar
                      )) ? (
                        <>
                          <p className="mock-section-title">About me</p>
                          <div className="mock-about-container">
                            <div className="mock-about-content-group">
                              <div className="mock-about-header-group">
                                <img
                                  src={
                                    !isSubscribed
                                      ? previewPlaceholders.avatar
                                      : (state.avatar || businessCard?.avatar || previewPlaceholders.avatar)
                                  }
                                  alt="Avatar"
                                  className="mock-avatar"
                                />
                                <div>
                                  <p className="mock-profile-name">
                                    {
                                      !isSubscribed
                                        ? previewPlaceholders.full_name
                                        : (state.full_name || businessCard?.full_name || previewPlaceholders.full_name)
                                    }
                                  </p>
                                  <p className="mock-profile-role">
                                    {
                                      !isSubscribed
                                        ? previewPlaceholders.job_title
                                        : (state.job_title || businessCard?.job_title || previewPlaceholders.job_title)
                                    }
                                  </p>
                                </div>
                              </div>
                              <p className="mock-bio-text">
                                {
                                  !isSubscribed
                                    ? previewPlaceholders.bio
                                    : (state.bio || businessCard?.bio || previewPlaceholders.bio)
                                }
                              </p>
                            </div>
                          </div>
                        </>
                      ) : null}

                      {!isSubscribed || (isSubscribed && (state.workImages.length > 0 || (businessCard?.works && businessCard.works.length > 0) || previewPlaceholders.workImages.length > 0)) ? (
                        <>
                          <p className="mock-section-title">My Work</p>
                          <div className="mock-work-gallery">
                            {(
                              !isSubscribed
                                ? previewPlaceholders.workImages
                                : (state.workImages.length > 0
                                  ? state.workImages
                                  : (businessCard?.works || []).map(url => ({ preview: url })).concat(previewPlaceholders.workImages.slice(0, Math.max(0, 3 - (businessCard?.works || []).length)))
                                )
                            ).map((item, i) => (
                              <div key={i} className="mock-work-image-item-wrapper">
                                <img
                                  src={item.preview || item}
                                  alt={`work-${i}`}
                                  className="mock-work-image-item"
                                />
                              </div>
                            ))}
                          </div>
                        </>
                      ) : null}


                      {!isSubscribed || (isSubscribed && (state.services.length > 0 || (businessCard?.services && businessCard.services.length > 0) || previewPlaceholders.services.length > 0)) ? (
                        <>
                          <p className="mock-section-title">My Services</p>
                          <div className="mock-services-list">
                            {(
                              !isSubscribed
                                ? previewPlaceholders.services
                                : (state.services.length > 0
                                  ? state.services
                                  : (businessCard?.services || []).concat(previewPlaceholders.services.slice(0, Math.max(0, 3 - (businessCard?.services || []).length)))
                                )
                            ).map((s, i) => (
                              <div key={i} className="mock-service-item">
                                <p className="mock-service-name">
                                  {
                                    !isSubscribed
                                      ? s.name
                                      : (s.name || '')
                                  }
                                </p>
                                <span className="mock-service-price">
                                  {
                                    !isSubscribed
                                      ? s.price
                                      : (s.price || '')
                                  }
                                </span>
                              </div>
                            ))}
                          </div>
                        </>
                      ) : null}

                      {!isSubscribed || (isSubscribed && (state.reviews.length > 0 || (businessCard?.reviews && businessCard.reviews.length > 0) || previewPlaceholders.reviews.length > 0)) ? (
                        <>
                          <p className="mock-section-title">Reviews</p>
                          <div className="mock-reviews-list">
                            {(
                              !isSubscribed
                                ? previewPlaceholders.reviews
                                : (state.reviews.length > 0
                                  ? state.reviews
                                  : (businessCard?.reviews || []).concat(previewPlaceholders.reviews.slice(0, Math.max(0, 3 - (businessCard?.reviews || []).length)))
                                )
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
                                  {`"${!isSubscribed
                                    ? r.text
                                    : (r.text || '')
                                    }"`}
                                </p>
                                <p className="mock-reviewer-name">
                                  {
                                    !isSubscribed
                                      ? r.name
                                      : (r.name || '')
                                  }
                                </p>
                              </div>
                            ))}
                          </div>
                        </>
                      ) : null}

                      {!isSubscribed || (isSubscribed && (
                        state.contact_email || state.phone_number ||
                        businessCard?.contact_email || businessCard?.phone_number ||
                        previewPlaceholders.contact_email || previewPlaceholders.phone_number
                      )) ? (
                        <>
                          <p className="mock-section-title">Contact Details</p>
                          <div className="mock-contact-details">
                            <div className="mock-contact-item">
                              <p className="mock-contact-label">Email:</p>
                              <p className="mock-contact-value">
                                {
                                  !isSubscribed
                                    ? previewPlaceholders.contact_email
                                    : (state.contact_email || businessCard?.contact_email || previewPlaceholders.contact_email)
                                }
                              </p>
                            </div>
                            <div className="mock-contact-item">
                              <p className="mock-contact-label">Phone:</p>
                              <p className="mock-contact-value">
                                {
                                  !isSubscribed
                                    ? previewPlaceholders.phone_number
                                    : (state.phone_number || businessCard?.phone_number || previewPlaceholders.phone_number)
                                }
                              </p>
                            </div>
                          </div>
                        </>
                      ) : null}


                    </div>
                  </div>
                </div>

                <div className="myprofile-editor-wrapper">
                  {!isSubscribed && !isMobile && (
                    <div className="subscription-overlay">
                      <div className="subscription-message">
                        <p className="desktop-h4">Unlock Your Full Profile!</p>
                        <p className="desktop-h6">Subscribe to start your 7-day free trial and unlock all profile editing features.</p>
                        <button className="blue-button" onClick={handleStartSubscription}>
                          Start Your Free Trial Now!
                        </button>
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="myprofile-editor" style={{ filter: isSubscribed ? 'none' : 'blur(5px)', pointerEvents: isSubscribed ? 'auto' : 'none' }}>
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
                    <h3 className="editor-subtitle">Hero Section</h3>

                    <div className="input-block">
                      <label htmlFor="coverPhoto">Cover Photo</label>
                      <input
                        ref={fileInputRef}
                        id="coverPhoto"
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                      />
                      <div
                        className="image-upload-area cover-photo-upload"
                        onClick={() => {
                          const input = document.createElement('input');
                          input.type = 'file';
                          input.accept = 'image/*';
                          input.onchange = (e) => {
                            handleImageUpload(e);
                            document.body.removeChild(input);
                          };
                          document.body.appendChild(input);
                          input.click();
                        }}
                      >
                        {showAddImageText(state.coverPhoto) && <span className="upload-text">Add Cover Photo</span>}
                        <img
                          src={getEditorImageSrc(state.coverPhoto)}
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
                        value={getEditorValue(state.mainHeading)}
                        onChange={(e) => updateState({ mainHeading: e.target.value })}
                        placeholder={previewPlaceholders.mainHeading}
                      />
                    </div>

                    <div className="input-block">
                      <label htmlFor="subHeading">Subheading</label>
                      <input
                        id="subHeading"
                        type="text"
                        value={getEditorValue(state.subHeading)}
                        onChange={(e) => updateState({ subHeading: e.target.value })}
                        placeholder={previewPlaceholders.subHeading}
                      />
                    </div>

                    <hr className="divider" />
                    <h3 className="editor-subtitle">About Me Section</h3>

                    <div className="input-block">
                      <label htmlFor="avatar">Profile Photo</label>
                      <input
                        ref={avatarInputRef}
                        id="avatar"
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                      />
                      <div
                        className="image-upload-area avatar-upload"
                        onClick={() => {
                          const input = document.createElement('input');
                          input.type = 'file';
                          input.accept = 'image/*';
                          input.onchange = (e) => {
                            handleAvatarUpload(e);
                            document.body.removeChild(input);
                          };
                          document.body.appendChild(input);
                          input.click();
                        }}
                      >
                        {showAddImageText(state.avatar) && <span className="upload-text">Add Profile Photo</span>}
                        <img
                          src={getEditorImageSrc(state.avatar)}
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
                    </div>

                    <div className="input-block">
                      <label htmlFor="fullName">Full Name</label>
                      <input
                        id="fullName"
                        type="text"
                        value={getEditorValue(state.full_name)}
                        onChange={(e) => updateState({ full_name: e.target.value })}
                        placeholder={previewPlaceholders.full_name}
                      />
                    </div>

                    <div className="input-block">
                      <label htmlFor="jobTitle">Job Title</label>
                      <input
                        id="jobTitle"
                        type="text"
                        value={getEditorValue(state.job_title)}
                        onChange={(e) => updateState({ job_title: e.target.value })}
                        placeholder={previewPlaceholders.job_title}
                      />
                    </div>

                    <div className="input-block">
                      <label htmlFor="bio">About Me Description</label>
                      <textarea
                        id="bio"
                        value={getEditorValue(state.bio)}
                        onChange={(e) => updateState({ bio: e.target.value })}
                        rows={4}
                        placeholder={previewPlaceholders.bio}
                      />
                    </div>

                    <hr className="divider" />
                    <h3 className="editor-subtitle">My Work Section</h3>

                    <div className="input-block">
                      <label>Work Images</label>
                      <div className="work-preview-row">
                        {state.workImages.map((img, i) => (
                          <div key={i} className="work-image-item-wrapper">
                            <img
                              src={getEditorImageSrc(img.preview)}
                              alt={`work-${i}`}
                              className="work-image-preview"
                            />
                            <button
                              type="button"
                              className="remove-image-button"
                              onClick={() => handleRemoveWorkImage(i)}
                            >
                              &times;
                            </button>
                          </div>
                        ))}
                        <div
                          className="image-upload-area add-work-image-placeholder"
                          onClick={() => {
                            const input = document.createElement('input');
                            input.type = 'file';
                            input.accept = 'image/*';
                            input.multiple = true;
                            input.onchange = (e) => {
                              handleAddWorkImage(e);
                              document.body.removeChild(input);
                            };
                            document.body.appendChild(input);
                            input.click();
                          }}
                        >
                          <span className="upload-text">Add Work Image</span>
                          <img src="" alt="Add Work" className="work-image-preview" />
                        </div>
                      </div>
                    </div>

                    <hr className="divider" />
                    <h3 className="editor-subtitle">My Services Section</h3>
                    <div className="input-block">
                      <label>Services</label>
                      {state.services.map((s, i) => (
                        <div key={i} className="editor-item-card">
                          <input
                            type="text"
                            placeholder={previewPlaceholders.services[0]?.name || "Service Name"}
                            value={getEditorValue(s.name)}
                            onChange={(e) => handleServiceChange(i, "name", e.target.value)}
                          />
                          <input
                            type="text"
                            placeholder={previewPlaceholders.services[0]?.price || "Service Price/Detail"}
                            value={getEditorValue(s.price)}
                            onChange={(e) => handleServiceChange(i, "price", e.target.value)}
                          />
                          <button type="button" onClick={() => handleRemoveService(i)} className="remove-item-button">Remove</button>
                        </div>
                      ))}
                      <button type="button" onClick={handleAddService} className="add-item-button">
                        + Add Service
                      </button>
                    </div>

                    <hr className="divider" />
                    <h3 className="editor-subtitle">Reviews Section</h3>
                    <div className="input-block">
                      <label>Reviews</label>
                      {state.reviews.map((r, i) => (
                        <div key={i} className="editor-item-card">
                          <input
                            type="text"
                            placeholder={previewPlaceholders.reviews[0]?.name || "Reviewer Name"}
                            value={getEditorValue(r.name)}
                            onChange={(e) => handleReviewChange(i, "name", e.target.value)}
                          />
                          <textarea
                            placeholder={previewPlaceholders.reviews[0]?.text || "Review text"}
                            rows={2}
                            value={getEditorValue(r.text)}
                            onChange={(e) => handleReviewChange(i, "text", e.target.value)}
                          />
                          <input
                            type="number"
                            placeholder={previewPlaceholders.reviews[0]?.rating?.toString() || "Rating (1-5)"}
                            min="1"
                            max="5"
                            value={getEditorValue(r.rating)}
                            onChange={(e) => handleReviewChange(i, "rating", parseInt(e.target.value) || 0)}
                          />
                          <button type="button" onClick={() => handleRemoveReview(i)} className="remove-item-button">Remove</button>
                        </div>
                      ))}
                      <button type="button" onClick={handleAddReview} className="add-item-button">
                        + Add Review
                      </button>
                    </div>

                    <hr className="divider" />
                    <h3 className="editor-subtitle">Exchange Contact Details</h3>

                    <div className="input-block">
                      <label htmlFor="contactEmail">Email Address</label>
                      <input
                        id="contactEmail"
                        type="email"
                        value={getEditorValue(state.contact_email)}
                        onChange={(e) => updateState({ contact_email: e.target.value })}
                        placeholder={previewPlaceholders.contact_email}
                      />
                    </div>

                    <div className="input-block">
                      <label htmlFor="phoneNumber">Phone Number</label>
                      <input
                        id="phoneNumber"
                        type="tel"
                        value={getEditorValue(state.phone_number)}
                        onChange={(e) => updateState({ phone_number: e.target.value })}
                        placeholder={previewPlaceholders.phone_number}
                      />
                    </div>

                    <button
                      type="submit"
                      className="submit-button"
                    >
                      Save Business Card
                    </button>
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