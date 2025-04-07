import { View, Text, StyleSheet } from 'react-native'
import React, { useState, useEffect } from 'react'
import { Avatar } from '@rneui/base';
import { FontAwesome5 } from '@expo/vector-icons';
import useAuth  from '../../components/authContext/authContext';
import { doc, onSnapshot, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../../components/firebase/firebaseConfig';
import { niveles } from '../Niveles/niveles';
import { LinearGradient } from 'expo-linear-gradient';


export const HeaderHome = () => {
 const { user } = useAuth();
 const userId = user?.uid;
    const [userAuthenticated, setUserAuthenticated] = useState({});
   
  

      useEffect(() => {
        if (!userId) return;
    
        try {
        const userRef = doc(db, 'users', userId);
        const unsubscribe = onSnapshot(userRef, (snapshot) => {
          const userData = snapshot.data() || {};
      
          setUserAuthenticated(userData);
        });
        return () => unsubscribe();
      } catch (error) {
        console.log(error)
      }
    
        
          
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
            : { title: userAuthenticated?.Name?.charAt(0).toUpperCase() }
          )}
          avatarStyle={styles.avatar} />

          <View style={styles.userInfo}>
            <Text style={styles.greeting}>
              {`Hola!, ${userAuthenticated?.Name || 'Anónimo'}`}
            </Text>
            <View style={styles.levelContainer}>
             <LinearGradient
    colors={['#FFD700', '#D4AF37', '#FFD700']}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
    style={styles.gradientBadge}
  >
    <Text style={styles.levelText}>
      {userAuthenticated?.Exp >= 200 
        ? niveles(userAuthenticated?.Exp || 0).insignia 
        : 'PRINCIPIANTE'}
    </Text>
  </LinearGradient>
            </View>
          </View>
        </View>

        <LinearGradient
    colors={['#FFD700', '#D4AF37', '#FFD700']}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
     style={styles.rachaContainer}>
          <Text style={styles.rachaText}>{userAuthenticated?.Racha || 0}</Text>
          <FontAwesome5 name="fire-alt" size={24} color="white" />
        </LinearGradient>
      
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
      levelContainer: {
         
         borderRadius: 10,
         
      },
      gradientBadge: {
        padding: 5,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: '#CCAA00',
      },
      levelText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#FFFFFF', // Texto blanco
        textAlign: 'center',
      },
      rachaContainer: {
        position: 'relative',
       top: 8,
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
        color: 'white', // Texto dorado
        marginLeft: 5,
      },


})