import React, { useState } from 'react'
import { Text, View, Pressable, Alert, TextInput,  ScrollView, SafeAreaView,Platform ,StyleSheet,StatusBar as RNStatusBar, ActivityIndicator} from 'react-native'
import { useNavigation } from '@react-navigation/native';
import { Link } from 'expo-router';
import { auth } from '../components/firebase/firebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
//import { SigninComponents } from '../components/signinComponents/signinComponents';
import  {StatusBar} from 'expo-status-bar'
import { TouchableOpacity } from 'react-native'

function Login() {
 
const navigation = useNavigation();
const [isLoading, setIsLoading] = useState(false);


const [loginCredentials, setLoginCredentials] = useState({
   email: '',
   password: ''
   });

   // 
  const handlerOnchange = (field, value) => {
      setLoginCredentials((prevLoginCredentials) => ({
        ...prevLoginCredentials,
        [field]: value,
      }));
    };

    const handleLogin = () => {
      setIsLoading(true);
      signInWithEmailAndPassword(auth, loginCredentials.email, loginCredentials.password)
        .then((userCredential) => {
          const user = userCredential.user;
          console.log('User logged in');
          navigation.navigate("(tabs)");
        })
        .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
          console.log('Login error:', errorCode, errorMessage);
          handleFirebaseError(error);
        })

        .finally(() => {
          setIsLoading(false); // Desactiva el indicador en cualquier caso
          setLoginCredentials({ email: '', password: '' }); // Mejor aquí
        });

    }

// Función para manejar los errores de Firebase
const handleFirebaseError = (error) => {
  let errorMessage = "Ocurrió un error. Por favor, inténtalo de nuevo.";

  switch (error.code) {
    case "auth/invalid-email":
      errorMessage = "El correo electrónico no es válido. Verifica el formato.";
      break;
    case "auth/user-not-found":
      errorMessage = "No se encontró una cuenta con este correo. Regístrate primero.";
      break;
    case "auth/wrong-password":
      errorMessage = "La contraseña es incorrecta. Inténtalo de nuevo.";
      break;
    case "auth/invalid-credential":
      errorMessage = "Las credenciales ingresadas no son válidas. Intenta nuevamente.";
      break;
    default:
      errorMessage = "Ha ocurrido un error inesperado. Por favor, inténtalo de nuevo más tarde.";
      break;
      case "auth/network-request-failed":
        errorMessage = "No hay conexión a internet. Por favor, verifica tu conexión y vuelve a intentarlo.";
        break;
        case "auth/too-many-requests":
          errorMessage = "Demasiadas solicitudes. Por favor, espera un momento antes de intentar nuevamente.";
          break;
          

    }
    Alert.alert("Error de inicio de sesión", errorMessage);
  };

    

 
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
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          {/* Logo Section */}
          <View style={styles.logoContainer}>
            <Text style={styles.title}>QuizBible</Text>
            <Text style={styles.subtitle}>Tu conexión espiritual inteligente</Text>
          </View>

          {/* Form Section */}
          <View style={styles.formContainer}>
            {/* Email Input */}
            <View style={styles.inputContainer}>
              <MaterialIcons 
                name="email" 
                size={24} 
                color="#FFF" 
                style={styles.icon} 
              />
              <TextInput
                placeholder="Correo electrónico"
                placeholderTextColor="rgba(255,255,255,0.7)"
                style={styles.input}
                autoCapitalize="none"
                keyboardType="email-address"
                value={loginCredentials.email}
                onChangeText={(text) => handlerOnchange('email', text)}
              />
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <MaterialIcons 
                name="lock" 
                size={24} 
                color="#FFF" 
                style={styles.icon} 
              />
              <TextInput
                placeholder="Contraseña"
                placeholderTextColor="rgba(255,255,255,0.7)"
                style={styles.input}
                secureTextEntry
                value={loginCredentials.password}
                onChangeText={(text) => handlerOnchange('password', text)}
              />
            </View>
            <Link href="/resetPassWord" style={styles.signupLink}> 
             <Text style={styles.forgotPasswordText}>¿Olvidaste tu contraseña?</Text>
            </Link>
              
            {/* Login Button */}
           {
            isLoading ? (
              <ActivityIndicator size="large" color="#FFF" />
            ) : (
              <TouchableOpacity
              onPress={handleLogin}
              style={styles.loginButton}
              android_ripple={{ color: '#ffffff50' }}
            >
              <Text style={styles.buttonText}>Acceder</Text>
            </TouchableOpacity>
            )
            
           }

            {/* Social Login */}
            <View style={styles.socialContainer}>
              {/*<View style={styles.dividerContainer}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>Continúa con</Text>
                <View style={styles.dividerLine} />
              </View>

              {/*<SigninComponents />*/}
            </View>

            {/* Signup Link */}
            <View style={styles.signupContainer}>
              <Text style={styles.signupText}>¿Nuevo aquí? </Text>
              <Link href="/signUp" style={styles.signupLink}>
                <Text style={styles.signupLink}>Crea una cuenta</Text>
              </Link>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
    <StatusBar barStyle="light-content"  />
  </LinearGradient>
);
};

const styles = StyleSheet.create({
gradient: {
  flex: 1
},
safeArea: {
  flex: 1
},
scrollContent: {
  flexGrow: 1
},
container: {
  flex: 1,
  paddingHorizontal: 32,
  paddingBottom: 64,
  justifyContent: 'center'
},
logoContainer: {
  alignItems: 'center',
  marginBottom: 48
},
title: {
  fontSize: 48,
  fontWeight: 'bold',
  color: 'white',
  marginBottom: 8,
  textShadowColor: 'rgba(0, 0, 0, 0.25)',
  textShadowOffset: { width: 0, height: 2 },
  textShadowRadius: 4
},
subtitle: {
  fontSize: 18,
  color: '#e5e7eb'
},
formContainer: {
  gap: 5,
},
inputContainer: {
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  borderRadius: 12,
  padding: 12,
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: 12
},
icon: {
  marginRight: 10
},
input: {
  flex: 1,
  color: 'white',
  fontSize: 18
},
loginButton: {
  backgroundColor: '#f59e0b',
  borderRadius: 12,
  padding: 16,
  alignItems: 'center',
  justifyContent: 'center',
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

dividerContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: 24
},
dividerLine: {
  flex: 1,
  height: 1,
  backgroundColor: 'rgba(255, 255, 255, 0.3)'
},
dividerText: {
  paddingHorizontal: 16,
  color: 'rgba(255, 255, 255, 0.8)',
  fontSize: 14
},
signupContainer: {
  flexDirection: 'row',
  justifyContent: 'center',
  paddingTop: 16
},
signupText: {
  color: 'rgba(255, 255, 255, 0.9)'
},
signupLink: {
  color: '#fbbf24',
  fontWeight: '600',
  textDecorationLine: 'underline'
}
});

export default Login;