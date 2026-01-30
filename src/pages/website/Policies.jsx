// frontend/src/pages/website/Policies.jsx
import React, { useMemo, useState } from "react";
import Navbar from "../../components/Navbar";
import Breadcrumbs from "../../components/Breadcrumbs";
import Footer from "../../components/Footer";
import DotIcon from "../../assets/icons/Dot-Icon.svg";

export default function Policies() {
  const [activePolicy, setActivePolicy] = useState("privacy");

  const policies = useMemo(
    () => [
      { key: "privacy", label: "Privacy Policy" },
      { key: "terms", label: "Terms Of Service" },
      { key: "warranty", label: "Warranty" },
      { key: "cookies", label: "Cookie Policy" },
      { key: "shipping", label: "Shipping & Returns" },
    ],
    []
  );

  const renderContent = () => {
    switch (activePolicy) {
      case "privacy":
        return (
          <div className="policies-contentCard">
            <p className="policies-title">Privacy Policy</p>
            <p className="policies-updated">Last updated: 25/01/2026</p>

            <p className="policies-lead">
              At KonarCard, your privacy is important to us. This Privacy Policy
              explains what information we collect, how we use it, and how we
              protect it when you use our website, products, and services. By
              using KonarCard, you agree to the terms of this Privacy Policy.
            </p>

            <div className="policies-block">
              <p className="policies-h">Information we collect</p>
              <p className="policies-p">
                We collect information to provide and improve our services. This
                may include:
              </p>

              <ul className="policies-ul">
                <li>
                  <img src={DotIcon} alt="" className="policies-dot" />
                  Personal information you provide, such as your name, email
                  address, and profile details
                </li>
                <li>
                  <img src={DotIcon} alt="" className="policies-dot" />
                  Information added to your KonarCard profile (contact details,
                  links, images, business information)
                </li>
                <li>
                  <img src={DotIcon} alt="" className="policies-dot" />
                  Account and usage data, such as how you interact with our
                  website and services
                </li>
                <li>
                  <img src={DotIcon} alt="" className="policies-dot" />
                  Payment information when you make a purchase (processed
                  securely by third-party payment providers)
                </li>
              </ul>

              <p className="policies-p">We do not collect unnecessary personal data.</p>
            </div>

            <div className="policies-block">
              <p className="policies-h">How we use your information</p>
              <p className="policies-p">We use your information to:</p>

              <ul className="policies-ul">
                <li>
                  <img src={DotIcon} alt="" className="policies-dot" />
                  Provide and operate KonarCard
                </li>
                <li>
                  <img src={DotIcon} alt="" className="policies-dot" />
                  Create and manage your account
                </li>
                <li>
                  <img src={DotIcon} alt="" className="policies-dot" />
                  Display your digital business card as intended
                </li>
                <li>
                  <img src={DotIcon} alt="" className="policies-dot" />
                  Process payments and subscriptions
                </li>
                <li>
                  <img src={DotIcon} alt="" className="policies-dot" />
                  Communicate with you about your account or support requests
                </li>
                <li>
                  <img src={DotIcon} alt="" className="policies-dot" />
                  Improve our website, features, and user experience
                </li>
                <li>
                  <img src={DotIcon} alt="" className="policies-dot" />
                  Comply with legal obligations
                </li>
              </ul>

              <p className="policies-p">We only use your data for legitimate business purposes.</p>
            </div>

            <div className="policies-block">
              <p className="policies-h">Sharing your information</p>
              <p className="policies-p">We do not sell your personal information.</p>
              <p className="policies-p">
                We may share limited data with trusted third-party service
                providers who help us operate KonarCard, such as:
              </p>

              <ul className="policies-ul">
                <li>
                  <img src={DotIcon} alt="" className="policies-dot" />
                  Hosting and infrastructure providers
                </li>
                <li>
                  <img src={DotIcon} alt="" className="policies-dot" />
                  Payment processors
                </li>
                <li>
                  <img src={DotIcon} alt="" className="policies-dot" />
                  Analytics tools
                </li>
              </ul>

              <p className="policies-p">
                These providers only access information necessary to perform
                their services and are required to protect your data.
              </p>
            </div>

            <div className="policies-block">
              <p className="policies-h">Cookies</p>
              <p className="policies-p">
                We use cookies and similar technologies to:
              </p>

              <ul className="policies-ul">
                <li>
                  <img src={DotIcon} alt="" className="policies-dot" />
                  Ensure the website functions properly
                </li>
                <li>
                  <img src={DotIcon} alt="" className="policies-dot" />
                  Understand how visitors use our site
                </li>
                <li>
                  <img src={DotIcon} alt="" className="policies-dot" />
                  Improve performance and user experience
                </li>
              </ul>

              <p className="policies-p">
                You can control or disable cookies through your browser settings.
                Some features may not work correctly without cookies enabled.
              </p>
            </div>

            <div className="policies-block">
              <p className="policies-h">Data security</p>
              <p className="policies-p">
                We take reasonable measures to protect your information,
                including technical and organisational safeguards designed to
                prevent unauthorised access, loss, or misuse.
              </p>
              <p className="policies-p">
                However, no method of transmission over the internet is
                completely secure, and we cannot guarantee absolute security.
              </p>
            </div>

            <div className="policies-block">
              <p className="policies-h">Data retention</p>
              <p className="policies-p">
                We keep your personal information only for as long as necessary
                to provide our services and meet legal requirements.
              </p>
              <p className="policies-p">
                You may request deletion of your account and associated data at
                any time.
              </p>
            </div>

            <div className="policies-block">
              <p className="policies-h">Your rights</p>
              <p className="policies-p">
                Depending on your location, you may have the right to:
              </p>

              <ul className="policies-ul">
                <li>
                  <img src={DotIcon} alt="" className="policies-dot" />
                  Access the personal information we hold about you
                </li>
                <li>
                  <img src={DotIcon} alt="" className="policies-dot" />
                  Request corrections to your information
                </li>
                <li>
                  <img src={DotIcon} alt="" className="policies-dot" />
                  Request deletion of your data
                </li>
                <li>
                  <img src={DotIcon} alt="" className="policies-dot" />
                  Object to or restrict certain processing
                </li>
              </ul>

              <p className="policies-p">
                To exercise your rights, contact us using the details below.
              </p>
            </div>

            <div className="policies-block">
              <p className="policies-h">Third-party links</p>
              <p className="policies-p">
                KonarCard may contain links to third-party websites. We are not
                responsible for the privacy practices or content of those sites.
              </p>
            </div>

            <div className="policies-block">
              <p className="policies-h">Changes to this policy</p>
              <p className="policies-p">
                We may update this Privacy Policy from time to time. Any changes
                will be posted on this page with an updated revision date.
              </p>
            </div>

            <div className="policies-block">
              <p className="policies-h">Contact us</p>
              <p className="policies-p">
                If you have questions about this Privacy Policy or how your data
                is handled, please contact us:
              </p>
              <p className="policies-p">
                Email: <strong>support@konarcard.com</strong>
              </p>
            </div>
          </div>
        );

      case "terms":
        return (
          <div className="policies-contentCard">
            <p className="policies-title">Terms Of Service</p>
            <p className="policies-updated">Last updated: 25/01/2026</p>
            <p className="policies-lead">
              Welcome to KonarCard. These Terms of Service outline the rules for
              using our website, products, and services. By accessing or
              purchasing from our site, you agree to these terms.
            </p>
            <p className="policies-p">
              (Keep your existing Terms content here — this page styling will
              match automatically.)
            </p>
          </div>
        );

      case "warranty":
        return (
          <div className="policies-contentCard">
            <p className="policies-title">Warranty</p>
            <p className="policies-updated">Last updated: 25/01/2026</p>
            <p className="policies-lead">
              We stand behind the quality of our NFC cards. This Warranty Policy
              explains what’s covered, what’s not, and how to make a claim.
            </p>
            <p className="policies-p">
              (Keep your existing Warranty content here — styling will match.)
            </p>
          </div>
        );

      case "cookies":
        return (
          <div className="policies-contentCard">
            <p className="policies-title">Cookie Policy</p>
            <p className="policies-updated">Last updated: 25/01/2026</p>
            <p className="policies-lead">
              We use cookies to improve your experience on our website. This
              policy explains what cookies are, how we use them, and how to
              manage your preferences.
            </p>
            <p className="policies-p">
              (Keep your existing Cookie content here — styling will match.)
            </p>
          </div>
        );

      case "shipping":
        return (
          <div className="policies-contentCard">
            <p className="policies-title">Shipping & Returns</p>
            <p className="policies-updated">Last updated: 25/01/2026</p>
            <p className="policies-lead">
              Production times, delivery windows, tracking, and return policies.
            </p>
            <p className="policies-p">
              (Keep your existing Shipping content here — styling will match.)
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <Navbar />

      <section className="policies-wrap">
        <div className="policies-grid">
          {/* LEFT: sticky sidebar */}
          <aside className="policies-left">
            <div className="policies-sticky">
              <div className="policies-sideCard">
                <p className="policies-sideTitle">Policies</p>

                <ul className="policies-sideList">
                  {policies.map((p) => (
                    <li
                      key={p.key}
                      className={activePolicy === p.key ? "isActive" : ""}
                      onClick={() => setActivePolicy(p.key)}
                    >
                      {p.label}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="policies-sideCard policies-contactCard">
                <p className="policies-sideTitle">Contact Us</p>
                <p className="policies-contactText">
                  Need help? Our support is available 24/7
                </p>
                <p className="policies-contactEmail">support@konarcards.com</p>
              </div>
            </div>
          </aside>

          {/* RIGHT: content */}
          <main className="policies-right">{renderContent()}</main>
        </div>
      </section>

      <Footer />
    </>
  );
}
