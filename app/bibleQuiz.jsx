import React, { useEffect, useState, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ImageBackground, Animated,Platform, ActivityIndicator,Dimensions, ScrollView, StatusBar } from 'react-native';
import { AntDesign, FontAwesome5, MaterialCommunityIcons, Octicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { doc, updateDoc, onSnapshot, getDocs, collection, limit, query, orderBy, startAfter, serverTimestamp, increment, setDoc, getDoc } from 'firebase/firestore';
import useAuth from '../components/authContext/authContext';
import { db } from '../components/firebase/firebaseConfig';
import { ModalPuntuacion } from '@/components/Modales/modalPuntuacion';
import { ModalRacha } from '@/components/Modales/modalRacha';
import { ModalRachaPerdida } from '@/components/Modales/rachaPerdida';
import { useSound } from '@/components/soundFunctions/soundFunction';
import { useBackgroundMusic } from '@/components/soundFunctions/soundFunction';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NivelModal from '@/components/Modales/modalNivel';
import { niveles } from '@/components/Niveles/niveles';
import {RewardedAdModal} from '../components/Modales/modalNotVidas';
import QuizActions from '@/components/quizFunctions/quizFuncion';
import { useIsFocused } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { InterstitialAd, AdEventType, TestIds } from 'react-native-google-mobile-ads';
import { useToast } from 'react-native-toast-notifications';

const adUnitId = __DEV__ 
  ? TestIds.INTERSTITIAL
  : Platform.OS === 'ios' 
  ? process.env.EXPO_PUBLIC_INTERSTITIAL_ID_IOS 
  : process.env.EXPO_PUBLIC_INTERSTITIAL_ID_ANDROID;

// Crea la instancia del anuncio
const interstitial = InterstitialAd.createForAdRequest(adUnitId, {
  keywords: ['religion', 'bible']
});

const { width, height } = Dimensions.get('window');

const responsiveWidth = width * 0.9; // 90% del ancho de pantalla




const BibleQuiz = () => {
  const navigation = useNavigation();
  const playSound = useSound();
  const { startMusic, stopMusic, isMuted, toggleMute, isPlaying } = useBackgroundMusic();
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [respuestaSeleccionada, setRespuestaSeleccionada] = useState(null);
  const [userInfo, setUserInfo] = useState({});
  const [mostrarRespuestaCorrecta, setMostrarRespuestaCorrecta] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showModalRacha, setShowModalRacha] = useState(false);
  const [showModalRachaPerdida, setShowModalRachaPerdida] = useState(false);
  const [resultadoRespuestas, setResultadoRespuestas] = useState(0);
  const [expGanada, setExpGanada] = useState(0);
  const [preguntasRespondidas, setPreguntasRespondidas] = useState([]);
  const [showNivelModal, setShowNivelModal] = useState(false);
  const [nivelAnterior, setNivelAnterior] = useState(null);
  const [showModalNotVidas, setShowModalNotVidas] = useState(false);
  const [tiempoRestante, setTiempoRestante] = useState(20); 
  const [tiempoAgregado, setTiempoAgregado] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [interstitialLoaded, setInternitialLoaded] = useState(false);
  const backgroundMusic = require('../assets/sound/quiz-music1.mp3');
  const isFocused = useIsFocused();
  const { user } = useAuth();
  const userId = user?.uid;
  const toast = useToast();

  // Cierra los modales al salir
  useFocusEffect(
    useCallback(() => {
      return () => {
        stopMusic(backgroundMusic);
        setShowModalNotVidas(false); // Cierra modal al salir
        setShowModal(false);
        setShowModalRacha(false);
        setShowModalRachaPerdida(false);
        setShowNivelModal(false);
      };
    }, [])
  );

  // verifica si el nivel ha cambiado
  useEffect(() => {
    if (!userId) return;
  
    const userRef = doc(db, 'users', userId);
    const unsubscribe = onSnapshot(userRef, (snapshot) => {
      const userData = snapshot.data() || {};
      
      if (userData.Exp) {
        const nivelActual = niveles(userData.Exp).nivel;
        
        // Usar la versión actualizada del estado anterior
        setNivelAnterior(prevNivel => {
          // Mostrar modal solo si el nivel sube
          if (prevNivel !== null && nivelActual > prevNivel) {
            console.log('¡Nuevo nivel alcanzado!');
            setShowNivelModal(true);
          }
          return nivelActual;
        });
  
        // Actualizar Nivel en Firestore solo si es necesario
        if (userData.Nivel !== nivelActual) {
          updateDoc(userRef, { Nivel: nivelActual });
        }
      }
    });
  
    return () => unsubscribe();
  }, [userId]); 

// Funcion para obtener las preguntas
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const userDocRef = doc(db, 'users', user?.uid);
        
        // 1. Obtener el último índice de la subcolección de preguntas respondidas
        const answeredColRef = collection(userDocRef, 'preguntas_respondidas');
        const lastAnsweredQuery = query(
          answeredColRef,
          orderBy('index', 'desc'),
          limit(1)
        );
        
        const lastAnsweredSnapshot = await getDocs(lastAnsweredQuery);
        let lastQuestionIndex = 0;
        
        if (!lastAnsweredSnapshot.empty) {
          lastQuestionIndex = lastAnsweredSnapshot.docs[0].data().index;
        }
  
        // 2. Configurar la consulta paginada en la colección "preguntas"
        const q = query(
          collection(db, 'preguntas'),
          orderBy('index'),
          startAfter(lastQuestionIndex),
          limit(7)
        );
        
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
          console.log('No hay más preguntas disponibles.');
          return;
        }
        
        // 3. Mapear los documentos obtenidos
        const nuevasPreguntas = querySnapshot.docs.map(doc => ({
          questionId: doc.id,
          ...doc.data(),
        }));
        
        setQuestions(nuevasPreguntas);
      } catch (error) {
        console.error('Error al obtener las preguntas:', error);
        Alert.alert('Error', 'No se pudieron obtener más preguntas.');
      }
    };
  
    fetchQuestions();
  }, []);

  // Escucha cambios en el documento del usuario
  useEffect(() => {
    const userDocRef = doc(db, 'users', user?.uid);

    const unsubscribe = onSnapshot(userDocRef, (doc) => {
      if (doc.exists()) {
        const userData = doc.data();
        setUserInfo(userData);
      } else {
        console.error('El documento del usuario no existe');
      }
    });

    return () => unsubscribe();
  }, [userId]);

  const pregunta = questions[currentQuestion]?.question;
  const referencia = questions[currentQuestion]?.bibleReference;
  const correcta = questions[currentQuestion]?.correctAnswer;
  const respuestas = questions[currentQuestion]?.answers || [];
 // Animaciones
 const questionOpacity = useRef(new Animated.Value(0)).current;
 const [answerAnimations, setAnswerAnimations] = useState(
   respuestas.map(() => new Animated.Value(0))
 );
