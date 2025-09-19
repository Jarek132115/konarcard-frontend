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
    const value = amount / 100;
    return new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency: currency.toUpperCase(),
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value);
}

function parseDateMaybe(v) {
    if (!v && v !== 0) return null;
    // ISO string?
    if (typeof v === 'string') {
        const d = new Date(v);
        return Number.isNaN(+d) ? null : d;
    }
    // number: could be seconds or ms
    if (typeof v === 'number') {
        // if it's 10-digit (seconds), convert to ms
        const ms = v < 2e12 ? v * 1000 : v;
        const d = new Date(ms);
        return Number.isNaN(+d) ? null : d;
    }
    return null;
}

function pickTrialUntil(profile, latestSub) {
    // 1) Profile/User fields (multiple spellings)
    const candidates = [
        profile?.trialExpires,
        profile?.trial_expires,
        profile?.trialEnd,
        profile?.trial_end,
        profile?.subscription?.trialEndsAt,
        profile?.subscription?.trial_end,
    ];

    // 2) Subscription/order record fallbacks
    if (latestSub) {
        candidates.push(
            latestSub.trialEndsAt,
            latestSub.trial_end,
            latestSub.trialEnd,
            latestSub.trialPeriodEnd,
            latestSub.currentPeriodEnd
        );
    }

    for (const c of candidates) {
        const d = parseDateMaybe(c);
        if (d) return d;
    }
    return null;
}

export default function SuccessSubscription() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 1000);
    const [isSmallMobile, setIsSmallMobile] = useState(window.innerWidth <= 600);

    const { user: authUser } = useContext(AuthContext);
    const [profile, setProfile] = useState(authUser || null);
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

                if (!authUser) {
                    const p = await api.get('/profile', { params: { ts: Date.now() } });
                    if (mounted) setProfile(p?.data?.data || null);
                } else {
                    setProfile(authUser);
                }

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

    const latestSub = useMemo(() => {
        const subs = (orders || []).filter(o => (o.type || '').toLowerCase() === 'subscription');
        if (!subs.length) return null;
        return subs.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))[0];
    }, [orders]);

    const amountPaid = useMemo(() => {
        if (!latestSub) return '—';
        return formatAmount(
            typeof latestSub.amountTotal === 'number' ? latestSub.amountTotal : 0,
            latestSub.currency || 'gbp'
        );
    }, [latestSub]);

    const trialUntilStr = useMemo(() => {
        const d = pickTrialUntil(profile, latestSub);
        return d ? d.toLocaleString() : '—';
    }, [profile, latestSub]);

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
                    <span></span><span></span><span></span>
                </button>
            </div>

            <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            {sidebarOpen && isMobile && (
                <div className="sidebar-overlay active" onClick={() => setSidebarOpen(false)} />
            )}

            <main className="main-content-container">
                <PageHeader
                    title="Subscription"
                    isMobile={isMobile}
                    isSmallMobile={isSmallMobile}
                />

                <div
                    className="content-card-box"
                    style={{ maxWidth: 700, width: '100%', margin: '5px auto 0', textAlign: 'left' }}
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
                                        {trialUntilStr}
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
                                {/* Black button style, but now "View Orders" */}
                                <Link
                                    to="/myorders"
                                    className="cta-black-button desktop-button"
                                    style={{ minWidth: 180 }}
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
