import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom'; // Import Link for Logo
import Sidebar from '../../components/Sidebar';
import { AuthContext } from '../../components/AuthContext';
import { toast } from 'react-hot-toast';
import api from '../../services/api';
import greenTick from '../../assets/icons/Green-Tick-Icon.svg';
import redCross from '../../assets/icons/Red-Cross-Icon.svg';
import LogoIcon from '../../assets/icons/Logo-Icon.svg'; // Import LogoIcon

export default function Profile() {
  const { user, fetchUser, setUser } = useContext(AuthContext);
  const [updatedName, setUpdatedName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteEnabled, setDeleteEnabled] = useState(false);

  // New state for sidebar and mobile responsiveness
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1000);

  useEffect(() => {
    if (user) {
      setUpdatedName(user.name || '');
    }
  }, [user]);

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
            <h2 className="page-title">Profile</h2>
            {/* These buttons are likely not needed on a profile settings page, but keeping them as per original */}
            <div className="page-actions">
              <button className="header-button black">🖱️ Activate Your Card</button>
              <button className="header-button white">🔗 Share Your Card</button>
            </div>
          </div>

          <div className="profile-card-box">
            <div className="profile-input-block">
              <label>Display Name</label>
              <input
                type="text"
                value={updatedName}
                onChange={(e) => setUpdatedName(e.target.value)}
                autoComplete="name"
              />
            </div>

            <div className="profile-input-block">
              <label>Change Password</label>
              <div className="password-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="New password"
                  autoComplete="new-password"
                />
                <button type="button" onClick={togglePassword}>
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <div className="password-wrapper">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  autoComplete="new-password"
                />
                <button type="button" onClick={toggleConfirm}>
                  {showConfirm ? 'Hide' : 'Show'}
                </button>
              </div>

              {(password || confirmPassword) && (
                <div className="password-feedback">
                  <p className={passwordChecks.minLength ? 'valid' : 'invalid'}>
                    <img src={passwordChecks.minLength ? greenTick : redCross} alt="" className="feedback-icon" />
                    Minimum 8 characters
                  </p>
                  <p className={passwordChecks.hasUppercase ? 'valid' : 'invalid'}>
                    <img src={passwordChecks.hasUppercase ? greenTick : redCross} alt="" className="feedback-icon" />
                    One uppercase letter
                  </p>
                  <p className={passwordChecks.hasNumber ? 'valid' : 'invalid'}>
                    <img src={passwordChecks.hasNumber ? greenTick : redCross} alt="" className="feedback-icon" />
                    One number
                  </p>
                  <p className={passwordChecks.passwordsMatch ? 'valid' : 'invalid'}>
                    <img src={passwordChecks.passwordsMatch ? greenTick : redCross} alt="" className="feedback-icon" />
                    Passwords match
                  </p>
                </div>
              )}
            </div>

            <div className="profile-action-row">
              <button
                onClick={handleDelete}
                className="profile-delete-button"
                disabled={confirmDelete && !deleteEnabled}
              >
                {confirmDelete && !deleteEnabled ? `Confirm Delete in ${Math.max(0, 3 - Math.floor((Date.now() - (new Date().getTime() - 3000)) / 1000))}s` : 'Delete Your Account'}
              </button>
              <button onClick={handleSave} className="profile-save-button">
                Save Updates
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}