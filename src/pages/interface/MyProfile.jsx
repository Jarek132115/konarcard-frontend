// frontend/src/pages/interface/MyProfile.jsx

import React, { useRef, useEffect, useState, useContext } from "react";
import { Link, useLocation } from 'react-router-dom';
import Sidebar from "../../components/Sidebar";
import PageHeader from "../../components/PageHeader";
import useBusinessCardStore from "../../store/businessCardStore";
import { useFetchBusinessCard } from "../../hooks/useFetchBusinessCard"; // Corrected import
import {
  useCreateBusinessCard,
  buildBusinessCardFormData,
} from "../../hooks/useCreateBiz"; // Corrected import
import axios from 'axios';
import { toast } from 'react-hot-toast';
import ShareProfile from "../../components/ShareProfile";
import { AuthContext } from '../../components/AuthContext'; // Corrected import
import api from '../../services/api';
import LogoIcon from '../../assets/icons/Logo-Icon.svg';

export default function MyProfile() {
  const { state, updateState, resetState } = useBusinessCardStore();
  const fileInputRef = useRef(null);
  const avatarInputRef = useRef(null);
  const workImageInputRef = useRef(null);
  const createBusinessCard = useCreateBusinessCard();
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

  const initialStoreState = useBusinessCardStore.getState().state;

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
        console.log("Payment success detected in URL, refetching user data to update subscription status...");
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
      setIsMobile(currentIsMobile);
      if (!currentIsMobile && sidebarOpen) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [sidebarOpen, isMobile]);

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

      if (businessCard) {
        updateState({
          businessName: businessCard.business_card_name || initialStoreState.businessName,
          pageTheme: businessCard.page_theme || initialStoreState.pageTheme,
          font: businessCard.style || initialStoreState.font,
          mainHeading: businessCard.main_heading || initialStoreState.mainHeading,
          subHeading: businessCard.sub_heading || initialStoreState.subHeading,
          job_title: businessCard.job_title || initialStoreState.job_title,
          full_name: businessCard.full_name || initialStoreState.full_name,
          bio: businessCard.bio || initialStoreState.bio,
          avatar: businessCard.avatar || initialStoreState.avatar,
          coverPhoto: businessCard.cover_photo || initialStoreState.coverPhoto,
          workImages: (businessCard.works && businessCard.works.length > 0) ? businessCard.works.map(url => ({ file: null, preview: url })) : initialStoreState.workImages,
          services: (businessCard.services && businessCard.services.length > 0) ? businessCard.services : initialStoreState.services,
          reviews: (businessCard.reviews && businessCard.reviews.length > 0) ? businessCard.reviews : initialStoreState.reviews,
          contact_email: businessCard.contact_email || initialStoreState.contact_email,
          phone_number: businessCard.phone_number || initialStoreState.phone_number,
        });
        console.log("MyProfile: Updated state with fetched business card data.");
      } else {
        resetState();
        console.log("MyProfile: No business card found, resetting state to initial placeholders (once).");
      }

      setCoverPhotoFile(null);
      setAvatarFile(null);
      setWorkImageFiles([]);
      setCoverPhotoRemoved(false);
      setIsAvatarRemoved(false);
    }
  }, [businessCard, isCardLoading, authUser, updateState, resetState, initialStoreState, activeBlobUrls, hasLoadedInitialCardData]);


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
    const isCurrentlyDefault = state.coverPhoto === initialStoreState.coverPhoto;
    const isLocalBlob = state.coverPhoto && state.coverPhoto.startsWith('blob:');

    if (!isCurrentlyDefault && !isLocalBlob && state.coverPhoto) {
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
    const isCurrentlyDefault = state.avatar === initialStoreState.avatar;
    const isLocalBlob = state.avatar && state.avatar.startsWith('blob:');

    if (!isCurrentlyDefault && !isLocalBlob && state.avatar) {
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
        toast.success('Verification code sent to your email!');
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
        else if (item.preview && !initialStoreState.workImages.some(defaultImg => defaultImg.preview === item.preview)) {
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

      if (response.data && response.data.data) {
        const fetchedCardData = response.data.data;

        updateState({
          businessName: fetchedCardData.business_card_name,
          pageTheme: fetchedCardData.page_theme,
          font: fetchedCardData.style,
          mainHeading: fetchedCardData.main_heading,
          subHeading: fetchedCardData.sub_heading,
          job_title: fetchedCardData.job_title,
          full_name: fetchedCardData.full_name,
          bio: fetchedCardData.bio,
          avatar: fetchedCardData.avatar,
          coverPhoto: fetchedCardData.cover_photo,
          workImages: (fetchedCardData.works || []).map((url) => ({
            file: null,
            preview: url,
          })),
          services: fetchedCardData.services,
          reviews: fetchedCardData.reviews,
          contact_email: fetchedCardData.contact_email,
          phone_number: fetchedCardData.phone_number,
        });
      }

      activeBlobUrls.forEach(url => URL.revokeObjectURL(url));
      setActiveBlobUrls([]);

      setCoverPhotoFile(null);
      setAvatarFile(null);
      setWorkImageFiles([]);
      setCoverPhotoRemoved(false);
      setIsAvatarRemoved(false);

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
    full_name: state.full_name || '',
    job_title: state.job_title || '',
    business_card_name: state.businessName || '',
    bio: state.bio || '',
    contact_email: state.contact_email || '',
    phone_number: state.phone_number || '',
    username: userUsername || '',
  };

  return (
    <div className={`app-layout ${sidebarOpen ? 'sidebar-active' : ''}`}>
      <div className="myprofile-mobile-header">
        <Link to="/" className="myprofile-logo-link">
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
          title={authUser ? `Good Afternoon ${authUser.name}!` : "My Profile"}
          onActivateCard={handleActivateCard}
          onShareCard={handleShareCard}
        />

        <div className="combined-offer-container">
          {(authLoading || isCardLoading) && (
            <div className="content-card-box loading-state">
              Loading profile data...
            </div>
          )}

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

              <div className="myprofile-flex-container">
                <div className="myprofile-content">
                  <div
                    className={`mock-phone ${state.pageTheme === "dark" ? "dark-mode" : ""}`}
                    style={{ fontFamily: state.font }}
                  >
                    <div className="mock-phone-scrollable-content">
                      <img
                        src={state.coverPhoto || ''}
                        alt="Cover"
                        className="mock-cover"
                      />
                      {/* Removed delete button from preview section as per instructions */}

                      <h2 className="mock-title">{state.mainHeading}</h2>
                      <p className="mock-subtitle">{state.subHeading}</p>
                      <button
                        type="button"
                        className="mock-button"
                      >
                        Exchange Contact
                      </button>
                      {(state.full_name || state.job_title || state.bio || state.avatar) && (
                        <>
                          {/* FIX: Section title is outside the content container */}
                          <p className="mock-section-title">About me</p>
                          <div className="mock-about-container">
                            <div className="mock-about-content-group">
                              <div className="mock-about-header-group">
                                {state.avatar && (
                                  <img
                                    src={state.avatar || ''}
                                    alt="Avatar"
                                    className="mock-avatar"
                                  />
                                )}
                                {/* Removed delete button from preview section as per instructions */}
                                <div>
                                  <p className="mock-profile-name">{state.full_name}</p>
                                  <p className="mock-profile-role">{state.job_title}</p>
                                </div>
                              </div>
                              {state.bio && <p className="mock-bio-text">{state.bio}</p>}
                            </div>
                          </div>
                        </>
                      )}

                      {(state.workImages && state.workImages.length > 0) && (
                        <>
                          {/* FIX: Section title is outside the content container */}
                          <p className="mock-section-title">My Work</p>
                          <div className="mock-work-gallery">
                            {state.workImages.map((img, i) => (
                              <div key={i} className="mock-work-image-item-wrapper">
                                <img
                                  src={img.preview || ''}
                                  alt={`work-${i}`}
                                  className="mock-work-image-item"
                                />
                                {/* Removed delete button from preview section as per instructions */}
                              </div>
                            ))}
                            {/* The "Choose files" button remains only in the editor */}
                          </div>
                        </>
                      )}

                      {(state.services && state.services.length > 0) && (
                        <>
                          {/* FIX: Section title is outside the content container */}
                          <p className="mock-section-title">My Services</p>
                          <div className="mock-services-list">
                            {state.services.map((s, i) => (
                              <div key={i} className="mock-service-item">
                                <p className="mock-service-name">{s.name}</p>
                                <span className="mock-service-price">{s.price}</span>
                              </div>
                            ))}
                          </div>
                        </>
                      )}

                      {(state.reviews && state.reviews.length > 0) && (
                        <>
                          {/* FIX: Section title is outside the content container */}
                          <p className="mock-section-title">Reviews</p>
                          <div className="mock-reviews-list">
                            {state.reviews.map((r, i) => (
                              <div key={i} className="mock-review-card">
                                <div className="mock-star-rating">
                                  {Array(r.rating || 0).fill().map((_, starIdx) => (
                                    <span key={`filled-${starIdx}`}>★</span>
                                  ))}
                                  {Array(Math.max(0, 5 - (r.rating || 0))).fill().map((_, starIdx) => (
                                    <span key={`empty-${starIdx}`} className="empty-star">★</span>
                                  ))}
                                </div>
                                <p className="mock-review-text">"{r.text}"</p>
                                <p className="mock-reviewer-name">{r.name}</p>
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="myprofile-editor-wrapper">
                  {!isSubscribed && (
                    <div className="subscription-overlay">
                      <div className="subscription-message">
                        <h2>Unlock Your Full Profile!</h2>
                        <p>Subscribe to start your 7-day free trial and unlock all profile editing features.</p>
                        <button className="start-trial-button" onClick={handleStartSubscription}>
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
                        <img
                          src={state.coverPhoto || ''}
                          alt="Cover"
                          className="cover-preview"
                        />
                      </div>
                    </div>

                    <div className="input-block">
                      <label htmlFor="mainHeading">Main Heading</label>
                      <input
                        id="mainHeading"
                        type="text"
                        value={state.mainHeading}
                        onChange={(e) => updateState({ mainHeading: e.target.value })}
                      />
                    </div>

                    <div className="input-block">
                      <label htmlFor="subHeading">Subheading</label>
                      <input
                        id="subHeading"
                        type="text"
                        value={state.subHeading}
                        onChange={(e) => updateState({ subHeading: e.target.value })}
                      />
                    </div>

                    <div className="input-block">
                      <label htmlFor="jobTitle">Job Title</label>
                      <input
                        id="jobTitle"
                        type="text"
                        value={state.job_title}
                        onChange={(e) => updateState({ job_title: e.target.value })}
                      />
                    </div>

                    <div className="input-block">
                      <label htmlFor="avatar">Profile Photo</label>
                      <input
                        ref={avatarInputRef}
                        type="file"
                        accept="image/*"
                        id="avatar"
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
                        <img
                          src={state.avatar || ''}
                          alt="Avatar preview"
                          className="avatar-preview"
                        />
                      </div>
                    </div>

                    <div className="input-block">
                      <label htmlFor="fullName">Full Name</label>
                      <input
                        id="fullName"
                        type="text"
                        value={state.full_name}
                        onChange={(e) => updateState({ full_name: e.target.value })}
                      />
                    </div>

                    <div className="input-block">
                      <label htmlFor="bio">About Me</label>
                      <textarea
                        id="bio"
                        value={state.bio}
                        onChange={(e) => updateState({ bio: e.target.value })}
                        rows={4}
                      />
                    </div>

                    <div className="input-block">
                      <label>My Work</label>
                      <div className="work-preview-row">
                        {state.workImages.map((img, i) => (
                          <div key={i} className="work-image-item-wrapper">
                            <img
                              src={img.preview || ''}
                              alt={`work-${i}`}
                              className="work-image-preview"
                            />
                            {/* Only show remove button in editor section */}
                            <button
                              type="button"
                              className="remove-image-button work-image-remove"
                              onClick={() => handleRemoveWorkImage(i)}
                            >
                              &times;
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
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
                          className="add-work-image-button"
                        >
                          Choose files
                        </button>
                      </div>
                    </div>

                    <div className="input-block">
                      <label>My Services</label>
                      {state.services.map((s, i) => (
                        <div key={i} className="editor-item-card">
                          <input
                            type="text"
                            placeholder={`Service Name ${i + 1}`}
                            value={s.name}
                            onChange={(e) => handleServiceChange(i, "name", e.target.value)}
                          />
                          <input
                            type="text"
                            placeholder={`Service Price/Detail ${i + 1}`}
                            value={s.price}
                            onChange={(e) => handleServiceChange(i, "price", e.target.value)}
                          />
                          <button type="button" onClick={() => handleRemoveService(i)} className="remove-item-button">Remove</button>
                        </div>
                      ))}
                      <button type="button" onClick={handleAddService} className="add-item-button">
                        + Add Service
                      </button>
                    </div>

                    <div className="input-block">
                      <label>Reviews</label>
                      {state.reviews.map((r, i) => (
                        <div key={i} className="editor-item-card">
                          <input
                            type="text"
                            placeholder="Reviewer Name"
                            value={r.name}
                            onChange={(e) => handleReviewChange(i, "name", e.target.value)}
                          />
                          <textarea
                            placeholder="Review"
                            rows={2}
                            value={r.text}
                            onChange={(e) => handleReviewChange(i, "text", e.target.value)}
                          />
                          <input
                            type="number"
                            placeholder="Rating (1-5)"
                            min="1"
                            max="5"
                            value={r.rating}
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
                        value={state.contact_email}
                        onChange={(e) => updateState({ contact_email: e.target.value })}
                      />
                    </div>

                    <div className="input-block">
                      <label htmlFor="phoneNumber">Phone Number</label>
                      <input
                        id="phoneNumber"
                        type="tel"
                        value={state.phone_number}
                        onChange={(e) => updateState({ phone_number: e.target.value })}
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