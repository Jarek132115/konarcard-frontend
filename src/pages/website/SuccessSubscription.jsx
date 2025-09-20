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

export default function SuccessSubscription() {
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
                const res = await api.get('/me/orders', { params: { ts: Date.now() } });
                if (mounted) setOrders(Array.isArray(res?.data?.data) ? res.data.data : []);
            } catch (e) {
                if (mounted) setErr(e?.response?.data?.error || 'Could not load your subscription details.');
            } finally {
                if (mounted) setLoading(false);
            }
        })();
        return () => { mounted = false; };
    }, []);

    const latestSub = useMemo(() => {
        const subs = (orders || []).filter((o) => (o.type || '').toLowerCase() === 'subscription');
        if (!subs.length) return null;
        return subs.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))[0];
    }, [orders]);

    const subStatus = latestSub?.status || 'inactive';

    const amountToday = useMemo(() => {
        if (!latestSub) return '—';
        if (latestSub.trialEnd && new Date(latestSub.trialEnd) > new Date()) {
            return 'Free trial — no charge today';
        }
        return formatAmount(latestSub.amountTotal ?? 495, latestSub.currency || 'gbp');
    }, [latestSub]);

    const nextChargeDate = useMemo(() => {
        if (!latestSub) return null;
        if (latestSub.trialEnd && new Date(latestSub.trialEnd) > new Date()) {
            return new Date(latestSub.trialEnd);
        }
        if (latestSub.currentPeriodEnd) return new Date(latestSub.currentPeriodEnd);
        return null;
    }, [latestSub]);

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
            {sidebarOpen && isMobile && <div className="sidebar-overlay active" onClick={() => setSidebarOpen(false)} />}

            <main className="main-content-container">
                <PageHeader title="Subscription" isMobile={isMobile} isSmallMobile={isSmallMobile} />

                <div className="success-container">
                    {loading ? (
                        <p>Activating your subscription…</p>
                    ) : err ? (
                        <p style={{ color: '#b91c1c' }}>{err}</p>
                    ) : !latestSub ? (
                        <p>No subscription found.</p>
                    ) : (
                        <div className="success-box">
                            <h2 className="desktop-h4 success-header">Konar Profile Plan</h2>
                            <p className="desktop-body" style={{ margin: 0, color: '#555' }}>
                                Your subscription is <strong className="status-text">{subStatus}</strong>.
                            </p>

                            <div className="success-grid">
                                <div className="info-tile">
                                    <p className="desktop-body-s label">Amount paid today</p>
                                    <p className="desktop-h5 value">{amountToday}</p>
                                </div>
                                <div className="info-tile">
                                    <p className="desktop-body-s label">
                                        {latestSub.trialEnd && new Date(latestSub.trialEnd) > new Date()
                                            ? 'Free trial active until'
                                            : 'Next charge on'}
                                    </p>
                                    <p className="desktop-h5 value">
                                        {nextChargeDate ? nextChargeDate.toLocaleString() : '—'}
                                        {nextChargeDate && latestSub && !latestSub.trialEnd
                                            ? ` · ${formatAmount(latestSub.amountTotal ?? 495, latestSub.currency)}`
                                            : ''}
                                    </p>
                                </div>
                            </div>

                            <div className="success-buttons" style={{ display: 'grid', gap: 12 }}>
                                <Link to="/myprofile" className="cta-blue-button desktop-button" style={{ width: '100%' }}>
                                    Go to Dashboard
                                </Link>
                                <Link to="/myorders" className="cta-black-button desktop-button" style={{ width: '100%' }}>
                                    View Orders
                                </Link>
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
