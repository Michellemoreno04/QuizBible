import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Animated, StatusBar, Platform, ScrollView } from 'react-native';
import LottieView from 'lottie-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';


const { width, height } = Dimensions.get('window');



const WelcomeScreen = () => {
  const navigation = useNavigation();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const featureSlide = useRef(new Animated.Value(0)).current;
  const [currentFeatureIndex, setCurrentFeatureIndex] = useState(0);
  const { width } = Dimensions.get('window');

  const features = [
    { icon: '📖', title: 'Versiculos Diarios', desc: 'Para que compartas con tus amistades y vayas profundizando con las palabras de Dios. ' },
    { icon: '❓', title: 'Preguntas Sobre La Biblia', desc: 'Asi vas reforzando tus conocimientos con preguntas y respuestas de la Biblia. ' },
    { icon: '📖', title: 'Lecturas Diarias', desc: 'Tambien vas a leer sobre temas importantes como el Amor, la Fe y muchos temas de grande importancia. ' },
    { icon: '✝️', title: 'Control de Estudios Diarios', desc: 'Diariamente que estudies estaras aumentado una racha que te mantendra motivado estudiando y aprendiendo todos los dias. ' },
  ];

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const handleNavigation = (direction) => {
    if (direction === 'next' && currentFeatureIndex === features.length - 1) {
      navigation.navigate('(tabs)');
      return;
    }

    const newIndex = direction === 'next' ? currentFeatureIndex + 1 : currentFeatureIndex - 1;
    if (newIndex < 0 || newIndex >= features.length) return;

    const slideValue = direction === 'next' ? -width : width;
    
    Animated.parallel([
      Animated.timing(featureSlide, {
        toValue: slideValue,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start(() => {
      setCurrentFeatureIndex(newIndex);
      featureSlide.setValue(direction === 'next' ? width : -width);
      Animated.timing(featureSlide, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    });
  };

  const handlePressIn = () => {
    Animated.spring(buttonScale, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(buttonScale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const isLastFeature = currentFeatureIndex === features.length - 1;
  const isFirstFeature = currentFeatureIndex === 0;

  return (
    <LinearGradient
      colors={['#f0f7ff', '#d6ebff']}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      <Animated.View style={[styles.headerContainer, { opacity: fadeAnim }]}>
        <LottieView
          source={require('../assets/lottieFiles/greeting.json')}
          autoPlay
          loop
          style={styles.animation}
        />
        
        <Text style={styles.title}>Sumérgete en las Escrituras</Text>
        <Text style={styles.subtitle}>
          Tu camino hacia una comprensión más profunda de la Palabra de Dios
        </Text>
      </Animated.View>

      <View style={styles.carouselContainer}>
        <Animated.View 
          style={[
            styles.featureCard, 
            { transform: [{ translateX: featureSlide }] }
          ]}
        >
          <LinearGradient
            colors={['#FFFFFF', '#F8FBFF']}
            style={styles.gradientCard}
          >
            <View style={styles.featureContent}>
              <LinearGradient
                colors={['#6AA3FF', '#4B8AE6']}
                style={styles.iconContainer}
              >
                <Text style={styles.featureIcon}>{features[currentFeatureIndex].icon}</Text>
              </LinearGradient>
              <Text style={styles.featureTitle}>{features[currentFeatureIndex].title}</Text>
              <Text style={styles.featureDesc}>{features[currentFeatureIndex].desc}</Text>
            </View>
            
            <View style={styles.indicatorContainer}>
              {features.map((_, index) => (
                <View 
                  key={index} 
                  style={[
                    styles.indicator, 
                    index === currentFeatureIndex && styles.activeIndicator
                  ]} 
                />
              ))}
            </View>
          </LinearGradient>
        </Animated.View>
        
        <View style={styles.buttonsContainer}>
          {!isLastFeature ? (
            <View style={styles.navigationButtons}>
              {!isFirstFeature && (
                <TouchableOpacity 
                  style={{alignContent:'center', alignItems:'center', justifyContent:'center'}}
                  onPress={() => handleNavigation('previous')}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.navButtonText, { color: '#5D9DE6' }]}>Anterior</Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity 
                style={[styles.navButton, styles.nextButton]}
                onPress={() => handleNavigation('next')}
                activeOpacity={0.7}
              >
                <Text style={[styles.navButtonText, { color: 'white' }]}>Siguiente</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <Animated.View 
              style={{ 
                transform: [{ scale: buttonScale }],
                width: '100%'
              }}
            >
              <TouchableOpacity 
                onPress={() => navigation.navigate('(tabs)')}
                activeOpacity={0.9}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
              >
                <LinearGradient
                  colors={['#5D9DE6', '#3B71C3']}
                  style={styles.mainButton}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.buttonText}>Empezar Ahora</Text>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          )}
        </View>
      </View>

      <Text style={styles.footerText}>Únete a miles de creyentes en esta jornada espiritual</Text>

      </ScrollView>
    </LinearGradient>
  );
};



const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingTop: StatusBar.currentHeight || 40,
    paddingBottom: 30,
  },
  headerContainer: {
    alignItems: 'center',
    paddingHorizontal: 25,
  },
  animation: {
    width: width * 0.8,
    height: height * 0.3,
    alignSelf: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1A3E5A',
    textAlign: 'center',
    fontFamily: 'Poppins-Bold',
    lineHeight: 35,
    marginBottom: 5,
    textShadowColor: 'rgba(26, 62, 90, 0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  subtitle: {
    fontSize: 17,
    color: '#5A7C95',
    textAlign: 'center',
    marginBottom: 5,
    fontFamily: 'Poppins-Medium',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  carouselContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 25,
  },
  featureCard: {
    width: '100%',
    borderRadius: 20,
    shadowColor: '#3B71C3',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 8,
  },
  gradientCard: {
    borderRadius: 25,
    padding: 15,
   // minHeight: height * 0.3,
   // justifyContent: 'space-between',
  },
  featureContent: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    elevation: 3,
  },
  featureIcon: {
    fontSize: 40,
    color: 'white',
  },
  featureTitle: {
    fontSize: 24,
    color: '#1A3E5A',
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 5,
    textAlign: 'center',
  },
  featureDesc: {
    fontSize: 16,
    color: '#6A889C',
    fontFamily: 'Poppins-Regular',
    lineHeight: 24,
    textAlign: 'center',
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  indicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#D9E8F5',
    marginHorizontal: 5,
  },
  activeIndicator: {
    backgroundColor: '#5D9DE6',
    width: 20,
  },
  buttonsContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  navButton: {
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 30,
    shadowColor: '#3B71C3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  prevButton: {
    
  },
  nextButton: {
    backgroundColor: '#5D9DE6',
  },
  navButtonText: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
  },
  mainButton: {
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1A5F97',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    letterSpacing: 0.8,
  },
  footerText: {
    fontSize: 13,
    color: '#8FA8B7',
    textAlign: 'center',
    marginTop: 20,
    fontFamily: 'Poppins-Italic',
    paddingHorizontal: 25,
  },
});

export default WelcomeScreen;