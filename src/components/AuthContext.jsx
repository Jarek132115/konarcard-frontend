import { createContext, useEffect, useState } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    const fetchUser = async () => {
        try {
            const res = await fetch('http://localhost:8000/profile', {
                credentials: 'include',
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
