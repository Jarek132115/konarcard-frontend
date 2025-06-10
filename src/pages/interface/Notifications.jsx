import React from 'react';
import Sidebar from '../../components/Sidebar';

export default function Notifications() {
  return (
    <div className="notifications-layout">
      <Sidebar />

      <main className="notifications-main">
        <h1 className="notifications-title">Notifications</h1>

        <div className="notifications-card">
          <p className="notifications-subtitle">
            Manage how you receive updates for incoming leads.
          </p>

          <div className="notification-option">
            <div>
              <p className="option-title">Email</p>
              <p className="option-description">Get lead notifications in your email inbox.</p>
            </div>
            <div className="switch off"></div>
          </div>

          <div className="notification-option">
            <div>
              <p className="option-title">WhatsApp</p>
              <p className="option-description">Receive lead updates via WhatsApp.</p>
            </div>
            <div className="switch off"></div>
          </div>

          <div className="notification-option">
            <div>
              <p className="option-title">Turn Off All Notifications</p>
              <p className="option-description">Stop all lead notifications.</p>
            </div>
            <div className="switch on"></div>
          </div>
        </div>
      </main>
    </div>
  );
}
