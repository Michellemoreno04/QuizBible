import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Image, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform, 
  ActivityIndicator,
  Alert,
  StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { Audio } from 'expo-av';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from '../../components/firebase/firebaseConfig';
import { Avatar } from '@rneui/base'
import  useAuth  from '../../components/authContext/authContext';
import { db } from '../../components/firebase/firebaseConfig';
import { doc, onSnapshot, getDoc, updateDoc, increment } from 'firebase/firestore';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';
import { useNavigation } from '@react-navigation/native';


// Inicializar Firebase Functions
const functions = getFunctions(app);

const mensajesPredefinidos = [
  "¿Qué dice la Biblia sobre el amor?",
  "¿Cómo puedo fortalecer mi fe?",
  "¿Cuál es el primer mandamiento?",
  "¿Qué dice la Biblia sobre el perdón?",
];

const MensajePredefinido = ({ mensaje, onPress }) => (
  <TouchableOpacity 
    style={styles.mensajePredefinido} 
    onPress={() => onPress(mensaje)}
  >
    <Text style={styles.mensajePredefinidoText}>{mensaje}</Text>
  </TouchableOpacity>
);

const LambChat = () => {
  const [userInfo, setUserInfo] = useState({});
  const [messages, setMessages] = useState([]);
  const [hasShownWelcome, setHasShownWelcome] = useState(false);
  const navigation = useNavigation();
  const { user } = useAuth();
  const userId = user?.uid;
  const scrollViewRef = useRef(null);

  // Efecto para mostrar el mensaje de bienvenida solo una vez
  useEffect(() => {
    if (!hasShownWelcome) {
      setMessages([{
        id: '1',
        text: "¡Hola! Soy Nilu, tu corderito guia!",
        user: 'ai',
        createdAt: new Date(),
        image: require('../../assets/images/cordero_saludando.png')
      }]);
      setHasShownWelcome(true);
    }
  }, [hasShownWelcome]);

  // Efecto para hacer scroll automático cuando los mensajes cambien
  useEffect(() => {
    if (scrollViewRef.current && messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const [dailyMessageCount, setDailyMessageCount] = useState(0);
  const [isPremium, setIsPremium] = useState(false);

  // Obtener información del usuario
  useEffect(() => {
    if (!userId) return;

    const userRef = doc(db, 'users', userId);
    const unsubscribe = onSnapshot(userRef, (snapshot) => {
      const userData = snapshot.data() || {};
      if (userData) {
        setUserInfo(userData);
        setIsPremium(userInfo?.Premium || false);
        setDailyMessageCount(userData.dailyMessageCount || 0);
      }
    });
    return () => unsubscribe();
  }, [userId]);

  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const playSound = async (sound) => {
    const { sound: audioSound } = await Audio.Sound.createAsync(
      sound === 'user' 
        ? require('../../assets/sound/mensaje-usuario.mp3')
        : require('../../assets/sound/mensaje-cordero.mp3')
    );
    await audioSound.playAsync();
  };

  // Agregar función para verificar y actualizar el contador diario
  const checkAndUpdateMessageCount = async () => {
    if (!userId) return false;

    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    const userData = userDoc.data();
    
    const today = new Date().toDateString();
    const lastMessageDate = userData.lastMessageDate;
    
    // Reiniciar contador si es un nuevo día
    if (lastMessageDate !== today) {
      await updateDoc(userRef, {
        dailyMessageCount: 0,
        lastMessageDate: today
      });
      return true;
    }
    
    // Verificar límite para usuarios premium y no premium
    const messageLimit = userData.Premium ? 70 : 5;
    if (userData.dailyMessageCount >= messageLimit) {
      const message = userData.Premium 
        ? "Has alcanzado el límite diario de mensajes . Por favor, regresa mañana."
        : "Has alcanzado el límite diario de mensajes. ¡Actualiza a premium para más mensajes o regresa mañana!";
      
      const buttons = userData.Premium 
        ? [{ text: "OK", style: "cancel" }]
        : [
            { text: "OK", style: "cancel" },
            { 
              text: "Obtener Premium", 
              onPress: () => {
                navigation.navigate('paywallScreen');
              }
            }
          ];

      Alert.alert(
        "Límite de mensajes alcanzado",
        message,
        buttons
      );
      return false;
    }
    
    return true;
  };

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const canSendMessage = await checkAndUpdateMessageCount();
    if (!canSendMessage) return;

    const userMessage = {
      id: Date.now().toString(),
      text: inputText,
      user: 'user',
      createdAt: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    await playSound('user');

    // Actualizar el contador de mensajes
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      dailyMessageCount: increment(1)
    });

    setIsLoading(true);
    try {
      // Convertir los mensajes anteriores al formato requerido por la API
      const mensajesAnteriores = messages.map(msg => ({
        role: msg.user === 'user' ? 'user' : 'assistant',
        content: msg.text
      }));

      const responderPreguntas = httpsCallable(functions, 'responderPreguntas');
      const result = await responderPreguntas({ 
        pregunta: inputText,
        mensajesAnteriores: mensajesAnteriores
      });
      
      
      const aiMessage = {
        id: (Date.now() + 1).toString(),
        text: result.data.respuesta,
        user: 'ai',
        createdAt: new Date(),
        image: require('../../assets/images/cordero_saludando.png')
      };
    
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error al obtener respuesta:', error);
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        text: "Lo siento, hubo un error al procesar tu pregunta. Por favor, intenta de nuevo.",
        user: 'ai',
        createdAt: new Date(),
        image: require('../../assets/images/cordero_saludando.png')
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      await playSound('ai');
    }
  };

  const handleMensajePredefinido = (mensaje) => {
    setInputText(mensaje);
  };

  const renderMessage = ({ item, index }) => (
    <Animatable.View 
      animation="fadeInUp"
      duration={800}
      style={[
        styles.messageContainer,
        item.user === 'user' ? styles.userMessage : styles.aiMessage,
        index === 0 && styles.firstMessageContainer
      ]}
    >
      {item.user === 'ai' && (
        <Image
          source={item.image}
          style={index === 0 ? styles.firstMessageAvatar : styles.avatar}
        />
      )}
      
      {item.user === 'user' && (
        <Avatar
          size={32}
          rounded
          source={userInfo.FotoPerfil ? { uri: userInfo.FotoPerfil } : require('../../assets/images/cordero_saludando.png')}
        />
      )}
      <View style={[
        styles.messageContent,
        index === 0 && styles.firstMessageContent
      ]}>
        <Text style={[
          item.user === 'user' ? styles.userText : styles.aiText,
          index === 0 && styles.firstMessageText
        ]}>
          {item.text}
        </Text>
      </View>
    </Animatable.View>
  );

  
  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.mainContainer, { backgroundColor: Colors.bgApp[0] }]}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <StatusBar barStyle="light-content" backgroundColor={Colors.bgApp[0]} />
      <LinearGradient
        colors={Colors.bgApp}
        style={styles.gradientContainer}
      >
        <ScrollView 
          ref={scrollViewRef}
          style={styles.messagesScrollView}
          contentContainerStyle={styles.messagesScrollContent}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map((item, index) => (
            <View key={item.id}>
              {renderMessage({ item, index })}
            </View>
          ))}
          
          {isLoading && (
            <Animatable.View 
              animation="pulse" 
              iterationCount="infinite"
              style={[styles.loadingContainer, styles.aiMessage]}
            >
              <Image
                source={require('../../assets/images/cordero_saludando.png')}
                style={styles.loadingAvatar}
              />
              <ActivityIndicator size="small" color="#6C63FF" />
            </Animatable.View>
          )}

          {messages.length === 1 && (
            <View style={styles.mensajesPredefinidosContainer}>
              <Text style={styles.mensajesPredefinidosTitulo}>
                ¿Qué te gustaría saber sobre la Biblia?
              </Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.mensajesPredefinidosScroll}
              >
                <View style={styles.mensajesPredefinidosGrid}>
                  {mensajesPredefinidos.map((mensaje, index) => (
                    <MensajePredefinido
                      key={index}
                      mensaje={mensaje}
                      onPress={handleMensajePredefinido}
                    />
                  ))}
                </View>
              </ScrollView>
            </View>
          )}
        </ScrollView>
      </LinearGradient>

      <LinearGradient
        colors={['#3C6E9F','#3C6E9F']}
        style={styles.inputContainer}
      >
        <TextInput
          value={inputText}
          onChangeText={setInputText}
          placeholder="Habla con Nilu..."
          placeholderTextColor="#fff"
          style={styles.input}
          multiline
        />
        
        <TouchableOpacity 
          onPress={handleSend}
          style={styles.sendButton}
          disabled={isLoading}
        >
          <Ionicons 
            name="send" 
            size={24} 
            color="white" 
            style={styles.sendIcon} 
          />
        </TouchableOpacity>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
   // backgroundColor: Colors.bgApp[0],
  },
  gradientContainer: {
    flex: 1,
    //backgroundColor: Colors.bgApp[0],
    backgroundColor: 'red',
  },
  messagesScrollView: {
    flex: 1,
    backgroundColor: Colors.bgApp[1],
    //backgroundColor: 'red',
  },
  messagesScrollContent: {
    flexGrow: 1,
    paddingBottom: 16,
    //backgroundColor: Colors.bgApp[0],
    
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 0.2,
    borderTopColor: 'rgba(7, 2, 14, 0.9)',
    backgroundColor: '#3C6E9F',
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginVertical: 8,
    maxWidth: '80%'
  },
  aiMessage: {
    alignSelf: 'flex-start'
  },
  userMessage: {
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse'
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 20,
    marginRight: 8,
    transform: [{ scaleX: -1 }] // Invertir la imagen
  },
  messageContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    
  },
  userText: {
    color: '#333',
    fontSize: 16
  },
  aiText: {
    color: '#444',
    fontSize: 16,
    fontStyle: 'italic'
  },
  lambImage: {
    width: 200,
    height: 200,
    borderRadius: 12
  },
  input: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#fff',
  },
  sendButton: {
    backgroundColor: '#6C63FF',
    borderRadius: 24,
    padding: 12,
    marginLeft: 8
  },
  sendIcon: {
    transform: [{ rotate: '-30deg' }]
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 20,
    marginTop: 8,
    maxWidth: '80%',
    alignSelf: 'flex-start',
    marginLeft: 8,
  },
  loadingAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 12
  },
  firstMessageContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    alignSelf: 'center',
    maxWidth: '100%',
    marginBottom: 5,
    paddingTop: 10,
    backgroundColor: '#1a365d',
    borderRadius: 50,
   
    padding: 10,
   //marginHorizontal: 5
  },
  firstMessageAvatar: {
    width: 120,
    height: 120,
    borderRadius: 50,
  
  },
  firstMessageContent: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a365d'
  },
  firstMessageText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 24,
  },
  mensajesPredefinidosContainer: {
    marginTop: 5,
  width: '100%',
  alignItems: 'center',
  justifyContent: 'center',
  
   // paddingHorizontal: 16,
  },
  mensajesPredefinidosTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 12,
    textAlign: 'center',
  },
  mensajesPredefinidosScroll: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
   
    paddingBottom: 16,
  },
  mensajesPredefinidosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    
   // width: 400, // Ancho fijo para permitir el scroll horizontal
  },
  mensajePredefinido: {
    width: '45%',
    backgroundColor: 'white',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#3C6E9F',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  mensajePredefinidoText: {
    color: '#3C6E9F',
    fontSize: 12,
    textAlign: 'center',
  },
});

export default LambChat;