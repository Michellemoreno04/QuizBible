import { View, StyleSheet, ActivityIndicator } from "react-native";
import { GoogleSigninButton } from "@react-native-google-signin/google-signin";
import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import { auth, db } from "../firebase/firebaseConfig";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { useNavigation } from "@react-navigation/native";
import { doc, getDoc, setDoc, Timestamp } from "firebase/firestore";
import { useState, useEffect } from "react";



export default function SignInComponents() {
  const [vidas, setVidas] = useState(2);
  const [monedas, setMonedas] = useState(500);
  const [exp, setExp] = useState(100);
  const [nivel, setNivel] = useState(0);
  const [racha, setRacha] = useState(0);
  const [rachaMaxima, setRachaMaxima] = useState(0);
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigation();

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0); // Establecer solo la fecha (sin hora)
  const ayer = new Date(hoy);
  ayer.setDate(hoy.getDate() - 1); // Restar un día para setear la racha


 //configuracion de google sign in
 useEffect(() => {
  const initGoogleSignIn = async () => {
    const has = await GoogleSignin.hasPlayServices();
    if (has) {
      GoogleSignin.configure({

        webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
      });
    }
  };
    initGoogleSignIn();
  }, []);

  
  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      // Primero asegurarnos de que el usuario está desconectado
      await GoogleSignin.signOut();
      
      // Obtener los datos del usuario
      const signInResult = await GoogleSignin.signIn();
      
      // Obtener los tokens
      const { accessToken } = await GoogleSignin.getTokens();
      
      if (!accessToken) {
        throw new Error('No se pudo obtener el token de acceso de Google');
      }

      const googleCredential = GoogleAuthProvider.credential(
        signInResult.idToken,
        accessToken
      );

      // Iniciar sesión con la credencial
      const result = await signInWithCredential(auth, googleCredential);
      
      // Verificar si el usuario ya existe en Firestore
      const userDoc = await getDoc(doc(db, "users", result.user.uid));
      
      if (!userDoc.exists()) {
        // Si el usuario no existe, crear su perfil
        await setDoc(doc(db, "users", result.user.uid), {
          Name: result.user.displayName || "Usuario",
          Email: result.user.email,
          TiempoRegistrado: Timestamp.now(),
          Vidas: vidas,
          Monedas: monedas,
          Exp: exp,
          Nivel: nivel,
          Racha: racha,
          RachaMaxima: rachaMaxima,
          modalRachaShow: ayer.toISOString(),
          Genero: selectedAvatar || "masculino",
          FotoPerfil: result.user.photoURL || '',    
        });
        // Usuario nuevo, redirigir a welcomeScreen
        navigate.replace("welcomeScreen");
      } else {
        // Usuario existente, redirigir a tabs
        navigate.replace("(tabs)");
      }

    } catch (error) {
      console.log("Error completo:", error);
    
    } finally {
      setGoogleLoading(false);
    }
  };


  return (
    <View style={styles.container}>
{
  googleLoading ? (
    <ActivityIndicator size="large" color="#0000ff" />
  ) : (
    <GoogleSigninButton
      style={styles.googleSigninButton}
      size={GoogleSigninButton.Size.Wide}
      color={GoogleSigninButton.Color.Dark}
      onPress={handleGoogleSignIn}
    />
  )
}      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    
  },
  googleSigninButton: {
    width: "100%",
    height: 55,
    borderRadius: 10,

  },
});
