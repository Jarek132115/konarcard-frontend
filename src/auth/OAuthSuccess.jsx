import { useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../components/AuthContext';

export default function OAuthSuccess() {
    const navigate = useNavigate();
    const location = useLocation();
    const { login, fetchUser } = useContext(AuthContext);

    useEffect(() => {
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
                await fetchUser();

                // read hydrated user (avoids relying on fetchUser return value)
                let hydrated = null;
                try {
                    hydrated = JSON.parse(localStorage.getItem('authUser') || 'null');
                } catch {
                    hydrated = null;
                }

                const hasClaim = !!(hydrated?.username || hydrated?.slug || hydrated?.profileUrl);

                if (!hasClaim) {
                    // ✅ change this route if your claim page is different
                    navigate('/claim', { replace: true });
                } else {
                    navigate('/myprofile', { replace: true });
                }
            } catch {
                navigate('/login?oauth=failed', { replace: true });
            }
        })();
    }, [login, fetchUser, navigate, location.search]);

    return <p style={{ textAlign: 'center', marginTop: '4rem' }}>Signing you in…</p>;
}
