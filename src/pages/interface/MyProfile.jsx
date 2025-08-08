import React, { useRef, useEffect, useState, useContext } from "react";
import { Link, useLocation, useNavigate } from 'react-router-dom';
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
    const navigate = useNavigate();

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

    const location = useLocation();

    const [countdown, setCountdown] = useState(null);

    const isTrialActive = authUser && authUser.trialExpires && new Date(authUser.trialExpires) > new Date();
    const hasTrialEnded = authUser && authUser.trialExpires && new Date(authUser.trialExpires) <= new Date();

    // REMOVED THE CAUSING USEEFFECT. The application now relies on auth context updates.

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

        let timer;
        if (isTrialActive) {
            timer = setInterval(() => {
                const trialExpirationDate = new Date(authUser.trialExpires);
                const now = new Date();
                const timeRemaining = trialExpirationDate.getTime() - now.getTime();

                if (timeRemaining > 0) {
                    const minutes = Math.floor(timeRemaining / (1000 * 60));
                    const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);
                    setCountdown(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
                } else {
                    clearInterval(timer);
                    setCountdown("00:00");
                    // NEW: We no longer call refetchAuthUser here to prevent the infinite loop.
                    // The UI will update when a user navigates or manually triggers a fetch.
                }
            }, 1000);
        } else {
            setCountdown(null);
        }

        return () => clearInterval(timer);
    }, [location.search, isSubscribed, authLoading, authUser, refetchAuthUser, isTrialActive]);

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
        if (!isCardLoading && businessCard) {
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
            setCoverPhotoFile(null);
            setAvatarFile(null);
            setWorkImageFiles([]);
            setCoverPhotoRemoved(false);
            setIsAvatarRemoved(false);
        } else if (!isCardLoading && !businessCard) {
            resetState();
        }
    }, [businessCard, isCardLoading, updateState, resetState]);

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
                toast.success(trialResponse.data.message);
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
            state.workImages.length !== (originalCard.works?.length || 0)
        );
        return isStateDifferent;
    };
    
    const handleSubmit = async (e, fromTrialStart = false) => {
        e.preventDefault();

        // New check for subscribed users with no changes
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
            services: state.services.filter(s => s.name || s.price),
            reviews: state.reviews.filter(r => r.name || r.text),
            contact_email: state.contact_email,
            phone_number: state.phone_number,
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
    
    const handlePublishClick = async (e) => {
        e.preventDefault();

        if (!isSubscribed && !isTrialActive) {
            toast.error("Please start your free trial to publish your changes.");
            return;
        }

        if (!hasProfileChanges()) {
            toast.error("You haven't made any changes.");
            return;
        }
        
        // Final logic to submit the form if checks pass
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
            services: state.services.filter(s => s.name || s.price),
            reviews: state.reviews.filter(r => r.name || r.text),
            contact_email: state.contact_email,
            phone_number: state.phone_number,
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
        if(window.confirm("Are you sure you want to reset all your changes? This cannot be undone.")) {
            resetState();
            setCoverPhotoFile(null);
            setAvatarFile(null);
            setWorkImageFiles([]);
            setCoverPhotoRemoved(false);
            setIsAvatarRemoved(false);
            activeBlobUrls.forEach(url => URL.revokeObjectURL(url));
            setActiveBlobUrls([]);
            toast.success("Your page has been reset to default.");
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

    const getEditorValue = (fieldValue, placeholderValue) => {
        return fieldValue || placeholderValue || '';
    };

    const getEditorImageSrc = (imageState, placeholderImage) => {
        return imageState || placeholderImage || '';
    };

    const showAddImageText = (imageState) => {
        return !imageState;
    };

    const shouldBlurEditor = !isSubscribed && hasTrialEnded;

    const previewData = state;
    const isDarkMode = previewData.pageTheme === "dark";

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

                            {isTrialActive && countdown !== null && (
                                <div className="trial-countdown-banner">
                                    <p>Your free trial ends in {countdown}. <Link to="/subscription">Subscribe now!</Link></p>
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
                                            fontFamily: previewData.font || previewPlaceholders.font
                                        }}
                                    >
                                        <div className="mock-phone-scrollable-content">
                                            <img
                                                src={
                                                    previewData.coverPhoto || previewPlaceholders.coverPhoto
                                                }
                                                alt="Cover"
                                                className="mock-cover"
                                            />

                                            <h2 className="mock-title">
                                                {previewData.mainHeading || previewPlaceholders.mainHeading}
                                            </h2>
                                            <p className="mock-subtitle">
                                                {previewData.subHeading || previewPlaceholders.subHeading}
                                            </p>
                                            <button
                                                type="button"
                                                className="mock-button"
                                            >
                                                Exchange Contact
                                            </button>

                                            {(previewData.full_name || previewData.job_title || previewData.bio || previewData.avatar ||
                                                previewPlaceholders.full_name || previewPlaceholders.job_title || previewPlaceholders.bio || previewPlaceholders.avatar
                                            ) && (
                                                <>
                                                    <p className="mock-section-title">About me</p>
                                                    <div className="mock-about-container">
                                                        <div className="mock-about-content-group">
                                                            <div className="mock-about-header-group">
                                                                <img
                                                                    src={
                                                                        previewData.avatar || previewPlaceholders.avatar
                                                                    }
                                                                    alt="Avatar"
                                                                    className="mock-avatar"
                                                                />
                                                                <div>
                                                                    <p className="mock-profile-name">
                                                                        {previewData.full_name || previewPlaceholders.full_name}
                                                                    </p>
                                                                    <p className="mock-profile-role">
                                                                        {previewData.job_title || previewPlaceholders.job_title}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <p className="mock-bio-text">
                                                                {previewData.bio || previewPlaceholders.bio}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </>
                                            )}

                                            {(previewData.workImages.length > 0 || previewPlaceholders.workImages.length > 0) && (
                                                <>
                                                    <p className="mock-section-title">My Work</p>
                                                    <div className="mock-work-gallery">
                                                        {(previewData.workImages.length > 0
                                                            ? previewData.workImages
                                                            : previewPlaceholders.workImages
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
                                            )}

                                            {(previewData.services.length > 0 || previewPlaceholders.services.length > 0) && (
                                                <>
                                                    <p className="mock-section-title">My Services</p>
                                                    <div className="mock-services-list">
                                                        {(previewData.services.length > 0
                                                            ? previewData.services
                                                            : previewPlaceholders.services
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
                                                </>
                                            )}

                                            {(previewData.reviews.length > 0 || previewPlaceholders.reviews.length > 0) && (
                                                <>
                                                    <p className="mock-section-title">Reviews</p>
                                                    <div className="mock-reviews-list">
                                                        {(previewData.reviews.length > 0
                                                            ? previewData.reviews
                                                            : previewPlaceholders.reviews
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
                                                </>
                                            )}

                                            {(previewData.contact_email || previewData.phone_number ||
                                                previewPlaceholders.contact_email || previewPlaceholders.phone_number
                                            ) && (
                                                <>
                                                    <p className="mock-section-title">Contact Details</p>
                                                    <div className="mock-contact-details">
                                                        <div className="mock-contact-item">
                                                            <p className="mock-contact-label">Email:</p>
                                                            <p className="mock-contact-value">
                                                                {previewData.contact_email || previewPlaceholders.contact_email}
                                                            </p>
                                                        </div>
                                                        <div className="mock-contact-item">
                                                            <p className="mock-contact-label">Phone:</p>
                                                            <p className="mock-contact-value">
                                                                {previewData.phone_number || previewPlaceholders.phone_number}
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

                                    <form onSubmit={e => e.preventDefault()} className="myprofile-editor" style={{ filter: shouldBlurEditor ? 'blur(5px)' : 'none', pointerEvents: shouldBlurEditor ? 'none' : 'auto' }}>
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
                                        <h3 className="editor-subtitle">About Me Section</h3>

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
                                                value={getEditorValue(state.mainHeading, previewPlaceholders.mainHeading)}
                                                onChange={(e) => updateState({ mainHeading: e.target.value })}
                                                placeholder={previewPlaceholders.mainHeading}
                                            />
                                        </div>

                                        <div className="input-block">
                                            <label htmlFor="subHeading">Subheading</label>
                                            <input
                                                id="subHeading"
                                                type="text"
                                                value={getEditorValue(state.subHeading, previewPlaceholders.subHeading)}
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
                                                    src={getEditorImageSrc(state.avatar, previewPlaceholders.avatar)}
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
                                                    value={getEditorValue(state.full_name, previewPlaceholders.full_name)}
                                                    onChange={(e) => updateState({ full_name: e.target.value })}
                                                    placeholder={previewPlaceholders.full_name}
                                                />
                                            </div>

                                            <div className="input-block">
                                                <label htmlFor="jobTitle">Job Title</label>
                                                <input
                                                    id="jobTitle"
                                                    type="text"
                                                    value={getEditorValue(state.job_title, previewPlaceholders.job_title)}
                                                    onChange={(e) => updateState({ job_title: e.target.value })}
                                                    placeholder={previewPlaceholders.job_title}
                                                />
                                            </div>

                                            <div className="input-block">
                                                <label htmlFor="bio">About Me Description</label>
                                                <textarea
                                                    id="bio"
                                                    value={getEditorValue(state.bio, previewPlaceholders.bio)}
                                                    onChange={(e) => updateState({ bio: e.target.value })}
                                                    rows={4}
                                                    placeholder={previewPlaceholders.bio}
                                                />
                                            </div>
                                        </div>

                                        <hr className="divider" />
                                        <h3 className="editor-subtitle">My Work Section</h3>

                                        <div className="input-block">
                                            <label>Work Images</label>
                                            <div className="work-preview-row">
                                                {state.workImages.map((img, i) => (
                                                    <div key={i} className="work-image-item-wrapper">
                                                        <img
                                                            src={getEditorImageSrc(img.preview, previewPlaceholders.workImages?.[i]?.preview)}
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
                                                        value={getEditorValue(s.name, previewPlaceholders.services[0]?.name)}
                                                        onChange={(e) => handleServiceChange(i, "name", e.target.value)}
                                                    />
                                                    <input
                                                        type="text"
                                                        placeholder={previewPlaceholders.services[0]?.price || "Service Price/Detail"}
                                                        value={getEditorValue(s.price, previewPlaceholders.services[0]?.price)}
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
                                                        value={getEditorValue(r.name, previewPlaceholders.reviews[0]?.name)}
                                                        onChange={(e) => handleReviewChange(i, "name", e.target.value)}
                                                    />
                                                    <textarea
                                                        placeholder={previewPlaceholders.reviews[0]?.text || "Review text"}
                                                        rows={2}
                                                        value={getEditorValue(r.text, previewPlaceholders.reviews[0]?.text)}
                                                        onChange={(e) => handleReviewChange(i, "text", e.target.value)}
                                                    />
                                                    <input
                                                        type="number"
                                                        placeholder={previewPlaceholders.reviews[0]?.rating?.toString() || "Rating (1-5)"}
                                                        min="1"
                                                        max="5"
                                                        value={getEditorValue(r.rating, previewPlaceholders.reviews[0]?.rating)}
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
                                                value={getEditorValue(state.contact_email, previewPlaceholders.contact_email)}
                                                onChange={(e) => updateState({ contact_email: e.target.value })}
                                                placeholder={previewPlaceholders.contact_email}
                                            />
                                        </div>

                                        <div className="input-block">
                                            <label htmlFor="phoneNumber">Phone Number</label>
                                            <input
                                                id="phoneNumber"
                                                type="tel"
                                                value={getEditorValue(state.phone_number, previewPlaceholders.phone_number)}
                                                onChange={(e) => updateState({ phone_number: e.target.value })}
                                                placeholder={previewPlaceholders.phone_number}
                                            />
                                        </div>

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