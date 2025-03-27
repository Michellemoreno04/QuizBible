import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Share, Alert,ActivityIndicator, Platform } from 'react-native';
import * as Speech from 'expo-speech';
import { FontAwesome6, FontAwesome, MaterialIcons, Feather } from '@expo/vector-icons';
import useAuth from  '../components/authContext/authContext';
import { db } from '../components/firebase/firebaseConfig';
import { addDoc, collection, doc, getDoc, getDocs, query, where, orderBy, startAfter, limit } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { InterstitialAd, AdEventType, TestIds } from 'react-native-google-mobile-ads';


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
  const userId = user.uid;

   

  useEffect(() => {
    let isMounted = true; // Para prevenir actualizaciones en componentes desmontados
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
  }, [navigation]);


  const showInterstitial = () => {
    if (interstitialLoaded) {
      try {
        interstitial.show();
        console.log('Mostrando anuncio');
        setInternitialLoaded(false); // Resetear estado para próxima carga
      } catch (error) {
        console.log('Error al mostrar anuncio:', error);
        navigation.navigate('(tabs)');
      }
    } else {
      console.log('Anuncio no cargado, navegando directamente');
      navigation.navigate('(tabs)');
    }
  };

  // Efecto para obtener el texto de lectura
  const getLocalDateString = () => {
    const date = new Date();
    return `${date.getFullYear()}-${(date.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
  };
  
// Efecto para obtener el texto de lectura
  useEffect(() => {
    const fetchDailyVerse = async () => {
      try {
 const today = getLocalDateString();
    // Recupera la última fecha guardada (si existe)
    const lastDate = await AsyncStorage.getItem('lastReadingDate');

        // 3. Si ya se leyó el versículo de hoy, no hagas nada
        if (lastDate === today) {
          console.log('Ya se ha mostrado el texto de hoy.');
         return;
        }

        // 4. Referencia al documento del usuario y la subcolección "lecturasVistas"
        const userDocRef = doc(db, 'users', user?.uid);
        const lecturasVistasRef = collection(userDocRef, 'lecturasVistas');

        // 5. Consulta la última lectura vista ordenando por "index" de forma descendente
        const lastReadQuery = query(lecturasVistasRef, orderBy('index', 'desc'), limit(1));
        const lastReadSnapshot = await getDocs(lastReadQuery);

        let lastIndex = 0;
        if (!lastReadSnapshot.empty) {
          lastIndex = lastReadSnapshot.docs[0].data().index;
        }


  // Consulta en la colección dailyRearingContent la lectura cuyo índice sea mayor al último guardado
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
      console.log('No hay nuevas lecturas disponibles en dailyRearingContent.');
    }
  } catch (error) {
    console.error('Error al obtener la siguiente lectura:', error);
  }
};
    
      fetchDailyVerse();
    
  }, []);



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
    const today = getLocalDateString();
    
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
      date: new Date() // Agregar timestamp para ordenamiento
    });

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
      await Share.share({
        title: 'Reflexión Diaria',
        message: `${readingText[0].titulo}. ${readingText[0].texto}`,
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
      <View style={styles.emptyContainer}>
         <Feather name="book-open" size={60} color="gray" />
          <Text style={styles.emptySubtext}>No hay lecturas  por hoy</Text>
      </View>
    );
  }



  return (
    <View style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {readingText.map((item) => (
          <View key={item.lecturaId} style={styles.card}>
            <Text style={styles.title}>{item.titulo}</Text>
            <Text style={styles.text}>{item.texto}</Text>
          </View>
        ))}

        {/* Controlador de audio */}
        <View style={styles.audioControls}>
          <TouchableOpacity 
            style={[styles.audioButton, isSpeaking && styles.activeAudioButton]}
            onPress={handleSpeak}
            activeOpacity={0.8}
          >
            {isLoadingAudio ? (
              <ActivityIndicator size="small" color="white" style={styles.audioIcon} />
            ) : (
              <FontAwesome6 
                name={isSpeaking ? "pause" : "play"} 
                size={28} 
                color="white" 
                style={styles.audioIcon}
              />
            )}
            <Text style={styles.audioButtonText}>
              {isLoadingAudio ? 'Cargando...' : isSpeaking ? 'Reproduciendo...' : 'Reproducir'}
            </Text>
          </TouchableOpacity>
        </View>

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
    </View>
  );
};

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#F9F9F9',
      paddingHorizontal: 16,
    },
    scrollContainer: {
      paddingVertical: 10,
    },
    card: {
      backgroundColor: 'white',
      borderRadius: 16,
      padding: 10,
      marginBottom: 30,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
      elevation: 3,
    },
    title: {
      fontSize: 28,
      fontWeight: '800',
      color: '#1A1A1A',
      marginBottom: 20,
      textAlign: 'center',
      lineHeight: 34,
    },
    text: {
      fontSize: 17,
      color: '#444',
      lineHeight: 28,
      textAlign: 'justify',
    },
    audioControls: {
      marginBottom: 25,
      alignItems: 'center',
    },
    audioButton: {
      backgroundColor: '#2196F3',
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 14,
      paddingHorizontal: 24,
      borderRadius: 50,
      shadowColor: '#2196F3',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 10,
      elevation: 3,
    },
    activeAudioButton: {
      backgroundColor: '#1976D2',
    },
    audioIcon: {
      marginRight: 12,
    },
    audioButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: 'white',
    },
    checkboxContainer: {
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
      color: '#444',
      fontWeight: '500',
    },
    actionsContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 15,
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
  });
  
  export default DailyReading;