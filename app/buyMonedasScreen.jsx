import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Platform, StatusBar, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Purchases from 'react-native-purchases';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import useAuth from '../components/authContext/authContext';
import { db } from '../components/firebase/firebaseConfig';
import { doc, increment, updateDoc, collection, addDoc, getDoc } from 'firebase/firestore';
import { useToast } from 'react-native-toast-notifications';
import { PremiumButton } from '@/constants/premiumBoton';



const BuyMonedasScreen = () => {
    const navigation = useNavigation();
    const appleKey = process.env.EXPO_PUBLIC_REVENEUCAT_API_KEY_IOS;
    const googleKey = process.env.EXPO_PUBLIC_REVENEUCAT_API_KEY_ANDROID;
    const [offerings, setOfferings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [purchasing, setPurchasing] = useState(false);
    const [error, setError] = useState(null);
    const [selectedPackage, setSelectedPackage] = useState(null);
    const [userinfo, setUserinfo] = useState(null);
    const {user} = useAuth();
    const userId = user.uid;

    const toast = useToast();


    // Mapeo de identificadores de productos a cantidades de monedas
    const COIN_PACKAGES = {
        'monedas_id1': 1000,
        '2000_monedas_id': 2000
    };

    // Obtener el usuario de la base de datos
    useEffect(() => {
        const fetchUserInfo = async () => {
            const userRef = doc(db, 'users', userId);
            const userDoc = await getDoc(userRef);
            setUserinfo(userDoc.data());
        };
        fetchUserInfo();
    }, [userId]);

    const setupRevenueCat = async () => {
        try {
            if (Platform.OS === 'ios') {
                Purchases.configure({ apiKey: appleKey });
            } else {
                Purchases.configure({ apiKey: googleKey });
            }
            
            Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG);
            const offeringsResult = await Purchases.getOfferings();
           // console.log('Offerings completos:', JSON.stringify(offeringsResult, null, 2));
            setOfferings(offeringsResult);
        } catch (error) {
            console.log('Error al configurar RevenueCat:', error);
            setError('Error al cargar las ofertas');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setupRevenueCat();
    }, []);
    
    const handlePurchase = async (pkg) => {
        setPurchasing(true);
        try {
            console.log('Iniciando compra del paquete:', pkg.identifier);
            setSelectedPackage(pkg);
            const { customerInfo } = await Purchases.purchasePackage(pkg); 
            console.log('Compra completada, customerInfo:', customerInfo);
            
            // Obtener la cantidad de monedas del mapeo
            const cantidadMonedas = COIN_PACKAGES[pkg.product.identifier] || 0;
            
            if (cantidadMonedas <= 0) {
                throw new Error('Paquete de monedas no válido');
            
            }
            
            // Crear un objeto con los datos de la compra
            const purchaseData = {
                date: new Date(),
                package: pkg.identifier,
                transactionId: customerInfo.originalTransactionId || `temp_${Date.now()}`,
                platform: Platform.OS,
                price: pkg.product.price || 0,
                currency: pkg.product.currency || 'USD',
                //status: 'active',
                productId: pkg.product.identifier || '',
                store: Platform.OS === 'ios' ? 'App Store' : 'Google Play',
                cantidadMonedas: cantidadMonedas // Agregamos la cantidad de monedas al registro
            };

            // Actualizar el documento del usuario
            const userRef = doc(db, 'users', userId);
            console.log('Actualizando monedas para usuario:', userId);
            await updateDoc(userRef, {
                Monedas: increment(cantidadMonedas),
                LastPurchaseDate: new Date()
            });
            console.log('Monedas actualizadas exitosamente');

            // Guardar la compra en la subcolección purchases
            const purchasesRef = collection(db, 'users', userId, 'Purchases');
            await addDoc(purchasesRef, purchaseData);
            console.log('Compra guardada en la base de datos');

            toast.show(`¡Compra exitosa! Se agregaron ${cantidadMonedas} monedas`, {
                type: 'success',
                placement: 'top',
                duration: 3000,
                offset: 30,
            });

            navigation.goBack();
        } catch (error) {
            console.log('Error detallado en la compra:', error);
            if (!error.userCancelled) {
                setError('Error al procesar la compra');
                console.log('Error en la compra:', error);
            }
        } finally {
            setPurchasing(false);
            setSelectedPackage(null);
        }
    };

   // console.log('offerings: ', offerings);

    const renderPaquetes = () => {
        const paquetes200Monedas = offerings?.all?.["200Monedas"]?.availablePackages || [];
        const paquetesMonedasIdentifier = offerings?.all?.monedas_identifier?.availablePackages || [];
        
        // Ordenar los paquetes por cantidad de monedas (1000 primero, 2000 después)
        const todosLosPaquetes = [...paquetesMonedasIdentifier, ...paquetes200Monedas].sort((a, b) => {
            const cantidadA = COIN_PACKAGES[a.product.identifier] || 0;
            const cantidadB = COIN_PACKAGES[b.product.identifier] || 0;
            return cantidadA - cantidadB;
        });

        if (todosLosPaquetes.length === 0) {
            return (
                <View style={styles.emptyContainer}>
                    <FontAwesome5 name="coins" size={50} color="#FFD700" style={styles.emptyIcon} />
                    <Text style={styles.emptyText}>No hay paquetes de monedas disponibles en este momento</Text>
                </View>
            );
        }

        return (
            <View style={styles.paquetesContainer}>
                {/* Sección de Suscripción */}
                <View style={styles.suscripcionCard}>
                    <View style={styles.suscripcionContainer}>
                        <Text style={styles.suscripcionText}>¡Suscríbete!</Text>
                        <Text style={styles.suscriptionDescription}>Disfruta de todos los beneficios premium</Text>
                        <View style={styles.beneficiosContainer}>
                            <Text style={styles.beneficiosText}>🔇</Text>
                            <Text style={styles.beneficiosText}>💰</Text>
                            <Text style={styles.beneficiosText}>❤️</Text>
                            <FontAwesome5 name="headset" size={32} style={styles.beneficiosText} />
                        </View>
                        <PremiumButton />
                    </View>
                </View>

                {/* Paquetes de Monedas */}
                {todosLosPaquetes.map((pkg, index) => {
                    // Determinar la cantidad de monedas basado en el identificador del producto
                    const cantidadMonedas = COIN_PACKAGES[pkg.product.identifier] || 0;
                    
                    return (
                        <View key={`monedas-${pkg.identifier}-${index}`} style={styles.monedasCard}>
                            <View style={styles.monedasContent}>
                                <Image 
                                    source={cantidadMonedas === 2000 
                                        ? require('../assets/images/2000Monedas.png')
                                        : require('../assets/images/1000Monedas.png')} 
                                    style={styles.monedas} 
                                />
                                <View style={styles.monedasInfo}>
                                    <Text style={styles.monedasTitulo}>+{pkg.product.title}</Text>
                                    <Text style={styles.cantidadMonedas}>{pkg.product.description}</Text>
                                </View>
                                <TouchableOpacity
                                    style={styles.buyButton}
                                    onPress={() => handlePurchase(pkg)}
                                    disabled={purchasing}
                                >
                                    <Text style={styles.buyButtonText}>
                                        {pkg.product.priceString}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    );
                })}
            </View>
        );
    };

    if (loading) {
        return (
            <View style={[styles.container, styles.loadingContainer]}>
                <ActivityIndicator size="large" color="#FFD700" />
            </View>
        );
    }

    if (error) {
        return (
            <View style={[styles.container, styles.errorContainer]}>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity 
                    style={styles.retryButton}
                    onPress={() => {
                        setError(null);
                        setLoading(true);
                        setupRevenueCat();
                    }}
                >
                    <Text style={styles.retryButtonText}>Reintentar</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle={Platform.OS === 'ios' ? 'light-content' : 'dark-content'} />
            <LinearGradient
                colors={['#A259E6', '#6D2B8B']}
                style={styles.gradientContainer}
                start={{x: 0, y: 0}}
                end={{x: 0, y: 1}}
            >
                {/* Cabecera */}
                <View style={styles.headerRow}>
                    <TouchableOpacity 
                        style={styles.closeButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Ionicons name="close" size={28} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.titulo}>Tienda</Text>
                    <View style={styles.balanceContainer}>
                        <FontAwesome5 name="coins" size={22} color="#FFD700" />
                        <Text style={styles.balanceText}>{userinfo?.Monedas || 0}</Text>
                    </View>
                </View>
                {/* Fin Cabecera */}
                <ScrollView style={styles.scrollView} contentContainerStyle={{paddingBottom: 30}}>
                    {renderPaquetes()}
                    
                </ScrollView>
            </LinearGradient>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.bgApp,
        paddingTop: Platform.OS === 'ios' ? 0 : StatusBar.currentHeight,
    },
    gradientContainer: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 18,
        paddingTop: Platform.OS === 'ios' ? 50 : 40,
        paddingBottom: 10,
    },
    closeButton: {
        position: 'absolute',
        top: 10,
        right: 20,
        zIndex: 1,
        ...Platform.select({
            android: {
                right: 10,
                marginBottom: 10,
            }
        })
       
    },
    titulo: {
        color: '#fff',
        fontSize: 32,
        fontWeight: 'bold',
        textAlign: 'center',
        flex: 1,
        textShadowColor: '#000',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 5,
    },
    balanceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2D1457',
        borderRadius: 18,
        borderWidth: 2,
        borderColor: '#FFD700',
        paddingHorizontal: 14,
        paddingVertical: 6,
    },
    balanceText: {
        color: '#FFD700',
        fontWeight: 'bold',
        fontSize: 18,
        marginLeft: 6,
    },
    suscripcionContainer: {
        backgroundColor: 'rgba(45, 20, 87, 0.5)',
        borderRadius: 26,
        padding: 20,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 215, 0, 0.3)',
    },
    suscripcionText: {
        color: '#FFD700',
        fontWeight: 'bold',
        fontSize: 18,
        marginLeft: 6,
    },
    suscriptionDescription: {
        color: '#FFD700',
        //textAlign: 'center'
       
    },
    beneficiosContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginVertical: 10,
    },
    beneficiosText: {
       
        color: '#FFD700',
        fontWeight: 'bold',
        fontSize: 25,
        borderWidth: 1,
        borderColor: 'rgba(255, 215, 0, 0.5)',
        borderRadius: 10,
        paddingHorizontal: 5,
        paddingVertical: 2,
        marginHorizontal: 10,
    },
    paquetesContainer: {
        padding: 10,
        gap: 5,
    },
    suscripcionCard: {
        marginBottom: 10,
        borderRadius: 26,
        overflow: 'hidden',
    },
    monedasCard: {
        borderRadius: 26,
        overflow: 'hidden',
        backgroundColor: 'rgba(45, 20, 87, 0.5)',
        borderWidth: 1,
        borderColor: 'rgba(255, 215, 0, 0.3)',
    },
    monedasContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 15,
    },
    monedas: {
        width: 70,
        height: 70,
        marginRight: 15,
    },
    monedasInfo: {
        flex: 1,
        alignItems: 'center',
    },
    monedasTitulo: {
        color: '#FFD700',
        fontWeight: 'bold',
        fontSize: 20,
        marginBottom: 4,
        textAlign: 'center',
    },
    cantidadMonedas: {
        color: '#FFD700',
        fontSize: 14,
        opacity: 0.9,
    },
    buyButton: {
        backgroundColor: '#1ED760',
        borderRadius: 18,
        paddingHorizontal: 15,
        paddingVertical: 10,
        minWidth: 90,
        alignItems: 'center',
    },
    buyButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 15,
    },
    loadingContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        color: '#fff',
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 20,
    },
    retryButton: {
        backgroundColor: '#FFD700',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
    },
    retryButtonText: {
        color: '#000',
        fontWeight: '600',
    },
    emptyContainer: {
        padding: 30,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 40,
    },
    emptyIcon: {
        marginBottom: 20,
        opacity: 0.7,
    },
    emptyText: {
        color: '#fff',
        fontSize: 18,
        textAlign: 'center',
        opacity: 0.8,
    },
});

export default BuyMonedasScreen;
