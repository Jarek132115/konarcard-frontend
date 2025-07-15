import React from 'react';
import ShareProfileIcon from '../assets/icons/ShareProfile-Icon.svg';

export default function PageHeader({ title, onActivateCard, onShareCard, isMobile, isSmallMobile }) {
    return (
        <div className="page-header">
            <h1 className={`page-title ${isMobile ? 'page-title-mobile-shrink' : ''}`}>
                {title}
            </h1>
            <div className="page-actions">
                <button className="blue-button desktop-button" onClick={onShareCard}>
                    {isSmallMobile ? (
                        <img src={ShareProfileIcon} alt="Share" className="share-icon" />
                    ) : (
                        "Share Your Profile"
                    )}
                </button>
            </div>
        </div>
    );
}