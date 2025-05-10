import { View, Text, StyleSheet, Pressable, Alert, Dimensions, Image, Animated } from 'react-native'
import React, { useEffect, useRef } from 'react'
import Modal from 'react-native-modal' // Nota: Se recomienda usar "react-native-modal" para los props isVisible, animationIn, etc.
import { FontAwesome5 } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import LottieView from 'lottie-react-native'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '../../components/firebase/firebaseConfig'
import useAuth from '../authContext/authContext'
import { MaterialIcons } from '@expo/vector-icons'
import { useSound } from '../soundFunctions/soundFunction'

const { width, height } = Dimensions.get('screen');

export function ModalRachaPerdida({ userInfo,isVisible, setModalRachaPerdidaVisible }) {
  const { user } = useAuth();
  const playSound = useSound();
  const userId = user.uid;
  const coinsRequired = 1000;

  // Referencias para las animaciones
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    if (isVisible) {
      playSound(require('../../assets/sound/rachaPerdidaSound.mp3'));
      
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

  // Funciones dummy para manejar las acciones de los botones.
  const userDocRef = doc(db, 'users', userId);

  const handlePay = () => {
   const coins = userInfo.Monedas;
if (coins >= coinsRequired) {
  const coinsAfterPayment = coins - coinsRequired;
  updateDoc(userDocRef, {
    Monedas: coinsAfterPayment
  });
}else{
  Alert.alert('No tienes suficientes monedas para pagar.');
}
  setModalRachaPerdidaVisible(false);  

  };

  // lógica para reiniciar la racha (sin pago).
  const handleReset = () => {
    console.log("La racha se reinicia.");
   const rachaReiniciada = 1;
    updateDoc(userDocRef, {
      Racha: rachaReiniciada
    });

    setModalRachaPerdidaVisible(false);


  };
//8
return (
  <Modal
    isVisible={isVisible}
    animationIn="fadeIn"
    animationOut="fadeOut"
    backdropOpacity={0.7}
    onBackdropPress={() => setModalRachaPerdidaVisible(false)}
  >
    <Animated.View 
      style={styles.container} >
      <View style={styles.gradientWrapper}>
        <LinearGradient
          colors={['#1A1A2E', '#2D2D4A', '#1A1A2E']}
          style={styles.gradientContainer}
        >
          {/* Cabecera con Cordero */}
          <View style={styles.header}>
            <Image 
              source={require('../../assets/images/cordero_triste.png')}
              style={styles.lambImage}
              resizeMode="contain"
            />
            <Text style={styles.title}>¡Racha Perdida!</Text>
          </View>

          {/* Contenido */}
          <View style={styles.content}>
            <Text style={styles.highlightedText}>
              ❌ Has roto tu racha de {userInfo?.Racha} días
            </Text>

            {/* Estadísticas */}
            <View style={styles.statsContainer}>
              <LinearGradient
                colors={['#FFFFFF08', '#FFFFFF03']}
                style={[styles.statBox, styles.glassEffect]}
              >
                <FontAwesome5 name="calendar-times" size={24} color="#FF6B6B" />
                <Text style={styles.statNumber}>{userInfo?.Racha}</Text>
                <Text style={styles.statLabel}>Días Perdidos</Text>
              </LinearGradient>

              <LinearGradient
                colors={['#FFFFFF08', '#FFFFFF03']}
                style={[styles.statBox, styles.glassEffect]}
              >
                <FontAwesome5 name="trophy" size={24} color="#FFD700" />
                <Text style={styles.statNumber}>{userInfo?.RachaMaxima}</Text>
                <Text style={styles.statLabel}>Récord</Text>
              </LinearGradient>
            </View>

            {/* Opciones de Recuperación */}
            <View style={styles.recoveryOptions}>
              <Text style={styles.descriptionText}>
                ¿Quieres recuperar tu racha?
              </Text>
              
              <View style={styles.buttonContainer}>
                <Pressable 
                  onPress={handlePay}
                  style={({ pressed }) => [
                    styles.button,
                    pressed && styles.buttonPressed
                  ]}
                >
                  <LinearGradient
                    colors={['#FFB802', '#FF8C00']}
                    style={styles.buttonGradient}
                  >
                    <MaterialIcons name="redeem" size={24} color="white" />
                    <Text style={styles.buttonText}>Recuperar por 1000</Text>
                    <FontAwesome5 name="coins" size={18} color="#FFD700" />
                  </LinearGradient>
                </Pressable>

                <Pressable 
                  onPress={handleReset}
                  style={({ pressed }) => [
                    styles.secondaryButton,
                    pressed && styles.buttonPressed
                  ]}
                >
                  <LinearGradient
                    colors={['#6C757D', '#495057']}
                    style={styles.buttonGradient}
                  >
                    <MaterialIcons name="restart-alt" size={24} color="white" />
                    <Text style={styles.secondaryButtonText}>Empezar de nuevo</Text>
                  </LinearGradient>
                </Pressable>
              </View>
            </View>
          </View>
        </LinearGradient>
      </View>
    </Animated.View>
  </Modal>
)
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradientWrapper: {
    width: width * 0.9,
    height: height * 0.7,
    borderRadius: 30,
    backgroundColor: '#1A1A2E',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  gradientContainer: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
    padding: width * 0.04,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF15',
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
    textShadowColor: 'rgba(255, 107, 107, 0.5)',
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
    color: '#FF6B6B',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
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
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  button: {
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
  secondaryButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
    borderRadius: 50,
    overflow: 'hidden',
  },

  descriptionText: {
    color: '#CCC',
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
  },
  buttonPressed: {
    transform: [{ scale: 0.96 }],
    opacity: 0.9,
  },
});