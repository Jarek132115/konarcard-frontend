import { useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../components/AuthContext';

export default function OAuthSuccess() {
    const navigate = useNavigate();
    const { login } = useContext(AuthContext);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');

        if (!token) {
            navigate('/login', { replace: true });
            return;
        }

        // If your AuthContext login expects (token, user), you can decode user later
        // For now: store token then fetch /profile on app load (common pattern)
        login(token, null);
        navigate('/myprofile', { replace: true });
    }, [login, navigate]);

    return null;
}
