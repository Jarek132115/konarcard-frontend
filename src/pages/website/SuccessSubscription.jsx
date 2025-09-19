import React, { useEffect, useMemo, useState, useContext } from 'react';
import { Link } from 'react-router-dom';

import Sidebar from '../../components/Sidebar';
import PageHeader from '../../components/PageHeader';
import LogoIcon from '../../assets/icons/Logo-Icon.svg';
import api from '../../services/api';
import { AuthContext } from '../../components/AuthContext';

import './SuccessPages.css';

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
    if (typeof v === 'string') {
        const d = new Date(v);
        return Number.isNaN(+d) ? null : d;
    }
    if (typeof v === 'number') {
        const ms = v < 2e12 ? v * 1000 : v;
        const d = new Date(ms);
        return Number.isNaN(+d) ? null : d;
    }
    return null;
}

/** Prefer the mirrored DB value (profile.trialExpires) and only show if future. */
function pickTrialUntil(profile, latestSub) {
    const now = Date.now();
    const primary = parseDateMaybe(
        profile?.trialExpires ?? profile?.trial_expires ?? profile?.trialEnd ?? profile?.trial_end
    );
    if (primary && +primary > now) return primary;

    const subCandidates = [
        profile?.subscription?.trialEndsAt,
        profile?.subscription?.trial_end,
        latestSub?.trialEndsAt,
        latestSub?.trial_end,
        latestSub?.trialEnd,
        latestSub?.trialPeriodEnd,
        latestSub?.currentPeriodEnd,
    ];
    for (const c of subCandidates) {
        const d = parseDateMaybe(c);
        if (d && +d > now) return d;
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

    const trialUntil = useMemo(() => pickTrialUntil(profile, latestSub), [profile, latestSub]);
    const trialUntilStr = useMemo(() => (trialUntil ? trialUntil.toLocaleString() : '—'), [trialUntil]);

    const subStatus =
        (latestSub?.status || '').toLowerCase() ||
        (profile?.isSubscribed ? 'active' : 'inactive');

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
                <PageHeader title="Subscription" isMobile={isMobile} isSmallMobile={isSmallMobile} />

                <div className="success-container">
                    {loading ? (
                        <p>Activating your subscription…</p>
                    ) : err ? (
                        <p style={{ color: '#b91c1c' }}>{err}</p>
                    ) : (
                        <div className="success-box">
                            <h2 className="desktop-h4 success-header">Konar Profile Plan</h2>
                            <p className="desktop-body" style={{ margin: 0, color: '#555' }}>
                                Your subscription is{' '}
                                <strong className="status-text">{subStatus}</strong>.
                            </p>

                            <div className="success-grid">
                                <div className="info-tile">
                                    <p className="desktop-body-s label">Amount paid today</p>
                                    <p className="desktop-h5 value">{amountPaid}</p>
                                </div>
                                <div className="info-tile">
                                    <p className="desktop-body-s label">Free trial active until</p>
                                    <p className="desktop-h5 value">{trialUntilStr}</p>
                                </div>
                            </div>

                            <div className="success-buttons">
                                <Link to="/myprofile" className="cta-blue-button desktop-button">Go to Dashboard</Link>
                                <Link to="/myorders" className="cta-black-button desktop-button">View Orders</Link>
                            </div>

                            <hr className="divider" />

                            <div className="kv">
                                <div className="kv-row">
                                    <span className="desktop-body-s kv-label">Created</span>
                                    <span className="desktop-body-s kv-value">
                                        {latestSub?.createdAt ? new Date(latestSub.createdAt).toLocaleString() : '—'}
                                    </span>
                                </div>
                                <div className="kv-row">
                                    <span className="desktop-body-s kv-label">Status</span>
                                    <span className="desktop-body-s kv-value status-text">{subStatus}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
