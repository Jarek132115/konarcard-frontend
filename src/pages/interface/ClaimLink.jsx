// frontend/src/pages/interface/ClaimLink.jsx
import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../../services/api';
import '../../styling/login.css';

const DOMAIN_PREFIX = 'www.konarcard.com/u/';

export default function ClaimLink() {
    const navigate = useNavigate();
    const inputRef = useRef(null);

    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(false);

    const sanitizeUsername = (raw) =>
        (raw || '').trim().toLowerCase().replace(/[^a-z0-9._-]/g, '');

    
    const submit = async (e) => {
        e.preventDefault();

        const clean = sanitizeUsername(username);
        if (!clean) return toast.error('Please enter a link name.');
        if (clean.length < 3) return toast.error('Link name must be at least 3 characters.');

        setLoading(true);
        try {
            const res = await api.post('/claim-link', { username: clean }); 

            if (res.data?.error) {
                toast.error(res.data.error);
                return;
            }

            toast.success('Link claimed successfully!');
            navigate('/myprofile', { replace: true });
        } catch (err) {
            toast.error(err?.response?.data?.error || err?.response?.data?.message || 'Failed to claim link.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="kc-auth-page">
            <header className="kc-auth-header">
                <button
                    type="button"
                    className="kc-close"
                    onClick={() => navigate('/myprofile')}
                    aria-label="Close"
                >
                    <span aria-hidden="true">×</span>
                </button>
            </header>

            <main className="kc-auth-main">
                <div className="kc-auth-inner">
                    <h1 className="kc-title">Claim your link</h1>
                    <p className="kc-subtitle">Choose your unique KonarCard link.</p>

                    <form className="kc-form kc-form-claim" onSubmit={submit}>
                        <div
                            className="kc-claim"
                            onClick={() => inputRef.current?.focus?.()}
                            role="group"
                            aria-label="Claim your link input"
                        >
                            <span className="kc-claim-prefix">{DOMAIN_PREFIX}</span>
                            <span className="kc-claim-sep">|</span>
                            <input
                                ref={inputRef}
                                className="kc-input kc-claim-input"
                                type="text"
                                placeholder="yourbusinessname"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                autoComplete="off"
                                required
                            />
                        </div>

                        <p className="kc-microcopy">Free to claim. No payment needed.</p>

                        <button
                            type="submit"
                            className="kc-btn kc-btn-primary kc-btn-center"
                            disabled={loading}
                            aria-busy={loading}
                        >
                            {loading ? 'Saving…' : 'Claim link'}
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
}
