import React, { useContext, useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import { AuthContext } from '../../components/AuthContext';
import { toast } from 'react-hot-toast';
// CRITICAL FIX: Import the 'api' instance, not the generic 'axios'
import api from '../../services/api';
import greenTick from '../../assets/icons/Green-Tick-Icon.svg';
import redCross from '../../assets/icons/Red-Cross-Icon.svg';

export default function Profile() {
  const { user, fetchUser, setUser } = useContext(AuthContext);
  const [updatedName, setUpdatedName] = useState('');
  // REMOVED: updatedEmail state variable
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteEnabled, setDeleteEnabled] = useState(false);

  useEffect(() => {
    if (user) {
      setUpdatedName(user.name || '');
      // REMOVED: setUpdatedEmail(user.email || '');
    }
  }, [user]);

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
      // CRITICAL FIX: Use 'api.put' for update-profile
      const res = await api.put(
        '/update-profile', // Use relative path, base URL is configured in api.js
        {
          name: updatedName,
          // REMOVED: email: updatedEmail, // Don't send email if field is removed
          password: password || undefined, // Only send password if it's set
        }
      );

      if (res.data.success) {
        toast.success('Profile updated successfully!');
        fetchUser(); // Re-fetch user to update AuthContext state with new name
        setPassword('');
        setConfirmPassword('');
      } else {
        toast.error(res.data.error || 'Something went wrong');
      }
    } catch (err) {
      console.error('Failed to update profile:', err); // Log full error
      toast.error(err.response?.data?.error || 'Failed to update profile');
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      toast('Click again in 3 seconds to confirm delete...', { duration: 3000 }); // User feedback
      setTimeout(() => setDeleteEnabled(true), 3000); // Enable delete button after 3 seconds
      return;
    }

    if (!deleteEnabled) {
      toast.error('Please wait for the confirmation period to end.');
      return;
    }

    try {
      // CRITICAL FIX: Use 'api.delete' for delete-account
      const res = await api.delete('/delete-account');

      if (res.data.success) {
        toast.success('Your account has been deleted');
        setUser(null); // Clear user from AuthContext
        // Use navigate for React Router instead of window.location.href
        window.location.href = '/'; // Redirect to homepage after delete
      } else {
        toast.error(res.data.error || 'Failed to delete account');
      }
    } catch (err) {
      console.error('Server error deleting account:', err); // Log full error
      toast.error(err.response?.data?.error || 'Server error deleting account');
    }
  };

  return (
    <div className="myprofile-layout">
      <Sidebar />
      <main className="myprofile-main">
        <div className="page-wrapper">
          <div className="page-header">
            <h2 className="page-title">Profile</h2>
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
                autoComplete="name" // Hint for browser to autofill name, if desired
              />
            </div>

            {/* REMOVED: Email Input Block */}
            {/* <div className="profile-input-block">
              <label>Email</label>
              <input
                type="email"
                value={updatedEmail}
                onChange={(e) => setUpdatedEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
            */}

            <div className="profile-input-block">
              <label>Change Password</label>
              <div className="password-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="New password"
                  autoComplete="new-password" // Prevents autofill of old password
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
                  autoComplete="new-password" // Prevents autofill of old password
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
                {confirmDelete && !deleteEnabled ? `Confirm Delete in ${3 - (Math.floor(Date.now() / 1000) - Math.floor((new Date().getTime() - 3000) / 1000))}s` : 'Delete Your Account'}
                {/* Updated text for countdown: More accurate seconds calculation */}
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