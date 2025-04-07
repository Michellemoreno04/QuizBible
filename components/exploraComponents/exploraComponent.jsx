import React, { useState, useRef, useEffect } from 'react';
import { ScrollView, TouchableOpacity, View, Text, StyleSheet, Modal,Pressable, Alert, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import  useAuth  from '../authContext/authContext';
import { db } from '../../components/firebase/firebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import {NoCoinsModal} from '../Modales/notCoints';
import { BannerAd, TestIds } from 'react-native-google-mobile-ads';

const bannerAdUnitId = __DEV__ 
  ? TestIds.BANNER 
  : Platform.OS === 'ios' 
  ? process.env.EXPO_PUBLIC_BANNER_ID_IOS 
  : process.env.EXPO_PUBLIC_BANNER_ID_ANDROID;

const ExploraComponent = () => {
  const { user } = useAuth();
  const userId = user?.uid;
  const navigation = useNavigation();
  const [hasDoneQuizToday, setHasDoneQuizToday] = useState(false);
  const [hasReadTheDailyVerse, setHasReadTheDailyVerse] = useState(false);
  const [showFullScreen, setShowFullScreen] = useState(false);
  const [showNoCoinsModal, setShowNoCoinsModal] = useState(false);
  const animationRef = useRef(null);

  // Verificar si el usuario ha hecho el quiz hoy
  useEffect(() => {
    const checkQuizStatus = async () => {
      try {
        const lastQuizDate = await AsyncStorage.getItem("lastQuizDate");
        const today = new Date().toDateString(); // Obtener la fecha actual en formato legible
        //console.log('la ultima vez que el usuario hizo el quiz',lastQuizDate);
        // console.log('hoy es',today);
        
        if (lastQuizDate === today) {
          setHasDoneQuizToday(true); // El usuario ya hizo el quiz hoy
          //console.log("El usuario ya hizo el quiz hoy");
        } else {
          setHasDoneQuizToday(false); // El usuario no ha hecho el quiz hoy
          // console.log("El usuario no ha hecho el quiz hoy");
        }
      } catch (error) {
        console.log("Error al obtener el estado del quiz:", error);
      }
    };

    checkQuizStatus();
  }, []);

  // verificar el estado de la lectura diaria
  useEffect(() => {
    const checkReadingStatus = async () => {
      const lastReadingDate = await AsyncStorage.getItem("lastReadingDate");
      const today = new Date().toISOString().split('T')[0]; // Formato YYYY-MM-DD

      setHasReadTheDailyVerse(lastReadingDate === today);
    };

    checkReadingStatus();

    // Agregar un listener para cambios en AsyncStorage
    const interval = setInterval(checkReadingStatus, 5000); // Verificar cada 5 segundos

    return () => clearInterval(interval);
  }, []);

  const menuItems = [
    { 
      name: 'Quiz',
      icon: 'quiz',
      family: MaterialIcons,
      screen: 'bibleQuiz'
    },
    { 
      name: 'Lectura',
      icon: 'book-open-variant',
      family: MaterialCommunityIcons,
      screen: 'dailyReading'
    },
  ];

  const handlePress = (screenName) => {
    navigation.navigate(screenName);
  };

  
  const handleAnimationPress = async () => {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    const monedas = userDoc.data()?.Monedas || 0;
    
    if (monedas < 100) {
      // si el usuario no tiene suficientes monedas
      setShowNoCoinsModal(true);
      return; 
    }
    
    await updateDoc(userRef, { Monedas: monedas - 100 });
    
    setShowFullScreen(true);
  };
  
  const handleAnimationFinish = async () => {
    animationRef.current?.play(0, 250); 
    setShowFullScreen(false);
    navigation.navigate("bibleQuiz");
  };

  return (
    <View >
      <NoCoinsModal visible={showNoCoinsModal} onClose={() => setShowNoCoinsModal(false)} />
      <View>
        <Text style={styles.title}>Explora</Text>
      </View>
      <ScrollView 
        horizontal
        showsHorizontalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContainer}
      >
        {menuItems.map((item, index) => {
          const IconComponent = item.family;
          return (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={() => {
                if (item.name === 'Quiz') {
                  handleAnimationPress();
                } else {
                  handlePress(item.screen);
                }
              }}
              activeOpacity={0.7}
            >
              <View style={styles.iconContainer}>
                <IconComponent
                  name={item.icon}
                  size={32}
                  color="skyblue"
                />
              </View>
              <Text style={styles.text}>{item.name}</Text>
              {item.name === 'Quiz' && !hasDoneQuizToday && ( // Solo se mostrará en el Quiz
                <View style={styles.notificationIcon}>
                  <LottieView 
                    source={require("../../assets/lottieFiles/notification-quiz.json")}
                    renderMode="cover" 
                    autoPlay 
                    loop
                    style={styles.notificationLottie}
                  />
                </View>
              )}

              {item.name === 'Lectura' && !hasReadTheDailyVerse && ( // Solo se mostrará en la Lectura
                <View style={styles.notificationIcon}>
                  <LottieView 
                    source={require("../../assets/lottieFiles/notification-quiz.json")}
                    renderMode="cover" 
                    autoPlay 
                    loop
                    style={styles.notificationLottie}
                  />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      <Modal visible={showFullScreen} transparent={true}>
        <View style={styles.modalContainer}>
          <LottieView
            ref={animationRef}
            source={require("../../assets/lottieFiles/estudiando.json")}
            autoPlay
            loop={false}
            style={styles.modalLottie}
            resizeMode="contain"
            onAnimationFinish={handleAnimationFinish}
          />
    
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Text style={styles.modalText}>-100</Text>
            <FontAwesome5 name="coins" size={24} color="yellow" />
          </View>
          <BannerAd
            unitId={bannerAdUnitId}
            size="BANNER"
            requestOptions={{
              keywords: ['religion', 'bible'],
            }}
            onAdLoaded={() => console.log('Banner cargado')}
            onAdFailedToLoad={(error) => console.log('Error cargando banner:', error)}
          />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    paddingVertical: 15,
    paddingHorizontal: 5,
  },

  title: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
   
    
  },
  menuItem: {
    alignItems: 'center',
    
    marginRight: 30,
    
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'skyblue',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    
  },
  text: {
    fontSize: 14,
    color: 'white',
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 18,
  },
  notificationIcon: {
    width: 30,
    height: 30,
    borderRadius: 15, // 👈 Usa la mitad del tamaño (30/2)
    overflow: 'hidden',
    position: 'absolute',
    top: -12,
    right: -15,
  },
  notificationLottie: {
    width: '100%',   // 👈 Ocupa todo el espacio del contenedor
    height: '100%',
  },
  modalContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: '#3C6E9F',
  },
  modalText: {
    fontSize: 26,
    fontWeight: "bold",
    color: "orange",
  },
  modalLottie: {
    width: 300,
    height: 300,
  },
});

export default ExploraComponent;