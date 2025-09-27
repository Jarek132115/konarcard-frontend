import React, { useContext } from "react";
import { AuthContext } from "./AuthContext";
import ShareProfileIcon from "../assets/icons/ShareProfile-Icon.svg";
import ExternalLinkIcon from "../assets/icons/ExternalLink-Icon.svg"; // <- add a simple external link style icon
import Avatar from "../assets/images/pp10.png";

export default function PageHeader({ onShareCard, onVisitPage, isMobile, isSmallMobile }) {
  const { user } = useContext(AuthContext);

  const displayName = user?.name || "Your Name";
  const displayEmail = user?.email || "you@example.com";

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
        {/* Visit Page button (desktop only) */}
        {!isMobile && (
          <button
            type="button"
            className="desktop-button orange-button"
            onClick={onVisitPage}
            aria-label="Visit your page"
          >
            <img src={ExternalLinkIcon} alt="Visit" className="share-icon" />
            <span>Visit Page</span>
          </button>
        )}

        {/* Share Page button */}
        <button
          type="button"
          className="desktop-button orange-button header-share"
          onClick={onShareCard}
          aria-label="Share your page"
        >
          {isSmallMobile ? (
            <img src={ShareProfileIcon} alt="Share" className="share-icon" />
          ) : (
            <>
              <img src={ShareProfileIcon} alt="Share" className="share-icon" />
              <span>Share Your Page</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
