// frontend/src/pages/interface/ClaimLink.jsx
import { useState, useRef } from 'react';
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
            <main className="kc-auth-main">
                <div className="kc-auth-inner">
                    <h1 className="kc-title">Claim your link</h1>
                    <p className="kc-subtitle">
                        Choose your unique KonarCard link
                    </p>

                    <form className="kc-form" onSubmit={submit}>
                        <div className="kc-claim" onClick={() => inputRef.current?.focus()}>
                            <span className="kc-claim-prefix">konarcard.com/u/</span>
                            <input
                                ref={inputRef}
                                className="kc-input kc-claim-input"
                                placeholder="yourname"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                autoComplete="off"
                                required
                            />
                        </div>

                        <button
                            className="kc-btn kc-btn-primary kc-btn-center"
                            disabled={loading}
                        >
                            {loading ? 'Saving…' : 'Claim link'}
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
}
