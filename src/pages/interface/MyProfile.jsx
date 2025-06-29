// frontend/src/pages/interface/MyProfile.jsx

import React, { useRef, useEffect, useState, useContext } from "react";
import { Link } from 'react-router-dom';
import Sidebar from "../../components/Sidebar";
import PageHeader from "../../components/PageHeader";
// Keep original imports for default images for explicit fallbacks in JSX
import ProfileCardImage from "../../assets/images/background-hero.png";
import UserAvatar from "../../assets/images/People.png";
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

  const [coverPhotoFile, setCoverPhotoFile] = useState(null); // Actual File object for new cover photo
  const [avatarFile, setAvatarFile] = useState(null);     // Actual File object for new avatar
  const [workImageFiles, setWorkImageFiles] = useState([]); // Array of actual File objects for new work images

  const [coverPhotoRemoved, setCoverPhotoRemoved] = useState(false); // Flag for backend to explicitly remove cover photo
  const [isAvatarRemoved, setIsAvatarRemoved] = useState(false);   // Flag for backend to explicitly remove avatar

  const [activeBlobUrls, setActiveBlobUrls] = useState([]); // To keep track of object URLs for cleanup

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1000);

  const initialStoreState = useBusinessCardStore.getState().state;


  useEffect(() => {
    // console.log("RENDER - Current State:", JSON.parse(JSON.stringify(state)));
    // console.log("RENDER - isSubscribed:", isSubscribed);
    // console.log("RENDER - authLoading:", authLoading);
    // console.log("RENDER - isCardLoading (fetching card data):", isCardLoading);
    // console.log("RENDER - businessCard (fetched data):", businessCard);
  });


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
  }, [sidebarOpen]);

  useEffect(() => {
    if (sidebarOpen && isMobile) {
      document.body.classList.add('body-no-scroll');
    } else {
      document.body.classList.remove('body-no-scroll');
    };
  }, [sidebarOpen, isMobile]);

  useEffect(() => {
    // console.log removed as requested in earlier turns
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
    // console.log("EFFECT - businessCard useEffect triggered. BusinessCard:", businessCard, "isCardLoading:", isCardLoading);

    if (!isCardLoading && authUser) { // Only proceed if card data is not currently loading AND authUser is loaded
      if (businessCard) {
        // console.log("MyProfile useEffect: Business card found. Updating state from fetched data.", businessCard);
        activeBlobUrls.forEach(url => URL.revokeObjectURL(url)); // Clean up any old blob URLs
        setActiveBlobUrls([]);

        updateState({
          businessName: businessCard.business_card_name || '',
          pageTheme: businessCard.page_theme || 'light',
          font: businessCard.style || 'Inter',
          mainHeading: businessCard.main_heading || '',
          subHeading: businessCard.sub_heading || '',
          job_title: businessCard.job_title || '',
          full_name: businessCard.full_name || '',
          bio: businessCard.bio || '',
          avatar: businessCard.avatar || null, // Backend should return actual S3 URLs or null
          coverPhoto: businessCard.cover_photo || null, // Backend should return actual S3 URLs or null
          workImages: (businessCard.works || []).map(url => ({ file: null, preview: url })),
          services: (businessCard.services || []),
          reviews: (businessCard.reviews || []),
          contact_email: businessCard.contact_email || '',
          phone_number: businessCard.phone_number || '',
        });

        // Reset local file states and removal flags after successful fetch/update
        setCoverPhotoFile(null);
        setAvatarFile(null);
        setWorkImageFiles([]);
        setCoverPhotoRemoved(false);
        setIsAvatarRemoved(false);

        // console.log("MyProfile useEffect: state after updateState (from fetched data):", JSON.parse(JSON.stringify(useBusinessCardStore.getState().state)));

      } else { // businessCard is null, meaning no card exists for this user yet
        // console.log("MyProfile useEffect: No business card found for user. Resetting state to initial defaults.");
        resetState(); // Reset ALL state to initial defaults from businessCardStore.js
        // Clear local file states and removal flags, as we're starting fresh
        activeBlobUrls.forEach(url => URL.revokeObjectURL(url));
        setActiveBlobUrls([]);
        setCoverPhotoFile(null);
        setAvatarFile(null);
        setWorkImageFiles([]);
        setCoverPhotoRemoved(false);
        setIsAvatarRemoved(false);
      }
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

  // --- Image Upload Handlers ---
  const handleImageUpload = (e) => {
    e.preventDefault();
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      updateState({ coverPhoto: createAndTrackBlobUrl(file) }); // Update state with blob URL for preview
      setCoverPhotoFile(file); // Store the actual File object for upload
      setCoverPhotoRemoved(false); // Not marked for removal
    }
  };

  const handleAvatarUpload = (event) => {
    e.preventDefault();
    const file = event.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      updateState({ avatar: createAndTrackBlobUrl(file) }); // Update state with blob URL for preview
      setAvatarFile(file); // Store the actual File object for upload
      setIsAvatarRemoved(false); // No longer marked for removal
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
      file: file, // Store the actual File object
      preview: createAndTrackBlobUrl(file), // Store blob URL for preview
    }));
    updateState({
      workImages: [...state.workImages, ...newPreviewItems],
    });
    setWorkImageFiles(prevFiles => [...prevFiles, ...newImageFiles]);
  };

  // --- Image Removal Handlers ---
  const handleRemoveCoverPhoto = () => {
    const isCurrentlyDefault = state.coverPhoto === initialStoreState.coverPhoto;
    const isLocalBlob = state.coverPhoto && state.coverPhoto.startsWith('blob:');

    if (!isCurrentlyDefault && !isLocalBlob && state.coverPhoto) { // It's a persisted S3 URL
      setCoverPhotoRemoved(true); // Flag for backend to remove
    } else {
      setCoverPhotoRemoved(false); // Not removing a persisted image
    }

    if (isLocalBlob) { // Revoke blob URL if it was a local preview
      URL.revokeObjectURL(state.coverPhoto);
      setActiveBlobUrls(prev => prev.filter(url => url !== state.coverPhoto));
    }

    updateState({ coverPhoto: null }); // Clear preview regardless
    setCoverPhotoFile(null); // Clear file to upload
  };

  const handleRemoveAvatar = () => {
    const isCurrentlyDefault = state.avatar === initialStoreState.avatar;
    const isLocalBlob = state.avatar && state.avatar.startsWith('blob:');

    if (!isCurrentlyDefault && !isLocalBlob && state.avatar) { // It's a persisted S3 URL
      setIsAvatarRemoved(true); // Flag for backend to remove
    } else {
      setIsAvatarRemoved(false); // Not removing a persisted image
    }

    if (isLocalBlob) { // Revoke blob URL if it was a local preview
      URL.revokeObjectURL(state.avatar);
      setActiveBlobUrls(prev => prev.filter(url => url !== state.avatar));
    }

    updateState({ avatar: null }); // Clear preview regardless
    setAvatarFile(null); // Clear file to upload
  };

  const handleRemoveWorkImage = (indexToRemove) => {
    const removedItem = state.workImages?.[indexToRemove];
    const isInitialDefaultWorkImage = initialStoreState.workImages.some(defaultImg => defaultImg.preview === removedItem.preview);

    if (removedItem?.preview?.startsWith('blob:')) {
      URL.revokeObjectURL(removedItem.preview);
      setActiveBlobUrls(prev => prev.filter(url => url !== removedItem.preview));
    }

    const newWorkImages = state.workImages.filter((_, index) => index !== indexToRemove);
    updateState({ workImages: newWorkImages });

    setWorkImageFiles(prevFiles => prevFiles.filter(f => f !== removedItem.file));
  };

  // Other Handlers (Services, Reviews, Verification, etc.)
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
        if (item.file) { // If it's a new file upload
          return { file: item.file };
        }
        // If it's an existing image URL from backend that is NOT one of our initial defaults
        else if (item.preview && !initialStoreState.workImages.some(defaultImg => defaultImg.preview === item.preview)) {
          return item.preview; // Send its URL to keep it
        }
        return null; // It's a default image and hasn't been replaced/modified, so don't send it
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
      cover_photo: coverPhotoFile, // Pass the actual File object (or null)
      avatar: avatarFile,         // Pass the actual File object (or null)
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

        // IMPORTANT: Update state using fetched S3 URLs or actual nulls
        updateState({
          businessName: fetchedCardData.business_card_name,
          pageTheme: fetchedCardData.page_theme,
          font: fetchedCardData.style,
          mainHeading: fetchedCardData.main_heading,
          subHeading: fetchedCardData.sub_heading,
          job_title: fetchedCardData.job_title,
          full_name: fetchedCardData.full_name,
          bio: fetchedCardData.bio,
          avatar: fetchedCardData.avatar, // This should be the S3 URL or null
          coverPhoto: fetchedCardData.cover_photo, // This should be the S3 URL or null
          workImages: (fetchedCardData.works || []).map((url) => ({
            file: null, // It's no longer a local file after saving
            preview: url, // This will be the S3 URL
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
      toast.error("Something went wrong while saving. Check console for details.");
    }
  };

  const themeStyles = {
    backgroundColor: state.pageTheme === "dark" ? "#1F1F1F" : "#FFFFFF",
    color: state.pageTheme === "dark" ? "#FFFFFF" : "#000000",
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
    <div className={`myprofile-layout ${sidebarOpen && isMobile ? 'sidebar-active' : ''}`}>
      {/* MyProfile Mobile Header - Logo on left, Hamburger on right */}
      <div className="myprofile-mobile-header">
        {/* Logo on the left (order 1 in CSS) */}
        <Link to="/" className="myprofile-logo-link">
          <img src={LogoIcon} alt="Logo" className="myprofile-logo" />
        </Link>
        {/* Hamburger on the right (order 2 in CSS) */}
        <div
          className={`myprofile-hamburger ${sidebarOpen ? 'active' : ''}`}
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

      <main className="myprofile-main">
        <PageHeader
          title={authUser ? `Good Afternoon ${authUser.name}!` : "My Profile"}
          onActivateCard={handleActivateCard}
          onShareCard={handleShareCard}
        />

        {(authLoading || isCardLoading) && (
          <div style={{ padding: '20px', textAlign: 'center', fontSize: '1.2rem', color: '#666' }}>
            Loading profile data...
          </div>
        )}

        {!authLoading && !authUser && (
          <div style={{ padding: '20px', textAlign: 'center', color: 'red', border: '1px solid red', borderRadius: '8px', marginBottom: '30px', backgroundColor: '#ffe6e6' }}>
            <p style={{ marginBottom: '10px' }}>User not loaded. Please ensure you are logged in.</p>
            <button onClick={() => window.location.href = '/login'} style={{ padding: '8px 15px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Go to Login</button>
          </div>
        )}

        {!authLoading && authUser && (
          <>
            {showVerificationPrompt && (
              <div style={{
                backgroundColor: '#fffbe6',
                border: '1px solid #ffe58f',
                borderRadius: '8px',
                padding: '20px',
                marginBottom: '30px',
                textAlign: 'center',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                maxWidth: '600px',
                margin: '0 auto 30px auto'
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

            <div className="myprofile-content">
              <div className="mock-phone">
                <div className="mock-phone-scrollable-content">
                  {/* Use state.coverPhoto directly now, as it holds the default path or user upload */}
                  <img
                    src={state.coverPhoto} // Direct use of state.coverPhoto
                    alt="Cover"
                    className="mock-cover"
                  />
                  {/* Show remove button only if it's an uploaded image (blob) or not the initial default cover */}
                  {(state.coverPhoto && state.coverPhoto.startsWith('blob:')) || (state.coverPhoto && state.coverPhoto !== initialStoreState.coverPhoto) ? (
                    <button
                      className="remove-image-button"
                      onClick={handleRemoveCoverPhoto}
                      aria-label="Remove cover photo"
                    >
                      &times;
                    </button>
                  ) : null}

                  <h2 className="mock-title">{state.mainHeading}</h2>
                  <p className="mock-subtitle">{state.subHeading}</p>
                  <button
                    type="button"
                    style={{
                      backgroundColor:
                        state.pageTheme === "dark" ? "white" : "black",
                      color: state.pageTheme !== "dark" ? "white" : "black",
                    }}
                    className="mock-button"
                  >
                    Exchange Contact
                  </button>
                  {/* --- FIX: New wrapper div for About Me section --- */}
                  {(state.full_name || state.job_title || state.bio || state.avatar) && (
                    <div className="mock-about-container"> {/* This div will get the gray background */}
                      <p className="mock-section-title">About me</p> {/* This title is inside the grey box */}
                      {/* Inner flex container for avatar, name, job title, and bio */}
                      <div className="mock-about-content-group"> {/* New div to organize content within the grey box */}
                        <div className="mock-about-header-group"> {/* This div contains avatar, name, job title */}
                          {state.avatar && (
                            <img
                              src={state.avatar} // Direct use of state.avatar
                              alt="Avatar"
                              className="mock-avatar"
                            />
                          )}
                          {(state.avatar && state.avatar.startsWith('blob:')) || (state.avatar && state.avatar !== initialStoreState.avatar) ? (
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
                            <p className="mock-profile-name">{state.full_name}</p>
                            <p className="mock-profile-role">{state.job_title}</p>
                          </div>
                        </div>
                        {/* Bio text is now directly inside mock-about-content-group, after header-group */}
                        {state.bio && <p className="mock-bio-text">{state.bio}</p>}
                      </div>
                    </div>
                  )}

                  {/* My Work Section (Preview) */}
                  {(state.workImages && state.workImages.length > 0) && (
                    <>
                      <p className="mock-section-title">My Work</p>
                      <div className="mock-work-gallery">
                        {state.workImages.map((img, i) => {
                          const isInitialDefaultWorkImage = initialStoreState.workImages.some(defaultImg => defaultImg.preview === img.preview);
                          return (
                            <div key={i} style={{ position: 'relative', display: 'inline-block', width: '100px', height: '90px' }}>
                              <img
                                src={img.preview} // Direct use of img.preview
                                alt={`work-${i}`}
                                className="mock-work-image-item"
                              />
                              {(img.preview && img.preview.startsWith('blob:')) || (!isInitialDefaultWorkImage) ? (
                                <button
                                  type="button"
                                  className="remove-image-button"
                                  onClick={() => handleRemoveWorkImage(i)}
                                >
                                  X
                                </button>
                              ) : null}
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}

                  {/* My Services Section (Preview) */}
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

                  {/* Reviews Section (Preview) */}
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

            {/* --- EDITOR SECTION (Gated by Subscription) --- */}
            <div className="myprofile-editor-wrapper" style={{ position: 'relative' }}>
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
                      style={{ fontFamily: state.font }}
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
                        style={{ fontFamily: font }}
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
                    className="cover-preview-container"
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
                      src={state.coverPhoto} // Direct use of state.coverPhoto
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
                    className="cover-preview-container"
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
                      src={state.avatar} // Direct use of state.avatar
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
                      style={{ display: "block", marginTop: "10px", padding: "8px 15px", cursor: "pointer" }}
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
                  <button type="button" onClick={handleAddService}>
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
                  <button type="button" onClick={handleAddReview}>
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
                  style={{
                    backgroundColor: state.pageTheme === "dark" ? "white" : "black",
                    color: state.pageTheme !== "dark" ? "white" : "black",
                  }}
                >
                  Save Business Card
                </button>
              </form>
            </div>
          </>
        )}
        <ShareProfile
          isOpen={showShareModal}
          onClose={handleCloseShareModal}
          profileUrl={currentProfileUrl}
          qrCodeUrl={currentQrCodeUrl}
          contactDetails={contactDetailsForVCard}
          username={userUsername || ''}
        />
      </main>
    </div>
  );
}