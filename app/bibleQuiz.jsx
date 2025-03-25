import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ImageBackground, Animated,Platform, ActivityIndicator,Dimensions, ScrollView } from 'react-native';
import { AntDesign, FontAwesome5, MaterialCommunityIcons, Octicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { doc, updateDoc, onSnapshot, getDocs, collection, limit, query, orderBy, startAfter, serverTimestamp, increment, setDoc } from 'firebase/firestore';
import useAuth from '../components/authContext/authContext';
import { db } from '../components/firebase/firebaseConfig';
import { ModalPuntuacion } from '@/components/Modales/modalPuntuacion';
import { ModalRacha } from '@/components/Modales/modalRacha';
import { ModalRachaPerdida } from '@/components/Modales/rachaPerdida';
import { manejarRachaDiaria } from '@/components/Racha/manejaRacha';
import { useSound } from '@/components/soundFunctions/soundFunction';
import { useBackgroundMusic } from '@/components/soundFunctions/soundFunction';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NivelModal from '@/components/Modales/modalNivel';
import { niveles } from '@/components/Niveles/niveles';
import { InterstitialAd, AdEventType, TestIds } from 'react-native-google-mobile-ads';
import {RewardedAdModal} from '../components/Modales/modalNotVidas';



const adUnitId = __DEV__
 ? TestIds.INTERSTITIAL
 : Platform.OS === 'ios'
 ? process.env.EXPO_PUBLIC_INTERSTITIAL_ID_IOS
 : process.env.EXPO_PUBLIC_INTERSTITIAL_ID_ANDROID; 

// Crea la instancia del anuncio
const interstitial = InterstitialAd.createForAdRequest(adUnitId, {
  keywords: ['religion', 'bible']// esto es para anuncios personalizados
});

const { width, height } = Dimensions.get('window');

const responsiveWidth = width * 0.9; // 90% del ancho de pantalla
const responsiveHeight = height * 0.07; // 7% del alto

const BibleQuiz = () => {
  const navigation = useNavigation();
  const playSound = useSound();
  const { startMusic, stopMusic, isMuted, toggleMute } = useBackgroundMusic();
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
  const [interstitialLoaded, setInternitialLoaded] = useState(false);
  const [showModalNotVidas, setShowModalNotVidas] = useState(false);
  const { user } = useAuth();
  const userId = user?.uid;

  const retryCount = useRef(0);
const maxLoadRetries = 3;

 useEffect(() => {

const loadInterstitial = () => {
      interstitial.load();
    };

    const handleError = (error) => {
      console.log('Error cargando interstitial:', error);
      if (retryCount.current < maxLoadRetries) {
        retryCount.current += 1;
        setTimeout(loadInterstitial, 3000);
      }
    };

    const unsubscribeLoaded = interstitial.addAdEventListener(AdEventType.LOADED, () => {
      setInternitialLoaded(true);
      retryCount.current = 0;
      console.log('Interstitial cargado');
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
      stopMusic();
      setShowModal(false);
      mostrarModalRacha();
      navigation.navigate('(tabs)');
    });

    const unsubscribeError = interstitial.addAdEventListener(AdEventType.ERROR, handleError);

    loadInterstitial();

    return () => {
      unsubscribeLoaded();
      unsubscribeOpened();
      unsubscribeClosed();
      unsubscribeError();
    };
  }, []);

  const showAds = async () => {
    stopMusic();
    let showAttempts = 0;
    const maxShowAttempts = 3;

    const tryShowAd = async () => {
      while (showAttempts < maxShowAttempts) {
        try {
          if (interstitialLoaded) {
            await interstitial.show();
            return true;
          }
          
          // Esperar carga si no está listo
          await new Promise((resolve, reject) => {
            const loadedListener = interstitial.addAdEventListener(AdEventType.LOADED, () => {
              loadedListener();
              resolve();
            });
            
            const errorListener = interstitial.addAdEventListener(AdEventType.ERROR, (error) => {
              errorListener();
              reject(error);
            });
          });
          
          await interstitial.show();
          return true;
        } catch (error) {
          console.log('Error mostrando anuncio:', error);
          showAttempts++;
          if (showAttempts >= maxShowAttempts) throw error;
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } 
    };

    try {
      await tryShowAd();
    } catch (error) {
      console.log('No se pudo mostrar el anuncio después de 3 intentos');
      setShowModal(false);
      navigation.navigate('(tabs)');
    }finally {
      stopMusic();
      setShowModal(false);
      navigation.navigate('(tabs)');
    }
  };


  // Verifica el nivel del usuario para mostrar el modal de nivel  
  useEffect(() => {
    const checkNivel = async () => {
      const userRef = doc(db, 'users', userId);
      try {
        if (userInfo.Exp) {
          const nivelActual = niveles(userInfo.Exp).nivel;
          const nivelAnterior = userInfo.Nivel || 0;
  
          if (nivelActual === nivelAnterior) return; // No hacer nada si no hay cambio
  
          // Actualizar Firestore y estado local inmediatamente
          await updateDoc(userRef, { Nivel: nivelActual });
          
          // Actualiza el estado local aquí (depende de cómo manejes userInfo)
          // Ejemplo si usas un estado de React:
          setUserInfo(prev => ({ ...prev, Nivel: nivelActual }));
  
          if (nivelActual > nivelAnterior) {
            setShowNivelModal(true);
          }
        }
      } catch (error) {
        console.error('Error al verificar el nivel:', error);
      }
    };
    checkNivel();
  }, [userInfo.Exp]); // Solo depende de Exp para evitar ciclos

  // Obtén las preguntas de Firestore
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
          limit(2)
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

  // Escucha en tiempo real para obtener los datos del usuario
  useEffect(() => {
    const userDocRef = doc(db, 'users', user?.uid);

    const unsubscribe = onSnapshot(userDocRef, (doc) => {
      if (doc.exists()) {
        setUserInfo(doc.data());
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
      Alert.alert('Por favor, selecciona una respuesta.');
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
        Exp: userInfo.Exp + 15,
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
        await AsyncStorage.setItem("lastQuizDate", today);
        // Mostramos el modal final.
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
              
             
             // return;
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
              setShowModal(true);
              stopMusic();
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
          stopMusic();
        }
      }, 2000);
    }
  };
  
  

  // Función para saltar una pregunta
  const skip = async () => {
    if (userInfo.Monedas < 50) {
      Alert.alert('No tienes suficientes monedas para saltar la pregunta.');
      return;
    }

    if (currentQuestion < questions.length - 1) {
      const userDocRef = doc(db, 'users', userId);
      try {
        await updateDoc(userDocRef, {
          Monedas: userInfo.Monedas - 50,
        });
        setCurrentQuestion(currentQuestion + 1);
        setRespuestaSeleccionada(null);
      } catch (error) {
        console.error('Error al actualizar las monedas:', error);
        Alert.alert('Error', 'No se pudieron actualizar las monedas.');
      }
    } else {
      Alert.alert('Has completado el quiz.');
      const today = new Date().toDateString();
      await AsyncStorage.setItem("lastQuizDate", today);
      console.log('Fecha del último quiz guardada:', today);
      setShowModal(true);
    }
  };


  // Función para "remover dos respuestas incorrectas"
  const removeTwo = async () => {
    if (userInfo.Monedas < 50) {
      Alert.alert('No tienes suficientes monedas para remover respuestas.');
      return;
    }

    const respuestasIncorrectas = respuestas.filter(respuesta => respuesta !== correcta);
    const respuestasRestantes = respuestasIncorrectas.slice(0, 1);
    const nuevasRespuestas = [correcta, ...respuestasIncorrectas.slice(0, 1)];

    setQuestions((prevQuestions) => {
      return prevQuestions.map((pregunta) => {
        if (pregunta.questionId === questions[currentQuestion].questionId) {
          return {
            ...pregunta,
            answers: nuevasRespuestas,
          };
        }
        return pregunta;
      });
    });

    const userDocRef = doc(db, 'users', userId);
    try {
      await updateDoc(userDocRef, {
        Monedas: userInfo.Monedas - 50,
      });
    } catch (error) {
      console.error('Error al actualizar las monedas:', error);
      Alert.alert('Error', 'No se pudieron actualizar las monedas.');
    }
  };


  const mostrarModalRacha = () => {
    setShowModal(false);
    stopMusic(); 
      manejarRachaDiaria(userId, setShowModalRacha, setShowModalRachaPerdida);
      
      navigation.navigate('(tabs)');
    
  };

 
  const salir = () => {
    Alert.alert('Salir', '¿Seguro que deseas salir?', [
      {
        text: 'Cancelar',
        style: 'cancel',
      },
      {
        text: 'Terminar',
        onPress: () => {
          showAds();
        },
      },
    ]);
  };

  
  // Resetear el estado cuando cambia la pregunta
  useEffect(() => {
    setMostrarRespuestaCorrecta(false);
    setRespuestaSeleccionada(null); // Asegurar doblemente el reset
  }, [currentQuestion]);

  // sonido de fondo
  useEffect(() => {
    if(!userId) return null;
    
    const backgroundMusic = require('../assets/sound/quiz-music1.mp3');
 
     navigation.addListener('focus', () => {
      startMusic(backgroundMusic);
     })
    
     navigation.addListener('blur', () => {
      stopMusic(); // Detiene la música al salir de la pantalla
    });
  
   return () => {
     stopMusic();
   }
    
  }, []);


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
  const cerrarRewardModal = () => {

  try {
    if(userInfo.Vidas === 0){
      
      setShowModalNotVidas(false);
      stopMusic();
      setShowModal(true);
      return;
    }
  }catch (error) {
    console.log('Error al cerrar el modal de recompensa:', error);
  }
    //setShowModal(true);

  }
  const cerrarPuntuacionModal = () => {
    setShowModal(false);
    stopMusic();
    navigation.navigate('(tabs)');

  }

  if (!interstitial) {
    return null;
  } 
  if (!userId) {
    return <ActivityIndicator size="large" />
   }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ModalPuntuacion userInfo={userInfo} mostrarModalRacha={mostrarModalRacha} expGanada={expGanada} monedasGanadas={resultadoRespuestas * 10} respuestasCorrectas={resultadoRespuestas} isVisible={showModal} onClose={mostrarModalRacha} cerrar={cerrarPuntuacionModal}/>
      <ModalRacha userInfo={userInfo} isVisible={showModalRacha} setShowModalRacha={setShowModalRacha} />
      <ModalRachaPerdida userInfo={userInfo} isVisible={showModalRachaPerdida} setShowModalRachaPerdida={setShowModalRachaPerdida} />
      <NivelModal Exp={userInfo.Exp} nivel={userInfo?.Nivel} isVisible={showNivelModal} onClose={() => setShowNivelModal(false)}/>
      <RewardedAdModal isVisible={showModalNotVidas} onClose={cerrarRewardModal} userId={userId}/>
<ImageBackground 
        source={require('../assets/images/bg-quiz.png')} 
         resizeMode="cover" 
        style={styles.backgroundImage}
      >
        <View style={styles.mainContainer}>
      <ScrollView 
    contentContainerStyle={styles.scrollContainer}
    showsVerticalScrollIndicator={false}
  >
          <View style={styles.header}>
            <TouchableOpacity onPress={salir} style={styles.homeButton}>
              <MaterialCommunityIcons 
                name="home" 
                color="blue" 
                size={40} 
                style={styles.homeIcon} 
              />
            </TouchableOpacity>

            <View style={styles.statusBar}>
              <AntDesign name="heart" size={24} color="red" />
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
                  size={24}
                  color={isMuted ? 'blue' : 'blue'}
                />
              </TouchableOpacity>
            </View>
  

            <Animated.View style={[styles.questionContainer, { opacity: questionOpacity }]}>
            <Text
              style={styles.referenceText}
              
            >
              {referencia}
            </Text>
            <Text style={styles.questionText}>{pregunta}</Text>
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
              <Text style={styles.checkButtonText}>Comprobar</Text>
              <AntDesign name="rightcircleo" size={24} color="white" />
            </TouchableOpacity>

            <View style={styles.actionsContainer}>
              <TouchableOpacity
                onPress={skip}
                style={styles.actionButton}
              >
                <Text style={styles.actionText}>💰50</Text>
                <Text style={styles.actionText}>Saltar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.actionButton, respuestas.length <= 2 && styles.disabledButton]}
                onPress={removeTwo}
                disabled={respuestas.length <= 2}
              >
                <Text style={styles.actionText}>💰50</Text>
                <Text style={styles.actionText}>
                  {respuestas.length > 2 ? 'Remover 2 incorrectas' : 'No disponible'}
                </Text>
              </TouchableOpacity>
            </View>
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
  homeButton: {
    
    padding: 10,
  },
  homeIcon: {
    width: 40,
    height: 40,
    
  },
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    marginHorizontal: 10,
    fontSize: 18,
    color: 'white'
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
    borderRadius: 20,
    padding: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    marginBottom: 15,
    justifyContent: 'center',
    alignItems: 'center'
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
    alignItems: 'center'
  },
  answerButton: {
    width: responsiveWidth,
    height: responsiveHeight,
    minHeight: 60,
    borderRadius: 50,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 2,
    borderWidth: 2,
  
  
  },
  selectedAnswer: {
    borderWidth: 4,
    borderColor: '#00FF00',
    backgroundColor: 'rgba(0, 255, 0, 0.3)'
  },
  correctAnswer: {
    borderWidth: 2,
    borderColor: '#00FF00'
  },
  incorrectAnswer: {
    borderWidth: 2,
    borderColor: '#FF0000'
  },
  answerText: {
    
    fontSize: width * 0.05,
    textAlign: 'center',
    color: 'white',
    fontWeight: 'bold'
  },
  checkButton: {
    width: responsiveWidth * 0.7,
    height: responsiveHeight,
    marginVertical: height * 0.02,
    borderRadius: 50,
    backgroundColor: 'rgba(0, 0, 255, 0.8)',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    
  },
  checkButtonText: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold'
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
  }
});

export default BibleQuiz;