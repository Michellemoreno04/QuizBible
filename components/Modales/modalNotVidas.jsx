import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { RewardedAd, RewardedAdEventType, TestIds } from 'react-native-google-mobile-ads';

const adUnitId = __DEV__ 
? TestIds.REWARDED 
: Platform.OS === 'ios' ? process.env.EXPO_PUBLIC_REWARDED_ID_IOS 
: process.env.EXPO_PUBLIC_REWARDED_ID_ANDROID;

const RewardedAdModal = ({ isVisible, onClose,addLife  }) => {
  const [loaded, setLoaded] = useState(false);
  const [rewardedAd, setRewardedAd] = useState(null);

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
          addLife();// no le hemos pasado el reward
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

  const handleShowAd = () => {
    if (loaded && rewardedAd) {
      rewardedAd.show();
    }
  };

  return (
    <Modal visible={isVisible} animationType="slide" transparent>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>¡Obtén Corazones!</Text>
          <Text style={styles.subtitle}>
            Mira un anuncio y recibe vidas extra para seguir jugando.
          </Text>
          
          <TouchableOpacity
            style={[styles.button, !loaded && styles.disabledButton]}
            onPress={handleShowAd}
            disabled={!loaded}
          >
            <Text style={styles.buttonText}>
              {loaded ? 'Ver Anuncio' : 'Cargando...'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Cerrar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)', // Fondo semitransparente
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    width: '100%',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    // Sombra para un efecto elevado
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    color: '#666',
  },
  button: {
    backgroundColor: '#1e90ff',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginBottom: 15,
  },
  disabledButton: {
    backgroundColor: '#a9a9a9',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  closeButton: {
    marginTop: 10,
  },
  closeButtonText: {
    color: '#1e90ff',
    fontSize: 16,
  },
});

export default RewardedAdModal;
