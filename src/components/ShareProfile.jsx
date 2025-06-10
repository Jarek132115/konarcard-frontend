// frontend/src/components/ShareProfile.jsx
import React, { useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
/**
 * ShareProfile modal component for displaying sharing options.
 * @param {object} props - The component props.
 * @param {boolean} props.isOpen - Whether the modal is open.
 * @param {function} props.onClose - Function to call to close the modal.
 * @param {string} props.profileUrl - The user's public profile URL.
 * @param {object} props.contactDetails - Object containing contact fields for vCard.
 * @param {string} props.contactDetails.full_name - User's full name.
 * @param {string} props.contactDetails.job_title - User's job title.
 * @param {string} props.contactDetails.business_card_name - User's business name.
 * @param {string} props.contactDetails.bio - User's bio.
 * @param {string} props.contactDetails.contact_email - User's contact email.
 * @param {string} props.contactDetails.phone_number - User's phone number.
 * @param {string} props.username - User's username (for dynamic URL).
 */
export default function ShareProfile({
    isOpen,
    onClose,
    profileUrl,
    // REMOVED: qrCodeUrl prop as it's no longer used
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

    // --- vCard generation is now moved to the "Save to Phone Contacts" button within Wallet section ---
    const generateAndDownloadVCard = () => {
        const { full_name, job_title, business_card_name, bio, contact_email, phone_number } = contactDetails;

        const userProfileUrl = `${window.location.origin}/u/${username}`; // Your actual domain URL

        let vCardContent = `BEGIN:VCARD\n`;
        vCardContent += `VERSION:3.0\n`;
        vCardContent += `FN:${full_name || ''}\n`;
        vCardContent += `N:${(full_name ? full_name.split(' ').slice(-1)[0] : '')};${(full_name ? full_name.split(' ')[0] : '')};;;\n`; // Last;First;;;

        if (business_card_name) vCardContent += `ORG:${business_card_name}\n`;
        if (job_title) vCardContent += `TITLE:${job_title}\n`;
        if (contact_email) vCardContent += `EMAIL;TYPE=PREF,INTERNET:${contact_email}\n`;
        if (phone_number) vCardContent += `TEL;TYPE=CELL,VOICE:${phone_number}\n`;
        if (userProfileUrl) vCardContent += `URL:${userProfileUrl}\n`; // Link to their profile page
        if (job_title) vCardContent += `X-NICKNAME:${job_title}\n`; // Added job_title as nickname for better compatibility
        if (bio) vCardContent += `NOTE:${bio.replace(/\n/g, '\\n')}\n`; // Escape newlines in bio

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
            <div className="share-modal-content" onClick={e => e.stopPropagation()}> {/* Prevent clicks inside from closing modal */}
                <button className="share-modal-close" onClick={onClose}>×</button>

                <h3 className="share-modal-title">Copy Card Link</h3>
                <div className="share-link-row">
                    <input type="text" readOnly value={profileUrl} ref={profileLinkRef} className="share-link-input" />
                    <button onClick={() => copyToClipboard(profileUrl, 'Profile link copied!')} className="share-copy-button">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1.5M9 3v2m6-2v2m.24 10.43l2.872-2.871M16 17l.01.01M16 11l.01.01M10 11l.01.01M10 17l.01.01m-3.792-5.792h.01M14 14l.01.01m-.01 0a2 2 0 100-4h-4a2 2 0 100 4h4z" />
                        </svg>
                    </button>
                </div>

                {/* REMOVED: QR Code Section */}
                {/* <div className="share-qr-section">...</div> */}

                <div className="share-section">
                    <h3 className="share-modal-title">Add to Wallet</h3>
                    <div className="share-buttons-grid">
                        {/* Save to Phone Contacts button is still useful */}
                        <button onClick={generateAndDownloadVCard} className="share-wallet-button share-wallet-contacts">
                            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" className="h-6 w-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                            </svg>
                            Save to Phone Contacts
                        </button>
                        {/* Apple Wallet Button (Requires Backend for .pkpass generation) */}
                        <button className="share-wallet-button share-wallet-apple" onClick={() => toast.info("Apple Wallet integration requires backend pass generation.")}>
                            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" className="h-6 w-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                            </svg>
                            Apple Wallet
                        </button>
                        {/* Google Wallet Button (Requires Backend for pass generation) */}
                        <button className="share-wallet-button share-wallet-google" onClick={() => toast.info("Google Wallet integration requires backend pass generation.")}>
                            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" className="h-6 w-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                            </svg>
                            Google Wallet
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}