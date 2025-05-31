import { View, StyleSheet, ActivityIndicator, Platform, Dimensions, TouchableOpacity, Text } from "react-native";
import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import { auth, db } from "../firebase/firebaseConfig";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { useNavigation } from "@react-navigation/native";
import { doc, getDoc, setDoc, Timestamp } from "firebase/firestore";
import { useState, useEffect } from "react";
import { Ionicons } from '@expo/vector-icons';
import AppleSignIn from "./appleSignIn";




export default function SignInComponents() {
  const [vidas, setVidas] = useState(3);
  const [monedas, setMonedas] = useState(300);
  const [exp, setExp] = useState(100);
  const [nivel, setNivel] = useState(0);
  const [racha, setRacha] = useState(0);
  const [rachaMaxima, setRachaMaxima] = useState(0);
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [Premium, setPremium] = useState(false);
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
        iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
        webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
       // scopes: ['profile', 'email'],
        offlineAccess: false,
      });
    }
  };
    initGoogleSignIn();
  }, []);

  
  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      await GoogleSignin.signOut();
      
      const signInResult = await GoogleSignin.signIn({
        prompt: 'select_account',
        hostedDomain: '',
      });
      
      const { accessToken } = await GoogleSignin.getTokens();
      
      if (!accessToken) {
        throw new Error('No se pudo obtener el token de acceso de Google');
      }

      const googleCredential = GoogleAuthProvider.credential(
        signInResult.idToken,
        accessToken
      );

      const result = await signInWithCredential(auth, googleCredential);
      
      const userDoc = await getDoc(doc(db, "users", result.user.uid));
      
      if (!userDoc.exists()) {
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
          FotoPerfil: '',
          EmailPrivado: false,
          ConsentimientoPublicidad: false,
          Premium: Premium,
        });
        
        navigate.replace("welcomeScreen");
        
      } else {
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
      {googleLoading ? (
        <ActivityIndicator size="large" color="#4285F4" />
      ) : (
        <TouchableOpacity
          style={styles.customGoogleButton}
          onPress={handleGoogleSignIn}
          activeOpacity={0.8}
        >
          <View style={styles.googleIconContainer}>
            <Ionicons name="logo-google" size={24} color="#4285F4" />
          </View>
          <Text style={styles.googleButtonText}>Continuar con Google</Text>
        </TouchableOpacity>
      )}
      <AppleSignIn />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
   
   // paddingHorizontal: 20,
  },
  customGoogleButton: {
    width: "100%",
    height: 55,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  googleIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
   // marginRight: 12,
  },
  googleButtonText: {
    color: '#757575',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: Platform.select({
      ios: 'System',
      android: 'Roboto',
    }),
  },
});
