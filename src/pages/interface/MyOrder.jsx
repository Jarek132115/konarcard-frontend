// src/pages/interface/MyOrder.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import Sidebar from '../../components/Sidebar';
import PageHeader from '../../components/PageHeader';
import LogoIcon from '../../assets/icons/Logo-Icon.svg';
import api from '../../services/api';

function formatAmount(amount, currency = 'gbp') {
    if (typeof amount !== 'number') return '—';
    const value = amount / 100; // Stripe sends smallest unit
    return new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency: currency.toUpperCase(),
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value);
}

export default function MyOrders() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 1000);
    const [isSmallMobile, setIsSmallMobile] = useState(window.innerWidth <= 600);

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState('');

    useEffect(() => {
        const handleResize = () => {
            const currentIsMobile = window.innerWidth <= 1000;
            const currentIsSmallMobile = window.innerWidth <= 600;
            setIsMobile(currentIsMobile);
            setIsSmallMobile(currentIsSmallMobile);
            if (!currentIsMobile && sidebarOpen) setSidebarOpen(false);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [sidebarOpen]);

    useEffect(() => {
        if (sidebarOpen && isMobile) {
            document.body.classList.add('body-no-scroll');
        } else {
            document.body.classList.remove('body-no-scroll');
        }
    }, [sidebarOpen, isMobile]);

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                setLoading(true);
                setErr('');
                const res = await api.get('/me/orders');
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

    return (
        <div className={`app-layout ${sidebarOpen ? 'sidebar-active' : ''}`}>
            {/* Mobile header */}
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

            {/* Sidebar */}
            <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

            {/* Mobile overlay */}
            {sidebarOpen && isMobile && (
                <div
                    className="sidebar-overlay active"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Main */}
            <main className="main-content-container">
                <PageHeader
                    title="My Orders"
                    isMobile={isMobile}
                    isSmallMobile={isSmallMobile}
                />

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
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ textAlign: 'left', borderBottom: '1px solid #eee' }}>
                                        <th style={{ padding: '10px 8px' }}>Type</th>
                                        <th style={{ padding: '10px 8px' }}>Status</th>
                                        <th style={{ padding: '10px 8px' }}>Quantity</th>
                                        <th style={{ padding: '10px 8px' }}>Amount</th>
                                        <th style={{ padding: '10px 8px' }}>Estimated Delivery</th>
                                        <th style={{ padding: '10px 8px' }}>Created</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map((o) => (
                                        <tr key={o.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                            <td style={{ padding: '10px 8px', textTransform: 'capitalize' }}>
                                                {o.type}
                                            </td>
                                            <td style={{ padding: '10px 8px', textTransform: 'capitalize' }}>
                                                {o.status}
                                            </td>
                                            <td style={{ padding: '10px 8px' }}>
                                                {o.type === 'subscription' ? '—' : (o.quantity || 1)}
                                            </td>
                                            <td style={{ padding: '10px 8px' }}>
                                                {formatAmount(o.amountTotal, o.currency)}
                                            </td>
                                            <td style={{ padding: '10px 8px' }}>
                                                {o.type === 'card' ? (o.deliveryWindow || '—') : '—'}
                                            </td>
                                            <td style={{ padding: '10px 8px' }}>
                                                {o.createdAt ? new Date(o.createdAt).toLocaleString() : '—'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
