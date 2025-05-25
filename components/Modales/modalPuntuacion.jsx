import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, StatusBar, ScrollView, Platform } from 'react-native';
import Modal from 'react-native-modal';
import LottieView from 'lottie-react-native';
import { FontAwesome5, FontAwesome6 } from '@expo/vector-icons';
import { Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSound } from '../soundFunctions/soundFunction';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { InterstitialAd, AdEventType, TestIds } from 'react-native-google-mobile-ads';

const adUnitId = __DEV__ 
  ? TestIds.INTERSTITIAL 
  : Platform.OS === 'ios' ? process.env.EXPO_PUBLIC_INTERSTITIAL_ID_IOS 
  : process.env.EXPO_PUBLIC_INTERSTITIAL_ID_ANDROID;

const interstitial = InterstitialAd.createForAdRequest(adUnitId, {
  keywords: ['bible', 'religion'],
});

const { width, height } = Dimensions.get('window');

export function ModalPuntuacion({ 
  isVisible, 
  respuestasCorrectas, 
  expGanada, 
  monedasGanadas, 
  userInfo, 
  isPlaying,
  stopMusic,
}) {
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigation = useNavigation();
  const playSound = useSound();

  useEffect(() => {
    const today = new Date().toDateString();
    AsyncStorage.setItem("lastQuizDate", today);
    AsyncStorage.setItem("quizCompleted", "true");

    if(userInfo.Premium) {
      return;
    } 

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

    interstitial.load();

    return () => {
      unsubscribeLoaded();
      unsubscribeError();
      unsubscribeOpened();
      unsubscribeClosed();
    };
  }, [isVisible]);

  const showAd = () => {
    if(userInfo.Premium) {
      navigation.reset({
        index: 0,
        routes: [{ name: '(tabs)' }],
      });
      return;
    }
    if(isPlaying) stopMusic();
    if(loaded) {
      interstitial.show();
    } else {
      navigation.reset({
        index: 0,
        routes: [{ name: '(tabs)' }],
      });
    }
  }

  useEffect(() => {
    if (isVisible) {
      playSound(require('../../assets/sound/goodresult.mp3'));
    }
    const timer = setTimeout(() => {
      setLoading(false)
    }, 4000)
    return () => clearTimeout(timer)
  }, [isVisible]);

  const expRelativa = userInfo.Exp % 400;
  const nivelActual = Math.floor(userInfo.Exp / 400) + 1;
  const expParaSiguienteNivel = 400 - expRelativa;

  return (
    <Modal 
      isVisible={isVisible} 
      backdropOpacity={0.6}
      style={styles.modal}
      //avoidKeyboard={true} // 
    >
      
        <LinearGradient
          colors={['#fdf2ff', '#e6d4ff', '#d8c4ff']}
          style={styles.gradientContainer}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
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
              </View>

              <View style={styles.rewardsContainer}>
                <View style={styles.rewardItem}>
                  <LinearGradient
                    colors={['#ffd700', '#ffbf00']}
                    style={[styles.iconContainer, styles.coinBackground]}
                  >
                    <FontAwesome5 name="coins" size={width * 0.08} color="#a88600" />
                  </LinearGradient>
                  <Text style={styles.rewardValue}>+{monedasGanadas}</Text>
                  <Text style={styles.rewardLabel}>Monedas</Text>
                </View>

                <View style={styles.rewardItem}>
                  <LinearGradient
                    colors={['#6a5acd', '#7b68ee']}
                    style={[styles.iconContainer, styles.expBackground]}
                  >
                    <FontAwesome6 name="award" size={width * 0.08} color="#fff" />
                  </LinearGradient>
                  <Text style={styles.rewardValue}>+{expGanada}</Text>
                  <Text style={styles.rewardLabel}>Experiencia</Text>
                </View>
              </View>

              <View style={styles.progressContainer}>
                <Text style={styles.progressText}>
                  Respuestas correctas: {respuestasCorrectas}/10
                </Text>
                <View style={styles.progressBarBackground}>
                  <View style={[styles.progressBarFill, { 
                    width: `${(respuestasCorrectas / 10) * 100}%`,
                  }]}>
                    <LinearGradient
                      colors={['#76ff03', '#4CAF50']}
                      style={styles.progressBarGradient}
                    />
                  </View>
                </View>
              </View>

              <View style={styles.progressContainer}>
                <Text style={styles.progressText}>
                  Nivel {nivelActual} {'\n'} Gana {expParaSiguienteNivel} de exp para subir de nivel
                </Text>
                <View style={[styles.progressBarBackground, styles.expProgressBar]}>
                  <View style={[styles.progressBarFill, { 
                    width: `${(expRelativa / 400) * 100}%`,
                  }]}>
                    <LinearGradient
                      colors={['#6a5acd', '#7b68ee']}
                      style={styles.progressBarGradient}
                    />
                  </View>
                </View>
              </View>

              <Pressable 
                onPress={showAd}  
                style={({ pressed }) => [
                  styles.buttonContainer, 
                  { 
                    opacity: (loaded || loading) ? (pressed ? 0.8 : 1) : 0.5 
                  }
                ]}
                disabled={!loaded && !loading}
              >
                <LinearGradient
                  colors={['#ff6b6b', '#ff8e53']}
                  style={[styles.buttonGradient, { opacity: loading ? 0.5 : 1 }]}
                >
                  <Text style={styles.buttonText}>
                    {loaded ? 'Volver al inicio' : 'Obteniendo recompensas...'}
                  </Text>
                </LinearGradient>
              </Pressable>
            </View>
          </ScrollView>
        </LinearGradient>
      
    </Modal>
  );
}

