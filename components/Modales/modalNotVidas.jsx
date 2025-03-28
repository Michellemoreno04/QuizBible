import { doc, increment, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import { RewardedAd, RewardedAdEventType, TestIds } from 'react-native-google-mobile-ads';
import { db } from '../firebase/firebaseConfig';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';



const adUnitId = __DEV__ 
? TestIds.REWARDED 
: Platform.OS === 'ios' ? process.env.EXPO_PUBLIC_REWARDED_ID_IOS 
: process.env.EXPO_PUBLIC_REWARDED_ID_ANDROID;

export const RewardedAdModal = ({ isVisible,setIsVisible, onClose,userId,vidas,setShowModal }) => {
  const [loaded, setLoaded] = useState(false);
  const [rewardedAd, setRewardedAd] = useState(null);
  const navigation = useNavigation();
  
  // Cargar y manejar el anuncio cuando el modal se muestra
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
          console.log('Anuncio cargado correctamente');
        }
      );

      const unsubscribeEarned = newRewarded.addAdEventListener(
        RewardedAdEventType.EARNED_REWARD,
        (reward) => {
          console.log('Recompensa obtenida:', reward);
          addLife();// rewards no le hemos pasado los 
          onClose();
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

  const addLife = async () => {
    try {
      const userDocRef = doc(db, 'users', userId);
      await updateDoc(userDocRef, {
        Vidas: increment(1),
      });
      // No llamamos a onClose() aquí, esperamos a que el usuario tenga la vida
      // antes de cerrar el modal
    } catch (error) {
      console.error('Error al actualizar las vidas:', error);
      Alert.alert('Error', 'No se pudieron actualizar las vidas.');
    } 
  }

  const handleShowAd = () => {
    if (loaded && rewardedAd) {
      rewardedAd.show();
      // onClose se llamará automáticamente después de ganar la recompensa
      // a través del evento EARNED_REWARD
    }
  };

  const cerrar = () =>{
  try {
    if(vidas === 0){
      setIsVisible(false)
      setShowModal(true)
    
    }
  } catch (error) {
    console.log(error)
  }finally{
    setIsVisible(false)
    
  }
  
  }
 

  return (
    <Modal visible={isVisible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        {/* Fondo con efecto blur (requiere @react-native-community/blur) */}
        <BlurView
          style={styles.absolute}
          blurType="dark"
          blurAmount={10}
          reducedTransparencyFallbackColor="white"
        />
        
        <View style={styles.modalContent}>
          {/* Icono decorativo */}
          <View style={styles.heartContainer}>
            <Ionicons name="heart-circle" size={70} color="#FF3366" />
          </View>
  
          <Text style={styles.title}>¡Consigue más Corazones! 💖</Text>
          <Text style={styles.subtitle}>
            Mira un breve anuncio para obtener{"\n"}vidas extras y seguir jugando
          </Text>
  
          {/* Botón principal con gradiente */}
          <LinearGradient
            colors={['#FF6B6B', '#FF3366']}
            style={[styles.button, !loaded && styles.disabledButton]}
          >
            <TouchableOpacity
              onPress={handleShowAd}
              disabled={!loaded}
              style={styles.buttonTouchable}
            >
              <MaterialIcons name="play-circle-outline" size={24} color="white" />
              <Text style={styles.buttonText}>
                {loaded ? 'Ver Anuncio' : 'Cargando...'}
              </Text>
            </TouchableOpacity>
          </LinearGradient>
  
          {/* Botón de cierre con icono */}
          <TouchableOpacity 
            style={styles.closeButton} 
            onPress={cerrar}
            hitSlop={{top: 20, bottom: 20, left: 20, right: 20}}
          >
            <Ionicons name="close-circle" size={30} color="#666" />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};
  const styles = StyleSheet.create({
    modalContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    
  
    modalContent: {
      backgroundColor: '#FFF',
      width: '85%',
      borderRadius: 20,
      padding: 25,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.2,
      shadowRadius: 20,
      elevation: 10,
    },
    heartContainer: {
      position: 'absolute',
      top: -35,
      backgroundColor: 'white',
      borderRadius: 50,
      padding: 5,
    },
    title: {
      fontSize: 26,
      fontFamily: 'Poppins-Bold',
      color: '#2D3436',
      marginTop: 20,
      marginBottom: 10,
      textAlign: 'center',
      letterSpacing: 0.5,
    },
    subtitle: {
      fontSize: 16,
      fontFamily: 'Poppins-Medium',
      color: '#636E72',
      textAlign: 'center',
      lineHeight: 24,
      marginBottom: 25,
    },
    button: {
      width: '100%',
      borderRadius: 15,
      paddingVertical: 15,
      marginBottom: 15,
    },
    buttonTouchable: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
    },
    buttonText: {
      color: 'white',
      fontSize: 18,
      fontFamily: 'Poppins-SemiBold',
      letterSpacing: 0.5,
    },
    disabledButton: {
      opacity: 0.6,
    },
    closeButton: {
      position: 'absolute',
      top: 15,
      right: 15,
      padding: 5,
    },
  });