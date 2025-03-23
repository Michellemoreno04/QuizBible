import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../../components/firebase/firebaseConfig';
import { useNavigation } from '@react-navigation/native';


const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigation = useNavigation();
// Función para verificar si el usuario está autenticado
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            setUser(user);
            setLoading(false);
            if (user) {
                console.log('User signed in:', user.email);
            } else {
                console.log('User signed out');
                navigation.navigate("signUpScreen");
            }
        })

        return () => unsubscribe(); // Limpieza del listener
    }, [user]);

    const signIn = async (email, password) => {
        await auth.signInWithEmailAndPassword(email, password);
    };

     const signOut = async () => {
         await auth.signOut();
         console.log('User signed out');
         
         navigation.navigate("signUpScreen"); 
        
    };

    return (
        <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
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