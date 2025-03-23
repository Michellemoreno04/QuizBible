import { View, StyleSheet, SafeAreaView, ScrollView, ActivityIndicator, Platform,  StatusBar as RNStatusBar, Alert, Button } from 'react-native';
import React, { useEffect, useState } from 'react';
import {VersiculosDiarios} from '@/components/VersiculoDiario/versiculoDiario';
import { LinearGradient } from 'expo-linear-gradient';
import {HeaderHome} from '@/components/headerHome/headerHome';
import ExploraComponent from '@/components/exploraComponents/exploraComponent';
import GuardadosComponents from '@/components/exploraComponents/guardadosComponents';
import { StatusBar } from 'expo-status-bar';
import  useAuth  from '@/components/authContext/authContext';
//import {AdBanner} from '@/components/ads/banner';
import {NotVidasModal} from '@/components/Modales/notVidasModal';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '@/components/firebase/firebaseConfig';

import AsyncStorage from '@react-native-async-storage/async-storage';
//import * as Notification from 'expo-notifications';
//import { useNotification } from '@/components/notificationContext/notificationContext';

export default function AppComponent() {
  
 // const { notification, expoPushToken, error } = useNotification();
  const { user } = useAuth();
  const userId = user?.uid;
  const [isNotVidasModalVisible, setNotVidasModalVisible] = useState(false);
  const [userLife, setUserLife] = useState(null);
 
/*
  Notification.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true, // determina si se muestra una alerta al usuario
      shouldPlaySound: true, // determina si se reproduce un sonido
      shouldSetBadge: false, // determina si se actualiza el badge del icono de la app
      
    }),
  });

  useEffect(() => {
    registerApp();
  }, []);

  async function registerApp(){
try {

    const { status: newStatus  } = await Notification.requestPermissionsAsync();

    if (newStatus !== 'granted') {
      Alert.alert('Permiso requerido', 'Se necesita acceso a la notificaciones para recibir notificaciones de la app.');
    // Manejar estado de permisos denegados ....
    
      return;
    }

    const token = (await Notification.getExpoPushTokenAsync({
      projectId: 'e83e168f-b5c9-4951-a256-5cca2f43fe9f', // app id
    })).data;

    console.log('token es ',token);

  } catch (error) {
    console.log(error);
  }
  }

  async function sendPushNotification( ) {
    await Notification.scheduleNotificationAsync({
      content: {
        title: 'Notificacion de prueba',
        body: 'NotificacionN ',
         data: { type: 'weekly_progress' }, // la data es para poder identificar la notificacion
      },
      trigger: { seconds: 5 },
    })
  }
*/
useEffect(() => {
  if (!userId) {
    setUserLife(null); // Limpia el estado relacionado con el usuario
    return;
  }

  const dbRef = doc(db, 'users', userId);
  let unsubscribe; // Variable para almacenar la función de desuscripción

  const setupSnapshotListener = async () => {
    try {
      
      const lastLostLifeDate = await AsyncStorage.getItem("lastLostLifeDate");
      const today = new Date().toDateString();

      // Configurar listener en tiempo real
      unsubscribe = onSnapshot(dbRef, async (docSnapshot) => {
        if (!docSnapshot.exists()) return;
        
        const userData = docSnapshot.data();
        setUserLife(userData.Vidas); 

        // Verificar si es un nuevo día y las vidas son menores a 2
        if (userData.Vidas < 2 && lastLostLifeDate !== today) {
          await updateDoc(dbRef, { Vidas: 2 }); 
          await AsyncStorage.setItem("lastLostLifeDate", today); 
          setNotVidasModalVisible(true); 
        }
      });
    } catch (error) {
      console.error('Error:', error);
    }
  };
  setupSnapshotListener();

  // Limpieza: desuscribirse del listener al desmontar o cambiar userId
  return () => {
    if (unsubscribe) {
      unsubscribe(); // Asegúrate de cancelar la suscripción al desmontar
    }
  }
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
            <NotVidasModal visible={isNotVidasModalVisible} setVisible={setNotVidasModalVisible} />

           <HeaderHome />
  
            <VersiculosDiarios />
           
            <ExploraComponent />
            <GuardadosComponents />
             {/*<AdBanner />*/}
          </View>
        </ScrollView>
      </SafeAreaView>
      <StatusBar style="light" />
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