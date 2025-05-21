import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, StatusBar, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import LottieView from 'lottie-react-native';
import { FontAwesome5, Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';



const { width, height } = Dimensions.get('window');

export default function PremiumWelcomeScreen() {
  const navigation = useNavigation();

  return (
    <ScrollView 
      style={styles.scrollView} 
      contentContainerStyle={styles.scrollViewContent}
    > 
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#0F0F2D', '#1A1A4A']}
        style={styles.gradient}
      >
        {/* Efecto de partículas de fondo */}
        <View style={styles.particlesContainer}>
          {[...Array(20)].map((_, i) => (
            <View 
              key={i}
              style={[
                styles.particle,
                {
                  left: Math.random() * width,
                  top: Math.random() * height,
                  backgroundColor: `hsl(${Math.random() * 360}, 70%, 50%)`,
                  opacity: Math.random() * 0.3 + 0.1
                }
              ]}
            />
          ))}
        </View>
  
        <View style={styles.contentContainer}>
          {/* Animación en contenedor holográfico */}
          <View style={styles.holographicContainer}>
            <LottieView
              source={require('../assets/lottieFiles/boyJumping.json')}
              autoPlay
              loop
              style={styles.lottieAnimation}
            />
            <LinearGradient
              colors={['transparent', 'rgba(100, 255, 255, 0.1)']}
              style={styles.holographicOverlay}
            />
          </View>
  
          {/* Título con efecto neón */}
          <Text style={styles.title}>¡Bienvenido a Premium!</Text>
          <Text style={styles.subtitle}>
            Desbloqueaste el máximo nivel de experiencia en QuizBible
          </Text>
  
          {/* Lista de Beneficios tipo HUD futurista */}
          <View style={styles.benefitsContainer}>
            <View style={[styles.benefitItem, styles.benefitGlow]}>
              <LinearGradient
                colors={['#00FFFF', '#4D4DFF']}
                style={styles.benefitIcon}
              >
                <Text style={{color:'white', fontSize:20}}>🔇</Text>
              </LinearGradient>
              <Text style={styles.benefitText}>Espacio sin anuncios</Text>
             <Text style={{color:'white', fontSize:20}}>✅</Text>
            </View>
  
            <View style={[styles.benefitItem, styles.benefitGlow]}>
              <LinearGradient
                colors={['#FFD700', '#FFAA00']}
                style={styles.benefitIcon}
              >
                <FontAwesome5 name="coins" size={20} color="white" />
              </LinearGradient>
              <Text style={styles.benefitText}>+1,000 Monedas</Text>
              <Text style={{color:'white', fontSize:20}}>✅</Text>          
                </View>
            <View style={[styles.benefitItem, styles.benefitGlow]}>
              <LinearGradient
                colors={['#FF00FF', '#FF0066']}
                style={styles.benefitIcon}
              >
               <Text style={{color:'white', fontSize:20}}>❤️</Text>
              </LinearGradient>
              <Text style={styles.benefitText}>Vidas ilimitadas</Text>
              <Text style={{color:'white', fontSize:20}}>✅</Text>
            </View>

            <View style={[styles.benefitItem, styles.benefitGlow]}>
              <LinearGradient
                colors={['#FG00FF', '#FF0159']}
                style={styles.benefitIcon}
              >
               <Text style={{color:'white', fontSize:20}}>💬</Text>
              </LinearGradient>
              <Text style={styles.benefitText}>Soporte prioritario</Text>
              <Text style={{color:'white', fontSize:20}}>✅</Text>
            </View>
  
          </View>
  
          {/* Botón con efecto de energía */}
          <TouchableOpacity 
            style={styles.button}
            onPress={() => navigation.navigate('(tabs)')}
          >
            <LinearGradient
              colors={['#00FFFF', '#4D4DFF']}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>INICIAR EXPERIENCIA</Text>
              <MaterialCommunityIcons 
                name="chevron-triple-right" 
                size={24} 
                color="white" 
                style={styles.buttonIcon}
              />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
    </ScrollView>
  );
}
  const styles = StyleSheet.create({
    scrollView: {
      flex: 1,
      backgroundColor: '#000',
    },
    scrollViewContent: {
      flexGrow: 1, // Asegura que el contenido ocupe todo el espacio disponible
    },
    container: {
      flex: 1,
      backgroundColor: '#000',
      minHeight: height,
    },
    gradient: {
      flex: 1,
      width: '100%',
    },
    particlesContainer: {
      ...StyleSheet.absoluteFillObject,
    },
    particle: {
      position: 'absolute',
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    contentContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    },
    holographicContainer: {
      width: width * 0.6,
      height: width * 0.6,
      borderRadius: width * 0.3,
      overflow: 'hidden',
      borderWidth: 2,
      borderColor: 'rgba(100, 255, 255, 0.3)',
      marginVertical: 20,
    
    },
    lottieAnimation: {
      width: '100%',
      height: '100%',
    },
    holographicOverlay: {
      ...StyleSheet.absoluteFillObject,
    },
    title: {
      fontSize: 32,
      fontWeight: '800',
      color: '#FFFFFF',
      textAlign: 'center',
      marginBottom: 16,
      textTransform: 'uppercase',
      letterSpacing: 2,
      textShadowColor: 'rgba(100, 255, 255, 0.5)',
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 20,
    },
    subtitle: {
      fontSize: 16,
      color: 'rgba(255, 255, 255, 0.8)',
      textAlign: 'center',
      marginBottom: 20,
      lineHeight: 24,
      fontFamily: 'System',
      fontWeight: '300',
      maxWidth: '80%',
    },
    benefitsContainer: {
      width: '100%',
      marginBottom: 20,
    },
    benefitItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 15,
      padding: 15,
      borderRadius: 10,
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    benefitGlow: {
      shadowColor: '#00FFFF',
      shadowOffset: { width: 0, height: 0 },
      shadowRadius: 10,
      shadowOpacity: 0.2,
    },
    benefitIcon: {
      width: 40,
      height: 40,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 15,
    },
    benefitText: {
      fontSize: 16,
      color: '#FFFFFF',
      fontWeight: '500',
      flex: 1,
      letterSpacing: 0.5,
    },
    benefitLine: {
      width: 30,
      height: 2,
      backgroundColor: '#00FFFF',
      marginLeft: 10,
    },
    button: {
      borderRadius: 25,
      overflow: 'hidden',
      width: '80%',
     
    },
    buttonGradient: {
      paddingVertical: 18,
      paddingHorizontal: 30,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    buttonText: {
      fontSize: 16,
      fontWeight: '800',
      color: '#FFFFFF',
      letterSpacing: 1,
      textTransform: 'uppercase',
    },
    buttonIcon: {
      marginLeft: 10,
      transform: [{ translateY: -1 }],
    },
  });