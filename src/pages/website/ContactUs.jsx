import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';

import Navbar from '../../components/Navbar';
import Breadcrumbs from '../../components/Breadcrumbs';
import Footer from '../../components/Footer';

import IDCardIcon from '../../assets/icons/IDCard-Icon.svg';
import NFCIcon from '../../assets/icons/NFC-Icon.svg';
import BoltIcon from '../../assets/icons/Bolt-Icon.svg';
import SetupIcon from '../../assets/icons/Setup-Icon.svg';
import BoxIcon from '../../assets/icons/Box-Icon.svg';
import PalletteIcon from '../../assets/icons/Pallette-Icon.svg';
import HatIcon from '../../assets/icons/Hat-Icon.svg';
import LockIcon from '../../assets/icons/Lock-Icon.svg';
import PencilIcon from '../../assets/icons/Pencil-Icon.svg';
import PhoneIcon from '../../assets/icons/Phone-Icon.svg';
import WalletIcon from '../../assets/icons/Wallet-Icon.svg';

export default function ContactUs() {
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
    <>
      <Navbar />
      <div style={{ marginTop: 20 }} className="section-breadcrumbs">
        <Breadcrumbs />
      </div>

      <div style={{ marginTop: 40 }} className='section'>
        <div className='contact-title-container'>
          <p className='desktop-h1 text-center'>Let’s talk</p>
          <p className='desktop-body text-center'>Have a question, need support, or just want to say hi? We’re here and ready to help.</p>
        </div>
        <div className="live-chat-info">
          <p className="desktop-body text-center">
            Want to talk to us right now?{' '}
            <span
              className="live-chat-link"
              onClick={() => {
                if (window.tidioChatApi) {
                  window.tidioChatApi.open();
                }
              }}
            >
              Start a live chat.
            </span>
          </p>
        </div>

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

          <button type='submit' className='blue-button desktop-button'>
            Submit
          </button>
        </form>
      </div>

      <div className="section">
        <div className="section-1-title">
          <h2 className='desktop-h3 text-center'>Frequently Asked Questions</h2>
          <h3 className='desktop-h6 text-center'>For any other questions feel free to contact us at any time</h3>
        </div>
        <div className="faq-container">
          <div className="faq-column">
            <div className="section-list"><div className=" icon-white"><img src={IDCardIcon} className="icon" /></div><div className="section-list-info"><p className='desktop-h6'>What is a Konar digital profile?</p><p className='desktop-body-xs'>It’s your own landing page showing your trade, services, photos, and contact details — all online.</p></div></div>
            <div className="section-list"><div className=" icon-white"><img src={NFCIcon} className="icon" /></div><div className="section-list-info"><p className='desktop-h6'>Do I need an NFC card to use it?</p><p className='desktop-body-xs'>No. You can use and share your digital profile without ever buying a physical card.</p></div></div>
            <div className="section-list"><div className=" icon-white"><img src={PhoneIcon} className="icon" /></div><div className="section-list-info"><p className='desktop-h6'>How do people view my profile?</p><p className='desktop-body-xs'>Share via link, QR code, or NFC tap — works instantly on most phones.</p></div></div>
            <div className="section-list"><div className=" icon-white"><img src={SetupIcon} className="icon" /></div><div className="section-list-info"><p className='desktop-h6'>How do I set up my page?</p><p className='desktop-body-xs'>Just fill in your trade, upload photos, list services — done in under five minutes.</p></div></div>
            <div className="section-list"><div className=" icon-white"><img src={PencilIcon} className="icon" /></div><div className="section-list-info"><p className='desktop-h6'>Can I update my page anytime?</p><p className='desktop-body-xs'>Yes. Log in from any device to update info, images, services, or pricing instantly.</p></div></div>
          </div>
          <div className="faq-column">
            <div className="section-list"><div className=" icon-white"><img src={WalletIcon} className="icon" /></div><div className="section-list-info"><p className='desktop-h6'>What does it cost to use?</p><p className='desktop-body-xs'>We offer a free plan. Premium features unlock with our £5.95/month Power Profile subscription.</p></div></div>
            <div className="section-list"><div className=" icon-white"><img src={BoxIcon} className="icon" /></div><div className="section-list-info"><p className='desktop-h6'>What happens if I lose my NFC card?</p><p className='desktop-body-xs'>Your page still works without the card. You can always reorder one if you want to keep tapping.</p></div></div>
            <div className="section-list"><div className=" icon-white"><img src={HatIcon} className="icon" /></div><div className="section-list-info"><p className='desktop-h6'>Who is this for exactly?</p><p className='desktop-body-xs'>Any tradesperson who wants to get noticed, win more work, and look professional online.</p></div></div>
            <div className="section-list"><div className=" icon-white"><img src={PalletteIcon} className="icon" /></div><div className="section-list-info"><p className='desktop-h6'>Can I customise the design and layout?</p><p className='desktop-body-xs'>Yes. Pick fonts, colours, and layouts to match your brand and make it yours.</p></div></div>
            <div className="section-list"><div className=" icon-white"><img src={LockIcon} className="icon" /></div><div className="section-list-info"><p className='desktop-h6'>Is my personal data safe on here?</p><p className='desktop-body-xs'>Absolutely. You control everything shown, and your data is hosted securely at all times.</p></div></div>
          </div>
        </div>
        <div style={{ marginTop: 40, display: 'flex', justifyContent: 'center' }}>
          <Link to="/faq" className="black-button desktop-button">Frequently Asked Questions</Link>
        </div>

      </div>

      <Footer />
    </>
  );
}