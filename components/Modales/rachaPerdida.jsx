import { View, Text, StyleSheet, Pressable, Alert, Dimensions, Image} from 'react-native'
import React, { useEffect} from 'react'
import Modal from 'react-native-modal' // Nota: Se recomienda usar "react-native-modal" para los props isVisible, animationIn, etc.
import { FontAwesome5 } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '../../components/firebase/firebaseConfig'
import useAuth from '../authContext/authContext'
import { MaterialIcons } from '@expo/vector-icons'
import { useSound } from '../soundFunctions/soundFunction'
import { useNavigation } from '@react-navigation/native'


const { width, height } = Dimensions.get('screen');

export function ModalRachaPerdida({ userInfo,isVisible, setModalRachaPerdidaVisible }) {
  const { user } = useAuth();
  const playSound = useSound();
  const userId = user.uid;
  const coinsRequired = 1000;
  const navigation = useNavigation();
 


  useEffect(() => {
    if (isVisible) {
      playSound(require('../../assets/sound/rachaPerdidaSound.mp3'));
    }
    
  }, [isVisible]);

  // Funciones dummy para manejar las acciones de los botones.
  const userDocRef = doc(db, 'users', userId);

  const handlePay = () => {
    const coins = userInfo.Monedas;
    if (coins >= coinsRequired) {
      const coinsAfterPayment = coins - coinsRequired;
      // Recuperamos la racha anterior del usuario
      const rachaActualizada = userInfo.RachaAnterior || userInfo.Racha;
      updateDoc(userDocRef, {
        Monedas: coinsAfterPayment,
        Racha: rachaActualizada,
        modalRachaShow: new Date().toISOString()
      });
      setModalRachaPerdidaVisible(false);
      Alert.alert('Racha Recuperada', 'Has recuperado tu racha exitosamente.');
    } else {
      Alert.alert(
        'No tienes suficientes monedas para pagar.',
        'Puedes comprar monedas en la tienda.',
        [
          {
            text: 'Cancelar',
            style: 'cancel',
            onPress: () => setModalRachaPerdidaVisible(false)
          },
          {
            text: 'Comprar Monedas',
            onPress: () => {
              //setModalRachaPerdidaVisible(false);
              navigation.navigate('buyMonedasScreen');
            }
          }
        ]
      );
    }
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
    style={styles.modalContainer}
  >
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
            ❌ Has roto tu racha de {userInfo?.RachaAnterior} días
          </Text>

          {/* Estadísticas */}
          <View style={styles.statsContainer}>
            <LinearGradient
              colors={['#FFFFFF08', '#FFFFFF03']}
              style={[styles.statBox, styles.glassEffect]}
            >
                 <View style={styles.statBoxContent}>
                 <FontAwesome5 name="calendar-times" size={24} color="#FF6B6B" />
                 <Text style={styles.statNumber}>{userInfo?.RachaAnterior}</Text>
                 </View>
              <Text style={styles.statLabel}>Días Perdidos</Text>
            </LinearGradient>

            <LinearGradient
              colors={['#FFFFFF08', '#FFFFFF03']}
              style={[styles.statBox, styles.glassEffect]}
            >
              <View style={styles.statBoxContent}>
              <FontAwesome5 name="trophy" size={24} color="#FFD700" />
              <Text style={styles.statNumber}>{userInfo?.RachaMaxima}</Text>
              </View>
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
  </Modal>
)
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
    backgroundColor: '#1A1A2E',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
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
    //marginTop: -60,
   
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
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    justifyContent: 'center',
    backgroundColor: '#FFFFFF08',
  },
  statBoxContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  statNumber: {
    fontSize: width * 0.052,
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