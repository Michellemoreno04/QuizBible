import { useEffect } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true, // para que se muestre el numero de notificaciones en el badge
  }),
});

export default function Notificaciones() {
  useEffect(() => {
    registerForPushNotificationsAsync();
    scheduleDailyNotifications();
  }, []);

  return null;
}

async function scheduleDailyNotifications() {
  // Cancelar notificaciones anteriores
  await Notifications.cancelAllScheduledNotificationsAsync();
  
  // Programar notificación para las 9 AM
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "¡Es hora de estudiar la Biblia! 📖",
      body: 'Toma un momento para reforzar tus conocimientos Biblicos',
      data: { data: 'datos aquí' },
    },
    trigger: {
      hour: 9,
      minute: 0,
      repeats: true,
    },
  });

  // Programar notificación para las 8 PM
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "¡Es hora de estudiar la Biblia! 📖",
      body: 'Toma un momento para reforzar tus conocimientos Biblicos',
      data: { data: 'datos aquí' },
    },
    trigger: {
      hour: 20,
      minute: 0,
      repeats: true,
    },
  });
}

async function registerForPushNotificationsAsync() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('myNotificationChannel', {
      name: 'Canal de notificaciones',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  if (finalStatus !== 'granted') {
    return;
  }

  try {
    const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
    if (!projectId) {
      throw new Error('No se encontró el ID del proyecto');
    }
   // const token = await Notifications.getExpoPushTokenAsync({
   //   projectId,
   // });
   // console.log('Token de notificaciones:', token.data);
  } catch (e) {
    console.error('Error al obtener el token:', e);
  }
}
