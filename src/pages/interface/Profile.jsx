import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import PageHeader from '../../components/PageHeader';
import ShareProfile from '../../components/ShareProfile';
import { AuthContext } from '../../components/AuthContext';
import { toast } from 'react-hot-toast';
import api from '../../services/api';
import greenTick from '../../assets/icons/Green-Tick-Icon.svg';
import redCross from '../../assets/icons/Red-Cross-Icon.svg';
import LogoIcon from '../../assets/icons/Logo-Icon.svg';
import { useFetchBusinessCard } from '../../hooks/useFetchBusinessCard';

export default function Profile() {
  const { user: authUser, fetchUser, setUser } = useContext(AuthContext);
  const [updatedName, setUpdatedName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteEnabled, setDeleteEnabled] = useState(false);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1000);
  const [showShareModal, setShowShareModal] = useState(false);

  const userId = authUser?._id;
  const userUsername = authUser?.username;

  const { data: businessCard, isLoading: isCardLoading } = useFetchBusinessCard(userId);

  useEffect(() => {
    if (authUser) {
      setUpdatedName(authUser.name || '');
    }
  }, [authUser]);

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

  const togglePassword = () => setShowPassword(!showPassword);
  const toggleConfirm = () => setShowConfirm(!showConfirm);

  const passwordChecks = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasNumber: /\d/.test(password),
    passwordsMatch: password === confirmPassword && confirmPassword.length > 0,
  };

  const handleSave = async () => {
    if (password || confirmPassword) {
      if (!Object.values(passwordChecks).every(Boolean)) {
        toast.error('Please meet all password requirements.');
        return;
      }
    }

    try {
      const res = await api.put(
        '/update-profile',
        {
          name: updatedName,
          password: password || undefined,
        }
      );

      if (res.data.success) {
        toast.success('Profile updated successfully!');
        fetchUser();
        setPassword('');
        setConfirmPassword('');
      } else {
        toast.error(res.data.error || 'Something went wrong');
      }
    } catch (err) {
      console.error('Failed to update profile:', err);
      toast.error(err.response?.data?.error || 'Failed to update profile');
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      toast('Click again in 3 seconds to confirm delete...', { duration: 3000 });
      setTimeout(() => setDeleteEnabled(true), 3000);
      return;
    }

    if (!deleteEnabled) {
      toast.error('Please wait for the confirmation period to end.');
      return;
    }

    try {
      const res = await api.delete('/delete-account');

      if (res.data.success) {
        toast.success('Your account has been deleted');
        setUser(null);
        window.location.href = '/';
      } else {
        toast.error(res.data.error || 'Failed to delete account');
      }
    } catch (err) {
      console.error('Server error deleting account:', err);
      toast.error(err.response?.data?.error || 'Server error deleting account');
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
    <div className={`app-layout ${sidebarOpen ? 'sidebar-active' : ''}`}>
      <div className="myprofile-mobile-header">
        <Link to="/" className="myprofile-logo-link">
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
          title="My Account"
          onActivateCard={() => console.log("Activate Card clicked on My Account page")}
          onShareCard={handleShareCard}
        />

        <div className="combined-offer-container"> {/* Added this wrapper */}
          <div className="account-settings-card content-card-box"> {/* Adjusted class name to match */}
            {/* Display Name Section */}
            <div className="profile-input-block">
              <label className="desktop-body-s black">Display Name</label>
              <input
                type="text"
                value={updatedName}
                onChange={(e) => setUpdatedName(e.target.value)}
                autoComplete="name"
                className="desktop-body"
              />
            </div>

            {/* Change Password Section */}
            <div className="profile-input-block">
              <label className="desktop-body-s black">Change Password</label>
              <div className="password-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="New password"
                  autoComplete="new-password"
                  className="desktop-body"
                />
                <button type="button" onClick={togglePassword} className="desktop-button black-button">
                  <span className="desktop-button">{showPassword ? 'Hide' : 'Show'}</span>
                </button>
              </div>
              <div className="password-wrapper">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  autoComplete="new-password"
                  className="desktop-body"
                />
                <button type="button" onClick={toggleConfirm} className="desktop-button black-button">
                  <span className="desktop-button">{showConfirm ? 'Hide' : 'Show'}</span>
                </button>
              </div>

              {(password || confirmPassword) && (
                <div className="password-feedback">
                  <p className={`desktop-body-xs ${passwordChecks.minLength ? 'valid' : 'invalid'}`}>
                    <img src={passwordChecks.minLength ? greenTick : redCross} alt="" className="feedback-icon" />
                    Minimum 8 characters
                  </p>
                  <p className={`desktop-body-xs ${passwordChecks.hasUppercase ? 'valid' : 'invalid'}`}>
                    <img src={passwordChecks.hasUppercase ? greenTick : redCross} alt="" className="feedback-icon" />
                    One uppercase letter
                  </p>
                  <p className={`desktop-body-xs ${passwordChecks.hasNumber ? 'valid' : 'invalid'}`}>
                    <img src={passwordChecks.hasNumber ? greenTick : redCross} alt="" className="feedback-icon" />
                    One number
                  </p>
                  <p className={`desktop-body-xs ${passwordChecks.passwordsMatch ? 'valid' : 'invalid'}`}>
                    <img src={passwordChecks.passwordsMatch ? greenTick : redCross} alt="" className="feedback-icon" />
                    Passwords match
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="profile-action-row">
              <button
                onClick={handleDelete}
                className="black-button desktop-button"
                disabled={confirmDelete && !deleteEnabled}
                style={{
                  backgroundColor: (confirmDelete && !deleteEnabled) ? '#e0e0e0' : 'black',
                  color: (confirmDelete && !deleteEnabled) ? '#666' : 'white',
                  cursor: (confirmDelete && !deleteEnabled) ? 'not-allowed' : 'pointer'
                }}
              >
                <span className="desktop-button">
                  {confirmDelete && !deleteEnabled ? `Confirm Delete in ${Math.max(0, Math.ceil((3000 - (Date.now() - (new Date().getTime() - 3000))) / 1000))}s` : 'Delete Your Account'}
                </span>
              </button>
              <button onClick={handleSave} className="blue-button desktop-button">
                <span className="desktop-button">Save Updates</span>
              </button>
            </div>
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