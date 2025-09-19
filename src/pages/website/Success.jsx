import React, { useEffect, useMemo, useState, useContext } from 'react';
import { Link } from 'react-router-dom';

import Sidebar from '../../components/Sidebar';
import PageHeader from '../../components/PageHeader';
import LogoIcon from '../../assets/icons/Logo-Icon.svg';
import api from '../../services/api';
import { AuthContext } from '../../components/AuthContext';

function formatAmount(amount, currency = 'gbp') {
  if (typeof amount !== 'number') return '—';
  const value = amount / 100;
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export default function SuccessCard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1000);
  const [isSmallMobile, setIsSmallMobile] = useState(window.innerWidth <= 600);

  const { user: authUser } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  useEffect(() => {
    const onResize = () => {
      const m = window.innerWidth <= 1000;
      const sm = window.innerWidth <= 600;
      setIsMobile(m);
      setIsSmallMobile(sm);
      if (!m && sidebarOpen) setSidebarOpen(false);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [sidebarOpen]);

  useEffect(() => {
    if (sidebarOpen && isMobile) document.body.classList.add('body-no-scroll');
    else document.body.classList.remove('body-no-scroll');
  }, [sidebarOpen, isMobile]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setErr('');
        const res = await api.get('/me/orders');
        const list = Array.isArray(res?.data?.data) ? res.data.data : [];
        if (mounted) setOrders(list);
      } catch (e) {
        if (mounted)
          setErr(
            e?.response?.data?.error || 'Could not load your order.'
          );
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [authUser]);

  const latestCardOrder = useMemo(() => {
    const cards = (orders || []).filter(
      (o) => (o.type || '').toLowerCase() === 'card'
    );
    if (!cards.length) return null;
    return cards.sort(
      (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    )[0];
  }, [orders]);

  const amountPaid = useMemo(() => {
    if (!latestCardOrder) return '—';
    return formatAmount(
      typeof latestCardOrder.amountTotal === 'number'
        ? latestCardOrder.amountTotal
        : 0,
      latestCardOrder.currency || 'gbp'
    );
  }, [latestCardOrder]);

  const quantity =
    latestCardOrder?.quantity ??
    latestCardOrder?.metadata?.quantity ??
    1;
  const status = (latestCardOrder?.status || 'paid').toLowerCase();
  const orderId =
    latestCardOrder?._id || latestCardOrder?.id || '—';

  const estimatedDelivery =
    latestCardOrder?.metadata?.estimatedDelivery || '—';
  const deliveryAddress =
    latestCardOrder?.metadata?.deliveryAddress || null;

  return (
    <div className={`app-layout ${sidebarOpen ? 'sidebar-active' : ''}`}>
      <div className="myprofile-mobile-header">
        <Link to="/" className="myprofile-logo-link">
          <img src={LogoIcon} alt="Logo" className="myprofile-logo" />
        </Link>
        <button
          className={`sidebar-menu-toggle ${sidebarOpen ? 'active' : ''}`}
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {sidebarOpen && isMobile && (
        <div
          className="sidebar-overlay active"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <main className="main-content-container">
        <PageHeader
          title="Order"
          isMobile={isMobile}
          isSmallMobile={isSmallMobile}
        />

        <div className="success-container">
          {loading ? (
            <p>Confirming your payment…</p>
          ) : err ? (
            <p style={{ color: '#b91c1c' }}>{err}</p>
          ) : (
            <div className="success-box">
              <h2 className="desktop-h4 success-header">
                Payment Successful!
              </h2>
              <p
                className="desktop-body"
                style={{ margin: 0, color: '#555' }}
              >
                Thank you for your order. Your smart card is on its way.
              </p>

              <div className="success-grid">
                <div className="info-tile">
                  <p className="desktop-body-s label">Amount paid</p>
                  <p className="desktop-h5 value">{amountPaid}</p>
                </div>
                <div className="info-tile">
                  <p className="desktop-body-s label">
                    Estimated delivery date
                  </p>
                  <p className="desktop-h5 value">
                    {estimatedDelivery}
                  </p>
                </div>
              </div>

              <div className="success-buttons">
                <Link
                  to="/"
                  className="cta-black-button desktop-button"
                >
                  Go to Home
                </Link>
                <Link
                  to="/myprofile"
                  className="cta-blue-button desktop-button"
                >
                  Go to Your Dashboard
                </Link>
                <Link
                  to="/myorders"
                  className="cta-black-button desktop-button"
                >
                  View Orders
                </Link>
              </div>

              <hr className="divider" />

              <div className="kv">
                <div className="kv-row">
                  <span className="desktop-body-s kv-label">
                    Order ID
                  </span>
                  <span className="desktop-body-s kv-value">
                    {orderId}
                  </span>
                </div>

                <div className="kv-row">
                  <span className="desktop-body-s kv-label">
                    Quantity
                  </span>
                  <span className="desktop-body-s kv-value">
                    {quantity}
                  </span>
                </div>

                <div className="kv-row">
                  <span className="desktop-body-s kv-label">
                    Price Paid
                  </span>
                  <span className="desktop-body-s kv-value">
                    {amountPaid}
                  </span>
                </div>

                {deliveryAddress && (
                  <div className="kv-row">
                    <span className="desktop-body-s kv-label">
                      Delivery Address
                    </span>
                    <span className="desktop-body-s kv-value">
                      {deliveryAddress}
                    </span>
                  </div>
                )}

                <div className="kv-row">
                  <span className="desktop-body-s kv-label">
                    Created
                  </span>
                  <span className="desktop-body-s kv-value">
                    {latestCardOrder?.createdAt
                      ? new Date(
                        latestCardOrder.createdAt
                      ).toLocaleString()
                      : '—'}
                  </span>
                </div>
                <div className="kv-row">
                  <span className="desktop-body-s kv-label">
                    Status
                  </span>
                  <span className="desktop-body-s kv-value status-text">
                    {status}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
