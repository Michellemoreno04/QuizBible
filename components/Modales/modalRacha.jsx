import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, Animated, Image } from 'react-native';
import Modal from 'react-native-modal';
import LottieView from 'lottie-react-native';
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { Pressable } from 'react-native';
import { db } from '../../components/firebase/firebaseConfig';
import { doc, onSnapshot } from 'firebase/firestore';
import useAuth from '../authContext/authContext';
import { useSound } from '../soundFunctions/soundFunction';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('screen');

export function ModalRacha({ isVisible, setModalRachaVisible }) {
  const { user } = useAuth();
  const playSound = useSound();
  const [userInfo, setUserInfo] = useState({});

  // Referencias para las animaciones
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    if (isVisible) {
      playSound(require('../../assets/sound/rachaSound.mp3'));
      
      // Secuencia de animaciones
      Animated.sequence([
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 8,
            tension: 40,
            useNativeDriver: true,
          }),
          Animated.spring(slideAnim, {
            toValue: 0,
            friction: 8,
            tension: 40,
            useNativeDriver: true,
          })
        ])
      ]).start();
    } else {
      // Animación de salida
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start();
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
    setModalRachaVisible(false);
  };

  return (
    <Modal
      isVisible={isVisible}
      animationIn="fadeIn"
      animationOut="fadeOut"
      backdropOpacity={0.7}
      onBackdropPress={closeModal}
    >
      <Animated.View 
        style={[
          styles.container,
          {
            opacity: fadeAnim,
            transform: [
              { scale: scaleAnim },
              { translateY: slideAnim }
            ]
          }
        ]}
      >
        <LinearGradient
          colors={['#1A1A2E', '#2D2D4A', '#1A1A2E']}
          style={styles.gradientContainer}
        >
          {/* Cabecera */}
          <View style={styles.header}>
            <Image 
              source={require('../../assets/images/cordero_feliz.png')}
              style={styles.lambImage}
              resizeMode="contain"
            />
            <Text style={styles.title}>¡Récord Diario!</Text>
          </View>

          {/* Contenido */}
          <View style={styles.content}>
            <Text style={styles.highlightedText}>
              ¡Estás en llamas!{'\n'}Sigue así 🔥
            </Text>

            <Text style={styles.descriptionText}>
              Sigue jugando todos los días para aumentar y mantener tu racha 😊
            </Text>

            {/* Estadísticas */}
            <View style={styles.statsContainer}>
              <LinearGradient
                colors={['#FFFFFF08', '#FFFFFF03']}
                style={[styles.statBox, styles.glassEffect]}
              >
                <FontAwesome5 name="fire" size={24} color="#FF6B35" />
                <Text style={styles.statNumber}>{userInfo.Racha}</Text>
                <Text style={styles.statLabel}>Días consecutivos</Text>
              </LinearGradient>

              <LinearGradient
                colors={['#FFFFFF08', '#FFFFFF03']}
                style={[styles.statBox, styles.glassEffect]}
              >
                <FontAwesome5 name="trophy" size={24} color="#FFD700" />
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
              >
                <MaterialIcons name="arrow-forward" size={24} color="white" />
                <Text style={styles.buttonText}>¡Continuar racha!</Text>
              </LinearGradient>
            </Pressable>
          </View>
        </LinearGradient>
      </Animated.View>
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
    width: width * 0.85,
    height: height * 0.65,
    borderRadius: 30,
    padding: 25,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF15',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  lambImage: {
    width: 120,
    height: 120,
    marginTop: -60,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: '#FFF',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    textShadowColor: 'rgba(255, 184, 2, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
    marginTop: -10,
  },
  content: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
  },
  highlightedText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFB802',
    textAlign: 'center',
    marginBottom: 10,
    lineHeight: 24,
  },
  descriptionText: {
    color: '#CCC',
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 15,
    width: '100%',
    marginBottom: 25,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    padding: 15,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#FFFFFF15',
  },
  glassEffect: {
    backgroundColor: '#FFFFFF08',
    backdropFilter: 'blur(10px)',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFD700',
    marginVertical: 5,
  },
  statLabel: {
    fontSize: 14,
    color: '#EEE',
    fontWeight: '600',
    opacity: 0.9,
  },
  button: {
    width: '100%',
    borderRadius: 20,
    overflow: 'hidden',
  },
  buttonGradient: {
    paddingVertical: 15,
    paddingHorizontal: 25,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    borderRadius: 50,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  buttonPressed: {
    transform: [{ scale: 0.96 }],
    opacity: 0.9,
  },
});