// frontend/src/auth/OAuthSuccess.jsx
import { useEffect, useContext, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../components/AuthContext';
import api from '../services/api';

const PENDING_CLAIM_KEY = 'pendingClaimUsername';
const OAUTH_SOURCE_KEY = 'oauthSource'; // 'register' | 'login'

export default function OAuthSuccess() {
    const navigate = useNavigate();
    const location = useLocation();
    const { login, fetchUser } = useContext(AuthContext);
    const ranRef = useRef(false);

    useEffect(() => {
        if (ranRef.current) return;
        ranRef.current = true;

        const params = new URLSearchParams(location.search);
        const token = params.get('token');

        if (!token) {
            navigate('/login?oauth=missing_token', { replace: true });
            return;
        }

        // store token immediately
        login(token, null);

        (async () => {
            try {
                const fresh = await fetchUser();
                const user =
                    fresh ||
                    (() => {
                        try {
                            return JSON.parse(localStorage.getItem('authUser') || 'null');
                        } catch {
                            return null;
                        }
                    })();

                const hasClaim = !!(user?.username || user?.slug || user?.profileUrl);
                if (hasClaim) {
                    // cleanup
                    try {
                        localStorage.removeItem(PENDING_CLAIM_KEY);
                        localStorage.removeItem(OAUTH_SOURCE_KEY);
                    } catch { }
                    navigate('/myprofile', { replace: true });
                    return;
                }

                // No claim yet: see if we came from Register with a pending username
                let pending = '';
                let source = '';
                try {
                    pending = (localStorage.getItem(PENDING_CLAIM_KEY) || '').trim().toLowerCase();
                    source = localStorage.getItem(OAUTH_SOURCE_KEY) || '';
                } catch { }

                // ✅ Only auto-claim if they came from REGISTER flow
                if (source === 'register' && pending) {
                    try {
                        const res = await api.post('/claim-link', { username: pending });
                        if (!res.data?.error) {
                            // claimed OK
                            await fetchUser();
                            try {
                                localStorage.removeItem(PENDING_CLAIM_KEY);
                                localStorage.removeItem(OAUTH_SOURCE_KEY);
                            } catch { }
                            navigate('/myprofile', { replace: true });
                            return;
                        }
                    } catch {
                        // fall through to /claim
                    }
                }

                // Otherwise (login flow or no pending) -> go claim manually
                navigate('/claim', { replace: true });
            } catch {
                navigate('/login?oauth=failed', { replace: true });
            }
        })();
    }, [location.search, navigate, login, fetchUser]);

    return <p style={{ textAlign: 'center', marginTop: '4rem' }}>Signing you in…</p>;
}
