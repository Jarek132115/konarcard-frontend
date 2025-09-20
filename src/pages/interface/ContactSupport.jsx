import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import Sidebar from '../../components/Sidebar';
import PageHeader from '../../components/PageHeader';
import ShareProfile from '../../components/ShareProfile';
import api from '../../services/api';
import LogoIcon from '../../assets/icons/Logo-Icon.svg';
import { AuthContext } from '../../components/AuthContext';
import { useFetchBusinessCard } from '../../hooks/useFetchBusinessCard';

export default function ContactSupport() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        reason: '',
        message: '',
        agree: true,
    });

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 1000);
    const [isSmallMobile, setIsSmallMobile] = useState(window.innerWidth <= 600);
    const [showShareModal, setShowShareModal] = useState(false);

    const { user: authUser } = useContext(AuthContext);
    const userId = authUser?._id;
    const userUsername = authUser?.username;
    const { data: businessCard } = useFetchBusinessCard(userId);

    // Prefill name/email if available
    useEffect(() => {
        setFormData((p) => ({
            ...p,
            name: p.name || authUser?.name || '',
            email: p.email || authUser?.email || '',
        }));
    }, [authUser]);

    // Auto-open chat if flagged
    useEffect(() => {
        if (localStorage.getItem('openChatOnLoad') !== '1') return;
        const started = Date.now();
        const tryOpen = () => {
            const ready =
                typeof window !== 'undefined' &&
                window.tidioChatApi &&
                typeof window.tidioChatApi.open === 'function';
            if (ready) {
                try { localStorage.removeItem('openChatOnLoad'); } catch { }
                window.tidioChatApi.open();
            } else if (Date.now() - started < 5000) {
                setTimeout(tryOpen, 200);
            } else {
                try { localStorage.removeItem('openChatOnLoad'); } catch { }
            }
        };
        tryOpen();
    }, []);

    useEffect(() => {
        const onResize = () => {
            const m = window.innerWidth <= 1000;
            const sm = window.innerWidth <= 600;
            setIsMobile(m);
            setIsSmallMobile(sm);
            if (!m && sidebarOpen) setSidebarOpen(false);
        };
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, [sidebarOpen]);

    useEffect(() => {
        if (sidebarOpen && isMobile) document.body.classList.add('body-no-scroll');
        else document.body.classList.remove('body-no-scroll');
    }, [sidebarOpen, isMobile]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.email || !formData.reason || !formData.message) {
            toast.error('Please fill in all required fields.');
            return;
        }
        try {
            const res = await api.post('/contact', formData);
            if (res.data.success) {
                toast.success('Message sent!');
                setFormData({ name: '', email: '', reason: '', message: '', agree: true });
            } else {
                toast.error(res.data.error || 'Something went wrong');
            }
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to send message.');
        }
    };

    const handleShareCard = () => {
        if (!authUser?.isVerified) {
            toast.error('Please verify your email to share your card.');
            return;
        }
        setShowShareModal(true);
    };
    const handleCloseShareModal = () => setShowShareModal(false);

    const contactDetailsForVCard = {
        full_name: businessCard?.full_name || authUser?.name || '',
        job_title: businessCard?.job_title || '',
        business_card_name: businessCard?.business_card_name || '',
        bio: businessCard?.bio || '',
        contact_email: businessCard?.contact_email || authUser?.email || '',
        phone_number: businessCard?.phone_number || '',
        username: userUsername || '',
    };

    const currentProfileUrl = userUsername ? `https://www.konarcard.com/u/${userUsername}` : '';
    const currentQrCodeUrl = businessCard?.qrCodeUrl || '';

    return (
        <div className={`app-layout ${sidebarOpen ? 'sidebar-active' : ''}`}>
            {/* mobile header */}
            <div className="myprofile-mobile-header">
                <Link to="/" className="myprofile-logo-link">
                    <img src={LogoIcon} alt="Logo" className="myprofile-logo" />
                </Link>
                <div
                    className={`sidebar-menu-toggle ${sidebarOpen ? 'active' : ''}`}
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                >
                    <span></span><span></span><span></span>
                </div>
            </div>

            <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            {sidebarOpen && isMobile && (
                <div className="sidebar-overlay active" onClick={() => setSidebarOpen(false)} />
            )}

            <main className="main-content-container">
                <PageHeader
                    title="Contact Support"
                    onActivateCard={() => { }}
                    onShareCard={handleShareCard}
                    isMobile={isMobile}
                    isSmallMobile={isSmallMobile}
                />

                {/* same desktop wrapper look as Profile page */}
                <div className="profile-page-wrapper contact">
                    <div className="settings-card">
                        <p className="desktop-body light-black contact-intro-text">
                            Want to talk to us right now?{' '}
                            <span
                                className="support-live-chat-link"
                                onClick={() => window.tidioChatApi && window.tidioChatApi.open()}
                            >
                                Start a live chat.
                            </span>
                        </p>

                        <form onSubmit={handleSubmit} className="support-form">
                            <label htmlFor="name" className="profile-label desktop-body-s black">Your Name</label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                placeholder="Enter your name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="profile-input-field desktop-body"
                            />

                            <label htmlFor="email" className="profile-label desktop-body-s black">Your Email</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="Enter your email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="profile-input-field desktop-body"
                            />

                            <label htmlFor="reason" className="profile-label desktop-body-s black">Reason for contact</label>
                            <select
                                id="reason"
                                name="reason"
                                value={formData.reason}
                                onChange={handleChange}
                                required
                                className="profile-input-field desktop-body"
                            >
                                <option value="">Select a reason</option>
                                <option value="Card not working">My card isn’t working</option>
                                <option value="Card damaged">My card is damaged</option>
                                <option value="Profile issue">I can’t see my profile</option>
                                <option value="Setup help">Help setting up profile</option>
                                <option value="Other">Other</option>
                            </select>

                            <label htmlFor="message" className="profile-label desktop-body-s black">Your Message</label>
                            <textarea
                                id="message"
                                name="message"
                                placeholder="Enter your message..."
                                value={formData.message}
                                onChange={handleChange}
                                required
                                rows="3"
                                className="profile-input-field desktop-body"
                            />

                            <button type="submit" className="cta-blue-button desktop-button" style={{ width: '100%' }}>
                                Submit
                            </button>
                        </form>
                    </div>
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
