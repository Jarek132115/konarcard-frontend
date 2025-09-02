import React from 'react';
import ShareProfileIcon from '../assets/icons/ShareProfile-Icon.svg';
import LogoIcon from '../assets/icons/Logo-Icon.svg';

export default function PageHeader({
    title,
    userName,
    userEmail,
    onShareCard,
    isMobile,
    isSmallMobile,
    logoSrc = LogoIcon,
}) {
    return (
        <div className="page-header">
            <div className="page-header-left">
                {/* Brand/User chip */}
                <div className="brand-chip">
                    <img src={logoSrc} alt="Konar" className="brand-chip-logo" />
                    <div className="brand-chip-text">
                        {/* Name and email from your old sidebar spot */}
                        {userName ? <span className="brand-chip-name">{userName}</span> : null}
                        {userEmail ? <span className="brand-chip-email">{userEmail}</span> : null}
                    </div>
                </div>

                {/* Keep the page title for context, styled like the inspo */}
                <h1 className={`page-title ${isMobile ? 'page-title-mobile-shrink' : ''}`}>
                    {title}
                </h1>
            </div>

            <div className="page-actions">
                <button className="header-button blue-button" onClick={onShareCard}>
                    {isSmallMobile ? (
                        <img src={ShareProfileIcon} alt="Share" className="share-icon" />
                    ) : (
                        <>
                            <img src={ShareProfileIcon} alt="" className="share-icon icon-left" />
                            <span>Share Your Profile</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
