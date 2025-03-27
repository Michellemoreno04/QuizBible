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
    setUserLife(null);
    return;
  }

  const dbRef = doc(db, 'users', userId);
  let unsubscribe; 

  const setupSnapshotListener = async () => {
    try {
      const lastLostLifeDate = await AsyncStorage.getItem("lastLostLifeDate");
      const today = new Date().toDateString();

      unsubscribe = onSnapshot(dbRef, async (docSnapshot) => {
        if (!docSnapshot.exists()) return;
        
        const userData = docSnapshot.data();
        setUserLife(userData.Vidas); 

        // Solo mostrar el modal y recargar vidas si:
        // 1. Es un nuevo día
        // 2. Las vidas son menos de 2
        // 3. La última fecha de pérdida de vida es diferente a hoy
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

  return () => {
    if (unsubscribe) {
      unsubscribe();
    }
  }
}, [userId]);



if(!userId){
  return <ActivityIndicator size="large" color="white" />
}
//14.7.0 sin que contenga "^14.7.0" en la versión.
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
             <AdBanner/>
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