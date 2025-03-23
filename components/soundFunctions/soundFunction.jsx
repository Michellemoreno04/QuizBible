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
  const [isMuted, setIsMuted] = useState(false); // Estado para controlar mute

  const startMusic = async (audioFile) => {
    try {
    //  console.log('Loading Background Music');
      const { sound } = await Audio.Sound.createAsync(audioFile, {
        shouldPlay: true,
        isLooping: true,
      });
      setMusic(sound);

      console.log('Playing Background Music');
    } catch (error) {
      console.error('Error playing background music:', error);
    }
  };

  const stopMusic = async () => {
    if (music) {
     // console.log('Stopping Background Music');
      await music.stopAsync();
      await music.unloadAsync();
      setMusic(null);
    }
  };

  const toggleMute = async () => {
    if (music) {
      try {
        const newMuteState = !isMuted;
        await music.setVolumeAsync(newMuteState ? 0 : 1); // 0 = Mute, 1 = Full Volume
        setIsMuted(newMuteState);
      } catch (error) {
        console.error('Error toggling mute:', error);
      }
    }else{
      startMusic();
    }
  };

  useEffect(() => {
    // Limpiar música cuando el componente que usa el hook se desmonte
    return () => {
      if (music) {
       // console.log('Cleaning up Background Music');
        music.stopAsync();
        music.unloadAsync();
      }
    };
  }, [music]);

  return { startMusic, stopMusic, toggleMute, isMuted };
}