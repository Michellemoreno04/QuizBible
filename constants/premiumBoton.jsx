import React, { useRef } from 'react';
import { TouchableOpacity, Text, StyleSheet} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import LottieView from 'lottie-react-native';

export function PremiumButton({ containerStyle, textStyle, lottieStyle }) {
  const navigation = useNavigation();
  const animationRef = useRef(null);

  const goToPaymentScreen = () => {
    navigation.navigate('paywallScreen');
  };

  return (
    <TouchableOpacity style={styles.shadowContainer} onPress={goToPaymentScreen} activeOpacity={0.85}>
      <LinearGradient
        colors={['#ffd700', '#ff9a00']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.button, containerStyle]}
      >
        <LottieView
          ref={animationRef}
          source={require('../assets/lottieFiles/award.json')}
          autoPlay
          loop={false}
          speed={1}
          style={[styles.lottie, lottieStyle]}
          onAnimationFinish={() => {
            // Volver al primer frame y mantenerlo
            animationRef.current?.play(50, 50);
          }}
        />
        <Text style={[styles.text, textStyle]}>GO PREMIUM</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  shadowContainer: {
    width: '100%',
    borderWidth: 2,
    borderColor: '#FFD700',
    overflow: 'hidden',
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    
  },
  button: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#FFD700',
  },
  text: {
    marginLeft: -10,
    fontSize: 14,
    color: '#fff',
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  lottie: {
    width: 50,
    height: 50,
    
  },
});
