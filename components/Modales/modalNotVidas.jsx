import { doc, increment, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState, useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Alert,
  Image,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { db } from '../firebase/firebaseConfig';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { RewardedAd, RewardedAdEventType, TestIds } from 'react-native-google-mobile-ads';
import { useSound } from '../soundFunctions/soundFunction';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('screen');

const adUnitId = __DEV__ 
  ? TestIds.REWARDED 
  : Platform.OS === 'ios' 
  ? process.env.EXPO_PUBLIC_REWARDED_ID_IOS 
  : process.env.EXPO_PUBLIC_REWARDED_ID_ANDROID;

export const RewardedAdModal = ({ isVisible,setIsVisible, onClose,userId,vidas,setShowModal }) => {
  const [loaded, setLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rewardedAd, setRewardedAd] = useState(null);
const playSound = useSound();

  
  const saveQuizDate = useCallback(async () => {
    try {
      const today = new Date().toDateString();
      await AsyncStorage.multiSet([
        ["lastQuizDate", today],
        ["quizCompleted", "true"]
      ]);
    } catch (error) {
      console.error('Error al guardar la fecha del quiz:', error);
    }
  }, []);

  const addLife = useCallback(async () => {
    try {
      setIsLoading(true);
      const userDocRef = doc(db, 'users', userId);
      await updateDoc(userDocRef, {
        Vidas: increment(3),
      });
    } catch (error) {
      console.error('Error al actualizar las vidas:', error);
      Alert.alert('Error', 'No se pudieron actualizar las vidas.');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const handleShowAd = useCallback(async () => {
    if (!loaded || !rewardedAd) {
      Alert.alert('Error', 'El anuncio no está listo. Por favor, intenta de nuevo.');
      return;
    }

    try {
      setIsLoading(true);
      await rewardedAd.show();
    } catch (error) {
      console.error('Error al mostrar el anuncio:', error);
      // Si hay error al mostrar el anuncio, damos la recompensa igualmente
      await addLife();
      setIsVisible(false);
      onClose();
    } finally {
      setIsLoading(false);
    }
  }, [loaded, rewardedAd, addLife, setIsVisible, onClose]);

  const cerrar = useCallback(() => {
    try {
      if (vidas === 0) {
        setIsVisible(false);

        setTimeout(() => {
          setShowModal(true);
        }, 1000);
       
      } else {
        setIsVisible(false);
      }
    } catch (error) {
      console.error('Error al cerrar el modal:', error);
      setIsVisible(false);
    }
  }, [vidas, setIsVisible, setShowModal]);

  // para que el sonido se reproduzca solo la primera vez que se abre el modal
  useEffect(() => {
    if (!isVisible) return;

    // Verificamos si el modal se está abriendo por primera vez
    if (isVisible) {
      playSound(require('../../assets/sound/notVidasSoundModal.mp3'));
      saveQuizDate();
    }

    const newRewarded = RewardedAd.createForAdRequest(adUnitId, {
      keywords: ['religion', 'bible'],
    });

    const unsubscribeLoaded = newRewarded.addAdEventListener(RewardedAdEventType.LOADED, () => {
      setLoaded(true);
      console.log('Anuncio no vidas cargado');
    });

    const unsubscribeEarned = newRewarded.addAdEventListener(RewardedAdEventType.EARNED_REWARD, async () => {
      console.log('Recompensa obtenida');
      await addLife();
      setIsVisible(false);
      onClose();
    });

    newRewarded.load();
    setRewardedAd(newRewarded);

    return () => {
      unsubscribeLoaded();
      unsubscribeEarned();
      setRewardedAd(null);
      setLoaded(false);
    };
  }, [isVisible]);

  return (
    <Modal visible={isVisible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <View style={styles.absolute} />
        <View style={styles.gradientWrapper}>
          <LinearGradient
            colors={['#1A1A2E', '#2D2D4A', '#1A1A2E']}
            style={styles.gradientContainer}
          >
            {/* Decoración superior */}
            <View style={styles.topDecoration}>
              <Image 
                source={require('../../assets/images/cordero_triste.png')}
                style={styles.lambImage}
                resizeMode="contain"
              />
            </View>
    
            {/* Contenido principal */}
            <Text style={styles.title}>¡Necesitas más Corazones! 💖</Text>
            <Text style={styles.subtitle}>
              Ve un anuncio para obtener vidas extras! {"\n"}
            </Text>
    
            
            {/* Botón principal */}
            <TouchableOpacity 
              onPress={handleShowAd}
              disabled={!loaded || isLoading}
              style={[styles.button, (!loaded || isLoading) && styles.disabledButton]}
            >
              <LinearGradient
                colors={['#FF6B6B', '#FF3366']}
                style={styles.buttonGradient}
                start={{x: 0, y: 0.5}}
                end={{x: 1, y: 0.5}}
              >
                {isLoading ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <>
                    <MaterialIcons name="play-circle-filled" size={28} color="white" />
                    <Text style={styles.buttonText}>
                      {loaded ? 'Obtener 2 corazones ' : 'Cargando...'}
                    </Text>
                    
                    {loaded && (
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>GRATIS</Text>
                      </View>
                    )}
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
    
            {/* Opción alternativa */}
           {/* <TouchableOpacity style={styles.storeButton}>
              <Text style={styles.storeText}>¿Prefieres comprar? </Text>
              <Ionicons name="storefront" size={18} color="#FF3366" />
            </TouchableOpacity>*/}
    
            {/* Botón de cierre */}
            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={cerrar}
            >
              <LinearGradient
                colors={['#FFFFFF', '#F8F9FA']}
                style={styles.closeGradient}
              >
                <Ionicons name="close" size={20} color="#666" />
              </LinearGradient>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );
}
  const styles = StyleSheet.create({
    modalContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    absolute: {
      position: 'absolute',
      top: 0,
      left: 0,
      bottom: 0,
      right: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
    },
    gradientWrapper: {
      width: width * 0.9,
     // height: height * 0.7,
      borderRadius: 30,
      backgroundColor: '#1A1A2E',
     
    },
    gradientContainer: {
      width: '100%',
      //height: '100%',
      borderRadius: 30,
      padding: width * 0.04,
      alignItems: 'center',
      borderWidth: 2,
      borderColor: '#FFFFFF15',
    },
    topDecoration: {
      position: 'relative',
      //marginTop: -100,
      //marginBottom: 20,
    },
    lambImage: {
      width: 120,
      height: 120,
      zIndex: 2,
    },
   
    title: {
      fontSize: 28,
      fontFamily: 'Poppins-Bold',
      color: '#FFFFFF',
      marginBottom: 10,
      textAlign: 'center',
      letterSpacing: 0.5,
      textShadowColor: 'rgba(0, 0, 0, 0.3)',
      textShadowOffset: { width: 0, height: 2 },
      textShadowRadius: 4,
    },
    subtitle: {
      fontSize: 16,
      fontFamily: 'Poppins-Medium',
      color: '#E0E0E0',
      textAlign: 'center',
      lineHeight: 24,
      marginBottom: 25,
      textShadowColor: 'rgba(0, 0, 0, 0.2)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
    },
    
    button: {
      width: '100%',
      borderRadius: 15,
      overflow: 'hidden',
      marginBottom: 15,
      shadowColor: '#FF3366',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.3,
      shadowRadius: 15,
      elevation: 10,
    },
    buttonGradient: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 18,
      paddingHorizontal: 25,
      gap: 12,
    },
    buttonText: {
      color: 'white',
      fontSize: width * 0.04,
      fontWeight: 'bold',
    },
    badge: {
      position: 'relative',
      right: 15,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      paddingVertical: 3,
      paddingHorizontal: 10,
      borderRadius: 50,
    },
    badgeText: {
      color: 'white',
      fontFamily: 'Poppins-Bold',
      fontSize: 12,
    },
    storeButton: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 10,
    },
    storeText: {
      color: '#E0E0E0',
      fontFamily: 'Poppins-Medium',
      fontSize: 14,
      textShadowColor: 'rgba(0, 0, 0, 0.2)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
    },
    closeButton: {
      position: 'absolute',
      top: 20,
      right: 20,
      borderRadius: 50,
      overflow: 'hidden',
     
    },
    closeGradient: {
      padding: 8,
      borderRadius: 50,
      borderWidth: 1,
      borderColor: 'rgba(0, 0, 0, 0.05)',
    },
    disabledButton: {
      opacity: 0.6,
    },
  });