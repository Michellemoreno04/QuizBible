import { View, Text, StyleSheet, Platform, TouchableOpacity, Pressable, Image } from 'react-native'
import React, { useState, useEffect } from 'react'
import { Avatar } from '@rneui/base';
import { FontAwesome5 } from '@expo/vector-icons';
import useAuth  from '../../components/authContext/authContext';
import { doc, onSnapshot, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../../components/firebase/firebaseConfig';
import { niveles } from '../Niveles/niveles';
import { LinearGradient } from 'expo-linear-gradient';
import { ModalRacha } from '../Modales/modalRacha';
import Modal from 'react-native-modal';



export const HeaderHome = () => {
 const { user } = useAuth();
 const userId = user?.uid;
const [userAuthenticated, setUserAuthenticated] = useState({});
const [isModalRachaVisible, setIsModalRachaVisible] = useState(false);
const [isImageOpen, setIsImageOpen] = useState(false);
  
  const openModalRacha = () => {
    setIsModalRachaVisible(true);
  }
  const closeModalRacha = () => {
    setIsModalRachaVisible(false);
  }

  const openImage = () => {
    if(userAuthenticated?.FotoPerfil){
      setIsImageOpen(true);
    }
  }

  const closeImage = () => {
    setIsImageOpen(false);
  }




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
        <ModalRacha isVisible={isModalRachaVisible} setModalRachaVisible={closeModalRacha} />
        <Modal isVisible={isImageOpen} animationIn="zoomIn" animationOut="zoomOut" backdropTransitionOutTiming={0} backdropOpacity={0.7} onBackdropPress={closeImage} style={styles.modal}
>
  <LinearGradient
    colors={[ '#1E3A5F', '#3C6E9F']}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
    style={styles.modalContent}
  >
    <TouchableOpacity 
      style={styles.closeButton} 
      onPress={closeImage}
      activeOpacity={0.7}
    >
      <FontAwesome5 name="times" size={24} color="white" />
    </TouchableOpacity>
    
    <Image 
      source={{ uri: userAuthenticated?.FotoPerfil || '' }}
      style={styles.modalImage}  
      resizeMode="stretch"
    />
  </LinearGradient>
</Modal>
        <View style={styles.leftContainer}>
        <TouchableOpacity onPress={openImage}>
        <Avatar
          size={60}
          rounded
          containerStyle={{
            backgroundColor: userAuthenticated?.FotoPerfil ? 'transparent' : 'orange',
          }}
          {...(userAuthenticated?.FotoPerfil
            ? { source: { uri: userAuthenticated?.FotoPerfil} }
            : { title: userAuthenticated?.Name?.charAt(0).toUpperCase() }
          )}
          avatarStyle={styles.avatar} />
          </TouchableOpacity>

          <View style={styles.userInfo}>
            <Text style={styles.greeting}>
              {`Hola!, ${userAuthenticated?.Name || '...'}`}
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

        <TouchableOpacity onPress={openModalRacha}>
        <LinearGradient
    colors={['#FFD700', '#D4AF37', '#FFD700']}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
     style={styles.rachaContainer}
     
     >
          <Text style={styles.rachaText}>{userAuthenticated?.Racha || 0}</Text>
          <FontAwesome5 name="fire-alt" size={24} color="white" />
        </LinearGradient>
        </TouchableOpacity>
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
      modal: {
        margin: 0,
        justifyContent: 'center',
        alignItems: 'center',
    
      },
      modalContent: {
        width: '90%',
        height: '60%',
        position: 'relative',
       // backgroundColor: 'rgba(255, 215, 0, 0.8)',
      },
      closeButton: {
        width: 50,
        height: 50,
        position: 'absolute',
        top: -30,
        right: -15,
        zIndex: 1,
        backgroundColor: 'red',
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'white',
        padding: 5,
      },
      modalImage: {
        width: '100%',
        height: '100%',
        borderRadius: 15,
        position: 'relative',
        borderWidth: 2,
        borderColor: 'rgba(255, 215, 0, 0.8)',
        padding: 5,
       // backgroundColor: 'rgba(255, 215, 0, 0.8)',

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
        width: 'auto',
        minWidth: 100,
        alignSelf: 'flex-start', //
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