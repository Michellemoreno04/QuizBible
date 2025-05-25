import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/components/firebase/firebaseConfig';
import Purchases from 'react-native-purchases';

export const checkSubscriptionStatus = async (userId) => {
    try {
        const userRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userRef);
        const userData = userDoc.data();

        if (!userData) return { isPremium: false, status: 'no_user_data' };

        const now = new Date();
        const expirationDate = userData.PremiumExpiration?.toDate();

        // Si la fecha de expiración ha pasado y el usuario está marcado como premium
        if (expirationDate && now > expirationDate && userData.Premium) {
            // Verificar con RevenueCat si la suscripción sigue activa
            try {
                const customerInfo = await Purchases.getCustomerInfo();
                const isPremiumActive = customerInfo.entitlements.active['premium'];

                if (!isPremiumActive) {
                    // Actualizar el estado del usuario en Firestore
                    await updateDoc(userRef, {
                        Premium: false,
                        SuscriptionStatus: 'expired',
                        PremiumExpiration: expirationDate
                    });
                    return { isPremium: false, status: 'expired' };
                }
                return { isPremium: true, status: 'active' };
            } catch (error) {
                console.error('Error al verificar con RevenueCat:', error);
                // Si hay error al verificar con RevenueCat, asumimos que expiró
                await updateDoc(userRef, {
                    Premium: false,
                    SuscriptionStatus: 'expired',
                    PremiumExpiration: expirationDate
                });
                return { isPremium: false, status: 'expired' };
            }
        }

        // Si no ha expirado y es premium
        if (userData.Premium && expirationDate && now <= expirationDate) {
            return { isPremium: true, status: 'active' };
        }

        // Si no es premium
        return { isPremium: false, status: 'inactive' };

    } catch (error) {
        console.error('Error al verificar estado de suscripción:', error);
        return { isPremium: false, status: 'error', error: error.message };
    }
};

// Función para configurar el listener de cambios en RevenueCat
export const setupSubscriptionListener = (userId) => {
    const subscription = Purchases.addCustomerInfoUpdateListener(async (info) => {
        const userRef = doc(db, 'users', userId);
        
        try {
            const isPremiumActive = info.entitlements.active['premium'];
            
            if (!isPremiumActive) {
                await updateDoc(userRef, {
                    Premium: false,
                    SuscriptionStatus: 'expired',
                    PremiumExpiration: new Date()
                });
            }
        } catch (error) {
            console.error('Error en el listener de suscripción:', error);
        }
    });

    return subscription;
}; 