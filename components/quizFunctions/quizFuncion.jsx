import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Dimensions, Alert, ActivityIndicator } from 'react-native';
import { AntDesign, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { RewardedAd, TestIds, RewardedAdEventType } from 'react-native-google-mobile-ads';
import { doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';


const { width, height } = Dimensions.get('window');


// ID del anuncio recompensado
const rewardedAdUnitId = __DEV__
  ? TestIds.REWARDED
  : Platform.OS === 'ios'
  ? process.env.EXPO_PUBLIC_REWARDED_ID_IOS
  : process.env.EXPO_PUBLIC_REWARDED_ID_ANDROID;
  // Crear nueva instancia cada vez que se abre el modal
  const newRewarded = RewardedAd.createForAdRequest(rewardedAdUnitId, {
    keywords: ['religion', 'bible'],
  });

const QuizActions = ({ 
  currentQuestion, 
  questions, 
  setCurrentQuestion, 
  setRespuestaSeleccionada, 
  userInfo, 
  userId,
  respuestas,
  correcta,
  setQuestions,
  setShowModal,
  setTiempoRestante,
  tiempoAgregado,
  setTiempoAgregado,
  isLoading,
  setIsLoading
}) => {
// como firmar un apk? 
    const [rewardedLoaded, setRewardedLoaded] = useState(false);
    const [rewardedAd, setRewardedAd] = useState(null);
   
 
// aquicargamos el anuncio
useEffect(() => {    
      const unsubscribeLoaded = newRewarded.addAdEventListener(
        RewardedAdEventType.LOADED,
        () => {
          setIsLoading(false);
          setRewardedLoaded(true);
          console.log('Anuncio recompensa cargado correctamente');
        }
      );

      const unsubscribeEarned = newRewarded.addAdEventListener(
        RewardedAdEventType.EARNED_REWARD,
        (reward) => {
          console.log('Recompensa obtenida:', reward);
          addCoin();
           
        }
      );
      // Cargar el anuncio
      newRewarded.load();
      setRewardedAd(newRewarded);//guardamos el anuncio
      setIsLoading(false);
      // Limpiar al cerrar
      return () => {
        unsubscribeLoaded();
        unsubscribeEarned();
       
        setRewardedAd(null);
      };
    
  }, [currentQuestion]);

  const handleShowAd = async () => {
    setIsLoading(true);
      if (rewardedLoaded && !isLoading) {
          try {
         
            setIsLoading(false);
        await newRewarded.show();

      } catch (error) {
        console.log('Error al mostrar el anuncio:', error);
        if(error){
          setIsLoading(true);
       newRewarded.load();
        
        }
        
      } finally {
       
        setIsVisible(false);
         setIsLoading(false);
        
      }

    }
  };
  
  const addCoin = async () => {
    const userDocRef = doc(db, 'users', userId);
    await updateDoc(userDocRef, {
      Monedas: increment(50),
    });
  };

  

 

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
      
      setShowModal(true);
    }
  };

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

  const addTime = async () => {
    if (userInfo.Monedas < 50) {
      Alert.alert('No tienes suficientes monedas para agregar tiempo.');
      return;
    }

    if (!tiempoAgregado) {
      const userDocRef = doc(db, 'users', userId);
      try {
        await updateDoc(userDocRef, {
          Monedas: userInfo.Monedas - 50,
        });
        setTiempoRestante(prev => prev + 15); // Agregar 15 segundos
        setTiempoAgregado(true);
      } catch (error) {
        console.error('Error al actualizar las monedas:', error);
        Alert.alert('Error', 'No se pudieron actualizar las monedas.');
      }
    } else {
      Alert.alert('Ya has agregado tiempo extra a esta pregunta.');
    }
  };

  return (
    <View style={styles.actionsContainer}>
      <TouchableOpacity
        onPress={skip}
        style={styles.actionButton}
      >
        <MaterialCommunityIcons name="skip-next" size={24} color="white" />
        <Text style={styles.actionText}>50</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.actionButton, respuestas.length <= 2 && styles.disabledButton]}
        onPress={removeTwo}
        disabled={respuestas.length <= 2}
      >
        <FontAwesome5 name="eraser" size={20} color="white" />
        <Text style={styles.actionText}>50</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.actionButton, tiempoAgregado && styles.disabledButton]}
        onPress={addTime}
        disabled={tiempoAgregado}
      >
        <MaterialCommunityIcons name="timer" size={24} color="white" />
        <Text style={styles.actionText}>15</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.actionButton}
        onPress={handleShowAd}
      >
        <AntDesign name="videocamera" size={24} color="white" />
        <Text style={styles.actionText}>{isLoading
        ? <ActivityIndicator size="small" color="white" />
        : rewardedAd ? '+50' : ''
        }
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  actionsContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 10,
  },
  actionButton: {
    width: width * 0.18,
    height: height * 0.08,
    borderRadius: 50,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 5,
  },
  disabledButton: {
    opacity: 0.5
  },
  actionText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  }
});

export default QuizActions;
