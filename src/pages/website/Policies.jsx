// frontend/src/pages/website/Policies.jsx
import React, { useMemo, useState } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import DotIcon from "../../assets/icons/Dot-Icon.svg";

/* Global typography/tokens */
import "../../styling/fonts.css";

/* Page CSS */
import "../../styling/policies.css";

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
          <div className="kc-pol__contentCard">
            <header className="kc-pol__head">
              <h1 className="h2 kc-pol__title">Privacy Policy</h1>
              <p className="body-s kc-pol__updated">Last updated: 25/01/2026</p>
              <p className="body-s kc-pol__lead">
                At KonarCard, your privacy is important to us. This Privacy Policy explains what
                information we collect, how we use it, and how we protect it when you use our
                website, products, and services. By using KonarCard, you agree to the terms of this
                Privacy Policy.
              </p>
            </header>

            <div className="kc-pol__block">
              <p className="h6 kc-pol__h">Information we collect</p>
              <p className="body-s kc-pol__p">
                We collect information to provide and improve our services. This may include:
              </p>

              <ul className="kc-pol__ul">
                <li>
                  <img src={DotIcon} alt="" className="kc-pol__dot" />
                  Personal information you provide, such as your name, email address, and profile
                  details
                </li>
                <li>
                  <img src={DotIcon} alt="" className="kc-pol__dot" />
                  Information added to your KonarCard profile (contact details, links, images,
                  business information)
                </li>
                <li>
                  <img src={DotIcon} alt="" className="kc-pol__dot" />
                  Account and usage data, such as how you interact with our website and services
                </li>
                <li>
                  <img src={DotIcon} alt="" className="kc-pol__dot" />
                  Payment information when you make a purchase (processed securely by third-party
                  payment providers)
                </li>
              </ul>

              <p className="body-s kc-pol__p">We do not collect unnecessary personal data.</p>
            </div>

            <div className="kc-pol__block">
              <p className="h6 kc-pol__h">How we use your information</p>
              <p className="body-s kc-pol__p">We use your information to:</p>

              <ul className="kc-pol__ul">
                <li>
                  <img src={DotIcon} alt="" className="kc-pol__dot" />
                  Provide and operate KonarCard
                </li>
                <li>
                  <img src={DotIcon} alt="" className="kc-pol__dot" />
                  Create and manage your account
                </li>
                <li>
                  <img src={DotIcon} alt="" className="kc-pol__dot" />
                  Display your digital business card as intended
                </li>
                <li>
                  <img src={DotIcon} alt="" className="kc-pol__dot" />
                  Process payments and subscriptions
                </li>
                <li>
                  <img src={DotIcon} alt="" className="kc-pol__dot" />
                  Communicate with you about your account or support requests
                </li>
                <li>
                  <img src={DotIcon} alt="" className="kc-pol__dot" />
                  Improve our website, features, and user experience
                </li>
                <li>
                  <img src={DotIcon} alt="" className="kc-pol__dot" />
                  Comply with legal obligations
                </li>
              </ul>

              <p className="body-s kc-pol__p">We only use your data for legitimate business purposes.</p>
            </div>

            <div className="kc-pol__block">
              <p className="h6 kc-pol__h">Sharing your information</p>
              <p className="body-s kc-pol__p">We do not sell your personal information.</p>
              <p className="body-s kc-pol__p">
                We may share limited data with trusted third-party service providers who help us
                operate KonarCard, such as:
              </p>

              <ul className="kc-pol__ul">
                <li>
                  <img src={DotIcon} alt="" className="kc-pol__dot" />
                  Hosting and infrastructure providers
                </li>
                <li>
                  <img src={DotIcon} alt="" className="kc-pol__dot" />
                  Payment processors
                </li>
                <li>
                  <img src={DotIcon} alt="" className="kc-pol__dot" />
                  Analytics tools
                </li>
              </ul>

              <p className="body-s kc-pol__p">
                These providers only access information necessary to perform their services and are
                required to protect your data.
              </p>
            </div>

            <div className="kc-pol__block">
              <p className="h6 kc-pol__h">Cookies</p>
              <p className="body-s kc-pol__p">We use cookies and similar technologies to:</p>

              <ul className="kc-pol__ul">
                <li>
                  <img src={DotIcon} alt="" className="kc-pol__dot" />
                  Ensure the website functions properly
                </li>
                <li>
                  <img src={DotIcon} alt="" className="kc-pol__dot" />
                  Understand how visitors use our site
                </li>
                <li>
                  <img src={DotIcon} alt="" className="kc-pol__dot" />
                  Improve performance and user experience
                </li>
              </ul>

              <p className="body-s kc-pol__p">
                You can control or disable cookies through your browser settings. Some features may
                not work correctly without cookies enabled.
              </p>
            </div>

            <div className="kc-pol__block">
              <p className="h6 kc-pol__h">Data security</p>
              <p className="body-s kc-pol__p">
                We take reasonable measures to protect your information, including technical and
                organisational safeguards designed to prevent unauthorised access, loss, or misuse.
              </p>
              <p className="body-s kc-pol__p">
                However, no method of transmission over the internet is completely secure, and we
                cannot guarantee absolute security.
              </p>
            </div>

            <div className="kc-pol__block">
              <p className="h6 kc-pol__h">Data retention</p>
              <p className="body-s kc-pol__p">
                We keep your personal information only for as long as necessary to provide our
                services and meet legal requirements.
              </p>
              <p className="body-s kc-pol__p">
                You may request deletion of your account and associated data at any time.
              </p>
            </div>

            <div className="kc-pol__block">
              <p className="h6 kc-pol__h">Your rights</p>
              <p className="body-s kc-pol__p">Depending on your location, you may have the right to:</p>

              <ul className="kc-pol__ul">
                <li>
                  <img src={DotIcon} alt="" className="kc-pol__dot" />
                  Access the personal information we hold about you
                </li>
                <li>
                  <img src={DotIcon} alt="" className="kc-pol__dot" />
                  Request corrections to your information
                </li>
                <li>
                  <img src={DotIcon} alt="" className="kc-pol__dot" />
                  Request deletion of your data
                </li>
                <li>
                  <img src={DotIcon} alt="" className="kc-pol__dot" />
                  Object to or restrict certain processing
                </li>
              </ul>

              <p className="body-s kc-pol__p">To exercise your rights, contact us using the details below.</p>
            </div>

            <div className="kc-pol__block">
              <p className="h6 kc-pol__h">Third-party links</p>
              <p className="body-s kc-pol__p">
                KonarCard may contain links to third-party websites. We are not responsible for the
                privacy practices or content of those sites.
              </p>
            </div>

            <div className="kc-pol__block">
              <p className="h6 kc-pol__h">Changes to this policy</p>
              <p className="body-s kc-pol__p">
                We may update this Privacy Policy from time to time. Any changes will be posted on
                this page with an updated revision date.
              </p>
            </div>

            <div className="kc-pol__block">
              <p className="h6 kc-pol__h">Contact us</p>
              <p className="body-s kc-pol__p">
                If you have questions about this Privacy Policy or how your data is handled, please
                contact us:
              </p>
              <p className="body-s kc-pol__p">
                Email: <strong>support@konarcard.com</strong>
              </p>
            </div>
          </div>
        );

      default:
        return (
          <div className="kc-pol__contentCard">
            <header className="kc-pol__head">
              <h1 className="h2 kc-pol__title">
                {policies.find((x) => x.key === activePolicy)?.label || "Policy"}
              </h1>
              <p className="body-s kc-pol__updated">Last updated: 25/01/2026</p>
              <p className="body-s kc-pol__lead">
                (Keep your existing content here — styling will match automatically.)
              </p>
            </header>
          </div>
        );
    }
  };

  return (
    <>
      <Navbar />

      <main className="kc-pol">
        <section className="kc-pol__wrap">
          <div className="kc-pol__grid">
            <aside className="kc-pol__left" aria-label="Policy navigation">
              <div className="kc-pol__sticky">
                <div className="kc-pol__sideCard">
                  <p className="h6 kc-pol__sideTitle">Policies</p>

                  <ul className="kc-pol__sideList">
                    {policies.map((p) => (
                      <li key={p.key}>
                        <button
                          type="button"
                          className={`kc-pol__sideBtn ${activePolicy === p.key ? "is-active" : ""}`}
                          onClick={() => setActivePolicy(p.key)}
                        >
                          <span>{p.label}</span>
                          <span className="kc-pol__sideArrow" aria-hidden="true">
                            →
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="kc-pol__sideCard kc-pol__contactCard">
                  <p className="h6 kc-pol__sideTitle">Contact us</p>
                  <p className="body-s kc-pol__contactText">
                    Need help? Our support is available 24/7.
                  </p>
                  <p className="body-s kc-pol__contactEmail">
                    <strong>support@konarcard.com</strong>
                  </p>
                </div>
              </div>
            </aside>

            <section className="kc-pol__right">{renderContent()}</section>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
