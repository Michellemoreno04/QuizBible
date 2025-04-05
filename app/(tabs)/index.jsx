import { View, StyleSheet, SafeAreaView, ScrollView, ActivityIndicator, Platform,  StatusBar as RNStatusBar} from 'react-native';
import React, { useEffect, useState } from 'react';
import {VersiculosDiarios} from '@/components/VersiculoDiario/versiculoDiario';
import { LinearGradient } from 'expo-linear-gradient';
import {HeaderHome} from '@/components/headerHome/headerHome';
import ExploraComponent from '@/components/exploraComponents/exploraComponent';
import GuardadosComponents from '@/components/exploraComponents/guardadosComponents';
import { StatusBar } from 'expo-status-bar';
import  useAuth  from '@/components/authContext/authContext';
import {AdBanner} from '@/components/ads/banner';
import {NotVidasModal} from '@/components/Modales/recargarVidas';
import { MobileAds } from 'react-native-google-mobile-ads';
import { ModalRacha } from '@/components/Modales/modalRacha';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '@/components/firebase/firebaseConfig';
import { manejarRachaDiaria } from '@/components/Racha/manejaRacha';
import { ModalRachaPerdida } from '@/components/Modales/rachaPerdida';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getStorage, storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';

export default function AppComponent() {

  const { user } = useAuth();
  const userId = user?.uid;
  const [isNotVidasModalVisible, setNotVidasModalVisible] = useState(false);
  const [isModalRachaVisible, setModalRachaVisible] = useState(false);
  const [isModalRachaPerdidaVisible, setModalRachaPerdidaVisible] = useState(false);
  const [userInfo, setUserInfo] = useState({});
  
// carga de anuncios
useEffect(() => {
  MobileAds()
    .initialize()
   
}, []);

// obtener los datos del usuario y manejar la racha diaria
useEffect(() => { // pending to check
  if (!userId) return;

  manejarRachaDiaria(userId,setModalRachaVisible,setModalRachaPerdidaVisible)
  const userRef = doc(db, 'users', userId);
  const unsubscribe = onSnapshot(userRef, (snapshot) => {
    const userData = snapshot.data() || {};
    
    if (userData) {
      setUserInfo(userData);
     
    }
  });

  return () => unsubscribe();
}, [userId]); 

// aqui vamos a mostrar el modal de not vidas si es un nievo dia y el usuario tiene menos de 2 vidas
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
          await updateDoc(userRef, { Vidas: 2 });
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

  if(!userId){
    return <ActivityIndicator size="large" color="white" />
  }

  return (
    <LinearGradient
      colors={[ '#1E3A5F', '#3C6E9F']}
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
  
            <VersiculosDiarios />
           
            <ExploraComponent />
            <GuardadosComponents />
             <AdBanner/>
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
  
});