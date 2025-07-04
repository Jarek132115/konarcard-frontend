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
        agree: false
    });

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 1000);
    const [showShareModal, setShowShareModal] = useState(false);

    const { user: authUser, loading: authLoading } = useContext(AuthContext);
    const userId = authUser?._id;
    const userUsername = authUser?.username;

    const { data: businessCard, isLoading: isCardLoading } = useFetchBusinessCard(userId);

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
        }
    }, [sidebarOpen, isMobile]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name || !formData.email || !formData.reason || !formData.message || !formData.agree) {
            toast.error('Please fill in all fields and agree to the privacy policy.');
            return;
        }

        try {
            const res = await api.post('/contact', formData);

            if (res.data.success) {
                toast.success('Message sent!');
                setFormData({
                    name: '',
                    email: '',
                    reason: '',
                    message: '',
                    agree: false
                });
            } else {
                toast.error(res.data.error || 'Something went wrong');
            }
        } catch (err) {
            console.error('Failed to send message:', err.response?.data?.error || err);
            toast.error(err.response?.data?.error || 'Failed to send message.');
        }
    };

    const handleShareCard = () => {
        if (!authUser?.isVerified) {
            toast.error("Please verify your email to share your card.");
            return;
        }
        setShowShareModal(true);
    };

    const handleCloseShareModal = () => {
        setShowShareModal(false);
    };

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
        <div className={`myprofile-layout ${sidebarOpen && isMobile ? 'sidebar-active' : ''}`}>
            <div className="myprofile-mobile-header">
                <Link to="/" className="myprofile-logo-link">
                    <img src={LogoIcon} alt="Logo" className="myprofile-logo" />
                </Link>
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
                <div className="page-wrapper">
                    <PageHeader
                        title="Contact Support"
                        onActivateCard={() => console.log("Activate Card clicked on Contact Support page")} // Dummy or specific action
                        onShareCard={handleShareCard}
                    />

                    <p className="desktop-body" style={{ textAlign: 'left', marginBottom: 20 }}>
                        Want to talk to us right now?{' '}
                        <span
                            className="live-chat-link"
                            style={{ color: '#007bff', textDecoration: 'underline', cursor: 'pointer' }}
                            onClick={() => {
                                if (window.tidioChatApi) {
                                    window.tidioChatApi.open();
                                }
                            }}
                        >
                            Start a live chat.
                        </span>
                    </p>

                    <form className='login-form' onSubmit={handleSubmit}> {/* Changed form class to login-form */}
                        <label htmlFor="name" className="form-label">Name</label> {/* Added label */}
                        <div className='contact-input-container'>
                            <input
                                type='text'
                                id='name' // Added ID for label association
                                name='name'
                                placeholder='Enter your name'
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className='standard-input' // Added standard-input class
                            />
                        </div>

                        <label htmlFor="email" className="form-label">Email</label> {/* Added label */}
                        <div className='contact-input-container'>
                            <input
                                type='email'
                                id='email' // Added ID for label association
                                name='email'
                                placeholder='Enter your email'
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className='standard-input' // Added standard-input class
                            />
                        </div>

                        <label htmlFor="reason" className="form-label">Reason for contact</label> {/* Added label */}
                        <div className='contact-input-container'>
                            <select
                                id='reason' // Added ID for label association
                                name='reason'
                                value={formData.reason}
                                onChange={handleChange}
                                required
                                className='standard-input' // Added standard-input class
                            >
                                <option value=''>Select a reason</option>
                                <option value='Card not working'>My card isn’t working</option>
                                <option value='Card damaged'>My card is damaged</option>
                                <option value='Profile issue'>I can’t see my profile</option>
                                <option value='Setup help'>Help setting up profile</option>
                                <option value='Other'>Other</option>
                            </select>
                        </div>

                        <label htmlFor="message" className="form-label">Your Message</label> {/* Added label */}
                        <div className='contact-input-container-message'>
                            <textarea
                                id='message' // Added ID for label association
                                name='message'
                                placeholder="Enter your message..."
                                value={formData.message}
                                onChange={handleChange}
                                required
                                className='standard-input' // Added standard-input class
                                rows="5" // Added rows for better textarea appearance
                            />
                        </div>

                        <label className='terms-label'>
                            <input
                                type='checkbox'
                                name='agree'
                                className='terms-checkbox konar-checkbox' // Added konar-checkbox for consistent styling
                                checked={formData.agree}
                                onChange={handleChange}
                                required
                            />
                            <span className='desktop-body-xs'>
                                I understand that Konar will securely hold my data in accordance with their privacy policy.
                            </span>
                        </label>

                        <button type='submit' className='primary-button verify-email-button' style={{ marginTop: 20 }}> {/* Changed to primary-button verify-email-button */}
                            Submit
                        </button>
                    </form>
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