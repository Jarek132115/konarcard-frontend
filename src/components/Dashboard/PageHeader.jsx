// src/components/Dashboard/PageHeader.jsx
import React, { useContext } from "react";
import { AuthContext } from "../AuthContext";

import ShareProfileIcon from "../../assets/icons/ShareProfile-Icon.svg";
import ExternalLinkIcon from "../../assets/icons/ExternalLink-Icon.svg";
import Avatar from "../../assets/images/pp10.png";

import "../../styling/dashboard/pageheader.css";

/**
 * Props:
 * - title?: string
 * - subtitle?: string
 * - onShareCard?: () => void
 * - onVisitPage?: () => void
 * - visitUrl?: string
 * - isMobile: boolean
 * - isSmallMobile: boolean
 * - rightSlot?: ReactNode
 */
export default function PageHeader({
  title,
  subtitle,
  onShareCard,
  onVisitPage,
  visitUrl,
  isMobile,
  isSmallMobile,
  rightSlot,
}) {
  const { user } = useContext(AuthContext);

  const displayName = user?.name || "Your Name";
  const displayEmail = user?.email || "you@example.com";

  const canShare = typeof onShareCard === "function";
  const canVisit = Boolean(visitUrl) || typeof onVisitPage === "function";

  const handleVisitClick = (e) => {
    if (!visitUrl && typeof onVisitPage === "function") {
      e.preventDefault();
      onVisitPage();
    }
  };

  return (
    <div className="ph-wrap">
      <div className="ph-card">
        <div className="ph-top">
          <div className="ph-id">
            <div className="ph-avatarWrap" aria-hidden="true">
              <img src={Avatar} alt="" className="ph-avatar" />
            </div>

            <div className="ph-user">
              <div className="ph-name">{displayName}</div>
              <div className="ph-email">{displayEmail}</div>
            </div>
          </div>

          <div className="ph-actions">
            {rightSlot ? <div className="ph-slot">{rightSlot}</div> : null}

            {!isMobile && canVisit ? (
              <a
                href={visitUrl || "#"}
                target={visitUrl ? "_blank" : undefined}
                rel={visitUrl ? "noopener noreferrer" : undefined}
                onClick={handleVisitClick}
                className="kx-btn kx-btn--white ph-btn"
              >
                <img src={ExternalLinkIcon} alt="" className="ph-ico" />
                <span>Visit page</span>
              </a>
            ) : null}

            {canShare ? (
              <button
                type="button"
                className="kx-btn kx-btn--black ph-btn"
                onClick={onShareCard}
              >
                <img src={ShareProfileIcon} alt="" className="ph-ico" />
                <span>{isSmallMobile ? "Share" : "Share page"}</span>
              </button>
            ) : null}
          </div>
        </div>

        {(title || subtitle) && (
          <div className="ph-main">
            {title ? <h1 className="ph-title">{title}</h1> : null}
            {subtitle ? <p className="ph-sub">{subtitle}</p> : null}
          </div>
        )}
      </div>
    </div>
  );
}
