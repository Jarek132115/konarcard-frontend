import React from 'react';

/**
 * @param {object} props - The component props.
 * @param {string} props.title - The main title to display (e.g., "Good Afternoon Jarek!" or "My Profile").
 * @param {function} props.onActivateCard - Function to call when "Activate Your Card" button is clicked.
 * @param {function} props.onShareCard - Function to call when "Share Your Profile" button is clicked.
 * @param {boolean} props.isMobile - Indicates if the current screen size is mobile.
 */
export default function PageHeader({ title, onActivateCard, onShareCard, isMobile }) {
    return (
        <div className="page-header">
            {/* Conditionally apply a class based on isMobile */}
            <h1 className={`page-title ${isMobile ? 'page-title-mobile-shrink' : ''}`}>
                {title}
            </h1>
            <div className="page-actions">
                {/* Removed Activate Your Card button per previous discussion if it's not needed */}
                <button className="blue-button" onClick={onShareCard}>
                    Share Your Profile
                </button>
            </div>
        </div>
    );
}