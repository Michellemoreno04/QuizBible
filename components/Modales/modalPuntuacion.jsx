import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Modal from 'react-native-modal';
import LottieView from 'lottie-react-native';
import { FontAwesome5, FontAwesome6 } from '@expo/vector-icons';
import { Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSound } from '../soundFunctions/soundFunction';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Platform } from 'react-native';
import { InterstitialAd, AdEventType, TestIds } from 'react-native-google-mobile-ads';



const adUnitId = __DEV__ 
? TestIds.INTERSTITIAL 
: Platform.OS === 'ios' ? process.env.EXPO_PUBLIC_INTERSTITIAL_ID_IOS 
: process.env.EXPO_PUBLIC_INTERSTITIAL_ID_ANDROID;

const interstitial = InterstitialAd.createForAdRequest(adUnitId, {
  keywords: ['bible', 'religion'],
});

const { width, height } = Dimensions.get('screen');
export function ModalPuntuacion({ 
  isVisible, 
  respuestasCorrectas, 
  expGanada, 
  monedasGanadas, 
  userInfo, 
  isPlaying,
  stopMusic
}) {
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigation = useNavigation();



  const playSound = useSound();

// Cargar el anuncio intersticial
useEffect(() => {
  // Guardar la fecha del quiz en AsyncStorage para ejecutar la racha antes del modal
  const today = new Date().toDateString();
   AsyncStorage.setItem("lastQuizDate", today);
   AsyncStorage.setItem("quizCompleted", "true");

  const unsubscribeLoaded = interstitial.addAdEventListener(AdEventType.LOADED, () => {
    setLoaded(true);
    setError(null);
  });

  const unsubscribeError = interstitial.addAdEventListener(AdEventType.ERROR, (error) => {
    setError(error.message);
    setLoaded(false);
  });

    

  const unsubscribeOpened = interstitial.addAdEventListener(AdEventType.OPENED, () => {
    if (Platform.OS === 'ios') {
      // Prevent the close button from being unreachable by hiding the status bar on iOS
      StatusBar.setHidden(true);
    }
  });

  const unsubscribeClosed = interstitial.addAdEventListener(AdEventType.CLOSED, () => {
    if (Platform.OS === 'ios') {
      StatusBar.setHidden(false);
    }
    navigation.reset({
      index: 0,
      routes: [{ name: '(tabs)' }],
    });
  });

  // Start loading the interstitial straight away
  interstitial.load();

  // Unsubscribe from events on unmount
  return () => {
    unsubscribeLoaded();
    unsubscribeError();
    unsubscribeOpened();
    unsubscribeClosed();
  };

}, [isVisible]);


const showAd = () => {
  if(isPlaying){
    stopMusic();
  }
  if(loaded){
    interstitial.show();
  }
  else{
    console.log('Anuncio no cargado:', error);
    navigation.reset({
      index: 0,
      routes: [{ name: '(tabs)' }],
    });
  }
}

// para que suene el audio de la puntuacion
  useEffect(() => {
    if (isVisible) {
      playSound(require('../../assets/sound/goodresult.mp3'));
    }
    let timer = setTimeout(() => {
      setLoading(false)
    }, 4000)
    return () => clearTimeout(timer)
  }, [isVisible]);

  return (
    <Modal isVisible={isVisible} backdropOpacity={0.3}>
      <View style={styles.gradientWrapper}>
        <LinearGradient
          colors={['#fdf2ff', '#e6d4ff', '#d8c4ff']}
          style={styles.gradientContainer}
        >
          <View style={styles.contentContainer}>
            <Text style={styles.subtitle}>🎉 Nueva recompensa 🎉</Text>
            
          

            <Text style={styles.streakText}>🔥 Racha actual: {userInfo.Racha} días consecutivos</Text>

            <View style={styles.animationContainer}>
              <LottieView
                source={require('../../assets/lottieFiles/treasureCoins.json')}
                autoPlay
                loop={false}
                style={styles.animation}
              />
              <Text style={styles.congratsText}>¡Felicidades!</Text>
              <View style={styles.confettiEffect}/>
            </View>

            <View style={styles.rewardsContainer}>
              <View style={styles.rewardItem}>
                <LinearGradient
                  colors={['#ffd700', '#ffbf00']}
                  style={[styles.iconContainer, styles.coinBackground]}
                >
                  <FontAwesome5 name="coins" size={32} color="#a88600" />
                </LinearGradient>
                <Text style={styles.rewardValue}>+{monedasGanadas}</Text>
                <Text style={styles.rewardLabel}>Monedas</Text>
              </View>

              <View style={styles.rewardItem}>
                <LinearGradient
                  colors={['#6a5acd', '#7b68ee']}
                  style={[styles.iconContainer, styles.expBackground]}
                >
                  <FontAwesome6 name="award" size={32} color="#fff" />
                </LinearGradient>
                <Text style={styles.rewardValue}>+{expGanada}</Text>
                <Text style={styles.rewardLabel}>Experiencia</Text>
              </View>
            </View>

            <View style={styles.progressContainer}>
              <Text style={styles.progressText}>
                {respuestasCorrectas}/{7}
              </Text>
              <View style={styles.progressBarBackground}>
                <LinearGradient
                  colors={['#76ff03', '#4CAF50']}
                  style={[styles.progressBarFill, { width: `${(respuestasCorrectas / 7) * 100}%` }]}
                />
              </View>
            </View>

            <Pressable onPress={showAd}  style={[styles.buttonContainer, { opacity: loaded || loading ? 1 : 0.5 }  ]}>
              <LinearGradient
                colors={['#ff6b6b', '#ff8e53']}
                style={[styles.buttonGradient, { opacity: loading ? 0.5 : 1 }]}
              >
                <Text style={styles.buttonText}>{loaded ? 'Volver al inicio' : 'Obteniendo recompensas...'}</Text>
              </LinearGradient>
            </Pressable>
          </View>
        </LinearGradient>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  gradientWrapper: {
    width: width * 0.9,
    maxHeight: height * 0.8,
    borderRadius: 25,
    backgroundColor: '#fdf2ff',
  
  },
  gradientContainer: {
    width: '100%',
    height: '100%',
    borderRadius: 25,
    overflow: 'hidden',
  },
  contentContainer: {
    alignItems: 'center',
    padding: 15,
    paddingTop: 25,
  },
  subtitle: {
    fontSize: 18,
    color: '#6d4c41',
    marginBottom: 5,
    fontFamily: 'Inter-Bold',
    letterSpacing: 0.5,
  },
  titleContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  titleBackground: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    top: -5,
    left: -25,
    borderRadius: 20,
    transform: [{ rotate: '-0deg' }],
  },
  title: {
    fontSize: 42,
    fontWeight: '900',
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
    transform: [{ rotate: '2deg' }],
  },
  streakText: {
    fontSize: 16,
    color: '#4a148c',
    marginBottom: 20,
    fontFamily: 'Inter-SemiBold',
    backgroundColor: '#fff3e0',
    paddingVertical: 6,
    paddingHorizontal: 15,
    borderRadius: 20,
   
  },
  animationContainer: {
    position: 'relative',
    top: -50,
    marginBottom: -30,

  },
  animation: {
    width: 200,
    height: 200,
  },
  congratsText: {
    fontSize: 26,
    fontWeight: '800',
    color: '#4a148c',
    marginTop: -30,
    fontFamily: 'Inter-Black',
    textAlign: 'center',
  },
  confettiEffect: {
    position: 'absolute',
    top: 0,
    left: -30,
    right: -30,
    bottom: -10,
    backgroundColor: 'rgba(255, 223, 0, 0.1)',
    borderRadius: 50,
  },
  rewardsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 35,
    marginVertical: 10,
  },
  rewardItem: {
    alignItems: 'center',
  },
  iconContainer: {
    padding: 18,
    borderRadius: 25,
    backgroundColor: '#fff',
    
  },
  rewardValue: {
    fontSize: 26,
    fontWeight: '900',
    color: '#4a148c',
    fontFamily: 'Inter-Black',
  },
  rewardLabel: {
    fontSize: 16,
    color: '#6d4c41',
    fontFamily: 'Inter-SemiBold',
  },
  progressContainer: {
    width: '90%',
    marginVertical: 10,
  },
  progressText: {
    fontSize: 16,
    color: '#4a148c',
    marginBottom: 12,
    textAlign: 'center',
    fontFamily: 'Inter-SemiBold',
  },
  progressBarBackground: {
    height: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#4a148c',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 8,
  },
  buttonContainer: {
    width: '100%',
    marginTop: 5,
    backgroundColor: '#ff6b6b',
   
  },
  buttonGradient: {
    paddingVertical: 16,
    borderRadius: 15,
    alignItems: 'center',
    backgroundColor: '#ff6b6b',
  },
  buttonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: '900',
    fontFamily: 'Inter-Black',
    letterSpacing: 0.5,
  },
});