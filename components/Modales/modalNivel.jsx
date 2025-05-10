import { View, Text, StyleSheet, Pressable, Dimensions, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Modal from 'react-native-modal';
import LottieView from 'lottie-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { niveles } from '../Niveles/niveles';
const { width, height } = Dimensions.get('screen');
import { useEffect } from 'react';
import { useSound } from '../soundFunctions/soundFunction';

export default function NivelModal({ nivel, isVisible, onClose, Exp }) {
  
      const { insignia,animation, description } = niveles(Exp);
      const playSound = useSound();

useEffect(() => {
  if(isVisible){
    playSound(require('../../assets/sound/levelUpSound.mp3'));
  }
}, [isVisible])

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={onClose}
      backdropOpacity={0.90}
      animationIn="zoomIn"
      animationOut="zoomOut"
      backdropTransitionInTiming={600}
    >
      <View style={styles.container}>
        <View style={styles.gradientWrapper}>
          <LinearGradient
            colors={['#1A1E32', '#2A2F4D', '#1A1E32']}
            style={styles.gradientContainer}
          >
            {/* Cabecera */}
            <View style={styles.header}>
              <MaterialIcons name="stars" size={28} color="#FFB802" />
              <Text style={styles.title}>¡Nuevo Nivel Alcanzado!</Text>
              <MaterialIcons name="stars" size={28} color="#FFB802" />
            </View>

            {/* Insignia principal */}
            <View style={styles.modalContainer}>
              <LottieView
                source={animation}
                autoPlay
                loop
                style={styles.modalAnimation}
                
              />
            
            </View>

            {/* Información de la insignia */}
            <ScrollView style={styles.infoContainer}>
              <View style={styles.levelBadge}>
                <Text style={styles.levelText}>Nivel {nivel}</Text>
              </View>
              <LinearGradient
        colors={['#FFD700', '#D4AF37', '#FFD700']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBadge}
      >
              <Text style={styles.insigniaName}>{insignia}</Text>
              </LinearGradient>
              <Text style={styles.description}>{description}</Text>
            </ScrollView>

            {/* Botón de acción */}
            <Pressable 
              onPress={onClose} 
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
                <Text style={styles.buttonText}>Continuar Aventura</Text>
                <MaterialIcons name="arrow-forward" size={24} color="white" />
              </LinearGradient>
            </Pressable>
          </LinearGradient>
        </View>
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
  gradientWrapper: {
    width: width * 0.9,
    height: height * 0.8,
    borderRadius: 30,
    backgroundColor: '#1A1E32',
    shadowColor: '#FFB80299',
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
    borderWidth: 4,
    borderColor: '#FFB80299',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  
    gap: 2,
  },
  title: {
    fontSize: width * 0.04,
    fontWeight: '800',
    color: '#FFD700',
    textTransform: 'uppercase',
    transform: [{ perspective: 1000 }],
    letterSpacing: 1.2,
    textAlign: 'center',
    textShadowColor: 'rgba(255, 184, 2, 0.4)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
  },
  modalContainer: {
    width: width * 0.45,
    justifyContent: 'center',
    alignItems: 'center',
   
  },
  modalAnimation: {
    width: width * 0.45,
    height: width * 0.45,
    zIndex: 5,
   // backgroundColor: '#00000022',
    borderRadius: 20,
    

  },

  infoContainer: {
    width:'100%',
    
  },
  insigniaName: {
    fontSize: width * 0.065,
    fontWeight: '900',
    color: 'white',
    textAlign: 'center',
    marginBottom: width * 0.01,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    textShadowColor: 'rgba(255, 184, 2, 0.4)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
    
    padding: width * 0.01,
    borderRadius: 20,
  },
  gradientBadge: {
    width: width * 0.45,
    alignSelf: 'center',
    padding: width * 0.01,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#CCAA00',
    margin: 10,
  },
  levelBadge: {
    backgroundColor: '#00E0FF22',
    borderWidth: 2,
    borderColor: '#00E0FF',
    borderRadius: 20,
    paddingVertical: width * 0.02,
    paddingHorizontal: width * 0.05,
    alignSelf: 'center',
    marginBottom: width * 0.02,
    marginTop: width * 0.02,
  },
  levelText: {
    color: '#00E0FF',
    fontSize: width * 0.04,
    fontWeight: '700',
    letterSpacing: 1.1,
  },
  description: {
    color: '#EEE',
    fontSize: width * 0.045,
    lineHeight: width * 0.055,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  button: {
    width: '100%',
    borderRadius: 25,
    overflow: 'hidden', 
  },
  buttonGradient: {
    paddingVertical: width * 0.04,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: width * 0.03,
    padding: width * 0.02,
    borderRadius: 25,
  },
  buttonText: {
    color: 'white',
    fontSize: width * 0.045,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  buttonPressed: {
    transform: [{ scale: 0.96 }],
    opacity: 0.9,
  },
});