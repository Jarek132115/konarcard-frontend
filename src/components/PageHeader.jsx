// frontend/src/components/PageHeader.jsx
import React from 'react';

/**
 * Reusable PageHeader component for consistent page titles and actions.
 * @param {object} props - The component props.
 * @param {string} props.title - The main title to display (e.g., "Good Afternoon Jarek!").
 * @param {function} props.onActivateCard - Function to call when "Activate Your Card" button is clicked.
 * @param {function} props.onShareCard - Function to call when "Share Your Card" button is clicked.
 */
export default function PageHeader({ title, onActivateCard, onShareCard }) {
    return (
        <div className="page-header">
            <h1 className="page-title">{title}</h1>
            <div className="page-actions">
                <button className="header-button black" onClick={onActivateCard}>
                    🖱️ Activate Your Card
                </button>
                <button className="header-button white" onClick={onShareCard}>
                    🔗 Share Your Card
                </button>
            </div>
        </div>
    );
}