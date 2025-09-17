// frontend/src/pages/FAQ/index.jsx
import React from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import Breadcrumbs from '../../components/Breadcrumbs'
import Footer from '../../components/Footer'

import IDCardIcon from '../../assets/icons/IDCard-Icon.svg'
import NFCIcon from '../../assets/icons/NFC-Icon.svg'
import BoltIcon from '../../assets/icons/Bolt-Icon.svg'
import MaterialsIcon from '../../assets/icons/Materials-Icon.svg'
import Pencil from '../../assets/icons/Pencil-Icon.svg'
import ProfilePencil from '../../assets/icons/ProfilePencil-Icon.svg'
import TimeIcon from '../../assets/icons/Time-Icon.svg'
import PhoneIcon from '../../assets/icons/Phone-Icon.svg'
import NFCChipIcon from '../../assets/icons/NFCChip-Icon.svg'
import ShieldIcon from '../../assets/icons/Shield-Icon.svg'
import QRCode from '../../assets/icons/QR-Code-Icon.svg'
import ProfileIcon from '../../assets/icons/Profile-Icon.svg'
import InfoIcon from '../../assets/icons/Info-Icon.svg'
import DeliveryIcon from '../../assets/icons/Delivery-Icon.svg'
import WorldIcon from '../../assets/icons/World-Icon.svg'
import AddressIcon from '../../assets/icons/Address-Icon.svg'
import TrackIcon from '../../assets/icons/Track-Icon.svg'
import ReturnIcon from '../../assets/icons/Return-Icon.svg'
import CancelIcon from '../../assets/icons/Cancel-Icon.svg'
import DamagedIcon from '../../assets/icons/Damaged-Icon.svg'
import RefundIcon from '../../assets/icons/Refund-Icon.svg'
import EcoIcon from '../../assets/icons/Eco-Icon.svg'
import TreeIcon from '../../assets/icons/Tree-Icon.svg'
import RecycleIcon from '../../assets/icons/Recycle-Icon.svg'
import ContactIcon from '../../assets/icons/Contact-Icon.svg'
import TutorialIcon from '../../assets/icons/Tutorial-Icon.svg'
import ShareIcon from '../../assets/icons/Share-Icon.svg';
import QuestionIcon from '../../assets/icons/Question-Icon.svg';

