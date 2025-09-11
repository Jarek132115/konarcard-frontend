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

export default function FAQ() {
  return (
    <>
      <Navbar />
      <div style={{ marginTop: 20 }} className="section-breadcrumbs">
        <Breadcrumbs />
      </div>

      <div style={{ marginTop: 40 }} className="section-1-title section">
        <h2 className="desktop-h1 text-center">Got Questions? We’ve Got Answers.</h2>
        <h3 className="desktop-h6 text-center">Everything you need to know about cards, profiles, pricing, shipping, returns, and more.</h3>
      </div>

      {/* Product & Technology */}
      <div style={{ marginTop: 80 }} className="section">
        <div className="section-1-title">
          <h2 className="desktop-h3 text-center">Product & Technology</h2>
          <h3 className="desktop-h6 text-center">How the card and tap-to-share actually work.</h3>
        </div>

        <div className="faq-container">
          <div className="faq-column">
            <div className="section-list">
              <div className="icon-white"><img src={IDCardIcon} className="icon" /></div>
              <div className="section-list-info">
                <p className="desktop-h6">What is an NFC business card?</p>
                <p className="desktop-body-xs">A physical card with a tiny chip that opens your Konar profile on a phone with a tap—no app or battery needed.</p>
              </div>
            </div>

            <div className="section-list">
              <div className="icon-white"><img src={NFCIcon} className="icon" /></div>
              <div className="section-list-info">
                <p className="desktop-h6">How does the tap work?</p>
                <p className="desktop-body-xs">The phone’s NFC reader powers the chip and launches your profile instantly.</p>
              </div>
            </div>

            <div className="section-list">
              <div className="icon-white"><img src={QRCode} className="icon" /></div>
              <div className="section-list-info">
                <p className="desktop-h6">What if someone can’t tap?</p>
                <p className="desktop-body-xs">Every card includes a QR code and a shareable link—so your page is always accessible.</p>
              </div>
            </div>
          </div>

          <div className="faq-column">
            <div className="section-list">
              <div className="icon-white"><img src={PhoneIcon} className="icon" /></div>
              <div className="section-list-info">
                <p className="desktop-h6">Does it work on all phones?</p>
                <p className="desktop-body-xs">Works on iPhone 7+ and most Android phones with NFC enabled. QR works on any camera phone.</p>
              </div>
            </div>

            <div className="section-list">
              <div className="icon-white"><img src={NFCChipIcon} className="icon" /></div>
              <div className="section-list-info">
                <p className="desktop-h6">Is the chip visible?</p>
                <p className="desktop-body-xs">No—it's sealed inside the card and doesn’t affect the look or finish.</p>
              </div>
            </div>

            <div className="section-list">
              <div className="icon-white"><img src={TimeIcon} className="icon" /></div>
              <div className="section-list-info">
                <p className="desktop-h6">How long will it last?</p>
                <p className="desktop-body-xs">Years of everyday use. There’s no battery to run out and nothing to charge.</p>
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* Digital Profile & Setup */}
      <div style={{ marginTop: 40 }} className="section">
        <div className="section-1-title">
          <h2 className="desktop-h3 text-center">Digital Profile & Setup</h2>
          <h3 className="desktop-h6 text-center">What you can add and how to build it fast.</h3>
        </div>

        <div className="faq-container">
          <div className="faq-column">
            <div className="section-list">
              <div className="icon-white"><img src={ProfileIcon} className="icon" /></div>
              <div className="section-list-info">
                <p className="desktop-h6">What can my page include?</p>
                <p className="desktop-body-xs">Contact details, services, prices, gallery, reviews, bio and social links—plus custom buttons.</p>
              </div>
            </div>

            <div className="section-list">
              <div className="icon-white"><img src={InfoIcon} className="icon" /></div>
              <div className="section-list-info">
                <p className="desktop-h6">Do I need to be techy?</p>
                <p className="desktop-body-xs">No. It’s a simple dashboard—most people finish in under five minutes.</p>
              </div>
            </div>
          </div>

          <div className="faq-column">
            <div className="section-list">
              <div className="icon-white"><img src={TimeIcon} className="icon" /></div>
              <div className="section-list-info">
                <p className="desktop-h6">How do I share my page?</p>
                <p className="desktop-body-xs">Tap the card, scan the QR, or share the link by text, email, or socials.</p>
              </div>
            </div>

            <div className="section-list">
              <div className="icon-white"><img src={BoltIcon} className="icon" /></div>
              <div className="section-list-info">
                <p className="desktop-h6">Who is it for?</p>
                <p className="desktop-body-xs">Built for tradies—plumbers, sparkies, builders, tilers, gardeners and more.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing & Subscription */}
      <div style={{ marginTop: 40 }} className="section">
        <div className="section-1-title">
          <h2 className="desktop-h3 text-center">Pricing & Subscription</h2>
          <h3 className="desktop-h6 text-center">Free trial, what’s included, and billing.</h3>
        </div>

        <div className="faq-container">
          <div className="faq-column">
            <div className="section-list">
              <div className="icon-white"><img src={BoltIcon} className="icon" /></div>
              <div className="section-list-info">
                <p className="desktop-h6">What do I get with the subscription?</p>
                <p className="desktop-body-xs">Your online profile with unlimited edits, gallery, services, reviews, styling and analytics after a 14-day free trial.</p>
              </div>
            </div>

            <div className="section-list">
              <div className="icon-white"><img src={InfoIcon} className="icon" /></div>
              <div className="section-list-info">
                <p className="desktop-h6">Do I need it to use the card?</p>
                <p className="desktop-body-xs">Card is a one-time purchase. Subscription is optional but required to keep editing your page after the trial.</p>
              </div>
            </div>
          </div>

          <div className="faq-column">
            <div className="section-list">
              <div className="icon-white"><img src={ProfilePencil} className="icon" /></div>
              <div className="section-list-info">
                <p className="desktop-h6">What happens after the trial?</p>
                <p className="desktop-body-xs">If you don’t subscribe, your page stays live but editing is disabled. Subscribe any time to keep editing.</p>
              </div>
            </div>

            <div className="section-list">
              <div className="icon-white"><img src={ShieldIcon} className="icon" /></div>
              <div className="section-list-info">
                <p className="desktop-h6">Can I cancel?</p>
                <p className="desktop-body-xs">Yes—cancel in your account. Access runs until the end of the current billing period.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Shipping & Delivery */}
      <div style={{ marginTop: 40 }} className="section">
        <div className="section-1-title">
          <h2 className="desktop-h3 text-center">Shipping & Delivery</h2>
          <h3 className="desktop-h6 text-center">Production times, delivery windows, and tracking.</h3>
        </div>

        <div className="faq-container">
          <div className="faq-column">
            <div className="section-list">
              <div className="icon-white"><img src={DeliveryIcon} className="icon" /></div>
              <div className="section-list-info">
                <p className="desktop-h6">When will my card arrive?</p>
                <p className="desktop-body-xs">Production 2–4 business days. Free Standard delivery 3–7 business days; Express 1–3 business days.</p>
              </div>
            </div>

            <div className="section-list">
              <div className="icon-white"><img src={WorldIcon} className="icon" /></div>
              <div className="section-list-info">
                <p className="desktop-h6">Do you ship internationally?</p>
                <p className="desktop-body-xs">Yes—Europe 3–5 days, outside Europe up to 10 days. Customs/taxes may apply.</p>
              </div>
            </div>
          </div>

          <div className="faq-column">
            <div className="section-list">
              <div className="icon-white"><img src={AddressIcon} className="icon" /></div>
              <div className="section-list-info">
                <p className="desktop-h6">Can I change my address?</p>
                <p className="desktop-body-xs">Only before production starts. Contact support ASAP with your order number.</p>
              </div>
            </div>

            <div className="section-list">
              <div className="icon-white"><img src={TrackIcon} className="icon" /></div>
              <div className="section-list-info">
                <p className="desktop-h6">How do I track my order?</p>
                <p className="desktop-body-xs">We’ll email you a tracking link the moment your card ships.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Returns, Cancellations & Refunds */}
      <div style={{ marginTop: 40 }} className="section">
        <div className="section-1-title">
          <h2 className="desktop-h3 text-center">Returns, Cancellations & Refunds</h2>
          <h3 className="desktop-h6 text-center">What to do if something goes wrong.</h3>
        </div>

        <div className="faq-container">
          <div className="faq-column">
            <div className="section-list">
              <div className="icon-white"><img src={ReturnIcon} className="icon" /></div>
              <div className="section-list-info">
                <p className="desktop-h6">Can I return or exchange?</p>
                <p className="desktop-body-xs">Custom cards aren’t returnable unless there’s a manufacturing defect.</p>
              </div>
            </div>

            <div className="section-list">
              <div className="icon-white"><img src={CancelIcon} className="icon" /></div>
              <div className="section-list-info">
                <p className="desktop-h6">Can I cancel my order?</p>
                <p className="desktop-body-xs">Cancellations are possible within 2 hours of purchase (before production begins).</p>
              </div>
            </div>
          </div>

          <div className="faq-column">
            <div className="section-list">
              <div className="icon-white"><img src={DamagedIcon} className="icon" /></div>
              <div className="section-list-info">
                <p className="desktop-h6">What if it arrives damaged?</p>
                <p className="desktop-body-xs">Contact support within 7 days with photos/video—we’ll arrange a free replacement.</p>
              </div>
            </div>

            <div className="section-list">
              <div className="icon-white"><img src={RefundIcon} className="icon" /></div>
              <div className="section-list-info">
                <p className="desktop-h6">Do you offer refunds?</p>
                <p className="desktop-body-xs">If a replacement can’t be provided, refunds are issued to your original payment method (5–10 business days).</p>
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
                <p className="desktop-h6">What’s the warranty?</p>
                <p className="desktop-body-xs">6-month limited warranty covering manufacturing defects, faulty chips, and printing errors.</p>
              </div>
            </div>
          </div>

          <div className="faq-column">
            <div className="section-list">
              <div className="icon-white"><img src={InfoIcon} className="icon" /></div>
              <div className="section-list-info">
                <p className="desktop-h6">What isn’t covered?</p>
                <p className="desktop-body-xs">Damage from bending, cracking, cuts, water (unless waterproof model), normal wear, misuse, loss or theft.</p>
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
                <p className="desktop-body-xs">One card can replace thousands of paper cards over its lifetime—less waste, fewer reprints.</p>
              </div>
            </div>

            <div className="section-list">
              <div className="icon-white"><img src={TreeIcon} className="icon" /></div>
              <div className="section-list-info">
                <p className="desktop-h6">Do you use sustainable materials?</p>
                <p className="desktop-body-xs">Wood cards are made from responsibly sourced materials; metal cards are long-lasting.</p>
              </div>
            </div>
          </div>

          <div className="faq-column">
            <div className="section-list">
              <div className="icon-white"><img src={RecycleIcon} className="icon" /></div>
              <div className="section-list-info">
                <p className="desktop-h6">How does this help the planet?</p>
                <p className="desktop-body-xs">Cuts paper use, reduces carbon from print runs, and keeps contact details digital.</p>
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
                <p className="desktop-body-xs">Profile info, contact details, order/shipping data and payment info—only to run your account and fulfil orders.</p>
              </div>
            </div>
          </div>

          <div className="faq-column">
            <div className="section-list">
              <div className="icon-white"><img src={ShieldIcon} className="icon" /></div>
              <div className="section-list-info">
                <p className="desktop-h6">Do you sell my data?</p>
                <p className="desktop-body-xs">No. We never sell your data. Limited sharing only with payment, printing and shipping partners.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Support & Help */}
      <div style={{ marginTop: 40 }} className="section">
        <div className="section-1-title">
          <h2 className="desktop-h3 text-center">Support & Help</h2>
          <h3 className="desktop-h6 text-center">We’re here if you get stuck.</h3>
        </div>

        <div className="faq-container">
          <div className="faq-column">
            <div className="section-list">
              <div className="icon-white"><img src={ContactIcon} className="icon" /></div>
              <div className="section-list-info">
                <p className="desktop-h6">How can I contact support?</p>
                <p className="desktop-body-xs">Live chat on the site, email, or submit a Help Centre request—whatever’s easiest.</p>
              </div>
            </div>

            <div className="section-list">
              <div className="icon-white"><img src={TutorialIcon} className="icon" /></div>
              <div className="section-list-info">
                <p className="desktop-h6">Do you have tutorials?</p>
                <p className="desktop-body-xs">Yes—step-by-step guides and videos to help you set up fast.</p>
              </div>
            </div>
          </div>

          <div className="faq-column">
            <div className="section-list">
              <div className="icon-white"><img src={TimeIcon} className="icon" /></div>
              <div className="section-list-info">
                <p className="desktop-h6">How fast do you respond?</p>
                <p className="desktop-body-xs">We usually reply within 24 hours on weekdays.</p>
              </div>
            </div>

            <div className="section-list">
              <div className="icon-white"><img src={InfoIcon} className="icon" /></div>
              <div className="section-list-info">
                <p className="desktop-h6">Need help setting up?</p>
                <p className="desktop-body-xs">Ping us—our team can walk you through the whole setup.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  )
}
