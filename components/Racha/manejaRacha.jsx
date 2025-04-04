import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { Alert } from 'react-native';


export const manejarRachaDiaria = async (userId,setModalRachaVisible,setShowModalRachaPerdida) => {
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

     // Si es la primera vez del usuario (no tiene fecha registrada)
     if (!userData.modalRachaShow) {
      await updateDoc(userDocRef, {
        modalRachaShow: hoy.toISOString(),
        Racha: 1,
        RachaMaxima: 1
      });
      setModalRachaVisible(true);  // Mostrar modal de racha inicial
      return;
    }
// Comparar con la fecha actual
    if (ultimaFecha < hoy) { 
      const ayer = new Date(hoy);
      ayer.setDate(hoy.getDate() - 1);

      if (ultimaFecha.getTime() === ayer.getTime()) {
        rachaActual += 1;
        if (rachaActual > rachaMaxima) {
          rachaMaxima = rachaActual;
        }
        // Mostrar modal de racha actualizada
        setModalRachaVisible(true);
      } else {
        //rachaActual = 1;
        // Mostrar modal de racha perdida
        setShowModalRachaPerdida(true);
      }

      await updateDoc(userDocRef, {
        modalRachaShow: hoy.toISOString(),
        Racha: rachaActual,
        RachaMaxima: rachaMaxima,
      });
    }
  } catch (error) {
    console.error('Error al manejar la racha diaria:', error);
    Alert.alert('Error', 'No se pudo verificar la racha diaria.');
  }
};