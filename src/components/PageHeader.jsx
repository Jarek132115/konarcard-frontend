import React, { useContext } from "react";
import { AuthContext } from "./AuthContext";
import ShareProfileIcon from "../assets/icons/ShareProfile-Icon.svg";
import ExternalLinkIcon from "../assets/icons/ExternalLink-Icon.svg";
import Avatar from "../assets/images/pp10.png";

/**
 * Props:
 * - onShareCard: () => void
 * - onVisitPage?: () => void    // optional fallback
 * - visitUrl?: string           // preferred – same behavior as ShareProfile "Visit Profile"
 * - isMobile: boolean
 * - isSmallMobile: boolean
 */
export default function PageHeader({
  onShareCard,
  onVisitPage,
  visitUrl,           // <-- new
  isMobile,
  isSmallMobile,
}) {
  const { user } = useContext(AuthContext);

  const displayName = user?.name || "Your Name";
  const displayEmail = user?.email || "you@example.com";

  // if no visitUrl, we’ll use onVisitPage handler as a fallback
  const handleVisitClick = (e) => {
    if (!visitUrl && typeof onVisitPage === "function") {
      e.preventDefault(); // prevent '#' navigation if we used it
      onVisitPage();
    }
  };

  return (
    <div className="page-header-card">
      <div className="page-header-left">
        <img src={Avatar} alt="Profile" className="ph-avatar" />
        <div className="ph-user">
          <p className="ph-name">{displayName}</p>
          <p className="ph-email">{displayEmail}</p>
        </div>
      </div>

      <div className="page-header-right">
        {/* Visit Page (desktop only) — anchor for real link behavior */}
        {!isMobile && (
          <a
            href={visitUrl || "#"}
            target={visitUrl ? "_blank" : undefined}
            rel={visitUrl ? "noopener noreferrer" : undefined}
            onClick={handleVisitClick}
            aria-label="Visit your page"
            className="desktop-button navy-button"
            style={{ textDecoration: "none" }}
          >
            <img src={ExternalLinkIcon} alt="Visit" className="share-icon" />
            <span>Visit Page</span>
          </a>
        )}

        {/* Share Page button */}
        <button
          type="button"
          className="desktop-button orange-button header-share"
          onClick={onShareCard}
          aria-label="Share your profile"
        >
          <img src={ShareProfileIcon} alt="Share" className="share-icon" />
          <span>{isSmallMobile ? "Share" : "Share Your Page"}</span>
        </button>
      </div>
    </div>
  );
}
