import React from 'react';
import ShareProfileIcon from '../assets/icons/ShareProfile-Icon.svg'; // Import your SVG icon

/**
 * @param {object} props - The component props.
 * @param {string} props.title - The main title to display (e.g., "Good Afternoon Jarek!" or "My Profile").
 * @param {function} props.onActivateCard - Function to call when "Activate Your Card" button is clicked.
 * @param {function} props.onShareCard - Function to call when "Share Your Profile" button is clicked.
 * @param {boolean} props.isMobile - Indicates if the current screen size is mobile (<= 1000px).
 * @param {boolean} props.isSmallMobile - Indicates if the current screen size is small mobile (<= 600px).
 */
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