import { View, Text, StyleSheet, Platform, TouchableOpacity, Image, Alert,Dimensions } from 'react-native'
import React, { useState, useEffect } from 'react'
import { Avatar } from '@rneui/base';
import { FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import useAuth  from '../../components/authContext/authContext';
import { doc, onSnapshot, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../../components/firebase/firebaseConfig';
import { niveles } from '../Niveles/niveles';
import { LinearGradient } from 'expo-linear-gradient';
import { ModalRacha } from '../Modales/modalRacha';
import Modal from 'react-native-modal';
import { useNavigation } from '@react-navigation/native';

const { width, height} = Dimensions.get('screen');


export const HeaderHome = () => {
 const { user } = useAuth();
 const navigation = useNavigation();
 const userId = user?.uid;
const [userAuthenticated, setUserAuthenticated] = useState({});
const [isModalRachaVisible, setIsModalRachaVisible] = useState(false);
const [isImageOpen, setIsImageOpen] = useState(false);
const [isInsigniaModalVisible, setIsInsigniaModalVisible] = useState(false);



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

  const openInsigniaModal = () => {
    setIsInsigniaModalVisible(true);
  }

  const closeInsigniaModal = () => {
    setIsInsigniaModalVisible(false);
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

  const esHoyLaFechaRachaPerdida = () => {
    if (!userAuthenticated?.FechaRachaPerdida) return false;
    
    const hoy = new Date();
    const [dia, mes, año] = userAuthenticated.FechaRachaPerdida.split('-').map(Number);
    const fechaRachaPerdida = new Date(año, mes - 1, dia);
    
    return hoy.getDate() === fechaRachaPerdida.getDate() &&
           hoy.getMonth() === fechaRachaPerdida.getMonth() &&
           hoy.getFullYear() === fechaRachaPerdida.getFullYear();
  };


  const handleRecuperarRacha = async () => {
   const cantidadMonedas = userAuthenticated?.Monedas;

   if(cantidadMonedas >= 1000){
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      Monedas: cantidadMonedas - 1000,
      Racha: userAuthenticated?.RachaAnterior || 0,
      FechaRachaPerdida: null,
      RachaAnterior: null
    });
   }else{
    Alert.alert('No tienes suficientes monedas para recuperar la racha', 'Puedes comprar monedas en la tienda.', [{text: 'OK', onPress: () => {
      navigation.navigate('buyMonedasScreen');
    }}]);
   }
  };

        
    return (
        <View style={styles.headerContainer}>
        <ModalRacha isVisible={isModalRachaVisible} setModalRachaVisible={closeModalRacha} />
       
           
        <Modal isVisible={isImageOpen} animationIn="zoomIn" animationOut="zoomOut" backdropTransitionOutTiming={0} backdropOpacity={0.7} onBackdropPress={closeImage} style={styles.modal}> 
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

        {/* Modal para la insignia */}
        <Modal
            isVisible={isInsigniaModalVisible}
            onBackdropPress={closeInsigniaModal}
            backdropOpacity={0.7}
            animationIn="zoomIn"
            animationOut="zoomOut"
            backdropTransitionOutTiming={0} 
        >
            <LinearGradient
                colors={['#FFD700', '#D4AF37', '#FFD700']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.modalInsigniaContent}
            >
                <TouchableOpacity 
                    style={styles.closeButton} 
                    onPress={closeInsigniaModal}
                    activeOpacity={0.7}
                >
                    <FontAwesome5 name="times" size={24} color="white" />
                </TouchableOpacity>

                <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>
                        {userAuthenticated?.Exp >= 200 
                            ? niveles(userAuthenticated?.Exp || 0).insignia 
                            : 'PRINCIPIANTE'}
                    </Text>
                </View>

                <Text style={styles.modalDescription}>
                    {userAuthenticated?.Exp >= 200 
                        ? niveles(userAuthenticated?.Exp || 0).description 
                        : '¡Comienza tu viaje para obtener tu primera insignia!'}
                </Text>
            </LinearGradient>
        </Modal>
     <View style={styles.container}>
        <View style={styles.leftContainer}>
            <TouchableOpacity onPress={openImage}>
                <View style={styles.avatarContainer}>
                    <Avatar
                        size={width * 0.15}
                        rounded
                        containerStyle={{
                           backgroundColor: userAuthenticated?.FotoPerfil ? 'transparent' : 'orange',
                        }}
                        {...(userAuthenticated?.FotoPerfil
                            ? { source: { uri: userAuthenticated?.FotoPerfil} }
                            : { title: userAuthenticated?.Name?.charAt(0).toUpperCase() }
                        )}
                        avatarStyle={styles.avatar} 
                    />
                    
                </View>
            </TouchableOpacity>

            <View style={styles.userInfo}>
                <Text 
                    style={styles.greeting}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                >
                    {`Hola!, ${userAuthenticated?.Name || '...'}`}
                </Text>
                <TouchableOpacity onPress={openInsigniaModal}>
                    <View style={styles.levelContainer}>
                      <View style={{flexDirection: 'row', alignItems: 'center', gap: 3}}>
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
                {userAuthenticated?.Premium && (
                        <View style={styles.crownContainer}>
                            <FontAwesome5 name="crown" size={width * 0.025} color="#FFD700" style={styles.crownIcon} />
                        </View>
                    )}
                        </View>
                    </View>
                </TouchableOpacity>
            </View>
        </View>
        
        <View style={styles.rachaIconsContainer}>
        <TouchableOpacity 
            onPress={() => navigation.navigate('buyMonedasScreen')}
            style={styles.tiendaButton}
        >
            <LinearGradient
                colors={['#FFD700', '#D4AF37', '#FFD700']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.tiendaGradient}
            >
                <FontAwesome5 name="store" size={width * 0.05} color="white" />
                <Text style={styles.tiendaText}></Text>
            </LinearGradient>
        </TouchableOpacity>
        {userAuthenticated?.FechaRachaPerdida && 
         esHoyLaFechaRachaPerdida() && 
         userAuthenticated?.Racha === 1 && (
            <TouchableOpacity 
              onPress={() => {
                Alert.alert('Recuperar Racha', 'Puedes usar 1000 monedas para recuperar tu racha anterior', 
                  [{ cancelable: true, text: 'Cancelar', onPress: () => {
                    console.log('Cancelado');
                  } },
                  { text: 'Recuperar', onPress: () => {
                    handleRecuperarRacha();
                  }}]);
              }}

              style={styles.recuperarRachaButton}
            >
              <LinearGradient
                colors={['#FF4444', '#CC0000', '#FF4444']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.recuperarRachaGradient}
              >
                <FontAwesome5 name="undo" size={width * 0.03} color="white" />
                <Text style={styles.recuperarRachaText}>Recuperar {'\n'} Racha</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
       

        <TouchableOpacity onPress={openModalRacha}>
            <LinearGradient
                colors={['#FFD700', '#D4AF37', '#FFD700']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.rachaContainer}
            >
                <Text style={styles.rachaText}>{userAuthenticated?.Racha || 0}</Text>
                <FontAwesome5 name="fire-alt" size={width * 0.05} color="white" />
            </LinearGradient>
        </TouchableOpacity>

       
        </View>
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
       // paddingHorizontal: 10,
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
       //backgroundColor: 'rgba(255, 215, 0, 0.8)',
      },
      closeButton: {
        width: 50,
        height: 50,
        position: 'absolute',
        top: -35,
        right: -15,
        zIndex: 1000,
        backgroundColor: 'red',
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'white',
        padding: 5,
        ...Platform.select({
            ios: {
              width:50,
              top:0,
              right:0,
                backgroundColor: 'red',
            }
        })
      
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
       // width: 60,
       // height: 60,
        borderRadius: 100,
        borderWidth: 2,
        borderColor: 'white',
        zIndex: 1000,
       
      },
      container: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 2000,
        position: 'relative',
      },
      leftContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        width: '60%',
      },
      userInfo: {
        width: '100%',
        marginLeft: 5,
        flex: 1,
      },
      greeting: {
        width: '100%',
        fontSize: width * 0.043,
        fontWeight: 'bold',
        color: '#FFFFFF',
        flexWrap: 'wrap',
        numberOfLines: 1,
        ellipsizeMode: 'tail',
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
        width: 50,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 50,
        gap: 3,
      },
      rachaText: {
        fontSize: width * 0.05,
        fontWeight: 'bold',
        color: 'white',
      },
      modalInsigniaContent: {
        
        padding: 20,
        borderRadius: 20,
      },
      modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        gap: 5,
        
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFD700',
        textAlign: 'center',
    },
    modalDescription: {
      
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
        lineHeight: 24,
        textAlign: 'center',
        marginTop: 5,
    },
    
    rachaIconsContainer: {
        position: 'relative',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
        justifyContent: 'flex-end',
       // minWidth: '40%',
        zIndex: 1,
        marginTop: 15,
    },
    recuperarRachaButton: {
      marginLeft: 5,
    },
    recuperarRachaGradient: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 5,
      paddingHorizontal: 5,
      borderRadius: 20,
      gap: 2,
    },
    recuperarRachaText: {
      color: 'white',
      fontSize: width * 0.02,
      fontWeight: 'bold',
    },
    tiendaButton: {
       // marginRight: 5,
    },
    
    tiendaGradient: {
        width: 50,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 50,
        gap: 5,
    },
    tiendaText: {
        color: 'white',
        fontSize: 14,
        fontWeight: 'bold',
    },
   
    crownContainer: {
       width: width * 0.065,
       height: width * 0.06,
       alignItems: 'center',
       justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.7)',
        borderRadius: 15,
        padding: 5,
        borderWidth: 2,
        borderColor: '#FFD700',
       // zIndex: 1000,
    },
    crownIcon: {
        zIndex: 1000,
    },

    


})