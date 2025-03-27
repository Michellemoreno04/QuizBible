import React from 'react';
import { 
  View, 
  Text, 
  Modal, 
  TouchableOpacity, 
  StyleSheet, 
  Animated,
  Easing,
  TouchableWithoutFeedback
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { RewardedAd, RewardedAdEventType, TestIds } from 'react-native-google-mobile-ads';
import { useState, useEffect } from 'react';
import  useAuth  from '../authContext/authContext';
import {doc,updateDoc,increment} from 'firebase/firestore';
import {db} from '../../components/firebase/firebaseConfig';



const adUnitId = __DEV__ 
? TestIds.REWARDED 
: Platform.OS === 'ios' ? process.env.EXPO_PUBLIC_REWARDED_ID_IOS 
: process.env.EXPO_PUBLIC_REWARDED_ID_ANDROID;

export const NoCoinsModal = ({ visible, onClose }) => {
  const scaleValue = React.useRef(new Animated.Value(0)).current;
  const translateY = React.useRef(new Animated.Value(0)).current;
  const [isVisible, setIsVisible] = React.useState(visible);
  const [loaded, setLoaded] = useState(false);
  const [rewardedAd, setRewardedAd] = useState(null);

const {user} = useAuth();
 const userId = user?.uid;

// aquicargamos el anuncio
  useEffect(() => {
    if (isVisible) {
      // Crear nueva instancia cada vez que se abre el modal
      const newRewarded = RewardedAd.createForAdRequest(adUnitId, {
        keywords: ['religion', 'bible'],
      });
      
      const unsubscribeLoaded = newRewarded.addAdEventListener(
        RewardedAdEventType.LOADED,
        () => {
          setLoaded(true);
          console.log('Anuncio recompensa cargado correctamente');
        }
      );

      const unsubscribeEarned = newRewarded.addAdEventListener(
        RewardedAdEventType.EARNED_REWARD,
        (reward) => {
          console.log('Recompensa obtenida:', reward);
          
           
        }
      );
      // Cargar el anuncio
      newRewarded.load();
      setRewardedAd(newRewarded);

      // Limpiar al cerrar
      return () => {
        unsubscribeLoaded();
        unsubscribeEarned();
        setLoaded(false);
        setRewardedAd(null);
      };
    }
  }, [isVisible]);

  
  const addCoin = async () => {
    const userDocRef = doc(db, 'users', userId);
    await updateDoc(userDocRef, {
      Monedas: increment(100),
    });
  };

  
  const handleShowAd = async () => {
    if (loaded && rewardedAd) {
      try {
        await rewardedAd.show();

      } catch (error) {
        console.log('Error al mostrar el anuncio:', error);
        
      } finally {
        addCoin();
        setIsVisible(false);
        onClose();
        
      }

    }
  };

  // animacion del modal
  React.useEffect(() => {
    if (visible) {
      setIsVisible(true);
      Animated.parallel([
        Animated.spring(scaleValue, {
          toValue: 1,
          useNativeDriver: true,
          bounciness: 8
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true
        })
      ]).start();
    } else {
      Animated.parallel([
        Animated.spring(scaleValue, {
          toValue: 0,
          useNativeDriver: true,
          speed: 20
        }),
        Animated.timing(translateY, {
          toValue: 100,
          duration: 200,
          useNativeDriver: true
        })
      ]).start(() => setIsVisible(false));
    }
  }, [visible]);

 

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={StyleSheet.absoluteFill}/>
        </TouchableWithoutFeedback>
        
        <Animated.View style={[
          styles.modalContainer,
          {
            transform: [
              { scale: scaleValue },
              { translateY: translateY }
            ]
          }
        ]}>
          <LinearGradient
            colors={['#FFFFFF', '#F8F9FA']}
            style={styles.gradient}
            start={{ x: 0.1, y: 0 }}
            end={{ x: 0.9, y: 1 }}>
            
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={onClose}
              hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}>
              <Ionicons name="close" size={24} color="#6C757D" />
            </TouchableOpacity>

            <View style={styles.iconContainer}>
              <Ionicons name="alert-circle" size={48} color="#FFD700" />
            </View>

            <Text style={styles.modalTitle}>¡Monedas Insuficientes!</Text>
            <Text style={styles.modalText}>
              Necesitas más monedas para realizar este quiz. Mira un anuncio para obtener monedas gratis.
            </Text>

            <TouchableOpacity 
              style={styles.primaryButton}
              onPress={handleShowAd}
              activeOpacity={0.9}>
              <LinearGradient
                colors={['#4CAF50', '#45A049']}
                style={styles.buttonGradient}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}>
                <Ionicons name="play-circle" size={24} color="white" />
                <Text style={styles.buttonText}>{loaded ? 'Ver Anuncio' : 'Cargando...'}</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.secondaryButton}
              onPress={onClose}
              activeOpacity={0.7}>
              <Text style={styles.secondaryButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    maxWidth: 400,
    borderRadius: 25,
    overflow: 'hidden',
    position: 'absolute',
    top: '25%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 12,
  },
  gradient: {
    padding: 25,
    borderRadius: 25,
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    zIndex: 1,
  },
  iconContainer: {
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    padding: 16,
    borderRadius: 40,
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#2D3436',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    color: '#636E72',
    marginBottom: 28,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 8,
  },
  primaryButton: {
    width: '100%',
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 12,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 25,
  },
  buttonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
    marginLeft: 10,
  },
  secondaryButton: {
    width: '100%',
    padding: 14,
    borderRadius: 14,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#DFE6E9',
    marginTop: 8,
  },
  secondaryButtonText: {
    color: '#636E72',
    fontWeight: '700',
    fontSize: 16,
    textAlign: 'center',
  },
});