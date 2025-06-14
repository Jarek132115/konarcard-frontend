import React, { useContext } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import HeroImage from '../../assets/images/Hero-Image-new.png'
import BackgroundHero from '../../assets/images/background-hero.png'
import Section1Image from '../../assets/images/Section-1-Image.png'
import TickIcon from '../../assets/icons/Tick-Icon.svg'
import FormCustomizationIcon from '../../assets/icons/FormCustomization-Icon.svg'
import CustomizationIcon from '../../assets/icons/Customization-Icon.svg'
import BoltIcon from '../../assets/icons/Bolt-Icon.svg'
import IDCardIcon from '../../assets/icons/IDCard-Icon.svg'
import ImagesIcon from '../../assets/icons/Images-Icon.svg'
import UpdateIcon from '../../assets/icons/Update-Icon.svg'
import NFCIcon from '../../assets/icons/NFC-Icon.svg'
import Section3_Image1 from '../../assets/images/Section3-Image1.png'
import Section3_Image2 from '../../assets/images/Section3-Image2.png'
import Section3_Image3 from '../../assets/images/Section3-Image3.png'
import Section3_Image4 from '../../assets/images/Section3-Image4.png'
import EditProfile from '../../assets/images/Edit-Profile.jpg'
import WhyYouNeedThis from '../../assets/images/WhyYouNeedThis.png'
import People from '../../assets/images/People.png'
import WoodenCard from '../../assets/images/WoodenCard.png'
import PlasticCard from '../../assets/images/PlasticCard.png'
import ReviewStars from '../../assets/icons/Stars-Icon.svg'
import ReviewPerson from '../../assets/images/Review-Person.png'
import SetupIcon from '../../assets/icons/Setup-Icon.svg'
import BoxIcon from '../../assets/icons/Box-Icon.svg'
import PalletteIcon from '../../assets/icons/Pallette-Icon.svg'
import HatIcon from '../../assets/icons/Hat-Icon.svg'
import LockIcon from '../../assets/icons/Lock-Icon.svg'
import PencilIcon from '../../assets/icons/Pencil-Icon.svg'
import PhoneIcon from '../../assets/icons/Phone-Icon.svg'
import WalletIcon from '../../assets/icons/Wallet-Icon.svg'
import Profile1 from '../../assets/images/Profile1.png'
import Profile2 from '../../assets/images/Profile2.png'
import Profile3 from '../../assets/images/Profile3.png'
import Profile4 from '../../assets/images/Profile4.png'
import Profile5 from '../../assets/images/Profile5.png'
import { AuthContext } from '../../components/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Home() {

  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubscribe = async () => {
    if (!user) {
      navigate('/login', {
        state: {
          from: location.pathname,
          checkoutType: 'subscription',
        },
      });
      return;
    }

    try {
      // FIX: Use VITE_API_URL for API calls
      const res = await fetch(`${import.meta.env.VITE_API_URL}/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          returnUrl: window.location.origin + '/success',
        }),
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert('Could not start subscription');
      }
    } catch (err) {
      console.error('Subscription failed:', err);
      alert('Subscription failed');
    }
  };


  return (
    <>

      <Navbar />

      {/* HERO */}
      <div className="home-hero">
        <img src={BackgroundHero} alt="Hero Background" className="hero-image" />
        <div className="hero-container">
          <div className="hero-left">
            <h1 className="desktop-h1 hero-heading">Look More Professional. Win More Work!</h1>
            <p style={{ maxWidth: 340 }} className="desktop-h6 hero-subtitle">
              Tap your card. Share your profile. Stand out from every other tradie.
            </p>
            <div className="hero-social-proof">
              <div className="hero-avatars">
                <img src={Profile1} alt="User 1" className="avatar" />
                <img src={Profile2} alt="User 2" className="avatar" />
                <img src={Profile3} alt="User 3" className="avatar" />
                <img src={Profile4} alt="User 4" className="avatar" />
                <img src={Profile5} alt="User 5" className="avatar" />
              </div>
              <p className="hero-rating">Trusted by 1,000+ tradies</p>
            </div>
            <div className="hero-cta">
              <Link to="/register" className="black-button desktop-button">Get Started Free</Link>
              <Link to="/howitworks" className="blue-button desktop-button">See How It Works</Link>
            </div>

            {/* ✅ 2-Row Tick Layout */}
            <div className="hero-tick-wrap">
              <div className="hero-tick-row">
                <div className="hero-tick">
                  <img src={TickIcon} className="icon" />
                  <p>No app required — tap & share instantly</p>
                </div>
                <div className="hero-tick">
                  <img src={TickIcon} className="icon" />
                  <p>Built for tradesmen</p>
                </div>
              </div>
              <div className="hero-tick-row">
                <div className="hero-tick">
                  <img src={TickIcon} className="icon" />
                  <p>Fully customizable digital profile</p>
                </div>
                <div className="hero-tick">
                  <img src={TickIcon} className="icon" />
                  <p>Works with iPhone & Android</p>
                </div>
              </div>
            </div>
          </div>

          <div className="hero-right">
            <img src={HeroImage} alt="Hero" />
          </div>
        </div>
      </div>
      {/* HERO */}





      {/* SECTION 1 */}
      <div className="section">
        <div className="section-1-title">
          <h2 className="desktop-h3 text-center">Your Own Page to Win More Work</h2>
          <h3 className="desktop-h6 text-center">Make a page about your business in just a few minutes.</h3>
        </div>

        <div className="section-1-content">
          <div className="section-1-left">
            <img src={Section1Image} className="" />
          </div>

          <div className="section-1-right">
            <p className="desktop-h5">More Than a Business Card</p>
            <p className="desktop-body">This isn’t just a contact card — it’s your own page that shows off what you do, how to reach you, and why people should hire you.</p>

            <div className="section-list">
              <div className="icon-white">
                <img src={BoltIcon} className="icon" />
              </div>
              <div className="section-list-info">
                <p className="desktop-h6">Ready in 5 Minutes</p>
                <p className="desktop-body-xs">Pick your style, write a few lines, and you’re good to go.</p>
              </div>
            </div>

            <div className="section-list">
              <div className="icon-white">
                <img src={CustomizationIcon} className="icon" />
              </div>
              <div className="section-list-info">
                <p className="desktop-h6">Make It Yours</p>
                <p className="desktop-body-xs">Add your photo, your logo, and whatever makes your work stand out.</p>
              </div>
            </div>

            <div className="section-list">
              <div className="icon-white">
                <img src={FormCustomizationIcon} className="icon" />
              </div>
              <div className="section-list-info">
                <p className="desktop-h6">Easy to Update</p>
                <p className="desktop-body-xs">Need to change something? Do it anytime, fast and easy.</p>
              </div>
            </div>

            <div className="section-1-cta">
              <Link to="/register" className="black-button desktop-button margin-top-10">Get Started Free</Link>
            </div>
          </div>
        </div>
      </div>
      {/* SECTION 1 */}



      {/* SECTION 2 */}
      <div className="section">
        <div className="section-1-title">
          <h2 className="desktop-h3 text-center">Set It Up In Minutes</h2>
          <h3 className="desktop-h6 text-center">The quickest way to show off your work and get more jobs.</h3>
        </div>

        <div className="section-1-content">
          <div className="section-1-left">
            <img src={EditProfile} className="" />
          </div>

          <div className="section-1-right">
            <p className="desktop-h5">Show people what you do best.</p>
            <p className="desktop-body">Build a simple, powerful page that makes you look professional and ready for work.</p>

            <div className="section-list">
              <div className="icon-white">
                <img src={IDCardIcon} className="icon" />
              </div>
              <div className="section-list-info">
                <p className="desktop-h6">Add Your Info</p>
                <p className="desktop-body-xs">Your name, trade, photo, and a few quick details — done.</p>
              </div>
            </div>

            <div className="section-list">
              <div className="icon-white">
                <img src={ImagesIcon} className="icon" />
              </div>
              <div className="section-list-info">
                <p className="desktop-h6">Show Your Work</p>
                <p className="desktop-body-xs">Upload photos, list your services, and add reviews if you have them.</p>
              </div>
            </div>

            <div className="section-list">
              <div className="icon-white">
                <img src={UpdateIcon} className="icon" />
              </div>
              <div className="section-list-info">
                <p className="desktop-h6">Keep It Fresh</p>
                <p className="desktop-body-xs">Change prices, update photos, or tweak your details anytime you need.</p>
              </div>
            </div>

            <div className="section-list">
              <div className="icon-white">
                <img src={NFCIcon} className="icon" />
              </div>
              <div className="section-list-info">
                <p className="desktop-h6">Share It Fast</p>
                <p className="desktop-body-xs">Tap your card, scan your code, or send your link — no app needed.</p>
              </div>
            </div>

            <div className="section-1-cta">
              <Link to="/register" className="black-button desktop-button margin-top-10">Get Started Free</Link>
            </div>
          </div>
        </div>
      </div>
      {/* SECTION 2 */}




      {/* SECTION 3 */}
      <div className="section">
        <div className="section-1-title">
          <h2 className="desktop-h3 text-center">Why Tradesmen Love Using This</h2>
          <h3 className="desktop-h6 text-center">
            Get noticed, earn trust, and win more work — all from one simple page
          </h3>
        </div>

        <div className="section-1-content">
          <div className="section-1-left">
            <img src={WhyYouNeedThis} className="" />
          </div>

          <div className="section-1-right">
            <p className="desktop-h5">Look Pro. Build Trust. Book Jobs.</p>
            <p className="desktop-body">Everything you need to show off your work and get hired faster.</p>

            <div className="section-list">
              <div className="icon-white">
                <img src={IDCardIcon} className="icon" />
              </div>
              <div className="section-list-info">
                <p className="desktop-h6">Stand Out Fast</p>
                <p className="desktop-body-xs">Look sharp and professional — not like everyone else.</p>
              </div>
            </div>

            <div className="section-list">
              <div className="icon-white">
                <img src={ImagesIcon} className="icon" />
              </div>
              <div className="section-list-info">
                <p className="desktop-h6">Easy to Share</p>
                <p className="desktop-body-xs">Tap your card or send a link. No printing, no hassle.</p>
              </div>
            </div>

            <div className="section-list">
              <div className="icon-white">
                <img src={UpdateIcon} className="icon" />
              </div>
              <div className="section-list-info">
                <p className="desktop-h6">Show Your Work</p>
                <p className="desktop-body-xs">Add photos, reviews, and services to impress new clients.</p>
              </div>
            </div>

            <div className="section-list">
              <div className="icon-white">
                <img src={NFCIcon} className="icon" />
              </div>
              <div className="section-list-info">
                <p className="desktop-h6">Look Legit</p>
                <p className="desktop-body-xs">Your own page makes you look real and reliable — not just a name and number.</p>
              </div>
            </div>

            <div className="section-1-cta">
              <Link to="/register" className="black-button desktop-button margin-top-10">Get Started Free</Link>
            </div>
          </div>
        </div>
      </div>
      {/* SECTION 3 */}





      {/* SECTION 4 */}
      <div className="section">
        <div className="section-1-title">
          <h2 className='desktop-h3 text-center'>One Profile. Shared in Seconds.</h2>
          <h3 className='desktop-h6 text-center'>Tap it. Scan it. Link it. Your trade page goes anywhere</h3>
        </div>
        <div className="section-3-container-flex">
          <div className="section-3-container">
            <div className="section-3-1x1-image-info">
              <img src={Section3_Image1} className="" />
              <p className='desktop-h5 text-center'>NFC Business Card</p>
              <p className='desktop-body text-center'>Tap to share your details fast</p>
            </div>
            <div className="section-3-1x1-image-info">
              <img src={Section3_Image2} className="" />
              <p className='desktop-h5 text-center'>Apple & Google Wallet</p>
              <p className='desktop-body text-center'>Save your card on your phone</p>
            </div>
          </div>
          <div className="section-3-container">
            <div className="section-3-1x1-image-info">
              <img src={Section3_Image3} className="" />
              <p className='desktop-h5 text-center'>QR Code</p>
              <p className='desktop-body text-center'>Scan to open your full profile</p>
            </div>

            <div className="section-3-1x1-image-info">
              <img src={Section3_Image4} className="" />
              <p className='desktop-h5 text-center'>Link in Bio</p>
              <p className='desktop-body text-center'>One link for everything you offer</p>
            </div>
          </div>
        </div>
      </div>
      {/* SECTION 4 */}




      {/* SECTION 5 */}
      <div className="section-subscription">
        <p className='desktop-h3 text-center'>Our Plan</p>
        <p className='desktop-h6 text-center'>Start free for 7 days — only upgrade if it works for you.</p>

        <div className="subscription-container">
          <div className="subscription-div">
            <div className="subscription-title">
              <p className='desktop-h5'>Power Profile</p>
              <p className='desktop-body-s'>Everything you need to look pro and win more work</p>
            </div>

            <div className="subscription-info">
              <div className="hero-tick-container-down">
                {[
                  "Add a big photo banner at the top of your page",
                  "Write your own main heading and short message",
                  "Choose between light or dark background",
                  "Pick a font that fits your style",
                  "Show your name, job title, and profile photo",
                  "Upload photos of your best work",
                  "List your services and prices clearly",
                  "Add reviews from happy customers",
                  "Add your social media links",
                ].map((text, idx) => (
                  <div className="hero-tick" key={idx}>
                    <img src={TickIcon} className="icon" />
                    <p>{text}</p>
                  </div>
                ))}
              </div>

              <div className="subscription-price">
                <p className='desktop-body-xs' style={{ fontStyle: 'italic' }}>
                  Start free. Cancel anytime during your 7-day trial.
                </p>
                <div className='subscription-price-tag'>
                  <p style={{ fontSize: 18, fontWeight: 600 }}>£7.95</p>
                  <p className='light-black' style={{ fontSize: 12 }}>Per Month (after trial)</p>
                </div>
                <button className="primary-button" onClick={handleSubscribe}>
                  Subscribe Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* SECTION 5 */}




      {/* SECTION 6 */}
      <div className="section">
        <div className="section-1-title">
          <h2 className='desktop-h3 text-center'>Make Your Profile Work Harder with a Card</h2>
          <h3 className='desktop-h6 text-center'>Tap the card on most phones — your profile pops up in a flash.</h3>
        </div>
        <div className="section-3-container">
          <div className="section-3-1x1-image-info">
            <img src={PlasticCard} className="" />
            <div className="grey-box desktop-body-xs">1-month subscription included</div>
            <p className='desktop-h5 text-center'>Plastic NFC Card</p>
            <p className='desktop-body text-center'>Lightweight, Durable, Always Ready</p>
            <p style={{ fontSize: 18, fontWeight: 600, textAlign: 'center', marginTop: 10, marginBottom: 5 }}>£24.95</p>
            <Link to="/shopnfccards/plasticnfccard" style={{ display: 'flex', width: 'fit-content', margin: 'auto' }} className="black-button desktop-button margin-top-10">Buy Now</Link>
          </div>
          <div className="section-3-1x1-image-info">
            <img src={WoodenCard} className="" />
            <div className="grey-box desktop-body-xs">1-month subscription included</div>
            <p className='desktop-h5 text-center'>Bamboo NFC Card</p>
            <p className='desktop-body text-center'>Nature Meets Innovation</p>
            <p style={{ fontSize: 18, fontWeight: 600, textAlign: 'center', marginTop: 10, marginBottom: 5 }}>£29.95</p>
            <Link to="//shopnfccards/woodennfccard" style={{ display: 'flex', width: 'fit-content', margin: 'auto' }} className="black-button desktop-button margin-top-10">Buy Now</Link>
          </div>
        </div>
      </div>
      {/* SECTION 6 */}





      {/* SECTION 7 */}
      <div className="section">
        <div className="section-1-title">
          <h2 className="desktop-h3 text-center">Tradesmen Use It. Clients Love It.</h2>
          <h3 className="desktop-h6 text-center">
            See how real workers use their card and profile every day.
          </h3>
        </div>

        <div className="people-showcase-container">
          <div className="people-showcase-left">
            <img src={People} className="people-showcase-img" />
          </div>

          <div className="people-showcase-right">
            <div className="people-showcase-top">
              <div className="people-showcase-box">
                <img src={People} className="people-showcase-img" />
              </div>
              <div className="people-showcase-box">
                <img src={People} className="people-showcase-img" />
              </div>
            </div>
            <div className="people-showcase-bottom">
              <img src={People} className="people-showcase-img" />
            </div>
          </div>
        </div>
      </div>
      {/* SECTION 7 */}





      {/* SECTION 8 */}
      <div className="section">
        <div className="section-1-title">
          <h2 className='desktop-h3 text-center'>The #1 Tool Tradies Are Talking About</h2>
          <h3 className='desktop-h6 text-center'>
            Don’t take our word for it — see why tradespeople are switching to smarter, faster profiles.
          </h3>
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

        <div className='cta-center-text review-cta'>
          <p className='desktop-h6'>Check out more reviews</p>
          <Link to="/reviews" className="black-button desktop-button">Reviews</Link>
        </div>
      </div>
      {/* SECTION 8 */}





      {/* SECTION 9 */}
      <div className="section">
        <div className="section-1-title">
          <h2 className='desktop-h3 text-center'>Frequently Asked Questions</h2>
          <h3 className='desktop-h6 text-center'>For any other questions feel free to contact us at any time</h3>
        </div>
        <div className="faq-container">
          <div className="faq-column">
            <div className="section-list">
              <div className=" icon-white">
                <img src={IDCardIcon} className="icon" />
              </div>
              <div className="section-list-info">
                <p className='desktop-h6'>What is a Konar digital profile?</p>
                <p className='desktop-body-s'>It’s your own landing page showing your trade, services, photos, and contact details — all online.</p>
              </div>
            </div>
            <div className="section-list">
              <div className=" icon-white">
                <img src={NFCIcon} className="icon" />
              </div>
              <div className="section-list-info">
                <p className='desktop-h6'>Do I need an NFC card to use it?</p>
                <p className='desktop-body-s'>No. You can use and share your digital profile without ever buying a physical card.</p>
              </div>
            </div>
            <div className="section-list">
              <div className=" icon-white">
                <img src={PhoneIcon} className="icon" />
              </div>
              <div className="section-list-info">
                <p className='desktop-h6'>How do people view my profile?</p>
                <p className='desktop-body-s'>Share via link, QR code, or NFC tap — works instantly on most phones.</p>
              </div>
            </div>
            <div className="section-list">
              <div className=" icon-white">
                <img src={SetupIcon} className="icon" />
              </div>
              <div className="section-list-info">
                <p className='desktop-h6'>How do I set up my page?</p>
                <p className='desktop-body-s'>Just fill in your trade, upload photos, list services — done in under five minutes.</p>
              </div>
            </div>
            <div className="section-list">
              <div className=" icon-white">
                <img src={PencilIcon} className="icon" />
              </div>
              <div className="section-list-info">
                <p className='desktop-h6'>Can I update my page anytime?</p>
                <p className='desktop-body-s'>Yes. Log in from any device to update info, images, services, or pricing instantly.</p>
              </div>
            </div>
          </div>
          <div className="faq-column">
            <div className="section-list">
              <div className=" icon-white">
                <img src={WalletIcon} className="icon" />
              </div>
              <div className="section-list-info">
                <p className='desktop-h6'>What does it cost to use?</p>
                <p className='desktop-body-s'>We offer a free plan. Premium features unlock with our £5.95/month Power Profile subscription.</p>
              </div>
            </div>
            <div className="section-list">
              <div className=" icon-white">
                <img src={BoxIcon} className="icon" />
              </div>
              <div className="section-list-info">
                <p className='desktop-h6'>What happens if I lose my NFC card?</p>
                <p className='desktop-body-s'>Your page still works without the card. You can always reorder one if you want to keep tapping.</p>
              </div>
            </div>
            <div className="section-list">
              <div className=" icon-white">
                <img src={HatIcon} className="icon" />
              </div>
              <div className="section-list-info">
                <p className='desktop-h6'>Who is this for exactly?</p>
                <p className='desktop-body-s'>Any tradesperson who wants to get noticed, win more work, and look professional online.</p>
              </div>
            </div>
            <div className="section-list">
              <div className=" icon-white">
                <img src={PalletteIcon} className="icon" />
              </div>
              <div className="section-list-info">
                <p className='desktop-h6'>Can I customise the design and layout?</p>
                <p className='desktop-body-s'>Yes. Pick fonts, colours, and layouts to match your brand and make it yours.</p>
              </div>
            </div>
            <div className="section-list">
              <div className=" icon-white">
                <img src={LockIcon} className="icon" />
              </div>
              <div className="section-list-info">
                <p className='desktop-h6'>Is my personal data safe on here?</p>
                <p className='desktop-body-s'>Absolutely. You control everything shown, and your data is hosted securely at all times.</p>
              </div>
            </div>
          </div>
        </div>
        <div className="faq-cta">
          <p className='desktop-h6'>Got more questions?</p>
          <Link to="/faq" className="black-button desktop-button">Frequently Asked Questions</Link>
        </div>

      </div>
      {/* SECTION 9 */}


      <Footer />
    </>
  )
}