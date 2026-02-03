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
 * - onShareCard: () => void
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

  const handleVisitClick = (e) => {
    if (!visitUrl && typeof onVisitPage === "function") {
      e.preventDefault();
      onVisitPage();
    }
  };

  return (
    <div className="ph-wrap">
      <div className="ph-card">
        <div className="ph-left">
          <div className="ph-avatar-wrap" aria-hidden="true">
            <img src={Avatar} alt="" className="ph-avatar" />
          </div>

          <div className="ph-meta">
            <div className="ph-userline">
              <div className="ph-name">{displayName}</div>
              <div className="ph-dot" aria-hidden="true">
                •
              </div>
              <div className="ph-email">{displayEmail}</div>
            </div>

            <div className="ph-titleline">
              {title ? <h1 className="ph-title">{title}</h1> : null}
              {subtitle ? <p className="ph-sub">{subtitle}</p> : null}
            </div>
          </div>
        </div>

        <div className="ph-right">
          {rightSlot ? <div className="ph-slot">{rightSlot}</div> : null}

          {!isMobile && (
            <a
              href={visitUrl || "#"}
              target={visitUrl ? "_blank" : undefined}
              rel={visitUrl ? "noopener noreferrer" : undefined}
              onClick={handleVisitClick}
              className="ph-btn ph-btn-ghost"
            >
              <img src={ExternalLinkIcon} alt="" className="ph-ico" />
              <span>Visit Page</span>
            </a>
          )}

          <button type="button" className="ph-btn ph-btn-primary" onClick={onShareCard}>
            <img src={ShareProfileIcon} alt="" className="ph-ico" />
            <span>{isSmallMobile ? "Share" : "Share Your Page"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
