import { View, StyleSheet, SafeAreaView, ScrollView, ActivityIndicator, Platform,  StatusBar as RNStatusBar, Alert, TouchableOpacity, Text} from 'react-native';
import React, { useEffect, useState } from 'react';
import {VersiculosDiarios} from '@/components/VersiculoDiario/versiculoDiario';
import { LinearGradient } from 'expo-linear-gradient';
import {HeaderHome} from '@/components/headerHome/headerHome';
import ExploraComponent from '@/components/exploraComponents/exploraComponent';
import GuardadosComponents from '@/components/exploraComponents/guardadosComponents';
import { StatusBar } from 'expo-status-bar';
import  useAuth  from '@/components/authContext/authContext';
import {NotVidasModal} from '@/components/Modales/recargarVidas';
import { ModalRacha } from '@/components/Modales/modalRacha';
import { doc, onSnapshot, updateDoc,getDoc, increment } from 'firebase/firestore';
import { db } from '@/components/firebase/firebaseConfig';
import { manejarRachaDiaria } from '@/components/Racha/manejaRacha';
import { ModalRachaPerdida } from '@/components/Modales/rachaPerdida';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BannerAd, TestIds } from 'react-native-google-mobile-ads';
import { Colors } from '@/constants/Colors';
import { useToast } from 'react-native-toast-notifications';
import Notificaciones from '@/components/notificaciones/notificaciones';
import { useNavigation } from '@react-navigation/native';
import NetInfo from '@react-native-community/netinfo';


const bannerAdUnitId = __DEV__ 
  ? TestIds.BANNER 
  : Platform.OS === 'ios' 
  ? process.env.EXPO_PUBLIC_BANNER_ID_IOS 
  : process.env.EXPO_PUBLIC_BANNER_ID_ANDROID;


export default function AppComponent() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const userId = user?.uid;
  const [isNotVidasModalVisible, setNotVidasModalVisible] = useState(false);
  const [isModalRachaVisible, setModalRachaVisible] = useState(false);
  const [isModalRachaPerdidaVisible, setModalRachaPerdidaVisible] = useState(false);
  const [userInfo, setUserInfo] = useState({});
  const toast = useToast();

  // Monitorear el estado de la conexión de internet
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      if (!state.isConnected) {
        toast.show("No tienes conexión a internet", {
          type: "warning",
          placement: "top",
          duration: 3000,
          offset: 50,
          animationType: "slide-in"
        });
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // obtener los datos del usuario
  useEffect(() => {
    if (!userId) return;

    const userRef = doc(db, 'users', userId);
    const unsubscribe = onSnapshot(userRef, (snapshot) => {
      const userData = snapshot.data() || {};
      
      if (userData) {
        setUserInfo(userData);
      }
   
    });

    return () => unsubscribe();
  }, [userId]);

  // aqui vamos a mostrar el modal de not vidas si es un nuevo dia y el usuario tiene menos de 2 vidas
  useEffect(() => {
    if (!userId ) return;

    const checkAndUpdateVidas = async () => {
      try {

        const hoy = new Date();
        const hoyString = hoy.toISOString().split('T')[0];
        const fechaGuardada = await AsyncStorage.getItem('hoy');

        // Paso 1: Verificar si es un nuevo día
        if (fechaGuardada !== hoyString) {
          const userRef = doc(db, 'users', userId);
          const userDoc = await getDoc(userRef);
          const currentVidas = userDoc.data()?.Vidas || 0;

          // Paso 2: Actualizar solo si tiene menos de 2 vidas
          if (currentVidas < 2) {
            await updateDoc(userRef, {
               Vidas: 2,
              Monedas: increment(200),
              });
            setNotVidasModalVisible(true); // Mostrar modal solo si se actualizó
          }

          // Paso 3: Guardar la nueva fecha
          await AsyncStorage.setItem('hoy', hoyString);
        }
      } catch (error) {
        console.error("Error en checkAndUpdateVidas:", error);
      }
    };

    // Ejecutar al montar el componente
    checkAndUpdateVidas();

  }, [userId]);



  // aqui vamos a verificar si el usuario ha completado el quiz
  useEffect(() => {
    if (!userId) return;

    const checkQuizCompletion = async () => {
      try {
        const quizCompleted = await AsyncStorage.getItem("quizCompleted");
        
        if (quizCompleted === "true") {
          // Ejecutar manejarRachaDiaria
          await manejarRachaDiaria(userId, setModalRachaVisible, setModalRachaPerdidaVisible);
          // Limpiar el estado de quiz completado
          await AsyncStorage.removeItem("quizCompleted");
        }
      } catch (error) {
        console.error("Error verificando la finalización del quiz:", error);
      }
    };

    checkQuizCompletion();
  }, [userId]);

  if(!userId){
    return <ActivityIndicator size="large" color="white" />
  }

  return (
    <LinearGradient
      colors={Colors.bgApp}
      style={styles.container}
    >
    
       <SafeAreaView 
       style={[ styles.safeArea, 
      // Añadimos padding solo para Android
       Platform.OS === 'android' && { paddingTop: RNStatusBar.currentHeight }]}>
        <ScrollView> 
          <View style={styles.screen}>
           <NotVidasModal visible={isNotVidasModalVisible} setNotVidasModalVisible={setNotVidasModalVisible} />
           <ModalRacha userInfo={userInfo} isVisible={isModalRachaVisible} setModalRachaVisible={setModalRachaVisible}  />
           <ModalRachaPerdida userInfo={userInfo} isVisible={isModalRachaPerdidaVisible} setModalRachaPerdidaVisible={setModalRachaPerdidaVisible}  />
           <HeaderHome />
           <Notificaciones />
            <VersiculosDiarios />
           
           
            <ExploraComponent />
            <GuardadosComponents />
            <View style={styles.bannerContainer}>
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
          </View>
        </ScrollView>
      </SafeAreaView>
      <StatusBar style="light"  />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  screen: {
    height: '100%',
    padding: 10,
  },
  bannerContainer: {
    alignItems: 'center',
  }
});