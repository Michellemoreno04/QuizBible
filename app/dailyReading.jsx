import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Share, Alert,ActivityIndicator, Platform, SafeAreaView, StatusBar } from 'react-native';
import * as Speech from 'expo-speech';
import { FontAwesome6, FontAwesome, MaterialIcons, Feather } from '@expo/vector-icons';
import useAuth from  '../components/authContext/authContext';
import { db } from '../components/firebase/firebaseConfig';
import { addDoc, collection, doc, getDoc, getDocs, query, where, orderBy, startAfter, limit } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { InterstitialAd, AdEventType, TestIds } from 'react-native-google-mobile-ads';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useAnimatedStyle, withTiming, withRepeat, withSequence } from 'react-native-reanimated';


const adUnitId = __DEV__ 
? TestIds.INTERSTITIAL
: Platform.OS === 'ios' ? process.env.EXPO_PUBLIC_INTERSTITIAL_ID_IOS 
: process.env.EXPO_PUBLIC_INTERSTITIAL_ID_ANDROID; 

// Crea la instancia del anuncio
const interstitial = InterstitialAd.createForAdRequest(adUnitId, {
  keywords: ['religion', 'bible']
});


const DailyReading = () => {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [isRead, setIsRead] = useState(false);
  const [readingText, setReadingText] = useState([]);
  const [interstitialLoaded, setInternitialLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [currentTextPosition, setCurrentTextPosition] = useState(0);
  const [userInfo, setUserInfo] = useState(null);
  const userId = user?.uid;

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: withRepeat(
            withSequence(
              withTiming(1.1, { duration: 1000 }),
              withTiming(1, { duration: 1000 })
            ),
            -1,
            true
          ),
        },
      ],
      shadowColor: '#FFFFFF',
      shadowOffset: {
        width: 0,
        height: 0,
      },
      shadowOpacity: withRepeat(
        withSequence(
          withTiming(0.8, { duration: 1000 }),
          withTiming(0.2, { duration: 1000 })
        ),
        -1,
        true
      ),
      shadowRadius: withRepeat(
        withSequence(
          withTiming(20, { duration: 1000 }),
          withTiming(10, { duration: 1000 })
        ),
        -1,
        true
      ),
    };
  });


  // Obtener información del usuario
  useEffect(() => {
    const fetchUserInfo = async () => {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      setUserInfo(userDoc.data());
    };
    fetchUserInfo();
  }, [userId]);


  // Cargar interstitial ads 
  useEffect(() => {
    // Si el usuario es premium, no cargar anuncios
    if (userInfo?.Premium) {
      console.log('Usuario premium - no se cargarán anuncios');
      return;
    }

    let isMounted = true;
    let loadAttempts = 0;
    const MAX_LOAD_ATTEMPTS = 3;

    const loadAd = () => {
      try {
        interstitial.load();
        console.log('Intento de carga de interstitial');
      } catch (error) {
        console.log('Error al cargar interstitial:', error);
        if (loadAttempts < MAX_LOAD_ATTEMPTS) {
          loadAttempts++;
          setTimeout(loadAd, 3000); // Reintentar después de 3 segundos
        }
      }
    };

    const onAdLoaded = () => {
      if (isMounted) {
        console.log('Anuncio cargado con éxito');
        setInternitialLoaded(true);
      }
    };

    const onAdFailed = (error) => {
      console.log('Error al cargar anuncio:', error);
      if (isMounted && loadAttempts < MAX_LOAD_ATTEMPTS) {
        loadAttempts++;
        setTimeout(loadAd, 3000); // Reintento después de 3 segundos
      }
    };

    const onAdClosed = () => {
      if (isMounted) {
        if (Platform.OS === 'ios') {
          StatusBar.setHidden(false);
        }
        // Recargar un nuevo anuncio para la próxima vez
        interstitial.load();
        navigation.navigate('(tabs)');
      }
    };

    if (isMounted) {
      // Configurar event listeners
      const unsubscribeLoaded = interstitial.addAdEventListener(AdEventType.LOADED, onAdLoaded);
      const unsubscribeOpened = interstitial.addAdEventListener(AdEventType.OPENED, () => {
        if (Platform.OS === 'ios') StatusBar.setHidden(true);
      });
      const unsubscribeClosed = interstitial.addAdEventListener(AdEventType.CLOSED, onAdClosed);
      const unsubscribeError = interstitial.addAdEventListener(AdEventType.ERROR, onAdFailed);

      // Cargar primer anuncio
      loadAd();

      return () => {
        isMounted = false;
        unsubscribeLoaded();
        unsubscribeOpened();
        unsubscribeClosed();
        unsubscribeError();
      };
    }
  }, [navigation, userInfo]);


  const showInterstitial = () => {
    // Si el usuario es premium, navegar directamente
    if (userInfo?.Premium) {
      navigation.navigate('(tabs)');
      return;
    }

    if (interstitialLoaded) {
      try {
        interstitial.show();
        console.log('Mostrando anuncio');
        setInternitialLoaded(false);
      } catch (error) {
        console.log('Error al mostrar anuncio:', error);
        navigation.navigate('(tabs)');
      }
    } else {
      console.log('Anuncio no cargado, navegando directamente');
      navigation.navigate('(tabs)');
    }
  };

  // Modificar la función getLocalDateString para usar el mismo formato que handleReading
  const getLocalDateString = () => {
    return new Date().toDateString();
  };
  
