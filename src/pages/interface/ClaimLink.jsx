import React, { useState, useContext, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../../services/api';
import { AuthContext } from '../../components/AuthContext';
import '../../styling/login.css';

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
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (res?.data?.error) {
                toast.error(res.data.error);
                return;
            }

            if (!res?.data?.user) {
                toast.error('Claim did not save. Please try again.');
                return;
            }

            toast.success('Link claimed successfully!');
            await fetchUser();

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
            <header className="kc-auth-header">
                <Link to="/" className="kc-logo" aria-label="KonarCard Home">K</Link>
                <button type="button" className="kc-close" onClick={() => navigate('/myprofile')} aria-label="Close">
                    <span aria-hidden="true">×</span>
                </button>
            </header>

            <main className="kc-auth-main">
                <div className="kc-auth-inner">
                    <h1 className="kc-title">Claim Your Link</h1>
                    <p className="kc-subtitle">
                        This is your unique link. When someone clicks it, they see your digital business card.
                    </p>

                    <form onSubmit={submit} className="kc-form kc-form-claim">
                        <div className="kc-field">
                            <label className="kc-label">Claim Your Link Name</label>

                            <div className="kc-claim">
                                <div className="kc-claim-prefix">www.konarcard.com/u/</div>
                                <div className="kc-claim-sep">|</div>
                                <input
                                    className="kc-input kc-claim-input"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="yourbusinessname"
                                    autoComplete="off"
                                    required
                                />
                            </div>

                            <p className="kc-microcopy">Free to claim. No payment needed.</p>
                        </div>

                        <button className="kc-btn kc-btn-primary kc-btn-center" disabled={loading} aria-busy={loading}>
                            {loading ? 'Claiming…' : 'Claim Link'}
                        </button>

                        <p className="kc-bottom-line">
                            Already have an account? <Link className="kc-link" to="/login">Sign In</Link>
                        </p>
                    </form>
                </div>
            </main>
        </div>
    );
}
