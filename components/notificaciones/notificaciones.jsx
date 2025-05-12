import { useEffect } from 'react';
import { Platform, Alert } from 'react-native';
import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

async function scheduleDailyNotifications() {
  // Cancelar notificaciones existentes
  await Notifications.cancelAllScheduledNotificationsAsync();

  // Programar notificación de la mañana (9:00 AM)
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "¡Buenos días!",
      body: "No olvides hacer tu lectura diaria y el quiz para seguir aprendiendo de la palabra de Dios",
      data: { type: 'morning_reminder' },
    },
    trigger: {
      type: 'daily',
      hour: 9,
      minute: 0,
      repeats: true,
    },
    identifier: 'morning_notification'
  });

  // Programar notificación de la tarde (8:00 PM)
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "¡Buenas noches!",
      body: "¿Ya completaste tu lectura diaria y el quiz de hoy? ¡No te pierdas la oportunidad de aprender!",
      data: { type: 'evening_reminder' },
    },
    trigger: {
      type: 'daily',
      hour: 20,
      minute: 0,
      repeats: true,
    },
    identifier: 'evening_notification'
  });
}

async function requestNotificationPermission() {
  const { status } = await Notifications.requestPermissionsAsync();
  return status;
}

async function registerForPushNotificationsAsync() {
  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Platform.OS !== 'web') {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const showPermissionAlert = () => {
        Alert.alert(
          "Permiso de Notificaciones",
          "Las notificaciones son importantes para recibir tu versículo diario y recordatorios de tus lecturas. ¿Te gustaría activarlas?",
          [
            {
              text: "no permitir",
              style: "cancel"
            },
            {
              text: "Aceptar",
              onPress: async () => {
                const newStatus = await requestNotificationPermission();
                if (newStatus === 'granted') {
                  try {
                    const token = await Notifications.getDevicePushTokenAsync();
                    if (token) {
                      await scheduleDailyNotifications();
                    }
                  } catch (error) {
                    console.log('Error al obtener el token:', error);
                  }
                } else {
                  showPermissionAlert(); // Mostrar la alerta nuevamente si aún no acepta
                }
              }
            }
          ]
        );
      };

      showPermissionAlert();
      return;
    }
    
    try {
      const token = await Notifications.getDevicePushTokenAsync();
      if (token) {
        await scheduleDailyNotifications();
      }
    } catch (error) {
      console.log('Error al obtener el token:', error);
    }
  }
}

export default function Notificaciones() {
  useEffect(() => {
    registerForPushNotificationsAsync();
  }, []);

  return null;
}




