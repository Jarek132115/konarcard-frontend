// src/components/PageHeader.jsx
import React, { useContext } from 'react';
import { AuthContext } from './AuthContext';
import ShareProfileIcon from '../assets/icons/ShareProfile-Icon.svg';
import Avatar from '../assets/images/pp10.png'; // static avatar used for all users in header

export default function PageHeader({
  title = 'My Profile',
  onShareCard,
  isMobile,
  isSmallMobile,
}) {
  const { user } = useContext(AuthContext);

  const displayName = user?.name || 'Your Name';
  const displayEmail = user?.email || 'you@example.com';

  return (
    <>
      {/* Top header card like the inspiration (rounded, padded, shadow) */}
      <div className="page-header-card">
        <div className="page-header-left">
          <img src={Avatar} alt="Profile" className="ph-avatar" />
          <div className="ph-user">
            <p className="ph-name">{displayName}</p>
            <p className="ph-email">{displayEmail}</p>
          </div>
        </div>

        <div className="page-header-right">
          <button
            className="desktop-button cta-blue-button header-share"
            onClick={onShareCard}
            aria-label="Share your profile"
          >
            {isSmallMobile ? (
              <img src={ShareProfileIcon} alt="Share" className="share-icon" />
            ) : (
              <>Share Your Profile</>
            )}
          </button>
        </div>
      </div>

      {/* Page title sits under the header card (like the inspiration) */}
      <h1 className={`page-title-under ${isMobile ? 'page-title-mobile-shrink' : ''}`}>
        {title}
      </h1>
    </>
  );
}
