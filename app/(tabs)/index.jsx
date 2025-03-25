import { View, StyleSheet, SafeAreaView, ScrollView, ActivityIndicator, Platform,  StatusBar as RNStatusBar, Alert, Button } from 'react-native';
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
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '@/components/firebase/firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';


export default function AppComponent() {

  const { user } = useAuth();
  const userId = user?.uid;
  const [isNotVidasModalVisible, setNotVidasModalVisible] = useState(false);
  const [userLife, setUserLife] = useState(null);
 

useEffect(() => {
  if (!userId) {
    setUserLife(null); // Limpia el estado relacionado con el usuario
    return;
  }

  const dbRef = doc(db, 'users', userId);
  let unsubscribe; 

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
             <AdBanner />
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