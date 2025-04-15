import { View, Text, StyleSheet, Pressable, Alert, Dimensions } from 'react-native'
import React, { useEffect } from 'react'
import Modal from 'react-native-modal' // Nota: Se recomienda usar "react-native-modal" para los props isVisible, animationIn, etc.
import { FontAwesome5 } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import LottieView from 'lottie-react-native'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '../../components/firebase/firebaseConfig'
import useAuth from '../authContext/authContext'
import { MaterialIcons } from '@expo/vector-icons'
import { useSound } from '../soundFunctions/soundFunction'

const { width, height } = Dimensions.get('window');

export function ModalRachaPerdida({ userInfo,isVisible, setModalRachaPerdidaVisible }) {
  const { user } = useAuth();
  const playSound = useSound();
  const userId = user.uid;
  const coinsRequired = 1000;

  // para que suene el audio de la racha perdida
  useEffect(() => {
    if(isVisible){
      playSound(require('../../assets/sound/rachaPerdidaSound.mp3'));
    }
  }, [isVisible])
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
    animationIn="zoomIn"
    animationOut="zoomOut"
    backdropOpacity={0.7}
    onBackdropPress={() => setModalRachaPerdidaVisible(false)}
  >
    <View style={styles.container}>
      <LinearGradient
        colors={['#1A1E32', '#2A2F4D', '#1A1E32']}
        style={styles.gradientContainer}
      >
        {/* Cabecera */}
        <View style={styles.header}>
          <MaterialIcons name="stars" size={28} color="#FFB802" />
          <Text style={styles.title}>⚠️ RACHA PERDIDA ⚠️</Text>
          <MaterialIcons name="stars" size={28} color="#FFB802" />
        </View>

        {/* Animación */}
        <View style={styles.animationContainer}>
          <LottieView
            source={require('../../assets/lottieFiles/rachaPerdida.json')}
            autoPlay
            loop
            style={styles.animation}
          />
        </View>

        {/* Contenido */}
        <Text style={styles.highlightedText}>
          ¡Oh no! Has perdido tu racha de {userInfo?.Racha} días
        </Text>

        <Text style={styles.descriptionText}>
          Pero puedes pagar
          
          <FontAwesome5 name="coins" size={18} color="#FFD700" />
           {' 1000 Monedas '} 
           para mantenerla
        </Text>

        {/* Estadísticas */}
        <View style={styles.statsContainer}>
          <LinearGradient
            colors={['#FFB80222', '#FF8C0011']}
            style={[styles.statBox, styles.elevatedBox]}
          >
            <View style={styles.iconBadge}>
              <FontAwesome5 name="frown" size={24} color="#FFD700" />
            </View>
            <Text style={styles.statNumber}>{userInfo?.Racha}</Text>
            <Text style={styles.statLabel}>Racha Actual</Text>
          </LinearGradient>

          <LinearGradient
            colors={['#00E0FF22', '#00B8D411']}
            style={[styles.statBox, styles.elevatedBox]}
          >
            <View style={styles.iconBadge}>
              <FontAwesome5 name="trophy" size={24} color="#FFD700" />
            </View>
            <Text style={styles.statNumber}>{userInfo?.RachaMaxima}</Text>
            <Text style={styles.statLabel}>Racha Máxima</Text>
          </LinearGradient>
        </View>

        {/* Botones */}
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
              <MaterialIcons name="attach-money" size={24} color="white" />
              <Text style={styles.buttonText}>Pagar y Mantener</Text>
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
              <Text style={styles.secondaryButtonText}>Reiniciar Racha</Text>
              <MaterialIcons name="refresh" size={24} color="white" />
            </LinearGradient>
          </Pressable>
        </View>
      </LinearGradient>
    </View>
  </Modal>
)
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
  padding: 20,
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
  fontSize: 20,
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
  width: 150,
  height: 150,
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 100,
  borderWidth: 4,
  borderColor: '#FFB80299',
  marginVertical: 5,
  backgroundColor: '#00000022',
  overflow: 'hidden',
},
animation: {
  width: width * 0.3,
  height: height * 0.3,
  
},
highlightedText: {
  fontSize: 20,
  fontWeight: '700',
  color: '#FF6B6B',
  textAlign: 'center',
  marginVertical: 10,
  lineHeight: 24,
  textShadowColor: 'rgba(255, 107, 107, 0.3)',
  textShadowOffset: { width: 0, height: 0 },
  textShadowRadius: 10,
},
descriptionText: {
  color: '#EEE',
  fontSize: 16,
  lineHeight: 24,
  textAlign: 'center',
 
},
statsContainer: {
  flexDirection: 'row',
  gap: 15,
  width: '100%',
  marginVertical: 10,
},
statBox: {
  flex: 1,
  alignItems: 'center',
  padding: 15,
  borderRadius: 10,
  borderWidth: 2,
  borderColor: '#FFB80233',
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
  textShadowColor: 'rgba(255, 215, 0, 0.3)',
  textShadowOffset: { width: 0, height: 0 },
  textShadowRadius: 10,
},
statLabel: {
  fontSize: 14,
  color: '#EEE',
  fontWeight: '600',
},
buttonContainer: {
  width: '100%',
  gap: 12,
  marginTop: 10,
},
button: {
  borderRadius: 25,
  overflow: 'hidden',
},
secondaryButton: {
  borderRadius: 25,
  overflow: 'hidden',
},
buttonGradient: {
  paddingVertical: 15,
  paddingHorizontal: 20,
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  gap: 12,
  borderRadius: 25,
  overflow: 'hidden',
},
buttonText: {
  color: 'white',
  fontSize: 18,
  fontWeight: '700',
  letterSpacing: 0.8,
},
secondaryButtonText: {
  color: 'white',
  fontSize: 16,
  fontWeight: '600',
  letterSpacing: 0.8,
},
buttonPressed: {
  transform: [{ scale: 0.96 }],
  opacity: 0.9,
},
});