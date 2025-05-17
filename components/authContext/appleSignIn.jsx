import * as AppleAuthentication from 'expo-apple-authentication';
import { View, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { auth, db } from "../firebase/firebaseConfig";
import { OAuthProvider, signInWithCredential } from "firebase/auth";
import { doc, getDoc, setDoc, Timestamp } from "firebase/firestore";
import { useNavigation } from "@react-navigation/native";
import { Audio } from 'expo-av';

export default function AppleSignIn() {
  const [appleLoading, setAppleLoading] = useState(false);
  const navigate = useNavigation();

  // Función para configurar la sesión de audio
  const configureAudioSession = async () => {
    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
    } catch (error) {
      console.log('Error configurando sesión de audio:', error);
    }
  };

  // Valores iniciales para nuevos usuarios
  const vidas = 3;
  const monedas = 500;
  const exp = 100;
  const nivel = 0;
  const racha = 0;
  const rachaMaxima = 0;
  const selectedAvatar = "";

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const ayer = new Date(hoy);
  ayer.setDate(hoy.getDate() - 1);

  const handleAppleSignIn = async () => {
    setAppleLoading(true);
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      console.log(credential);

      // Configurar sesión de audio después del inicio de sesión
      await configureAudioSession();

      // Crear credencial de Firebase con el token de Apple
      const provider = new OAuthProvider('apple.com');
      const appleCredential = provider.credential({
        idToken: credential.identityToken,
        rawNonce: credential.nonce,
      });

      // Iniciar sesión en Firebase
      const result = await signInWithCredential(auth, appleCredential);
      
      // Verificar si el usuario ya existe
      const userDoc = await getDoc(doc(db, "users", result.user.uid));
      
     if (!userDoc.exists()) {
        // Crear nuevo usuario
        const userData = {
          Name: credential.fullName?.givenName || "Usuario",
          Email: credential.email || result.user.email,
          TiempoRegistrado: Timestamp.now(),
          Vidas: vidas,
          Monedas: monedas,
          Exp: exp,
          Nivel: nivel,
          Racha: racha,
          RachaMaxima: rachaMaxima,
          modalRachaShow: ayer.toISOString(),
          Genero: selectedAvatar,
          FotoPerfil: '',
          EmailPrivado: false,
          ConsentimientoPublicidad: false,
        };

        await setDoc(doc(db, "users", result.user.uid), userData);

        Alert.alert(
          "Configuración de Privacidad",
          "¿Deseas mantener tu correo electrónico privado?",
          [
            {
              text: "No",
              onPress: () => navigate.replace("welcomeScreen")
            },
            {
              text: "Sí",
              onPress: async () => {
                await setDoc(doc(db, "users", result.user.uid), {
                  EmailPrivado: true
                }, { merge: true });
                navigate.replace("welcomeScreen");
              }
            }
          ]
        );
      } else {
        navigate.replace("(tabs)");
      }

    } catch (e) {
      if (e.code === 'ERR_REQUEST_CANCELED') {
        console.log('Usuario canceló el inicio de sesión');
      } else {
        console.log('Error en inicio de sesión con Apple:', e);
      }
    } finally {
      setAppleLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {appleLoading ? (
        <ActivityIndicator size="large" color="#000000" />
      ) : (
        <AppleAuthentication.AppleAuthenticationButton
          buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
          buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
          cornerRadius={5}
          style={styles.button}
          onPress={handleAppleSignIn}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 10,
    //alignItems: 'center',
    //justifyContent: 'center',
  },
  button: {
    width: '100%',
    height: 55,
  },
});
