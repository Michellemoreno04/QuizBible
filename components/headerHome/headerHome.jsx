import { View, Text, StyleSheet } from 'react-native'
import React, { useState, useEffect } from 'react'
import { Avatar } from '@rneui/base';
import { FontAwesome5 } from '@expo/vector-icons';
import useAuth  from '../../components/authContext/authContext';
import { doc, onSnapshot, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../../components/firebase/firebaseConfig';
import { niveles } from '../Niveles/niveles';


export const HeaderHome = () => {
 const { user } = useAuth();
    const [userAuthenticated, setUserAuthenticated] = useState({});
    const [showNivelModal, setShowNivelModal] = useState(false);
    const [nivelAnterior, setNivelAnterior] = useState(null);
    const [isLoading, setIsLoading] = useState(true);


    const userId = user?.uid;

      useEffect(() => {
        if (!userId) return;
    
        const userRef = doc(db, 'users', userId);
        const unsubscribe = onSnapshot(userRef, (snapshot) => {
          const userData = snapshot.data() || {};
          setUserAuthenticated(userData);
    
          if (userData.Exp) {
            const nivelActual = niveles(userData.Exp).nivel;
            const nivelAnterior = userData.Nivel || 0;
    
            updateDoc(userRef, { Nivel: nivelActual });
    
            if (nivelAnterior !== null && nivelActual > nivelAnterior) {
              setShowNivelModal(true);
            }
    
            setNivelAnterior(nivelActual);
          }
          setIsLoading(false);
        });
    
        return () => unsubscribe();
      }, [userId]);

       // Guardar insignia en la base de datos
        useEffect(() => {
          const guardarInsignia = async () => {
            if (!userAuthenticated.Exp) return;
      
            const nuevaInsignia = niveles(userAuthenticated.Exp).insignia;
            const userRef = doc(db, 'users', userId);
      
            try {
              const userDoc = await getDoc(userRef);
              const currentInsignias = userDoc.data()?.Insignias || [];
      
              if (!currentInsignias.includes(nuevaInsignia)) {
                const updatedInsignias = [nuevaInsignia, ...currentInsignias];
                await updateDoc(userRef, {
                  Insignias: updatedInsignias
                });
                console.log('Insignia agregada al principio con éxito');
              }
            } catch (error) {
              console.error('Error al actualizar insignias:', error);
            }
          };
      
          guardarInsignia();
        }, [userAuthenticated.Exp, userId]);

        
    return (
        <View style={styles.headerContainer}>
        <View style={styles.leftContainer}>
        <Avatar
          size={60}
          rounded
          containerStyle={{
            backgroundColor: userAuthenticated?.FotoPerfil ? 'transparent' : 'orange',
          }}
          {...(userAuthenticated?.FotoPerfil
            ? { source: { uri: userAuthenticated?.FotoPerfil } }
            : { title: userAuthenticated?.Name?.charAt(0) }
          )}
          avatarStyle={styles.avatar} />

          <View style={styles.userInfo}>
            <Text style={styles.greeting}>
              {`Hola!, ${userAuthenticated?.Name || 'Anónimo'}`}
            </Text>
            <View className="flex-row ">
              <Text style={styles.level} >
              {userAuthenticated?.Exp >= 200 
      ? niveles(userAuthenticated?.Exp || 0).insignia 
      : 'Principiante'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.rachaContainer}>
          <Text style={styles.rachaText}>{userAuthenticated?.Racha || 0}</Text>
          <FontAwesome5 name="fire-alt" size={24} color="#FFD700" />
        </View>
      </View>
    )
}

const styles = StyleSheet.create({
    headerContainer: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 10,
        marginBottom: 15,
      },
      avatar: {
        width: 60,
        height: 60,
        borderRadius: 100,
        borderWidth: 2,
        borderColor: 'white',
       
      },
      leftContainer: {
        flexDirection: 'row',
        alignItems: 'center',
      },
      userInfo: {
        marginLeft: 10,
      },
      greeting: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FFFFFF', // Texto blanco para contrastar con el fondo oscuro
      },
      level: {
        fontSize: 14,
        color: '#FFFFFF', // Texto blanco
        
        borderRadius: 5,
      },
      rachaContainer: {
        position: 'relative',
        bottom: 10,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.2)', // Fondo semi-transparente
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 50,
        gap: 5,
      },
      rachaText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFD700', // Texto dorado
        marginLeft: 5,
      },


})