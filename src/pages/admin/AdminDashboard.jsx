// frontend/src/pages/admin/AdminDashboard.jsx
import React, { useEffect, useMemo, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../../services/api';
import LogoIcon from '../../assets/icons/Logo-Icon.svg';
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

const STATUS_OPTIONS = [
    { value: 'order_placed', label: 'Order placed' },
    { value: 'designing_card', label: 'Designing card' },
    { value: 'packaged', label: 'Packaged' },
    { value: 'shipped', label: 'Shipped' },
];

export default function AdminDashboard() {
    const navigate = useNavigate();
    const { logout } = useContext(AuthContext);

    const [loading, setLoading] = useState(true);
    const [orders, setOrders] = useState([]);
    const [error, setError] = useState('');

    // Filters
    const [q, setQ] = useState('');
    const [type, setType] = useState('');
    const [fulfillmentStatus, setFulfillmentStatus] = useState('');

    // Local edit buffers
    const [edit, setEdit] = useState({}); // { [orderId]: { trackingUrl, deliveryWindow, fulfillmentStatus, notifyTracking, notifyStatus } }

    const doLogout = async () => {
        try { await api.post('/logout'); } catch { }
        try {
            localStorage.removeItem('token');
            localStorage.removeItem('authUser');
        } catch { }
        logout?.();
        navigate('/login', { replace: true });
    };

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
            setError(e?.response?.data?.error || 'Failed to load orders');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadOrders();
    }, []);

    const setEditField = (id, field, value) => {
        setEdit(prev => ({ ...prev, [id]: { ...(prev[id] || {}), [field]: value } }));
    };

    const saveTracking = async (o) => {
        const buf = edit[o._id] || {};
        try {
            await api.patch(`/admin/orders/${o._id}/tracking`, {
                trackingUrl: buf.trackingUrl || '',
                deliveryWindow: buf.deliveryWindow || '',
                notify: !!buf.notifyTracking && !!buf.trackingUrl,
            });
            toast.success('Tracking updated');
            await loadOrders();
        } catch (e) {
            toast.error(e?.response?.data?.error || 'Failed to update tracking');
        }
    };

    const saveStatus = async (o) => {
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
    };

    const cancelSubscription = async (o) => {
        try {
            const res = await api.post(`/admin/subscription/${o._id}/cancel`);
            if (res?.data?.success) toast.success('Subscription set to cancel at period end');
            else toast.error(res?.data?.error || 'Failed to cancel subscription');
        } catch (e) {
            toast.error(e?.response?.data?.error || 'Failed to cancel subscription');
        }
    };

    const filteredCount = useMemo(() => orders.length, [orders]);

    return (
        <div className="admin-shell">
            {/* Slim left rail */}
            <aside className="admin-side">
                <button className="admin-logo-btn" onClick={() => navigate('/')}>
                    <img src={LogoIcon} alt="KONAR" />
                </button>
                <div className="admin-spacer" />
                <button className="admin-logout-btn" onClick={doLogout}>Logout</button>
            </aside>

            {/* Main content */}
            <main className="admin-main">
                {/* Filters */}
                <div className="admin-filters">
                    <input
                        className="admin-input"
                        placeholder="Search by email, name, username, userId or orderId"
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                    />
                    <select className="admin-select" value={type} onChange={(e) => setType(e.target.value)}>
                        <option value="">All types</option>
                        <option value="card">Card</option>
                        <option value="subscription">Subscription</option>
                    </select>
                    <select
                        className="admin-select"
                        value={fulfillmentStatus}
                        onChange={(e) => setFulfillmentStatus(e.target.value)}
                    >
                        <option value="">Any status</option>
                        {STATUS_OPTIONS.map((s) => (
                            <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                    </select>
                    <div className="admin-filter-buttons">
                        <button className="btn-primary" onClick={loadOrders}>Apply</button>
                        <button
                            className="btn-ghost"
                            onClick={() => { setQ(''); setType(''); setFulfillmentStatus(''); }}
                        >
                            Reset
                        </button>
                    </div>
                </div>

                <p className="admin-results">{filteredCount} result{filteredCount === 1 ? '' : 's'}</p>

                {/* Orders list */}
                <div className="admin-card">
                    {loading ? (
                        <p>Loading…</p>
                    ) : error ? (
                        <p className="admin-error">{error}</p>
                    ) : orders.length === 0 ? (
                        <p>No orders found.</p>
                    ) : (
                        <div className="admin-list">
                            {orders.map((o) => {
                                const id = o._id;
                                const ebuf = edit[id] || {};
                                const isCard = (o.type || '').toLowerCase() === 'card';
                                const isSub = (o.type || '').toLowerCase() === 'subscription';
                                const customerName = o.user?.name || o.deliveryName || o?.metadata?.deliveryName || '—';
                                const customerEmail = o.user?.email || '—';
                                const deliveryAddr = o.deliveryAddress || o?.metadata?.deliveryAddress || '—';

                                return (
                                    <section key={id} className="order">
                                        {/* Top line */}
                                        <div className="order-top">
                                            <div className="pill">{(o.type || '').charAt(0).toUpperCase() + (o.type || '').slice(1)}</div>
                                            <span className="sep">•</span>
                                            <span className="muted">{o.status || '—'}</span>
                                            <span className="sep">•</span>
                                            <span className="muted">{o.createdAt ? new Date(o.createdAt).toLocaleString() : '—'}</span>
                                            <div className="grow" />
                                            <span className="muted">Order ID:</span>
                                            <code className="mono">{id}</code>
                                            <button
                                                className="btn-copy"
                                                onClick={() => { navigator.clipboard.writeText(id); toast.success('Copied'); }}
                                            >Copy</button>
                                        </div>

                                        {/* Customer + amounts */}
                                        <div className="order-grid">
                                            <div><strong>Customer:</strong> {customerName}</div>
                                            <div className="right"><strong>Email:</strong> {customerEmail}</div>

                                            <div><strong>Amount:</strong> {formatAmount(o.amountTotal, o.currency)}</div>
                                            <div className="right"><strong>Qty:</strong> {o.quantity ?? 1}</div>

                                            {isCard && (
                                                <>
                                                    <div><strong>Tracking:</strong> {o.trackingUrl ? <a href={o.trackingUrl} target="_blank" rel="noreferrer">{o.trackingUrl}</a> : '—'}</div>
                                                    <div className="right"><strong>ETA:</strong> {o.deliveryWindow || '—'}</div>
                                                    <div><strong>Fulfilment:</strong> {o.fulfillmentStatus || 'order_placed'}</div>
                                                    <div className="right"><strong>Address:</strong> {deliveryAddr}</div>
                                                </>
                                            )}
                                        </div>

                                        {/* Tracking & ETA (cards only) */}
                                        {isCard && (
                                            <div className="order-block">
                                                <h4>Tracking & ETA</h4>
                                                <div className="row">
                                                    <input
                                                        className="admin-input"
                                                        placeholder="Tracking URL (Royal Mail link)"
                                                        value={ebuf.trackingUrl || ''}
                                                        onChange={(e) => setEditField(id, 'trackingUrl', e.target.value)}
                                                    />
                                                    <input
                                                        className="admin-input"
                                                        placeholder="Estimated delivery (e.g. 20–23 September)"
                                                        value={ebuf.deliveryWindow || ''}
                                                        onChange={(e) => setEditField(id, 'deliveryWindow', e.target.value)}
                                                    />
                                                </div>
                                                <label className="check-row">
                                                    <input
                                                        type="checkbox"
                                                        checked={!!ebuf.notifyTracking}
                                                        onChange={(e) => setEditField(id, 'notifyTracking', e.target.checked)}
                                                    />
                                                    <span>Email customer “Order shipped — track it here”</span>
                                                </label>
                                                <button className="btn-primary" onClick={() => saveTracking(o)}>Save tracking</button>
                                            </div>
                                        )}

                                        {/* Status (cards only) */}
                                        {isCard && (
                                            <div className="order-block">
                                                <h4>Order Status</h4>
                                                <div className="row">
                                                    <select
                                                        className="admin-select"
                                                        value={ebuf.fulfillmentStatus || 'order_placed'}
                                                        onChange={(e) => setEditField(id, 'fulfillmentStatus', e.target.value)}
                                                    >
                                                        {STATUS_OPTIONS.map(opt => (
                                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                        ))}
                                                    </select>
                                                    <label className="check-row">
                                                        <input
                                                            type="checkbox"
                                                            checked={!!ebuf.notifyStatus}
                                                            onChange={(e) => setEditField(id, 'notifyStatus', e.target.checked)}
                                                        />
                                                        <span>Email customer about this status update</span>
                                                    </label>
                                                </div>
                                                <button className="btn-primary" onClick={() => saveStatus(o)}>Save status</button>
                                            </div>
                                        )}

                                        {/* Subscription helper */}
                                        {isSub && o.stripeSubscriptionId && (
                                            <div className="order-block">
                                                <h4>Subscription</h4>
                                                <div className="row">
                                                    <code className="mono">Stripe ID: {o.stripeSubscriptionId}</code>
                                                    <button className="btn-danger" onClick={() => cancelSubscription(o)}>Cancel at period end</button>
                                                </div>
                                            </div>
                                        )}
                                    </section>
                                );
                            })}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
