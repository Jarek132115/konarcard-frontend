// frontend/src/pages/website/Policies.jsx
import React, { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Home/Footer";
import DotIcon from "../../assets/icons/Dot-Icon.svg";
import RightArrow from "../../assets/icons/RightArrow.svg";

import "../../styling/fonts.css";
import "../../styling/policies.css";

import { useSeo } from "../../utils/seo";

/* ── Animation ease ────────────────────────────────────────── */
const EASE = [0.22, 1, 0.36, 1];

/* ── Open Tidio ────────────────────────────────────────────── */
function openLiveChat(e) {
    e.preventDefault();
    if (window.tidioChatApi && typeof window.tidioChatApi.open === "function") {
        window.tidioChatApi.open();
    }
}

/* ── Dot list item helper ──────────────────────────────────── */
function Li({ src, children }) {
    return (
        <li>
            <img src={src} alt="" className="kc-pol__dot" aria-hidden="true" />
            <span>{children}</span>
        </li>
    );
}

/* ── Policy content ────────────────────────────────────────── */
const POLICIES = [
    { key: "privacy",  label: "Privacy Policy" },
    { key: "terms",    label: "Terms of Service" },
    { key: "warranty", label: "Warranty" },
    { key: "cookies",  label: "Cookie Policy" },
    { key: "shipping", label: "Shipping & Returns" },
];

function PrivacyPolicy({ dot }) {
    return (
        <div className="kc-pol__content">
            <header className="kc-pol__head">
                <h1 className="h2 kc-pol__title">Privacy Policy</h1>
                <p className="kc-pol__updated">Last updated: 25 January 2026</p>
                <p className="body kc-pol__lead">
                    At KonarCard, your privacy matters. This Privacy Policy explains what personal data
                    we collect, why we collect it, how we use and protect it, and what rights you have
                    when you use our website, products, and services. KonarCard is operated by KonarCard
                    Ltd, registered in England and Wales.
                </p>
            </header>

            <div className="kc-pol__block">
                <p className="kc-pol__h">1. Information we collect</p>
                <p className="body kc-pol__p">We collect information when you register, purchase, or use our services:</p>
                <ul className="kc-pol__ul">
                    <Li src={dot}>Name, email address, and password when you create an account</Li>
                    <Li src={dot}>Business details, phone number, and social links added to your KonarCard profile</Li>
                    <Li src={dot}>Billing information (payment handled securely via Stripe — we do not store card details)</Li>
                    <Li src={dot}>Delivery address when purchasing physical NFC cards</Li>
                    <Li src={dot}>Usage data including pages visited, features used, and device/browser information</Li>
                    <Li src={dot}>Support communications when you contact us via chat or email</Li>
                </ul>
            </div>

            <div className="kc-pol__block">
                <p className="kc-pol__h">2. Lawful basis for processing</p>
                <p className="body kc-pol__p">We process your data under the following lawful bases (UK GDPR):</p>
                <ul className="kc-pol__ul">
                    <Li src={dot}><strong>Contract</strong> — to provide the services you have signed up for</Li>
                    <Li src={dot}><strong>Legitimate interests</strong> — to improve our platform, prevent fraud, and provide customer support</Li>
                    <Li src={dot}><strong>Legal obligation</strong> — where we are required to retain certain records by law</Li>
                    <Li src={dot}><strong>Consent</strong> — for any optional marketing communications (you can opt out at any time)</Li>
                </ul>
            </div>

            <div className="kc-pol__block">
                <p className="kc-pol__h">3. How we use your information</p>
                <ul className="kc-pol__ul">
                    <Li src={dot}>Create and manage your KonarCard account</Li>
                    <Li src={dot}>Display your digital business card profile publicly as you configure it</Li>
                    <Li src={dot}>Process payments and manage subscriptions</Li>
                    <Li src={dot}>Fulfil and ship physical NFC card orders</Li>
                    <Li src={dot}>Respond to support requests and troubleshoot issues</Li>
                    <Li src={dot}>Send transactional emails (order confirmation, account updates)</Li>
                    <Li src={dot}>Improve our platform, features, and overall user experience</Li>
                    <Li src={dot}>Comply with legal and regulatory obligations</Li>
                </ul>
                <p className="body kc-pol__p">We do not sell your personal data.</p>
            </div>

            <div className="kc-pol__block">
                <p className="kc-pol__h">4. Sharing your information</p>
                <p className="body kc-pol__p">
                    We share limited data only with trusted third-party service providers necessary to operate our
                    business. These include:
                </p>
                <ul className="kc-pol__ul">
                    <Li src={dot}><strong>Stripe</strong> — payment processing</Li>
                    <Li src={dot}><strong>Cloud hosting providers</strong> — secure infrastructure and storage</Li>
                    <Li src={dot}><strong>Analytics tools</strong> — to understand how our site is used (anonymised where possible)</Li>
                    <Li src={dot}><strong>Tidio</strong> — live chat support</Li>
                </ul>
                <p className="body kc-pol__p">
                    All third parties are contractually required to handle your data securely and in accordance with
                    applicable data protection law. We do not transfer your data outside the UK/EEA without appropriate
                    safeguards in place.
                </p>
            </div>

            <div className="kc-pol__block">
                <p className="kc-pol__h">5. Data retention</p>
                <p className="body kc-pol__p">
                    We retain your personal data for as long as your account is active or as needed to provide our
                    services. If you delete your account, we will delete or anonymise your personal data within 30 days,
                    except where we are required by law to retain records (for example, financial records which must be
                    kept for at least 6 years under UK tax law).
                </p>
            </div>

            <div className="kc-pol__block">
                <p className="kc-pol__h">6. Data security</p>
                <p className="body kc-pol__p">
                    We use industry-standard security measures including HTTPS encryption, secure database storage,
                    and access controls to protect your data. No method of transmission over the internet is 100%
                    secure, and we cannot guarantee absolute security, but we take reasonable precautions.
                </p>
            </div>

            <div className="kc-pol__block">
                <p className="kc-pol__h">7. Your rights (UK GDPR)</p>
                <p className="body kc-pol__p">Under UK data protection law, you have the right to:</p>
                <ul className="kc-pol__ul">
                    <Li src={dot}><strong>Access</strong> — request a copy of the personal data we hold about you</Li>
                    <Li src={dot}><strong>Rectification</strong> — ask us to correct inaccurate data</Li>
                    <Li src={dot}><strong>Erasure</strong> — request deletion of your data (subject to legal retention requirements)</Li>
                    <Li src={dot}><strong>Restriction</strong> — ask us to limit how we process your data in certain circumstances</Li>
                    <Li src={dot}><strong>Portability</strong> — receive your data in a structured, machine-readable format</Li>
                    <Li src={dot}><strong>Object</strong> — object to processing based on legitimate interests or for direct marketing</Li>
                </ul>
                <p className="body kc-pol__p">
                    To exercise any of these rights, contact us at <strong>support@konarcard.com</strong>. We will
                    respond within 30 days. If you are unhappy with how we handle your data, you have the right to
                    lodge a complaint with the Information Commissioner's Office (ICO) at ico.org.uk.
                </p>
            </div>

            <div className="kc-pol__block">
                <p className="kc-pol__h">8. Contact</p>
                <p className="body kc-pol__p">
                    For any privacy-related questions, contact: <strong>support@konarcard.com</strong>
                </p>
            </div>
        </div>
    );
}

function TermsPolicy({ dot }) {
    return (
        <div className="kc-pol__content">
            <header className="kc-pol__head">
                <h1 className="h2 kc-pol__title">Terms of Service</h1>
                <p className="kc-pol__updated">Last updated: 25 January 2026</p>
                <p className="body kc-pol__lead">
                    These Terms of Service ("Terms") govern your access to and use of the KonarCard platform,
                    website, and physical products (the "Service") provided by KonarCard Ltd, registered in
                    England and Wales. By creating an account, purchasing a product, or using the platform,
                    you agree to these Terms in full.
                </p>
            </header>

            <div className="kc-pol__block">
                <p className="kc-pol__h">1. Using KonarCard</p>
                <p className="body kc-pol__p">
                    KonarCard allows you to create and share a digital business card profile, manage your contact
                    information, and share it using a unique link, QR code, or NFC product.
                </p>
                <ul className="kc-pol__ul">
                    <Li src={dot}>You must be at least 18 years old (or the age of majority in your jurisdiction) to use KonarCard</Li>
                    <Li src={dot}>You must provide accurate and truthful information when registering and using the platform</Li>
                    <Li src={dot}>You are solely responsible for all content published on your public profile</Li>
                    <Li src={dot}>You must not attempt unauthorised access to any part of the Service or its infrastructure</Li>
                </ul>
            </div>

            <div className="kc-pol__block">
                <p className="kc-pol__h">2. Accounts and security</p>
                <p className="body kc-pol__p">
                    You are responsible for maintaining the confidentiality of your account login credentials
                    and for all activities that occur under your account. Notify us immediately at
                    support@konarcard.com if you suspect unauthorised access to your account. We will not be
                    liable for any loss or damage resulting from your failure to keep your credentials secure.
                </p>
            </div>

            <div className="kc-pol__block">
                <p className="kc-pol__h">3. Subscriptions and billing</p>
                <p className="body kc-pol__p">
                    Paid plans are billed on a recurring basis (monthly or annually) depending on your selection
                    at the time of sign-up. All prices are displayed inclusive of VAT where applicable.
                </p>
                <ul className="kc-pol__ul">
                    <Li src={dot}>Subscriptions auto-renew unless cancelled before the next billing date</Li>
                    <Li src={dot}>You can cancel your subscription at any time from the Billing section in your dashboard</Li>
                    <Li src={dot}>Cancellation takes effect at the end of the current billing period — you retain access until then</Li>
                    <Li src={dot}>Fees already paid are non-refundable unless required by law</Li>
                    <Li src={dot}>Extra profiles are billed at £2/month each on the Plus plan</Li>
                </ul>
                <p className="body kc-pol__p">
                    Payments are processed securely by Stripe. KonarCard does not store payment card details.
                </p>
            </div>

            <div className="kc-pol__block">
                <p className="kc-pol__h">4. Acceptable use</p>
                <p className="body kc-pol__p">You agree not to use KonarCard to:</p>
                <ul className="kc-pol__ul">
                    <Li src={dot}>Upload, post, or share illegal, abusive, defamatory, or infringing content</Li>
                    <Li src={dot}>Impersonate another person or business</Li>
                    <Li src={dot}>Spam, harass, or send unsolicited communications to others</Li>
                    <Li src={dot}>Interfere with, disrupt, or attempt to gain unauthorised access to the Service</Li>
                    <Li src={dot}>Use automated tools to scrape, crawl, or extract data from the platform without permission</Li>
                    <Li src={dot}>Use KonarCard for any unlawful purpose</Li>
                </ul>
            </div>

            <div className="kc-pol__block">
                <p className="kc-pol__h">5. Intellectual property</p>
                <p className="body kc-pol__p">
                    All content, branding, code, and design belonging to KonarCard Ltd is protected by copyright
                    and other intellectual property laws. You may not copy, reproduce, modify, or distribute any
                    part of the platform without our written permission.
                </p>
                <p className="body kc-pol__p">
                    You retain ownership of any content you upload to your profile. By using KonarCard, you grant
                    us a limited licence to display and deliver that content as part of the Service.
                </p>
            </div>

            <div className="kc-pol__block">
                <p className="kc-pol__h">6. Limitation of liability</p>
                <p className="body kc-pol__p">
                    To the fullest extent permitted by law, KonarCard Ltd shall not be liable for any indirect,
                    incidental, special, or consequential damages arising from your use of the Service. Our total
                    liability to you in any month shall not exceed the amount you paid us in that month.
                </p>
                <p className="body kc-pol__p">
                    We do not guarantee uninterrupted or error-free operation of the Service and accept no
                    responsibility for third-party services or platforms.
                </p>
            </div>

            <div className="kc-pol__block">
                <p className="kc-pol__h">7. Termination</p>
                <p className="body kc-pol__p">
                    We reserve the right to suspend or permanently terminate accounts that violate these Terms,
                    engage in fraudulent activity, or misuse the Service. You may close your account at any time
                    from your dashboard settings.
                </p>
                <p className="body kc-pol__p">
                    Upon termination, your public profile will be taken offline and your data will be handled
                    in accordance with our Privacy Policy.
                </p>
            </div>

            <div className="kc-pol__block">
                <p className="kc-pol__h">8. Changes to these Terms</p>
                <p className="body kc-pol__p">
                    We may update these Terms from time to time. We will notify you of material changes by email
                    or via the platform. Continued use of KonarCard after changes take effect constitutes
                    acceptance of the revised Terms.
                </p>
            </div>

            <div className="kc-pol__block">
                <p className="kc-pol__h">9. Governing law</p>
                <p className="body kc-pol__p">
                    These Terms are governed by the laws of England and Wales. Any disputes arising from these
                    Terms shall be subject to the exclusive jurisdiction of the courts of England and Wales.
                </p>
            </div>

            <div className="kc-pol__block">
                <p className="kc-pol__h">10. Contact</p>
                <p className="body kc-pol__p">
                    Questions about these Terms? Email: <strong>support@konarcard.com</strong>
                </p>
            </div>
        </div>
    );
}

function WarrantyPolicy({ dot }) {
    return (
        <div className="kc-pol__content">
            <header className="kc-pol__head">
                <h1 className="h2 kc-pol__title">Warranty</h1>
                <p className="kc-pol__updated">Last updated: 25 January 2026</p>
                <p className="body kc-pol__lead">
                    This Warranty Policy applies to all physical products sold directly by KonarCard Ltd,
                    including NFC plastic cards, metal cards, and KonarTag devices. It sets out what is
                    covered, what is not, and how to make a claim.
                </p>
            </header>

            <div className="kc-pol__block">
                <p className="kc-pol__h">12-month limited warranty</p>
                <p className="body kc-pol__p">
                    All KonarCard physical products are covered by a 12-month limited warranty from the date
                    of delivery. This warranty covers manufacturing defects and hardware faults that arise under
                    normal, intended use during this period.
                </p>
            </div>

            <div className="kc-pol__block">
                <p className="kc-pol__h">What is covered</p>
                <ul className="kc-pol__ul">
                    <Li src={dot}>NFC chip failure under normal use (tapping against standard NFC-enabled devices)</Li>
                    <Li src={dot}>Manufacturing defects that affect the function or structural integrity of the product</Li>
                    <Li src={dot}>Faults or damage present at the time of delivery</Li>
                    <Li src={dot}>QR code that is unreadable due to a printing defect (not physical damage)</Li>
                </ul>
            </div>

            <div className="kc-pol__block">
                <p className="kc-pol__h">What is not covered</p>
                <ul className="kc-pol__ul">
                    <Li src={dot}>Normal wear and tear over time</Li>
                    <Li src={dot}>Damage caused by misuse, bending, dropping, or exposure to extreme heat, liquids, or chemicals</Li>
                    <Li src={dot}>Cosmetic damage (surface scratches, scuffs) that does not affect the card's function</Li>
                    <Li src={dot}>Damage caused by incompatible devices or incorrect use of NFC</Li>
                    <Li src={dot}>Lost or stolen cards</Li>
                    <Li src={dot}>Products purchased through unauthorised third parties</Li>
                </ul>
            </div>

            <div className="kc-pol__block">
                <p className="kc-pol__h">How to make a warranty claim</p>
                <p className="body kc-pol__p">
                    To make a claim, email <strong>support@konarcard.com</strong> with:
                </p>
                <ul className="kc-pol__ul">
                    <Li src={dot}>Your order number</Li>
                    <Li src={dot}>A description of the fault or defect</Li>
                    <Li src={dot}>Photos or a short video clearly showing the issue</Li>
                </ul>
                <p className="body kc-pol__p">
                    We will review your claim and respond within 3 working days. If the fault is confirmed,
                    we will arrange a free replacement or repair at our discretion. We reserve the right to
                    inspect the product before issuing a replacement.
                </p>
            </div>

            <div className="kc-pol__block">
                <p className="kc-pol__h">Warranty limitations</p>
                <p className="body kc-pol__p">
                    This warranty gives you specific legal rights. You may also have other rights under
                    applicable consumer protection law (including the UK Consumer Rights Act 2015), which
                    may vary by jurisdiction. This warranty does not affect those statutory rights.
                </p>
            </div>
        </div>
    );
}

function CookiesPolicy({ dot }) {
    return (
        <div className="kc-pol__content">
            <header className="kc-pol__head">
                <h1 className="h2 kc-pol__title">Cookie Policy</h1>
                <p className="kc-pol__updated">Last updated: 25 January 2026</p>
                <p className="body kc-pol__lead">
                    This Cookie Policy explains what cookies are, which cookies KonarCard uses, why we
                    use them, and how you can manage your cookie preferences when using our website
                    and services.
                </p>
            </header>

            <div className="kc-pol__block">
                <p className="kc-pol__h">What are cookies?</p>
                <p className="body kc-pol__p">
                    Cookies are small text files that are stored on your device (computer, phone, or tablet)
                    when you visit a website. They are widely used to make websites work more efficiently,
                    remember your preferences, and provide information to website owners about how visitors
                    use their site.
                </p>
            </div>

            <div className="kc-pol__block">
                <p className="kc-pol__h">Types of cookies we use</p>

                <p className="body kc-pol__p"><strong>Essential cookies</strong></p>
                <p className="body kc-pol__p">
                    These are necessary for the website to function. They enable core features such as
                    account login, session management, and security. You cannot opt out of these cookies
                    as the site will not function properly without them.
                </p>
                <ul className="kc-pol__ul">
                    <Li src={dot}>Authentication tokens to keep you logged in securely</Li>
                    <Li src={dot}>Session cookies to maintain your state as you navigate the site</Li>
                    <Li src={dot}>Security cookies to protect against cross-site request forgery (CSRF)</Li>
                </ul>

                <p className="body kc-pol__p" style={{ marginTop: "14px" }}><strong>Performance and analytics cookies</strong></p>
                <p className="body kc-pol__p">
                    These help us understand how visitors interact with our website so we can improve it.
                    Data collected is anonymised or aggregated where possible.
                </p>
                <ul className="kc-pol__ul">
                    <Li src={dot}>Page visit counts and navigation paths</Li>
                    <Li src={dot}>Device and browser information to optimise display</Li>
                    <Li src={dot}>Error reporting to identify and fix issues</Li>
                </ul>

                <p className="body kc-pol__p" style={{ marginTop: "14px" }}><strong>Third-party cookies</strong></p>
                <p className="body kc-pol__p">
                    Some third-party services we use may set their own cookies. These include:
                </p>
                <ul className="kc-pol__ul">
                    <Li src={dot}><strong>Stripe</strong> — payment processing (fraud prevention and secure checkout)</Li>
                    <Li src={dot}><strong>Tidio</strong> — live chat support widget</Li>
                    <Li src={dot}><strong>Analytics providers</strong> — usage and traffic analysis</Li>
                </ul>
                <p className="body kc-pol__p">
                    These cookies are controlled by the respective providers and subject to their own privacy
                    and cookie policies.
                </p>
            </div>

            <div className="kc-pol__block">
                <p className="kc-pol__h">Managing your cookies</p>
                <p className="body kc-pol__p">
                    You can control and manage cookies through your browser settings. Most browsers allow you
                    to view, delete, and block cookies. Please note that disabling essential cookies will
                    prevent you from logging in and using core features of KonarCard.
                </p>
                <p className="body kc-pol__p">
                    For guidance on managing cookies in your browser:
                </p>
                <ul className="kc-pol__ul">
                    <Li src={dot}>Chrome: Settings &gt; Privacy and security &gt; Cookies and other site data</Li>
                    <Li src={dot}>Safari: Settings &gt; Privacy &gt; Manage Website Data</Li>
                    <Li src={dot}>Firefox: Settings &gt; Privacy &amp; Security &gt; Cookies and Site Data</Li>
                    <Li src={dot}>Edge: Settings &gt; Cookies and site permissions</Li>
                </ul>
            </div>

            <div className="kc-pol__block">
                <p className="kc-pol__h">Changes to this policy</p>
                <p className="body kc-pol__p">
                    We may update this Cookie Policy from time to time to reflect changes in the cookies
                    we use or for other operational, legal, or regulatory reasons. We encourage you to
                    review this page periodically.
                </p>
            </div>

            <div className="kc-pol__block">
                <p className="kc-pol__h">Contact</p>
                <p className="body kc-pol__p">
                    Questions about our use of cookies? Email: <strong>support@konarcard.com</strong>
                </p>
            </div>
        </div>
    );
}

function ShippingPolicy({ dot }) {
    return (
        <div className="kc-pol__content">
            <header className="kc-pol__head">
                <h1 className="h2 kc-pol__title">Shipping & Returns</h1>
                <p className="kc-pol__updated">Last updated: 25 January 2026</p>
                <p className="body kc-pol__lead">
                    This policy explains how KonarCard handles shipping, delivery timelines, and returns
                    for all physical products including NFC plastic cards, metal cards, and KonarTag devices
                    purchased directly from KonarCard Ltd.
                </p>
            </header>

            <div className="kc-pol__block">
                <p className="kc-pol__h">Order processing</p>
                <p className="body kc-pol__p">
                    All orders are processed within 1–3 business days of payment confirmation. Orders placed
                    on weekends or UK bank holidays will be processed on the next working day.
                </p>
                <p className="body kc-pol__p">
                    You will receive an order confirmation email shortly after purchase. If you do not receive
                    this within 24 hours, please check your spam folder or contact us.
                </p>
            </div>

            <div className="kc-pol__block">
                <p className="kc-pol__h">UK delivery</p>
                <p className="body kc-pol__p">
                    We ship to all addresses within the United Kingdom. Estimated delivery times after dispatch:
                </p>
                <ul className="kc-pol__ul">
                    <Li src={dot}><strong>Standard delivery</strong> — 3–5 business days</Li>
                    <Li src={dot}><strong>Express delivery</strong> — 1–2 business days (where available at checkout)</Li>
                </ul>
                <p className="body kc-pol__p">
                    Tracking information will be provided by email once your order has been dispatched.
                    Delivery times are estimates and may vary during peak periods or due to carrier delays.
                </p>
            </div>

            <div className="kc-pol__block">
                <p className="kc-pol__h">International delivery</p>
                <p className="body kc-pol__p">
                    International shipping may be available at checkout depending on your location. Delivery
                    times and costs vary by destination. Any applicable customs duties or import taxes are
                    the responsibility of the recipient.
                </p>
            </div>

            <div className="kc-pol__block">
                <p className="kc-pol__h">Damaged or faulty items</p>
                <p className="body kc-pol__p">
                    If your order arrives damaged or faulty, contact us at <strong>support@konarcard.com</strong> within
                    14 days of delivery. Please include:
                </p>
                <ul className="kc-pol__ul">
                    <Li src={dot}>Your order number</Li>
                    <Li src={dot}>A clear description of the issue</Li>
                    <Li src={dot}>Photos or a short video showing the damage or fault</Li>
                </ul>
                <p className="body kc-pol__p">
                    We will review your report and respond within 3 working days. Where a fault is confirmed,
                    we will arrange a free replacement or refund.
                </p>
            </div>

            <div className="kc-pol__block">
                <p className="kc-pol__h">Returns</p>
                <p className="body kc-pol__p">
                    We accept returns on standard (non-customised) products within 14 days of delivery,
                    provided the item is unused and in its original condition.
                </p>
                <p className="body kc-pol__p">
                    To initiate a return, email <strong>support@konarcard.com</strong> with your order number
                    and reason for return. Return postage costs are the responsibility of the customer unless
                    the item is faulty.
                </p>
            </div>

            <div className="kc-pol__block">
                <p className="kc-pol__h">Non-returnable items</p>
                <ul className="kc-pol__ul">
                    <Li src={dot}>Customised or personalised products (cards with custom front text, logo, or design) are not eligible for return unless they arrive damaged or faulty</Li>
                    <Li src={dot}>Digital services and subscription plans are non-refundable once active</Li>
                </ul>
            </div>

            <div className="kc-pol__block">
                <p className="kc-pol__h">Refunds</p>
                <p className="body kc-pol__p">
                    Approved refunds are issued to the original payment method within 5–10 business days,
                    depending on your bank or card provider. We will notify you by email once the refund
                    has been processed.
                </p>
            </div>

            <div className="kc-pol__block">
                <p className="kc-pol__h">Contact</p>
                <p className="body kc-pol__p">
                    Questions about an order? Email: <strong>support@konarcard.com</strong>
                </p>
            </div>
        </div>
    );
}

function renderPolicy(key, dot) {
    switch (key) {
        case "privacy":  return <PrivacyPolicy dot={dot} />;
        case "terms":    return <TermsPolicy dot={dot} />;
        case "warranty": return <WarrantyPolicy dot={dot} />;
        case "cookies":  return <CookiesPolicy dot={dot} />;
        case "shipping": return <ShippingPolicy dot={dot} />;
        default:         return null;
    }
}

export default function Policies() {
    useSeo({
        path: "/policies",
        title: "Policies | KonarCard Privacy, Terms, Refunds & Shipping",
        description:
            "Read KonarCard's privacy policy, terms of service, refund policy, and shipping information for our NFC business cards and digital profile platform.",
    });

    const [activePolicy, setActivePolicy] = useState("privacy");

    return (
        <>
            <Navbar />

            <main className="kc-pol kc-page">

                {/* ── TWO-COLUMN LAYOUT ────────────────────────────── */}
                <section className="kc-pol__wrap">
                    <div className="kc-pol__grid">

                        {/* Sidebar */}
                        <aside className="kc-pol__left" aria-label="Policy navigation">
                            <div className="kc-pol__side">
                                <div className="kc-pol__sideCard">
                                    <p className="kc-pol__sideTitle">Policies</p>

                                    <ul className="kc-pol__sideList">
                                        {POLICIES.map((p) => (
                                            <li key={p.key}>
                                                <button
                                                    type="button"
                                                    className={`kc-pol__sideBtn${activePolicy === p.key ? " is-active" : ""}`}
                                                    onClick={() => setActivePolicy(p.key)}
                                                    aria-current={activePolicy === p.key ? "page" : undefined}
                                                >
                                                    <span className="kc-pol__sideLabel">{p.label}</span>
                                                    <img
                                                        src={RightArrow}
                                                        alt=""
                                                        className="kc-pol__sideArrowIcon"
                                                        aria-hidden="true"
                                                    />
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="kc-pol__sideCard kc-pol__contactCard">
                                    <p className="kc-pol__sideTitle">Need help?</p>
                                    <p className="kc-pol__contactText">
                                        Our support team is happy to help with any questions.
                                    </p>

                                    <a
                                        className="kc-pol__contactLink"
                                        href="#livechat"
                                        onClick={openLiveChat}
                                    >
                                        Start live chat
                                    </a>

                                    <a
                                        className="kc-pol__contactLink"
                                        href="mailto:support@konarcard.com"
                                    >
                                        support@konarcard.com
                                    </a>
                                </div>
                            </div>
                        </aside>

                        {/* Policy content */}
                        <section className="kc-pol__right">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activePolicy}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -6 }}
                                    transition={{ duration: 0.28, ease: EASE }}
                                >
                                    {renderPolicy(activePolicy, DotIcon)}
                                </motion.div>
                            </AnimatePresence>
                        </section>

                    </div>
                </section>

            </main>

            <Footer />
        </>
    );
}
