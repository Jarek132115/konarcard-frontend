// src/components/Dashboard/PageHeader.jsx
import React from "react";
import "../../styling/dashboard/pageheader.css";

/**
 * PageHeader (Clean v2)
 * - White page background (handled by page / layout)
 * - Header card uses kc-bg-soft (#fafafa)
 * - Very light shadow (almost border-only)
 *
 * Props:
 * - title: string
 * - subtitle?: string
 * - rightSlot?: ReactNode
 */
export default function PageHeader({ title, subtitle, rightSlot }) {
  return (
    <header className="ph2-wrap">
      <div className="ph2-card">
        <div className="ph2-row">
          <div className="ph2-left">
            <h1 className="ph2-title">{title}</h1>
            {subtitle ? <p className="ph2-sub">{subtitle}</p> : null}
          </div>

          {rightSlot ? <div className="ph2-right">{rightSlot}</div> : null}
        </div>
      </div>
    </header>
  );
}