import { useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../components/AuthContext';

export default function OAuthSuccess() {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useContext(AuthContext);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const token = params.get('token');

        if (!token) {
            // No token → something went wrong, send to login
            navigate('/login', { replace: true });
            return;
        }

        // Save token via AuthContext
        // AuthContext should store token (localStorage/cookie) and fetch profile
        login(token);

        // Redirect to dashboard
        navigate('/myprofile', { replace: true });
    }, [login, navigate, location.search]);

    // Optional: loading state (prevents blank flash)
    return <p style={{ textAlign: 'center', marginTop: '4rem' }}>Signing you in…</p>;
}
