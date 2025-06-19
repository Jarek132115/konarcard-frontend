import { createContext, useEffect, useState } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    const fetchUser = async () => {
        try {
            const res = await fetch('https://konarcard-backend-331608269918.europe-west1.run.app/profile', { // Your default Cloud Run URL                credentials: 'include',
            });
            const data = await res.json();
            if (data && data._id) {
                setUser(data);
            } else {
                setUser(null);
            }
        } catch (err) {
            setUser(null);
        }
    };

    useEffect(() => {
        fetchUser();
        window.addEventListener('focus', fetchUser);
        return () => window.removeEventListener('focus', fetchUser);
    }, []);

    return (
        <AuthContext.Provider value={{ user, setUser, fetchUser }}>
            {children}
        </AuthContext.Provider>
    );
};
