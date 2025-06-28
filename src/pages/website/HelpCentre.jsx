import React from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import Breadcrumbs from '../../components/Breadcrumbs'
import Footer from '../../components/Footer'
import BackgroundHero from '../../assets/images/background-hero.png'



export default function HelpCentre() {
  return (
    <>
      <Navbar />
      <div style={{ marginTop: 20 }} className="section-breadcrumbs">
        <Breadcrumbs />
      </div>
      <div style={{ marginTop: 40 }} className="section">
        <div className="section-1-title">
          <h2 className='desktop-h1 text-center'>Welcome to the NFC Help Centre</h2>
          <h3 className='desktop-h6 text-center'>Here to help you set up, share, and make the most of your smart card. Browse guides, FAQs, and tips below.</h3>
        </div>
        <div style={{ marginBottom: 100 }} className="blog-container">
          <img src={BackgroundHero} alt="Hero" className="" />
          <div className="blog-info">
            <div>
              <p className='desktop-h5'>Why NFC Business Cards Are the Future</p>
              <p style={{ fontStyle: 'italic', color: '#333' }} className='desktop-body'>Published April 19, 2025 • 3 min read</p>
              <p style={{ marginBottom: 20 }} className='desktop-body'>Explore how NFC technology is changing the way professionals connect, share, and grow relationships faster than ever. Learn why businesses, freelancers, and creators are making the switch to digital networking tools.</p>
            </div>
            <Link to="/login" className="black-button desktop-button">Read more</Link>
          </div>
        </div>
        <div style={{ flexDirection: 'reverse-column' }} className="blog-container">
          <img src={BackgroundHero} alt="Hero" className="" />
          <div className="blog-info">
            <div>
              <p className='desktop-h5'>Why NFC Business Cards Are the Future</p>
              <p style={{ fontStyle: 'italic', color: '#333' }} className='desktop-body'>Published April 19, 2025 • 3 min read</p>
              <p style={{ marginBottom: 20 }} className='desktop-body'>Explore how NFC technology is changing the way professionals connect, share, and grow relationships faster than ever. Learn why businesses, freelancers, and creators are making the switch to digital networking tools.</p>
            </div>
            <Link to="/login" className="black-button desktop-button">Read more</Link>
          </div>
        </div>

      </div>
      <Footer />
    </>
  )
}
