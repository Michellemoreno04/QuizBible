import React from 'react';
import { StyleSheet, TouchableOpacity, Text, Linking, Alert, View, SafeAreaView, Platform, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export const SupportContact = () => {

  const handleSupportPress = async () => {
    try {
      const email = 'morenov.dev@gmail.com';
      const baseUrl = `mailto:${email}`;
      const params = {
        subject: 'Solicitud de Soporte - QuizBible',
        body: 'Hola equipo de soporte,\n\nNecesito ayuda con:\n\n',
      };
      
      const query = Object.entries(params)
        .map(([key, val]) => `${key}=${encodeURIComponent(val)}`)
        .join('&');
      
      const finalUrl = `${baseUrl}?${query}`;
      
      await Linking.openURL(finalUrl);
      
    } catch (error) {
      Alert.alert(
        'Error de comunicación',
        'Selecciona un cliente de correo:',
        [
          {text: 'Gmail', onPress: () => Linking.openURL('googlegmail://')},
          
          {text: 'Cancelar'},
        ]
      );
    }
  };

  return (
    <SafeAreaView style={Platform.OS === 'android' ? { paddingTop: StatusBar.currentHeight } : {}}>
    <View style={styles.container}>
      <Ionicons name="headset-outline" size={50} color="#2F80ED" style={styles.icon} />
      
      <Text style={styles.title}>¿Necesitas ayuda?</Text>
      
      <Text style={styles.description}>
        Nuestro equipo de soporte está listo para asistirte. Si tienes:
        {"\n\n"}
        • Problemas técnicos
        {"\n"}
        • Preguntas sobre funciones
        {"\n"}
        • Sugerencias para mejorar
        {"\n\n"}
        Escríbenos directamente y te responderemos en menos de 24 horas.
      </Text>

      <TouchableOpacity
        style={styles.button}
        onPress={handleSupportPress}
      >
        <Ionicons name="mail-outline" size={20} color="white" />
        <Text style={styles.buttonText}>morenov.dev@gmail.com</Text>
      </TouchableOpacity>

      {/*<Text style={styles.footerText}>
        También puedes visitar nuestra sección de Preguntas Frecuentes
      </Text>*/}
    </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F8FBFF',
    borderRadius: 20,
    padding: 25,
    margin: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  icon: {
    alignSelf: 'center',
    marginBottom: 15,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2D3436',
    textAlign: 'center',
    marginBottom: 15,
  },
  description: {
    fontSize: 16,
    color: '#636E72',
    lineHeight: 24,
    marginBottom: 25,
  },
  button: {
    backgroundColor: '#2F80ED',
    padding: 15,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    marginBottom: 20,
  },
  buttonText: {
    textAlign: 'center',
    
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  footerText: {
    textAlign: 'center',
    color: '#636E72',
    fontSize: 14,
    fontStyle: 'italic',
  },
});

export default SupportContact;
