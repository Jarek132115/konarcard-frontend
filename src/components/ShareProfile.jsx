import React, { useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import PropTypes from 'prop-types';

// Import the new SVG icons
import CopyLinkIcon from '../assets/icons/CopyLink-Icon.svg';
import VisitProfileIcon from '../assets/icons/VisitProfile-Icon.svg';
import DownloadQRIcon from '../assets/icons/DownloadQR-Icon.svg';
import SaveContactIcon from '../assets/icons/SaveContact-Icon.svg';

/**
 * ShareProfile modal component for displaying sharing options.
 * @param {object} props - The component props.
 * @param {boolean} props.isOpen - Whether the modal is open.
 * @param {function} props.onClose - Function to call to close the modal.
 * @param {string} props.profileUrl - The user's unique public profile URL.
 * @param {string} props.qrCodeUrl - The URL of the user's QR code image.
 * @param {object} props.contactDetails - Object containing contact fields for vCard.
 * @param {string} props.contactDetails.full_name - User's full name.
 * @param {string} props.contactDetails.job_title - User's job title.
 * @param {string} props.contactDetails.business_card_name - User's business name.
 * @param {string} props.contactDetails.bio - User's bio.
 * @param {string} props.contactDetails.contact_email - User's contact email.
 * @param {string} props.contactDetails.phone_number - User's phone number.
 * @param {string} props.username - User's username (for dynamic URL and vCard filename).
 */
export default function ShareProfile({
    isOpen,
    onClose,
    profileUrl,
    qrCodeUrl,
    contactDetails,
    username
}) {
    const profileLinkRef = useRef(null);

    // Close modal on escape key press
    useEffect(() => {
        const handleEscape = (event) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
        }
        return () => {
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    // --- Helper function to copy text to clipboard ---
    const copyToClipboard = (text, message) => {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text)
                .then(() => toast.success(message || 'Profile link copied!'))
                .catch(err => {
                    console.error('Failed to copy text:', err);
                    toast.error('Failed to copy. Please try manually.');
                });
        } else {
            // Fallback for older browsers (less common now)
            const textArea = document.createElement("textarea");
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            try {
                document.execCommand('copy');
                toast.success(message || 'Copied to clipboard!');
            } catch (err) {
                console.error('Fallback: Failed to copy text:', err);
                toast.error('Failed to copy. Please try manually.');
            }
            document.body.removeChild(textArea);
        }
    };

    // --- vCard generation for "Save to Phone Contacts" ---
    const generateAndDownloadVCard = () => {
        const { full_name, job_title, business_card_name, bio, contact_email, phone_number } = contactDetails;
        const userProfileUrl = profileUrl || (username ? `${window.location.origin}/u/${username}` : '');

        let vCardContent = `BEGIN:VCARD\n`;
        vCardContent += `VERSION:3.0\n`;
        const names = full_name ? full_name.split(' ') : ['', ''];
        const firstName = names[0] || '';
        const lastName = names.slice(1).join(' ') || '';
        vCardContent += `N:${lastName};${firstName};;;\n`;
        vCardContent += `FN:${full_name || username || 'KonarCard User'}\n`;

        if (business_card_name) vCardContent += `ORG:${business_card_name}\n`;
        if (job_title) vCardContent += `TITLE:${job_title}\n`;
        if (contact_email) vCardContent += `EMAIL;TYPE=PREF,INTERNET:${contact_email}\n`;
        if (phone_number) vCardContent += `TEL;TYPE=CELL,VOICE:${phone_number}\n`;
        if (userProfileUrl) vCardContent += `URL:${userProfileUrl}\n`;
        if (bio) vCardContent += `NOTE:${bio.replace(/\n/g, '\\n')}\n`;
        vCardContent += `END:VCARD\n`;

        const blob = new Blob([vCardContent], { type: 'text/vcard;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${(full_name || username || 'contact').replace(/\s/g, '_')}.vcf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success("Contact file downloaded!");
    };

    return (
        <div className="share-modal-overlay" onClick={onClose}>
            <div className="share-modal-content" onClick={e => e.stopPropagation()}>
                <button className="share-modal-close-button" onClick={onClose}>×</button>

                <h3 className="share-modal-title">Share Your Link</h3>

                <div className="profile-link-section">
                    <div className="share-link-row">
                        <input type="text" readOnly value={profileUrl} ref={profileLinkRef} className="share-link-input" />
                    </div>
                    <div className="share-action-buttons">
                        <a href={profileUrl} target="_blank" rel="noopener noreferrer" className="share-button-primary">
                            Visit Profile
                            <img src={VisitProfileIcon} alt="Visit Profile" className="share-button-icon" />
                        </a>
                        <button onClick={() => copyToClipboard(profileUrl, 'Profile link copied!')} className="share-button-secondary">
                            Copy Link
                            <img src={CopyLinkIcon} alt="Copy Link" className="share-button-icon" />
                        </button>
                    </div>
                </div>

                {qrCodeUrl && (
                    <div className="qr-code-section">
                        <h3 className="share-modal-title">Scan QR Code</h3>
                        <div className="qr-code-image-container">
                            <img src={qrCodeUrl} alt="Profile QR Code" className="share-qr-code-image" />
                        </div>
                        <div className="share-action-buttons">
                            <a href={qrCodeUrl} download={`${username || 'konarcard'}-qrcode.png`} className="share-button-secondary">
                                Download QR Code
                                <img src={DownloadQRIcon} alt="Download QR Code" className="share-button-icon" />
                            </a>
                            <button onClick={generateAndDownloadVCard} className="share-button-primary share-button-vcard">
                                Save to Phone Contacts
                                <img src={SaveContactIcon} alt="Save Contact" className="share-button-icon" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

ShareProfile.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    profileUrl: PropTypes.string.isRequired,
    qrCodeUrl: PropTypes.string,
    contactDetails: PropTypes.shape({
        full_name: PropTypes.string,
        job_title: PropTypes.string,
        business_card_name: PropTypes.string,
        bio: PropTypes.string,
        contact_email: PropTypes.string,
        phone_number: PropTypes.string,
    }).isRequired,
    username: PropTypes.string,
};