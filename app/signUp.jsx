import { Link } from 'expo-router';
import React, { useState } from 'react';
import { View, TextInput, KeyboardAvoidingView, Text, Platform, Pressable, Alert, ScrollView,StyleSheet, Image, Linking, SafeAreaView,StatusBar as RNStatusBar, TouchableOpacity, ActivityIndicator } from 'react-native';
import { createUserWithEmailAndPassword } from "firebase/auth";
import {auth,db} from '../components/firebase/firebaseConfig'
import { useNavigation } from '@react-navigation/native';
import { doc, setDoc, Timestamp } from 'firebase/firestore';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons,FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';
import { SigninComponents } from '../components/authContext/signInComponents';


const SignUp = () => {
  
  const [credenciales, setCredenciales] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [vidas, setVidas] = useState(2);
  const [monedas, setMonedas] = useState(500);
  const [exp, setExp] = useState(100);
  const [nivel,setNivel] = useState(0);
  const [racha, setRacha] = useState(0);
  const [rachaMaxima, setRachaMaxima] = useState(0);
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigation();

  const hoy = new Date(); 
    hoy.setHours(0, 0, 0, 0); // Establecer solo la fecha (sin hora)
    const ayer = new Date(hoy);
      ayer.setDate(hoy.getDate() - 1); // Restar un día para setear la racha

 const handlerOnChange = (field, value) => {
  setCredenciales((prevCredenciales) => ({
    ...prevCredenciales,
    [field]: value,// Establece el valor del campo correspondiente
  }));
};



const handleSignUp = async () => {
  setLoading(true);
  if (credenciales.name && credenciales.email && credenciales.password) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, credenciales.email, credenciales.password);
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        Name: credenciales.name,
        Email: credenciales.email,
        TiempoRegistrado: Timestamp.now(),
        Vidas: vidas,
        Monedas: monedas,
        Exp: exp,
        Nivel: nivel,
        Racha: racha,
        RachaMaxima: rachaMaxima,
        modalRachaShow: ayer.toISOString(),
        Genero: selectedAvatar
      });

      setCredenciales({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
      });

      navigate.replace('welcomeScreen');
    } catch (error) {
      handleFirebaseError(error);
    } finally {
      setLoading(false);
    }
  } else {
    Alert.alert('Por favor, complete todos los campos.');
    setLoading(false);
  }
};

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
      case "auth/email-already-in-use":
        errorMessage = "El correo electrónico ya está en uso. Por favor, utiliza otro correo electrónico.";
        break;
        case "auth/weak-password":
          errorMessage = "La contraseña debe tener al menos 6 caracteres.";
          break;
          case "auth/network-request-failed":
            errorMessage = "No hay conexión a internet. Por favor, verifica tu conexión y vuelve a intentarlo.";
            break;
            case "auth/too-many-requests":
              errorMessage = "Demasiadas solicitudes. Por favor, espera un momento antes de intentar nuevamente.";
              break;
              case "auth/user-disabled":
                errorMessage = "Tu cuenta ha sido deshabilitada. Por favor, contacta al soporte.";
                break;
                case "auth/user-not-found":
                  errorMessage = "No se encontró una cuenta con este correo. Regístrate primero.";
                  break;
                  
          
    default:
      errorMessage = "Ha ocurrido un error inesperado. Por favor, inténtalo de nuevo más tarde.",error;
  }

  // Muestra el mensaje de error con una alerta
  Alert.alert("Error de registro", errorMessage, [{ text: "Entendido" }]);
};



