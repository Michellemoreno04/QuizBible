import React, { useState } from 'react'
import { View, Text, TextInput, Pressable, Alert, StyleSheet } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { auth } from '../components/firebase/firebaseConfig'
import { sendPasswordResetEmail } from 'firebase/auth'
import { useRouter } from 'expo-router'
import { MaterialIcons } from '@expo/vector-icons'

const ResetPassword = () => {
  const [email, setEmail] = useState('')
  const router = useRouter()

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert('Error', 'Por favor ingresa tu correo electrónico')
      return
    }

    try {
      await sendPasswordResetEmail(auth, email)
      Alert.alert(
        'Correo enviado',
        'Revisa tu bandeja de  o tu correo no deseado (spam) para restablecer tu contraseña',
        [{ text: 'OK', onPress: () => router.push('/login') }]
      )
    } catch (error) {
      handleFirebaseError(error)
    }
  }

  const handleFirebaseError = (error) => {
    let errorMessage = "Ocurrió un error. Por favor, inténtalo de nuevo."
    
    switch (error.code) {
      case 'auth/invalid-email':
        errorMessage = 'El formato del correo electrónico es inválido'
        break
      case 'auth/user-not-found':
        errorMessage = 'No existe una cuenta con este correo electrónico'
        break
      case 'auth/too-many-requests':
        errorMessage = 'Demasiados intentos. Intenta nuevamente más tarde'
        break
    }
    
    Alert.alert('Error', errorMessage)
  }

  return (
    <LinearGradient
      colors={['#1D2671', '#C33764']}
      style={styles.gradient}
    >
      <View style={styles.container}>
        <Text style={styles.title}>Recuperar Contraseña</Text>
        
        <View style={styles.inputContainer}>
          <MaterialIcons 
            name="email" 
            size={24} 
            color="#FFF" 
            style={styles.icon} 
          />
          <TextInput
            placeholder="Ingresa tu correo electrónico"
            placeholderTextColor="rgba(255,255,255,0.7)"
            style={styles.input}
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <Pressable
          style={styles.button}
          onPress={handleResetPassword}
        >
          <Text style={styles.buttonText}>Enviar enlace de recuperación</Text>
        </Pressable>

        <Pressable
          style={styles.backLink}
          onPress={() => router.push('/login')}
        >
          <Text style={styles.backText}>Volver al Login</Text>
        </Pressable>
      </View>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 32
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 40,
    textAlign: 'center'
  },
  inputContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20
  },
  input: {
    flex: 1,
    color: 'white',
    fontSize: 16
  },
  icon: {
    marginRight: 10
  },
  button: {
    backgroundColor: '#f59e0b',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 20
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600'
  },
  backLink: {
    marginTop: 30,
    alignSelf: 'center'
  },
  backText: {
    color: '#fbbf24',
    fontSize: 16,
    textDecorationLine: 'underline'
  }
})

export default ResetPassword