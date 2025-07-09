import React, { useRef, useEffect, useState, useContext } from "react";
import { Link } from 'react-router-dom';
import Sidebar from "../../components/Sidebar";
import PageHeader from "../../components/PageHeader";
import ProfileCardImage from "../../assets/images/background-hero.png"; // Consider if still needed, as default comes from store
import UserAvatar from "../../assets/images/People.png"; // Consider if still needed, as default comes from store
import useBusinessCardStore from "../../store/businessCardStore";
import { useFetchBusinessCard } from "../../hooks/useFetchBusinessCard";
import {
  useCreateBusinessCard,
  buildBusinessCardFormData,
} from "../../hooks/useCreateBiz";
import axios from 'axios';
import { toast } from 'react-hot-toast';
import ShareProfile from "../../components/ShareProfile";
import { AuthContext } from "../../components/AuthContext";
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
  const { data: businessCard, isLoading: isCardLoading, isError: isCardError, error: cardError } = useFetchBusinessCard(userId);
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
    };
  }, [sidebarOpen, isMobile]);

  useEffect(() => {
    // This useEffect appears to be empty/redundant if not doing anything specific with these states
    // Consider removing if no logic is added here.
  }, [isCardLoading, isCardError, cardError]);

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
    if (!isCardLoading && authUser) {
      activeBlobUrls.forEach(url => URL.revokeObjectURL(url));
      setActiveBlobUrls([]);

      updateState({
        businessName: businessCard?.business_card_name || '',
        pageTheme: businessCard?.page_theme || 'light',
        font: businessCard?.style || 'Inter',
        mainHeading: businessCard?.main_heading || '',
        subHeading: businessCard?.sub_heading || '',
        job_title: businessCard?.job_title || '',
        full_name: businessCard?.full_name || '',
        bio: businessCard?.bio || '',
        avatar: businessCard?.avatar || null,
        coverPhoto: businessCard?.cover_photo || null,
        workImages: (businessCard?.works || []).map(url => ({ file: null, preview: url })),
        services: (businessCard?.services || []),
        reviews: (businessCard?.reviews || []),
        contact_email: businessCard?.contact_email || '',
        phone_number: businessCard?.phone_number || '',
      });
      setCoverPhotoFile(null);
      setAvatarFile(null);
      setWorkImageFiles([]);
      setCoverPhotoRemoved(false);
      setIsAvatarRemoved(false);
    }
  }, [businessCard, isCardLoading, updateState, resetState, authUser]);

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
    // const isInitialDefaultWorkImage = initialStoreState.workImages.some(defaultImg => defaultImg.preview === removedItem.preview); // This line seemed unused

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
          // If it's an existing URL not from the initial state, we send it back to keep it.
          // If it's from the initial state, it means it's already on the server, so no need to send again.
          // This logic might need refinement based on your backend's update strategy for existing works.
          // For now, assuming it handles existing URLs vs new files.
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
    // Changed to app-layout
    <div className={`app-layout ${sidebarOpen ? 'sidebar-active' : ''}`}>
      {/* CRITICAL: THIS IS THE MOBILE HEADER THAT IS ALWAYS VISIBLE AND CONTAINS THE HAMBURGER TO OPEN THE SIDEBAR */}
      <div className="myprofile-mobile-header">
        <Link to="/" className="myprofile-logo-link">
          <img src={LogoIcon} alt="Logo" className="myprofile-logo" />
        </Link>
        {/* This is the hamburger icon that opens the sidebar */}
        {/* Changed to sidebar-menu-toggle */}
        <div
          className={`sidebar-menu-toggle ${sidebarOpen ? 'active' : ''}`}
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>

      {/* The Sidebar component itself */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Overlay when sidebar is open on mobile */}
      {sidebarOpen && isMobile && (
        <div className="sidebar-overlay active" onClick={() => setSidebarOpen(false)}></div>
      )}

      {/* Main content area */}
      <main className="main-content-container"> {/* Changed to main-content-container */}
        <PageHeader
          title={authUser ? `Good Afternoon ${authUser.name}!` : "My Profile"}
          onActivateCard={handleActivateCard}
          onShareCard={handleShareCard}
        />

        {/* All main content for the page is now wrapped in combined-offer-container */}
        <div className="combined-offer-container">
          {(authLoading || isCardLoading) && (
            // Apply content-card-box for consistent styling
            <div className="content-card-box" style={{ textAlign: 'center', fontSize: '1.2rem', color: '#666' }}>
              Loading profile data...
            </div>
          )}

          {!authLoading && !authUser && (
            // Apply content-card-box for consistent styling
            <div className="content-card-box" style={{ textAlign: 'center', color: 'red', border: '1px solid red', backgroundColor: '#ffe6e6' }}>
              <p style={{ marginBottom: '10px' }}>User not loaded. Please ensure you are logged in.</p>
              <button onClick={() => window.location.href = '/login'} style={{ padding: '8px 15px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Go to Login</button>
            </div>
          )}

          {!authLoading && authUser && (
            <>
              {showVerificationPrompt && (
                // Apply content-card-box for consistent styling
                <div className="content-card-box" style={{
                  backgroundColor: '#fffbe6',
                  border: '1px solid #ffe58f',
                  textAlign: 'center',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                }}>
                  <p style={{ fontSize: '18px', fontWeight: '600', marginBottom: '15px', color: '#ffcc00' }}>
                    <span role="img" aria-label="warning" style={{ marginRight: '10px' }}>⚠️</span>
                    Your email is not verified!
                  </p>
                  <p style={{ marginBottom: '15px', color: '#555' }}>
                    Please verify your email address (<strong>{userEmail}</strong>) to unlock all features, including saving changes to your business card.
                  </p>
                  <form onSubmit={handleVerifyCode} style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '300px', margin: '0 auto' }}>
                    <input
                      type="text"
                      placeholder="Enter 6-digit code"
                      value={verificationCodeInput}
                      onChange={(e) => setVerificationCodeCode(e.target.value)}
                      maxLength={6}
                      style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '16px' }}
                    />
                    <button type="submit" style={{
                      padding: '10px 15px',
                      borderRadius: '8px',
                      backgroundColor: '#007bff',
                      color: 'white',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '16px',
                      fontWeight: '600'
                    }}>
                      Verify Email
                    </button>
                    <button
                      type="button"
                      onClick={sendVerificationCode}
                      disabled={resendCooldown > 0}
                      style={{
                        padding: '10px 15px',
                        borderRadius: '8px',
                        backgroundColor: resendCooldown > 0 ? '#e0e0e0' : '#f0f0f0',
                        color: resendCooldown > 0 ? '#999' : '#333',
                        border: '1px solid #ccc',
                        cursor: resendCooldown > 0 ? 'not-allowed' : 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
                    </button>
                  </form>
                </div>
              )}

              {/* This myprofile-flex-container should itself be contained and styled if it needs global centering */}
              {/* It represents the side-by-side layout of mock phone and editor */}
              <div className="myprofile-flex-container">
                <div className="myprofile-content">
                  <div
                    className={`mock-phone ${state.pageTheme === "dark" ? "dark-mode" : ""}`}
                    style={{ fontFamily: state.font }}
                  >
                    <div className="mock-phone-scrollable-content">
                      <img
                        src={state.coverPhoto || ProfileCardImage} // Fallback to local default if state.coverPhoto is null
                        alt="Cover"
                        className="mock-cover"
                      />
                      {(state.coverPhoto && state.coverPhoto.startsWith('blob:')) || (state.coverPhoto && state.coverPhoto !== ProfileCardImage) ? ( // Check against default image here
                        <button
                          className="remove-image-button"
                          onClick={handleRemoveCoverPhoto}
                          aria-label="Remove cover photo"
                        >
                          &times;
                        </button>
                      ) : null}

                      <h2 className="mock-title">{state.mainHeading || "Main Heading"}</h2> {/* Fallback text */}
                      <p className="mock-subtitle">{state.subHeading || "Subheading"}</p> {/* Fallback text */}
                      <button
                        type="button"
                        className="mock-button"
                      >
                        Exchange Contact
                      </button>
                      {(state.full_name || state.job_title || state.bio || state.avatar) && (
                        <div className="mock-about-container">
                          <p className="mock-section-title">About me</p>
                          <div className="mock-about-content-group">
                            <div className="mock-about-header-group">
                              {state.avatar && (
                                <img
                                  src={state.avatar || UserAvatar} // Fallback to local default
                                  alt="Avatar"
                                  className="mock-avatar"
                                />
                              )}
                              {(state.avatar && state.avatar.startsWith('blob:')) || (state.avatar && state.avatar !== UserAvatar) ? ( // Check against default image here
                                <button
                                  className="remove-image-button"
                                  onClick={handleRemoveAvatar}
                                  aria-label="Remove avatar"
                                  style={{ top: '10px', left: '10px' }}
                                >
                                  &times;
                                </button>
                              ) : null}
                              <div>
                                <p className="mock-profile-name">{state.full_name || "Full Name"}</p> {/* Fallback text */}
                                <p className="mock-profile-role">{state.job_title || "Job Title"}</p> {/* Fallback text */}
                              </div>
                            </div>
                            {state.bio && <p className="mock-bio-text">{state.bio}</p>}
                          </div>
                        </div>
                      )}

                      {(state.workImages && state.workImages.length > 0) && (
                        <>
                          <p className="mock-section-title">My Work</p>
                          <div className="mock-work-gallery">
                            {state.workImages.map((img, i) => (
                              <div key={i} style={{ position: 'relative', display: 'inline-block', width: '100px', height: '90px' }}>
                                <img
                                  src={img.preview}
                                  alt={`work-${i}`}
                                  className="mock-work-image-item"
                                />
                                <button
                                  type="button"
                                  className="remove-image-button"
                                  onClick={() => handleRemoveWorkImage(i)}
                                >
                                  X
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
                            // Removed inline style here. Add to CSS if needed.
                            >
                              Choose files
                            </button>
                          </div>
                        </>
                      )}

                      {(state.services && state.services.length > 0) && (
                        <>
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
                          <p className="mock-section-title">Reviews</p>
                          <div className="mock-reviews-list">
                            {state.reviews.map((r, i) => (
                              <div key={i} className="mock-review-card">
                                <div className="mock-star-rating">
                                  {Array(r.rating || 0).fill().map((_, starIdx) => (
                                    <span key={`filled-${starIdx}`}>★</span>
                                  ))}
                                  {Array(Math.max(0, 5 - (r.rating || 0))).fill().map((_, starIdx) => (
                                    <span key={`empty-${starIdx}`} style={{ color: '#ccc' }}>★</span>
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

                {/* Editor section - now also a content-card-box */}
                <div className="myprofile-editor-wrapper content-card-box" style={{ position: 'relative' }}>
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
                        onChange={handleImageUpload} // Added onChange directly to input
                      />
                      <div
                        className="cover-preview-container"
                        onClick={() => { fileInputRef.current && fileInputRef.current.click(); }} // Use ref to trigger click
                      >
                        <img
                          src={state.coverPhoto || ProfileCardImage} // Fallback to local default if state.coverPhoto is null
                          alt="Cover"
                          className="cover-preview"
                        />
                      </div>
                      {/* Removed inline style on button, should be handled by .remove-image-button in CSS */}
                      {(state.coverPhoto && state.coverPhoto.startsWith('blob:')) || (state.coverPhoto && state.coverPhoto !== ProfileCardImage) ? (
                        <button
                          className="remove-image-button"
                          onClick={handleRemoveCoverPhoto}
                          aria-label="Remove cover photo"
                        >
                          &times;
                        </button>
                      ) : null}
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
                        onChange={handleAvatarUpload} // Added onChange directly to input
                      />
                      <div
                        className="cover-preview-container"
                        onClick={() => { avatarInputRef.current && avatarInputRef.current.click(); }} // Use ref to trigger click
                      >
                        <img
                          src={state.avatar || UserAvatar} // Fallback to local default
                          alt="Avatar preview"
                          style={{
                            width: 80,
                            height: 80,
                            borderRadius: "50%",
                            marginTop: 8,
                            objectFit: "cover",
                          }}
                        />
                      </div>
                      {/* Removed inline style on button */}
                      {(state.avatar && state.avatar.startsWith('blob:')) || (state.avatar && state.avatar !== UserAvatar) ? (
                        <button
                          className="remove-image-button"
                          onClick={handleRemoveAvatar}
                          aria-label="Remove avatar"
                          style={{ top: '10px', left: '10px' }} // Keep this if button positioning needs to be relative to the image
                        >
                          &times;
                        </button>
                      ) : null}
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
                          <div key={i} style={{ position: 'relative', display: 'inline-block', width: '100px', height: '90px' }}>
                            <img
                              src={img.preview}
                              alt={`work-${i}`}
                              className="mock-work-image-item"
                            />
                            <button
                              type="button"
                              className="remove-image-button"
                              onClick={() => handleRemoveWorkImage(i)}
                            >
                              X
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          className="add-image-button" // Added class for consistent styling
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
                          Choose files
                        </button>
                      </div>
                    </div>

                    <div className="input-block">
                      <label>My Services</label>
                      {state.services.map((s, i) => (
                        <div key={i} className="review-card" style={{ display: 'flex', flexDirection: 'column', gap: '6px', position: 'relative' }}>
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
                          <button type="button" onClick={() => handleRemoveService(i)} style={{ alignSelf: 'flex-end', padding: '4px 8px', fontSize: '12px' }}>Remove</button>
                        </div>
                      ))}
                      <button type="button" className="add-item-button" onClick={handleAddService}> {/* Added class */}
                        + Add Service
                      </button>
                    </div>

                    <div className="input-block">
                      <label>Reviews</label>
                      {state.reviews.map((r, i) => (
                        <div key={i} className="review-card" style={{ display: 'flex', flexDirection: 'column', gap: '6px', position: 'relative' }}>
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
                          <button type="button" onClick={() => handleRemoveReview(i)} style={{ alignSelf: 'flex-end', padding: '4px 8px', fontSize: '12px' }}>Remove</button>
                        </div>
                      ))}
                      <button type="button" className="add-item-button" onClick={handleAddReview}> {/* Added class */}
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
        </div> {/* End of combined-offer-container */}
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