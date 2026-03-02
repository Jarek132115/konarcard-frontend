import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styling/dashboard/pageheader.css";

import NotificationsIcon from "../../assets/icons/PageHeaderNotifications.svg";

/**
 * PageHeader (No background)
 * - Left: title (.h3) + subtitle (.kc-subheading) with 4px gap
 * - Right: Plan pill (shadow border), notifications (40x40), avatar initials (40x40)
 *
 * Props:
 * - title: string
 * - subtitle?: string
 * - planName?: string (defaults "Free")
 * - userName?: string (used to generate initial, e.g. "Sam" => "S")
 * - notifications?: Array<{ id: string, title: string, time?: string }>
 */
export default function PageHeader({
  title,
  subtitle,
  planName = "Free",
  userName = "",
  notifications = [],
}) {
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    const onDown = (e) => {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target)) setOpen(false);
    };
    window.addEventListener("mousedown", onDown);
    return () => window.removeEventListener("mousedown", onDown);
  }, []);

  const items = useMemo(() => notifications.slice(0, 6), [notifications]);

  const initial = useMemo(() => {
    const t = (userName || "").trim();
    if (!t) return "U";
    return t[0].toUpperCase();
  }, [userName]);

  return (
    <header className="ph4">
      <div className="ph4-left">
        <div className="ph4-title h3">{title}</div>
        {subtitle ? <div className="ph4-sub kc-subheading">{subtitle}</div> : null}
      </div>

      <div className="ph4-right" ref={wrapRef}>
        <span className="ph4-pill" aria-label={`Plan: ${planName}`}>
          Plan: <strong>{planName}</strong>
        </span>

        <div className="ph4-dd">
          <button
            type="button"
            className={`ph4-iconBtn ${open ? "active" : ""}`}
            aria-label="Notifications"
            aria-haspopup="menu"
            aria-expanded={open ? "true" : "false"}
            onClick={() => setOpen((v) => !v)}
          >
            <img className="ph4-iconImg" src={NotificationsIcon} alt="" aria-hidden="true" />
            {notifications.length ? <span className="ph4-dot" /> : null}
          </button>

          {open ? (
            <div className="ph4-menu" role="menu">
              <div className="ph4-menuHead">Notifications</div>

              {items.length ? (
                <div className="ph4-menuList">
                  {items.map((n) => (
                    <div className="ph4-item" key={n.id} role="menuitem">
                      <div className="ph4-itemTitle">{n.title}</div>
                      {n.time ? <div className="ph4-itemTime">{n.time}</div> : null}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="ph4-empty">No notifications yet.</div>
              )}
            </div>
          ) : null}
        </div>

        <button
          type="button"
          className="ph4-avatarBtn"
          aria-label="Account settings"
          onClick={() => navigate("/settings")}
        >
          <span className="ph4-avatar" aria-hidden="true">
            <span className="ph4-avatarInner">{initial}</span>
          </span>
        </button>
      </div>
    </header>
  );
}