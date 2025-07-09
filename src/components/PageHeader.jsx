import React from 'react';

/**
 * @param {object} props - The component props.
 * @param {string} props.title - The main title to display (e.g., "Good Afternoon Jarek!").
 * @param {function} props.onActivateCard - Function to call when "Activate Your Card" button is clicked.
 * @param {function} props.onShareCard - Function to call when "Share Your Profile" button is clicked.
 */
export default function PageHeader({ title, onActivateCard, onShareCard }) {
    return (
        <div className="page-header">
            <h1 className="page-title">{title}</h1>
            <div className="page-actions">
                <button className="blue-button" onClick={onShareCard}>
                    Share Your Profile 
                </button>
            </div>
        </div>
    );
}