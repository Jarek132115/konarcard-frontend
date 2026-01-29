// frontend/src/pages/interface/ClaimLink.jsx
import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../../services/api';
import '../../styling/login.css';

export default function ClaimLink() {
    const navigate = useNavigate();
    const inputRef = useRef(null);

    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(false);

    const submit = async (e) => {
        e.preventDefault();

        const clean = username.trim().toLowerCase();
        if (!clean) {
            toast.error('Please enter a link name.');
            return;
        }

        setLoading(true);
        try {
            const res = await api.post('/claim-link', { username: clean });

            if (res.data?.error) {
                toast.error(res.data.error);
                setLoading(false);
                return;
            }

            toast.success('Link claimed successfully!');
            navigate('/myprofile', { replace: true });
        } catch (err) {
            toast.error(err?.response?.data?.error || 'Failed to claim link.');
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
                            <span className="kc-claim-prefix">www.konarcard.com/u/</span>
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
