import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api'; 

const UserPage = () => {
    const { username } = useParams();

    const { data: businessCard, isLoading, isError, error } = useQuery({
        queryKey: ["public-business-card", username],
        queryFn: async () => {
            const response = await api.get(`/api/business-card/by_username/${username}`);
            console.log("UserPage: Fetched business card data for public profile:", response.data);
            return response.data;
        },
        enabled: !!username, 
        staleTime: 5 * 60 * 1000,
        cacheTime: 10 * 60 * 1000,
        retry: 1,
    });

    if (isLoading) return <div className="user-landing-page" style={{ textAlign: "center", display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}><p>Loading business card...</p></div>;
    if (isError) return <div className="user-landing-page" style={{ textAlign: "center", display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}><p className="error-message">Error: {error?.message || "Could not load user profile."}</p></div>;
    if (!businessCard) return <div className="user-landing-page" style={{ textAlign: "center", display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}><p>No business card found for username "{username}".</p></div>;


    const themeStyles = {
        backgroundColor: businessCard.page_theme === "dark" ? "#1F1F1F" : "#FFFFFF",
        color: businessCard.page_theme === "dark" ? "#FFFFFF" : "#000000",
        fontFamily: businessCard.style || "Inter"
    };

    const handleExchangeContact = () => {
        const { full_name, job_title, business_card_name, bio, contact_email, phone_number, publicProfileUrl } = businessCard;
        const landingPageUrl = publicProfileUrl || `${window.location.origin}/u/${username}`;

        const nameParts = full_name ? full_name.split(' ') : ['', ''];
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';
        const middleNames = nameParts.slice(1, -1).join(' ') || '';

        let vCardContent = `BEGIN:VCARD\n`;
        vCardContent += `VERSION:3.0\n`;
        vCardContent += `FN:${full_name || ''}\n`;
        vCardContent += `N:${lastName};${firstName};${middleNames};;\n`;

        if (business_card_name) {
            vCardContent += `ORG:${business_card_name}\n`;
        }
        if (job_title) {
            vCardContent += `TITLE:${job_title}\n`;
            vCardContent += `X-NICKNAME:${job_title}\n`;
        }
        if (phone_number) {
            vCardContent += `TEL;TYPE=CELL,VOICE:${phone_number}\n`;
        }
        if (contact_email) {
            vCardContent += `EMAIL;TYPE=PREF,INTERNET:${contact_email}\n`;
        }
        if (landingPageUrl) {
            vCardContent += `URL:${landingPageUrl}\n`;
        }
        if (bio) {
            const escapedBio = bio.replace(/\n/g, '\\n');
            vCardContent += `NOTE:${escapedBio}\n`;
        }
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