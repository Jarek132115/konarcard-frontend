// frontend/src/pages/ProductAndPlan/KonarCard.jsx
import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Breadcrumbs from '../../components/Breadcrumbs';
import Footer from '../../components/Footer';
import ReviewStars from '../../assets/icons/Stars-Icon.svg';
import { toast } from 'react-hot-toast';

import pp1 from '../../assets/images/pp1.png';
import pp2 from '../../assets/images/pp2.png';
import pp3 from '../../assets/images/pp3.png';
import pp4 from '../../assets/images/pp4.png';

import ProductCover from '../../assets/images/Product-Cover.png';
import ProductImage1 from '../../assets/images/Product-Image-1.png';
import ProductImage2 from '../../assets/images/Product-Image-2.png';
import ProductImage3 from '../../assets/images/Product-Image-3.png';
import ProductImage4 from '../../assets/images/Product-Image-4.png';

import { AuthContext } from '../../components/AuthContext';
import api from '../../services/api';

/* Stripe (lazy import) */
const STRIPE_PK =
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ||
  'pk_live_51RPmTAP7pC1ilLXASjenuib1XpQAiuBOxcUuYbeQ35GbhZEVi3V6DRwriLetAcHc3biiZ6dlfzz1fdvHj2wvj1hS00lHDjoAu8';

let stripePromiseCache = null;
async function getStripe() {
  if (!stripePromiseCache) {
    const { loadStripe } = await import('@stripe/stripe-js');
    stripePromiseCache = loadStripe(STRIPE_PK);
  }
  return stripePromiseCache;
}

