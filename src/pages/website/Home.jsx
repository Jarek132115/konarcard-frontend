import React from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

/* Sections */
import Hero from "../../components/Home/Hero";
import Comparison from "../../components/Home/Comparison";
import HowItWorks from "../../components/Home/HowItWorks";
import CustomerTrust from "../../components/Home/CustomerTrust";
import Products from "../../components/Home/Products";
import Examples from "../../components/Home/Examples";
import Share from "../../components/Home/Share";
import Value from "../../components/Home/Value";
import Pricing from "../../components/Home/Pricing";
// import Review from "../../components/Home/Review";

/* Assets for Share section */
import NFCBusinessCard from "../../assets/images/NFC-Business-Card.jpg";
import ScanQRCode from "../../assets/images/ScanQR-Code.jpg";
import LinkInBio from "../../assets/images/LinkInBio.jpg";
import SMSSend from "../../assets/images/SMSSend.jpg";

/* Global typography */
import "../../styling/fonts.css";
/* ✅ Minimal Home page wrapper styles (no section styling) */
import "../../styling/home.css";

export default function Home() {
  return (
    <>
      <Navbar />

      <main className="kc-home" aria-label="KonarCard home page">
        <Hero />
        <Comparison />
        <HowItWorks />
        <CustomerTrust />
        <Products />
        <Examples />

        <Share
          nfcImage={NFCBusinessCard}
          qrImage={ScanQRCode}
          smsImage={SMSSend}
          linkImage={LinkInBio}
        />

        <Value />
        <Pricing />

        {/* <Review /> */}
      </main>

      <Footer />
    </>
  );
}
