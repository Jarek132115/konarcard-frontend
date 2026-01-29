// frontend/src/auth/OAuthSuccess.jsx
import { useEffect, useContext, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../components/AuthContext';

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

                const hydrated =
                    fresh ||
                    (() => {
                        try {
                            return JSON.parse(localStorage.getItem('authUser') || 'null');
                        } catch {
                            return null;
                        }
                    })();

                const hasClaim = !!(hydrated?.username || hydrated?.slug || hydrated?.profileUrl);

                if (!hasClaim) navigate('/claim', { replace: true });
                else navigate('/myprofile', { replace: true });
            } catch {
                navigate('/login?oauth=failed', { replace: true });
            }
        })();
    }, [location.search, navigate, login, fetchUser]);

    return <p style={{ textAlign: 'center', marginTop: '4rem' }}>Signing you in…</p>;
}
