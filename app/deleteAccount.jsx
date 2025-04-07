import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import useAuth from '../components/authContext/authContext';
import { deleteUser, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { doc, deleteDoc } from 'firebase/firestore';
import { db } from '../components/firebase/firebaseConfig';

const DeleteAccount = () => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const { user, signOut } = useAuth();

  const handleDeleteAccount = async () => {
    if (!password) {
      Alert.alert('Error', 'Por favor, ingresa tu contraseña para confirmar.');
      return;
    }

    Alert.alert(
      'Confirmar eliminación',
      '¿Estás seguro que deseas eliminar tu cuenta? Esta acción no se puede deshacer.',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              
              // Reautenticar al usuario
              const credential = EmailAuthProvider.credential(user.email, password);
              await reauthenticateWithCredential(user, credential);

              // Eliminar datos del usuario en Firestore
              await deleteDoc(doc(db, 'users', user.uid));

              // Eliminar la cuenta de autenticación
              await deleteUser(user);

              // Redirigir al usuario a la pantalla de registro
              navigation.replace('signUpScreen');
            } catch (error) {
              console.error('Error al eliminar la cuenta:', error);
              let errorMessage = 'Ocurrió un error al eliminar la cuenta.';
              
              if (error.code === 'auth/wrong-password') {
                errorMessage = 'La contraseña es incorrecta.';
              }
              
              Alert.alert('Error', errorMessage);
            } finally {
              setLoading(false);
            }
          },
        },
      ],
    );
  };

  return (
    <LinearGradient colors={['#1E3A5F', '#3C6E9F']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.title}>Eliminar Cuenta</Text>
        </View>

        <View style={styles.content}>
          <Text style={styles.warningText}>
            ⚠️ Esta acción eliminará permanentemente tu cuenta y todos tus datos asociados.
          </Text>

          <Text style={styles.description}>
            Por favor, ingresa tu contraseña para confirmar la eliminación de tu cuenta:
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Contraseña"
            placeholderTextColor="#999"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDeleteAccount}
            disabled={loading}
          >
            <Text style={styles.deleteButtonText}>
              {loading ? 'Eliminando...' : 'Eliminar mi cuenta'}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  content: {
    padding: 20,
  },
  warningText: {
    fontSize: 16,
    color: '#FFA500',
    marginBottom: 20,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: 'white',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    fontSize: 16,
  },
  deleteButton: {
    backgroundColor: '#dc2626',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default DeleteAccount; 