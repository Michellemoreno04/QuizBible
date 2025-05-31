import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, Image } from 'react-native';
import Modal from 'react-native-modal';
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { Pressable } from 'react-native';
import { db } from '../../components/firebase/firebaseConfig';
import { doc, onSnapshot } from 'firebase/firestore';
import useAuth from '../authContext/authContext';
import { useSound } from '../soundFunctions/soundFunction';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as StoreReview from 'expo-store-review';



const {width, height} = Dimensions.get('window');
export function ModalRacha({ isVisible, setModalRachaVisible }) {
  const { user } = useAuth();
  const playSound = useSound();
  const [userInfo, setUserInfo] = useState({});


 

  useEffect(() => {
    if (isVisible) {
      playSound(require('../../assets/sound/rachasound.mp3'));
      
   
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

  const closeModal = async () => {
    setModalRachaVisible(false);
    
    // Verificar si ya se mostró la reseña anteriormente
    const reseñaMostrada = await AsyncStorage.getItem('reseñaMostrada');
    
    if (!reseñaMostrada) {
      console.log('mostrando reseña');
      // Esperar 2 segundos y luego mostrar la reseña
      setTimeout(async () => {
        const isAvailable = await StoreReview.isAvailableAsync();
        if (isAvailable) {
          await StoreReview.requestReview();
          // Guardar que ya se mostró la reseña
          await AsyncStorage.setItem('reseñaMostrada', 'true');
        }
      }, 2000);
    }
  };

  return (
    <Modal
      isVisible={isVisible}
      animationIn="fadeIn"
      animationOut="fadeOut"
      backdropOpacity={0.7}
      onBackdropPress={closeModal}
      style={styles.modalContainer}
    >
    
        <View style={styles.gradientWrapper}>
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
                  <View style={styles.statBoxContent}>
                  <FontAwesome5 name="fire" size={24} color="#FF6B35" />
                  <Text style={styles.statNumber}>{userInfo.Racha}</Text>
                  </View>
                  <Text style={styles.statLabel}>Días consecutivos</Text>
                </LinearGradient>

                <LinearGradient
                  colors={['#FFFFFF08', '#FFFFFF03']}
                  style={[styles.statBox, styles.glassEffect]}
                >
                  <View style={styles.statBoxContent}>
                  <FontAwesome5 name="trophy" size={24} color="#FFD700" />
                  <Text style={styles.statNumber}>{userInfo.RachaMaxima}</Text>
                  </View>
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
        </View>
      
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    margin: 0,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  gradientWrapper: {
    width: width * 0.9,
    maxHeight: height * 0.8,
    borderRadius: 30,
    overflow: 'hidden',
  },
  gradientContainer: {
    width: '100%',
    padding: 25,
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
   // marginTop: -60,
    
    
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
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  statBoxContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  glassEffect: {
    justifyContent: 'center',
    backgroundColor: '#FFFFFF08',
//backdropFilter: 'blur(50px)',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFD700',
    marginVertical: 5,
  },
  statLabel: {
    textAlign: 'center',
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