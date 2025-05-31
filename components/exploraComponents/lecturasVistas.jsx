import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, Modal, StyleSheet, Button, Share, TextInput, ScrollView, Dimensions, Platform, ActivityIndicator } from 'react-native';
import useAuth from '../../components/authContext/authContext';
import { doc, collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

const { width, height } = Dimensions.get('screen');

export default function Lecturas() {
  const { user } = useAuth();
  const [temas, setTemas] = useState([]);
  const [filteredLecturas, setFilteredLecturas] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTema, setSelectedTema] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const userId = user?.uid;

  // Cargar y filtrar lecturas
  const loadLecturas = useCallback(async () => {
    if (!userId) return;

    try {
      const userRef = doc(db, 'users', userId);
      const subCollectionRef = collection(userRef, 'lecturasVistas');
      
      const q = query(subCollectionRef, orderBy('fechaStr', 'desc'));
      const querySnapshot = await getDocs(q);

      const temasData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        fecha: doc.data().fechaStr ? new Date(doc.data().fechaStr) : new Date()
      })).sort((a, b) => b.fecha - a.fecha);
     
      setTemas(temasData);
      setFilteredLecturas(temasData);
    } catch (error) {
      console.error('Error cargando lecturas:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  
  // Filtrar lecturas según el texto de búsqueda
  useEffect(() => {
    if (searchQuery === '') {
      setFilteredLecturas(temas);
    } else {
      const filtered = temas.filter(tema =>
        tema.titulo?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredLecturas(filtered);
    }
  }, [searchQuery, temas]);

  useEffect(() => {
    loadLecturas();
  }, [loadLecturas]);

  // Manejar búsqueda
  const handleSearch = (text) => {
    setSearchQuery(text);
  };

  // Resto de funciones igual que antes...
  const handleTemaPress = (tema) => {
    setSelectedTema(tema);
    setIsModalVisible(true);
  };

  const handleShare = async () => {
    try {
      const titulo = selectedTema?.titulo || 'Lectura diaria';
      const appStoreLink = 'https://apps.apple.com/do/app/quizbible/id6745747418?|=en-GB';
      const playStoreLink = 'https://play.google.com/store/apps/details?id=com.moreno.dev.QuizBible';
      await Share.share({
        message: `📖 *${titulo}*\n\n${selectedTema.texto} \n\n ${'Aprende sobre la palabra de Dios en esta App:'} \n\n📱 Descarga QuizBible:\n🍎 iOS: ${appStoreLink}\n\n🤖 Android: ${playStoreLink}`,
         });
    } catch (error) {
      console.error('Error compartiendo:', error);
    }
  };



  const closeModal = () => {
    setIsModalVisible(false);
    setSelectedTema(null);
  };



  // Renderizar cada item de la lista
  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.itemContainer}
      onPress={() => handleTemaPress(item)}
    >
      <Text style={styles.itemTitle}>{item.titulo || 'Lectura diaria'}</Text>
      <Text style={styles.itemDate}>
        {item.fechaStr}
        
      </Text>
    
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <TextInput
        style={styles.searchInput}
        placeholder="Buscar lecturas por título..."
        value={searchQuery}
        onChangeText={handleSearch}
        placeholderTextColor="#666"
      />
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      ) : (
      
      <FlatList
        data={filteredLecturas}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        initialNumToRender={10}
        maxToRenderPerBatch={5}
        windowSize={5}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No se encontraron lecturas</Text>
          </View>
        }
      />
      )}

      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
        <ScrollView style={{height: '100%'}} >
            {selectedTema && (
              <>
                <Text style={styles.modalTitle}>{selectedTema.titulo || '...'}</Text>
                <Text style={styles.modalText}>{selectedTema.texto}</Text>
                
                <View style={styles.buttonContainer}>
                  <Button
                    title="Compartir"
                    onPress={handleShare}
                    color="#2196F3"
                  />
                </View>

                <Button
                  title="Cerrar"
                  onPress={closeModal}
                  color="#FF5722"
                />
              </>
            )}
        </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  
  searchInput: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    fontSize: 16,
    elevation: 2
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50
  },
  emptyText: {
    fontSize: 16,
    color: '#666'
  },
  container: {
    width: '100%',
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 10
  },
  itemContainer: {
    backgroundColor: 'white',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    elevation: 2
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333'
  },
  itemDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 5
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)'
  },
  modalContent: {
    width: width * 0.9,
    height: height * 0.8,
    backgroundColor: 'white',
    margin: 20,
    padding: 20,
    borderRadius: 10
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center'
    
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15
  }
});