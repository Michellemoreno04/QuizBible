import { Text, View } from 'react-native'
import React, { useState } from 'react'
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
import { Platform } from 'react-native';

const adUnitId = __DEV__
  ? TestIds.ADAPTIVE_BANNER
  : Platform.OS === 'ios'
  ? process.env.EXPO_PUBLIC_BANNER_ID_IOS
  : process.env.EXPO_PUBLIC_BANNER_ID_ANDROID;

export const AdBanner = () => {
    const [adError, setAdError] = useState(false);
    const [retryCount, setRetryCount] = useState(0);
    const maxRetries = 3;


    const handleAdFailed = (error) => {
        console.error('Ad failed to load:', error);
        if (retryCount < maxRetries) {
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
          },300 * Math.pow(2, retryCount));  // Incremental backoff
        } else {
          setAdError(true);
        }
      };
  
    return (
      <View>
         {!adError && (
              <BannerAd
              key={retryCount} // Usar el contador de reintentos como clave
                unitId={adUnitId}
                size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
                onAdLoaded={() => {
                  setRetryCount(0);
                  setAdError(false);
                  console.log('Ad loaded successfully');
                }}
                onAdFailedToLoad={handleAdFailed}
              />
            )}
            
        
           {adError && (
              <BannerAd
                unitId={adUnitId}
                size={BannerAdSize.BANNER} // Tamaño alternativo
                onAdLoaded={() => setAdError(false)}
              />
            )}
      </View>
    )
  
}
