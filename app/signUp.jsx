import { Link } from 'expo-router';
import React, { useState } from 'react';
import { View, TextInput, KeyboardAvoidingView, Text, Platform, Pressable, Alert, ScrollView,StyleSheet, Image, Linking, SafeAreaView,StatusBar as RNStatusBar, TouchableOpacity, ActivityIndicator } from 'react-native';
import { createUserWithEmailAndPassword } from "firebase/auth";
import {auth,db} from '../components/firebase/firebaseConfig'
import { useNavigation } from '@react-navigation/native';
import { doc, setDoc, Timestamp } from 'firebase/firestore';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons,FontAwesome } from '@expo/vector-icons';
//import { SigninComponents } from '../components/signinComponents/signinComponents';
import * as ImagePicker from 'expo-image-picker';



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
  const [avatarType, setAvatarType] = useState(null);
  const [imageUri, setImageUri] = useState(null);
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



const handleSignUp = () => {
  setLoading(true);
  if (credenciales.name && credenciales.email && credenciales.password ) {
createUserWithEmailAndPassword(auth, credenciales.email, credenciales.password)
  .then((userCredential) => {
    const user = userCredential.user;
    try{
      setDoc(doc(db, "users", user.uid), {
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
        FotoPerfil: imageUri
      });
    } catch (error) {
  
      console.log(error);
      return error
    }
    }).finally(() => {
      
    setLoading(false);
    setCredenciales({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    });

    navigate.navigate('welcomeScreen');

  })
  .catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
    handleFirebaseError(error);
    // ..
  });

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
          
    default:
      errorMessage = "Ha ocurrido un error inesperado. Por favor, inténtalo de nuevo más tarde.";
  }

  // Muestra el mensaje de error con una alerta
  Alert.alert("Error de inicio de sesión", errorMessage, [{ text: "Entendido" }]);
};

// Función para manejar la selección de imagen
const pickImage = async () => {
  try {
    // Solicitar permisos primero
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    // Manejar diferentes estados de permisos
    if (status !== 'granted') {
      if (status === 'denied') {
        Alert.alert(
          'Permiso requerido',
          'Para seleccionar una imagen, necesitas habilitar el acceso a la galería en la configuración de la aplicación.',
          [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Abrir Configuración', onPress: () => Linking.openSettings() }
          ]
        );
      } else {
        Alert.alert(
          'Permiso requerido',
          'Necesitas permitir el acceso a la galería para seleccionar una imagen.'
        );
      }
      return null;
    }

    // Lanzar el selector de imágenes con configuraciones actualizadas
    const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
          });

    // Manejar resultado
    if (!result.canceled && result.assets?.length > 0) { // Usar canceled con una 'l'
      const selectedUri = result.assets[0].uri;
      setImageUri(selectedUri);
      setAvatarType(null);
      return selectedUri;
    }
    return null;

  } catch (error) {
    console.error("Error en selección de imagen:", error);
    Alert.alert("Error", "Ocurrió un error al seleccionar la imagen");
    return null;
  }
};

const takePhoto = async () => {
  try {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert(
        'Permiso requerido',
        'Necesitas habilitar el acceso a la cámara en la configuración del dispositivo',
        [{ text: 'OK', onPress: () => Linking.openSettings() }]
      );
      return null;
    }

    const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
          });
    if (!result.canceled && result.assets?.length > 0) {
      const photoUri = result.assets[0].uri;
      setImageUri(photoUri);
      setAvatarType(null);
      return photoUri;
    }
    return null;

  } catch (error) {
    console.error("Error al tomar foto:", error);
    Alert.alert("Error", "Falló la captura de imagen");
    return null;
  }
};

// Función para mostrar selector de origen
const handleImageSource = () => {
  Alert.alert(
    "Seleccionar imagen",
    "Elige el origen de la imagen",
    [
      { text: "Cámara", onPress: takePhoto },
      { text: "Galería", onPress: pickImage },
      { text: "Cancelar", style: "cancel" }
    ]
  );
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
            <Text style={styles.title}>BibleBrain</Text>
            <Text style={styles.subtitle}>Regístrate para continuar</Text>
          </View>

          {/* Selección de imagen de perfil */}
          <Pressable
            onPress={handleImageSource}
            style={[styles.avatarContainer, (imageUri || avatarType) && styles.avatarSelected]}
          >
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.avatarImage} />
            ) : (
              <MaterialIcons name="add-a-photo" size={28} color="#FFF" />
            )}
          </Pressable>

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
            {/*<View >
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
  marginBottom: 48
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
  width: 112,
  height: 112,
  alignSelf: 'center',
  marginBottom: 20,
  borderRadius: 56,
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  alignItems: 'center',
  justifyContent: 'center',
  borderWidth: 2,
  borderColor: 'transparent'
},
avatarSelected: {
  borderColor: '#f59e0b'
},
avatarImage: {
  width: '100%',
  height: '100%',
  borderRadius: 56
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