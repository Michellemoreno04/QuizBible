import React, { useEffect, useState, useRef } from 'react';
import { View, Text, FlatList, ImageBackground, Pressable, StyleSheet, Alert, Modal, ActivityIndicator, Dimensions, ScrollView, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, Ionicons, Feather } from '@expo/vector-icons';
import { db, storage } from '../components/firebase/firebaseConfig';
import { collection, query, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { deleteObject, ref as storageRef } from 'firebase/storage';
import useAuth from '../components/authContext/authContext';
import { useToast } from 'react-native-toast-notifications';
import Share from 'react-native-share';
import { captureRef } from 'react-native-view-shot';
const { width, height } = Dimensions.get('screen');

const VersiculosFavoritos = () => {
  const { user } = useAuth();
  const [versiculos, setVersiculos] = useState({});
  const [selectedVerse, setSelectedVerse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hideButtons, setHideButtons] = useState(false);
  const viewRef = useRef();
  const toast = useToast();


  // Función para obtener los versículos favoritos
  useEffect(() => {
    if (!user?.uid) return;

    const q = query(
      collection(db, `users/${user.uid}/versiculosFavoritos`),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setVersiculos(data);
    });

    return unsubscribe;
  }, [user?.uid]);

  

  const handleDelete = async (item) => {
    Alert.alert(
      'Eliminar Versículo',
      '¿Estás seguro de querer eliminar este versículo?',
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
             
              await deleteDoc(doc(db, `users/${user.uid}/versiculosFavoritos/${item.id}`));
              const imageRef = storageRef(storage, item.imageUrl);
              await deleteObject(imageRef);
              toast.show('Versículo eliminado', { type: 'danger' });
              setSelectedVerse(null);
            } catch (error) {
              console.error('Error eliminando:', error);
              toast.show('Error al eliminar', { type: 'danger' });
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleShare = async (imageUrl) => {
    try {
      setHideButtons(true);
      toast.show("⭐ Preparando para compartir...", {
        type: "success",
        placement: "top",
      });
      
      // Esperamos un momento para asegurar que la imagen esté cargada
      await new Promise(resolve => setTimeout(resolve, 500));

      const uri = await captureRef(viewRef.current, {
        format: "png",
        quality: 0.9,
      });

      // Solo activamos loading después de capturar la imagen
      setLoading(true);

      const appLink = 'https://play.google.com/store/apps/details?id=com.moreno.dev.QuizBible';
      const shareOptions = {
        title: 'Compartir versículo',
        url: uri,
        message: `${selectedVerse?.versiculo}\n\nDescarga esta app para estudiar la Biblia en el siguiente enlace: ${appLink}`,
        social: Share.Social.WHATSAPP,
      };

      await Share.open(shareOptions);
    } catch (error) {
      console.log('Error al compartir:', error);
      toast.show('Error al compartir', { type: 'danger' });
    } finally {
      setHideButtons(false);
      setLoading(false);
    }
  };
  
  const renderItem = ({ item }) => (
    <Pressable 
      style={({ pressed }) => [
        styles.cardContainer,
        { transform: [{ scale: pressed ? 0.96 : 1 }] }
      ]}
      onPress={() => setSelectedVerse(item)}
      android_ripple={{ color: 'rgba(255,255,255,0.1)', borderless: true }}
    >
      <ImageBackground
        source={{ uri: item.imageUrl }}
        style={styles.card}
        imageStyle={styles.cardImage}
      >
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.3)']}
          
        />
      </ImageBackground>
    </Pressable>
  );

  return (
  
    <LinearGradient
      colors={[ '#1E3A5F', '#3C6E9F']}
      style={styles.container}
    >

      <FlatList
        data={versiculos}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Feather name="image" size={60} color="rgba(255,255,255,0.3)" />
            <Text style={styles.emptyText}>Guarda tus versículos favoritos</Text>
            <Text style={styles.emptySubtext}>Tus versículos guardados aparecerán aquí</Text>
          </View>
        }
      />

<Modal
  visible={!!selectedVerse}
  transparent={true}
  animationType="fade"
  onRequestClose={() => setSelectedVerse(null)}
>
  <View style={styles.modalContainer}>
    {loading ? (
      <ActivityIndicator size="large" color="#FFF" />
    ) : (
      <>
        {/* Botón de cerrar fuera del viewRef */}
        <Pressable 
          style={styles.closeButton}
          onPress={() => setSelectedVerse(null)}
        >
          <Feather name="x" size={28} color="white" />
        </Pressable>

        {/* Contenedor de imagen solo para captura */}
        <View 
          ref={viewRef} 
          collapsable={false} 
          style={[styles.imageContainer, { backgroundColor: 'black' }]}
        >
          <Image
            source={{ uri: selectedVerse?.imageUrl }}
            style={styles.fullImage}
            resizeMode="stretch"
          />
        </View>

        {/* Botones de acciones fuera del viewRef */}
        {!hideButtons && (
          <View style={styles.modalActions}>
            <Pressable
              style={styles.modalActionButton}
              onPress={() => handleShare(selectedVerse?.imageUrl)}
            >
              <Ionicons name="share-social" size={26} color="white" />
              <Text style={styles.actionText}>Compartir</Text>
            </Pressable>
            
            <Pressable
              style={[styles.modalActionButton, { backgroundColor: 'rgba(255,77,77,0.3)' }]}
              onPress={() => handleDelete(selectedVerse)}
            >
              <MaterialIcons name="delete" size={26} color="#ff4d4d" />
              <Text style={[styles.actionText, { color: '#ff4d4d' }]}>Eliminar</Text>
            </Pressable>
          </View>
        )}
      </>
    )}
  </View>
</Modal>
    </LinearGradient>
          
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  
  listContainer: {
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  cardContainer: {
    width: (width - 40) / 2,
    height: (width - 40) / 2,
    margin:6,
   
   
   
  },
  card: {
    width: (width - 40) / 2,
    height: (width - 40) / 2,
  
    
  },
  cardImage: {
    borderRadius: 16,
    resizeMode:'stretch',
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '50%',
  
  },
  emptyText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 18,
    marginTop: 20,
    textAlign: 'center',
    fontFamily: 'Inter-SemiBold',
  },
  emptySubtext: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.95)',
  },
  imageContainer: {
    position:'relative',
  
    borderRadius: 5,
    overflow: 'hidden',
   
  },
  
  fullImage: {
    width: '100%',
    height: 300,
  },
  modalActions: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
  },
  modalActionButton: {
    alignItems: 'center',
    padding: 15,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.15)',
    width: width * 0.35,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  actionText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 25,
    zIndex: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    padding: 10,
  },
});

export default VersiculosFavoritos;