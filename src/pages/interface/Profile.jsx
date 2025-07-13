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

export default function Profile() {
  const { user: authUser, fetchUser, setUser } = useContext(AuthContext);
  const [updatedName, setUpdatedName] = useState('');
  // Removed password, confirmPassword, showPassword, showConfirm states

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

  // Removed togglePassword and toggleConfirm functions
  // Removed passwordChecks object

  const handleSave = async () => {
    try {
      const res = await api.put(
        '/update-profile',
        {
          name: updatedName,
          // Removed password from payload
        }
      );

      if (res.data.success) {
        toast.success('Profile updated successfully!');
        fetchUser();
        // Removed password and confirmPassword state resets
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

  // New function to handle password reset
  const handleResetPassword = async () => {
    if (!authUser?.email) {
      toast.error("Your email is not available to send a reset link.");
      return;
    }
    try {
      const res = await api.post('/forgot-password', { email: authUser.email });
      if (res.data.error) {
        toast.error(res.data.error);
      } else {
        toast.success('Password reset link sent to your email!');
      }
    } catch (err) {
      console.error('Failed to send reset link:', err.message || err);
      toast.error(err.message || 'Failed to send reset link');
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

        <div className="profile-page-wrapper">
          <div className="profile-settings-card">
            {/* Display Name Section */}
            <div className="profile-setting-block">
              <label className="profile-label desktop-body-s black">Display Name</label>
              <input
                type="text"
                value={updatedName}
                onChange={(e) => setUpdatedName(e.target.value)}
                autoComplete="name"
                className="profile-input-field desktop-body"
              />
            </div>

            {/* Email Address - Non-editable */}
            <div className="profile-setting-block">
              <label className="profile-label desktop-body-s black">Email Address</label>
              <input
                type="email"
                value={authUser?.email || ''}
                readOnly // Make it non-editable
                className="profile-input-field profile-display-field desktop-body"
              />
            </div>

            {/* Landing Page URL (Username) - Non-editable */}
            <div className="profile-setting-block">
              <label className="profile-label desktop-body-s black">Landing Page URL</label>
              <div className="profile-url-display-group">
                <span className="profile-url-prefix desktop-body">www.konarcard.com/u/</span>
                <input
                  type="text"
                  value={userUsername || ''}
                  readOnly // Make it non-editable
                  className="profile-input-field profile-display-field desktop-body"
                />
              </div>
            </div>

            {/* Password Section - Now with Reset Password Button */}
            <div className="profile-setting-block">
              <label className="profile-label desktop-body-s black">Password</label>
              <input
                type="password"
                value="********" // Display masked password
                readOnly // Make it non-editable
                className="profile-input-field profile-display-field desktop-body"
              />
              <button
                onClick={handleResetPassword}
                className="blue-button profile-reset-password-button desktop-button"
              >
                <span className="desktop-button">Reset Password</span>
              </button>
            </div>

            {/* Action Buttons */}
            <div className="profile-action-buttons-group">
              <button
                onClick={handleDelete}
                className="black-button profile-action-button"
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
              <button onClick={handleSave} className="blue-button profile-action-button">
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