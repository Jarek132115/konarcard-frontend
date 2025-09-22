import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import api from '../../services/api';

// (Optional) keep your FAQ icons+section below if you still want it on this page
import IDCardIcon from '../../assets/icons/IDCard-Icon.svg';
import NFCIcon from '../../assets/icons/NFC-Icon.svg';
import QRCode from '../../assets/icons/QR-Code-Icon.svg';
import ProfileIcon from '../../assets/icons/Profile-Icon.svg';
import PencilIcon from '../../assets/icons/Pencil-Icon.svg';
import BoltIcon from '../../assets/icons/Bolt-Icon.svg';
import TimeIcon from '../../assets/icons/Time-Icon.svg';
import ShieldIcon from '../../assets/icons/Shield-Icon.svg';

export default function ContactUs() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    reason: '',
    message: '',
    agree: true, // pre-checked
  });

  // --- Auto-open chat if another page set a flag ---
  useEffect(() => {
    const openIfFlag = () => {
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
    };
    openIfFlag();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, reason, message, agree } = formData;
    if (!name || !email || !reason || !message || !agree) {
      toast.error('Please fill in all fields and agree to the privacy policy.');
      return;
    }
    try {
      const res = await api.post('/contact', formData);
      if (res.data?.success) {
        toast.success('Message sent!');
        setFormData({ name: '', email: '', reason: '', message: '', agree: true });
      } else {
        toast.error(res.data?.error || 'Something went wrong.');
      }
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Failed to send message.');
    }
  };

  return (
    <div className="auth-page contact-page">
      {/* Same Navbar treatment as Login (links hidden via CSS) */}
      <Navbar />

      {/* Page-level close button at navbar right (same as Login) */}
      <button
        className="auth-nav-close"
        onClick={() => (window.location.href = '/')}
        aria-label="Close"
      >
        ×
      </button>

      {/* Single-column auth layout container (reuses login layout classes) */}
      <div className="login-wrapper">
        <div className="login-right">
          <div className="login-card" role="form" aria-labelledby="contact-title">
            <h1 id="contact-title" className="desktop-h3 text-center" style={{ marginBottom: 8 }}>
              Let’s Talk
            </h1>
            <p className="desktop-body-text text-center" style={{ marginBottom: 20 }}>
              Send us a message or{' '}
              <button
                type="button"
                className="link-button"
                onClick={() => window.tidioChatApi && window.tidioChatApi.open()}
              >
                start a live chat
              </button>
              .
            </p>

            <form className="login-form" onSubmit={handleSubmit}>
              {/* Name */}
              <label htmlFor="cu_name" className="form-label">Name</label>
              <input
                id="cu_name"
                name="name"
                type="text"
                placeholder="Your name"
                className="standard-input"
                value={formData.name}
                onChange={handleChange}
                autoComplete="name"
                required
              />

              {/* Email */}
              <label htmlFor="cu_email" className="form-label">Email</label>
              <input
                id="cu_email"
                name="email"
                type="email"
                placeholder="you@example.com"
                className="standard-input"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
                inputMode="email"
                required
              />

              {/* Reason */}
              <label htmlFor="cu_reason" className="form-label">Reason</label>
              <select
                id="cu_reason"
                name="reason"
                className="standard-input select-input"
                value={formData.reason}
                onChange={handleChange}
                required
              >
                <option value="">Select a reason</option>
                <option value="Card not working">My card isn’t working</option>
                <option value="Card damaged">My card is damaged</option>
                <option value="Profile issue">I can’t see my profile</option>
                <option value="Setup help">Help setting up profile</option>
                <option value="Other">Other</option>
              </select>

              {/* Message */}
              <label htmlFor="cu_message" className="form-label">Message</label>
              <textarea
                id="cu_message"
                name="message"
                placeholder="Enter your message..."
                className="standard-input textarea-input"
                value={formData.message}
                onChange={handleChange}
                required
              />

              {/* Privacy/consent (same checkbox styling as Login) */}
              <label className="terms-label" style={{ marginTop: 8 }}>
                <input
                  type="checkbox"
                  name="agree"
                  className="konar-checkbox"
                  checked={formData.agree}
                  onChange={handleChange}
                  required
                />
                <span className="desktop-body-xs" style={{ color: '#666' }}>
                  I understand Konar will securely hold my data in accordance with the privacy policy.
                </span>
              </label>

              {/* Submit (same button style as Login) */}
              <button type="submit" className="primary-button" style={{ marginTop: 16 }}>
                Send Message
              </button>
            </form>

            {/* Optional: quick help text */}
            <p className="login-alt-text">
              Prefer instant help? Use the chat bubble in the corner any time.
            </p>
          </div>
        </div>
      </div>

      {/* ===== Optional FAQ section (kept from your original page) ===== */}
      <div className="section">
        <div className="section-1-title">
          <h2 className="desktop-h3 text-center">Frequently Asked Questions</h2>
          <h3 className="desktop-h6 text-center">Here are some quick answers before you reach out</h3>
        </div>

        <div className="faq-container">
          <div className="faq-column">
            <div className="section-list">
              <div className="icon-white"><img src={IDCardIcon} className="icon" alt="" /></div>
              <div className="section-list-info">
                <p className="desktop-h6">What is the Konar NFC business card?</p>
                <p className="desktop-body-xs">A reusable card with an NFC chip that opens your Konar profile with a tap—no app, no battery, no fuss.</p>
              </div>
            </div>
            <div className="section-list">
              <div className="icon-white"><img src={NFCIcon} className="icon" alt="" /></div>
              <div className="section-list-info">
                <p className="desktop-h6">How does the tap actually work?</p>
                <p className="desktop-body-xs">The phone’s NFC reader powers the chip and instantly launches your live profile link.</p>
              </div>
            </div>
            <div className="section-list">
              <div className="icon-white"><img src={QRCode} className="icon" alt="" /></div>
              <div className="section-list-info">
                <p className="desktop-h6">What if someone can’t tap?</p>
                <p className="desktop-body-xs">Every card also has a QR code and a shareable link—so there’s always a backup.</p>
              </div>
            </div>
            <div className="section-list">
              <div className="icon-white"><img src={ProfileIcon} className="icon" alt="" /></div>
              <div className="section-list-info">
                <p className="desktop-h6">What can my profile include?</p>
                <p className="desktop-body-xs">Your name, job title, bio, photos, services with pricing, reviews, and contact details.</p>
              </div>
            </div>
          </div>

          <div className="faq-column">
            <div className="section-list">
              <div className="icon-white"><img src={PencilIcon} className="icon" alt="" /></div>
              <div className="section-list-info">
                <p className="desktop-h6">Can I edit my page later?</p>
                <p className="desktop-body-xs">Yes. Update info, images, services, or layout anytime—changes go live instantly.</p>
              </div>
            </div>
            <div className="section-list">
              <div className="icon-white"><img src={BoltIcon} className="icon" alt="" /></div>
              <div className="section-list-info">
                <p className="desktop-h6">How do I share my page?</p>
                <p className="desktop-body-xs">Tap your card, show the QR code, or copy your unique link to send anywhere.</p>
              </div>
            </div>
            <div className="section-list">
              <div className="icon-white"><img src={TimeIcon} className="icon" alt="" /></div>
              <div className="section-list-info">
                <p className="desktop-h6">How does the free trial work?</p>
                <p className="desktop-body-xs">The free trial includes the same features as the subscription. If it ends and you don’t subscribe, your page will no longer show.</p>
              </div>
            </div>
            <div className="section-list">
              <div className="icon-white"><img src={ShieldIcon} className="icon" alt="" /></div>
              <div className="section-list-info">
                <p className="desktop-h6">What happens if I cancel?</p>
                <p className="desktop-body-xs">You’ll keep access until the end of the billing period. After that, your page won’t show until you subscribe again.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
