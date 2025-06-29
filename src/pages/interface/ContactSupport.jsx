import React, { useState, useEffect } from 'react'; // Import useState and useEffect
import { Link } from 'react-router-dom'; // Import Link for Logo
import { toast } from 'react-hot-toast';
import Sidebar from '../../components/Sidebar';
import api from '../../services/api';
import LogoIcon from '../../assets/icons/Logo-Icon.svg'; // Import LogoIcon

export default function ContactSupport() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        reason: '',
        message: '',
        agree: false
    });

    // New state for sidebar and mobile responsiveness
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 1000);

    // Effect for handling window resize to update isMobile state
    useEffect(() => {
        const handleResize = () => {
            const currentIsMobile = window.innerWidth <= 1000;
            setIsMobile(currentIsMobile);
            if (!currentIsMobile && sidebarOpen) {
                setSidebarOpen(false); // Close sidebar if transitioning from mobile to desktop
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [sidebarOpen]); // Re-evaluate when sidebarOpen changes

    // Effect for controlling body scroll when sidebar is open on mobile
    useEffect(() => {
        if (sidebarOpen && isMobile) {
            document.body.classList.add('body-no-scroll');
        } else {
            document.body.classList.remove('body-no-scroll');
        }
    }, [sidebarOpen, isMobile]); // Re-evaluate when sidebarOpen or isMobile changes


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

    return (
        // Apply myprofile-layout and dynamic sidebar-active class
        <div className={`myprofile-layout ${sidebarOpen && isMobile ? 'sidebar-active' : ''}`}>
            {/* MyProfile Mobile Header - Replicated from MyProfile.jsx */}
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

            {/* Sidebar component, passing state and setter */}
            <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

            {/* Sidebar overlay for mobile */}
            {sidebarOpen && isMobile && (
                <div className="sidebar-overlay active" onClick={() => setSidebarOpen(false)}></div>
            )}

            <main className="myprofile-main">
                <div className="page-wrapper">
                    <div className="page-header">
                        <h2 className="page-title">Contact Support</h2>
                        {/* These buttons are likely not needed on a contact support page, but keeping them as per original */}
                        <div className="page-actions">
                            <button className="header-button black">🖱️ Activate Your Card</button>
                            <button className="header-button white">🔗 Share Your Card</button>
                        </div>
                    </div>

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

                    <form className='contact-form' onSubmit={handleSubmit}>
                        <div className='contact-input-container'>
                            <input
                                type='text'
                                name='name'
                                placeholder='Enter your name'
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className='contact-input-container'>
                            <input
                                type='email'
                                name='email'
                                placeholder='Enter your email'
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className='contact-input-container'>
                            <select
                                name='reason'
                                value={formData.reason}
                                onChange={handleChange}
                                required
                            >
                                <option value=''>Select a reason</option>
                                <option value='Card not working'>My card isn’t working</option>
                                <option value='Card damaged'>My card is damaged</option>
                                <option value='Profile issue'>I can’t see my profile</option>
                                <option value='Setup help'>Help setting up profile</option>
                                <option value='Other'>Other</option>
                            </select>
                        </div>

                        <div className='contact-input-container-message'>
                            <textarea
                                name='message'
                                placeholder="Enter your message..."
                                value={formData.message}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <label className='terms-label'>
                            <input
                                type='checkbox'
                                name='agree'
                                className='terms-checkbox'
                                checked={formData.agree}
                                onChange={handleChange}
                                required
                            />
                            <span className='desktop-body-xs'>
                                I understand that Konar will securely hold my data in accordance with their privacy policy.
                            </span>
                        </label>

                        <button type='submit' className='blue-button desktop-button' style={{ marginTop: 20 }}>
                            Submit
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
}