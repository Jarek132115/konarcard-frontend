import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import Sidebar from '../../components/Sidebar';
import PageHeader from '../../components/PageHeader';
import LogoIcon from '../../assets/icons/Logo-Icon.svg';
import api from '../../services/api';

import ProductThumb from '../../assets/images/Product-Cover.png';

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

                <div className="orders-container">
                    {loading ? (
                        <p>Loading orders…</p>
                    ) : err ? (
                        <p className="error-text">{err}</p>
                    ) : orders.length === 0 ? (
                        <p>No orders yet.</p>
                    ) : (
                        <div className="orders-list">
                            {orders.map((o) => {
                                const isSub = (o.type || '').toLowerCase() === 'subscription';
                                const isCard = (o.type || '').toLowerCase() === 'card';
                                const amount = formatAmount(o.amountTotal, o.currency);
                                const delivery =
                                    o.deliveryWindow || o.metadata?.estimatedDelivery || '—';
                                const qty = isSub ? '—' : o.quantity || 1;

                                return (
                                    <div key={o.id} className="order-card">
                                        {/* Thumbnail */}
                                        <div className="order-thumb">
                                            <img
                                                src={ProductThumb}
                                                alt="Product"
                                                className="order-thumb-img"
                                            />
                                        </div>

                                        {/* Details */}
                                        <div className="order-details">
                                            <div className="order-meta">
                                                <span className="type">{o.type}</span>
                                                <span>•</span>
                                                <span>{o.status}</span>
                                                <span>•</span>
                                                <span>
                                                    {o.createdAt
                                                        ? new Date(o.createdAt).toLocaleString()
                                                        : '—'}
                                                </span>
                                            </div>

                                            {isCard && (
                                                <>
                                                    <div className="order-line">
                                                        <strong>Quantity:</strong> {qty}
                                                    </div>
                                                    <div className="order-line">
                                                        <strong>Estimated delivery:</strong> {delivery}
                                                    </div>
                                                </>
                                            )}

                                            <div className="order-line">
                                                <strong>Amount:</strong> {amount}
                                            </div>

                                            <div className="order-actions">
                                                {isSub ? (
                                                    <button
                                                        onClick={cancelSubscription}
                                                        className="cta-black-button desktop-button"
                                                    >
                                                        Cancel subscription
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => navigate('/contactus')}
                                                        className="cta-black-button desktop-button"
                                                    >
                                                        Problem with order
                                                    </button>
                                                )}

                                                <Link
                                                    to={isSub ? '/SuccessSubscription' : '/success'}
                                                    className="cta-blue-button desktop-button"
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

                    {actionMsg && <p className="action-message">{actionMsg}</p>}
                </div>
            </main>
        </div>
    );
}
