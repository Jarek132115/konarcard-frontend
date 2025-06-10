import React, { useState } from 'react';
import Navbar from '../../components/Navbar';
import Breadcrumbs from '../../components/Breadcrumbs';
import Footer from '../../components/Footer';
import DotIcon from '../../assets/icons/Dot-Icon.svg'

export default function Policies() {
  const [activePolicy, setActivePolicy] = useState('privacy');

  const renderContent = () => {
    switch (activePolicy) {
      case 'privacy':
        return (
          <div className='section-policy'>
            <p style={{ marginBottom: 10 }} className="desktop-h2">Privacy Policy</p>
            <p className="desktop-h6">
              At Konar, your privacy is extremely important to us. This Privacy Policy explains what information we collect, how we use it, and how we protect it. By using our website, products, or services, you agree to the terms of this Privacy Policy.
            </p>
            <div>
              <div style={{ marginTop: 40 }}>
                {/* Information We Collect */}
                <div style={{ marginTop: 20 }}>
                  <p className='desktop-h6'>Information We Collect</p>
                  <p className='desktop-body'>We may collect the following information:</p>
                  <div className='policy-dot'><img src={DotIcon} className="icon-10" /><p className='desktop-body'>Name, email address, phone number</p></div>
                  <div className='policy-dot'><img src={DotIcon} className="icon-10" /><p className='desktop-body'>Billing and shipping address</p></div>
                  <div className='policy-dot'><img src={DotIcon} className="icon-10" /><p className='desktop-body'>Profile information you submit (logos, social links, bio)</p></div>
                  <div className='policy-dot'><img src={DotIcon} className="icon-10" /><p className='desktop-body'>Payment details (processed securely via third-party providers)</p></div>
                  <div className='policy-dot'><img src={DotIcon} className="icon-10" /><p className='desktop-body'>Website usage data (analytics, cookies, device information)</p></div>
                </div>

                {/* How We Use Your Information */}
                <div style={{ marginTop: 20 }}>
                  <p className='desktop-h6'>How We Use Your Information</p>
                  <p className='desktop-body'>We use your information to:</p>
                  <div className='policy-dot'><img src={DotIcon} className="icon-10" /><p className='desktop-body'>Process your orders and deliver your NFC cards</p></div>
                  <div className='policy-dot'><img src={DotIcon} className="icon-10" /><p className='desktop-body'>Create and manage your digital profile</p></div>
                  <div className='policy-dot'><img src={DotIcon} className="icon-10" /><p className='desktop-body'>Send you order updates, support communications, and promotional emails (only if you opt-in)</p></div>
                  <div className='policy-dot'><img src={DotIcon} className="icon-10" /><p className='desktop-body'>Improve our website and customer experience</p></div>
                  <div className='policy-dot'><img src={DotIcon} className="icon-10" /><p className='desktop-body'>Ensure security and prevent fraud</p></div>
                </div>

                {/* Sharing of Information */}
                <div style={{ marginTop: 20 }}>
                  <p className='desktop-h6'>Sharing of Information</p>
                  <p className='desktop-body'>We do not sell your information to third parties.</p>
                  <p className='desktop-body'>We may share your data only with trusted partners, such as:</p>
                  <div className='policy-dot'><img src={DotIcon} className="icon-10" /><p className='desktop-body'>Shipping and logistics providers</p></div>
                  <div className='policy-dot'><img src={DotIcon} className="icon-10" /><p className='desktop-body'>Payment processing providers</p></div>
                  <div className='policy-dot'><img src={DotIcon} className="icon-10" /><p className='desktop-body'>Analytics services (like Google Analytics)</p></div>
                  <p className='desktop-body'>All partners are required to keep your data confidential.</p>
                </div>

                {/* Cookies and Tracking */}
                <div style={{ marginTop: 20 }}>
                  <p className='desktop-h6'>Cookies and Tracking</p>
                  <p className='desktop-body'>Our website uses cookies to:</p>
                  <div className='policy-dot'><img src={DotIcon} className="icon-10" /><p className='desktop-body'>Enable basic site functions</p></div>
                  <div className='policy-dot'><img src={DotIcon} className="icon-10" /><p className='desktop-body'>Remember your preferences</p></div>
                  <div className='policy-dot'><img src={DotIcon} className="icon-10" /><p className='desktop-body'>Track anonymous usage data for site improvement</p></div>
                  <p className='desktop-body'>You can disable cookies in your browser settings if you prefer.</p>
                </div>

                {/* Data Security */}
                <div style={{ marginTop: 20 }}>
                  <p className='desktop-h6'>Data Security</p>
                  <p className='desktop-body'>We take reasonable technical and organizational measures to protect your personal data against:</p>
                  <div className='policy-dot'><img src={DotIcon} className="icon-10" /><p className='desktop-body'>Unauthorized access</p></div>
                  <div className='policy-dot'><img src={DotIcon} className="icon-10" /><p className='desktop-body'>Loss</p></div>
                  <div className='policy-dot'><img src={DotIcon} className="icon-10" /><p className='desktop-body'>Destruction</p></div>
                  <div className='policy-dot'><img src={DotIcon} className="icon-10" /><p className='desktop-body'>Disclosure</p></div>
                  <p className='desktop-body'>However, no online platform can be 100% secure — please take care when submitting personal data.</p>
                </div>

                {/* Your Rights */}
                <div style={{ marginTop: 20 }}>
                  <p className='desktop-h6'>Your Rights</p>
                  <p className='desktop-body'>You have the right to:</p>
                  <div className='policy-dot'><img src={DotIcon} className="icon-10" /><p className='desktop-body'>Access, correct, or delete your personal data</p></div>
                  <div className='policy-dot'><img src={DotIcon} className="icon-10" /><p className='desktop-body'>Withdraw your consent for marketing emails</p></div>
                  <div className='policy-dot'><img src={DotIcon} className="icon-10" /><p className='desktop-body'>Request a copy of the information we hold about you</p></div>
                  <p className='desktop-body'>To exercise your rights, please contact us at support@konarcard.com</p>
                </div>

                {/* Changes to Policy */}
                <div style={{ marginTop: 20 }}>
                  <p className='desktop-h6'>Changes to This Policy</p>
                  <p className='desktop-body'>We may update this Privacy Policy from time to time.</p>
                  <p className='desktop-body'>When we make changes, we will post the updated version on this page and revise the "Last Updated" date.</p>
                </div>

                {/* Contact */}
                <div style={{ marginTop: 20 }}>
                  <p className='desktop-h6'>Contact Us</p>
                  <p className='desktop-body'>If you have any questions about this Privacy Policy or how we handle your information, please contact: support@konarcard.com</p>
                  <p className='desktop-body'>We’re here to help!</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'terms':
        return (
          <div className='section-policy'>
            <p style={{ marginBottom: 10 }} className="desktop-h2">Terms Of Service</p>
            <p className="desktop-h6">Welcome to Konar! These Terms of Service outline the rules and regulations for using our website, products, and services. By accessing or purchasing from our site, you agree to these terms.</p>
            <div>
              <div style={{ marginTop: 40 }}>

                <div style={{ marginTop: 20 }}>
                  <p className='desktop-h6'>Services Provided</p>
                  <p className='desktop-body'>Konar offers:</p>
                  <div className='policy-dot'><img src={DotIcon} className="icon-10" /><p className='desktop-body'>NFC-enabled business cards</p></div>
                  <div className='policy-dot'><img src={DotIcon} className="icon-10" /><p className='desktop-body'>Digital profile creation and management services</p></div>
                  <div className='policy-dot'><img src={DotIcon} className="icon-10" /><p className='desktop-body'>Customer support for card usage and profile setup</p></div>
                  <p className='desktop-body'>We reserve the right to modify or discontinue services at any time.</p>
                </div>

                <div style={{ marginTop: 20 }}>
                  <p className='desktop-h6'>Account and Profile Responsibilities</p>
                  <p className='desktop-body'>When you create an account:</p>
                  <div className='policy-dot'><img src={DotIcon} className="icon-10" /><p className='desktop-body'>You agree to provide accurate, up-to-date information.</p></div>
                  <div className='policy-dot'><img src={DotIcon} className="icon-10" /><p className='desktop-body'>You are responsible for maintaining the confidentiality of your login credentials.</p></div>
                  <div className='policy-dot'><img src={DotIcon} className="icon-10" /><p className='desktop-body'>You are responsible for all activities that occur under your account.</p></div>
                </div>

                <div style={{ marginTop: 20 }}>
                  <p className='desktop-h6'>Purchases and Payments</p>
                  <p className='desktop-body'>Prices for products are listed in your local currency where available.</p>
                  <p className='desktop-body'>Payments are processed securely through third-party providers.</p>
                  <p className='desktop-body'>Full payment is required before production of any customized product.</p>
                </div>

                <div style={{ marginTop: 20 }}>
                  <p className='desktop-h6'>Order Cancellations</p>
                  <p className='desktop-body'>Orders may only be canceled within 2 hours after purchase.</p>
                  <p className='desktop-body'>After 2 hours, production begins, and cancellation may not be possible.</p>
                </div>

                <div style={{ marginTop: 20 }}>
                  <p className='desktop-h6'>Shipping and Delivery</p>
                  <p className='desktop-body'>Shipping times are estimated and not guaranteed.</p>
                  <p className='desktop-body'>We are not responsible for shipping delays caused by third parties (e.g., couriers, customs).</p>
                  <p className='desktop-body'>For full shipping details, please see our [Shipping & Returns Policy].</p>
                </div>

                <div style={{ marginTop: 20 }}>
                  <p className='desktop-h6'>Returns and Refunds</p>
                  <p className='desktop-body'>Customized NFC cards are non-returnable unless defective.</p>
                  <p className='desktop-body'>For return eligibility and instructions, refer to our [Shipping & Returns Policy].</p>
                </div>

                <div style={{ marginTop: 20 }}>
                  <p className='desktop-h6'>Intellectual Property</p>
                  <p className='desktop-body'>All content on this website, including logos, designs, graphics, and text, is the property of Konar and protected under copyright law.</p>
                  <p className='desktop-body'>You may not reproduce, distribute, or create derivative works without our express permission.</p>
                </div>

                <div style={{ marginTop: 20 }}>
                  <p className='desktop-h6'>Limitation of Liability</p>
                  <p className='desktop-body'>Konar is not liable for:</p>
                  <div className='policy-dot'><img src={DotIcon} className="icon-10" /><p className='desktop-body'>Losses resulting from improper use of our products</p></div>
                  <div className='policy-dot'><img src={DotIcon} className="icon-10" /><p className='desktop-body'>Technical issues, service interruptions, or compatibility errors</p></div>
                  <div className='policy-dot'><img src={DotIcon} className="icon-10" /><p className='desktop-body'>Any indirect, incidental, or consequential damages</p></div>
                  <p className='desktop-body'>Our liability is limited to the maximum extent permitted by law.</p>
                </div>

                <div style={{ marginTop: 20 }}>
                  <p className='desktop-h6'>Termination</p>
                  <p className='desktop-body'>We reserve the right to terminate or suspend accounts that violate our Terms of Service without prior notice.</p>
                </div>

                <div style={{ marginTop: 20 }}>
                  <p className='desktop-h6'>Governing Law</p>
                  <p className='desktop-body'>These Terms are governed by the laws of United Kingdom. Any disputes will be resolved through local courts.</p>
                </div>

                <div style={{ marginTop: 20 }}>
                  <p className='desktop-h6'>Changes to Terms</p>
                  <p className='desktop-body'>We may update these Terms of Service periodically.</p>
                  <p className='desktop-body'>When changes are made, we will revise the "Last Updated" date and post the new Terms on our website.</p>
                </div>

                <div style={{ marginTop: 20 }}>
                  <p className='desktop-h6'>Contact Us</p>
                  <p className='desktop-body'>For questions about these Terms, please contact: support@konarcard.com</p>
                  <p className='desktop-body'>We’re here to help!</p>
                </div>

              </div>
            </div>
          </div>
        );

      case 'warranty':
        return (
          <div className='section-policy'>
            <p style={{ marginBottom: 10 }} className="desktop-h2">Warranty</p>
            <p className="desktop-h6">We stand behind the quality of our NFC cards. Each card is carefully inspected to ensure premium performance and durability. This Warranty Policy explains what's covered, what’s not covered, and how to make a claim.</p>
            <div>
              <div style={{ marginTop: 40 }}>
                <div style={{ marginTop: 20 }}>
                  <p className='desktop-h6'>Warranty Coverage</p>
                  <p className='desktop-body'>Our NFC cards come with a 6-month limited warranty covering:</p>
                  <div className='policy-dot'><img src={DotIcon} className="icon-10" /><p className='desktop-body'>Manufacturing defects</p></div>
                  <div className='policy-dot'><img src={DotIcon} className="icon-10" /><p className='desktop-body'>Malfunctioning NFC chips</p></div>
                  <div className='policy-dot'><img src={DotIcon} className="icon-10" /><p className='desktop-body'>Printing errors (misaligned logos, incorrect designs)</p></div>
                  <p className='desktop-body'>If your card stops functioning properly due to a manufacturing issue, we’ll replace it free of charge.</p>
                </div>
                <div style={{ marginTop: 20 }}>
                  <p className='desktop-h6'>What's Not Covered</p>
                  <p className='desktop-body'>The warranty does not cover damage resulting from:</p>
                  <div className='policy-dot'><img src={DotIcon} className="icon-10" /><p className='desktop-body'>Physical abuse (bending, cracking, cutting)</p></div>
                  <div className='policy-dot'><img src={DotIcon} className="icon-10" /><p className='desktop-body'>Water damage (unless waterproof card is specified)</p></div>
                  <div className='policy-dot'><img src={DotIcon} className="icon-10" /><p className='desktop-body'>Scratches, scuffs, or normal wear and tear</p></div>
                  <div className='policy-dot'><img src={DotIcon} className="icon-10" /><p className='desktop-body'>Unauthorized modifications or misuse</p></div>
                  <div className='policy-dot'><img src={DotIcon} className="icon-10" /><p className='desktop-body'>Loss or theft of the card</p></div>
                </div>
                <div style={{ marginTop: 20 }}>
                  <p className='desktop-h6'>Warranty Claim Process</p>
                  <p className='desktop-body'>If you believe your card qualifies for a warranty claim:</p>
                  <div className='policy-dot'><img src={DotIcon} className="icon-10" /><p className='desktop-body'>Contact our support team within 7 days of noticing the issue.</p></div>
                  <div className='policy-dot'><img src={DotIcon} className="icon-10" /><p className='desktop-body'>Provide your order number, description of the problem, and supporting photos or videos.</p></div>
                  <div className='policy-dot'><img src={DotIcon} className="icon-10" /><p className='desktop-body'>Our team will review your claim within 3 business days.</p></div>
                  <div className='policy-dot'><img src={DotIcon} className="icon-10" /><p className='desktop-body'>If approved, a replacement card will be produced and shipped to you at no cost.</p></div>
                </div>
                <div style={{ marginTop: 20 }}>
                  <p className='desktop-h6'>Replacement Details</p>
                  <p className='desktop-body'>If your original card design is no longer available, you may be offered an updated version.</p>
                  <p className='desktop-body'>Replacements do not extend the original 6-month warranty period.</p>
                </div>
                <div style={{ marginTop: 20 }}>
                  <p className='desktop-h6'>Limitations</p>
                  <p className='desktop-body'>We reserve the right to deny warranty claims that do not meet the eligibility criteria listed above.</p>
                  <p className='desktop-body'>Warranty coverage is non-transferable and applies only to the original purchaser.</p>
                </div>
                <div style={{ marginTop: 20 }}>
                  <p className='desktop-h6'>Contact Us for Warranty Support</p>
                  <p className='desktop-body'>Have questions or need to start a claim? Email: support@konarcard.com</p>
                  <p className='desktop-body'>We’re here to help!</p>
                </div>
              </div>
            </div>
          </div>
        );
      case 'cookies':
        return (
          <div className='section-policy'>
            <p style={{ marginBottom: 10 }} className="desktop-h2">Cookie Policy</p>
            <p className="desktop-h6">At Konar, we use cookies to improve your experience on our website. This Cookie Policy explains what cookies are, how we use them, and how you can manage your cookie preferences.</p>
            <div>
              <div style={{ marginTop: 60 }}>
                <div style={{ marginTop: 20 }}>
                  <p className='desktop-h6'>What Are Cookies?</p>
                  <p className='desktop-body'>Cookies are small text files placed on your device by websites you visit.</p>
                  <p className='desktop-body'>They help websites remember user actions and preferences over time.</p>
                </div>
                <div style={{ marginTop: 20 }}>
                  <p className='desktop-h6'>Types of Cookies We Use</p>
                  <p className='desktop-body'>Essential Cookies - Needed for basic website functionality (e.g., shopping cart, login access).</p>
                  <p className='desktop-body'>Performance Cookies - Help us analyse site usage and improve functionality (e.g., Google Analytics).</p>
                  <p className='desktop-body'>Functional Cookies - Remember your preferences (e.g., language, region).</p>
                  <p className='desktop-body'>Marketing Cookies - Help deliver personalized ads through platforms like Facebook, Google Ads.</p>
                </div>
                <div style={{ marginTop: 20 }}>
                  <p className='desktop-h6'>Why We Use Cookies</p>
                  <p className='desktop-body'>We use cookies to:</p>
                  <div className='policy-dot'><img src={DotIcon} className="icon-10" /><p className='desktop-body'>Keep the site secure and functioning properly</p></div>
                  <div className='policy-dot'><img src={DotIcon} className="icon-10" /><p className='desktop-body'>Understand how visitors interact with our site</p></div>
                  <div className='policy-dot'><img src={DotIcon} className="icon-10" /><p className='desktop-body'>Offer a personalized user experience</p></div>
                  <div className='policy-dot'><img src={DotIcon} className="icon-10" /><p className='desktop-body'>Measure and improve our marketing campaigns</p></div>
                </div>
                <div style={{ marginTop: 20 }}>
                  <p className='desktop-h6'>How to Manage Cookies</p>
                  <p className='desktop-body'>You can control and manage cookies through your browser settings.</p>
                  <p className='desktop-body'>Most browsers allow you to:</p>
                  <div className='policy-dot'><img src={DotIcon} className="icon-10" /><p className='desktop-body'>Accept or reject all cookies</p></div>
                  <div className='policy-dot'><img src={DotIcon} className="icon-10" /><p className='desktop-body'>Delete existing cookies</p></div>
                  <div className='policy-dot'><img src={DotIcon} className="icon-10" /><p className='desktop-body'>Set preferences for certain websites</p></div>
                  <p className='desktop-body'>Note: Disabling cookies may impact the functionality of some parts of our website.</p>
                </div>
                <div style={{ marginTop: 20 }}>
                  <p className='desktop-h6'>Third-Party Cookies</p>
                  <p className='desktop-body'>Some cookies we use come from trusted third parties, such as:</p>
                  <div className='policy-dot'><img src={DotIcon} className="icon-10" /><p className='desktop-body'>Google Analytics</p></div>
                  <div className='policy-dot'><img src={DotIcon} className="icon-10" /><p className='desktop-body'>Facebook Pixel</p></div>
                  <p className='desktop-body'>These third parties may use cookies according to their own privacy policies.</p>
                </div>
                <div style={{ marginTop: 20 }}>
                  <p className='desktop-h6'>Changes to This Policy</p>
                  <p className='desktop-body'>We may update our Cookie Policy occasionally to reflect changes in technology or regulations.</p>
                  <p className='desktop-body'>When changes occur, we will post the updated version here.</p>
                </div>
                <div style={{ marginTop: 20 }}>
                  <p className='desktop-h6'>Contact Us</p>
                  <p className='desktop-body'>If you have questions about our use of cookies, please contact: support@konarcard.com</p>
                  <p className='desktop-body'>We’re here to help!</p>
                </div>
              </div>
            </div>
          </div>
        );
      case 'shipping':
        return (
          <div className='section-policy'>
            <p style={{ marginBottom: 10 }} className="desktop-h2">Shipping & Returns</p>
            <p className="desktop-h6">Learn about our delivery process, estimated shipping times, and return policies...</p>
            <div>
              <div>
                <p style={{ marginTop: 60 }} className='desktop-h4'>Shipping Information</p>
                <div style={{ marginTop: 20 }}>
                  <p className='desktop-h6'>Processing Time</p>
                  <p className='desktop-body'>All customized NFC cards are produced within 2–4 business days after your order is placed.</p>
                  <p className='desktop-body'>Please note that production times may vary during busy periods.</p>
                </div>
                <div style={{ marginTop: 20 }}>
                  <p className='desktop-h6'>Shipping Time & Options</p>
                  <p className='desktop-body'>Standard Shipping (Free) — 3 to 7 business days.</p>
                  <p className='desktop-body'>Express Shipping (Paid Upgrade) — 1 to 3 business days.</p>
                  <p className='desktop-body'>Once your order ships, you’ll receive a tracking link via email.</p>
                </div>
                <div style={{ marginTop: 20 }}>
                  <p className='desktop-h6'>International Shipping</p>
                  <p className='desktop-body'>International orders may be subject to customs, duties, or taxes depending on your country.</p>
                  <p className='desktop-body'>These fees are the responsibility of the customer.</p>
                </div>
                <div style={{ marginTop: 20 }}>
                  <p className='desktop-h6'>Tracking Your Order</p>
                  <p className='desktop-body'>You will receive an email with your tracking information as soon as your order is dispatched.</p>
                  <p className='desktop-body'>Please allow 24 hours for the tracking link to update.</p>
                </div>
              </div>
              <div>
                <p style={{ marginTop: 60 }} className='desktop-h4'>Returns & Refund Policy</p>
                <div style={{ marginTop: 20 }}>
                  <p className='desktop-h6'>Customized Products Policy</p>
                  <p className='desktop-body'>Because each NFC card is made-to-order and customized, we do not accept returns unless the product is defective or incorrect.</p>
                </div>
                <div style={{ marginTop: 20 }}>
                  <p className='desktop-h6'>Non-Returnable Items</p>
                  <p className='desktop-body'>Customized NFC Cards</p>
                  <p className='desktop-body'>Digital Profiles / Setup Services</p>
                </div>
                <div style={{ marginTop: 20 }}>
                  <p className='desktop-h6'>Defective or Incorrect Orders</p>
                  <p className='desktop-body'>If you receive a defective or incorrect item, please contact our support team within 7 days of delivery with:</p>
                  <div className='policy-dot'><img src={DotIcon} className="icon-10" /><p className='desktop-body'>Your order number</p></div>
                  <div className='policy-dot'><img src={DotIcon} className="icon-10" /><p className='desktop-body'>A description of the issue</p></div>
                  <div className='policy-dot'><img src={DotIcon} className="icon-10" /><p className='desktop-body'>Photos or videos showing the problem</p></div>
                  <p className='desktop-body'>If approved, we’ll send you a replacement card free of charge.</p>

                </div>
                <div style={{ marginTop: 20 }}>
                  <p className='desktop-h6'>Refunds (If Applicable)</p>
                  <p className='desktop-body'>Refunds are only issued if a replacement cannot be provided.</p>
                  <p className='desktop-body'>Approved refunds are processed back to your original payment method within 5–10 business days.</p>
                </div>
                <div style={{ marginTop: 20 }}>
                  <p className='desktop-h6'>Order Cancellations</p>
                  <p className='desktop-body'>Orders can be cancelled within 2 hours after placing the order.</p>
                  <p className='desktop-body'>After that, production begins and cancellations are no longer possible.</p>
                </div>
                <div style={{ marginTop: 20 }}>
                  <p className='desktop-h6'>Tracking Your Order</p>
                  <p className='desktop-body'>You will receive an email with your tracking information as soon as your order is dispatched.</p>
                  <p className='desktop-body'>Please allow 24 hours for the tracking link to update.</p>
                </div>
                <div style={{ marginTop: 20 }}>
                  <p className='desktop-h6'>Contact Us for Shipping & Returns</p>
                  <p className='desktop-body'>If you have any issues with your order, email our support team: support@konarcard.com</p>
                  <p className='desktop-body'>We’re here to help!</p>
                </div>
              </div>
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
      <div style={{ marginTop: 20 }} className="section-breadcrumbs">
        <Breadcrumbs />
      </div>
      <div className="section-flex">
        <div className="policy-sidebar">
          <div className="policy-sticky-box">
            <div className="policy-box">
              <p className="desktop-h5">Policies</p>
              <ul className="policy-nav">
                <li onClick={() => setActivePolicy('privacy')} className={activePolicy === 'privacy' ? 'active' : ''}>Privacy Policy</li>
                <li onClick={() => setActivePolicy('terms')} className={activePolicy === 'terms' ? 'active' : ''}>Terms Of Service</li>
                <li onClick={() => setActivePolicy('warranty')} className={activePolicy === 'warranty' ? 'active' : ''}>Warranty</li>
                <li onClick={() => setActivePolicy('cookies')} className={activePolicy === 'cookies' ? 'active' : ''}>Cookie Policy</li>
                <li onClick={() => setActivePolicy('shipping')} className={activePolicy === 'shipping' ? 'active' : ''}>Shipping & Returns</li>
              </ul>
            </div>

            <div className="contact-box">
              <p className="desktop-h5" style={{ marginBottom: 10 }}>Contact Us</p>
              <p className="desktop-body-xs" style={{ marginBottom: 8 }}>Need help? Our support is available 24/7</p>
              <p className="desktop-body-s" style={{ marginBottom: 4 }}><strong>support@konarcards.com</strong></p>
            </div>
          </div>
        </div>

        <main className="policy-content">
          {renderContent()}
        </main>
      </div>

      <Footer />
    </>
  );

}
