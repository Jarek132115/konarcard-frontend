// src/components/Dashboard/PageHeader.jsx
import React from "react";
import "../../styling/dashboard/pageheader.css";

/**
 * PageHeader (Unified)
 * Props:
 * - title: string
 * - subtitle?: string
 * - rightSlot?: ReactNode (plan pill + actions)
 */
export default function PageHeader({ title, subtitle, rightSlot }) {
  return (
    <div className="ph-wrap">
      <div className="ph-card">
        <div className="ph-row">
          <div className="ph-left">
            <h1 className="ph-title">{title}</h1>
            {subtitle ? <p className="ph-sub">{subtitle}</p> : null}
          </div>

          {rightSlot ? <div className="ph-right">{rightSlot}</div> : null}
        </div>
      </div>
    </div>
  );
}
