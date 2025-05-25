import { DefaultTheme, } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import "react-native-reanimated";
import { AuthProvider } from "../components/authContext/authContext";
import  useAuth  from "../components/authContext/authContext";
import { ToastProvider } from 'react-native-toast-notifications'
import { View } from 'react-native';
import { checkSubscriptionStatus, setupSubscriptionListener } from '@/components/suscriptionStatus/suscriptionStatus';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Componente interno que usa el contexto de autenticación
function AppContent() {
  const [isReady, setIsReady] = useState(false);
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });
  const { user } = useAuth();
  const userId = user?.uid;

  // Verificar el estado de la suscripción solo cuando hay un usuario
  useEffect(() => {
    if (!userId) return;

    const checkStatus = async () => {
      try {
        const status = await checkSubscriptionStatus(userId);
        console.log('Estado de suscripción:', status);
      } catch (error) {
        console.error('Error al verificar suscripción:', error);
      }
    };

    // Configurar el listener de suscripción
    const subscription = setupSubscriptionListener(userId);
    checkStatus();

    // Limpiar el listener cuando el componente se desmonte
    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, [userId]);

  // Ocultar el splash screen
  useEffect(() => {
    async function prepare() {
      try {
        if (loaded) {
          await SplashScreen.hideAsync();
          setIsReady(true);
        }
      } catch (e) {
        console.warn(e);
      }
    }
    prepare();
  }, [loaded]);

  if (!loaded || !isReady) {
    return (
      <View style={{ flex: 1, backgroundColor: '#ffffff' }}>
        <StatusBar style="auto" />
      </View>
    );
  }

  const theme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      primary: "blue",
      secondary: "yellow",
    },
    titleLarge: {
      fontFamily: DefaultTheme.fonts.medium.fontFamily,
      fontWeight: 'bold',
      variant: 'bold',
    },
  };

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen
          name="(tabs)"
          options={{ headerShown: false, gestureEnabled: false }}
        />
        
        <Stack.Screen
          name="login"
          options={{
            headerShown: true,
            headerTransparent: true,
            headerTitle: "",
            headerTintColor: "#fff",
          }}
        />
        <Stack.Screen
          name="settingMenu/resetPassWord"
          options={{
            headerShown: true,
            headerTransparent: true,
            headerTitle: "",
            headerTintColor: "#fff",
          }}
        />
        <Stack.Screen
          name="signUp"
          options={{
            headerShown: true,
            headerTransparent: true,
            headerTitle: "",
            headerTintColor: "#fff",
          }}
        />
        <Stack.Screen
          name="signUpScreen"
          options={{
            headerShown: false,
            headerTransparent: true,
            headerTitle: "",
            headerTintColor: "#fff",
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="bibleQuiz"
          options={{ headerShown: false, gestureEnabled: false }}
        />
        <Stack.Screen
          name="versiculosFavoritos"
          options={{
            headerShown: true,
            headerTitle: "Versiculos Favoritos",
            headerBackTitle: "back",
          }}
        />

        <Stack.Screen
          name="paywallScreen"
          options={{
            headerShown: false,
            headerTitle: "",
            headerBackTitle: "volver",
            presentation: "modal",
          }}
        />
        <Stack.Screen
          name="premiumWelcomeScreen"
          options={{
            headerShown: false,
           
          }}
        />
        <Stack.Screen
          name="buyMonedasScreen"
          options={{
            headerShown: false,
            headerTitle: "",
            headerBackTitle: "volver",
            presentation: "modal",
          }}
        />
        <Stack.Screen
          name="dailyReading"
          options={{
            headerShown: true,
            headerTitle: "Lectura Diaria",
            headerBackTitle: "volver",
          }}
        />
        <Stack.Screen
          name="lecturasVistas"
          options={{
            headerShown: true,
            headerTitle: "Lecturas Vistas",
            headerBackTitle: "volver",
          }}
        />
        <Stack.Screen
          name="welcomeScreen"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="settingMenu/menuScreen"
          options={{
            headerShown: true,
            headerBackTitle: "volver",
            headerTitle: "Menu",
          }}
        />
        <Stack.Screen
          name="settingMenu/editProfile"
          options={{
            headerShown: false,
            headerBackTitle: "volver",
            presentation: "modal",
          }}
        />
        <Stack.Screen
          name="settingMenu/soporte"
          options={{
            headerShown: true,
            headerTitle: "Soporte",
            headerBackTitle: "volver",
            presentation: "modal",
          }}
        />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="light" />
    </>
  );
}

// Componente raíz que proporciona los contextos
export default function RootLayout() {
  return (
    <AuthProvider>
      <ToastProvider offsetTop={60}>
        <AppContent />
      </ToastProvider>
    </AuthProvider>
  );
}