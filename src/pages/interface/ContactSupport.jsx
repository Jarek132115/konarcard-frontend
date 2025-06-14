import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import Sidebar from '../../components/Sidebar';

export default function ContactSupport() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        reason: '',
        message: '',
        agree: false
    });

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
            // FIX: Use VITE_API_URL for API calls
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/contact`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await res.json();
            if (data.success) {
                toast.success('Message sent!');
                setFormData({
                    name: '',
                    email: '',
                    reason: '',
                    message: '',
                    agree: false
                });
            } else {
                toast.error(data.error || 'Something went wrong');
            }
        } catch (err) {
            console.error(err);
            toast.error('Failed to send message.');
        }
    };

    return (
        <div className="myprofile-layout">
            <Sidebar />
            <main className="myprofile-main">
                <div className="page-wrapper">
                    <div className="page-header">
                        <h2 className="page-title">Contact Support</h2>
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