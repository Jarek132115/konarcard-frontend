// frontend/src/pages/interface/ClaimLink.jsx
import React, { useState, useContext, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../../services/api';
import { AuthContext } from '../../components/AuthContext';

export default function ClaimLink() {
    const navigate = useNavigate();
    const { fetchUser } = useContext(AuthContext);

    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(false);

    const cleaned = useMemo(() => {
        return (username || '')
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9._-]/g, '');
    }, [username]);

    const submit = async (e) => {
        e.preventDefault();

        if (!cleaned) return toast.error('Please enter a link name.');
        if (cleaned.length < 3) return toast.error('Link name must be at least 3 characters.');

        // ✅ Force attach token (do NOT rely only on interceptor)
        const token = localStorage.getItem('token');
        if (!token) {
            toast.error('You must be logged in.');
            navigate('/login', { replace: true });
            return;
        }

        setLoading(true);
        try {
            const res = await api.post(
                '/claim-link',
                { username: cleaned },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (res?.data?.error) {
                toast.error(res.data.error);
                return;
            }

            // ✅ If backend treated it as "availability only", it returns available:true but no user
            if (!res?.data?.user) {
                toast.error('Claim did not save. Please try again.');
                return;
            }

            toast.success('Link claimed successfully!');

            // refresh user in context/localStorage
            await fetchUser();

            // cleanup any pending keys
            try {
                localStorage.removeItem('pendingClaimUsername');
                localStorage.removeItem('oauthSource');
            } catch { }

            navigate('/myprofile', { replace: true });
        } catch (err) {
            toast.error(err?.response?.data?.error || 'Failed to claim link.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="kc-auth-page">
            <main className="kc-auth-main">
                <div className="kc-auth-inner">
                    <h1 className="kc-title">Claim Your Link</h1>
                    <p className="kc-subtitle">This is your unique link.</p>

                    <form onSubmit={submit} className="kc-form">
                        <div style={{ width: '100%', display: 'flex', gap: 12, alignItems: 'center' }}>
                            <div style={{ flex: 1 }}>
                                <label className="kc-label" style={{ display: 'block', marginBottom: 8 }}>
                                    Claim Your Link Name
                                </label>

                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <div
                                        style={{
                                            padding: '12px 14px',
                                            border: '1px solid #e6e6e6',
                                            borderRight: 'none',
                                            borderRadius: '10px 0 0 10px',
                                            background: '#fafafa',
                                            color: '#666',
                                            fontSize: 14,
                                            whiteSpace: 'nowrap',
                                        }}
                                    >
                                        www.konarcard.com/u/
                                    </div>

                                    <input
                                        className="kc-input"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        placeholder="yourname"
                                        autoComplete="off"
                                        style={{ borderRadius: '0 10px 10px 0' }}
                                        required
                                    />
                                </div>

                                <p style={{ marginTop: 10, fontSize: 13, color: '#666', textAlign: 'center' }}>
                                    Free to claim. No payment needed.
                                </p>
                            </div>
                        </div>

                        <button className="kc-btn kc-btn-primary kc-btn-center" disabled={loading} aria-busy={loading}>
                            {loading ? 'Claiming…' : 'Claim Link'}
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
}
