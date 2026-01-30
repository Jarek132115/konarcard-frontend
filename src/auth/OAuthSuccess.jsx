// frontend/src/auth/OAuthSuccess.jsx
import { useEffect, useContext, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../components/AuthContext';
import api from '../services/api';

const CLAIM_KEY = 'pendingClaimSlug';
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

        // Store token immediately (api interceptor will attach Bearer automatically)
        login(token, null);

        (async () => {
            try {
                // Pull freshest user
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
                    // ✅ if user already has claim saved in DB, clean up any pending local state
                    try {
                        localStorage.removeItem(CLAIM_KEY);
                        localStorage.removeItem(OAUTH_SOURCE_KEY);
                    } catch { }
                    navigate('/myprofile', { replace: true });
                    return;
                }

                // No claim yet: try to finalize using pending slug
                let pending = '';
                try {
                    pending = (localStorage.getItem(CLAIM_KEY) || '').trim().toLowerCase();
                } catch { }

                if (pending) {
                    try {
                        const res = await api.post('/claim-link', { username: pending });
                        if (!res.data?.error) {
                            await fetchUser();
                            try {
                                localStorage.removeItem(CLAIM_KEY);
                                localStorage.removeItem(OAUTH_SOURCE_KEY);
                            } catch { }
                            navigate('/myprofile', { replace: true });
                            return;
                        }
                    } catch {
                        // fall through to /claim
                    }
                }

                // Otherwise go to claim page
                navigate('/claim', { replace: true });
            } catch {
                navigate('/login?oauth=failed', { replace: true });
            }
        })();
    }, [location.search, navigate, login, fetchUser]);

    return <p style={{ textAlign: 'center', marginTop: '4rem' }}>Signing you in…</p>;
}