export default function KonarCard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useContext(AuthContext);

  const [quantity, setQuantity] = useState(1);
  const [mainImage, setMainImage] = useState(ProductCover);

  const pricePerCard = 24.95;
  const originalPricePerCard = 29.95;

  const thumbnails = [ProductCover, ProductImage1, ProductImage2, ProductImage3, ProductImage4];

  const startCheckout = useCallback(async (qty) => {
    try {
      const stripe = await getStripe();
      const res = await api.post('/api/checkout/create-checkout-session', { quantity: qty });
      const sessionId = res?.data?.id;
      if (!sessionId) {
        toast.error(res?.data?.error || 'Could not start checkout. Please try again.');
        return;
      }
      const result = await stripe.redirectToCheckout({ sessionId });
      if (result.error) toast.error(result.error.message);
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Checkout failed. Please try again.');
    }
  }, []);

  const handleBuyNow = async () => {
    if (!user) {
      navigate('/register', {
        state: { postAuthAction: { type: 'buy_card', payload: { quantity } } },
      });
      return;
    }
    await startCheckout(quantity);
  };

  useEffect(() => {
    if (location.state?.triggerCheckout) {
      const qty = Number(location.state?.quantity) || quantity;
      setQuantity(qty);
      navigate(location.pathname, { replace: true });
      startCheckout(qty);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

  // Delivery window text
  const getDeliveryDates = () => {
    const today = new Date();
    const start = new Date(today); start.setDate(today.getDate() + 1);
    const end = new Date(today); end.setDate(today.getDate() + 4);
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const short = (d) => monthNames[d.getMonth()].slice(0, 3);
    const sameMonth = start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear();
    if (sameMonth) return `${start.getDate()}–${end.getDate()} ${monthNames[start.getMonth()]}`;
    const sameYear = start.getFullYear() === end.getFullYear();
    if (sameYear) return `${start.getDate()} ${short(start)} – ${end.getDate()} ${short(end)}`;
    return `${start.getDate()} ${short(start)} ${start.getFullYear()} – ${end.getDate()} ${short(end)} ${end.getFullYear()}`;
  };
  const deliveryDateText = getDeliveryDates();

  /* Feature bullets (orange dots + copy) */
  const featureBullets = [
    { title: 'Compatibility', text: 'Compatible with Android & iPhone' },
    { title: 'QR Code Backup', text: 'If NFC doesn’t work, scan the QR' },
    { title: 'Warranty', text: '12-month warranty' },
    { title: 'Fast Transfer', text: 'Share details with one tap' },
    { title: 'Chip & Memory', text: 'NTAG215 chip, 504 bytes' },
    { title: 'Data Retention', text: 'Stores securely 10+ years' },
    { title: 'Size & Material', text: '85.5 × 54 × 0.8 mm, PVC' },
    { title: 'Eco-Friendly', text: 'Made from recyclable materials' },
  ];

  /* FAQs (rendered as dot items to match subscription page) */
  const faqsLeft = [
    {
      title: 'What is the Konar NFC business card?',
      text: 'A reusable card with a tiny NFC chip that opens your Konar profile with a tap—no app, no battery.',
    },
    {
      title: 'How does the tap actually work?',
      text: 'The phone’s NFC reader powers the chip and instantly launches your live profile link.',
    },
    {
      title: 'What if someone can’t tap?',
      text: 'Every card includes a QR code and your profile has a shareable link — there’s always a backup.',
    },
    {
      title: 'Will it work with their phone?',
      text: 'Works on iPhone 7+ and most Android phones with NFC enabled. QR works on any camera phone.',
    },
  ];

  const faqsRight = [
    {
      title: 'Is the NFC chip visible?',
      text: 'No — it’s sealed inside the card and doesn’t affect the finish or design.',
    },
    {
      title: 'How long does the card last?',
      text: 'Years of everyday use. There’s no battery to die and nothing to charge.',
    },
    {
      title: 'When will my card arrive?',
      text: 'Production 2–4 business days. Standard delivery 3–7 business days; Express 1–3 business days.',
    },
    {
      title: 'What’s included in the warranty?',
      text: '12-month limited warranty covering manufacturing defects, faulty chips and printing errors.',
    },
  ];

  return (
    <>
      <Navbar />
      <div style={{ marginTop: 20 }} className="section-breadcrumbs">
        <Breadcrumbs />
      </div>

      {/* Product header */}
      <div className="section product-shell">
        {/* LEFT: product image + thumbs */}
        <div className="pd-left">
          <div className="pd-card-tray">
            <div className="pd-card">
              <img src={mainImage} alt="Konar Card" />
            </div>
          </div>

          <div className="pd-thumbs">
            {thumbnails.map((t, i) => (
              <button
                key={i}
                type="button"
                className={`pd-thumb ${mainImage === t ? 'is-active' : ''}`}
                onClick={() => setMainImage(t)}
                aria-label={`View image ${i + 1}`}
              >
                <img src={t} alt={`Thumbnail ${i + 1}`} />
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT: copy, bullets, price, CTA */}
        <div className="pd-right">
          <h1 className="pd-title desktop-h4">Konar Card — <span className="orange">White Edition</span></h1>
          <p className="pd-sub desktop-body">
            Stand out and win more jobs — one tap opens your profile with your services, photos, and contact details.
          </p>

          {/* Bullets (orange dot + copy) */}
          <div className="pd-feature-grid">
            {featureBullets.map((f, idx) => (
              <div className="pd-feature-item" key={idx}>
                <span className="pd-dot" aria-hidden="true" />
                <div className="pd-feature-copy">
                  <p className="pd-feature-title desktop-body-s">{f.title}</p>
                  <p className="pd-feature-text desktop-body-xs">{f.text}</p>
                </div>
              </div>
            ))}

            {/* Delivery row (dot style too) */}
            <div className="pd-feature-item pd-feature-item--full">
              <span className="pd-dot" aria-hidden="true" />
              <div className="pd-feature-copy">
                <p className="pd-feature-title desktop-body-s">Ships within 24h</p>
                <p className="desktop-body-xs" style={{ color: '#666' }}>
                  Estimated delivery: {deliveryDateText}
                </p>
              </div>
            </div>
          </div>

          <div className="pd-meta-row">
            <div className="pd-stars">
              <img src={ReviewStars} alt="Rating" />
              <span className="pd-reviews-count light-black">(229)</span>
            </div>

            <div className="pd-price-wrap">
              <span className="pd-price-now">£{(pricePerCard * quantity).toFixed(2)}</span>
              <span className="pd-price-was">£{(originalPricePerCard * quantity).toFixed(2)}</span>
            </div>
          </div>

          <div className="pd-cta-row">
            <div className="pd-qty">
              <span className="desktop-body-xs">Qty</span>
              <div className="pd-qty-ctrl">
                <button
                  className="pd-qty-btn"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <div className="pd-qty-display">{quantity}</div>
                <button
                  className="pd-qty-btn"
                  onClick={() => setQuantity((q) => q + 1)}
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
            </div>

            <button onClick={handleBuyNow} className="orange-button desktop-button pd-buy-full">
              Buy Now
            </button>
          </div>
        </div>
      </div>

      {/* ===== Reviews (match subscription design) ===== */}
      <div className="section">
        <div className="section-1-title">
          <h2 className="desktop-h3 text-center">
            See How <span className="orange">Tradies</span> Put Konar To <span className="orange">Work</span>
          </h2>
          <h3 className="desktop-body-xs text-center">
            Don’t take our word for it — see why tradespeople are switching to smarter, faster profiles.
          </h3>
        </div>
        <div className="review-container-box">
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
                    <p className="desktop-body-xs grey">Plumber</p>
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
                    <p className="desktop-body-xs grey">Electrician</p>
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
                    <p className="desktop-body-xs grey">Builder</p>
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
                    <p className="desktop-body-xs grey">Roofer</p>
                    <p className="desktop-body-s">Sam H</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== Product FAQs (dot style to match subscription page) ===== */}
      <div className="section">
        <div className="section-1-title">
          <h2 className="desktop-h3 text-center">Konar Card — Product <span className="orange">FAQs</span></h2>
          <h3 className="desktop-body-xs text-center">Everything about the card, tap-to-share, delivery and warranty.</h3>
        </div>

        <div className="faq-container">
          <div className="faq-column">
            {faqsLeft.map((f, i) => (
              <div key={i} className="pd-feature-item pd-feature-item--full" style={{ marginBottom: 16 }}>
                <span className="pd-dot" aria-hidden="true" />
                <div className="pd-feature-copy">
                  <p className="desktop-h6">{f.title}</p>
                  <p className="desktop-body-s">{f.text}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="faq-column">
            {faqsRight.map((f, i) => (
              <div key={i} className="pd-feature-item pd-feature-item--full" style={{ marginBottom: 16 }}>
                <span className="pd-dot" aria-hidden="true" />
                <div className="pd-feature-copy">
                  <p className="desktop-h6">{f.title}</p>
                  <p className="desktop-body-s">{f.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
