import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../../components/firebase/firebaseConfig';


const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            setUser(user);
            setLoading(false);
            if (user) {
                console.log('User signed in:', user.email);
                setIsAuthenticated(true);
            } else {
                console.log('No user signed in');
            }
        });

        return () => unsubscribe();
    }, []);

    const signIn = async (email, password) => {
        try {
            await auth.signInWithEmailAndPassword(email, password);
        } catch (error) {
            throw error;
        }
    };

    const signOut = async () => {
        try {
            await auth.signOut();
            console.log('User signed out');
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, signIn, signOut, isAuthenticated }}>
            {children}
        </AuthContext.Provider>
    );
};

export default function useAuth (){
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe usarse dentro de un AuthProvider');
    }
    return context;
};