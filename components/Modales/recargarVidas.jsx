import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export const NotVidasModal = ({ visible,setVisible }) => {
  
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={() => setVisible(false)}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.emoji}>🎉</Text>
          <Text style={styles.title}>¡Vidas Recargadas!</Text>
          <Text style={styles.subtitle}>¡Nuevos días, nuevos retos!</Text>
          
          <View style={styles.lifeContainer}>
            <Text style={styles.lifeText}>2 {'\u2764'}</Text>
            <Text >Has obtenido 2 vidas mas para continuar aprendiendo!</Text>
          
          </View>

          <Text style={styles.message}>
            Tus vidas se han restablecido al máximo para que puedas seguir jugando
          </Text>

          <TouchableOpacity 
            style={styles.button}
            onPress={() => setVisible(false)}
          >
            <Text style={styles.buttonText}>¡Continuar!</Text>
          
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)'
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2ecc71',
    marginBottom: 5,
    textAlign: 'center'
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 20,
    textAlign: 'center'
  },
  emoji: {
    fontSize: 50,
    marginBottom: 15
  },
  lifeContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: 20
  },
  lifeText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#e74c3c',
    marginRight: 10
  },
  heartIcon: {
    width: 40,
    height: 40,
    resizeMode: 'contain'
  },
  message: {
    fontSize: 16,
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 22
  },
  button: {
    backgroundColor: '#2ecc71',
    borderRadius: 15,
    paddingVertical: 12,
    paddingHorizontal: 35,
    elevation: 2
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16
  }
});