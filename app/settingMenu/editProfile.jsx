import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  Pressable, 
  StyleSheet, 
  Alert,
  Image,
  ScrollView, 
  Linking
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { AntDesign } from '@expo/vector-icons';
import { Avatar } from '@rneui/themed';
import { updateDoc, doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/components/firebase/firebaseConfig';
import useAuth from '@/components/authContext/authContext';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from 'expo-router';
import { useToast } from 'react-native-toast-notifications';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const EditProfileScreen = () => {
  const navigation = useNavigation();  
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    Name: '',
    Apodo: '',
    Description: '',
    FotoPerfil: ''
  });
  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [imageToUpload, setImageToUpload] = useState(null);

  const toast = useToast();

  // Cargar datos actuales del usuario
  useEffect(() => {
    if (user) {
      const userRef = doc(db, 'users', user.uid);
      const unsubscribe = onSnapshot(userRef, (docSnapshot) => {
        const data = docSnapshot.data();
        setFormData(data);
        setPreviewImage(data?.FotoPerfil);
      });
      return () => unsubscribe();
    }
  }, [user]);

  const handleUpdate = async () => {
    try {
      setLoading(true);
      const userRef = doc(db, 'users', user.uid);

      // Si hay una nueva imagen para subir
      if (imageToUpload) {
        const storage = getStorage();
        const filename = `profile_${user.uid}_${Date.now()}.png`;
        const imageRef = ref(storage, `users/${user.uid}/profile/${filename}`);

        // Convertir URI a blob
        const response = await fetch(imageToUpload);
        const blob = await response.blob();

        // Subir a Firebase Storage
        await uploadBytes(imageRef, blob);

        // Obtener URL de descarga
        const downloadURL = await getDownloadURL(imageRef);

        // Actualizar datos incluyendo la nueva URL de la imagen
        await updateDoc(userRef, {
          ...formData,
          FotoPerfil: downloadURL
        });
      } else {
        // Actualizar solo los datos sin la imagen
        await updateDoc(userRef, formData);
      }

      toast.show('Perfil actualizado', { type: 'success' });
      navigation.goBack();
    } catch (error) {
      console.error("Error actualizando perfil:", error);
      toast.show('Error al actualizar el perfil', { type: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  // Función para actualizar la imagen de preview
  const updatePreviewImage = async (uri) => {
    setPreviewImage(uri);
    setImageToUpload(uri);
  };

  // Función que muestra el Alert para elegir entre cámara o galería
  const handleImageSelection = async () => {
    Alert.alert(
      "Actualizar foto de perfil",
      "Selecciona una opción",
      [
        {
          text: "Tomar foto",
          onPress: async () => {
            const uri = await takePhoto();
            if (uri) updatePreviewImage(uri);
          }
        },
        {
          text: "Elegir de la galería",
          onPress: async () => {
            const uri = await pickImage();
            if (uri) updatePreviewImage(uri);
          }
        },
        { text: "Cancelar", style: "cancel" }
      ]
    );
  };

  // Función para eliminar la imagen
  const removeImage = async () => {
    setPreviewImage(null);
    setImageToUpload(null);
    setFormData(prev => ({ ...prev, FotoPerfil: '' }));
  };

  // En la función pickImage, se reemplaza el valor de mediaTypes por mediaTypeImages
  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso requerido', 'Se necesita acceso a la galería para cambiar la foto');
        return null;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          aspect: [1, 1],
          quality: 1,
        }); 

      if (result.canceled) return null;
      return result.assets[0].uri;

    } catch (error) {
      console.log("Error al seleccionar imagen:", error);
      return null;
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso requerido', 'Se necesita acceso a la cámara');
        return null;
      }

       // 2. Abrir la cámara para tomar una foto
       const result = await ImagePicker.launchCameraAsync({
        // Se especifica que solo se desean imágenes
        mediaTypes: ['images'],
        // Permitir edición de la imagen después de capturarla
        allowsEditing: true,
        // Aspecto cuadrado [ancho, alto] para que la imagen se corte en 1:1
        aspect: [1, 1],
        // Calidad máxima de la imagen
        quality: 1,
      });

      if (result.canceled) return null;
      return result.assets[0].uri;

    } catch (error) {
      console.log("Error al tomar foto:", error);
      return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#6366f1', '#4338ca']}
        style={styles.gradientHeader}
      >
        <View style={styles.header}>
          <AntDesign 
            name="arrowleft" 
            size={24} 
            color="white" 
            onPress={() => navigation.goBack()} 
          />
          <Text style={styles.headerTitle}>Editar Perfil</Text>
          <Pressable onPress={handleUpdate} disabled={loading}>
            <Text style={styles.saveButton}>
              {loading ? 'Guardando...' : 'Guardar'}
            </Text>
          </Pressable>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content}>
        <Pressable onPress={handleImageSelection}>
          <View style={styles.avatarContainer}>
            {previewImage ? (
              <Avatar
                rounded
                source={{ uri: previewImage }}
                size="xlarge"
              />
            ) : (
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {formData.Name.toUpperCase().slice(0, 1)}
                </Text>
              </View>
            )}
            {previewImage && (
              <Pressable 
                style={styles.deleteButton} 
                onPress={removeImage}
              >
                <AntDesign name="closecircle" size={30} color="red" />
              </Pressable>
            )}
            <View style={styles.editIcon}>
              <AntDesign name="camera" size={20} color="white" />
            </View>
          </View>
        </Pressable>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Nombre Completo</Text>
          <TextInput
            style={styles.input}
            value={formData.Name}
            onChangeText={(text) => setFormData({...formData, Name: text})}
            placeholder="Ej: Juan Pérez"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Apodo</Text>
          <TextInput
            style={styles.input}
            value={formData.Apodo}
            onChangeText={(text) => setFormData({...formData, Apodo: text})}  
            placeholder="Ej: seguidor de la palabra"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Descripción</Text>
          <TextInput
            style={[styles.input, styles.descripcionInput]}
            value={formData.Description}
            onChangeText={(text) => setFormData({...formData, Description: text})}
            placeholder="Cuéntanos sobre ti..."
            multiline={true}
            numberOfLines={4} // Número inicial de líneas visibles
           
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  gradientHeader: {
    paddingVertical: 20,
    paddingHorizontal: 15,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: '600',
  },
  saveButton: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  content: {
  
    padding: 20,
    alignItems: 'center',
  },
 avatarContainer: {
  position: 'relative',
  marginBottom: 20,
  
},
deleteButton: {
  position: 'absolute',
  bottom: 5,
  left: 5,
  backgroundColor: 'white',
  borderRadius: 15,
  zIndex: 1,
  borderWidth: 2,
  borderColor: 'white',
},
  avatar: {
    width: 150,
    height: 150,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4f46e5',
  },
  avatarText: {
    color: 'white',
    fontSize: 50,
    fontWeight: '600',
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  editIcon: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: '#4f46e5',
    borderRadius: 15,
    padding: 5,
    borderWidth: 2,
    borderColor: 'white',
  },
  formGroup: {
    width: '100%',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: '#334155',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  descripcionInput: {
    height: 100,
    textAlignVertical: 'top',
  },
});

export default EditProfileScreen;