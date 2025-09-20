import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import PageHeader from '../../components/PageHeader';
import ShareProfile from '../../components/ShareProfile';
import { AuthContext } from '../../components/AuthContext';
import { toast } from 'react-hot-toast';
import api from '../../services/api';
import LogoIcon from '../../assets/icons/Logo-Icon.svg';
import { useFetchBusinessCard } from '../../hooks/useFetchBusinessCard';

/** Inline lock icon to avoid extra imports */
const LockIcon = ({ className = '' }) => (
  <svg
    viewBox="0 0 24 24"
    width="18"
    height="18"
    aria-hidden="true"
    className={className}
  >
    <path
      fill="currentColor"
      d="M12 2a5 5 0 0 0-5 5v3H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-1V7a5 5 0 0 0-5-5Zm3 8H9V7a3 3 0 1 1 6 0v3Z"
    />
  </svg>
);

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
  const userUsername = authUser?.username;
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
      const t = setTimeout(() => setDeleteCountdown(c => c - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [isConfirmingDelete, deleteCountdown]);

  const handleSave = async () => {
    try {
      const res = await api.put('/profile', { name: updatedName });
      if (res?.data?.success) {
        const fresh = res.data.data;
        setUser?.(fresh);
        try { localStorage.setItem('authUser', JSON.stringify(fresh)); } catch { }
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
    if (!isConfirmingDelete) return setIsConfirmingDelete(true);
    if (deleteCountdown !== 0) return;

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
  };

  const handleResetPassword = async () => {
    if (!authUser?.email) return toast.error('Your email is not available.');
    try {
      const res = await api.post('/forgot-password', { email: authUser.email });
      if (res.data.error) toast.error(res.data.error);
      else toast.success('Password reset link sent to your email!');
    } catch (err) {
      toast.error(err.message || 'Failed to send reset link');
    }
  };

  const handleShareCard = () => {
    if (!authUser?.isVerified) return toast.error('Please verify your email to share your card.');
    setShowShareModal(true);
  };

  const contactDetailsForVCard = {
    full_name: businessCard?.full_name || '',
    job_title: businessCard?.job_title || '',
    business_card_name: businessCard?.business_card_name || '',
    bio: businessCard?.bio || '',
    contact_email: businessCard?.contact_email || authUser?.email || '',
    phone_number: businessCard?.phone_number || '',
    username: userUsername || '',
  };

  const currentProfileUrl = userUsername ? `https://www.konarcard.com/u/${userUsername}` : '';

  return (
    <div className={`app-layout ${sidebarOpen ? 'sidebar-active' : ''}`}>
      {/* mobile header */}
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
        />

        {/* Account page wrapper (matching your new white-card look) */}
        <div className="account-page">
          <div className="account-card">
            <div className="account-head">
              <div>
                <h3 className="desktop-h5">Profile settings</h3>
                <p className="desktop-body-xs">Manage your account details and security.</p>
              </div>
              <span className="pill-blue-solid">Account</span>
            </div>

            <div className="account-divider" />

            {/* Name (editable) */}
            <div className="account-field">
              <label className="desktop-body-s black">Display Name</label>
              <input
                type="text"
                value={updatedName}
                onChange={(e) => setUpdatedName(e.target.value)}
                autoComplete="name"
                className="input edit"
                placeholder="Your name"
              />
            </div>

            {/* Email (locked) */}
            <div className="account-field">
              <label className="desktop-body-s black">Email Address</label>
              <div className="field-with-lock">
                <input
                  type="email"
                  value={authUser?.email || ''}
                  readOnly
                  className="input display"
                />
                <span className="field-lock" title="This field is locked">
                  <LockIcon />
                </span>
              </div>
            </div>

            {/* URL (locked) */}
            <div className="account-field">
              <label className="desktop-body-s black">Business Card Page URL</label>
              <div className="field-with-lock url-wrap">
                <span className="url-prefix desktop-body">www.konarcard.com/u/</span>
                <input
                  type="text"
                  value={userUsername || ''}
                  readOnly
                  className="input display url-input"
                />
                <span className="field-lock" title="This field is locked">
                  <LockIcon />
                </span>
              </div>
            </div>

            {/* Password (locked, with action) */}
            <div className="account-field">
              <label className="desktop-body-s black">Password</label>
              <div className="password-wrap with-action">
                <input
                  type="password"
                  value="********"
                  readOnly
                  className="input display"
                />
                <span className="field-lock" title="This field is locked">
                  <LockIcon />
                </span>
                <button
                  onClick={handleResetPassword}
                  className="black-button reset-btn desktop-button"
                >
                  Reset
                </button>
              </div>
            </div>

            <div className="account-divider" />

            {/* CTAs (20px gap above is handled by spacing) */}
            <div className="account-actions">
              <button
                onClick={handleDelete}
                className="cta-black-button desktop-button"
                disabled={isConfirmingDelete && deleteCountdown > 0}
              >
                {isConfirmingDelete
                  ? (deleteCountdown > 0 ? `Delete in ${deleteCountdown}...` : 'Confirm Delete')
                  : 'Delete Your Account'}
              </button>

              <button onClick={handleSave} className="cta-blue-button desktop-button">
                Save Updates
              </button>
            </div>
          </div>
        </div>
      </main>

      <ShareProfile
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        profileUrl={currentProfileUrl}
        contactDetails={contactDetailsForVCard}
        username={userUsername || ''}
      />
    </div>
  );
}
