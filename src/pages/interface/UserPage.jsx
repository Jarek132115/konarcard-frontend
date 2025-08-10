import React from "react";
import { useParams } from "react-router-dom";
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';

const UserPage = () => {
    const { username } = useParams();

    const { data: businessCard, isLoading, isError, error } = useQuery({
        queryKey: ["public-business-card", username],
        queryFn: async () => {
            const response = await api.get(`/api/business-card/by_username/${username}`);
            return response.data;
        },
        enabled: !!username,
        staleTime: 5 * 60 * 1000,
        cacheTime: 10 * 60 * 1000,
        retry: 1,
    });

    if (isLoading) {
        return (
            <div className="user-landing-page" style={{ textAlign: "center", display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
                <p>Loading business card...</p>
            </div>
        );
    }

    if (isError) {
        console.error("Error fetching business card:", error);
        return (
            <div className="user-landing-page" style={{ textAlign: "center", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", minHeight: "100vh", backgroundColor: "#f0f0f0", color: "#333", padding: "20px", fontFamily: "Arial, sans-serif" }}>
                <div style={{ maxWidth: "600px", margin: "auto", padding: "40px", border: "1px solid #ddd", borderRadius: "10px", boxShadow: "0 4px 8px rgba(0,0,0,0.1)" }}>
                    <h2 style={{ fontSize: "2rem", marginBottom: "20px" }}>Profile Unavailable</h2>
                    <p style={{ fontSize: "1.2rem", lineHeight: "1.6" }}>
                        This public profile is not currently active. The free trial may have expired or a subscription is needed.
                    </p>
                    <p style={{ fontSize: "1.1rem", marginTop: "20px" }}>
                        Please contact **@{username}** directly for more information.
                    </p>
                </div>
            </div>
        );
    }

    if (!businessCard) {
        return (
            <div className="user-landing-page" style={{ textAlign: "center", display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
                <p>No business card found for username "{username}".</p>
            </div>
        );
    }

    const hasActiveSubscription = businessCard.isSubscribed;
    const isTrialPeriodActive = businessCard.trialExpires && new Date(businessCard.trialExpires) > new Date();
    const isProfileActive = hasActiveSubscription || isTrialPeriodActive;

    if (!isProfileActive) {
        console.log("Profile is not active. isSubscribed:", hasActiveSubscription, "isTrialActive:", isTrialPeriodActive);
        return (
            <div className="user-landing-page" style={{ textAlign: "center", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", minHeight: "100vh", backgroundColor: "#f0f0f0", color: "#333", padding: "20px", fontFamily: "Arial, sans-serif" }}>
                <div style={{ maxWidth: "600px", margin: "auto", padding: "40px", border: "1px solid #ddd", borderRadius: "10px", boxShadow: "0 4px 8px rgba(0,0,0,0.1)" }}>
                    <h2 style={{ fontSize: "2rem", marginBottom: "20px" }}>Profile Unavailable</h2>
                    <p style={{ fontSize: "1.2rem", lineHeight: "1.6" }}>
                        This public profile is not currently active. The free trial may have expired or a subscription is needed.
                    </p>
                    <p style={{ fontSize: "1.1rem", marginTop: "20px" }}>
                        Please contact **@{username}** directly for more information.
                    </p>
                </div>
            </div>
        );
    }

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
            {/* Main Section */}
            {businessCard.show_main_section && (
                <>
                    {businessCard.cover_photo && (
                        <img
                            src={businessCard.cover_photo}
                            alt="Cover"
                            className="landing-cover-photo"
                        />
                    )}
                    <h2 className="landing-main-heading">{businessCard.main_heading}</h2>
                    <p className="landing-sub-heading">{businessCard.sub_heading}</p>
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
                </>
            )}

            {/* About Me Section */}
            {businessCard.show_about_me_section && (businessCard.full_name || businessCard.job_title || businessCard.bio || businessCard.avatar) && (
                <>
                    <p className="landing-section-title">About me</p>
                    <div className={`landing-about-section ${businessCard.about_me_layout}`}>
                        {businessCard.avatar && (
                            <img
                                src={businessCard.avatar}
                                alt="Avatar"
                                className="landing-avatar"
                            />
                        )}
                        <div className="landing-about-content-group">
                            <p className="landing-profile-name">{businessCard.full_name}</p>
                            <p className="landing-profile-role">{businessCard.job_title}</p>
                        </div>
                    </div>
                    {businessCard.bio && <p className="landing-bio-text">{businessCard.bio}</p>}
                </>
            )}

            {/* My Work Section */}
            {businessCard.show_work_section && businessCard.works?.length > 0 && (
                <>
                    <p className="landing-section-title">My Work</p>
                    <div className={`landing-work-gallery ${businessCard.work_display_mode}`}>
                        {businessCard.works.map((url, i) => (
                            <img
                                key={i}
                                src={url}
                                alt={`work-${i}`}
                                className="landing-work-image"
                            />
                        ))}
                    </div>
                </>
            )}

            {/* My Services Section */}
            {businessCard.show_services_section && businessCard.services?.length > 0 && (
                <>
                    <p className="landing-section-title">My Services</p>
                    <div className={`landing-services-list ${businessCard.services_display_mode}`}>
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
            {businessCard.show_reviews_section && businessCard.reviews?.length > 0 && (
                <>
                    <p className="landing-section-title">Reviews</p>
                    <div className={`landing-reviews-list ${businessCard.reviews_display_mode}`}>
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

            {/* Contact Details Section */}
            {businessCard.show_contact_section && (businessCard.contact_email || businessCard.phone_number) && (
                <>
                    <p className="landing-section-title">Contact Details</p>
                    <div className="landing-contact-details">
                        <div className="landing-contact-item">
                            <p className="landing-contact-label">Email:</p>
                            <p className="landing-contact-value">{businessCard.contact_email}</p>
                        </div>
                        <div className="landing-contact-item">
                            <p className="landing-contact-label">Phone:</p>
                            <p className="landing-contact-value">{businessCard.phone_number}</p>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default UserPage;