import { View, Text, Pressable, StyleSheet } from "react-native";
import React, { useState } from "react";
import { AntDesign, FontAwesome6 } from "@expo/vector-icons";
/*import { GoogleSignin,statusCodes,} from "@react-native-google-signin/google-signin";
import { useNavigation } from "expo-router";
import { auth } from "../firebase/firebaseConfig";
import {GoogleAuthProvider, signInWithCredential} from "firebase/auth";


GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_WEB_TOKEN_GOOGLE_SIGN_IN , // client ID of type WEB for your server. Required to get the `idToken` on the user object, and for offline access.
  scopes: ["https://www.googleapis.com/auth/userinfo.profile"],
  offlineAccess: true, // if you want to access Google API on behalf of the user FROM YOUR SERVER
  forceCodeForRefreshToken: true, // [Android] related to `serverAuthCode`, read the docs link below *.
  //iosClientId: '<FROM DEVELOPER CONSOLE>', // [iOS] if you want to specify the client ID of type iOS (otherwise, it is taken from GoogleService-Info.plist)
});
*/
export function SigninComponents() {
  // const navigation = useNavigation();
  //const [state, setState] = useState({ userInfo: null });

  // Somewhere in your code
  const signIn = async () => {
 /*   try {
      // Verifica si hay Play Services en el dispositivo (importante para Android)
      await GoogleSignin.hasPlayServices();
       // Inicia el proceso de inicio de sesión con Google
      await GoogleSignin.signIn();
// Obtiene la información del usuario actualmente autenticado
      const response = await GoogleSignin.getCurrentUser();

      console.log(response, "USERRR");
       // Crea una credencial de Google a partir del idToken recibido
      const googleCredential = await GoogleAuthProvider.credential(
        response.idToken
      );
      console.log(googleCredential, "SDDSFjjhj");
      // Sign-in to Firebase with the Google credential
      const signInWithCredentia = await signInWithCredential(
        auth,
        googleCredential
      );
      
      console.log(signInWithCredentia, "SDFSDF");
     
    } catch (error) {
      // Aquí se verifica si el error tiene una propiedad 'code' que se puede usar para manejar errores específicos
      console.log("el error es:", error);
      if (isErrorWithCode(error)) {
        switch (error.code) {
          case statusCodes.IN_PROGRESS:
            // La operación de inicio de sesión ya se encuentra en progreso

            break;
          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            // Android only, play services not available or outdated
            break;
          default:
           // Manejo de otros errores relacionados con Google Signin
        }
      } else {
        // an error that's not related to google sign in occurred
        console.log("el error no relacionado con google:", error);
      }
    }*/
  };

  return (
    <View style={styles.container}>
      <Pressable
        onPress={signIn}
        className="w-full-white p-5 bg-white rounded-full"
      >
        <AntDesign name="google" size={24} color="black" />
      </Pressable>
      <Pressable className="w-full-white p-5 bg-white rounded-full">
        <FontAwesome6 name="facebook" size={24} color="black" />
      </Pressable>
      <Pressable className="w-full-white p-5 bg-white rounded-full">
        <AntDesign name="apple1" size={24} color="black" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
    marginTop: 20,
  },
});