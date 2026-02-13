import React, { useMemo, useState } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import DotIcon from "../../assets/icons/Dot-Icon.svg";
import RightArrow from "../../assets/icons/RightArrow.svg";

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
          <div className="kc-pol__content">
            <header className="kc-pol__head">
              <h1 className="h2 kc-pol__title">Privacy Policy</h1>
              <p className="body-s kc-pol__updated">Last updated: 25/01/2026</p>
              <p className="body kc-pol__lead">
                At KonarCard, your privacy is important to us. This Privacy Policy explains what
                information we collect, how we use it, and how we protect it when you use our
                website, products, and services.
              </p>
            </header>

            <div className="kc-pol__block">
              <p className="h6 kc-pol__h">Information we collect</p>
              <p className="body kc-pol__p">
                We collect information to provide and improve our services. This may include:
              </p>

              <ul className="kc-pol__ul">
                <li>
                  <img src={DotIcon} alt="" className="kc-pol__dot" aria-hidden="true" />
                  Personal information you provide, such as your name, email address, and profile details
                </li>
                <li>
                  <img src={DotIcon} alt="" className="kc-pol__dot" aria-hidden="true" />
                  Information added to your KonarCard profile (contact details, links, images, business information)
                </li>
                <li>
                  <img src={DotIcon} alt="" className="kc-pol__dot" aria-hidden="true" />
                  Account and usage data, such as how you interact with our website and services
                </li>
                <li>
                  <img src={DotIcon} alt="" className="kc-pol__dot" aria-hidden="true" />
                  Payment information when you make a purchase (processed securely by third-party payment providers)
                </li>
              </ul>

              <p className="body kc-pol__p">We do not collect unnecessary personal data.</p>
            </div>

            <div className="kc-pol__block">
              <p className="h6 kc-pol__h">How we use your information</p>
              <p className="body kc-pol__p">We use your information to:</p>

              <ul className="kc-pol__ul">
                <li><img src={DotIcon} alt="" className="kc-pol__dot" aria-hidden="true" /> Provide and operate KonarCard</li>
                <li><img src={DotIcon} alt="" className="kc-pol__dot" aria-hidden="true" /> Create and manage your account</li>
                <li><img src={DotIcon} alt="" className="kc-pol__dot" aria-hidden="true" /> Display your digital business card as intended</li>
                <li><img src={DotIcon} alt="" className="kc-pol__dot" aria-hidden="true" /> Process payments and subscriptions</li>
                <li><img src={DotIcon} alt="" className="kc-pol__dot" aria-hidden="true" /> Communicate with you about your account or support requests</li>
                <li><img src={DotIcon} alt="" className="kc-pol__dot" aria-hidden="true" /> Improve our website, features, and user experience</li>
                <li><img src={DotIcon} alt="" className="kc-pol__dot" aria-hidden="true" /> Comply with legal obligations</li>
              </ul>
            </div>

            <div className="kc-pol__block">
              <p className="h6 kc-pol__h">Sharing your information</p>
              <p className="body kc-pol__p">We do not sell your personal information.</p>
              <p className="body kc-pol__p">
                We may share limited data with trusted third-party providers such as hosting, analytics,
                and payment processors. These providers only access information necessary to perform their services.
              </p>
            </div>

            <div className="kc-pol__block">
              <p className="h6 kc-pol__h">Data security</p>
              <p className="body kc-pol__p">
                We use reasonable security measures to protect your information. However, no method of transmission
                over the internet is completely secure.
              </p>
            </div>

            <div className="kc-pol__block">
              <p className="h6 kc-pol__h">Your rights</p>
              <p className="body kc-pol__p">
                Depending on your location, you may have rights to access, correct, delete, or restrict processing
                of your personal data.
              </p>
              <p className="body kc-pol__p">
                To request this, contact: <strong>support@konarcard.com</strong>
              </p>
            </div>
          </div>
        );

      case "terms":
        return (
          <div className="kc-pol__content">
            <header className="kc-pol__head">
              <h1 className="h2 kc-pol__title">Terms Of Service</h1>
              <p className="body-s kc-pol__updated">Last updated: 25/01/2026</p>
              <p className="body kc-pol__lead">
                These Terms govern your use of KonarCard (the “Service”). By creating an account,
                purchasing a card, or using the platform, you agree to these Terms.
              </p>
            </header>

            <div className="kc-pol__block">
              <p className="h6 kc-pol__h">Using KonarCard</p>
              <p className="body kc-pol__p">
                You may use KonarCard to create and share a digital business card/profile, manage your
                information, and share it using links, QR codes, and NFC products.
              </p>
              <ul className="kc-pol__ul">
                <li><img src={DotIcon} alt="" className="kc-pol__dot" aria-hidden="true" /> You must provide accurate information</li>
                <li><img src={DotIcon} alt="" className="kc-pol__dot" aria-hidden="true" /> You are responsible for what you publish on your profile</li>
                <li><img src={DotIcon} alt="" className="kc-pol__dot" aria-hidden="true" /> You must not misuse the platform or attempt unauthorised access</li>
              </ul>
            </div>

            <div className="kc-pol__block">
              <p className="h6 kc-pol__h">Accounts & security</p>
              <p className="body kc-pol__p">
                You are responsible for maintaining the confidentiality of your account credentials and for any
                activity under your account.
              </p>
            </div>

            <div className="kc-pol__block">
              <p className="h6 kc-pol__h">Subscriptions & billing</p>
              <p className="body kc-pol__p">
                Paid plans are billed in advance on a recurring basis (monthly/quarterly/yearly) depending on your
                selection. You can manage or cancel subscriptions through the Billing portal.
              </p>
              <p className="body kc-pol__p">Unless required by law, fees already paid are non-refundable.</p>
            </div>

            <div className="kc-pol__block">
              <p className="h6 kc-pol__h">Acceptable use</p>
              <p className="body kc-pol__p">You agree not to:</p>
              <ul className="kc-pol__ul">
                <li><img src={DotIcon} alt="" className="kc-pol__dot" aria-hidden="true" /> Upload illegal, abusive, or infringing content</li>
                <li><img src={DotIcon} alt="" className="kc-pol__dot" aria-hidden="true" /> Use KonarCard to spam or harass others</li>
                <li><img src={DotIcon} alt="" className="kc-pol__dot" aria-hidden="true" /> Interfere with or disrupt the Service</li>
              </ul>
            </div>

            <div className="kc-pol__block">
              <p className="h6 kc-pol__h">Termination</p>
              <p className="body kc-pol__p">
                We may suspend or terminate accounts that violate these Terms or misuse the Service.
                You may stop using KonarCard at any time.
              </p>
            </div>

            <div className="kc-pol__block">
              <p className="h6 kc-pol__h">Contact</p>
              <p className="body kc-pol__p">
                Questions about these Terms? Email: <strong>support@konarcard.com</strong>
              </p>
            </div>
          </div>
        );

      case "warranty":
        return (
          <div className="kc-pol__content">
            <header className="kc-pol__head">
              <h1 className="h2 kc-pol__title">Warranty</h1>
              <p className="body-s kc-pol__updated">Last updated: 25/01/2026</p>
              <p className="body kc-pol__lead">
                This Warranty applies to KonarCard physical products purchased directly from KonarCard
                (including NFC business cards), unless otherwise stated.
              </p>
            </header>

            <div className="kc-pol__block">
              <p className="h6 kc-pol__h">12-month warranty</p>
              <p className="body kc-pol__p">
                KonarCard products include a 12-month limited warranty covering manufacturing defects and hardware
                faults under normal use.
              </p>
            </div>

            <div className="kc-pol__block">
              <p className="h6 kc-pol__h">What’s covered</p>
              <ul className="kc-pol__ul">
                <li><img src={DotIcon} alt="" className="kc-pol__dot" aria-hidden="true" /> NFC chip failure under normal use</li>
                <li><img src={DotIcon} alt="" className="kc-pol__dot" aria-hidden="true" /> Manufacturing defects affecting usability</li>
                <li><img src={DotIcon} alt="" className="kc-pol__dot" aria-hidden="true" /> Faults present at delivery</li>
              </ul>
            </div>

            <div className="kc-pol__block">
              <p className="h6 kc-pol__h">What’s not covered</p>
              <ul className="kc-pol__ul">
                <li><img src={DotIcon} alt="" className="kc-pol__dot" aria-hidden="true" /> Normal wear and tear</li>
                <li><img src={DotIcon} alt="" className="kc-pol__dot" aria-hidden="true" /> Damage caused by misuse, bending, exposure to extreme heat/water</li>
                <li><img src={DotIcon} alt="" className="kc-pol__dot" aria-hidden="true" /> Cosmetic scratches that don’t affect function</li>
                <li><img src={DotIcon} alt="" className="kc-pol__dot" aria-hidden="true" /> Lost or stolen cards</li>
              </ul>
            </div>

            <div className="kc-pol__block">
              <p className="h6 kc-pol__h">How to claim</p>
              <p className="body kc-pol__p">
                Email <strong>support@konarcard.com</strong> with your order number and a description of the issue.
                We may request photos/video to confirm the fault. If confirmed, we’ll repair or replace the product.
              </p>
            </div>
          </div>
        );

      case "cookies":
        return (
          <div className="kc-pol__content">
            <header className="kc-pol__head">
              <h1 className="h2 kc-pol__title">Cookie Policy</h1>
              <p className="body-s kc-pol__updated">Last updated: 25/01/2026</p>
              <p className="body kc-pol__lead">
                This Cookie Policy explains what cookies are, how we use them, and how you can control them when
                using KonarCard.
              </p>
            </header>

            <div className="kc-pol__block">
              <p className="h6 kc-pol__h">What are cookies?</p>
              <p className="body kc-pol__p">
                Cookies are small text files stored on your device that help websites remember preferences,
                improve performance, and understand how the site is used.
              </p>
            </div>

            <div className="kc-pol__block">
              <p className="h6 kc-pol__h">How we use cookies</p>
              <ul className="kc-pol__ul">
                <li><img src={DotIcon} alt="" className="kc-pol__dot" aria-hidden="true" /> Essential cookies for login and security</li>
                <li><img src={DotIcon} alt="" className="kc-pol__dot" aria-hidden="true" /> Performance cookies to improve speed and reliability</li>
                <li><img src={DotIcon} alt="" className="kc-pol__dot" aria-hidden="true" /> Analytics cookies to understand traffic and usage</li>
              </ul>
            </div>

            <div className="kc-pol__block">
              <p className="h6 kc-pol__h">Managing cookies</p>
              <p className="body kc-pol__p">
                You can manage or disable cookies via your browser settings. Note: disabling essential cookies may
                affect features such as login and account access.
              </p>
            </div>

            <div className="kc-pol__block">
              <p className="h6 kc-pol__h">Third-party cookies</p>
              <p className="body kc-pol__p">
                Some third-party tools (for example analytics or payment providers) may set cookies to provide
                their services. These cookies are controlled by those providers.
              </p>
            </div>
          </div>
        );

      case "shipping":
        return (
          <div className="kc-pol__content">
            <header className="kc-pol__head">
              <h1 className="h2 kc-pol__title">Shipping & Returns</h1>
              <p className="body-s kc-pol__updated">Last updated: 25/01/2026</p>
              <p className="body kc-pol__lead">
                This policy explains how KonarCard handles shipping, delivery, and returns for physical products.
              </p>
            </header>

            <div className="kc-pol__block">
              <p className="h6 kc-pol__h">Shipping</p>
              <p className="body kc-pol__p">
                Orders are typically processed within 1–3 business days. Delivery times vary by location and
                shipping option selected at checkout.
              </p>
              <ul className="kc-pol__ul">
                <li><img src={DotIcon} alt="" className="kc-pol__dot" aria-hidden="true" /> You’ll receive tracking when available</li>
                <li><img src={DotIcon} alt="" className="kc-pol__dot" aria-hidden="true" /> Ensure your delivery address is accurate</li>
              </ul>
            </div>

            <div className="kc-pol__block">
              <p className="h6 kc-pol__h">Returns</p>
              <p className="body kc-pol__p">
                If your item arrives damaged or faulty, contact <strong>support@konarcard.com</strong> within 14 days
                of delivery. We may request photos/video to confirm the issue.
              </p>
            </div>

            <div className="kc-pol__block">
              <p className="h6 kc-pol__h">Non-returnable items</p>
              <p className="body kc-pol__p">
                Customised or personalised products may not be eligible for return unless faulty.
              </p>
            </div>

            <div className="kc-pol__block">
              <p className="h6 kc-pol__h">Refunds & replacements</p>
              <p className="body kc-pol__p">
                If approved, we’ll arrange a replacement or refund depending on stock availability and the issue.
                Refunds are issued back to the original payment method.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <Navbar />

      <main className="kc-pol kc-page">
        <section className="kc-pol__wrap">
          <div className="kc-pol__grid">
            <aside className="kc-pol__left" aria-label="Policy navigation">
              <div className="kc-pol__side">
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
                  <p className="h6 kc-pol__sideTitle">Contact us</p>
                  <p className="body-s kc-pol__contactText">
                    Need help? Our support is available 24/7.
                  </p>

                  <a className="kc-pol__contactLink" href="#livechat" onClick={(e) => e.preventDefault()}>
                    Start live chat
                  </a>

                  <a className="kc-pol__contactLink" href="mailto:support@konarcard.com">
                    support@konarcard.com
                  </a>
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
