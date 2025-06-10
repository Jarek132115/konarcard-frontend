import React, { useRef, useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import PageHeader from "../../components/PageHeader";
import ProfileCardImage from "../../assets/images/background-hero.png";
import UserAvatar from "../../assets/images/People.png";
import useBusinessCardStore from "../../store/businessCardStore";
import { useAuthUser } from "../../hooks/useAuthUser";
import { useFetchBusinessCard } from "../../hooks/useFetchBusinessCard";
import {
  useCreateBusinessCard,
  buildBusinessCardFormData,
} from "../../hooks/useCreateBiz";
import { useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import ShareProfile from "../../components/ShareProfile"; // <<<<<<<<<<<<<<< IMPORTANT: CORRECT IMPORT NAME

export default function MyProfile() {
  const { state, updateState } = useBusinessCardStore();
  const fileInputRef = useRef(null);
  const avatarInputRef = useRef(null);
  const workImageInputRef = useRef(null);

  const createBusinessCard = useCreateBusinessCard();
  const queryClient = useQueryClient();

  const { data: authUser, refetch: refetchAuthUser } = useAuthUser();
  const userId = authUser?.data?._id;
  const userEmail = authUser?.data?.email;
  const isUserVerified = authUser?.data?.isVerified;
  const userUsername = authUser?.data?.username; // Get username for profile URL

  const { data: businessCard } = useFetchBusinessCard(userId);

  const [showVerificationPrompt, setShowVerificationPrompt] = useState(false);
  const [verificationCodeInput, setVerificationCodeInput] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  useEffect(() => {
    if (authUser && !isUserVerified && userEmail) {
      setShowVerificationPrompt(true);
    } else if (isUserVerified) {
      setShowVerificationPrompt(false);
    }
  }, [authUser, isUserVerified, userEmail]);

  useEffect(() => {
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
        workImages: (businessCard.works || []).map((url) => ({
          file: null,
          preview: url,
        })),
        services: (businessCard.services || []).map(s => {
          if (typeof s === 'string') {
            const parts = s.split('Starting from');
            return {
              name: parts[0] ? parts[0].trim() : s,
              price: parts[1] ? `Starting from ${parts[1].trim()}` : '',
            };
          }
          return { name: s.name || '', price: s.price || '' };
        }),
        reviews: (businessCard.reviews || []).map(r => {
          const parsedRating = parseInt(r.rating);
          const safeRating = isNaN(parsedRating) ? 5 : Math.min(5, Math.max(0, parsedRating));
          return {
            name: r.name || '',
            text: r.text || '',
            rating: safeRating,
          };
        }),
        contact_email: businessCard.contact_email || "",
        phone_number: businessCard.phone_number || "",
      });
    }
  }, [businessCard, updateState]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      const blobUrl = URL.createObjectURL(file);
      updateState({ coverPhoto: blobUrl, coverPhotoFile: file });
    }
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const blobUrl = URL.createObjectURL(file);
      updateState({ avatar: blobUrl, avatarFile: file });
    }
  };

  const handleAddWorkImage = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const newWorkImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    updateState({
      workImages: [...(state.workImages || []), ...newWorkImages],
    });
    e.target.value = null;
  };

  const handleRemoveWorkImage = (indexToRemove) => {
    updateState({
      workImages: (state.workImages || []).filter((_, index) => index !== indexToRemove),
    });
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
      const res = await axios.post('/resend-code', { email: userEmail });
      if (res.data.error) {
        toast.error(res.data.error);
      } else {
        toast.success('Verification code sent to your email!');
        setResendCooldown(30);
      }
    } catch (err) {
      toast.error('Could not resend code.');
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
      const res = await axios.post('/verify-email', {
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
      toast.error('Verification failed.');
      console.error('Verification error:', err);
    }
  };


  const handleSubmit = async () => {
    if (!userId) {
      alert("User not loaded yet.");
      return;
    }

    if (!isUserVerified) {
      toast.error("Please verify your email address to save changes.");
      return;
    }

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
      cover_photo: state.coverPhotoFile,
      avatar: state.avatarFile,
      works: state.workImages,
      services: state.services,
      reviews: state.reviews,
      contact_email: state.contact_email,
      phone_number: state.phone_number,
    });

    try {
      await createBusinessCard.mutateAsync(formData);
      toast.success("Business card saved!");
      queryClient.invalidateQueries(['business-card', userId]);
    } catch (error) {
      toast.error("Something went wrong while saving.");
      console.error("Error creating business card:", error);
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

  const currentUserProfileUrl = userUsername ? `<span class="math-inline">\{window\.location\.origin\}/u/</span>{userUsername}` : '';


  return (
    <div className="myprofile-layout">
      <Sidebar />
      <main className="myprofile-main page-wrapper">
        {/* REPLACED with PageHeader Component */}
        <PageHeader
          title="Good Afternoon Jarek!"
          onActivateCard={handleActivateCard}
          onShareCard={handleShareCard}
        />

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
                    style={{
                      fontFamily: font,
                    }}
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
            </div>

            <div className="input-block">
              <label htmlFor="mainHeading">Main Heading</label>
              <input
                id="mainHeading"
                type="text"
                value={state.mainHeading}
                onChange={(e) =>
                  updateState({ mainHeading: e.target.value })
                }
              />
            </div>

            <div className="input-block">
              <label htmlFor="subHeading">Subheading</label>
              <input
                id="subHeading"
                type="text"
                value={state.subHeading}
                onChange={(e) =>
                  updateState({ subHeading: e.target.value })
                }
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

            {/* My Work Section (Editor) */}
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

            {/* Reviews Section (Editor) */}
            <div className="input-block">
              <label>Reviews</label>
              {(state.reviews || []).map((r, i) => (
                <div key={i} className="review-card" style={{ display: 'flex', flexDirection: 'column', gap: '6px', position: 'relative' }}>
                  <input
                    type="text"
                    placeholder="Reviewer Name"
                    value={r.name}
                    onChange={(e) =>
                      handleReviewChange(i, "name", e.target.value)
                    }
                  />
                  <textarea
                    placeholder="Review"
                    rows={2}
                    value={r.text}
                    onChange={(e) =>
                      handleReviewChange(i, "text", e.target.value)
                    }
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
                type="tel" // Use type="tel" for phone numbers
                value={state.phone_number || ""}
                onChange={(e) => updateState({ phone_number: e.target.value })}
              />
            </div>

            <button
              onClick={handleSubmit}
              className="submit-button"
              style={{
                backgroundColor:
                  state.pageTheme === "dark" ? "white" : "black",
                color: state.pageTheme !== "dark" ? "white" : "black",
              }}
            >
              Save Business Card
            </button>
          </div>
        </div>
      </main>
      {/* Render ShareProfile Modal */}
      {showShareModal && ( // Only render if showShareModal is true
        <ShareProfile
          isOpen={showShareModal}
          onClose={handleCloseShareModal}
          profileUrl={currentUserProfileUrl} // Pass constructed profile URL
          qrCodeUrl={businessCard?.qrCodeUrl || ''} // Pass QR code URL from businessCard
          contactDetails={{
            full_name: state.full_name,
            job_title: state.job_title,
            business_card_name: state.businessName,
            bio: state.bio,
            contact_email: state.contact_email,
            phone_number: state.phone_number
          }}
          username={userUsername} // Pass username to the modal
        />
      )}
    </div>
  );
}