// src/pages/interface/MyOrder.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import Sidebar from '../../components/Sidebar';
import PageHeader from '../../components/PageHeader';
import LogoIcon from '../../assets/icons/Logo-Icon.svg';
import api from '../../services/api';

import ProductThumb from '../../assets/images/Product-Cover.png'; // small image for the card

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

export default function MyOrders() {
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 1000);
    const [isSmallMobile, setIsSmallMobile] = useState(window.innerWidth <= 600);

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState('');
    const [actionMsg, setActionMsg] = useState('');

    useEffect(() => {
        const handleResize = () => {
            const m = window.innerWidth <= 1000;
            const sm = window.innerWidth <= 600;
            setIsMobile(m);
            setIsSmallMobile(sm);
            if (!m && sidebarOpen) setSidebarOpen(false);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
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
                if (!mounted) return;
                const list = Array.isArray(res?.data?.data) ? res.data.data : [];
                setOrders(list);
            } catch (e) {
                setErr(e?.response?.data?.error || 'Failed to load orders');
            } finally {
                if (mounted) setLoading(false);
            }
        })();
        return () => { mounted = false; };
    }, []);

    async function cancelSubscription() {
        setActionMsg('');
        try {
            await api.post('/cancel-subscription');
            setActionMsg('Subscription will cancel at the end of the current billing period.');
            // refresh orders list in case status changed
            const res = await api.get('/me/orders', { params: { ts: Date.now() } });
            const list = Array.isArray(res?.data?.data) ? res.data.data : [];
            setOrders(list);
        } catch (e) {
            setActionMsg(e?.response?.data?.error || 'Failed to cancel subscription');
        }
    }

    return (
        <div className={`app-layout ${sidebarOpen ? 'sidebar-active' : ''}`}>
            <div className="myprofile-mobile-header">
                <Link to="/myprofile" className="myprofile-logo-link">
                    <img src={LogoIcon} alt="Logo" className="myprofile-logo" />
                </Link>
                <div
                    className={`sidebar-menu-toggle ${sidebarOpen ? 'active' : ''}`}
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                >
                    <span></span><span></span><span></span>
                </div>
            </div>

            <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            {sidebarOpen && isMobile && <div className="sidebar-overlay active" onClick={() => setSidebarOpen(false)} />}

            <main className="main-content-container">
                <PageHeader title="My Orders" isMobile={isMobile} isSmallMobile={isSmallMobile} />

                <div
                    style={{
                        width: '100%',
                        marginTop: '5px',
                        background: '#fff',
                        border: '1px solid rgba(0,0,0,0.08)',
                        borderRadius: '16px',
                        padding: '24px',
                    }}
                >
                    {loading ? (
                        <p>Loading orders…</p>
                    ) : err ? (
                        <p style={{ color: '#b91c1c' }}>{err}</p>
                    ) : orders.length === 0 ? (
                        <p>No orders yet.</p>
                    ) : (
                        <div style={{ display: 'grid', gap: 16 }}>
                            {orders.map((o) => {
                                const isSub = (o.type || '').toLowerCase() === 'subscription';
                                const isCard = (o.type || '').toLowerCase() === 'card';
                                const amount = formatAmount(o.amountTotal, o.currency);
                                const delivery = o.deliveryWindow || o.metadata?.estimatedDelivery || '—';
                                const qty = isSub ? '—' : (o.quantity || 1);

                                return (
                                    <div key={o.id}
                                        style={{
                                            display: 'grid',
                                            gridTemplateColumns: '100px 1fr',
                                            gap: 16,
                                            border: '1px solid #f1f5f9',
                                            borderRadius: 12,
                                            padding: 12,
                                            alignItems: 'center'
                                        }}
                                    >
                                        {/* Thumbnail */}
                                        <div style={{
                                            width: 100, height: 100, borderRadius: 12, overflow: 'hidden',
                                            background: '#fafafa', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                        }}>
                                            <img src={ProductThumb} alt="Product" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        </div>

                                        {/* Details */}
                                        <div style={{ display: 'grid', gap: 6 }}>
                                            <div style={{ display: 'flex', gap: 8, alignItems: 'baseline', flexWrap: 'wrap' }}>
                                                <span className="desktop-body-s" style={{ textTransform: 'capitalize' }}>{o.type}</span>
                                                <span className="desktop-body-s" style={{ color: '#6b7280' }}>•</span>
                                                <span className="desktop-body-s" style={{ textTransform: 'capitalize' }}>{o.status}</span>
                                                <span className="desktop-body-s" style={{ color: '#6b7280' }}>•</span>
                                                <span className="desktop-body-s">{o.createdAt ? new Date(o.createdAt).toLocaleString() : '—'}</span>
                                            </div>

                                            {isCard && (
                                                <>
                                                    <div className="desktop-body-s"><strong>Quantity:</strong> {qty}</div>
                                                    <div className="desktop-body-s"><strong>Estimated delivery:</strong> {delivery}</div>
                                                </>
                                            )}

                                            <div className="desktop-body-s"><strong>Amount:</strong> {amount}</div>

                                            {/* Actions */}
                                            <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                                                {isSub ? (
                                                    <button
                                                        onClick={cancelSubscription}
                                                        className="cta-black-button desktop-button"
                                                        style={{ padding: '10px 14px' }}
                                                    >
                                                        Cancel subscription
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => navigate('/contactus')}
                                                        className="cta-black-button desktop-button"
                                                        style={{ padding: '10px 14px' }}
                                                    >
                                                        Problem with order
                                                    </button>
                                                )}

                                                <Link to={isSub ? '/SuccessSubscription' : '/success'} className="cta-blue-button desktop-button" style={{ padding: '10px 14px' }}>
                                                    View details
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {actionMsg && <p style={{ marginTop: 12 }}>{actionMsg}</p>}
                </div>
            </main>
        </div>
    );
}
