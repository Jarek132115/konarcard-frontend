// frontend/src/pages/admin/AdminDashboard.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../../services/api';
import LogoIcon from '../../assets/icons/Logo-Icon.svg';

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

const STATUS_OPTIONS = [
    { value: 'order_placed', label: 'Order placed' },
    { value: 'designing_card', label: 'Designing card' },
    { value: 'packaged', label: 'Packaged' },
    { value: 'shipped', label: 'Shipped' },
];

export default function AdminDashboard() {
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [orders, setOrders] = useState([]);
    const [error, setError] = useState('');

    // Filters
    const [q, setQ] = useState('');
    const [type, setType] = useState('');
    const [fulfillmentStatus, setFulfillmentStatus] = useState('');

    // Local edit buffers per order
    // { [orderId]: { trackingUrl, deliveryWindow, fulfillmentStatus, notifyTracking, notifyStatus } }
    const [edit, setEdit] = useState({});

    async function handleLogout() {
        try { await api.post('/logout'); } catch { }
        try {
            localStorage.removeItem('token');
            localStorage.removeItem('authUser');
        } catch { }
        navigate('/login', { replace: true });
    }

    async function loadOrders() {
        setLoading(true);
        setError('');
        try {
            const params = {};
            if (q) params.q = q;
            if (type) params.type = type;
            if (fulfillmentStatus) params.fulfillmentStatus = fulfillmentStatus;

            const res = await api.get('/admin/orders', { params });
            const data = Array.isArray(res?.data?.data) ? res.data.data : [];
            setOrders(data);

            // seed edit buffers
            const seed = {};
            for (const o of data) {
                seed[o._id] = {
                    trackingUrl: o.trackingUrl || '',
                    deliveryWindow: o.deliveryWindow || '',
                    fulfillmentStatus: o.fulfillmentStatus || 'order_placed',
                    notifyTracking: true,
                    notifyStatus: false,
                };
            }
            setEdit(seed);
        } catch (e) {
            const msg = e?.response?.data?.error || 'Failed to load orders';
            setError(msg);
            // if not admin, server returns 403 — push them out
            if (e?.response?.status === 403) {
                toast.error('Admin only');
                navigate('/myprofile', { replace: true });
            }
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadOrders();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function setEditField(id, field, value) {
        setEdit((prev) => ({ ...prev, [id]: { ...(prev[id] || {}), [field]: value } }));
    }

    async function saveTracking(o) {
        const buf = edit[o._id] || {};
        try {
            await api.patch(`/admin/orders/${o._id}/tracking`, {
                trackingUrl: buf.trackingUrl || '',
                deliveryWindow: buf.deliveryWindow || '',
                notify: !!buf.notifyTracking && !!buf.trackingUrl, // only email if we have a link
            });
            toast.success('Tracking updated');
            await loadOrders();
        } catch (e) {
            toast.error(e?.response?.data?.error || 'Failed to update tracking');
        }
    }

    async function saveStatus(o) {
        const buf = edit[o._id] || {};
        try {
            await api.patch(`/admin/orders/${o._id}/status`, {
                fulfillmentStatus: buf.fulfillmentStatus,
                notify: !!buf.notifyStatus,
            });
            toast.success('Status updated');
            await loadOrders();
        } catch (e) {
            toast.error(e?.response?.data?.error || 'Failed to update status');
        }
    }

    async function cancelSubscription(o) {
        try {
            const res = await api.post(`/admin/subscription/${o._id}/cancel`);
            if (res?.data?.success) {
                toast.success('Subscription set to cancel at period end');
            } else {
                toast.error(res?.data?.error || 'Failed to cancel subscription');
            }
        } catch (e) {
            toast.error(e?.response?.data?.error || 'Failed to cancel subscription');
        }
    }

    const filteredCount = useMemo(() => orders.length, [orders]);

    return (
        <div className="app-layout">
            {/* Simple top bar: logo left, logout right */}
            <div
                style={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 10,
                    background: 'transparent',
                }}
            >
                <div
                    style={{
                        maxWidth: 1200,
                        margin: '12px auto 6px',
                        padding: '0 16px',
                    }}
                >
                    <div
                        style={{
                            background: '#fff',
                            border: '1px solid rgba(0,0,0,0.08)',
                            borderRadius: 16,
                            padding: 12,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                        }}
                    >
                        <Link to="/admin" style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
                            <img src={LogoIcon} alt="Konar" style={{ height: 28, width: 28 }} />
                            <span className="desktop-body" style={{ fontWeight: 700 }}>Admin — Orders</span>
                        </Link>

                        <button
                            onClick={handleLogout}
                            className="cta-blue-button desktop-button"
                            style={{ padding: '10px 16px' }}
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>

            {/* Body */}
            <main className="main-content-container">
                {/* Filters */}
                <div
                    style={{
                        background: '#fff',
                        border: '1px solid rgba(0,0,0,0.08)',
                        borderRadius: 16,
                        padding: 16,
                        marginBottom: 12,
                        display: 'grid',
                        gap: 10,
                    }}
                >
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 160px 200px auto', gap: 10 }}>
                        <input
                            placeholder="Search by user email or userId"
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            style={{ border: '1px solid #e5e7eb', borderRadius: 10, padding: '10px 12px' }}
                        />
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            style={{ border: '1px solid #e5e7eb', borderRadius: 10, padding: '10px 12px' }}
                        >
                            <option value="">All types</option>
                            <option value="card">Card</option>
                            <option value="subscription">Subscription</option>
                        </select>
                        <select
                            value={fulfillmentStatus}
                            onChange={(e) => setFulfillmentStatus(e.target.value)}
                            style={{ border: '1px solid #e5e7eb', borderRadius: 10, padding: '10px 12px' }}
                        >
                            <option value="">Any status</option>
                            {STATUS_OPTIONS.map((s) => (
                                <option key={s.value} value={s.value}>{s.label}</option>
                            ))}
                        </select>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <button
                                className="cta-blue-button desktop-button"
                                onClick={loadOrders}
                                style={{ padding: '10px 14px' }}
                            >
                                Apply
                            </button>
                            <button
                                className="desktop-button"
                                onClick={() => { setQ(''); setType(''); setFulfillmentStatus(''); }}
                                style={{ padding: '10px 14px', border: '1px solid #e5e7eb', borderRadius: 10, background: '#fff' }}
                            >
                                Reset
                            </button>
                        </div>
                    </div>
                    <div className="desktop-body-s" style={{ color: '#6b7280' }}>
                        {filteredCount} result{filteredCount === 1 ? '' : 's'}
                    </div>
                </div>

                {/* List */}
                <div
                    style={{
                        width: '100%',
                        background: '#fff',
                        border: '1px solid rgba(0,0,0,0.08)',
                        borderRadius: 16,
                        padding: 16,
                    }}
                >
                    {loading ? (
                        <p>Loading…</p>
                    ) : error ? (
                        <p style={{ color: '#b91c1c' }}>{error}</p>
                    ) : orders.length === 0 ? (
                        <p>No orders found.</p>
                    ) : (
                        <div style={{ display: 'grid', gap: 16 }}>
                            {orders.map((o) => {
                                const id = o._id;
                                const ebuf = edit[id] || {};
                                const isCard = (o.type || '').toLowerCase() === 'card';
                                const isSub = (o.type || '').toLowerCase() === 'subscription';

                                return (
                                    <div
                                        key={id}
                                        style={{
                                            border: '1px solid #f1f5f9',
                                            borderRadius: 12,
                                            padding: 16,
                                            display: 'grid',
                                            gap: 12,
                                            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                                        }}
                                    >
                                        {/* Header row */}
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'baseline' }}>
                                            <span className="desktop-body-s" style={{ textTransform: 'capitalize', fontWeight: 600 }}>
                                                {o.type}
                                            </span>
                                            <span className="desktop-body-s" style={{ color: '#6b7280' }}>•</span>
                                            <span className="desktop-body-s">{o.status}</span>
                                            <span className="desktop-body-s" style={{ color: '#6b7280' }}>•</span>
                                            <span className="desktop-body-s">
                                                {o.createdAt ? new Date(o.createdAt).toLocaleString() : '—'}
                                            </span>
                                            <span style={{ flex: 1 }} />
                                            <span className="desktop-body-s" style={{ color: '#6b7280' }}>Order ID:</span>
                                            <span className="desktop-body-s" style={{ fontFamily: 'monospace' }}>{id}</span>
                                        </div>

                                        {/* Amount + Shipping info */}
                                        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                                            <div><strong>Amount:</strong> {formatAmount(o.amountTotal, o.currency)}</div>
                                            {isCard && (
                                                <>
                                                    <div><strong>Qty:</strong> {o.quantity ?? 1}</div>
                                                    <div><strong>ETA:</strong> {o.deliveryWindow || '—'}</div>
                                                    <div><strong>Tracking:</strong> {o.trackingUrl ? <a href={o.trackingUrl} target="_blank" rel="noreferrer">{o.trackingUrl}</a> : '—'}</div>
                                                    <div><strong>Fulfilment:</strong> {o.fulfillmentStatus || 'order_placed'}</div>
                                                    <div><strong>Deliver To:</strong> {o.deliveryName || o?.metadata?.deliveryName || '—'}</div>
                                                    <div><strong>Address:</strong> {o.deliveryAddress || o?.metadata?.deliveryAddress || '—'}</div>
                                                </>
                                            )}
                                        </div>

                                        {/* Form A: Tracking + ETA */}
                                        {isCard && (
                                            <div
                                                style={{
                                                    borderTop: '1px solid #f1f5f9',
                                                    paddingTop: 12,
                                                    display: 'grid',
                                                    gap: 10,
                                                }}
                                            >
                                                <div style={{ fontWeight: 600 }}>Tracking & ETA</div>
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: 10 }}>
                                                    <input
                                                        placeholder="Tracking URL (Royal Mail link)"
                                                        value={ebuf.trackingUrl || ''}
                                                        onChange={(e) => setEditField(id, 'trackingUrl', e.target.value)}
                                                        style={{ border: '1px solid #e5e7eb', borderRadius: 10, padding: '10px 12px' }}
                                                    />
                                                    <input
                                                        placeholder="Estimated delivery (e.g. 20–23 Sep)"
                                                        value={ebuf.deliveryWindow || ''}
                                                        onChange={(e) => setEditField(id, 'deliveryWindow', e.target.value)}
                                                        style={{ border: '1px solid #e5e7eb', borderRadius: 10, padding: '10px 12px' }}
                                                    />
                                                </div>
                                                <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                    <input
                                                        type="checkbox"
                                                        checked={!!ebuf.notifyTracking}
                                                        onChange={(e) => setEditField(id, 'notifyTracking', e.target.checked)}
                                                    />
                                                    <span className="desktop-body-s">Email customer “Order shipped — track it here”</span>
                                                </label>
                                                <div style={{ display: 'flex', gap: 8 }}>
                                                    <button
                                                        className="cta-blue-button desktop-button"
                                                        onClick={() => saveTracking(o)}
                                                        style={{ padding: '10px 14px' }}
                                                    >
                                                        Save tracking
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {/* Form B: Status */}
                                        {isCard && (
                                            <div
                                                style={{
                                                    borderTop: '1px solid #f1f5f9',
                                                    paddingTop: 12,
                                                    display: 'grid',
                                                    gap: 10,
                                                }}
                                            >
                                                <div style={{ fontWeight: 600 }}>Order Status</div>
                                                <div style={{ display: 'grid', gridTemplateColumns: '260px auto', gap: 10 }}>
                                                    <select
                                                        value={ebuf.fulfillmentStatus || 'order_placed'}
                                                        onChange={(e) => setEditField(id, 'fulfillmentStatus', e.target.value)}
                                                        style={{ border: '1px solid #e5e7eb', borderRadius: 10, padding: '10px 12px' }}
                                                    >
                                                        {STATUS_OPTIONS.map((opt) => (
                                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                        ))}
                                                    </select>
                                                    <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                        <input
                                                            type="checkbox"
                                                            checked={!!ebuf.notifyStatus}
                                                            onChange={(e) => setEditField(id, 'notifyStatus', e.target.checked)}
                                                        />
                                                        <span className="desktop-body-s">Email customer about this status update</span>
                                                    </label>
                                                </div>
                                                <div style={{ display: 'flex', gap: 8 }}>
                                                    <button
                                                        className="cta-blue-button desktop-button"
                                                        onClick={() => saveStatus(o)}
                                                        style={{ padding: '10px 14px' }}
                                                    >
                                                        Save status
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {/* Subscription helper */}
                                        {isSub && o.stripeSubscriptionId && (
                                            <div
                                                style={{
                                                    borderTop: '1px solid #f1f5f9',
                                                    paddingTop: 12,
                                                    display: 'flex',
                                                    gap: 8,
                                                    alignItems: 'center',
                                                    flexWrap: 'wrap',
                                                }}
                                            >
                                                <span className="desktop-body-s" style={{ color: '#6b7280' }}>
                                                    Subscription: {o.stripeSubscriptionId}
                                                </span>
                                                <button
                                                    className="desktop-button"
                                                    onClick={() => cancelSubscription(o)}
                                                    style={{ padding: '10px 14px', border: '1px solid #ef4444', color: '#ef4444', background: '#fff', borderRadius: 10 }}
                                                >
                                                    Cancel at period end
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
