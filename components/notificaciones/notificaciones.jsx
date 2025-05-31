import { useEffect } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import useAuth from '../authContext/authContext';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

async function scheduleDailyNotifications(user) {
  // Cancelar notificaciones existentes
  await Notifications.cancelAllScheduledNotificationsAsync();

  // Obtener el versículo del día
  const versiculoRef = doc(db, 'users', user.uid, 'versiculoDelDia', 'current');
  const versiculoDoc = await getDoc(versiculoRef);
  const versiculoData = versiculoDoc.exists() ? versiculoDoc.data() : null;

  // Programar notificación de la mañana (9:00 AM) con el versículo
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "¡Buenos días! Tu versículo del día es:",
      body: versiculoData ? 
        `${versiculoData.versiculo.versiculo}\n${versiculoData.versiculo.texto}` :
        "No olvides mantener tu racha diaria y hacer el quiz para seguir aprendiendo de la palabra de Dios",
      data: { type: 'morning_verse' },
    },
    trigger: {
      type: 'daily',
      hour: 9,
      minute: 0,
      repeats: true,
    },
    identifier: 'morning_verse_notification'
  });

  // Verificar la racha antes de programar la notificación de la tarde
  const userRef = doc(db, 'users', user.uid);
  const userDoc = await getDoc(userRef);
  const userData = userDoc.data();
  
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  
  let ultimaFecha;
  if (userData?.modalRachaShow) {
    ultimaFecha = userData.modalRachaShow?.toDate
      ? userData.modalRachaShow.toDate()
      : new Date(userData.modalRachaShow);
    ultimaFecha.setHours(0, 0, 0, 0);
  }

  // Solo programar la notificación de la tarde si no se ha completado la racha hoy
  if (!ultimaFecha || ultimaFecha.getTime() !== hoy.getTime()) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "¡No pierdas tu racha!",
        body: "Aún no has completado el quiz de hoy. ¡Mantén tu racha y sigue aprendiendo de la palabra de Dios!",
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
}

async function registerForPushNotificationsAsync(user) {
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
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      console.log('¡Permiso no concedido para notificaciones!');
      return;
    }
    
    try {
      const token = await Notifications.getDevicePushTokenAsync();
      if (token && user) {
        // Actualizar el token en Firestore
        await updateDoc(doc(db, "users", user.uid), {
          PushNotificationToken: token.data,
        });
        // Pasar el usuario a scheduleDailyNotifications
        await scheduleDailyNotifications(user);
      }
     // console.log('Token:', token);
    } catch (error) {
      console.log('Error al obtener el token:', error);
    }
  }
}

export default function Notificaciones() {
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      registerForPushNotificationsAsync(user);
    }
  }, [user]);

  return null;
}



