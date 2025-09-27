import React from 'react'
import Navbar from '../../components/Navbar'
import Breadcrumbs from '../../components/Breadcrumbs'
import Footer from '../../components/Footer'
import ReviewStars from '../../assets/icons/Stars-Icon.svg'

import pp1 from '../../assets/images/pp1.png'
import pp2 from '../../assets/images/pp2.png'
import pp3 from '../../assets/images/pp3.png'
import pp4 from '../../assets/images/pp4.png'
import pp5 from '../../assets/images/pp5.png'
import pp6 from '../../assets/images/pp6.png'
import pp7 from '../../assets/images/pp7.png'
import pp8 from '../../assets/images/pp8.png'
import pp9 from '../../assets/images/pp9.png'
import pp10 from '../../assets/images/pp10.png'
import pp11 from '../../assets/images/pp11.png'
import pp12 from '../../assets/images/pp12.png'

export default function Reviews() {
  return (
    <>
      <Navbar />
      <div style={{ marginTop: 20 }} className="section-breadcrumbs">
        <Breadcrumbs />
      </div>

      <div className="section">
        <div className="section-1-title">
          <h2 className="desktop-h1 text-center">The <span className='orange'>#1 Tool</span> Tradies Are Talking About</h2>
          <h3 className="desktop-body-xs text-center">
            Don’t take our word for it — see why tradespeople are switching to smarter, faster profiles.
          </h3>
        </div>

        <div className="review-container-box">
          {/* Row 1 */}
          <div className="review-container">
            <div className="review-pair">
              <div className="review-div">
                <img className="stars" src={ReviewStars} alt="5 star rating" />
                <p className="desktop-body-s text-center">
                  “Since using KonarCard I’m actually getting replies. Clients say it looks slick and I’m getting referrals.”
                </p>
                <div className="review-div-person">
                  <img src={pp1} alt="Reviewer" />
                  <div className="review-person-name">
                    <p className="desktop-body-xs" style={{ color: '#333' }}>Plumber</p>
                    <p className="desktop-body-s">Mark B</p>
                  </div>
                </div>
              </div>

              <div className="review-div">
                <img className="stars" src={ReviewStars} alt="5 star rating" />
                <p className="desktop-body-s text-center">
                  “Saved me a fortune on printing. I tap the card and customers have everything in seconds.”
                </p>
                <div className="review-div-person">
                  <img src={pp2} alt="Reviewer" />
                  <div className="review-person-name">
                    <p className="desktop-body-xs" style={{ color: '#333' }}>Electrician</p>
                    <p className="desktop-body-s">Jake C</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="review-pair">
              <div className="review-div">
                <img className="stars" src={ReviewStars} alt="5 star rating" />
                <p className="desktop-body-s text-center">
                  “Gives me a proper online presence without a pricey website. Photos and reviews do the selling.”
                </p>
                <div className="review-div-person">
                  <img src={pp3} alt="Reviewer" />
                  <div className="review-person-name">
                    <p className="desktop-body-xs" style={{ color: '#333' }}>Builder</p>
                    <p className="desktop-body-s">Tom G</p>
                  </div>
                </div>
              </div>

              <div className="review-div">
                <img className="stars" src={ReviewStars} alt="5 star rating" />
                <p className="desktop-body-s text-center">
                  “I update prices and services on my phone. No reprinting, no fuss — just more enquiries.”
                </p>
                <div className="review-div-person">
                  <img src={pp4} alt="Reviewer" />
                  <div className="review-person-name">
                    <p className="desktop-body-xs" style={{ color: '#333' }}>Roofer</p>
                    <p className="desktop-body-s">Sam H</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Row 2 */}
          <div className="review-container">
            <div className="review-pair">
              <div className="review-div">
                <img className="stars" src={ReviewStars} alt="5 star rating" />
                <p className="desktop-body-s text-center">
                  “Looks professional on mobile. Clients can call, WhatsApp or request a quote right away.”
                </p>
                <div className="review-div-person">
                  <img src={pp5} alt="Reviewer" />
                  <div className="review-person-name">
                    <p className="desktop-body-xs" style={{ color: '#333' }}>Decorator</p>
                    <p className="desktop-body-s">Steve L</p>
                  </div>
                </div>
              </div>

              <div className="review-div">
                <img className="stars" src={ReviewStars} alt="5 star rating" />
                <p className="desktop-body-s text-center">
                  “Before this I relied on word of mouth. Now people find me online and book. Worth every penny.”
                </p>
                <div className="review-div-person">
                  <img src={pp6} alt="Reviewer" />
                  <div className="review-person-name">
                    <p className="desktop-body-xs" style={{ color: '#333' }}>Joiner</p>
                    <p className="desktop-body-s">Matt D</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="review-pair">
              <div className="review-div">
                <img className="stars" src={ReviewStars} alt="5 star rating" />
                <p className="desktop-body-s text-center">
                  “Cheaper than keeping a website going. The gallery shows my best work and wins trust.”
                </p>
                <div className="review-div-person">
                  <img src={pp7} alt="Reviewer" />
                  <div className="review-person-name">
                    <p className="desktop-body-xs" style={{ color: '#333' }}>Tiler</p>
                    <p className="desktop-body-s">Chris S</p>
                  </div>
                </div>
              </div>

              <div className="review-div">
                <img className="stars" src={ReviewStars} alt="5 star rating" />
                <p className="desktop-body-s text-center">
                  “Tap, scan or share the link — it just works. I’m booking more local jobs than ever.”
                </p>
                <div className="review-div-person">
                  <img src={pp8} alt="Reviewer" />
                  <div className="review-person-name">
                    <p className="desktop-body-xs" style={{ color: '#333' }}>Heating Engineer</p>
                    <p className="desktop-body-s">Alex M</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Row 3 */}
          <div className="review-container">
            <div className="review-pair">
              <div className="review-div">
                <img className="stars" src={ReviewStars} alt="5 star rating" />
                <p className="desktop-body-s text-center">
                  “Not techy at all and still set it up in minutes. It’s tidy, modern and saves me on marketing.”
                </p>
                <div className="review-div-person">
                  <img src={pp9} alt="Reviewer" />
                  <div className="review-person-name">
                    <p className="desktop-body-xs" style={{ color: '#333' }}>Handyman</p>
                    <p className="desktop-body-s">Dan R</p>
                  </div>
                </div>
              </div>

              <div className="review-div">
                <img className="stars" src={ReviewStars} alt="5 star rating" />
                <p className="desktop-body-s text-center">
                  “Clients love the map and service list. I’ve stopped reprinting cards — this pays for itself.”
                </p>
                <div className="review-div-person">
                  <img src={pp10} alt="Reviewer" />
                  <div className="review-person-name">
                    <p className="desktop-body-xs" style={{ color: '#333' }}>Gardener</p>
                    <p className="desktop-body-s">Ben K</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="review-pair">
              <div className="review-div">
                <img className="stars" src={ReviewStars} alt="5 star rating" />
                <p className="desktop-body-s text-center">
                  “All my links in one place — quote form, photos, socials. It’s helped me close jobs faster.”
                </p>
                <div className="review-div-person">
                  <img src={pp11} alt="Reviewer" />
                  <div className="review-person-name">
                    <p className="desktop-body-xs" style={{ color: '#333' }}>Bricklayer</p>
                    <p className="desktop-body-s">John P</p>
                  </div>
                </div>
              </div>

              <div className="review-div">
                <img className="stars" src={ReviewStars} alt="5 star rating" />
                <p className="desktop-body-s text-center">
                  “Looks professional when I’m on site. One tap and the client has my details and portfolio.”
                </p>
                <div className="review-div-person">
                  <img src={pp12} alt="Reviewer" />
                  <div className="review-person-name">
                    <p className="desktop-body-xs" style={{ color: '#333' }}>Plasterer</p>
                    <p className="desktop-body-s">Lewis J</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* End Row 3 */}
        </div>
      </div>

      <Footer />
    </>
  )
}
