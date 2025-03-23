import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Modal from 'react-native-modal';
import LottieView from 'lottie-react-native';
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { db } from '../../components/firebase/firebaseConfig';
import { doc, onSnapshot } from 'firebase/firestore';
import useAuth from '../authContext/authContext';
import { useSound } from '../soundFunctions/soundFunction';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export function ModalRacha({ isVisible, setShowModalRacha }) {
  const { user } = useAuth();
  const playSound = useSound();
  const navigation = useNavigation();
  const [userInfo, setUserInfo] = useState({});

  useEffect(() => {
    if (isVisible) {
      playSound(require('../../assets/sound/rachaSound.mp3'));
    }
  }, [isVisible]);

  useEffect(() => {
    const userDocRef = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(userDocRef, (doc) => {
      if (doc.exists()) {
        setUserInfo(doc.data());
      }
    });
    return () => unsubscribe();
  }, []);

  const closeModal = () => {
    setShowModalRacha(false);
    navigation.navigate('(tabs)');
  };

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={closeModal}
      backdropOpacity={0.80}
      animationIn="zoomIn"
      animationOut="zoomOut"
      backdropTransitionInTiming={600}
    >
      <View style={styles.container}>
        <LinearGradient
          colors={['#1A1E32', '#2A2F4D', '#1A1E32']}
          style={styles.gradientContainer}
        >
          {/* Cabecera */}
          <View style={styles.header}>
            <MaterialIcons name="stars" size={28} color="#FFB802" />
            <Text style={styles.title}>🔥 Récord Diario 🔥</Text>
            <MaterialIcons name="stars" size={28} color="#FFB802" />
          </View>

          {/* Animación de fuego */}
          <View style={styles.animationContainer}>
            <LottieView
              source={require('../../assets/lottieFiles/fireRachaIcon.json')}
              autoPlay
              loop
              style={styles.animation}
            />
          </View>

          <Text style={styles.highlightedText}>
            ¡Estás en llamas!{'\n'}Sigue así 🔥
          </Text>

          {/* Estadísticas */}
          <View style={styles.statsContainer}>
            <LinearGradient
              colors={['#FFB80222', '#FF8C0011']}
              style={[styles.statBox, styles.elevatedBox]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.iconBadge}>
                <FontAwesome5 name="fire" size={28} color="#FF6B35" />
              </View>
              <Text style={styles.statNumber}>{userInfo.Racha}</Text>
              <Text style={styles.statLabel}>Días consecutivos</Text>
            </LinearGradient>

            <LinearGradient
              colors={['#00E0FF22', '#00B8D411']}
              style={[styles.statBox, styles.elevatedBox]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.iconBadge}>
                <FontAwesome5 name="trophy" size={28} color="#FFD700" />
              </View>
              <Text style={styles.statNumber}>{userInfo.RachaMaxima}</Text>
              <Text style={styles.statLabel}>Racha máxima</Text>
            </LinearGradient>
          </View>

          {/* Botón de acción */}
          <Pressable 
            onPress={closeModal} 
            style={({ pressed }) => [
              styles.button,
              pressed && styles.buttonPressed
            ]}
          >
            <LinearGradient
              colors={['#FFB802', '#FF8C00']}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
            >
              <Text style={styles.buttonText}>¡Continuar racha!</Text>
              <MaterialIcons name="arrow-forward" size={24} color="white" />
            </LinearGradient>
          </Pressable>
        </LinearGradient>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradientContainer: {
    width: width * 0.9,
    borderRadius: 30,
    padding: 25,
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#FFB80299',
    shadowColor: '#FFB80299',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    
    
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFD700',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    textAlign: 'center',
    textShadowColor: 'rgba(255, 184, 2, 0.4)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
  },
  animationContainer: {
    width: width * 0.5,
    height: width * 0.5,
    marginVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 100,
    borderWidth: 4,
    borderColor: '#FFB80299',
    backgroundColor: '#00000022',
  },
  animation: {
    width: '100%',
    height: '100%',
  },
  highlightedText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFD700',
    textAlign: 'center',
    marginVertical: 5,
    lineHeight: 25,
   
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginVertical: 5,
    gap: 15,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#FFB80239',
  },
  elevatedBox: {
    
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  iconBadge: {
    backgroundColor: '#00000033',
    padding: 12,
    borderRadius: 50,
    marginBottom: 10,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFD700',
    marginBottom: 5,
    textShadowColor: 'rgba(255, 215, 0, 0.3)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  statLabel: {
    fontSize: 14,
    color: '#EEE',
    fontWeight: '600',
    textAlign: 'center',
  },
  button: {
    width: '100%',
    borderRadius: 25,
    overflow: 'hidden',
    marginTop: 15,
    
  },
  buttonGradient: {
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    borderRadius: 25,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  buttonPressed: {
    transform: [{ scale: 0.96 }],
    opacity: 0.9,
  },
});