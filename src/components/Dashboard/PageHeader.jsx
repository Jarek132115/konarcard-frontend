// src/components/Dashboard/PageHeader.jsx
import React from "react";
import "../../styling/dashboard/pageheader.css";

/**
 * PageHeader (Clean v2)
 * - Card padding = 24px all around
 * - Title uses .kc-title
 * - Subtitle uses .kc-body
 * - Gap between title/sub = 4px
 * - RightSlot vertically centered
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
            <div className="ph2-title kc-title">{title}</div>
            {subtitle ? <div className="ph2-sub kc-body">{subtitle}</div> : null}
          </div>

          {rightSlot ? <div className="ph2-right">{rightSlot}</div> : null}
        </div>
      </div>
    </header>
  );
}