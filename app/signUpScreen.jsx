import React, { useEffect, useState, useRef } from "react";
import { View, Text, Pressable, ScrollView, StyleSheet, SafeAreaView, Platform } from "react-native";
import { useNavigation } from "@react-navigation/native";
import LottieView from "lottie-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar as RNStatusBar } from "react-native";
import  SignInComponents  from "../components/authContext/signInComponents";







export default function SignUpScreen() {

  const navigation = useNavigation();
  const animationRef = useRef(null);

  useEffect(() => {
    if (animationRef.current) {
      animationRef.current.play();
    }
  }, []);

  return (
    <LinearGradient 
      colors={[ '#1E3A5F', '#3C6E9F']}
      style={styles.gradient}
    >
        <SafeAreaView 
       style={[
         styles.safeArea, 
         // Añadimos padding solo para Android
         Platform.OS === 'android' && { paddingTop: RNStatusBar.currentHeight }
       ]}
     >
     
        <View style={styles.container}>
          {/* Sección de Logo y Título */}
          <View style={styles.header}>
            <Text style={styles.title}>QuizBible</Text>
            <Text style={styles.subtitle}>Bienvenido a QuizBible</Text>
          </View>

          {/* Mensaje de Bienvenida */}
          <Text style={styles.description}>
            Una app está diseñada para ayudarte a estudiar la Biblia todos los días y fortalecer tus conocimientos biblicos.
          </Text>

          {/* Animación Lottie */}
          <View style={styles.animationContainer}>
            <LottieView
              ref={animationRef}
              source={require("../assets/lottieFiles/llegaste.json")}
              autoPlay={false}
              loop={true}
              style={styles.animation}
              onAnimationFailure={(error) => console.log('Error en la animación:', error)}
            />
          </View>

          {/* Botón de Registro */}
          <Pressable
            onPress={() => navigation.navigate('signUp')}
            style={styles.signupButton}
            android_ripple={{ color: '#ffffff50' }}
          >
            <Text style={styles.buttonText}>Regístrate</Text>
          </Pressable>
          
          {/* Enlace a Login */}
          <View style={styles.loginLinkContainer}>
            <Text style={styles.loginText}>¿Ya tienes una cuenta? </Text>
            <Pressable onPress={() => navigation.navigate('login')}>
              <Text style={styles.loginLink}>Inicia sesión</Text>
            </Pressable>
          </View>
          <SignInComponents />

        </View>
    
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center'  
  },
  safeArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
 
  container: {
    flex: 1,
    paddingHorizontal: 32,
    //justifyContent: 'center',
  
  },
  header: {
    alignItems: 'center',
    marginBottom:10
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.25)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4
  },
  subtitle: {
    fontSize: 18,
    color: '#e2e8f0'
  },
  description: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '500',
    color: '#e2e8f0',
    marginBottom: 24
  },
  animationContainer: {
    alignItems: 'center',
    marginBottom: 40
  },
  animation: {
    width: 250,
    height: 250
  },
  signupButton: {
    backgroundColor: '#f59e0b',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.23,
    shadowRadius: 2.62
  },
  buttonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold'
  },
  loginLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20
  },
  loginText: {
    color: 'rgba(255, 255, 255, 0.9)'
  },
  loginLink: {
    color: '#fbbf24',
    fontWeight: '600',
    textDecorationLine: 'underline'
  }
});