export default function FAQ() {
  return (
    <>
      <Navbar />
      <div style={{ marginTop: 20 }} className="section-breadcrumbs">
        <Breadcrumbs />
      </div>

      <div className="section-1-title section">
        <h2 className="desktop-h1 text-center">Got Questions? We’ve Got Answers.</h2>
        <h3 className="desktop-h6 text-center">
          Straightforward info on the card, your digital profile, pricing, shipping, returns and more.
        </h3>
      </div>

      {/* Product & Technology */}
      <div style={{ marginTop: 80 }} className="section">
        <div className="section-1-title">
          <h2 className="desktop-h3 text-center">Product & Technology</h2>
          <h3 className="desktop-h6 text-center">How tap-to-share works and what’s inside the card.</h3>
        </div>

        <div className="faq-container">
          <div className="faq-column">
            <div className="section-list">
              <div className="icon-white"><img src={IDCardIcon} className="icon" /></div>
              <div className="section-list-info">
                <p className="desktop-h6">What is the Konar NFC business card?</p>
                <p className="desktop-body-xs">
                  A reusable card with a tiny NFC chip that opens your Konar profile on someone’s phone with a tap—no app,
                  no battery, no fuss.
                </p>
              </div>
            </div>

            <div className="section-list">
              <div className="icon-white"><img src={NFCIcon} className="icon" /></div>
              <div className="section-list-info">
                <p className="desktop-h6">How does the tap actually work?</p>
                <p className="desktop-body-xs">
                  The phone’s NFC reader powers the chip and instantly launches your live profile link. You control what’s shown.
                </p>
              </div>
            </div>

            <div className="section-list">
              <div className="icon-white"><img src={QRCode} className="icon" /></div>
              <div className="section-list-info">
                <p className="desktop-h6">What if someone can’t tap?</p>
                <p className="desktop-body-xs">
                  Every card has a QR code and your profile also has a shareable link—so there’s always a backup.
                </p>
              </div>
            </div>
          </div>

          <div className="faq-column">
            <div className="section-list">
              <div className="icon-white"><img src={PhoneIcon} className="icon" /></div>
              <div className="section-list-info">
                <p className="desktop-h6">Will it work with their phone?</p>
                <p className="desktop-body-xs">
                  Works on iPhone 7 or newer and most Android phones with NFC enabled. QR works on any phone with a camera.
                </p>
              </div>
            </div>

            <div className="section-list">
              <div className="icon-white"><img src={NFCChipIcon} className="icon" /></div>
              <div className="section-list-info">
                <p className="desktop-h6">Is the NFC chip visible?</p>
                <p className="desktop-body-xs">No. It’s sealed inside the card and doesn’t affect the finish or design.</p>
              </div>
            </div>

            <div className="section-list">
              <div className="icon-white"><img src={TimeIcon} className="icon" /></div>
              <div className="section-list-info">
                <p className="desktop-h6">How long does the card last?</p>
                <p className="desktop-body-xs">
                  Years of everyday use. There’s no battery to die and nothing to charge.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Digital Profile & Setup */}
      <div style={{ marginTop: 40 }} className="section">
        <div className="section-1-title">
          <h2 className="desktop-h3 text-center">Digital Profile & Setup</h2>
          <h3 className="desktop-h6 text-center">Build it fast. Update it anytime.</h3>
        </div>

        <div className="faq-container">
          <div className="faq-column">
            <div className="section-list">
              <div className="icon-white"><img src={ProfileIcon} className="icon" /></div>
              <div className="section-list-info">
                <p className="desktop-h6">What can my profile include?</p>
                <p className="desktop-body-xs">
                  Your name, job title, bio, services with prices, photo gallery, reviews (star ratings), contact buttons,
                  social links and more.
                </p>
              </div>
            </div>

            <div className="section-list">
              <div className="icon-white"><img src={ProfilePencil} className="icon" /></div>
              <div className="section-list-info">
                <p className="desktop-h6">How long does setup take?</p>
                <p className="desktop-body-xs">
                  Most tradies finish in under 5 minutes—just fill in a few fields and hit Publish.
                </p>
              </div>
            </div>
          </div>

          <div className="faq-column">
            <div className="section-list">
              <div className="icon-white"><img src={Pencil} className="icon" /></div>
              <div className="section-list-info">
                <p className="desktop-h6">Can I edit my page later?</p>
                <p className="desktop-body-xs">
                  Yes. Make changes anytime—fonts, colours, layout, services, prices, photos and more update instantly.
                </p>
              </div>
            </div>

            <div className="section-list">
              <div className="icon-white"><img src={ShareIcon} className="icon" /></div>
              <div className="section-list-info">
                <p className="desktop-h6">How do I share my page?</p>
                <p className="desktop-body-xs">
                  Tap your card, show the QR code, or copy your link to send via WhatsApp, SMS, Messenger or socials.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing & Subscription */}
      <div style={{ marginTop: 40 }} className="section">
        <div className="section-1-title">
          <h2 className="desktop-h3 text-center">Pricing & Subscription</h2>
          <h3 className="desktop-h6 text-center">Free trial, what’s included and billing basics.</h3>
        </div>

        <div className="faq-container">
          <div className="faq-column">
            <div className="section-list">
              <div className="icon-white"><img src={ProfilePencil} className="icon" /></div>
              <div className="section-list-info">
                <p className="desktop-h6">What’s included in Power Profile?</p>
                <p className="desktop-body-xs">
                  Unlimited edits, gallery, services with pricing, reviews, themes/fonts, layouts, QR/link sharing and more—
                  all live instantly.
                </p>
              </div>
            </div>

            <div className="section-list">
              <div className="icon-white"><img src={InfoIcon} className="icon" /></div>
              <div className="section-list-info">
                <p className="desktop-h6">Do I need a subscription to use the card?</p>
                <p className="desktop-body-xs">
                  The card is a one-time purchase. To keep your profile online and editable beyond the 14-day free trial,
                  you’ll need an active subscription. Without it, taps/QR/link won’t show your page.
                </p>
              </div>
            </div>
          </div>

          <div className="faq-column">
            <div className="section-list">
              <div className="icon-white"><img src={QuestionIcon} className="icon" /></div>
              <div className="section-list-info">
                <p className="desktop-h6">How does the free trial work?</p>
                <p className="desktop-body-xs">
                  The free trial and the subscription include the <strong>same features</strong>. If your trial ends and you don’t
                  subscribe, your page will <strong>no longer be visible</strong> (taps/QR won’t load it). Subscribe anytime to reactivate.
                </p>
              </div>
            </div>

            <div className="section-list">
              <div className="icon-white"><img src={CancelIcon} className="icon" /></div>
              <div className="section-list-info">
                <p className="desktop-h6">What happens if I cancel?</p>
                <p className="desktop-body-xs">
                  You’ll keep access until the end of your current billing period. After that, your page will
                  <strong> no longer show</strong> until you subscribe again.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Shipping & Delivery */}
      <div style={{ marginTop: 40 }} className="section">
        <div className="section-1-title">
          <h2 className="desktop-h3 text-center">Shipping & Delivery</h2>
          <h3 className="desktop-h6 text-center">Production times, delivery windows and tracking.</h3>
        </div>

        <div className="faq-container">
          <div className="faq-column">
            <div className="section-list">
              <div className="icon-white"><img src={DeliveryIcon} className="icon" /></div>
              <div className="section-list-info">
                <p className="desktop-h6">When will my card arrive?</p>
                <p className="desktop-body-xs">
                  Production takes 2–4 business days. Standard delivery is 3–7 business days; Express is 1–3 business days.
                </p>
              </div>
            </div>

            <div className="section-list">
              <div className="icon-white"><img src={WorldIcon} className="icon" /></div>
              <div className="section-list-info">
                <p className="desktop-h6">Do you ship internationally?</p>
                <p className="desktop-body-xs">
                  Yes. Europe typically 3–5 days; outside Europe up to 10 days. Local customs/taxes may apply.
                </p>
              </div>
            </div>
          </div>

          <div className="faq-column">
            <div className="section-list">
              <div className="icon-white"><img src={AddressIcon} className="icon" /></div>
              <div className="section-list-info">
                <p className="desktop-h6">Can I change my address?</p>
                <p className="desktop-body-xs">
                  If production hasn’t started, yes—contact support ASAP with your order number and the new address.
                </p>
              </div>
            </div>

            <div className="section-list">
              <div className="icon-white"><img src={TrackIcon} className="icon" /></div>
              <div className="section-list-info">
                <p className="desktop-h6">How do I track my order?</p>
                <p className="desktop-body-xs">
                  We’ll email a tracking link as soon as your card ships.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Returns, Cancellations & Refunds */}
      <div style={{ marginTop: 40 }} className="section">
        <div className="section-1-title">
          <h2 className="desktop-h3 text-center">Returns, Cancellations & Refunds</h2>
          <h3 className="desktop-h6 text-center">If something’s not right, here’s what to do.</h3>
        </div>

        <div className="faq-container">
          <div className="faq-column">
            <div className="section-list">
              <div className="icon-white"><img src={ReturnIcon} className="icon" /></div>
              <div className="section-list-info">
                <p className="desktop-h6">Can I return or exchange my card?</p>
                <p className="desktop-body-xs">
                  Custom-printed cards aren’t returnable unless there’s a manufacturing defect.
                </p>
              </div>
            </div>

            <div className="section-list">
              <div className="icon-white"><img src={CancelIcon} className="icon" /></div>
              <div className="section-list-info">
                <p className="desktop-h6">Can I cancel my order?</p>
                <p className="desktop-body-xs">
                  You can cancel within 2 hours of purchase (before production starts). After that we’ve likely begun printing.
                </p>
              </div>
            </div>
          </div>

          <div className="faq-column">
            <div className="section-list">
              <div className="icon-white"><img src={DamagedIcon} className="icon" /></div>
              <div className="section-list-info">
                <p className="desktop-h6">What if my card arrives damaged?</p>
                <p className="desktop-body-xs">
                  Contact support within 7 days with photos/video and we’ll arrange a fast replacement at no cost.
                </p>
              </div>
            </div>

            <div className="section-list">
              <div className="icon-white"><img src={RefundIcon} className="icon" /></div>
              <div className="section-list-info">
                <p className="desktop-h6">Do you offer refunds?</p>
                <p className="desktop-body-xs">
                  If a replacement isn’t possible, we’ll refund to your original payment method (usually 5–10 business days).
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Warranty */}
      <div style={{ marginTop: 40 }} className="section">
        <div className="section-1-title">
          <h2 className="desktop-h3 text-center">Warranty</h2>
          <h3 className="desktop-h6 text-center">What’s covered and how to claim.</h3>
        </div>

        <div className="faq-container">
          <div className="faq-column">
            <div className="section-list">
              <div className="icon-white"><img src={ShieldIcon} className="icon" /></div>
              <div className="section-list-info">
                <p className="desktop-h6">What’s included in the warranty?</p>
                <p className="desktop-body-xs">
                  12-month limited warranty covering manufacturing defects, faulty chips and printing errors.
                </p>
              </div>
            </div>
          </div>

          <div className="faq-column">
            <div className="section-list">
              <div className="icon-white"><img src={InfoIcon} className="icon" /></div>
              <div className="section-list-info">
                <p className="desktop-h6">What isn’t covered?</p>
                <p className="desktop-body-xs">
                  Bending, cracks, cuts, water damage (unless a waterproof model), normal wear, misuse, loss or theft.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sustainability */}
      <div style={{ marginTop: 40 }} className="section">
        <div className="section-1-title">
          <h2 className="desktop-h3 text-center">Sustainability</h2>
          <h3 className="desktop-h6 text-center">A greener way to share details.</h3>
        </div>

        <div className="faq-container">
          <div className="faq-column">
            <div className="section-list">
              <div className="icon-white"><img src={EcoIcon} className="icon" /></div>
              <div className="section-list-info">
                <p className="desktop-h6">Are NFC cards eco-friendly?</p>
                <p className="desktop-body-xs">
                  One Konar card can replace thousands of paper cards over its lifetime—less printing, less waste.
                </p>
              </div>
            </div>
          </div>

          <div className="faq-column">
            <div className="section-list">
              <div className="icon-white"><img src={RecycleIcon} className="icon" /></div>
              <div className="section-list-info">
                <p className="desktop-h6">How does this help the planet?</p>
                <p className="desktop-body-xs">
                  Cuts paper usage, reduces carbon from print runs and keeps your details digital and up-to-date.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Data & Privacy */}
      <div style={{ marginTop: 40 }} className="section">
        <div className="section-1-title">
          <h2 className="desktop-h3 text-center">Data & Privacy</h2>
          <h3 className="desktop-h6 text-center">What we collect and how we use it.</h3>
        </div>

        <div className="faq-container">
          <div className="faq-column">
            <div className="section-list">
              <div className="icon-white"><img src={InfoIcon} className="icon" /></div>
              <div className="section-list-info">
                <p className="desktop-h6">What data do you collect?</p>
                <p className="desktop-body-xs">
                  Profile details you add, contact info, order/shipping data and payment information—only to run your account
                  and fulfil orders.
                </p>
              </div>
            </div>
          </div>

          <div className="faq-column">
            <div className="section-list">
              <div className="icon-white"><img src={ShieldIcon} className="icon" /></div>
              <div className="section-list-info">
                <p className="desktop-h6">Do you sell my data?</p>
                <p className="desktop-body-xs">
                  No. We never sell your data. We only share what’s necessary with trusted payment, printing and shipping partners.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Support & Help */}
      <div style={{ marginTop: 40 }} className="section">
        <div className="section-1-title">
          <h2 className="desktop-h3 text-center">Support & Help</h2>
        </div>

        <div className="faq-container">
          <div className="faq-column">
            <div className="section-list">
              <div className="icon-white"><img src={ContactIcon} className="icon" /></div>
              <div className="section-list-info">
                <p className="desktop-h6">How do I contact support?</p>
                <p className="desktop-body-xs">
                  Use live chat on the site, drop us an email, or submit a Help Centre request—whatever works for you.
                </p>
              </div>
            </div>

            <div className="section-list">
              <div className="icon-white"><img src={TutorialIcon} className="icon" /></div>
              <div className="section-list-info">
                <p className="desktop-h6">Do you have tutorials?</p>
                <p className="desktop-body-xs">
                  Yes—quick step-by-step guides and short videos to get you set up fast.
                </p>
              </div>
            </div>
          </div>

          <div className="faq-column">
            <div className="section-list">
              <div className="icon-white"><img src={TimeIcon} className="icon" /></div>
              <div className="section-list-info">
                <p className="desktop-h6">How quickly do you reply?</p>
                <p className="desktop-body-xs">
                  We usually respond within 24 hours on weekdays.
                </p>
              </div>
            </div>

            <div className="section-list">
              <div className="icon-white"><img src={InfoIcon} className="icon" /></div>
              <div className="section-list-info">
                <p className="desktop-h6">Need help setting up?</p>
                <p className="desktop-body-xs">
                  Ping us—our team can walk you through everything and make sure your page looks top tier.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  )
}