// Función optimizada para marcar como respondida
const marcarPreguntaRespondida = async (questionId, questionIndex) => {
  if (!questionId || !user?.uid) return;

  const userDocRef = doc(db, 'users', user.uid);
  
  try {
    // 1. Crear documento en la subcolección de preguntas respondidas
    const answeredQuestionRef = doc(
      collection(userDocRef, 'preguntas_respondidas'),
      questionId
    );
    
    await setDoc(answeredQuestionRef, {
      questionId,
      index: questionIndex,
      timestamp: serverTimestamp()
    });
    
    // 2. Actualizar estado local
    setPreguntasRespondidas(prev => [...prev, questionId]);
  } catch (error) {
    console.error('Error al marcar la pregunta:', error);
  }
};

// Escucha cambios en el documento del usuario
useEffect(() => {
  const userDocRef = doc(db, 'users', user?.uid);
  const unsubscribe = onSnapshot(userDocRef, (doc) => {
    if (doc.exists()) {
      setPreguntasRespondidas(doc.data().answeredQuestions || []);
    }
  });

  return () => unsubscribe();
}, []);

  // Función para comprobar la respuesta seleccionada
  const comprobarRespuesta = async () => {
    // Primero verificamos si se seleccionó alguna respuesta.
    if (respuestaSeleccionada === null) {
      toast.show('Por favor, selecciona una respuesta.', {
        type: 'info',
        placement: 'top',
        duration: 2000,
        style: {
          borderRadius: 25,
          backgroundColor: 'rgba(0, 255, 100, 0.8)',
          borderWidth: 1,
          borderColor: '#00f7ff33',
        },
        
      });
      return;
    }
  
    // Caso: Respuesta correcta
    if (respuestaSeleccionada === correcta) {
      // Reproducir sonido de respuesta correcta.
      await playSound(require('../assets/sound/correct-choice.mp3'));
  
      // Sumamos 15 puntos de experiencia.
      setExpGanada((prevExp) => prevExp + 15);
      // Actualizamos el contador de respuestas correctas.
      // Usamos una variable local para tener el nuevo total sin depender del estado asíncrono.
      const nuevasRespuestasCorrectas = resultadoRespuestas + 1;
      setResultadoRespuestas(nuevasRespuestasCorrectas);
  
      // Marcamos la pregunta como respondida.
      await marcarPreguntaRespondida(
        questions[currentQuestion]?.questionId,
        questions[currentQuestion]?.index
      );
  
      
      // NOTA: No actualizamos las monedas en cada pregunta correcta.
      const userDocRef = doc(db, 'users', userId);
      await updateDoc(userDocRef, {
        Exp: increment(15),
        Nivel: niveles(userInfo.Exp + 15).nivel
      });
  
      // Si aún quedan preguntas por contestar, avanzamos a la siguiente.
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setRespuestaSeleccionada(null);
      } else {
        // Al finalizar el quiz, calculamos las monedas ganadas:
       
        const totalMonedas = nuevasRespuestasCorrectas * 10;
        await updateDoc(userDocRef, {
          // Sumamos las monedas totales ganadas al valor actual.
          Monedas: userInfo.Monedas + totalMonedas,
        });
        // Guardamos la fecha del quiz en AsyncStorage.
        const today = new Date().toDateString();
        // Mostramos el modal final.
        stopMusic(backgroundMusic);
        // Guardamos la fecha del quiz para ejecutar la racha antes del modal
        await AsyncStorage.setItem("lastQuizDate", today);
        await AsyncStorage.setItem("quizCompleted", "true");
        setShowModal(true);
      }
    } else {
      // Caso: Respuesta incorrecta.
      
      setMostrarRespuestaCorrecta(true);
      await playSound(require('../assets/sound/incorrect-choice.mp3'));
  
      setTimeout(async () => {
        const userDocRef = doc(db, 'users', userId);
  
        if (userInfo.Vidas >= 1) {
          const newVidas = userInfo.Vidas - 1;
          try {
            // Se resta una vida.
            await updateDoc(userDocRef, {
              Vidas: newVidas,
            });
            
            setUserInfo((prevUserInfo) => ({
              ...prevUserInfo,
              Vidas: newVidas,
            }));

            if(newVidas === 0) {
              const totalMonedas = resultadoRespuestas * 10;
              await updateDoc(userDocRef, {
                Monedas: userInfo.Monedas + totalMonedas,
              });
              
              const today = new Date().toDateString();
              await AsyncStorage.setItem("lastQuizDate", today);
              setShowModalNotVidas(true);
            }
  
            // Si quedan preguntas, avanzamos a la siguiente.
            if (currentQuestion < questions.length - 1) {
              setMostrarRespuestaCorrecta(false);
              setCurrentQuestion(currentQuestion + 1);
              setRespuestaSeleccionada(null);
            } else {
              // Al finalizar el quiz, actualizamos las monedas con las respuestas correctas acumuladas.
              const totalMonedas = resultadoRespuestas * 10;
              await updateDoc(userDocRef, {
                Monedas: userInfo.Monedas + totalMonedas,
              });
              const today = new Date().toDateString();
              await AsyncStorage.setItem("lastQuizDate", today);
              stopMusic(backgroundMusic);
            }
          } catch (error) {
            console.error('Error al actualizar las vidas:', error);
            Alert.alert('Error', 'No se pudieron actualizar las vidas.');
          }
        } else {
          // Si no quedan vidas.
          setShowModalNotVidas(true);
          // Calculamos las monedas ganadas usando el total de respuestas correctas acumuladas.
          const totalMonedas = resultadoRespuestas * 10;
          await updateDoc(userDocRef, {
            Monedas: userInfo.Monedas + totalMonedas,
          });
          const today = new Date().toDateString();
          await AsyncStorage.setItem("lastQuizDate", today);
          stopMusic(backgroundMusic);
        }
      }, 2000);
    }

  };

  

   
  const salir = () => {
    Alert.alert('Salir', '¿Seguro que deseas salir?', [
      {
        text: 'Cancelar',
        style: 'cancel',
      },
      {
        text: 'Terminar',
        onPress: async () => {
          try {
            if (isPlaying) {
              await stopMusic(backgroundMusic);
              // Pequeña pausa para asegurar que la música se detuvo
              await new Promise(resolve => setTimeout(resolve, 100));
            }
            showInterstitial();
          } catch (error) {
            console.error('Error al salir:', error);
            // En caso de error, asegurar que el usuario pueda salir
            setShowModal(false);
            setShowNivelModal(false);
            stopMusic(backgroundMusic);
            navigation.reset({
              index: 0,
              routes: [{ name: '(tabs)' }],
            });
          }
        },
      },
    ]);
  };

  
  // Resetear el estado cuando cambia la pregunta
  useEffect(() => {
    setMostrarRespuestaCorrecta(false);
    setRespuestaSeleccionada(null); // Asegurar doblemente el reset
  }, [currentQuestion]);

  // Manejo del sonido de fondo
  useEffect(() => {
    if (!userId) return;
    if(isPlaying){
      stopMusic(backgroundMusic);
    }
    // Iniciar música cuando el componente se monta
    startMusic(backgroundMusic);
    
    return () => {
      // Asegurar que la música se detenga cuando el componente se desmonte
      stopMusic(backgroundMusic);
    }
  }, [userId, isFocused]); 

 

