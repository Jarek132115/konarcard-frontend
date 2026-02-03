import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import Sidebar from "../../components/Dashboard/Sidebar";
import PageHeader from "../../components/Dashboard/PageHeader";
import ShareProfile from '../../components/ShareProfile';
import { AuthContext } from '../../components/AuthContext';
import { toast } from 'react-hot-toast';
import api from '../../services/api';
import LogoIcon from '../../assets/icons/Logo-Icon.svg';
import { useFetchBusinessCard } from '../../hooks/useFetchBusinessCard';

/* inline lock icon so we can position/style it easily */
function LockIcon({ className = 'lock-icon' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 1a5 5 0 00-5 5v3H6a3 3 0 00-3 3v6a3 3 0 003 3h12a3 3 0 003-3v-6a3 3 0 00-3-3h-1V6a5 5 0 00-5-5zm-3 8V6a3 3 0 116 0v3H9zm3 4a2 2 0 110 4 2 2 0 010-4z" />
    </svg>
  );
}

export default function Profile() {
  const { user: authUser, fetchUser, setUser } = useContext(AuthContext);

  const [updatedName, setUpdatedName] = useState('');
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [deleteCountdown, setDeleteCountdown] = useState(3);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1000);
  const [isSmallMobile, setIsSmallMobile] = useState(window.innerWidth <= 600);
  const [showShareModal, setShowShareModal] = useState(false);

  const userId = authUser?._id;
  const userUsername = authUser?.username || '';

  const { data: businessCard } = useFetchBusinessCard(userId);

  useEffect(() => {
    if (authUser) setUpdatedName(authUser.name || '');
  }, [authUser]);

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

  useEffect(() => {
    if (isConfirmingDelete && deleteCountdown > 0) {
      const t = setTimeout(() => setDeleteCountdown((n) => n - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [isConfirmingDelete, deleteCountdown]);

  const handleSave = async () => {
    try {
      const res = await api.put('/profile', { name: updatedName });
      if (res?.data?.success) {
        const fresh = res.data.data;
        setUser?.(fresh);
        try {
          localStorage.setItem('authUser', JSON.stringify(fresh));
        } catch { }
        fetchUser?.();
        toast.success('Profile updated successfully!');
      } else {
        toast.error(res?.data?.error || 'Something went wrong');
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update profile');
    }
  };

  const handleDelete = async () => {
    if (!isConfirmingDelete) {
      setIsConfirmingDelete(true);
      return;
    }
    if (deleteCountdown === 0) {
      try {
        const res = await api.delete('/profile');
        if (res?.data?.success) {
          toast.success('Your account has been deleted');
          try {
            localStorage.removeItem('token');
            localStorage.removeItem('authUser');
          } catch { }
          setUser?.(null);
          window.location.href = '/';
        } else {
          toast.error(res?.data?.error || 'Failed to delete account');
        }
      } catch (err) {
        toast.error(err.response?.data?.error || 'Server error deleting account');
      } finally {
        setIsConfirmingDelete(false);
        setDeleteCountdown(3);
      }
    }
  };

  const handleResetPassword = async () => {
    if (!authUser?.email) {
      toast.error('Your email is not available to send a reset link.');
      return;
    }
    try {
      const res = await api.post('/forgot-password', { email: authUser.email });
      if (res.data.error) toast.error(res.data.error);
      else toast.success('Password reset link sent to your email!');
    } catch (err) {
      toast.error(err.message || 'Failed to send reset link');
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
    full_name: businessCard?.full_name || '',
    job_title: businessCard?.job_title || '',
    business_card_name: businessCard?.business_card_name || '',
    bio: businessCard?.bio || '',
    contact_email: businessCard?.contact_email || authUser?.email || '',
    phone_number: businessCard?.phone_number || '',
    username: userUsername,
  };

  const currentProfileUrl = userUsername ? `https://www.konarcard.com/u/${userUsername}` : '';

  return (
    <div className={`app-layout ${sidebarOpen ? 'sidebar-active' : ''}`}>
      {/* Mobile header */}
      <div className="myprofile-mobile-header">
        <Link to="/myprofile" className="myprofile-logo-link">
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
          title="My Account"
          onActivateCard={() => { }}
          onShareCard={handleShareCard}
          isMobile={isMobile}
          isSmallMobile={isSmallMobile}
          visitUrl={currentProfileUrl}  
        />

        {/* Desktop-only subtle frame, like Product & Plan */}
        <div className="account-frame">
          <div className="settings-card">
            <div className="settings-head">
              <div>
                <h3 className="desktop-h5">Profile settings</h3>
                <p className="desktop-body-xs">Manage your account details and security.</p>
              </div>
              <span className="pricing-badge pill-blue">Account</span>
            </div>

            <div className="settings-divider" />

            {/* Display Name (editable) */}
            <label className="profile-label desktop-body-s black">Display Name</label>
            <div className="input-shell">
              <input
                type="text"
                value={updatedName}
                onChange={(e) => setUpdatedName(e.target.value)}
                autoComplete="name"
                className="text-input"
              />
            </div>

            {/* Email (locked, left icon) */}
            <label className="profile-label desktop-body-s black">Email Address</label>
            <div className="input-shell locked">
              <LockIcon />
              <input
                type="email"
                readOnly
                value={authUser?.email || ''}
                className="text-input readonly"
                aria-readonly="true"
              />
            </div>

            {/* Full URL (one string, locked, left icon) */}
            <label className="profile-label desktop-body-s black">Business Card Page URL</label>
            <div className="input-shell locked">
              <LockIcon />
              <input
                type="text"
                readOnly
                value={`www.konarcard.com/u/${userUsername}`}
                className="text-input readonly"
                aria-readonly="true"
              />
            </div>

            {/* Password (locked input + Reset button) */}
            <label className="profile-label desktop-body-s black">Password</label>
            <div className="input-with-button locked">
              <LockIcon />
              <input
                type="password"
                value="********"
                readOnly
                className="text-input readonly with-btn"
                aria-readonly="true"
                tabIndex={-1}
              />
              <button
                onClick={handleResetPassword}
                className="inline-btn desktop-button"
                type="button"
                aria-label="Send reset password email"
              >
                Reset
              </button>
            </div>

            <div className="settings-divider" />

            <div className="settings-actions">
              <button
                onClick={handleDelete}
                className="navy-button desktop-button"
                disabled={isConfirmingDelete && deleteCountdown > 0}
                type="button"
              >
                {isConfirmingDelete
                  ? (deleteCountdown > 0 ? `Delete in ${deleteCountdown}...` : 'Confirm Delete')
                  : 'Delete Your Account'}
              </button>

              <button
                onClick={handleSave}
                className="orange-button desktop-button"
                type="button"
              >
                Save Updates
              </button>
            </div>
          </div>
        </div>
      </main>

      <ShareProfile
        isOpen={showShareModal}
        onClose={handleCloseShareModal}
        profileUrl={currentProfileUrl}
        contactDetails={contactDetailsForVCard}
        username={userUsername}
      />
    </div>
  );
}
