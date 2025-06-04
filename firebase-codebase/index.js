const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.verificarRacha = functions.pubsub
  .schedule('0 20 * * *') // sintaxis cron donde 0= 0 mnt, 20= 8pm, * * * = todos los días, todos los meses, todos los días de la semana
  .timeZone('America/Santo_Domingo') // zona horaria
  .onRun(async (context) => { // el onRun es para ejecutar la función
    const db = admin.firestore();
    const usersSnapshot = await db.collection('users').get();

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const batch = db.batch(); // batcha es un array de operaciones que se ejecutan en conjunto
    const notifications = [];

    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();
      
      // Verificar si el usuario tiene token de notificación
      if (!userData.PushNotificationToken) continue;

      let ultimaFecha = null;
      if (userData?.modalRachaShow) {
        ultimaFecha = userData.modalRachaShow?.toDate
          ? userData.modalRachaShow.toDate()
          : new Date(userData.modalRachaShow);
        ultimaFecha.setHours(0, 0, 0, 0);
      }

      // Si no hay fecha de última racha o la última racha no es hoy
      if (!ultimaFecha || ultimaFecha.getTime() !== hoy.getTime()) {
        // Enviar notificación push
        const message = {
          token: userData.PushNotificationToken,
          notification: {
            title: "¡No pierdas tu racha!",
            body: "Aún no has completado el quiz de hoy. ¡Mantén tu racha y sigue aprendiendo de la palabra de Dios!"
          },
          data: {
            type: 'evening_reminder'
          }
        };

        notifications.push(admin.messaging().send(message));
      }
    }

    // Enviar todas las notificaciones
    await Promise.all(notifications);
    
    return null;
  });