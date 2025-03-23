import { View, Text, StyleSheet, Pressable, Dimensions, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Modal from 'react-native-modal';
import LottieView from 'lottie-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { niveles } from '../Niveles/niveles';
const { width, height } = Dimensions.get('window');

export default function NivelModal({ nivel, isVisible, onClose, Exp }) {
  
      const { insignia,animation, description } = niveles(Exp);


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
      

        {/* Contenido principal */}
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
          <View style={styles.medalContainer}>
            <LottieView
              source={animation}
              autoPlay
              loop
              style={styles.medalAnimation}
              
            />
          
          </View>

          {/* Información de la insignia */}
          <ScrollView style={styles.infoContainer}>
            <View style={styles.levelBadge}>
              <Text style={styles.levelText}>Nivel {nivel}</Text>
            </View>
            <Text style={styles.insigniaName}>{insignia}</Text>
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
    marginBottom: 20,
    gap: 10,
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
  medalContainer: {
    width: 200,
    height: 200,
    //marginVertical: 20,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  medalAnimation: {
    width: '100%',
    height: '100%',
    zIndex: 1,
  },

  infoContainer: {
    
    width: '100%',
    marginBottom: 20,
  },
  insigniaName: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFD700',
    textAlign: 'center',
    marginBottom: 10,
    
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    textShadowColor: 'rgba(255, 184, 2, 0.4)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
    backgroundColor: '#00000022',
    padding: 10,
    borderRadius: 20,
  },
  levelBadge: {
    backgroundColor: '#00E0FF22',
    borderWidth: 2,
    borderColor: '#00E0FF',
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 15,
    alignSelf: 'center',
    marginBottom: 15,
    marginTop: 15,
  },
  levelText: {
    color: '#00E0FF',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 1.1,
  },
  description: {
    color: '#EEE',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  button: {
    width: '100%',
    borderRadius: 25,
    overflow: 'hidden',
    marginTop: 10,
  },
  buttonGradient: {
    paddingVertical: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    padding: 10,
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