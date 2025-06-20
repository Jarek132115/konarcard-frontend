import React, { useRef, useEffect, useState, useContext } from "react";
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

export default function MyProfile() {
  const { state, updateState } = useBusinessCardStore();
  const fileInputRef = useRef(null);
  const avatarInputRef = useRef(null);
  const workImageInputRef = useRef(null);

  const createBusinessCard = useCreateBusinessCard();
  const queryClient = useQueryClient();

  const { user: authUser, loading: authLoading, fetchUser: refetchAuthUser } = useContext(AuthContext);

  const userId = authUser?._id;
  const userEmail = authUser?.email;
  const isUserVerified = authUser?.isVerified;
  const userUsername = authUser?.username;

  const { data: businessCard, refetch: refetchBusinessCard } = useFetchBusinessCard(userId);

  const [showVerificationPrompt, setShowVerificationPrompt] = useState(false);
  const [verificationCodeInput, setVerificationCodeInput] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [showShareModal, setShowShareModal] = useState(false);

  // NEW: Separate useState for actual File objects, managed locally within this component
  const [coverPhotoFile, setCoverPhotoFile] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [workImageFiles, setWorkImageFiles] = useState([]); // Array of File objects for new work images

  // Existing state for tracking removal flags
  const [coverPhotoRemoved, setCoverPhotoRemoved] = useState(false);
  const [avatarRemoved, setAvatarRemoved] = useState(false);

  // Keep track of blob URLs created for previews so they can be revoked later
  const [activeBlobUrls, setActiveBlobUrls] = useState([]);

  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
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

  // Update local state (Zustand store) when businessCard data is fetched or updated by react-query
  // And reset the local File states upon new data load from backend
  useEffect(() => {
    if (businessCard) {
      // Clear any previous blob URLs as we are loading fresh data (actual S3 URLs)
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
        // avatar and coverPhoto in Zustand now only hold the display URL (S3 URL or blob URL)
        avatar: businessCard.avatar || null,
        coverPhoto: businessCard.cover_photo || null,
        // workImages in Zustand will be an array of { preview: S3_URL, file: null } after fetch
        workImages: (businessCard.works || []).map((url) => ({
          file: null, // Always null for existing S3 URLs
          preview: url,
        })),
        services: businessCard.services || [], // Assuming backend returns parsed array
        reviews: businessCard.reviews || [],   // Assuming backend returns parsed array
        contact_email: businessCard.contact_email || "",
        phone_number: businessCard.phone_number || "",
      });
      // Reset the local File states and removed flags as we're loading from backend (no new files selected yet)
      setCoverPhotoFile(null);
      setAvatarFile(null);
      setWorkImageFiles([]);
      setCoverPhotoRemoved(false);
      setAvatarRemoved(false);
      console.log('MyProfile useEffect: Zustand store updated from fetched businessCard (after load/save):', businessCard);
    }
  }, [businessCard, updateState]);

  // Cleanup for blob URLs when component unmounts
  useEffect(() => {
    return () => {
      activeBlobUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [activeBlobUrls]);

  // Helper to create blob URL and manage it in activeBlobUrls state for cleanup
  const createAndTrackBlobUrl = (file) => {
    const blobUrl = URL.createObjectURL(file);
    setActiveBlobUrls(prev => [...prev, blobUrl]);
    return blobUrl;
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    console.log('handleImageUpload: Selected file:', file);
    if (file && file.type.startsWith("image/")) {
      const blobUrl = createAndTrackBlobUrl(file);
      updateState({ coverPhoto: blobUrl }); // Update Zustand for preview
      setCoverPhotoFile(file);             // Store the actual File object in component's local state
      setCoverPhotoRemoved(false);
    }
    e.target.value = null; // Clear input value to allow re-uploading the same file
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files?.[0];
    console.log('handleAvatarUpload: Selected file:', file);
    if (file && file.type.startsWith("image/")) {
      const blobUrl = createAndTrackBlobUrl(file);
      updateState({ avatar: blobUrl }); // Update Zustand for preview
      setAvatarFile(file);               // Store the actual File object in component's local state
      setAvatarRemoved(false);
    }
    e.target.value = null;
  };

  const handleRemoveCoverPhoto = () => {
    if (state.coverPhoto && state.coverPhoto.startsWith('blob:')) {
      URL.revokeObjectURL(state.coverPhoto);
      setActiveBlobUrls(prev => prev.filter(url => url !== state.coverPhoto));
    }
    updateState({ coverPhoto: null }); // Clear preview in Zustand
    setCoverPhotoFile(null);          // Clear local File object
    setCoverPhotoRemoved(true);       // Set flag for backend
  };

  const handleRemoveAvatar = () => {
    if (state.avatar && state.avatar.startsWith('blob:')) {
      URL.revokeObjectURL(state.avatar);
      setActiveBlobUrls(prev => prev.filter(url => url !== state.avatar));
    }
    updateState({ avatar: null }); // Clear preview in Zustand
    setAvatarFile(null);          // Clear local File object
    setAvatarRemoved(true);       // Set flag for backend
  };

  const handleAddWorkImage = (e) => {
    const files = Array.from(e.target.files);
    console.log('handleAddWorkImage: Selected files:', files);
    if (files.length === 0) return;

    const newPreviewImages = files.map(file => ({
      file: file, // Keep reference to the actual file for FormData
      preview: createAndTrackBlobUrl(file), // Create and track blob URL for preview
    }));

    updateState({
      workImages: [...(state.workImages || []), ...newPreviewImages],
    });
    setWorkImageFiles(prevFiles => [...prevFiles, ...files]); // Store actual File objects in component's local state
    e.target.value = null; // Clear input to allow selecting same files again
  };

  const handleRemoveWorkImage = (indexToRemove) => {
    const removedItem = state.workImages?.[indexToRemove];
    if (removedItem?.preview?.startsWith('blob:')) {
      URL.revokeObjectURL(removedItem.preview);
      setActiveBlobUrls(prev => prev.filter(url => url !== removedItem.preview));
    }

    // Remove from Zustand's workImages (previews and file references)
    updateState({
      workImages: (state.workImages || []).filter((_, index) => index !== indexToRemove),
    });

    // Remove the corresponding file object from local workImageFiles state
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

  const handleSubmit = async () => {
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

    // Pass the separate File objects (from local useState) to buildBusinessCardFormData
    const formData = buildBusinessCardFormData({
      business_card_name: state.businessName,
      page_theme: state.pageTheme,
      style: state.font,
      main_heading: state.mainHeading,
      sub_heading: state.subHeading,
      job_title: state.job_title,
      full_name: state.full_name,
      bio: state.bio,
      user: userId,
      cover_photo: coverPhotoFile, // Use local state variable
      avatar: avatarFile,         // Use local state variable
      cover_photo_removed: coverPhotoRemoved,
      avatar_removed: avatarRemoved,
      works: state.workImages, // This now contains {file: File, preview: blobUrl} for NEW, and {file: null, preview: S3_URL} for existing
      services: state.services,
      reviews: state.reviews,
      contact_email: state.contact_email,
      phone_number: state.phone_number,
    });

    // ADDED LOGS FOR DEBUGGING FILE STATE BEFORE FormData (UPDATED to new state names)
    console.log('handleSubmit: coverPhotoFile BEFORE FormData:', coverPhotoFile);
    console.log('handleSubmit: avatarFile BEFORE FormData:', avatarFile);
    console.log('handleSubmit: workImageFiles (local state) BEFORE FormData:', workImageFiles); // Log the new local state

    try {
      const response = await createBusinessCard.mutateAsync(formData);
      toast.success("Business card saved successfully!");

      // OPTIONAL: Direct update of Zustand store with response.data for immediate UI feedback.
      // This is now the definitive update to make data persist visually on frontend after save.
      if (response.data) {
        updateState({
          businessName: response.data.business_card_name || "",
          pageTheme: response.data.page_theme || "light",
          font: response.data.style || "Inter",
          mainHeading: response.data.main_heading || "",
          subHeading: response.data.sub_heading || "",
          job_title: response.data.job_title || "",
          full_name: response.data.full_name || "",
          bio: response.data.bio || "",
          avatar: response.data.avatar || null,
          coverPhoto: response.data.cover_photo || null,
          workImages: (response.data.works || []).map((url) => ({
            file: null, // It's now an S3 URL, no longer a local File
            preview: url,
          })),
          services: response.data.services || [],
          reviews: response.data.reviews || [],
          contact_email: response.data.contact_email || "",
          phone_number: response.data.phone_number || "",
        });
        console.log('MyProfile handleSubmit: Zustand store updated directly after save with response data:', response.data);
      }

      queryClient.invalidateQueries(['business-card', userId]); // Invalidate cache for react-query to trigger refetch in background
      refetchAuthUser(); // Refetch auth user data in case username changed etc.
      // refetchBusinessCard(); // OPTIONAL: This explicit refetch might be redundant if invalidateQueries triggers it reliably

      // Clear the local File states and reset removed flags after successful save, as actual S3 URLs are now stored in Zustand
      setCoverPhotoFile(null);
      setAvatarFile(null);
      setWorkImageFiles([]); // Clear the array of File objects
      setCoverPhotoRemoved(false);
      setAvatarRemoved(false);

      // Clean up all active blob URLs after a successful save, as actual S3 URLs are now used for display
      activeBlobUrls.forEach(url => URL.revokeObjectURL(url));
      setActiveBlobUrls([]); // Clear the tracking array

    } catch (error) {
      toast.error("Something went wrong while saving. Check console for details.");
      console.error("Error creating/updating business card:", error.response?.data || error);
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

  const currentUserProfileUrl = userUsername ? `${window.location.origin}/u/${userUsername}` : '';

  return (
    <div className="myprofile-layout">
      <Sidebar />
      <main className="myprofile-main page-wrapper">
        <PageHeader
          title={authUser ? `Good Afternoon ${authUser.name}!` : "My Profile"}
          onActivateCard={handleActivateCard}
          onShareCard={handleShareCard}
        />

        {authLoading && (
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
                    onChange={(e) => setVerificationCodeInput(e.target.value)}
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
                          <>
                            <img
                              src={state.avatar}
                              alt="Avatar"
                              className="mock-avatar"
                            />
                            <button
                              className="remove-avatar-button"
                              onClick={handleRemoveAvatar}
                              aria-label="Remove avatar"
                            >
                              &times;
                            </button>
                          </>
                        )}
                        <div className="mock-about-text-group">
                          <div>
                            <p className="mock-name">{state.full_name}</p>
                            <p className="mock-role">{state.job_title}</p>
                          </div>
                          {state.bio && <p className="mock-bio-text">{state.bio}</p>}
                        </div>
                      </div>
                    </>
                  )}

                  {/* My Work Section (Preview) */}
                  {(state.workImages && state.workImages.length > 0) && (
                    <>
                      <p className="mock-section-title">My Work</p>
                      <div className="mock-work-images">
                        {(state.workImages || []).map((img, i) => (
                          <img
                            key={i}
                            src={img.preview}
                            alt={`work-${i}`}
                            className="mock-image-item"
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

              {/* --- EDITOR SECTION --- */}
              <div className="myprofile-editor">
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
                        key={font}
                        type="button"
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
                    onChange={handleImageUpload}
                    style={{ display: "none" }}
                  />
                  <div
                    className="cover-preview-container"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <img
                      src={state.coverPhoto || ProfileCardImage}
                      alt="Cover"
                      className="cover-preview"
                    />
                  </div>
                  {state.coverPhoto && (
                    <button
                      type="button"
                      onClick={handleRemoveCoverPhoto}
                      className="remove-button-below-image"
                    >
                      Remove Photo
                    </button>
                  )}
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
                    onChange={handleAvatarUpload}
                    style={{ display: "none" }}
                  />
                  <div
                    className="cover-preview-container"
                    onClick={() => avatarInputRef.current?.click()}
                    style={{ width: '80px', height: '80px', borderRadius: '50%', overflow: 'hidden', cursor: 'pointer' }}
                  >
                    <img
                      src={state.avatar || UserAvatar}
                      alt="Avatar preview"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  </div>
                  {state.avatar && (
                    <button
                      type="button"
                      onClick={handleRemoveAvatar}
                      className="remove-button-below-image"
                    >
                      Remove Avatar
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

                {/* My Work Section (Editor) */}
                <div className="input-block">
                  <label>My Work</label>
                  <div className="work-preview-row">
                    {(state.workImages || []).map((img, i) => (
                      <div key={i} style={{ position: 'relative', display: 'inline-block', width: '100px', height: '90px', margin: '5px', borderRadius: '8px', overflow: 'hidden' }}>
                        <img
                          src={img.preview}
                          alt={`work-${i}`}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        <button
                          type="button"
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
                          &times;
                        </button>
                      </div>
                    ))}
                    <input
                      ref={workImageInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAddWorkImage}
                      multiple
                      style={{ display: "block", marginTop: "10px" }}
                    />
                  </div>
                </div>

                {/* My Services Section (Editor) */}
                <div className="input-block">
                  <label>My Services</label>
                  {(state.services || []).map((s, i) => (
                    <div key={i} className="dynamic-form-item">
                      <input
                        type="text"
                        placeholder={`Service Name ${i + 1}`}
                        value={s.name}
                        onChange={(e) => handleServiceChange(i, "name", e.target.value)}
                      />
                      <input
                        type="text"
                        placeholder={`Service Price/Detail (e.g., Starting from $50) ${i + 1}`}
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

                {/* Reviews Section (Editor) */}
                <div className="input-block">
                  <label>Reviews</label>
                  {(state.reviews || []).map((r, i) => (
                    <div key={i} className="dynamic-form-item">
                      <input
                        type="text"
                        placeholder="Reviewer Name"
                        value={r.name}
                        onChange={(e) => handleReviewChange(i, "name", e.target.value)}
                      />
                      <textarea
                        placeholder="Review Text"
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

                {/* NEW SECTION: Exchange Contact Fields */}
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
                  onClick={handleSubmit}
                  className="submit-button"
                  style={{
                    backgroundColor: state.pageTheme === "dark" ? "white" : "black",
                    color: state.pageTheme !== "dark" ? "white" : "black",
                  }}
                >
                  Save Business Card
                </button>
              </div>
            </div>
          </>
        )} {/* End conditional rendering based on authUser */}
      </main>
      {/* Render ShareProfile Modal */}
      {showShareModal && (
        <ShareProfile
          isOpen={showShareModal}
          onClose={handleCloseShareModal}
          profileUrl={currentUserProfileUrl}
          qrCodeUrl={businessCard?.qrCodeUrl || ''}
          contactDetails={{
            full_name: state.full_name,
            job_title: state.job_title,
            business_card_name: state.businessName,
            bio: state.bio,
            contact_email: state.contact_email,
            phone_number: state.phone_number
          }}
          username={userUsername}
        />
      )}
    </div>
  );
}