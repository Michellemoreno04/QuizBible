import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { auth } from "../firebase/firebaseConfig";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { GoogleSigninButton } from "@react-native-google-signin/google-signin";
import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";

export default function SignInComponents({ handleGoogleSignIn }) {
  return (
    <View>
      <GoogleSigninButton
        style={{ width: 192, height: 48 }}
        size={GoogleSigninButton.Size.Wide}
        color={GoogleSigninButton.Color.Dark}
        onPress={handleGoogleSignIn}
      />
    </View>
  );
}
