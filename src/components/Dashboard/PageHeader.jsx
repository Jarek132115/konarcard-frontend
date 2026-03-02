import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styling/dashboard/pageheader.css";

/**
 * PageHeader (No background)
 * - Title + subtitle on left
 * - Right cluster: Plan pill, notifications dropdown, avatar (settings)
 *
 * Props:
 * - title: string
 * - subtitle?: string
 * - planName?: string (defaults "Free")
 * - notifications?: Array<{ id: string, title: string, time?: string }>
 */
export default function PageHeader({
  title,
  subtitle,
  planName = "Free",
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

  return (
    <header className="ph3">
      <div className="ph3-left">
        <div className="ph3-title kc-title">{title}</div>
        {subtitle ? <div className="ph3-sub kc-body">{subtitle}</div> : null}
      </div>

      <div className="ph3-right" ref={wrapRef}>
        <span className="ph3-pill" aria-label={`Plan: ${planName}`}>
          Plan: <strong>{planName}</strong>
        </span>

        <div className="ph3-dd">
          <button
            type="button"
            className={`ph3-iconBtn ${open ? "active" : ""}`}
            aria-label="Notifications"
            aria-haspopup="menu"
            aria-expanded={open ? "true" : "false"}
            onClick={() => setOpen((v) => !v)}
          >
            {/* simple bell svg (no extra asset required) */}
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M12 22a2.2 2.2 0 0 0 2.2-2.2h-4.4A2.2 2.2 0 0 0 12 22Zm7-6.2V11a7 7 0 1 0-14 0v4.8L3.6 17.2c-.6.6-.2 1.6.7 1.6h15.4c.9 0 1.3-1 .7-1.6L19 15.8Z"
                fill="currentColor"
              />
            </svg>
            {notifications.length ? <span className="ph3-dot" /> : null}
          </button>

          {open ? (
            <div className="ph3-menu" role="menu">
              <div className="ph3-menuHead">Notifications</div>

              {items.length ? (
                <div className="ph3-menuList">
                  {items.map((n) => (
                    <div className="ph3-item" key={n.id} role="menuitem">
                      <div className="ph3-itemTitle">{n.title}</div>
                      {n.time ? <div className="ph3-itemTime">{n.time}</div> : null}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="ph3-empty">
                  No notifications yet.
                </div>
              )}
            </div>
          ) : null}
        </div>

        <button
          type="button"
          className="ph3-avatarBtn"
          aria-label="Account settings"
          onClick={() => navigate("/settings")}
        >
          {/* If you later have a real avatar image, replace with <img/> */}
          <span className="ph3-avatar" aria-hidden="true">
            <span className="ph3-avatarInner">U</span>
          </span>
        </button>
      </div>
    </header>
  );
}