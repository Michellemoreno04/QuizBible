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