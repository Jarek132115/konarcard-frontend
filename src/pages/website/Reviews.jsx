import React from 'react'
import Navbar from '../../components/Navbar'
import Breadcrumbs from '../../components/Breadcrumbs'
import Footer from '../../components/Footer'
import ReviewStars from '../../assets/icons/Stars-Icon.svg'
import ReviewPerson from '../../assets/images/Review-Person.png'


export default function Reviews() {
  return (
    <>
      <Navbar />
      <div style={{ marginTop: 20 }} className="section-breadcrumbs">
        <Breadcrumbs />
      </div>
      <div className="section">
        <div className="section-1-title">
          <h2 className='desktop-h3 text-center'>The #1 Tool Tradies Are Talking About</h2>
          <h3 className='desktop-h6 text-center'>
            Don’t take our word for it — see why tradespeople are switching to smarter, faster profiles.
          </h3>
        </div>
        <div className="review-container-box">
          <div className="review-container">
            <div className="review-pair">
              <div className="review-div">
                <img className='stars' src={ReviewStars} />
                <p className='desktop-body-s text-center'>“Since using this, I’m actually getting replies. Clients say it’s slick and they’ve even referred me to others.”</p>
                <div className="review-div-person">
                  <img src={ReviewPerson} />
                  <div className="review-person-name">
                    <p className='desktop-body-xs' style={{ color: '#333' }}>Plumber</p>
                    <p className='desktop-body-s'>Mark B</p>
                  </div>
                </div>
              </div>
              <div className="review-div">
                <img className='stars' src={ReviewStars} />
                <p className='desktop-body-s text-center'>“Since using this, I’m actually getting replies. Clients say it’s slick and they’ve even referred me to others.”</p>
                <div className="review-div-person">
                  <img src={ReviewPerson} />
                  <div className="review-person-name">
                    <p className='desktop-body-xs' style={{ color: '#333' }}>Plumber</p>
                    <p className='desktop-body-s'>Mark B</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="review-pair">
              <div className="review-div">
                <img className='stars' src={ReviewStars} />
                <p className='desktop-body-s text-center'>“Since using this, I’m actually getting replies. Clients say it’s slick and they’ve even referred me to others.”</p>
                <div className="review-div-person">
                  <img src={ReviewPerson} />
                  <div className="review-person-name">
                    <p className='desktop-body-xs' style={{ color: '#333' }}>Plumber</p>
                    <p className='desktop-body-s'>Mark B</p>
                  </div>
                </div>
              </div>
              <div className="review-div">
                <img className='stars' src={ReviewStars} />
                <p className='desktop-body-s text-center'>“Since using this, I’m actually getting replies. Clients say it’s slick and they’ve even referred me to others.”</p>
                <div className="review-div-person">
                  <img src={ReviewPerson} />
                  <div className="review-person-name">
                    <p className='desktop-body-xs' style={{ color: '#333' }}>Plumber</p>
                    <p className='desktop-body-s'>Mark B</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="review-container">
            <div className="review-pair">
              <div className="review-div">
                <img className='stars' src={ReviewStars} />
                <p className='desktop-body-s text-center'>“Since using this, I’m actually getting replies. Clients say it’s slick and they’ve even referred me to others.”</p>
                <div className="review-div-person">
                  <img src={ReviewPerson} />
                  <div className="review-person-name">
                    <p className='desktop-body-xs' style={{ color: '#333' }}>Plumber</p>
                    <p className='desktop-body-s'>Mark B</p>
                  </div>
                </div>
              </div>
              <div className="review-div">
                <img className='stars' src={ReviewStars} />
                <p className='desktop-body-s text-center'>“Since using this, I’m actually getting replies. Clients say it’s slick and they’ve even referred me to others.”</p>
                <div className="review-div-person">
                  <img src={ReviewPerson} />
                  <div className="review-person-name">
                    <p className='desktop-body-xs' style={{ color: '#333' }}>Plumber</p>
                    <p className='desktop-body-s'>Mark B</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="review-pair">
              <div className="review-div">
                <img className='stars' src={ReviewStars} />
                <p className='desktop-body-s text-center'>“Since using this, I’m actually getting replies. Clients say it’s slick and they’ve even referred me to others.”</p>
                <div className="review-div-person">
                  <img src={ReviewPerson} />
                  <div className="review-person-name">
                    <p className='desktop-body-xs' style={{ color: '#333' }}>Plumber</p>
                    <p className='desktop-body-s'>Mark B</p>
                  </div>
                </div>
              </div>
              <div className="review-div">
                <img className='stars' src={ReviewStars} />
                <p className='desktop-body-s text-center'>“Since using this, I’m actually getting replies. Clients say it’s slick and they’ve even referred me to others.”</p>
                <div className="review-div-person">
                  <img src={ReviewPerson} />
                  <div className="review-person-name">
                    <p className='desktop-body-xs' style={{ color: '#333' }}>Plumber</p>
                    <p className='desktop-body-s'>Mark B</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  )
}
