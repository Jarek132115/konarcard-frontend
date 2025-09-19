// src/pages/website/SuccessSubscription.jsx
import React, { useEffect, useMemo, useState, useContext } from 'react';
import { Link } from 'react-router-dom';

import Sidebar from '../../components/Sidebar';
import PageHeader from '../../components/PageHeader';
import LogoIcon from '../../assets/icons/Logo-Icon.svg';
import api from '../../services/api';
import { AuthContext } from '../../components/AuthContext';

function formatAmount(amount, currency = 'gbp') {
    if (typeof amount !== 'number') return '—';
    const value = amount / 100; // Stripe smallest unit
    return new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency: currency.toUpperCase(),
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value);
}

export default function SuccessSubscription() {
    // Interface shell state (same as MyOrders for consistent look)
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 1000);
    const [isSmallMobile, setIsSmallMobile] = useState(window.innerWidth <= 600);

    // Data
    const { user: authUser } = useContext(AuthContext);
    const [profile, setProfile] = useState(authUser || null);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState('');

    // Responsive listeners
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

    // Load profile (if context wasn’t ready) + orders
    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                setLoading(true);
                setErr('');

                // If context has user use it, else fetch
                if (!authUser) {
                    const p = await api.get('/profile', { params: { ts: Date.now() } });
                    if (mounted) setProfile(p?.data?.data || null);
                } else {
                    setProfile(authUser);
                }

                // Load orders to find latest subscription
                const res = await api.get('/me/orders');
                const list = Array.isArray(res?.data?.data) ? res.data.data : [];
                if (mounted) setOrders(list);
            } catch (e) {
                if (mounted) setErr(e?.response?.data?.error || 'Could not load your subscription details.');
            } finally {
                if (mounted) setLoading(false);
            }
        })();
        return () => { mounted = false; };
    }, [authUser]);

    // Pick the most recent subscription order
    const latestSub = useMemo(() => {
        const subs = (orders || []).filter(o => (o.type || '').toLowerCase() === 'subscription');
        if (!subs.length) return null;
        // assume orders are not guaranteed sorted
        return subs.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))[0];
    }, [orders]);

    const amountPaid = useMemo(() => {
        if (!latestSub) return '—';
        // show zero as £0.00 too
        return formatAmount(
            typeof latestSub.amountTotal === 'number' ? latestSub.amountTotal : 0,
            latestSub.currency || 'gbp'
        );
    }, [latestSub]);

    const trialUntil = useMemo(() => {
        const t = profile?.trialExpires ? new Date(profile.trialExpires) : null;
        if (!t || Number.isNaN(+t)) return '—';
        return t.toLocaleString();
    }, [profile]);

    return (
        <div className={`app-layout ${sidebarOpen ? 'sidebar-active' : ''}`}>
            {/* Mobile header (same as interface pages) */}
            <div className="myprofile-mobile-header">
                <Link to="/" className="myprofile-logo-link">
                    <img src={LogoIcon} alt="Logo" className="myprofile-logo" />
                </Link>
                <button
                    className={`sidebar-menu-toggle ${sidebarOpen ? 'active' : ''}`}
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
                >
                    <span></span><span></span><span></span>
                </button>
            </div>

            {/* Sidebar (interface look) */}
            <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            {sidebarOpen && isMobile && (
                <div className="sidebar-overlay active" onClick={() => setSidebarOpen(false)} />
            )}

            {/* Main */}
            <main className="main-content-container">
                <PageHeader
                    title="Subscription"
                    isMobile={isMobile}
                    isSmallMobile={isSmallMobile}
                />

                {/* Card styled like your interface “content-card-box” */}
                <div
                    className="content-card-box"
                    style={{
                        maxWidth: 700,
                        width: '100%',
                        margin: '5px auto 0',
                        textAlign: 'left',
                    }}
                >
                    {loading ? (
                        <p>Activating your subscription…</p>
                    ) : err ? (
                        <p style={{ color: '#b91c1c' }}>{err}</p>
                    ) : (
                        <>
                            <h2 className="desktop-h4" style={{ marginTop: 0, marginBottom: 8 }}>
                                Konar Profile Plan
                            </h2>
                            <p className="desktop-body" style={{ margin: 0, color: '#555' }}>
                                Your subscription is <strong>{(latestSub?.status || 'Active')}</strong>.
                            </p>

                            <div
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: '1fr 1fr',
                                    gap: 12,
                                    marginTop: 16,
                                }}
                            >
                                <div
                                    style={{
                                        background: 'var(--card-bg, #F7F7F7)',
                                        border: '1px solid rgba(0,0,0,.08)',
                                        borderRadius: 12,
                                        padding: 14,
                                    }}
                                >
                                    <p className="desktop-body-s" style={{ margin: 0, color: '#666' }}>
                                        Amount paid today
                                    </p>
                                    <p className="desktop-h5" style={{ margin: 0 }}>
                                        {amountPaid}
                                    </p>
                                </div>

                                <div
                                    style={{
                                        background: 'var(--card-bg, #F7F7F7)',
                                        border: '1px solid rgba(0,0,0,.08)',
                                        borderRadius: 12,
                                        padding: 14,
                                    }}
                                >
                                    <p className="desktop-body-s" style={{ margin: 0, color: '#666' }}>
                                        Free trial active until
                                    </p>
                                    <p className="desktop-h5" style={{ margin: 0 }}>
                                        {trialUntil}
                                    </p>
                                </div>
                            </div>

                            <div style={{ marginTop: 18, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                                <Link
                                    to="/myprofile"
                                    className="cta-blue-button desktop-button"
                                    style={{ minWidth: 180 }}
                                >
                                    Go to Dashboard
                                </Link>
                                <Link
                                    to="/billing"
                                    className="cta-black-button desktop-button"
                                    style={{ minWidth: 180 }}
                                >
                                    Manage Billing
                                </Link>
                                <Link
                                    to="/myorders"
                                    className="desktop-button"
                                    style={{
                                        minWidth: 180,
                                        borderRadius: 12,
                                        border: '1px solid rgba(0,0,0,.12)',
                                        background: 'transparent',
                                    }}
                                >
                                    View Orders
                                </Link>
                            </div>

                            <hr className="divider" />

                            <div style={{ display: 'grid', gap: 6 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span className="desktop-body-s" style={{ color: '#666' }}>Created</span>
                                    <span className="desktop-body-s">
                                        {latestSub?.createdAt ? new Date(latestSub.createdAt).toLocaleString() : '—'}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span className="desktop-body-s" style={{ color: '#666' }}>Status</span>
                                    <span className="desktop-body-s" style={{ textTransform: 'capitalize' }}>
                                        {latestSub?.status || 'active'}
                                    </span>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </main>
        </div>
    );
}