const styles = StyleSheet.create({
  modal: {
    margin: '4%',
    justifyContent: 'center',
    alignItems: 'center',
  },
 
  gradientContainer: {
  
    width: '100%',
   // height: height * 0.8,
    paddingHorizontal: width * 0.05,
    paddingBottom: height * 0.03,
    borderRadius: 20,
    alignItems: 'center',
    
  },
  contentContainer: {
    marginTop: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtitle: {
    fontSize: width * 0.045,
    color: '#6d4c41',
    marginBottom: height * 0.01,
    fontFamily: 'Inter-Bold',
    letterSpacing: 0.5,
  },
  streakText: {
    fontSize: width * 0.04,
    color: '#4a148c',
    marginBottom: height * 0.02,
    fontFamily: 'Inter-SemiBold',
    backgroundColor: '#fff3e0',
    paddingVertical: height * 0.008,
    paddingHorizontal: width * 0.04,
    borderRadius: 20,
  },
  animationContainer: {
    borderRadius: 20,
    backgroundColor: '#fdf2ff',
    //marginBottom: -height * 0.05,
  },
  animation: {
    width: width * 0.50,
    height: width * 0.45,
  },
  congratsText: {
    fontSize: width * 0.07,
    fontWeight: '800',
    color: '#4a148c',
   marginTop: -height * 0.04,
    fontFamily: 'Inter-Black',
    textAlign: 'center',
  },
 
  rewardsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: width * 0.1,
    marginVertical: height * 0.01,
  },
  rewardItem: {
    alignItems: 'center',
    minWidth: width * 0.25,
  },
  iconContainer: {
  padding: width * 0.04,
    borderRadius: 20,
   // marginBottom: height * 0.01,
  },
  rewardValue: {
    fontSize: width * 0.07,
    fontWeight: '900',
    color: '#4a148c',
    fontFamily: 'Inter-Black',
  },
  rewardLabel: {
    fontSize: width * 0.035,
    color: '#6d4c41',
    fontFamily: 'Inter-SemiBold',
  },
  progressContainer: {
    width: width * 0.75,
    marginVertical: height * 0.010,
    alignItems: 'center',
  },
  progressText: {
    fontSize: width * 0.038,
    color: '#4a148c',
    marginBottom: height * 0.01,
    textAlign: 'center',
    fontFamily: 'Inter-SemiBold',
  },
  progressBarBackground: {
    width: '100%',
    height: height * 0.02,
    borderRadius: 10,
    backgroundColor: '#fff',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#4a148c',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 8,
    overflow: 'hidden',
  },
  progressBarGradient: {
    flex: 1,
  },
  buttonContainer: {
    width: width * 0.7,
    marginTop: height * 0.02,
    borderRadius: 15,
    overflow: 'hidden',
  },
  buttonGradient: {
    padding: height * 0.02,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: width * 0.045,
    fontWeight: '900',
    fontFamily: 'Inter-Black',
    letterSpacing: 0.5,
  },
  expProgressBar: {
    borderColor: '#6a5acd',
  },
});