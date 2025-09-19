// frontend/src/pages/admin/AdminDashboard.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../../services/api';
import Sidebar from '../../components/Sidebar';
import PageHeader from '../../components/PageHeader';
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
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 1000);
    const [isSmallMobile, setIsSmallMobile] = useState(window.innerWidth <= 600);

    const [loading, setLoading] = useState(true);
    const [orders, setOrders] = useState([]);
    const [error, setError] = useState('');

    // Filters
    const [q, setQ] = useState('');
    const [type, setType] = useState('');
    const [fulfillmentStatus, setFulfillmentStatus] = useState('');

    // Local edit buffers per order
    const [edit, setEdit] = useState({}); // { [orderId]: { trackingUrl, deliveryWindow, fulfillmentStatus, notifyTracking, notifyStatus } }

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
            setError(e?.response?.data?.error || 'Failed to load orders');
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
        <div className={`app-layout ${sidebarOpen ? 'sidebar-active' : ''}`}>
            {/* Mobile header (keeps the dashboard pattern the same) */}
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

            <main className="main-content-container admin-main">
                <PageHeader
                    title="Admin — Orders"
                    subtitle={`Search customers and manage orders. (${filteredCount} result${filteredCount === 1 ? '' : 's'})`}
                    isMobile={isMobile}
                    isSmallMobile={isSmallMobile}
                />

                {/* Filters */}
                <div className="admin-filters">
                    <div className="admin-filters-grid">
                        <input
                            placeholder="Search by email, name, username, userId or orderId"
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            className="admin-input"
                        />
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            className="admin-input"
                        >
                            <option value="">All types</option>
                            <option value="card">Card</option>
                            <option value="subscription">Subscription</option>
                        </select>
                        <select
                            value={fulfillmentStatus}
                            onChange={(e) => setFulfillmentStatus(e.target.value)}
                            className="admin-input"
                        >
                            <option value="">Any status</option>
                            {STATUS_OPTIONS.map((s) => (
                                <option key={s.value} value={s.value}>{s.label}</option>
                            ))}
                        </select>
                        <div className="admin-filter-actions">
                            <button className="cta-blue-button desktop-button" onClick={loadOrders}>
                                Apply
                            </button>
                            <button
                                className="desktop-button admin-reset-btn"
                                onClick={() => { setQ(''); setType(''); setFulfillmentStatus(''); }}
                            >
                                Reset
                            </button>
                        </div>
                    </div>
                    <div className="admin-results-pill">{filteredCount} result{filteredCount === 1 ? '' : 's'}</div>
                </div>

                {/* List */}
                <div className="admin-list">
                    {loading ? (
                        <p>Loading…</p>
                    ) : error ? (
                        <p className="error-text">{error}</p>
                    ) : orders.length === 0 ? (
                        <div className="admin-empty">
                            <div className="admin-empty-badge">Orders</div>
                            <h2 className="admin-empty-title">No orders found</h2>
                            <p className="admin-empty-sub">Try a different search.</p>
                        </div>
                    ) : (
                        <div className="admin-orders-grid">
                            {orders.map((o) => {
                                const id = o._id;
                                const ebuf = edit[id] || {};
                                const isCard = (o.type || '').toLowerCase() === 'card';
                                const isSub = (o.type || '').toLowerCase() === 'subscription';

                                const customerName = o.customerName || o?.metadata?.customerName || '—';
                                const customerEmail = o.customerEmail || o?.metadata?.customerEmail || '—';

                                const deliverTo =
                                    o.deliveryName || o?.metadata?.deliveryName || o?.shipping?.name || '—';
                                const address =
                                    o.deliveryAddress ||
                                    o?.metadata?.deliveryAddress ||
                                    o?.shipping?.address ||
                                    '—';

                                return (
                                    <section key={id} className="admin-order-card">
                                        {/* Header */}
                                        <header className="admin-order-header">
                                            <div className="admin-order-type">
                                                <span className="pill">{o.type || '—'}</span>
                                                <span className="sep">•</span>
                                                <span className="muted">{o.status || '—'}</span>
                                                <span className="sep">•</span>
                                                <span className="muted">{o.createdAt ? new Date(o.createdAt).toLocaleString() : '—'}</span>
                                            </div>
                                            <div className="admin-order-id">
                                                <span className="muted">Order ID:</span>
                                                <code>{id}</code>
                                                <button
                                                    type="button"
                                                    className="admin-copy-btn"
                                                    onClick={() => { navigator.clipboard.writeText(id); toast.success('Copied'); }}
                                                    title="Copy order ID"
                                                >
                                                    Copy
                                                </button>
                                            </div>
                                        </header>

                                        {/* Customer row */}
                                        <div className="admin-customer">
                                            <div><strong>Customer:</strong> {customerName}</div>
                                            <div><strong>Email:</strong> {customerEmail}</div>
                                        </div>

                                        {/* Money / shipping keys */}
                                        <div className="admin-order-kv">
                                            <div><strong>Amount:</strong> {formatAmount(o.amountTotal, o.currency)}</div>
                                            {isCard && <div><strong>Qty:</strong> {o.quantity ?? 1}</div>}
                                            {isSub && o.stripeSubscriptionId && (
                                                <div><strong>Subscription:</strong> <code>{o.stripeSubscriptionId}</code></div>
                                            )}
                                            {isCard && (
                                                <>
                                                    <div><strong>ETA:</strong> {o.deliveryWindow || '—'}</div>
                                                    <div className="admin-wide"><strong>Tracking:</strong> {o.trackingUrl ? <a href={o.trackingUrl} target="_blank" rel="noreferrer">{o.trackingUrl}</a> : '—'}</div>
                                                    <div><strong>Fulfilment:</strong> {o.fulfillmentStatus || 'order_placed'}</div>
                                                    <div><strong>Deliver To:</strong> {deliverTo}</div>
                                                    <div className="admin-wide"><strong>Address:</strong> {address}</div>
                                                </>
                                            )}
                                        </div>

                                        {/* Card-only controls */}
                                        {isCard && (
                                            <>
                                                {/* Tracking & ETA */}
                                                <div className="admin-block">
                                                    <div className="admin-block-title">Tracking &amp; ETA</div>
                                                    <div className="admin-2col">
                                                        <input
                                                            placeholder="Tracking URL (Royal Mail link)"
                                                            value={ebuf.trackingUrl || ''}
                                                            onChange={(e) => setEditField(id, 'trackingUrl', e.target.value)}
                                                            className="admin-input"
                                                        />
                                                        <input
                                                            placeholder="Estimated delivery (e.g. 20–23 Sep)"
                                                            value={ebuf.deliveryWindow || ''}
                                                            onChange={(e) => setEditField(id, 'deliveryWindow', e.target.value)}
                                                            className="admin-input"
                                                        />
                                                    </div>
                                                    <label className="admin-checkbox">
                                                        <input
                                                            type="checkbox"
                                                            checked={!!ebuf.notifyTracking}
                                                            onChange={(e) => setEditField(id, 'notifyTracking', e.target.checked)}
                                                        />
                                                        <span>Email customer “Order shipped — track it here”</span>
                                                    </label>
                                                    <div className="admin-actions">
                                                        <button className="cta-blue-button desktop-button" onClick={() => saveTracking(o)}>
                                                            Save tracking
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Order Status */}
                                                <div className="admin-block">
                                                    <div className="admin-block-title">Order Status</div>
                                                    <div className="admin-2col">
                                                        <select
                                                            value={ebuf.fulfillmentStatus || 'order_placed'}
                                                            onChange={(e) => setEditField(id, 'fulfillmentStatus', e.target.value)}
                                                            className="admin-input"
                                                        >
                                                            {STATUS_OPTIONS.map((opt) => (
                                                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                            ))}
                                                        </select>
                                                        <label className="admin-checkbox">
                                                            <input
                                                                type="checkbox"
                                                                checked={!!ebuf.notifyStatus}
                                                                onChange={(e) => setEditField(id, 'notifyStatus', e.target.checked)}
                                                            />
                                                            <span>Email customer about this status update</span>
                                                        </label>
                                                    </div>
                                                    <div className="admin-actions">
                                                        <button className="cta-blue-button desktop-button" onClick={() => saveStatus(o)}>
                                                            Save status
                                                        </button>
                                                    </div>
                                                </div>
                                            </>
                                        )}

                                        {/* Subscription helper */}
                                        {isSub && o.stripeSubscriptionId && (
                                            <div className="admin-block">
                                                <div className="admin-block-title">Subscription</div>
                                                <div className="admin-sub-row">
                                                    <span className="muted">Stripe ID:</span>
                                                    <code>{o.stripeSubscriptionId}</code>
                                                    <button
                                                        className="admin-danger-btn"
                                                        onClick={() => cancelSubscription(o)}
                                                    >
                                                        Cancel at period end
                                                    </button>
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
