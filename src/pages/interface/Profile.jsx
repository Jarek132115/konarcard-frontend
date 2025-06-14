import React, { useEffect, useState, useContext } from 'react';
import Sidebar from '../../components/Sidebar';
import { AuthContext } from '../../components/AuthContext';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import greenTick from '../../assets/icons/Green-Tick-Icon.svg';
import redCross from '../../assets/icons/Red-Cross-Icon.svg';

export default function Profile() {
  const { user, fetchUser, setUser } = useContext(AuthContext);
  const [updatedName, setUpdatedName] = useState('');
  const [updatedEmail, setUpdatedEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteEnabled, setDeleteEnabled] = useState(false);

  useEffect(() => {
    if (user) {
      setUpdatedName(user.name || '');
      setUpdatedEmail(user.email || '');
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
      const res = await axios.put(
        `${import.meta.env.VITE_API_URL}/update-profile`,
        {
          name: updatedName,
          email: updatedEmail,
          password: password || undefined,
        },
        { withCredentials: true }
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
      toast.error('Failed to update profile');
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      setTimeout(() => setDeleteEnabled(true), 3000);
      return;
    }

    if (!deleteEnabled) return;

    try {
      const res = await axios.delete(`${import.meta.env.VITE_API_URL}/delete-account`, {
        withCredentials: true,
      });

      if (res.data.success) {
        toast.success('Your account has been deleted');
        setUser(null);
        window.location.href = '/';
      } else {
        toast.error(res.data.error || 'Failed to delete account');
      }
    } catch (err) {
      toast.error('Server error deleting account');
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
              />
            </div>

            <div className="profile-input-block">
              <label>Email</label>
              <input
                type="email"
                value={updatedEmail}
                onChange={(e) => setUpdatedEmail(e.target.value)}
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
                {confirmDelete ? 'Confirm Delete Account' : 'Delete Your Account'}
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