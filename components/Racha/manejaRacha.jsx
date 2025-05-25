import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { Alert } from 'react-native';




export const manejarRachaDiaria = async (userId, setModalRachaVisible, setShowModalRachaPerdida) => {
  
  const formatearFecha = (fecha) => {
    const dia = fecha.getDate();
    const mes = fecha.getMonth() + 1;
    const año = fecha.getFullYear();
    return `${dia}-${mes}-${año}`;
  }
 
  try {
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      throw new Error('El documento del usuario no existe.');
    }

    const userData = userDoc.data();
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    let ultimaFecha;
    
    if (userData?.modalRachaShow) {
      ultimaFecha = userData.modalRachaShow?.toDate
        ? userData.modalRachaShow.toDate()
        : new Date(userData.modalRachaShow);
    } else { 
      await updateDoc(userDocRef, {
         modalRachaShow: hoy.toISOString()
      });
      ultimaFecha = hoy;
    }

    let rachaActual = Number(userData?.Racha || 0);
    let rachaMaxima = Number(userData?.RachaMaxima || 0);

    // Si es la primera vez del usuario
    if (!userData.modalRachaShow) {
      await updateDoc(userDocRef, {
        modalRachaShow: hoy.toISOString(),
        Racha: 1,
        RachaMaxima: 1
      });
      setModalRachaVisible(true);
      return;
    }

    // Comparar con la fecha actual
    if (ultimaFecha < hoy) { 
      const ayer = new Date(hoy);
      ayer.setDate(hoy.getDate() - 1);

      if (ultimaFecha.getTime() === ayer.getTime()) {
        // Incrementar racha
        rachaActual += 1;
        if (rachaActual > rachaMaxima) {
          rachaMaxima = rachaActual;
        }
        await updateDoc(userDocRef, {
          modalRachaShow: hoy.toISOString(),
          Racha: rachaActual,
          RachaMaxima: rachaMaxima,
        });
        setModalRachaVisible(true);
      } else {
        // Racha perdida - guardamos la racha anterior antes de reiniciar
        await updateDoc(userDocRef, {
          modalRachaShow: hoy.toISOString(),
          RachaAnterior: rachaActual, // Guardamos la racha anterior
          Racha: 1,
          FechaRachaPerdida: formatearFecha(hoy)
        });
        setShowModalRachaPerdida(true);
      }
    }
  } catch (error) {
    console.error('Error al manejar la racha diaria:', error);
    Alert.alert('Error', 'No se pudo verificar la racha diaria.');
  }
};