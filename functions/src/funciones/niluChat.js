const {onCall} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const OpenAI = require('openai');
//const admin = require('./config/firebase');

// Inicializar Firebase Admin
//admin.initializeApp();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Nueva función para generar audio
async function generarAudio(texto) {
  try {
    const mp3 = await openai.audio.speech.create({
      model: "tts-1",
      voice: "alloy",
      input: texto,
    });

    const buffer = Buffer.from(await mp3.arrayBuffer());
    return buffer.toString('base64');
  } catch (error) {
    logger.error('Error al generar audio:', error);
    throw new Error('Error al generar audio: ' + error.message);
  }
}

exports.responderPreguntas = onCall({
  timeoutSeconds: 60, 
  memory: '256MiB' 
}, async (request) => {
  try {
    const { pregunta, mensajesAnteriores, generarVoz } = request.data;
    
    if (!pregunta) {
      throw new Error('La pregunta es requerida');
    }

    logger.info('Procesando pregunta:', pregunta);
    
    // Crear el array de mensajes con el historial proporcionado
    const messages = [
      {
        role: "system",
        content: "Eres Nilu, un cordero digital amigable que responde preguntas sobre la Biblia porque eres creyente en Dios. Tus respuestas deben ser claras y basadas en principios bíblicos y mostrando los versiculos de referencia de la biblia cuando sea necesario."
      },
      ...mensajesAnteriores,
      {
        role: "user",
        content: pregunta
      }
    ];
    
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: messages,
      max_tokens: 500, 
      temperature: 0.7
    });

    logger.info('Respuesta generada exitosamente');
    
    const respuesta = completion.choices[0].message.content;
    
    let audioBase64 = null;
    if (generarVoz) {
      audioBase64 = await generarAudio(respuesta);
    }

    return {
      respuesta: respuesta,
      audio: audioBase64
    };
  } catch (error) {
    logger.error('Error en responderPreguntas:', error);
    throw new Error('Error al procesar la pregunta: ' + error.message);
  }
});
