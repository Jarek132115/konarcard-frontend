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
        return () => {
            mounted = false;
        };
    }, []);

    async function cancelSubscription() {
        setActionMsg('');
        try {
            await api.post('/cancel-subscription');
            setActionMsg('Subscription will cancel at the end of the current billing period.');
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
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>

            <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            {sidebarOpen && isMobile && (
                <div className="sidebar-overlay active" onClick={() => setSidebarOpen(false)} />
            )}

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
                        boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
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
                                const delivery =
                                    o.deliveryWindow || o.metadata?.estimatedDelivery || '—';
                                const qty = isSub ? '—' : o.quantity || 1;

                                return (
                                    <div
                                        key={o.id}
                                        style={{
                                            display: 'grid',
                                            gridTemplateColumns: '120px 1fr',
                                            gap: 16,
                                            border: '1px solid #f1f5f9',
                                            borderRadius: 12,
                                            padding: 16,
                                            alignItems: 'center',
                                            background: '#fff',
                                            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                                        }}
                                    >
                                        {/* Thumbnail */}
                                        <div
                                            style={{
                                                width: 120,
                                                height: 120,
                                                borderRadius: 12,
                                                overflow: 'hidden',
                                                background: '#fafafa',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }}
                                        >
                                            <img
                                                src={ProductThumb}
                                                alt="Product"
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            />
                                        </div>

                                        {/* Details */}
                                        <div style={{ display: 'grid', gap: 8 }}>
                                            {/* Meta row */}
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    gap: 8,
                                                    alignItems: 'baseline',
                                                    flexWrap: 'wrap',
                                                    fontSize: 14,
                                                    color: '#6b7280',
                                                }}
                                            >
                                                <span
                                                    style={{
                                                        textTransform: 'capitalize',
                                                        color: '#111',
                                                        fontWeight: 500,
                                                    }}
                                                >
                                                    {o.type}
                                                </span>
                                                <span>•</span>
                                                <span style={{ textTransform: 'capitalize' }}>{o.status}</span>
                                                <span>•</span>
                                                <span>
                                                    {o.createdAt
                                                        ? new Date(o.createdAt).toLocaleString()
                                                        : '—'}
                                                </span>
                                            </div>

                                            {isCard && (
                                                <>
                                                    <div style={{ fontSize: 14 }}>
                                                        <strong>Quantity:</strong> {qty}
                                                    </div>
                                                    <div style={{ fontSize: 14 }}>
                                                        <strong>Estimated delivery:</strong> {delivery}
                                                    </div>
                                                </>
                                            )}

                                            <div style={{ fontSize: 14 }}>
                                                <strong>Amount:</strong> {amount}
                                            </div>

                                            {/* Actions */}
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    gap: 10,
                                                    marginTop: 10,
                                                    flexWrap: 'wrap',
                                                }}
                                            >
                                                {isSub ? (
                                                    <button
                                                        onClick={cancelSubscription}
                                                        className="cta-black-button desktop-button"
                                                        style={{ padding: '10px 14px', borderRadius: 10 }}
                                                    >
                                                        Cancel subscription
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => navigate('/contactus')}
                                                        className="cta-black-button desktop-button"
                                                        style={{ padding: '10px 14px', borderRadius: 10 }}
                                                    >
                                                        Problem with order
                                                    </button>
                                                )}

                                                <Link
                                                    to={isSub ? '/SuccessSubscription' : '/success'}
                                                    className="cta-blue-button desktop-button"
                                                    style={{ padding: '10px 14px', borderRadius: 10 }}
                                                >
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
