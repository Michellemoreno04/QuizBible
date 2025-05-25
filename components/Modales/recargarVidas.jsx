import React, { useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSound } from '../soundFunctions/soundFunction';

export const NotVidasModal = ({ visible, setNotVidasModalVisible, userInfo }) => {
 // const scaleValue = new Animated.Value(0);
  const pulseAnim = new Animated.Value(1);
  const playSound = useSound();


  useEffect(() => {
    if (visible) {
      playSound(require('../../assets/sound/vidasYmonedasCargadas.mp3'));
    

      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true
          })
        ])
      ).start();
    } else {
//scaleValue.setValue(0);
      pulseAnim.stopAnimation();
    }
  }, [visible]);

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={() => setNotVidasModalVisible(false) }
    >
      <View style={styles.centeredView}>
        <Animated.View style={[styles.modalView]}>
          <View style={styles.gradientWrapper}>
            <LinearGradient
              colors={[ '#1E3A5F', '#3C6E9F']}
              style={styles.gradientBackground}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
            >
              <Animated.View style={[styles.particles, { transform: [{ scale: pulseAnim }] }]}>
                {[...Array(6)].map((_, i) => (
                  <Text 
                    key={i} 
                    style={[styles.particle, { transform: [{ rotate: `${i * 60}deg` }] }]}
                  >
                    hy
                  </Text>
                ))}
              </Animated.View>

              <Text style={styles.title}>¡Vidas Recargadas!</Text>
              <Text style={styles.subtitle}>Prepárate para nuevos desafíos</Text>

              <View style={styles.lifeContainer}> 
                <LinearGradient
                  colors={['#FFD700', '#D4AF37', '#FFD700']}
                  style={styles.lifeGradient}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                >
                  <View style={styles.rewardsContainer}>
                  <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
                  <Text style={styles.heart}>❤️</Text>
                  <Text style={styles.lifeText}>{userInfo?.Premium ? '♾️' : '3'}</Text>
                  </View>
                  <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
                    <Text style={styles.heart}>💰</Text>
                    <Text style={styles.lifeText}>{userInfo?.Premium ? '+300' : '+200'}</Text>
                  </View>

                  </View>
                </LinearGradient>
               

              </View>

              <Text style={styles.message}>
                ¡Energía al máximo! Responde preguntas y aumenta tu racha diaria
              </Text>

              <TouchableOpacity 
                style={styles.button} 
                onPress={() => setNotVidasModalVisible(false)}
                activeOpacity={0.95}
              >
                <LinearGradient
                  colors={['#FFD700', '#D4AF37', '#FFD700']}
                  style={styles.buttonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.buttonText}>¡A JUGAR!</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setNotVidasModalVisible(false)}
              >
                <LinearGradient
                  colors={['#75643F', '#3A2F0F']}
                  style={styles.closeButtonGradient}
                >
                  <Text style={styles.closeText}>x</Text>
                </LinearGradient>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)'
  },
  modalView: {
    width: '85%',
    borderRadius: 30,
    overflow: 'hidden',
  },
  gradientWrapper: {
    width: '100%',
    borderRadius: 30,
    backgroundColor: '#1E3A5F',
    
  },
  gradientBackground: {
    width: '100%',
    padding: 30,
    alignItems: 'center',
    borderRadius: 30,
    borderWidth: 2,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  particles: {
    position: 'absolute',
    top: -30,
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  particle: {
    position: 'absolute',
    color: 'rgba(255, 215, 0, 0.5)',
    fontSize: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFD700',
    marginBottom: 8,
    textAlign: 'center',
    textShadowColor: 'rgba(255, 215, 0, 0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 5,
    marginTop: 20
  },
  subtitle: {
    fontSize: 16,
    color: '#FFD700',
    marginBottom: 10,
    textAlign: 'center',
    fontWeight: '500',
  },
  lifeContainer: {
    marginVertical: 15,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(255, 215, 0, 0.5)',
    overflow: 'hidden',
  },
  lifeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 35,
  },
  lifeText: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFF',
    marginLeft: 5,
    textShadowColor: 'rgba(255, 215, 0, 0.8)',
    textShadowRadius: 10
  },
  heart: {
    fontSize: 38,
    color: '#FF0000',
    textShadowColor: 'rgba(255, 215, 0, 0.8)',
    textShadowRadius: 15
  },
  rewardsContainer: {
    flexDirection: 'colum',
    alignItems: 'center',
    justifyContent: 'center',
  },
  message: {
    fontSize: 15,
    color: '#FFD700',
    textAlign: 'center',
    marginVertical: 20,
    lineHeight: 22,
  },
  button: {
    borderRadius: 15,
    overflow: 'hidden',
    marginTop: 15,
    
  },
  buttonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 45,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: '900',
    fontSize: 16,
    textTransform: 'uppercase',
  },
  closeButton: {
    position: 'absolute',
    top: 15,
    right: 20,
    borderRadius: 15,
    overflow: 'hidden',
  },
  closeButtonGradient: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    color: '#FFD700',
    fontSize: 24,
    fontWeight: '300',
    lineHeight: 24,
    marginTop: -2,
  }
});