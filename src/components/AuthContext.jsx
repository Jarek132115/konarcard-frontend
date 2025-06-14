import { createContext, useState, useEffect, useContext } from 'react'
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    const fetchUser = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/profile`, {
                credentials: 'include',
            });
            const data = await res.json();
            if (data && data._id) {
                setUser(data);
            } else {
                setUser(null);
            }
        } catch (err) {
            console.error("AuthContext fetchUser failed:", err);
            setUser(null);
        }
    };

    useEffect(() => {
        fetchUser();
        if (typeof window !== 'undefined') {
            window.addEventListener('focus', fetchUser);
            return () => window.removeEventListener('focus', fetchUser);
        }
    }, []);

    return (
        <AuthContext.Provider value={{ user, setUser, fetchUser }}>
            {children}
        </AuthContext.Provider>
    );
};