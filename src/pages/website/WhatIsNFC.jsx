import React from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import Breadcrumbs from '../../components/Breadcrumbs'
import Footer from '../../components/Footer'
import AllCards from '../../assets/images/All-Cards.png'
import PremiumMaterials from '../../assets/icons/Premium-Materials-Icon.svg'
import CustomizableDesign from '../../assets/icons/Customizable-Design-Icon.svg'
import QRCode from '../../assets/icons/QR-Code-Icon.svg'
import NFCIcon from '../../assets/icons/NFC-Icon.svg'
import TapIcon from '../../assets/icons/Tap-Icon.svg'
import SaveIcon from '../../assets/icons/Save-Icon.svg'
import HowItWorks1 from '../../assets/images/HowItWorks-1.png'
import HowItWorks2 from '../../assets/images/HowItWorks-2.png'
import HowItWorks3 from '../../assets/images/HowItWorks-3.png'
import ProfileIcon from '../../assets/icons/Profile-Icon.svg'
import PalletteIcon from '../../assets/icons/Pallette-Icon.svg'
import PhoneIcon from '../../assets/icons/Phone-Icon.svg'
import NoApp from '../../assets/icons/NoApp-Icon.svg'




export default function WhatIsNFC() {
  return (
    <>
      <Navbar />
      <div style={{ marginTop: 20 }} className="section-breadcrumbs">
        <Breadcrumbs />
      </div>
      <div style={{ marginTop: 40 }} className="section">
        <div className="section-1-title">
          <h2 className="desktop-h1 text-center">What’s an NFC Business Card?</h2>
          <h3 className="desktop-h6 text-center">It’s a smart card you tap on a phone to share your details — no apps needed.</h3>
        </div>

        <div style={{ gap: 40 }} className="section-1-content">
          <div className="section-1-left">
            <img src={AllCards} className="" />
          </div>

          <div className="section-1-right">
            <p className="desktop-h5">Why Our Cards Are Better</p>
            <p className="desktop-body">Tough, smart, and made to match your business.</p>

            <div className="section-list">
              <div className="icon-white">
                <img src={PremiumMaterials} className="icon" />
              </div>
              <div className="section-list-info">
                <p className="desktop-h6">Built to Last</p>
                <p className="desktop-body-xs">Choose plastic, wood, or metal — strong and professional.</p>
              </div>
            </div>

            <div className="section-list">
              <div className="icon-white">
                <img src={NFCIcon} className="icon" />
              </div>
              <div className="section-list-info">
                <p className="desktop-h6">Tap to Share</p>
                <p className="desktop-body-xs">Just tap your card on most phones — your profile pops up.</p>
              </div>
            </div>

            <div className="section-list">
              <div className="icon-white">
                <img src={PalletteIcon} className="icon" />
              </div>
              <div className="section-list-info">
                <p className="desktop-h6">Your Look, Your Style</p>
                <p className="desktop-body-xs">Pick your colors, upload your logo — make it your own.</p>
              </div>
            </div>

            <div className="section-list">
              <div className="icon-white">
                <img src={QRCode} className="icon" />
              </div>
              <div className="section-list-info">
                <p className="desktop-h6">QR Code Backup</p>
                <p className="desktop-body-xs">Also scannable — works even if NFC isn’t.</p>
              </div>
            </div>

            <div className="section-list">
              <div className="icon-white">
                <img src={PhoneIcon} className="icon" />
              </div>
              <div className="section-list-info">
                <p className="desktop-h6">Works on Any Phone</p>
                <p className="desktop-body-xs">Compatible with iPhones and Androids — no setup needed.</p>
              </div>
            </div>
          </div>
        </div>
      </div>




      <div className="section">
        <div className="section-1-title">
          <h2 className="desktop-h3 text-center">How It Works</h2>
          <h3 className="desktop-h6 text-center">
            Tap the card on any phone. Your profile opens. Job done.
          </h3>
        </div>

        <div className="how-it-works-container">
          <div className="white-card-column">
            <div className="how-it-works-info">
              <img src={TapIcon} className="icon-40" />
              <p className="desktop-h5">Tap the Card</p>
              <p className="desktop-body">
                Hold the card near most phones — it works without any app.
              </p>
            </div>
            <img src={HowItWorks1} className="white-card-column-image" />
          </div>

          <div className="how-it-works-right">
            <div className="white-card">
              <div className="how-it-works-info">
                <img src={ProfileIcon} className="icon-40" />
                <p className="desktop-h5">Your Page Pops Up</p>
                <p className="desktop-body">
                  They see your name, photo, services, and how to reach you.
                </p>
              </div>
              <img src={HowItWorks2} className="how-it-works-right-image" />
            </div>

            <div className="white-card">
              <div className="how-it-works-info">
                <img src={SaveIcon} className="icon-40" />
                <p className="desktop-h5">They Save Your Info</p>
                <p className="desktop-body">
                  One tap saves your number, email, or connects to your socials.
                </p>
              </div>
              <img src={HowItWorks3} className="how-it-works-right-image" />
            </div>
          </div>
        </div>
      </div>


      <div className="section">
        <div className="section-1-title">
          <h2 className="desktop-h3 text-center">Why Tradesmen Love It</h2>
          <h3 className="desktop-h6 text-center">No paper. No hassle. Just tap and get hired.</h3>
        </div>

        <div className="section-3-container-flex">
          <div className="section-3-container">
            <div className="section-3-1x1-image-info">
              <img src={QRCode} className="" />
              <p className="desktop-h5 text-center">Look Like a Pro</p>
              <p className="desktop-body text-center">Modern, reliable, and ready to impress.</p>
            </div>

            <div className="section-3-1x1-image-info">
              <img src={QRCode} className="" />
              <p className="desktop-h5 text-center">One Smart Card</p>
              <p className="desktop-body text-center">No reprints. No stacks. Just tap and go.</p>
            </div>
          </div>

          <div className="section-3-container">
            <div className="section-3-1x1-image-info">
              <img src={QRCode} className="" />
              <p className="desktop-h5 text-center">Share Info in Seconds</p>
              <p className="desktop-body text-center">Tap once — your page pops up fast.</p>
            </div>

            <div className="section-3-1x1-image-info">
              <img src={QRCode} className="" />
              <p className="desktop-h5 text-center">No Apps Needed</p>
              <p className="desktop-body text-center">Works on most phones right out the box.</p>
            </div>
          </div>
        </div>

        <div className="cta-center-text" style={{ marginTop: 60, display: 'flex', justifyContent: 'center' }}>
          <p className="desktop-h6">Ready to upgrade your business card?</p>
          <Link to="/shopnfccards" className="black-button desktop-button">Get My Card Now</Link>
        </div>
      </div>





      <Footer />
    </>
  )
}