// Animaciones
useEffect(() => {
  // Resetear animaciones y estados visuales
  questionOpacity.setValue(0);
  setMostrarRespuestaCorrecta(false);
  setRespuestaSeleccionada(null);

  const newAnimations = respuestas.map(() => new Animated.Value(0));
  setAnswerAnimations(newAnimations);

  Animated.timing(questionOpacity, {
    toValue: 1,
    duration: 500,
    useNativeDriver: true,
  }).start(() => {
    newAnimations.forEach((anim, index) => {
      Animated.timing(anim, {
        toValue: 1,
        duration: 500,
        delay: index * 200,
        useNativeDriver: true,
      }).start();
    });
  });
}, [currentQuestion, pregunta]); 


  // Función para cerrar el modal de recompensade vidas
  const cerrarRewardModal = async () => {
    try {
      // Si el usuario tiene 0 vidas y no ha visto el anuncio, mantener el modal abierto
      if (userInfo.Vidas === 0) {
  
        return;
      }
      // Si el usuario tiene vidas (después de ver el anuncio)
      setShowModalNotVidas(false);
    
      // Solo mostrar modal de puntuación si no quedan más preguntas
      if (currentQuestion >= questions.length - 1) {
        stopMusic(backgroundMusic);
        const today = new Date().toDateString();
        await AsyncStorage.setItem("lastQuizDate", today);
        await AsyncStorage.setItem("quizCompleted", "true");
        setShowModal(true);
      } else {
        // Continuar con la siguiente pregunta
        setCurrentQuestion(currentQuestion + 1);
        setRespuestaSeleccionada(null);
      }


    } catch (error) {
      console.log('Error al cerrar el modal de recompensa:', error);
    }finally{
    
       setShowModalNotVidas(false);
      
    }
  }
  
  const mostrarModalRacha = () => {
    setShowModal(false);
    stopMusic(backgroundMusic); 
    navigation.replace('(tabs)');
  };
  
  const cerrarPuntuacionModal = async () => {
    stopMusic(backgroundMusic);
    setShowModal(false);
    setShowModalNotVidas(false);
    
    const today = new Date().toDateString();
    await AsyncStorage.setItem("lastQuizDate", today);
    
    navigation.replace('(tabs)');
  };