const handleAvatarSelection = (avatarType) => {
  setSelectedAvatar(avatarType);
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
          {/* Sección de Logo y Título */}
          <View style={styles.header}>
            <Text style={styles.title}>QuizBible</Text>
            <Text style={styles.subtitle}>Regístrate para continuar</Text>
          </View>

          {/* Selección de Avatar */}
          <View style={styles.avatarContainer}>
           
            <View style={styles.avatarOptions}>
              <TouchableOpacity 
                style={[styles.avatarOption, selectedAvatar === 'masculino' && styles.selectedAvatar]}
                onPress={() => handleAvatarSelection('masculino')}
              >
                <MaterialIcons name="face" size={50} color={selectedAvatar === 'masculino' ? '#f59e0b' : '#FFF'} />
                <Text style={styles.avatarText}>Hombre</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.avatarOption, selectedAvatar === 'femenino' && styles.selectedAvatar]}
                onPress={() => handleAvatarSelection('femenino')}
              >
                <MaterialCommunityIcons name="face-woman" size={50} color={selectedAvatar === 'femenino' ? '#f59e0b' : '#FFF'} />
                <Text style={styles.avatarText}>Mujer</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Sección de Formulario */}
          <View style={styles.formContainer}>
            {/* Input de Nombre */}
            <View style={styles.inputWrapper}>
              <MaterialIcons 
                name="person" 
                size={24} 
                color="#FFF" 
                style={styles.icon} 
              />
              <TextInput
                placeholder="Nombre"
                placeholderTextColor="rgba(255,255,255,0.7)"
                style={styles.input}
                value={credenciales.name}
                onChangeText={(text) => handlerOnChange('name', text)}
              />
            </View>

            {/* Input de Correo electrónico */}
            <View style={styles.inputWrapper}>
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
                value={credenciales.email}
                onChangeText={(text) => handlerOnChange('email', text)}
              />
            </View>

            {/* Input de Contraseña */}
            <View style={styles.inputWrapper}>
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
                value={credenciales.password}
                onChangeText={(text) => handlerOnChange('password', text)}
              />
            </View>
            { // Validación de la contraseña
              credenciales.password && credenciales.password.length < 8 && 
              <Text style={styles.errorText}>! La contraseña debe tener al menos 6 caracteres.</Text>
            }

            {/* Input de Confirmar Contraseña */}
            <View style={styles.inputWrapper}>
              <MaterialIcons 
                name="lock" 
                size={24} 
                color="#FFF" 
                style={styles.icon} 
              />
              <TextInput
                placeholder="Confirmar contraseña"
                placeholderTextColor="rgba(255,255,255,0.7)"
                style={styles.input}
                secureTextEntry
                value={credenciales.confirmPassword}
                onChangeText={(text) => handlerOnChange('confirmPassword', text)}
              />
            </View>

            {error && <Text style={styles.errorText}>{error}</Text>}

            {/* Botón de Registro */}
            {
              loading ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <TouchableOpacity
              onPress={handleSignUp}
              style={styles.signupButton}
              android_ripple={{ color: '#ffffff50' }}
            >
              <Text style={styles.buttonText}>Regístrate</Text>
            </TouchableOpacity>
              )
            }

            {/* Sección de Redes Sociales */}
          { /* <View>
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>Continúa con</Text>
                <View style={styles.dividerLine} />
              </View>
              <SigninComponents />
            </View>*/}

            {/* Enlace a Login */}
            <View style={styles.loginLink}>
              <Text style={styles.loginText}>¿Ya tienes una cuenta? </Text>
              <Link href="/login" style={styles.loginLink}>
                <Text style={styles.goToLogin}>Inicia sesión</Text>
              </Link>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
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
header: {
  alignItems: 'center',
  marginBottom: 20
},
title: {
  fontSize: 48,
  fontWeight: 'bold',
  color: '#FFF',
  marginBottom: 8,
  textShadowColor: 'rgba(0, 0, 0, 0.25)',
  textShadowOffset: { width: 0, height: 2 },
  textShadowRadius: 4
},
subtitle: {
  fontSize: 18,
  color: '#e5e7eb'
},
avatarContainer: {
  alignItems: 'center',
  marginBottom: 15
},
avatarTitle: {
  fontSize: 18,
  color: '#FFF',
  marginBottom: 10
},
avatarOptions: {
  flexDirection: 'row',
  justifyContent: 'center',
  gap: 20
},
avatarOption: {
  alignItems: 'center',
  padding: 16,
  borderRadius: 12,
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  borderWidth: 2,
  borderColor: 'transparent'
},
selectedAvatar: {
  borderColor: '#f59e0b',
  backgroundColor: 'rgba(245, 158, 11, 0.1)'
},
avatarText: {
  color: '#FFF',
  marginTop: 8
},
formContainer: {
  gap: 10
},
inputWrapper: {
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  borderRadius: 12,
  padding: 12,
  flexDirection: 'row',
  alignItems: 'center'
},
icon: {
  marginRight: 10
},
input: {
  flex: 1,
  color: '#FFF',
  fontSize: 18
},
errorText: {
  color: 'white',
  
  

},
signupButton: {
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
  color: '#FFF',
  fontSize: 20,
  fontWeight: 'bold'
},

divider: {
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: 10,
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
loginLink: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  
},
loginText: {
  color: 'rgba(255, 255, 255, 0.9)'
},
goToLogin: {
  color: '#fbbf24',
  fontWeight: '600',
  textDecorationLine: 'underline'
}
});

export default SignUp;