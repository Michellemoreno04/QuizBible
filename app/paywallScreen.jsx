import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Platform, ScrollView, Dimensions, StatusBar} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome5, Ionicons, Entypo, AntDesign } from '@expo/vector-icons';
import Purchases from 'react-native-purchases';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../constants/Colors';
import  useAuth  from '../components/authContext/authContext';
import {db} from '../components/firebase/firebaseConfig';
import { doc, increment, updateDoc, collection, addDoc } from 'firebase/firestore';
import { useToast } from 'react-native-toast-notifications';

const { width} = Dimensions.get('screen');



const Paywall = () => {
    const navigation = useNavigation();
    const appleKey = process.env.EXPO_PUBLIC_REVENEUCAT_API_KEY_IOS;
    const googleKey = process.env.EXPO_PUBLIC_REVENEUCAT_API_KEY_ANDROID;

    const [offerings, setOfferings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [purchasing, setPurchasing] = useState(false);
    const [error, setError] = useState(null);
    const [selectedPackage, setSelectedPackage] = useState(null);
    const [selectedPlan, setSelectedPlan] = useState(null);

    const { user } = useAuth();
    const toast = useToast();

    useEffect(() => {
        setupRevenueCat();
    }, []);

    const setupRevenueCat = async () => {
        try {
            if (Platform.OS === 'ios') {
                Purchases.configure({ apiKey: appleKey });
            } else {
                Purchases.configure({ apiKey: googleKey });
            }
            
            Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG);
            const offeringsResult = await Purchases.getOfferings();
            setOfferings(offeringsResult);
        } catch (error) {
            console.log('Error al configurar RevenueCat:', error);
            setError('Error al cargar las ofertas');
        } finally {
            setLoading(false);
        }
    };

    
   

    const handlePurchase = async (pkg) => {
        try {
            setPurchasing(true);
            setSelectedPackage(pkg);
            const { customerInfo } = await Purchases.purchasePackage(pkg);
            
            if (customerInfo.entitlements.active['premium']) {
                // Crear un objeto con los datos de la compra
                const purchaseData = {
                    date: new Date(),
                    package: pkg.identifier,
                    transactionId: customerInfo.originalTransactionId || `temp_${Date.now()}`,
                    platform: Platform.OS,
                    price: pkg.product.price || 0, 
                    currency: pkg.product.currency || 'USD',
                    period: pkg.identifier.includes('annual') ? 'annual' : 'monthly',
                    status: 'active',
                    productId: pkg.product.identifier || '', 
                    store: Platform.OS === 'ios' ? 'App Store' : 'Google Play'
                };

                // Actualizar el documento del usuario con la información básica
                const userRef = doc(db, 'users', user.uid);
                const userUpdateData = {
                    Premium: true,
                    PremiumExpiration: new Date(Date.now() + (pkg.identifier.includes('annual') ? 365 : 30) * 24 * 60 * 60 * 1000),
                    SuscriptionStartDate: new Date(),
                    SuscriptionStatus: 'active',
                    Platform: Platform.OS,
                    Monedas: increment(1000),
                    LastPurchaseDate: new Date()
                };

                // Solo agregamos OriginalTransactionId si existe
                if (customerInfo.originalTransactionId) {
                    userUpdateData.OriginalTransactionId = customerInfo.originalTransactionId;
                }

                await updateDoc(userRef, userUpdateData);

                // Guardar la compra en la subcolección purchases
                const purchasesRef = collection(db, 'users', user.uid, 'Purchases');
                await addDoc(purchasesRef, purchaseData);

                toast.show('Compra exitosa!', {
                    type: 'success',
                    placement: 'top',
                    duration: 3000,
                    offset: 30,
                });
                console.log('Compra exitosa!');
                navigation.replace('premiumWelcomeScreen');
            }
        

        } catch (error) {
            if (!error.userCancelled) {
                setError('Error al procesar la compra');
                console.log('Error en la compra:', error);
            }
        } finally {
            setPurchasing(false);
            setSelectedPackage(null);
        }
    };

    const handlePlanSelection = (pkg) => {
        setSelectedPlan(pkg);
    };

    const handlePurchaseSelected = async () => {
        if (!selectedPlan) {
            setError('Por favor, selecciona un plan');
            return;
        }
        await handlePurchase(selectedPlan);
    };

    // aqui se renderiza el precio de los planes
    const renderPricingCards = () => {
        if (!offerings?.current?.availablePackages) {
            return null;
        }

        // Encontrar los paquetes mensual y anual
        const monthlyPackage = offerings.current.availablePackages.find(pkg => !pkg.identifier.includes('annual'));
        const annualPackage = offerings.current.availablePackages.find(pkg => pkg.identifier.includes('annual'));

        // Calcular el porcentaje de ahorro si ambos paquetes existen
        let savingsPercentage = 0;
        if (monthlyPackage && annualPackage) {
            const monthlyPrice = monthlyPackage.product.price;
            const annualPrice = annualPackage.product.price;
            const yearlyMonthlyCost = monthlyPrice * 12;
            savingsPercentage = ((yearlyMonthlyCost - annualPrice) / yearlyMonthlyCost) * 100;
        }

        return (
            <View style={styles.pricingWrapper}>
                {offerings.current.availablePackages.map((pkg, index) => {
                    const isRecommended = pkg.identifier.includes('annual');
                    const price = pkg.product.priceString;
                    const period = pkg.identifier.includes('annual') ? 'Anual' : 'Mensual';
                    const savings = pkg.identifier.includes('annual') 
                        ? `Ahorra un ${savingsPercentage.toFixed(1)}%` 
                        : 'Facturación mensual';
                    const isSelected = selectedPlan?.identifier === pkg.identifier;
                    
                    return (
                        <TouchableOpacity 
                            key={pkg.identifier}
                            style={[
                                styles.pricingCard, 
                                isRecommended && styles.recommended,
                                isSelected && styles.selectedCard
                            ]}
                            onPress={() => handlePlanSelection(pkg)}
                            disabled={purchasing}
                        >
                            {isRecommended && (
                                <View style={styles.recommendedBadge}>
                                    <Text style={styles.recommendedText}>MEJOR OFERTA</Text>
                                </View>
                            )}
                            <Text style={styles.pricingTitle}>{period}</Text>
                            <Text style={styles.pricingPrice}>{price}</Text>
                            <Text style={styles.pricingSubtext}>{savings}</Text>
                            {isSelected && (
                                <View style={styles.selectedIndicator}>
                                    <Ionicons name="checkmark-circle" size={24} color="#FFD700" />
                                </View>
                            )}
                            {purchasing && selectedPackage?.identifier === pkg.identifier && (
                                <ActivityIndicator color="#FFD700" style={styles.loadingIndicator} />
                            )}
                        </TouchableOpacity>
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
        <View style={[styles.container, { flex: 1 }]}>
            <StatusBar barStyle={Platform.OS === 'ios' ? 'light-content' : 'dark-content'} />
            <LinearGradient
                colors={Colors.bgApp}
                style={[styles.gradientContainer, { flex: 1 }]}
                start={{x: 0, y: 0}}
                end={{x: 0, y: 1}}
            >
                <ScrollView 
                    contentContainerStyle={[styles.scrollContent, { flexGrow: 1 }]}
                    style={{ flex: 1 }}
                >
                    {/* Header Section */}
                    <View style={styles.header}>
                        <TouchableOpacity 
                            style={styles.closeButton}
                            onPress={() => navigation.goBack()}
                        >
                            <Ionicons name="close" size={28} color="#fff" />
                        </TouchableOpacity>
                        <View style={styles.premiumBadge}>
                            <Text style={styles.premiumBadgeText}>PREMIUM</Text>
                        </View>
                        <Text style={styles.title}>Desbloquea una mejor experiencia Bíblica</Text>
                        {offerings?.current?.availablePackages?.[0] && !selectedPlan && (
                            <View style={styles.priceContainer}>
                                <Text style={styles.priceText}>
                                    {offerings.current.availablePackages[0].product.priceString}
                                </Text>
                                <Text style={styles.priceSubtext}>{offerings.current.availablePackages[0].identifier.includes('annual') ? '/anual' : '/mensual'}</Text>
                            </View>
                        )}
                        {selectedPlan && (
                            <View style={styles.priceContainer}>
                                <Text style={styles.priceText}>
                                    {selectedPlan.product.priceString}
                                </Text>
                                <Text style={styles.priceSubtext}>
                                    /{selectedPlan.identifier.includes('annual') ? 'anual' : 'mensual'}
                                </Text>
                            </View>
                        )}
                    </View>
      
                    {/* Features Grid */}
                    <View style={styles.featuresGrid}>
                      <View style={styles.featureCard}>
                        <Entypo name="block" size={24} color="#FFD700" />
                        <Text style={styles.featureTitle}>Sin Anuncios</Text>
                        <Text style={styles.featureDesc}>Estudio sin interrupciones</Text>
                      </View>
                      
                      <View style={styles.featureCard}>
                        <FontAwesome5 name="coins" size={32} color="#FFD700" />
                        <Text style={styles.featureTitle}>+1,000 Monedas</Text>
                        <Text style={styles.featureDesc}>Recurso inicial</Text>
                      </View>
                      
                      <View style={styles.featureCard}>
                      <AntDesign name="heart" size={32} color="#FFD700" />    
                       <Text style={styles.featureTitle}>Vidas ilimitadas</Text>
                        <Text style={styles.featureDesc}>No te quedaras sin vidas</Text>
                      </View>

                    <View style={styles.featureCard}>
                        <FontAwesome5 name="headset" size={32} color="#FFD700" />
                      <Text style={styles.featureTitle}>Soporte Prioritario</Text>
                      <Text style={styles.featureDesc}>Atención personalizada</Text>
                    </View>

                    </View>

      
                    {/* Pricing Cards */}
                    {renderPricingCards()}
      
                    {/* CTA Button */}
                    <TouchableOpacity 
                        style={[
                            styles.ctaButton,
                            !selectedPlan && styles.ctaButtonDisabled
                        ]}
                        onPress={handlePurchaseSelected}
                        disabled={!selectedPlan || purchasing}
                    >
                        <LinearGradient
                            colors={selectedPlan ? ['#FF6347', '#FF6347'] : ['#666666', '#666666']}
                            style={styles.gradient}
                            start={{x: 0, y: 0}}
                            end={{x: 0, y: 1}}
                        >
                            <Text style={styles.ctaText}>
                                {purchasing ? 'Procesando...' : 'Convierte en Premium'}
                            </Text>
                            {selectedPlan && (
                                <Text style={styles.trialText}>
                                    {selectedPlan.product.priceString}/{selectedPlan.identifier.includes('annual') ? 'año' : 'mes'}
                                </Text>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>
      
                    {/* Legal Text */}
                    <Text style={styles.legalText}>
                      La suscripción se renueva automáticamente. Cancela cuando quieras desde la configuración de tu cuenta.
                    </Text>
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
        width: '100%',
        height: '100%',
    },
    scrollContent: {
        flexGrow: 1,
        paddingBottom: 40,
    },
    header: {
        alignItems: 'center',
        padding: 20,
        marginTop: 10,
    },
    closeButton: {
        position: 'absolute',
        top: 10,
        right: 20,
        zIndex: 1,
    },
    premiumBadge: {
        backgroundColor: 'rgba(255,215,0,0.2)',
        paddingVertical: 8,
        paddingHorizontal: 20,
        borderRadius: 20,
      //  marginBottom: 15,
    },
    premiumBadgeText: {
        color: '#FFD700',
        fontWeight: '700',
        letterSpacing: 1.1,
    },
    title: {
        color: '#fff',
        fontSize: 28,
        fontWeight: '700',
        textAlign: 'center',
        lineHeight: 30,
        marginVertical: 10,
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
        
    },
    priceText: {
        color: '#FFD700',
        fontSize: width * 0.07,
        fontWeight: '800',
    },
    priceSubtext: {
        color: '#A0A0A0',
        fontSize: 16,
        marginLeft: 5,
    },
    featuresGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap', 
        justifyContent: 'center',
        paddingHorizontal: 5,
    },
    featureCard: {
        width: '45%',
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 20,
        padding: 10,
        alignItems: 'center',
        margin: 8,
    },
    featureTitle: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
    },
    featureDesc: {
        color: '#A0A0A0',
        fontSize: 14,
       // marginTop: 5,
        textAlign: 'center',
    },
    pricingWrapper: {
        flexDirection: 'column',
        justifyContent: 'center',
        paddingHorizontal: width * 0.05,
    },
    pricingCard: {
        width: '100%',
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 20,
        paddingVertical: 3,
        marginVertical: 5,
        alignItems: 'center',
    },
    recommended: {
        borderWidth: 1,
        borderColor: 'gray',
    },
    recommendedBadge: {
        position: 'absolute',
        top: -12,
        backgroundColor: '#FFD700',
        paddingHorizontal: 15,
        paddingVertical: 4,
        borderRadius: 15,
    },
    recommendedText: {
        color: '#000',
        fontSize: 10,
        fontWeight: '800',
    },
    pricingTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700',
    },
    pricingPrice: {
        color: '#FFD700',
        fontSize: 24,
        fontWeight: '800',
        marginVertical: 8,
    },
    pricingSubtext: {
        color: '#A0A0A0',
        fontSize: 12,
        textAlign: 'center',
    },
    ctaButton: {
        width: '90%',
        alignSelf: 'center',
       // marginHorizontal: 30,
        marginTop: 20,
        borderRadius: 25,
        overflow: 'hidden',
    },
    gradient: {
        paddingVertical: 10,
        alignItems: 'center',
    },
    ctaText: {
        color: '#fff',
        fontSize: width * 0.04,
        fontWeight: '700',
    },
    trialText: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 12,
        marginTop: 5,
    },
    legalText: {
        color: '#A0A0A0',
        fontSize: 10,
        textAlign: 'center',
        marginHorizontal: 30,
        marginTop: 25,
        lineHeight: 16,
    },
    loadingContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    
        padding: 20,
    },
    errorText: {
        color: '#000',
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
    loadingIndicator: {
        position: 'absolute',
        bottom: 10,
    },
    selectedCard: {
        borderWidth: 2,
        borderColor: '#FFD700',
        backgroundColor: 'rgba(255,215,0,0.1)',
    },
    selectedIndicator: {
        position: 'absolute',
        top: 10,
        right: 10,
    },
    ctaButtonDisabled: {
        opacity: 0.7,
    },
});

export default Paywall; 