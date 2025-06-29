// frontend/src/pages/interface/MyProfile.jsx

import React, { useRef, useEffect, useState, useContext } from "react";
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from "../../components/Sidebar";
import PageHeader from "../../components/PageHeader";
import ProfileCardImage from "../../assets/images/background-hero.png";
import UserAvatar from "../../assets/images/People.png";
import useBusinessCardStore from "../../store/businessCardStore";
import { useFetchBusinessCard } from "../../hooks/useFetchBusinessCard";
import {
  useCreateBusinessCard,
  buildBusinessCardFormData,
} from "../../hooks/useCreateBiz";
import { useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'react-hot-toast';

import ShareProfile from "../../components/ShareProfile";
import { AuthContext } from "../../components/AuthContext";
import api from '../../services/api';

// Icon imports for MyProfile's mobile header
import LogoIcon from '../../assets/icons/Logo-Icon.svg';

export default function MyProfile() {
  const { state, updateState } = useBusinessCardStore();
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

  const { data: businessCard, refetch: refetchBusinessCard, isLoading: isCardLoading, isError: isCardError, error: cardError } = useFetchBusinessCard(userId);

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

  const [sidebarOpen, setSidebarOpen] = useState(false); // State for sidebar visibility
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1000); // State to track mobile view


  // Effect to update isMobile state on window resize
  useEffect(() => {
    const handleResize = () => {
      const currentIsMobile = window.innerWidth <= 1000;
      setIsMobile(currentIsMobile);
      // If we resize from mobile to desktop, ensure sidebar is closed visually
      if (!currentIsMobile && sidebarOpen) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [sidebarOpen]); // Dependency on sidebarOpen to ensure correct behavior on resize after opening/closing


  useEffect(() => {
    console.log("MyProfile Component Rendered. AuthUser:", authUser, "AuthLoading:", authLoading, "isSubscribed:", isSubscribed);
    console.log("MyProfile userId:", userId, "isUserVerified:", isUserVerified);
    if (isCardLoading) console.log("useFetchBusinessCard: Loading business card data...");
    if (isCardError) console.error("useFetchBusinessCard: Error fetching business card:", cardError);
    if (businessCard) console.log("useFetchBusinessCard: Fetched business card data:", businessCard);
  }, [authUser, authLoading, userId, isCardLoading, isCardError, cardError, businessCard, isSubscribed]);

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
    if (businessCard) {
      activeBlobUrls.forEach(url => URL.revokeObjectURL(url));
      setActiveBlobUrls([]);

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
        workImages: (businessCard.works || []).map((url) => ({
          file: null,
          preview: url,
        })),
        services: businessCard.services || [],
        reviews: businessCard.reviews || [],
        contact_email: businessCard.contact_email || "",
        phone_number: businessCard.phone_number || "",
      });
      setCoverPhotoFile(null);
      setAvatarFile(null);
      setWorkImageFiles([]);
      setCoverPhotoRemoved(false);
      setIsAvatarRemoved(false);
      console.log('MyProfile useEffect: Zustand store updated from fetched businessCard (after load/save):', businessCard);
    }
  }, [businessCard, updateState]);

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
    if (!e.target || !e.target.files || e.target.files.length === 0) {
      console.error("handleImageUpload: No file selected or files array is empty/null.");
      return;
    }
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      const blobUrl = createAndTrackBlobUrl(file);
      updateState({ coverPhoto: blobUrl });
      setCoverPhotoFile(file);
      setCoverPhotoRemoved(false);
    } else {
      console.warn("handleImageUpload: Selected file is not an image or is null.");
    }
  };

  const handleAvatarUpload = (event) => {
    event.preventDefault();
    if (!event.target || !event.target.files || event.target.files.length === 0) {
      console.error("handleAvatarUpload: No file selected or files array is empty/null.");
      return;
    }
    const file = event.target.files[0];
    if (file && file.type.startsWith("image/")) {
      const blobUrl = createAndTrackBlobUrl(file);
      updateState({ avatar: blobUrl });
      setAvatarFile(file);
      setIsAvatarRemoved(false);
    } else {
      console.warn("handleAvatarUpload: Selected file is not an image or is null.");
    }
  };

  const handleAddWorkImage = (e) => {
    e.preventDefault();
    if (!e.target || !e.target.files || e.target.files.length === 0) {
      console.error("handleAddWorkImage: No files selected or files array is empty/null.");
      return;
    }
    const files = Array.from(e.target.files);
    const newImageFiles = files.filter(file => file && file.type.startsWith("image/"));
    if (newImageFiles.length === 0) {
      console.warn("handleAddWorkImage: No valid image files selected.");
      return;
    }
    const newPreviewItems = newImageFiles.map(file => ({
      file: file,
      preview: createAndTrackBlobUrl(file),
    }));
    updateState({
      workImages: [...(state.workImages || []), ...newPreviewItems],
    });
    setWorkImageFiles(prevFiles => [...prevFiles, ...newImageFiles]);
  };

  const handleRemoveCoverPhoto = () => {
    if (state.coverPhoto && state.coverPhoto.startsWith('blob:')) {
      URL.revokeObjectURL(state.coverPhoto);
      setActiveBlobUrls(prev => prev.filter(url => url !== state.coverPhoto));
    }
    updateState({ coverPhoto: null });
    setCoverPhotoFile(null);
    setCoverPhotoRemoved(true);
  };

  const handleRemoveAvatar = () => {
    if (state.avatar && state.avatar.startsWith('blob:')) {
      URL.revokeObjectURL(state.avatar);
      setActiveBlobUrls(prev => prev.filter(url => url !== state.avatar));
    }
    updateState({ avatar: null });
    setAvatarFile(null);
    setIsAvatarRemoved(true);
  };

  const handleRemoveWorkImage = (indexToRemove) => {
    const removedItem = state.workImages?.[indexToRemove];
    if (removedItem?.preview?.startsWith('blob:')) {
      URL.revokeObjectURL(removedItem.preview);
      setActiveBlobUrls(prev => prev.filter(url => url !== removedItem.preview));
    }
    updateState({
      workImages: (state.workImages || []).filter((_, index) => index !== indexToRemove),
    });
    setWorkImageFiles(prevFiles => prevFiles.filter((_, index) => index !== indexToRemove));
  };

  const handleAddService = () => {
    updateState({ services: [...(state.services || []), { name: "", price: "" }] });
  };

  const handleServiceChange = (index, field, value) => {
    const updated = [...state.services];
    updated[index] = { ...updated[index], [field]: value };
    updateState({ services: updated });
  };

  const handleRemoveService = (indexToRemove) => {
    updateState({
      services: (state.services || []).filter((_, index) => index !== indexToRemove),
    });
  };

  const handleAddReview = () => {
    updateState({
      reviews: [...(state.reviews || []), { name: "", text: "", rating: 5 }],
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
      reviews: (state.reviews || []).filter((_, index) => index !== indexToRemove),
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
      console.error('Resend code error:', err);
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
        refetchAuthUser();
        setVerificationCodeInput('');
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Verification failed.');
      console.error('Verification error:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("CLICK! handleSubmit was called.");
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
    // Gating Save Functionality
    if (!isSubscribed) {
      toast.error("Please subscribe to edit your profile.");
      return;
    }

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
      works: [
        ...(state.workImages || []).filter(item => !item.file),
        ...(workImageFiles || []).map(file => ({ file: file }))
      ],
      services: state.services,
      reviews: state.reviews,
      contact_email: state.contact_email || "",
      phone_number: state.phone_number || "",
    });

    console.log('handleSubmit: coverPhotoFile BEFORE FormData:', coverPhotoFile);
    console.log('handleSubmit: avatarFile BEFORE FormData:', avatarFile);
    console.log('handleSubmit: workImageFiles (local state) BEFORE FormData:', workImageFiles);
    console.log("Sending FormData:");

    for (let pair of formData.entries()) {
      console.log(pair[0] + ': ' + (pair[1] instanceof File ? `[File object: ${pair[1].name}, type: ${pair[1].type}]` : pair[1]));
    }

    try {
      const response = await createBusinessCard.mutateAsync(formData);
      console.log("Save API Response:", response);
      toast.success("Business card saved successfully!");

      if (response.data && response.data.data) {
        const fetchedCardData = response.data.data;
        console.log("Frontend: Response data for updateState:", fetchedCardData);

        updateState({
          businessName: fetchedCardData.business_card_name || "",
          pageTheme: fetchedCardData.page_theme || "light",
          font: fetchedCardData.style || "Inter",
          mainHeading: fetchedCardData.main_heading || "",
          subHeading: fetchedCardData.sub_heading || "",
          job_title: fetchedCardData.job_title || "",
          full_name: fetchedCardData.full_name || "",
          bio: fetchedCardData.bio || "",
          avatar: fetchedCardData.avatar || null,
          coverPhoto: fetchedCardData.cover_photo || null,
          workImages: (fetchedCardData.works || []).map((url) => ({
            file: null,
            preview: url,
          })),
          services: fetchedCardData.services || [],
          reviews: fetchedCardData.reviews || [],
          contact_email: fetchedCardData.contact_email || "",
          phone_number: fetchedCardData.phone_number || "",
        });
        console.log('MyProfile useEffect: Zustand store updated directly after save with response data:', fetchedCardData);

      } else {
        console.error("Frontend: Backend response missing expected 'data' field:", response.data);
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
      console.error("Error creating/updating business card (frontend catch):", error.response?.data || error);
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
      console.error("Frontend: Error starting subscription:", error.response?.data || error);
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
    // Apply 'sidebar-active' class to myprofile-layout when sidebar is open on mobile
    // This class helps to prevent scrolling on the main page when mobile sidebar is open
    <div className={`myprofile-layout ${sidebarOpen && isMobile ? 'sidebar-active' : ''}`}>
      {/* NEW: Mobile Header for MyProfile page (always visible on mobile) */}
      <div className="myprofile-mobile-header">
        <div
          className={`myprofile-hamburger ${sidebarOpen ? 'active' : ''}`}
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </div>
        <Link to="/" className="myprofile-logo-link">
          <img src={LogoIcon} alt="Logo" className="myprofile-logo" />
        </Link>
      </div>

      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Overlay for mobile sidebar. Only render if sidebarOpen is true AND it's a mobile view */}
      {sidebarOpen && isMobile && (
        <div className="sidebar-overlay active" onClick={() => setSidebarOpen(false)}></div>
      )}

      <main className="myprofile-main">
        <PageHeader
          title={authUser ? `Good Afternoon ${authUser.name}!` : "My Profile"}
          onActivateCard={handleActivateCard}
          onShareCard={handleShareCard}
        />

        {authLoading || isCardLoading && (
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
              {/* --- PREVIEW SECTION --- */}
              <div className="myprofile-preview">
                <div
                  className="mock-phone"
                  style={{ fontFamily: state.font, ...themeStyles }}
                >
                  <div className="mock-phone-scrollable-content">
                    <img
                      src={state.coverPhoto || ProfileCardImage}
                      alt="Cover"
                      className="mock-cover"
                    />
                    {state.coverPhoto && (
                      <button
                        className="remove-image-button"
                        onClick={handleRemoveCoverPhoto}
                        aria-label="Remove cover photo"
                      >
                        &times;
                      </button>
                    )}
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
                    {(state.full_name || state.job_title || state.bio || state.avatar) && (
                      <>
                        <p className="mock-section-title">
                          About me
                        </p>
                        <div className="mock-about">
                          {state.avatar && (
                            <img
                              src={state.avatar}
                              alt="Avatar"
                              className="mock-avatar"
                            />
                          )}
                          <div>
                            <p className="mock-profile-name">{state.full_name}</p>
                            <p className="mock-profile-role">{state.job_title}</p>
                          </div>
                        </div>
                        {state.bio && <p className="mock-bio-text">{state.bio}</p>}
                      </>
                    )}

                    {/* My Work Section (Preview) */}
                    {(state.workImages && state.workImages.length > 0) && (
                      <>
                        <p className="mock-section-title">My Work</p>
                        <div className="mock-work-gallery">
                          {(state.workImages || []).map((img, i) => (
                            <img
                              key={i}
                              src={img.preview}
                              alt={`work-${i}`}
                            />
                          ))}
                        </div>
                      </>
                    )}

                    {/* My Services Section (Preview) */}
                    {(state.services && state.services.length > 0) && (
                      <>
                        <p className="mock-section-title">My Services</p>
                        <div className="mock-services-list">
                          {(state.services || []).map((s, i) => (
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
                          {(state.reviews || []).map((r, i) => (
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
                        src={state.coverPhoto || ProfileCardImage}
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
                      value={state.job_title || ""}
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
                        src={state.avatar || UserAvatar}
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
                      value={state.full_name || ""}
                      onChange={(e) => updateState({ full_name: e.target.value })}
                    />
                  </div>

                  <div className="input-block">
                    <label htmlFor="bio">About Me</label>
                    <textarea
                      id="bio"
                      value={state.bio || ""}
                      onChange={(e) => updateState({ bio: e.target.value })}
                      rows={4}
                    />
                  </div>

                  <div className="input-block">
                    <label>My Work</label>
                    <div className="work-preview-row">
                      {(state.workImages || []).map((img, i) => (
                        <div key={i} style={{ position: 'relative', display: 'inline-block', width: '100px', height: '90px' }}>
                          <img
                            src={img.preview}
                            alt={`work-${i}`}
                            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }}
                          />
                          <button
                            type="button"
                            className="remove-image-button"
                            onClick={() => handleRemoveWorkImage(i)}
                            style={{
                              position: 'absolute',
                              top: '5px',
                              right: '5px',
                              background: 'rgba(255, 255, 255, 0.7)',
                              border: 'none',
                              borderRadius: '50%',
                              width: '20px',
                              height: '20px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              fontSize: '12px',
                              fontWeight: 'bold',
                              color: '#333',
                              boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                            }}
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
                    {(state.services || []).map((s, i) => (
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
                    {(state.reviews || []).map((r, i) => (
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
                      value={state.contact_email || ""}
                      onChange={(e) => updateState({ contact_email: e.target.value })}
                    />
                  </div>

                  <div className="input-block">
                    <label htmlFor="phoneNumber">Phone Number</label>
                    <input
                      id="phoneNumber"
                      type="tel"
                      value={state.phone_number || ""}
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
            </div>
          </>
        )}
        <ShareProfile
          isOpen={showShareModal}
          onClose={handleCloseShareModal}
          profileUrl={currentProfileUrl}
          qrCodeUrl={currentQrCodeUrl}
          contactDetails={contactDetailsForVCard}
          username={userUsername}
        />
      </main>
    </div>
  );
}