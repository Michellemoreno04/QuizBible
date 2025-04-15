import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { auth } from '../firebase/firebaseConfig';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { GoogleSigninButton } from '@react-native-google-signin/google-signin';

// Función para inicializar Google Sign In
export const initGoogleSignIn = async () => {
  const has = await GoogleSignin.hasPlayServices();
  if(has){
    GoogleSignin.configure({
      
      webClientId: '1001847642825-rh05l1e0ed7avev5mvdkdgugrk0ejea5.apps.googleusercontent.com',
    });
  }
};

// Función para manejar el login con Google
export const onGoogleButtonPress = async () => {
  try {
    // Check if your device supports Google Play
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    // Get the users ID token
    const signInResult = await GoogleSignin.signIn();

    // Try the new style of google-sign in result, from v13+ of that module
    let idToken = signInResult.data?.idToken;
    if (!idToken) {
      // if you are using older versions of google-signin, try old style result
      idToken = signInResult.idToken;
    }
    if (!idToken) {
      throw new Error('No ID token found');
    }

    // Create a Google credential with the token
    const googleCredential = auth.GoogleAuthProvider.credential(idToken);

    // Sign-in the user with the credential
    return auth().signInWithCredential(googleCredential);
  } catch (error) {
    console.error('Error en Google Sign In:', error);
    throw error;
  }
};

export default function SignInComponents() {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState();

  useEffect(() => {
    initGoogleSignIn();
  }, []);

  // Handle user state changes
  function onAuthStateChanged(user) {
    setUser(user);
    if (initializing) setInitializing(false);
  }

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(onAuthStateChanged);
    return unsubscribe;
  }, []);

  if (initializing) return null;

  return (
    <View>
      <GoogleSigninButton
        style={{ width: 192, height: 48 }}
        size={GoogleSigninButton.Size.Wide}
        color={GoogleSigninButton.Color.Dark}
        onPress={onGoogleButtonPress}
      />
    </View>
  );
}