import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const UserPage = () => {
    const { username } = useParams();
    const [businessCard, setBusinessCard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchCard = async () => {
            try {
                // CORRECTED: Use import.meta.env.VITE_API_URL for the live backend URL
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/business-card/by_username/${username}`);
                setBusinessCard(response.data);
            } catch (err) {
                console.error("Failed to load card by username:", err.response?.data || err);
                setError(err.response?.data?.message || "Could not load user profile. It might not exist or there's a server error.");
                setBusinessCard(null); // Ensure businessCard is null on error
            } finally {
                setLoading(false);
            }
        };

        if (username) { // Only fetch if username is available
            fetchCard();
        } else {
            setLoading(false);
            setError("No username provided in the URL.");
        }
    }, [username]); // Re-run effect if username changes

    // Loading, Error, and Not Found States
    if (loading) return <div className="user-landing-page" style={{ textAlign: "center", display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", fontSize: "1.2rem", color: "#666" }}><p>Loading business card...</p></div>;
    if (error) return <div className="user-landing-page" style={{ textAlign: "center", display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", padding: "20px", color: "red", border: "1px solid red", borderRadius: "8px", backgroundColor: "#ffe6e6" }}><p className="error-message">{error}</p></div>;
    if (!businessCard) return <div className="user-landing-page" style={{ textAlign: "center", display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", fontSize: "1.2rem", color: "#888" }}><p>No business card found for this user.</p></div>;

    // Determine theme styles dynamically based on fetched businessCard data
    const themeStyles = {
        backgroundColor: businessCard.page_theme === "dark" ? "#1F1F1F" : "#FFFFFF",
        color: businessCard.page_theme === "dark" ? "#FFFFFF" : "#000000",
        fontFamily: businessCard.style || "Inter" // Fallback to Inter if no style is set
    };

    const handleExchangeContact = () => {
        const { full_name, job_title, business_card_name, bio, contact_email, phone_number } = businessCard;
        // Dynamically construct the landing page URL for the vCard
        const landingPageUrl = `${window.location.origin}/u/${username}`;

        // Split full_name into parts if available for N (Name) field in vCard
        const nameParts = full_name ? full_name.split(' ') : [];
        const firstName = nameParts[0] || '';
        const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';
        const middleNames = nameParts.slice(1, -1).join(' ') || '';

        // Construct vCard string (using vCard 3.0 format)
        let vCardContent = `BEGIN:VCARD\n`;
        vCardContent += `VERSION:3.0\n`;
        vCardContent += `FN:${full_name || ''}\n`; // Formatted Name
        vCardContent += `N:${lastName};${firstName};${middleNames};;\n`; // Last;First;Middle;Prefix;Suffix

        if (business_card_name) {
            vCardContent += `ORG:${business_card_name}\n`; // Organization/Company
        }
        if (job_title) {
            vCardContent += `TITLE:${job_title}\n`; // Job Title
            vCardContent += `X-NICKNAME:${job_title}\n`; // X-NICKNAME is non-standard but often supported by contact apps
        }
        if (phone_number) {
            vCardContent += `TEL;TYPE=CELL,VOICE:${phone_number}\n`; // Phone Number
        }
        if (contact_email) {
            vCardContent += `EMAIL;TYPE=PREF,INTERNET:${contact_email}\n`; // Email
        }
        if (landingPageUrl) {
            vCardContent += `URL:${landingPageUrl}\n`; // Website URL
        }
        if (bio) {
            const escapedBio = bio.replace(/\n/g, '\\n'); // Escape newlines for vCard NOTE field
            vCardContent += `NOTE:${escapedBio}\n`; // Biography/Notes
        }
        vCardContent += `END:VCARD\n`;

        // Create a Blob and trigger download
        const blob = new Blob([vCardContent], { type: 'text/vcard;charset=utf-8' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        // Generate a descriptive filename for the downloaded vCard
        a.download = `${(full_name || username || 'contact').replace(/\s/g, '_')}.vcf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url); // Clean up the object URL
    };

    return (
        <div className="user-landing-page" style={themeStyles}>
            {/* Cover Photo */}
            {businessCard.cover_photo && (
                <img
                    src={businessCard.cover_photo}
                    alt="Cover"
                    className="landing-cover-photo"
                />
            )}

            {/* Main Heading & Subheading */}
            <h2 className="landing-main-heading">{businessCard.main_heading}</h2>
            <p className="landing-sub-heading">{businessCard.sub_heading}</p>

            {/* Exchange Contact Button - Now with onClick handler */}
            <button
                type="button"
                onClick={handleExchangeContact}
                style={{
                    backgroundColor:
                        businessCard.page_theme === "dark" ? "white" : "black",
                    color: businessCard.page_theme !== "dark" ? "white" : "black",
                }}
                className="landing-action-button"
            >
                Exchange Contact
            </button>

            {/* About Me Section */}
            {(businessCard.full_name || businessCard.job_title || businessCard.bio || businessCard.avatar) && (
                <>
                    <p className="landing-section-title">About me</p>
                    <div className="landing-about-section">
                        {businessCard.avatar && (
                            <img
                                src={businessCard.avatar}
                                alt="Avatar"
                                className="landing-avatar"
                            />
                        )}
                        <div>
                            <p className="landing-profile-name">{businessCard.full_name}</p>
                            <p className="landing-profile-role">{businessCard.job_title}</p>
                        </div>
                    </div>
                    {businessCard.bio && <p className="landing-bio-text">{businessCard.bio}</p>}
                </>
            )}

            {/* My Work Section */}
            {businessCard.works?.length > 0 && (
                <>
                    <p className="landing-section-title">My Work</p>
                    <div className="landing-work-gallery">
                        {businessCard.works.map((url, i) => (
                            <img
                                key={i}
                                src={url}
                                alt={`work-${i}`}
                            />
                        ))}
                    </div>
                </>
            )}

            {/* My Services Section */}
            {businessCard.services?.length > 0 && (
                <>
                    <p className="landing-section-title">My Services</p>
                    <div className="landing-services-list">
                        {businessCard.services.map((s, i) => (
                            <div key={i} className="landing-service-item">
                                <p className="landing-service-name">{s.name}</p>
                                <span className="landing-service-price">{s.price}</span>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {/* Reviews Section */}
            {businessCard.reviews?.length > 0 && (
                <>
                    <p className="landing-section-title">Reviews</p>
                    <div className="landing-reviews-list">
                        {businessCard.reviews.map((r, i) => (
                            <div key={i} className="landing-review-card">
                                <div className="landing-star-rating">
                                    {Array(r.rating || 0).fill().map((_, starIdx) => (
                                        <span key={`filled-${starIdx}`}>★</span>
                                    ))}
                                    {Array(Math.max(0, 5 - (r.rating || 0))).fill().map((_, starIdx) => (
                                        <span key={`empty-${starIdx}`} style={{ color: '#ccc' }}>★</span>
                                    ))}
                                </div>
                                <p className="landing-review-text">"{r.text}"</p>
                                <p className="landing-reviewer-name">{r.name}</p>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default UserPage;