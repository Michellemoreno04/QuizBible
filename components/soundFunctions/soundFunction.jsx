import { useState, useEffect } from 'react';
import { Audio } from 'expo-av';

export function useSound() {
  const [sound, setSound] = useState();

  // Función para cargar y reproducir sonido
  const playSound = async (audioFile) => {
    try {
      console.log('Loading Sound');
      const { sound } = await Audio.Sound.createAsync(audioFile);
      setSound(sound);

     // console.log('Playing Sound');
      await sound.playAsync();
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  };

  // Cleanup al desmontar
  useEffect(() => {
    return sound
      ? () => {
         // console.log('Unloading Sound');
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  return playSound;
}


// Hook para manejar música de fondo
export function useBackgroundMusic() {
  const [music, setMusic] = useState();
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const startMusic = async (audioFile) => {
    try {
      if (music) {
        // Si ya existe una instancia de música, primero la limpiamos
        await stopMusic();
      }
      
      const { sound } = await Audio.Sound.createAsync(audioFile, {
        shouldPlay: true,
        isLooping: true,
        volume: isMuted ? 0 : 1,
      });
      
      setMusic(sound);
      setIsPlaying(true);
    } catch (error) {
      console.error('Error al iniciar la música:', error);
    }
  };

  const stopMusic = async () => {
    try {
      if (music && isPlaying) {
        // Verificar si el sonido está cargado antes de intentar detenerlo
        const status = await music.getStatusAsync();
        if (status.isLoaded) {
          await music.stopAsync();
          await music.unloadAsync();
        }
        setMusic(null);
        setIsPlaying(false);
      }
    } catch (error) {
      console.error('Error al detener la música:', error);
      // En caso de error, asegurarse de resetear el estado
      setMusic(null);
      setIsPlaying(false);
    }
  };

  const toggleMute = async () => {
    if (music) {
      try {
        const newMuteState = !isMuted;
        await music.setVolumeAsync(newMuteState ? 0 : 1);
        setIsMuted(newMuteState);
      } catch (error) {
        console.error('Error al cambiar el volumen:', error);
      }
    }
  };

  // Limpieza al desmontar el componente
  useEffect(() => {
    return () => {
      if (music) {
        stopMusic();
      }
    };
  }, []);

  return { startMusic, stopMusic, toggleMute, isMuted, isPlaying };
}