// obtener el texto de lectura
  useEffect(() => {
    if(!userId) return;

    const fetchDailyVerse = async () => {
      setIsLoading(true);
      try {
        const today = getLocalDateString(); 
        const lastDate = await AsyncStorage.getItem('lastReadingDate');

        // Si ya se leyó el versículo de hoy, no mostrar nada
        if (lastDate === today) {
          console.log('Ya se ha mostrado el texto de hoy.');
          setReadingText([]);
          return;
        }

        // Referencia al documento del usuario y la subcolección "lecturasVistas"
        const userDocRef = doc(db, 'users', userId);
        const lecturasVistasRef = collection(userDocRef, 'lecturasVistas');

        // Consulta la última lectura vista
        const lastReadQuery = query(lecturasVistasRef, orderBy('index', 'desc'), limit(1));
        const lastReadSnapshot = await getDocs(lastReadQuery);

        let lastIndex = 0;
        if (!lastReadSnapshot.empty) {
          lastIndex = lastReadSnapshot.docs[0].data().index;
        }

        // Consulta la siguiente lectura disponible
        const dailyContentRef = collection(db, 'dailyRearingContent');
        const dailyQuery = query(
          dailyContentRef,
          orderBy('index'),
          where('index', '>', lastIndex),
          limit(1)
        );
        const dailySnapshot = await getDocs(dailyQuery);

        if (!dailySnapshot.empty) {
          const nextReading = dailySnapshot.docs.map((doc) => ({
            lecturaId: doc.id,
            ...doc.data(),
          }));
          setReadingText(nextReading);
        } else {
          // Solo si no hay más lecturas nuevas, volvemos al inicio
          const firstReadingQuery = query(
            dailyContentRef,
            orderBy('index'),
            limit(1)
          );
          const firstReadingSnapshot = await getDocs(firstReadingQuery);
          
          if (!firstReadingSnapshot.empty) {
            const firstReading = firstReadingSnapshot.docs.map((doc) => ({
              lecturaId: doc.id,
              ...doc.data(),
            }));
            setReadingText(firstReading);
          } else {
            console.log('No hay lecturas disponibles.');
            setReadingText([]);
          }
        }
      } catch (error) {
        console.error('Error al obtener la siguiente lectura:', error);
        setReadingText([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDailyVerse();
  }, [userId]);



  // Función para reproducir el texto con Speech
  const handleSpeak = async () => {
    if (readingText.length === 0) return;
    
    if (!isSpeaking) {
      setIsLoadingAudio(true);
      const textToSpeak = `${readingText[0].titulo}. ${readingText[0].texto}`;
      
      // Si estamos comenzando desde el inicio
      if (currentTextPosition === 0) {
        Speech.stop();
      }
      
      // Obtener el texto desde la posición actual
      const remainingText = textToSpeak.slice(currentTextPosition);
      
      Speech.speak(remainingText, {
        language: 'es-ES',
        pitch: 1.0,
        rate: 0.95,
        onStart: () => {
          setIsSpeaking(true);
          setIsLoadingAudio(false);
        },
        onDone: () => {
          setIsSpeaking(false);
          setCurrentTextPosition(0); // Resetear posición al terminar
        },
        onStopped: () => {
          // Guardar aproximadamente la posición actual
          const words = textToSpeak.slice(0, currentTextPosition).split(' ').length;
          const approxPosition = Math.floor(currentTextPosition + (words * 5));
          setCurrentTextPosition(Math.min(approxPosition, textToSpeak.length));
          
          setIsSpeaking(false);
          setIsLoadingAudio(false);
        },
        onError: () => {
          setIsSpeaking(false);
          setIsLoadingAudio(false);
          setCurrentTextPosition(0);
        },
      });
    } else {
      Speech.stop();
    }
  };

  // Resetear la posición del texto cuando se desmonta el componente
  useEffect(() => {
    return () => {
      Speech.stop();
      setCurrentTextPosition(0);
    };
  }, []);

  // Función para alternar el estado del checkbox
  const handleCheckbox = () => {
    setIsChecked(!isChecked);
  };

  
  // Función para guardar la lectura en la subcolección "lecturasVistas"
 const handleReading = async () => {
  try {
    if(isSpeaking){
      Speech.stop();
    }
    const today = new Date().toDateString(); // Este formato es el correcto
    
    // Verificar si ya existe la lectura de hoy
    const lecturasVistasRef = collection(doc(db, 'users', userId), 'lecturasVistas');
    const q = query(lecturasVistasRef, where('fechaStr', '==', today)); 
    const snapshot = await getDocs(q); 
    
    if (!snapshot.empty) {
      Alert.alert('¡Ya guardaste esta lectura hoy!');
      return;
    }

    // Guardar nueva lectura
    await addDoc(lecturasVistasRef, {
      titulo: readingText[0].titulo,
      fechaStr: today, 
      texto: readingText[0].texto,
      index: readingText[0].index
    });

    // Actualizar el estado de lectura diaria
    await AsyncStorage.setItem('lastReadingDate', today);
    setIsRead(true);
    showInterstitial();

  } catch (error) {
    console.error('Error al guardar:', error);
    Alert.alert('Error', 'No se pudo guardar la lectura');
  }
};
  // Función para compartir la lectura
  const handleShareReading = async () => {
    try {
      // Se comparte el título y el texto concatenados
      const appStoreLink = 'https://apps.apple.com/do/app/quizbible/id6745747418?|=en-GB';
      const playStoreLink = 'https://play.google.com/store/apps/details?id=com.moreno.dev.QuizBible';
      await Share.share({
        title: 'Reflexión Diaria',
        message: `${readingText[0].titulo}. ${readingText[0].texto}  \n\n ${'Aprende sobre la palabra de Dios en esta App:'} \n\n📱 Descarga QuizBible:\n🍎 iOS: ${appStoreLink}\n\n🤖 Android: ${playStoreLink}`,
        });
    } catch (error) {
      Alert.alert('Error al compartir la lectura.');
    }
  };

    

    if(isLoading){
      return <ActivityIndicator size="large" color="gray" />
    }
    
      if (readingText.length === 0) {
        return (
          <LinearGradient  colors={[ '#1E3A5F', '#3C6E9F']} style={{flex: 1}}>
          <StatusBar barStyle="dark-content" />
          <View style={styles.emptyContainer}>
            <Feather name="book-open" size={60} color="gray" />
            <Text style={styles.emptySubtext}>No hay lecturas por hoy</Text>
          </View>
          </LinearGradient>
        );
      }
    
    
    
      return (
        <LinearGradient  colors={[ '#1E3A5F', '#3C6E9F']} style={styles.card}>
          <StatusBar barStyle="dark-content" />
          <ScrollView 
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
          >
            {readingText.map((item) => (
                <View key={item.lecturaId}>
                <Text style={styles.title}>{item.titulo}</Text>
                <Text style={styles.text}>{item.texto}</Text>
                </View>
            ))}
    
            {/* Checkbox para marcar como leído */}
            <TouchableOpacity 
              style={styles.checkboxContainer}
              onPress={handleCheckbox}
              activeOpacity={0.8}
            >
              <View style={[styles.checkbox, isChecked && styles.checked]}>
                {isChecked && <Feather name="check" size={18} color="white" />}
              </View>
              <Text style={styles.checkboxText}>Marcar como leído</Text>
            </TouchableOpacity>
    
            {/* Botones adicionales */}
            <View style={styles.actionsContainer}>
              <TouchableOpacity 
                style={[styles.actionButton, styles.shareButton]}
                onPress={handleShareReading}
                activeOpacity={0.8}
              >
                <MaterialIcons name="share" size={22} color="white" />
                <Text style={styles.actionButtonText}>Compartir</Text>
              </TouchableOpacity>
              
              {isChecked && !isRead && (
                <TouchableOpacity 
                  style={[styles.actionButton, styles.readButton]}
                  onPress={handleReading}
                  activeOpacity={0.8}
                >
                  <FontAwesome name="check" size={18} color="white" />
                  <Text style={styles.actionButtonText}>Leído</Text>
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>

          {/* Controlador de audio fijo en la parte inferior */}
          <View style={styles.fixedAudioControls}>
            <Animated.View style={[
              styles.audioButtonContainer,
              isSpeaking && animatedStyle
            ]}>
              <TouchableOpacity 
                style={[styles.audioButton, isSpeaking && styles.activeAudioButton]}
                onPress={handleSpeak}
                activeOpacity={0.8}
              >
                {isLoadingAudio ? (
                  <ActivityIndicator size="large" color="white" style={styles.audioIcon} />
                ) : (
                  <FontAwesome6 
                    name={isSpeaking ? "pause" : "play"} 
                    size={30} 
                    color="white" 
                    style={styles.audioIcon}
                  />
                )}
              </TouchableOpacity>
            </Animated.View>
          </View>
        </LinearGradient>
        
      );
    };
    
      const styles = StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: '#F9F9F9',
          
        },
        
        card: {
          padding: 15,
          
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 6,
          elevation: 3,
        },
        title: {
          fontSize: 28,
          fontWeight: '800',
          color: '#FFFFFF',
          marginBottom: 20,
          textAlign: 'center',
          lineHeight: 34,
        },
        text: {
          fontSize: 17,
          color: '#FFFFFF',
          lineHeight: 23,
          textAlign: 'justify',
        },
        audioControls: {
          marginBottom: 25,
          alignItems: 'center',
        },
        audioButtonContainer: {
          width: 80,
          height: 80,
          justifyContent: 'center',
          alignItems: 'center',
        },
        audioButton: {
          width: 80,
          height: 80,
          backgroundColor: '#2196F3',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 50,
          borderWidth: 2,
          borderColor: '#FFFFFF',
        },
        activeAudioButton: {
          backgroundColor: '#1976D2',
          borderWidth: 2,
          borderColor: '#FFFFFF',
        },
        audioIcon: {
         // marginRight: 12,
        },
        audioButtonText: {
          fontSize: 16,
          fontWeight: '600',
          color: 'white',
        },
        checkboxContainer: {
          marginTop: 20,
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 30,
          alignSelf: 'center',
        },
        checkbox: {
          width: 24,
          height: 24,
          borderRadius: 6,
          borderWidth: 2,
          borderColor: '#DDD',
          marginRight: 12,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'white',
        },
        checked: {
          backgroundColor: '#4CAF50',
          borderColor: '#4CAF50',
        },
        checkboxText: {
          fontSize: 16,
          color: '#FFFFFF',
          fontWeight: '500',
        },
        actionsContainer: {
          flexDirection: 'row',
          justifyContent: 'center',
          gap: 15,
          marginBottom: 20,
        },
        actionButton: {
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: 12,
          paddingHorizontal: 20,
          borderRadius: 50,
          minWidth: 120,
          justifyContent: 'center',
        },
        shareButton: {
          backgroundColor: '#6200EE',
        },
        readButton: {
          backgroundColor: '#4CAF50',
        },
        actionButtonText: {
          fontSize: 16,
          fontWeight: '600',
          color: 'white',
          marginLeft: 10,
        },
        emptyContainer: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        
        },
        emptySubtext: {
          color: 'rgba(255,255,255,0.4)',
          fontSize: 14,
          marginTop: 8,
          textAlign: 'center',
          color: 'gray',
        },
        fixedAudioControls: {
          position: 'absolute',
          bottom: 20,
          left: 0,
          right: 0,
          alignItems: 'center',
          paddingHorizontal: 20,
          zIndex: 1000,
        },
        scrollContainer: {
          paddingBottom: 100, // Añadir espacio para el botón fijo
        },
      });
    
  
  export default DailyReading;