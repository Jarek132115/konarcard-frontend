import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

    // Filters (card only — no type dropdown)
    const [q, setQ] = useState('');
    const [fulfillmentStatus, setFulfillmentStatus] = useState('');

    // Local edit buffers per order
    const [edit, setEdit] = useState({}); // { [orderId]: { trackingUrl, deliveryWindow, fulfillmentStatus, notifyTracking, notifyStatus } }

    async function logout() {
        try { await api.post('/logout'); } catch { }
        try {
            localStorage.removeItem('token');
            localStorage.removeItem('authUser');
        } catch { }
        navigate('/login', { replace: true });
    }

    function setEditField(id, field, value) {
        setEdit((prev) => ({ ...prev, [id]: { ...(prev[id] || {}), [field]: value } }));
    }

    async function loadOrders() {
        setLoading(true);
        setError('');
        try {
            const params = { type: 'card' }; // enforce card-only
            if (q) params.q = q;
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
            setError(e?.response?.data?.error || 'Failed to load orders');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadOrders();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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

    function copy(id) {
        if (!navigator?.clipboard) return;
        navigator.clipboard.writeText(id).then(() => toast.success('Copied'));
    }

    const count = useMemo(() => orders.length, [orders]);

    return (
        <div className="admin-shell">
            {/* Left rail (desktop) / Top bar (mobile) */}
            <aside className="admin-side">
                <button className="admin-logo-btn" onClick={() => navigate('/myprofile')}>
                    <img src={LogoIcon} alt="Konar" />
                </button>
                <div className="admin-spacer" />
                <button className="admin-logout-btn" onClick={logout}>Logout</button>
            </aside>

            <main className="admin-main">
                {/* Filters */}
                <div className="admin-filters">
                    <input
                        className="admin-input"
                        placeholder="Search by email, name, username, userId or orderId"
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                    />
                    {/* keep a small phantom cell so grid layout stays tidy on desktop */}
                    <div style={{ display: 'none' }} />
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
                            onClick={() => { setQ(''); setFulfillmentStatus(''); setTimeout(loadOrders, 0); }}
                        >
                            Reset
                        </button>
                    </div>
                </div>

                <div className="admin-results">{count} result{count === 1 ? '' : 's'}</div>

                {/* Orders list */}
                <div className="admin-card">
                    {loading ? (
                        <p>Loading…</p>
                    ) : error ? (
                        <p className="admin-error">{error}</p>
                    ) : orders.length === 0 ? (
                        <p>No card orders found.</p>
                    ) : (
                        <div className="admin-list">
                            {orders.map((o) => {
                                const id = o._id;
                                const ebuf = edit[id] || {};
                                // BEST-EFFORT customer fields (supports multiple backend shapes)
                                const customerName =
                                    o.deliveryName ||
                                    o?.metadata?.deliveryName ||
                                    o?.shipping?.name ||
                                    o?.customerName ||
                                    '—';

                                const customerEmail =
                                    o.customerEmail ||
                                    o?.metadata?.customerEmail ||
                                    o?.userEmail ||
                                    (o?.user && o.user.email) ||
                                    '—';

                                const address =
                                    o.deliveryAddress ||
                                    o?.metadata?.deliveryAddress ||
                                    (o?.shipping?.address
                                        ? [
                                            o.shipping.address.line1,
                                            o.shipping.address.line2,
                                            o.shipping.address.city,
                                            o.shipping.address.state,
                                            o.shipping.address.postal_code,
                                            o.shipping.address.country,
                                        ]
                                            .filter(Boolean)
                                            .join(', ')
                                        : '') ||
                                    '—';

                                return (
                                    <div key={id} className="order">
                                        {/* Header */}
                                        <div className="order-top">
                                            <span className="pill">Card</span>
                                            <span className="sep">•</span>
                                            <span className="muted">{o.status}</span>
                                            <span className="sep">•</span>
                                            <span className="muted">{o.createdAt ? new Date(o.createdAt).toLocaleString() : '—'}</span>
                                            <span className="grow" />
                                            <span className="muted">Order ID:</span>
                                            <span className="mono">{id}</span>
                                            <button className="btn-copy" onClick={() => copy(id)}>Copy</button>
                                        </div>

                                        {/* Details grid */}
                                        <div className="order-grid">
                                            <div><strong>Customer:</strong> {customerName}</div>
                                            <div className="right"><strong>Email:</strong> {customerEmail}</div>

                                            <div><strong>Amount:</strong> {formatAmount(o.amountTotal, o.currency)}</div>
                                            <div className="right"><strong>Qty:</strong> {o.quantity ?? 1}</div>

                                            <div><strong>Tracking:</strong> {o.trackingUrl ? <a href={o.trackingUrl} target="_blank" rel="noreferrer">{o.trackingUrl}</a> : '—'}</div>
                                            <div className="right"><strong>ETA:</strong> {o.deliveryWindow || '—'}</div>

                                            <div><strong>Deliver To:</strong> {customerName}</div>
                                            <div className="right"><strong>Address:</strong> {address}</div>

                                            <div><strong>Fulfilment:</strong> {o.fulfillmentStatus || 'order_placed'}</div>
                                        </div>

                                        {/* Tracking & ETA */}
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
                                                <span className="muted">Email customer “Order shipped — track it here”</span>
                                            </label>
                                            <div>
                                                <button className="btn-primary" onClick={() => saveTracking(o)}>Save tracking</button>
                                            </div>
                                        </div>

                                        {/* Order Status */}
                                        <div className="order-block">
                                            <h4>Order Status</h4>
                                            <div className="row">
                                                <select
                                                    className="admin-select"
                                                    value={ebuf.fulfillmentStatus || 'order_placed'}
                                                    onChange={(e) => setEditField(id, 'fulfillmentStatus', e.target.value)}
                                                >
                                                    {STATUS_OPTIONS.map((opt) => (
                                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                    ))}
                                                </select>
                                                <label className="check-row">
                                                    <input
                                                        type="checkbox"
                                                        checked={!!ebuf.notifyStatus}
                                                        onChange={(e) => setEditField(id, 'notifyStatus', e.target.checked)}
                                                    />
                                                    <span className="muted">Email customer about this status update</span>
                                                </label>
                                            </div>
                                            <div>
                                                <button className="btn-primary" onClick={() => saveStatus(o)}>Save status</button>
                                            </div>
                                        </div>
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
