import React from "react";
import "../../styling/home/share.css";

/*
  HOME — SHARE SECTION
  Previously lived in Home/index.jsx as "HOW TO SHARE"
  Now a component so Home stays clean.
*/

export default function Share({
    nfcImage,
    qrImage,
    smsImage,
    linkImage,
}) {
    return (
        <section className="kc-share section" aria-label="How to share your profile">
            <div className="kc-share__inner">
                <div className="kc-share__header">
                    <h2 className="kc-share__title desktop-h3 text-center">
                        One Profile. <span className="orange">Shared</span> Every Way.
                    </h2>
                    <p className="kc-share__sub desktop-body-xs text-center">
                        Four simple ways to get your details in front of clients.
                    </p>
                </div>

                <div className="kc-share__grid">
                    <div className="kc-share__card">
                        <div className="kc-share__media">
                            {nfcImage ? <img src={nfcImage} alt="NFC business card being tapped to share details" /> : null}
                        </div>
                        <h3 className="kc-share__cardTitle">NFC Business Card</h3>
                        <p className="kc-share__cardDesc">Tap to Instantly Share Details With Anyone</p>
                    </div>

                    <div className="kc-share__card">
                        <div className="kc-share__media">
                            {qrImage ? <img src={qrImage} alt="Scanning a QR code to open profile" /> : null}
                        </div>
                        <h3 className="kc-share__cardTitle">Scan QR Code</h3>
                        <p className="kc-share__cardDesc">Scan the QR Code To Open Your Profile</p>
                    </div>

                    <div className="kc-share__card">
                        <div className="kc-share__media">
                            {smsImage ? <img src={smsImage} alt="Sharing your link via message apps" /> : null}
                        </div>
                        <h3 className="kc-share__cardTitle">Share via Message</h3>
                        <p className="kc-share__cardDesc">WhatsApp, SMS, Messenger &amp; More</p>
                    </div>

                    <div className="kc-share__card">
                        <div className="kc-share__media">
                            {linkImage ? <img src={linkImage} alt="Link in bio on social profile" /> : null}
                        </div>
                        <h3 className="kc-share__cardTitle">Link In Bio</h3>
                        <p className="kc-share__cardDesc">Add to Instagram, Facebook, TikTok, or your website.</p>
                    </div>
                </div>
            </div>
        </section>
    );
}
