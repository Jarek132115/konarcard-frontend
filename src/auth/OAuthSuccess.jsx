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

        // store token immediately (user will be fetched next)
        login(token, null);

        // hydrate user then go dashboard
        (async () => {
            await fetchUser();
            navigate('/myprofile', { replace: true });
        })();
    }, [login, fetchUser, navigate, location.search]);

    return <p style={{ textAlign: 'center', marginTop: '4rem' }}>Signing you in…</p>;
}