// Detener la música cuando se sale del quiz
  useEffect(() => {
    
      if(!isFocused){
        stopMusic(backgroundMusic);
        setShowModalNotVidas(false);
      }
    
  }, [isFocused,navigation]);

// Verificar si el usuario tiene vidas
  useEffect(() => {
   if(!userId) return null;
   const checkVidas = async () => {
    if(userInfo.Vidas === 0){
      setShowModalNotVidas(true)
    }

   }
    checkVidas();
  }, [userInfo.Vidas])

  // Efecto para el temporizador
  useEffect(() => {
   
    if(isFocused){
    let timer;
  
    if (tiempoRestante > 0 && 
        !mostrarRespuestaCorrecta && 
        !showModal && 
        !showModalRacha && 
        !showModalRachaPerdida && 
        !showModalNotVidas && 
        !showNivelModal && 
        !isLoading) {
      timer = setInterval(() => {
        setTiempoRestante((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            // Si se acaba el tiempo, pasar a la siguiente pregunta
            if (currentQuestion < questions.length - 1) {
              setCurrentQuestion(currentQuestion + 1);
              setRespuestaSeleccionada(null);
              setTiempoRestante(30);
              setTiempoAgregado(false);
            } else {
              
              setShowModal(true);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
    }
  }, [tiempoRestante, mostrarRespuestaCorrecta, currentQuestion, questions.length, showModal, showModalRacha, showModalRachaPerdida, showModalNotVidas, showNivelModal, isLoading,isFocused]);

  // Resetear el temporizador cuando cambia la pregunta
  useEffect(() => {
    setTiempoRestante(30);
    setTiempoAgregado(false);
  }, [currentQuestion]);

  // Resetear estados cuando el componente se monta o cuando se inicia un nuevo quiz
  useEffect(() => {
    setShowModal(false);
    setShowModalRacha(false);
    setShowModalRachaPerdida(false);
    setShowNivelModal(false);
    setShowModalNotVidas(false);
    setResultadoRespuestas(0);
    setExpGanada(0);
    setCurrentQuestion(0);
    setRespuestaSeleccionada(null);
    setMostrarRespuestaCorrecta(false);
    if(isPlaying){
      stopMusic(backgroundMusic);
    }
  }, [isFocused]);

  // Cargar el anuncio intersticial
  useEffect(() => {
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
          setTimeout(loadAd, 3000);
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
        setTimeout(loadAd, 3000);
      }
    };

    const onAdClosed = () => {
      if (isMounted) {
        if (Platform.OS === 'ios') {
          StatusBar.setHidden(false);
        }
        // Recargar un nuevo anuncio para la próxima vez
        interstitial.load();
        navigation.reset({
          index: 0,
          routes: [{ name: '(tabs)' }],
        });
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

  // Función para mostrar el anuncio intersticial
  const showInterstitial = () => {
    if (interstitialLoaded) {
      interstitial.show();
    } else {
      // Si el anuncio no está cargado, navegar directamente
      navigation.reset({
        index: 0,
        routes: [{ name: '(tabs)' }],
      });
    }
  };

  if (!userId) {
    return <ActivityIndicator size="large" />
   }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ModalPuntuacion 
        userInfo={userInfo} 
        mostrarModalRacha={mostrarModalRacha} 
        expGanada={expGanada} 
        monedasGanadas={resultadoRespuestas * 10} 
        respuestasCorrectas={resultadoRespuestas} 
        isVisible={showModal} 
        onClose={mostrarModalRacha} 
        cerrar={cerrarPuntuacionModal}
        isPlaying={isPlaying}
        stopMusic={stopMusic}
        backgroundMusic={backgroundMusic}
      />
      <ModalRacha userInfo={userInfo} isVisible={showModalRacha} setShowModalRacha={setShowModalRacha} />
      <ModalRachaPerdida userInfo={userInfo} isVisible={showModalRachaPerdida} setShowModalRachaPerdida={setShowModalRachaPerdida} />
      <NivelModal 
        Exp={userInfo.Exp} 
        nivel={userInfo?.Nivel} 
        isVisible={showNivelModal} 
        onClose={() => {
          console.log('Cerrando modal de nivel');
          setShowNivelModal(false);
        }}
      />
      <RewardedAdModal isVisible={showModalNotVidas} setIsVisible={setShowModalNotVidas} setShowModal={setShowModal} onClose={cerrarRewardModal} userId={userId} vidas={userInfo.Vidas} />
<ImageBackground 
        source={require('../assets/images/bg-quiz2.png')} 
         resizeMode="cover" 
        style={styles.backgroundImage}
      >
        <View style={styles.mainContainer}>
      <ScrollView 
    contentContainerStyle={styles.scrollContainer}
    showsVerticalScrollIndicator={false}
  >
          <View style={styles.header}>
            <TouchableOpacity onPress={salir} style={{backgroundColor: 'rgba(0, 16, 61, 0.7)', borderRadius: 50, padding: 5}}>
              <MaterialCommunityIcons 
                name="home" 
                color="blue" 
                size={40} 
                
              />
            </TouchableOpacity>

            <View style={styles.statusBar}>
            <Text style={styles.heartIcon}>❤️</Text>
              <Text style={styles.statusText}>{userInfo.Vidas}</Text>
              <FontAwesome5 name="coins" size={24} color="yellow" />
              <Text style={styles.statusText}>{userInfo.Monedas}</Text>
            </View>

          </View>

          <View style={styles.contentContainer}>
            <View style={styles.muteButtonContainer}>
              <TouchableOpacity onPress={toggleMute}>
                <Octicons
                  name={isMuted ? 'mute' : 'unmute'}
                  size={30}
                  color={isMuted ? 'blue' : 'blue'}
                />
              </TouchableOpacity>
            </View>
  

            <Animated.View style={[styles.questionContainer, { opacity: questionOpacity }]}>
              <Text style={styles.referenceText}>
                {referencia}
              </Text>
              <View style={styles.timerContainer}>
                <Text style={[styles.timerText, tiempoRestante <= 5 && styles.timerTextRed]}>
                  {tiempoRestante}s
                </Text>
              </View>
              <Text style={[styles.questionText, { fontFamily: 'poppins-bold' }]}>
                                    {pregunta}
              </Text>
            </Animated.View>


            <View style={styles.answersContainer}  key={questions[currentQuestion]?.questionId}>
              {respuestas.map((respuesta, index) => {
                
                const uniqueKey = `${questions[currentQuestion]?.questionId}-${index}`;
                return (
                  <Animated.View
                  key={uniqueKey}
                  style={{ opacity: answerAnimations[index] || 0 }}
                >
                  <TouchableOpacity 
                      style={[
                        styles.answerButton,
                        respuestaSeleccionada === respuesta && styles.selectedAnswer,
                        mostrarRespuestaCorrecta && respuesta === correcta && styles.correctAnswer,
                        mostrarRespuestaCorrecta && respuesta !== correcta && styles.incorrectAnswer
                     
                    ]}
                    onPress={() => setRespuestaSeleccionada(respuesta)}
                    disabled={mostrarRespuestaCorrecta}
                  >
                    <Text style={styles.answerText}>{respuesta}</Text>
                  </TouchableOpacity>
                </Animated.View>
                )
              })}
            </View>

            <TouchableOpacity
  style={styles.checkButton}
  onPress={comprobarRespuesta}
>
  <LinearGradient
    colors={['#0066ff', '#4facfe']}
    style={styles.gradient}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 0 }}
  >
    <Text style={styles.checkButtonText}>Comprobar</Text>
    
  </LinearGradient>
</TouchableOpacity>

            <QuizActions 
              currentQuestion={currentQuestion}
              questions={questions}
              setCurrentQuestion={setCurrentQuestion}
              setRespuestaSeleccionada={setRespuestaSeleccionada}
              userInfo={userInfo}
              userId={userId}
              respuestas={respuestas}
              correcta={correcta}
              setQuestions={setQuestions}
              setShowModal={setShowModal}
              tiempoRestante={tiempoRestante}
              setTiempoRestante={setTiempoRestante}
              tiempoAgregado={tiempoAgregado}
              setTiempoAgregado={setTiempoAgregado}
              setIsLoading={setIsLoading}
              isLoading={isLoading}
            />

          </View>
</ScrollView>

        </View>
      </ImageBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1
  },
  backgroundImage: {
    flex: 1,
    opacity: 0.9,
  },
  mainContainer: {
    alignItems: 'center'
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
 
  },
  
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 16, 61, 0.7)',
    borderWidth: 1,
    borderColor: '#00f7ff33',
    borderRadius: 25,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 10
  },
  statusText: {
    marginHorizontal: 7,
    fontSize: 18,
    color: 'white',
    fontWeight: '600'
  },
  heartIcon: {
    fontSize: 24,
    color: 'red',
  },
  contentContainer: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 20,
    
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: height * 0.1,
  },
  muteButtonContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-end',
  position: 'relative',
  bottom: 5,
  
  
  },
 
  questionContainer: {
    width: responsiveWidth,
    minHeight: height * 0.25,
    maxHeight: height * 0.4,
    borderRadius: 30,
    padding: 15,
    marginBottom: 15,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 10, 41, 0.7)',
    borderColor: '#00f7ff55',
    shadowColor: '#00f7ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
  },
  referenceText: {
    color: 'white',
    position: 'absolute',
    top: 8,
    left: 8,
    padding: 8
  },
  questionText: {
    fontSize: width * 0.05,
    maxWidth: '90%',
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center'
  },
  answersContainer: {
    width: '100%',
    alignItems: 'center',
    
  },
  answerButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: responsiveWidth,
    minHeight: 60,
    marginVertical: 5,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 16, 61, 0.7)',
    borderColor: '#00f7ff33',
    shadowColor: '#00f7ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: '#00f7ff55',
  },
  answerText: {
    fontSize: width * 0.045,
    color: 'white',
    fontWeight: '600'
  },
  selectedAnswer: {
    backgroundColor: 'rgba(0, 255, 100, 0.5)',
    borderColor: '#00ff88',
    borderWidth: 3,
    borderRadius: 25,
    shadowColor: '#00ff88',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
  },
  correctAnswer: {
    backgroundColor: 'rgba(0, 255, 0, 0.5)',
    borderColor: '#00FF00'
  },
  incorrectAnswer: {
    backgroundColor: 'rgba(255, 0, 0, 0.2)',
    borderColor: '#FF0000'
  },
  answerText: {
    
    fontSize: width * 0.05,
    textAlign: 'center',
    color: 'white',
    fontWeight: 'bold'
  },
  checkButton: {
    width: '80%',
   
    marginVertical: height * 0.02,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#00f7ff',
    backgroundColor: '#0066ff',
    overflow: 'hidden',
    shadowColor: '#00f7ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
    elevation: 20,
  },
  gradient: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  checkButtonText: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
    
    textShadowColor: 'rgba(0, 247, 255, 0.8)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  actionsContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  actionButton: {
    width: responsiveWidth * 0.45,
    height: height * 0.1,
    margin: width * 0.02,
    borderRadius: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  disabledButton: {
    opacity: 0.5
  },
  actionText: {
    color: 'white',
    fontWeight: 'bold'
  },
  timerContainer: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 16, 61, 0.9)',
    borderWidth: 2,
    borderColor: '#00f7ff55',
    borderRadius: 25,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  timerText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  timerTextRed: {
    color: 'red',
  },
});

export default BibleQuiz;