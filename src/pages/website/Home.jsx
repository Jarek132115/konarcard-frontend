import React, { useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import NewBackground from '../../assets/images/New-Background.jpg';
import BackgroundHero from '../../assets/images/background-hero.png';
import Section1Image from '../../assets/images/Section-1-Image.png';
import TickIcon from '../../assets/icons/Tick-Icon.svg';
import FormCustomizationIcon from '../../assets/icons/FormCustomization-Icon.svg';
import CustomizationIcon from '../../assets/icons/Customization-Icon.svg';
import BoltIcon from '../../assets/icons/Bolt-Icon.svg';
import IDCardIcon from '../../assets/icons/IDCard-Icon.svg';
import ImagesIcon from '../../assets/icons/Images-Icon.svg';
import UpdateIcon from '../../assets/icons/Update-Icon.svg';
import NFCIcon from '../../assets/icons/NFC-Icon.svg';
import Section3_Image1 from '../../assets/images/Section3-Image1.png';
import Section3_Image2 from '../../assets/images/Section3-Image2.png';
import Section3_Image3 from '../../assets/images/Section3-Image3.png';
import Section3_Image4 from '../../assets/images/Section3-Image4.png';
import EditProfile from '../../assets/images/Edit-Profile.jpg';
import WhyYouNeedThis from '../../assets/images/WhyYouNeedThis.png';
import People from '../../assets/images/People.png';
import PlasticCard from '../../assets/images/PlasticCard.png';
import ReviewStars from '../../assets/icons/Stars-Icon.svg';
import ReviewPerson from '../../assets/images/Review-Person.png';
import SetupIcon from '../../assets/icons/Setup-Icon.svg';
import BoxIcon from '../../assets/icons/Box-Icon.svg';
import PalletteIcon from '../../assets/icons/Pallette-Icon.svg';
import HatIcon from '../../assets/icons/Hat-Icon.svg';
import LockIcon from '../../assets/icons/Lock-Icon.svg';
import PencilIcon from '../../assets/icons/Pencil-Icon.svg';
import PhoneIcon from '../../assets/icons/Phone-Icon.svg';
import WalletIcon from '../../assets/icons/Wallet-Icon.svg';
import Profile1 from '../../assets/images/Profile1.png';
import Profile2 from '../../assets/images/Profile2.png';
import Profile3 from '../../assets/images/Profile3.png';
import Profile4 from '../../assets/images/Profile4.png';
import Profile5 from '../../assets/images/Profile5.png';
import NFCBusinessCard from '../../assets/images/NFC-Business-Card.jpg';
import QRCode from '../../assets/images/QR-Code.jpg';
import ScanQRCode from '../../assets/images/ScanQR-Code.jpg';
import LinkInBio from '../../assets/images/LinkInBio.jpg';
import SMSSend from '../../assets/images/SMSSend.jpg';
import pp1 from '../../assets/images/pp1.png'
import pp2 from '../../assets/images/pp2.png'
import pp3 from '../../assets/images/pp3.png'
import { AuthContext } from '../../components/AuthContext';
import api from '../../services/api';
import { toast } from 'react-hot-toast';


export default function Home() {
  const { user, loading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const isSubscribed = user ? user.isSubscribed : false;
  const loadingStatus = authLoading;

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

    if (isSubscribed) {
      toast.info('You are already subscribed to the Power Profile.');
      return;
    }

    try {
      const res = await api.post('/subscribe', {
        returnUrl: window.location.origin + '/SuccessSubscription',
      });

      const { url } = res.data;

      if (url) {
        window.location.href = url;
      } else {
        toast.error('Could not start subscription. Please try again.');
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Subscription failed. Please try again.');
    }
  };


  return (
    <>
      <Navbar />

      <div className="home-hero">
        <div className="hero-container">
          <div className="hero-left">
            <h1 className="desktop-h1 hero-heading">Stand Out. Get Noticed. Grow Your <span className='blue'>Business.</span></h1>
            <p style={{ fontWeight: 600 }} className="desktop-h6 desktop-body">
              Build a professional profile that gets you noticed, and share it effortlessly through your Konar Card with a single tap.</p>

            <div className="hero-cta">
              {/* REVISED: This CTA now links to the main pricing page to present all options. */}
              <Link to="/productandplan" className="cta-blue-button desktop-button">View Plans & Cards</Link>
              <Link to="/productandplan/konarsubscription" className="cta-black-button desktop-button">
                See How It Works
              </Link>
            </div>
            <div className="hero-social-proof">
              <div className="hero-avatars">
                <img src={pp1} alt="User 1" className="avatar" />
                <img src={pp2} alt="User 2" className="avatar" />
                <img src={pp3} alt="User 3" className="avatar" />
              </div>
              <div className='avatar-text'>
                <p style={{fontWeight: 900}} className="desktop-h6">1k+</p>
                <p className="desktop-body-xs light-black">Trusted by 1,000+ tradies</p>
              </div>
            </div>
          </div>

          <div className="hero-right">
            <video
              className="hero-video-element"
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              role="img"
              aria-label="Hero Animation showing a phone profile with transparent background"
              width="812"
              height="500"
            >
              <source src="/videos/Hero-GIF.webm" type="video/webm" />
              <source src="/videos/Hero-Video.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      </div>


      <div className="full-width-bg-container section-bg-grey first-section-after-hero">
        <div className="section">
          <div className="section-1-title">
            <h2 className="desktop-h3 text-center">Your Professional Page. Built for Your Trade.</h2>
            <h3 className="desktop-h6 text-center">Showcase your skills, earn trust, and win more work all from one powerful page.</h3>
          </div>

          <div className="section-1-content">
            <div className="section-1-left">
              <img src={Section1Image} className="" />
            </div>

            <div className="section-1-right">
              <p className="desktop-h5">Stand Out with a Professional Digital Profile</p>
              <p className="desktop-body">We've built a landing page specifically for tradespeople. It's a single, professional page that showcases your skills, services, and best work.</p>

              <div className="section-list">
                <div className="icon-white">
                  <img src={BoltIcon} className="icon" />
                </div>
                <div className="section-list-info">
                  <p className="desktop-h6">Ready in Minutes</p>
                  <p className="desktop-body-xs">Quickly build your profile with a few clicks.</p>
                </div>
              </div>

              <div className="section-list">
                <div className="icon-white">
                  <img src={CustomizationIcon} className="icon" />
                </div>
                <div className="section-list-info">
                  <p className="desktop-h6">Showcase Your Best Work</p>
                  <p className="desktop-body-xs">Add photos, customer reviews, and a list of your services.</p>
                </div>
              </div>

              <div className="section-list">
                <div className="icon-white">
                  <img src={FormCustomizationIcon} className="icon" />
                </div>
                <div className="section-list-info">
                  <p className="desktop-h6">Control Your Brand</p>
                  <p className="desktop-body-xs">Easily update your details, images, and contact info anytime.</p>
                </div>
              </div>

              <div className="section-1-cta">
                <p style={{ fontStyle: 'italic' }} className='desktop-body-xs'>*No Credit Card Required*</p>
                <Link to="/register" className="black-button desktop-button">Start Your Free 14-Day Trial</Link>
              </div>
            </div>
          </div>
        </div>
      </div>


      <div className="section">
        <div className="section-1-title">
          <h2 className="desktop-h3 text-center">Your Digital Profile Meets the Real World.</h2>
          <h3 className="desktop-h6 text-center">The NFC card is your key. The digital profile is your pitch.</h3>
        </div>

        <div className="section-1-content">
          <div className="section-1-left">
            <img src={EditProfile} className="" />
          </div>

          <div className="section-1-right">
            <p className="desktop-h5">Share Your Profile in Seconds.</p>
            <p className="desktop-body">Build a simple, powerful page that makes you look professional and ready for work.</p>

            <div className="section-list">
              <div className="icon-white">
                <img src={IDCardIcon} className="icon" />
              </div>
              <div className="section-list-info">
                <p className="desktop-h6">Tap, Scan, and Share</p>
                <p className="desktop-body-xs">Simply tap your NFC card or show your QR code to instantly share your profile.</p>
              </div>
            </div>

            <div className="section-list">
              <div className="icon-white">
                <img src={ImagesIcon} className="icon" />
              </div>
              <div className="section-list-info">
                <p className="desktop-h6">No App? No Problem</p>
                <p className="desktop-body-xs">Clients don't need an app. Your page opens instantly on any smartphone.</p>
              </div>
            </div>

            <div className="section-list">
              <div className="icon-white">
                <img src={UpdateIcon} className="icon" />
              </div>
              <div className="section-list-info">
                <p className="desktop-h6">Effortless Updates</p>
                <p className="desktop-body-xs">Any changes you make to your profile update in real-time, no need for new cards.</p>
              </div>
            </div>

            <div className="section-1-cta">
              <p style={{ fontStyle: 'italic' }} className='desktop-body-xs'>*No Credit Card Required*</p>
              <Link to="/register" className="black-button desktop-button">Start Your Free 14-Day Trial</Link>
            </div>
          </div>
        </div>
      </div>

      <div className="full-width-bg-container section-bg-grey">
        <div className="section">
          <div className="section-1-title">
            <h2 className='desktop-h3 text-center'>Why Tradesmen Love Using This</h2>
            <h3 className='desktop-h6 text-center'>Show off your work, get great reviews, and win more jobs from one professional page.</h3>
          </div>
          <div className="section-1-content">
            <div className="section-1-left">
              <img src={WhyYouNeedThis} className="" />
            </div>
            <div className="section-1-right">
              <p className="desktop-h5">Look Pro. Build Trust. Book Jobs.</p>
              <p className="desktop-body">Everything you needed to show off your work and get hired faster.</p>

              <div className="section-list">
                <div className="icon-white">
                  <img src={ImagesIcon} className="icon" />
                </div>
                <div className="section-list-info">
                  <p className="desktop-h6">Saves You Money</p>
                  <p className="desktop-body-xs">Stop wasting money on reprinting paper cards and expensive websites. This is a one-time investment.</p>
                </div>
              </div>

              <div className="section-list">
                <div className="icon-white">
                  <img src={UpdateIcon} className="icon" />
                </div>
                <div className="section-list-info">
                  <p className="desktop-h6">Stand Out from the Rest</p>
                  <p className="desktop-body-xs">Impress clients with a modern, professional digital page that sets you apart from the competition.</p>
                </div>
              </div>

              <div className="section-list">
                <div className="icon-white">
                  <img src={NFCIcon} className="icon" />
                </div>
                <div className="section-list-info">
                  <p className="desktop-h6">Never Miss a Lead</p>
                  <p className="desktop-body-xs">Share your profile instantly with a simple tap, scan, or link, so you can capture every new client on the spot.</p>
                </div>
              </div>

              <div className="section-1-cta">
                <p style={{ fontStyle: 'italic' }} className='desktop-body-xs'>*No Credit Card Required*</p>
                <Link to="/register" className="black-button desktop-button">Start Your Free 14-Day Trial</Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="section">
        <div className="section-1-title">
          <h2 className='desktop-h3 text-center'>One Profile. Shared in Seconds.</h2>
          <h3 className='desktop-h6 text-center'>Tap it. Scan it. Link it. Your trade page goes anywhere</h3>
        </div>
        <div className="section-3-container-flex">
          <div className="section-3-container">
            <div className="section-3-1x1-image-info">
              <img src={NFCBusinessCard} className="" />
              <p className='desktop-h5 text-center'>NFC Business Card</p>
              <p className='desktop-body text-center'>Tap to share your details fast</p>
            </div>
            <div className="section-3-1x1-image-info">
              <img src={SMSSend} className="" />
              <p className='desktop-h5 text-center'>Share Via Message</p>
              <p className='desktop-body text-center'>WhatsApp, SMS, Messenger & more</p>
            </div>
          </div>
          <div className="section-3-container">
            <div className="section-3-1x1-image-info">
              <img src={ScanQRCode} className="" />
              <p className='desktop-h5 text-center'>QR Code</p>
              <p className='desktop-body text-center'>Scan to open your full profile</p>
            </div>

            <div className="section-3-1x1-image-info">
              <img src={LinkInBio} className="" />
              <p className='desktop-h5 text-center'>Link in Bio</p>
              <p className='desktop-body text-center'>One link for everything you offer</p>
            </div>
          </div>
        </div>
      </div>

      <div className="full-width-bg-container section-bg-grey">
        <div className="section">
          <div className="section-1-title">
            <h2 className='desktop-h2 text-center'>Our Plans & Cards</h2>
            <h3 className='desktop-h6 text-center'>Choose what's right for your business.</h3>
          </div>
          <div className="combined-offer-container">
            <div className="subscription-offer-left">
              <div className="subscription-header">
                <p className='desktop-h5'>Power Profile</p>
                <div className="free-trial-badge">14 Day Free Trial</div>
              </div>
              <p className='desktop-body-s subscription-subheader'>Create a stunning, professional profile in minutes. No coding needed.</p>

              <div className="subscription-features">
                {[
                  "Update anytime, instantly",
                  "Choose your own font",
                  "Select Light or Dark mode",
                  "Craft your 'About Me' section",
                  "Showcase your work portfolio",
                  "Display client reviews",
                  "List your services",
                  "Set your pricing",
                ].map((text, idx) => (
                  <div className="hero-tick" key={idx}>
                    <img src={TickIcon} className="icon" />
                    <p>{text}</p>
                  </div>
                ))}
              </div>

              <p className='desktop-body-s subscription-description-footer'>
                "The perfect tool for tradesmen to make an unforgettable first impression and get new clients."
              </p>

              <div className="subscription-price-cta">
                <div className='price-display'>
                  <p className='desktop-h5'>£7.95</p>
                  <p className='light-black' style={{ fontSize: 14 }}>Per Month</p>
                </div>
                <Link to="/productandplan/konarsubscription" className="desktop-button combined-section-button black-button">
                  View Subscription Details
                </Link>
              </div>
            </div>

            <div className="card-offer-right">
              <div className="product-header">
                <p className='desktop-h5'>Plastic NFC Card</p>
                <div className="free-trial-badge product-header-badge">12 Month Warranty</div>
              </div>
              <p className='desktop-body-s product-subheader'>Lightweight, Durable, Always Ready</p>
              <p className='desktop-body-xs product-optional-sentence'>This product is optional, buy one to stand out.</p>

              <img src={PlasticCard} className="product-image" />

              <p className='desktop-body-s subscription-description-footer'>
                "For those who want to stand out above those who already stand out!"
              </p>

              <div className="product-price-cta">
                <div className='price-display'>
                  <p className='desktop-h5'>£24.95</p>
                  <p className='light-black' style={{ fontSize: 14 }}>Lifetime Use</p>
                </div>
                <Link to="/productandplan/konarcard" className="desktop-button combined-section-button black-button">
                  View Card Details
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="section">
        <div className="section-1-title">
          <h2 className="desktop-h3 text-center">Tradesmen Use It. Clients Love It.</h2>
          <h3 className="desktop-h6 text-center">
            Don’t take our word for it — see why tradespeople are switching to smarter, faster profiles.
          </h3>
        </div>

        <div className="people-showcase-container-flex">

          <div className="people-showcase-left-col">
            <img src={People} className="people-showcase-img" alt="Tradesman holding Konar Card" />
          </div>

          <div className="people-showcase-right-col">
            <div className="people-showcase-top-row-flex">
              <div className="people-showcase-box">
                <img src={People} className="people-showcase-img" alt="Tradesman showing Konar Card" />
              </div>
              <div className="people-showcase-box">
                <img src={People} className="people-showcase-img" alt="Woman holding Konar Card" />
              </div>
            </div>

            <div className="people-showcase-bottom-single">
              <img src={People} className="people-showcase-img" alt="Group of tradesmen holding Konar Cards" />
            </div>
          </div>
        </div>
      </div>

      <div className="full-width-bg-container section-bg-grey">
        <div className="section">
          <div className="section-1-title">
            <h2 className='desktop-h2 text-center'>The #1 Tool Tradies Are Talking About</h2>
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
          <div className="faq-cta">
            <Link to="/reviews" className="black-button desktop-button">Read More Reviews</Link>
          </div>
        </div>
      </div>

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
          <Link to="/faq" className="black-button desktop-button">Got more questions?</Link>
        </div>
      </div>

      <Footer />
    </>
  );
}