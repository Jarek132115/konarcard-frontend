// src/components/Dashboard/PageHeader.jsx
import React from "react";
import "../../styling/dashboard/pageheader.css";

/**
 * PageHeader (Unified)
 * Props:
 * - title: string
 * - subtitle?: string
 * - badge?: ReactNode (optional small pill like "Plan: FREE")
 * - primaryAction?: ReactNode (button/link)
 * - secondaryAction?: ReactNode (button/link)
 */
export default function PageHeader({ title, subtitle, badge, primaryAction, secondaryAction }) {
  return (
    <div className="ph-wrap">
      <div className="ph-card">
        <div className="ph-row">
          <div className="ph-left">
            {badge ? <div className="ph-badge">{badge}</div> : null}
            <h1 className="ph-title">{title}</h1>
            {subtitle ? <p className="ph-sub">{subtitle}</p> : null}
          </div>

          {(primaryAction || secondaryAction) ? (
            <div className="ph-actions">
              {secondaryAction ? <div className="ph-action">{secondaryAction}</div> : null}
              {primaryAction ? <div className="ph-action">{primaryAction}</div> : null}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
