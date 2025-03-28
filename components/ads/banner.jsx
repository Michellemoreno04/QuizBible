import { Text, View, StyleSheet } from 'react-native'
import React, { useState, useEffect } from 'react'
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
import { Platform } from 'react-native';

const adUnitId = __DEV__
  ? TestIds.ADAPTIVE_BANNER
  : Platform.OS === 'ios'
  ? EXPO_PUBLIC_BANNER_ID_IOS 
  : EXPO_PUBLIC_BANNER_ID_ANDROID; 

export const AdBanner = () => {
    const [adError, setAdError] = useState(false);
    const [retryCount, setRetryCount] = useState(0);
    const [currentSize, setCurrentSize] = useState(BannerAdSize.ANCHORED_ADAPTIVE_BANNER);
    const maxRetries = 5; // Aumentamos el número de reintentos

    // Lista de tamaños de banner para probar
    const bannerSizes = [
        BannerAdSize.ANCHORED_ADAPTIVE_BANNER,
        BannerAdSize.BANNER,
        BannerAdSize.INLINE_ADAPTIVE_BANNER,
        BannerAdSize.MEDIUM_RECTANGLE
    ];

    useEffect(() => {
        // Reiniciar el banner cada 30 segundos si hay error
        let interval;
        if (adError) {
            interval = setInterval(() => {
                setRetryCount(0);
                setAdError(false);
            }, 30000);
        }
        return () => interval && clearInterval(interval);
    }, [adError]);

    const handleAdFailed = (error) => {
        console.error('Ad failed to load:', error);
        console.log('Current adUnitId:', adUnitId);
        console.log('Current size:', currentSize);

        // Si falla con un tamaño, intentar con el siguiente
        const currentSizeIndex = bannerSizes.indexOf(currentSize);
        const nextSizeIndex = (currentSizeIndex + 1) % bannerSizes.length;

        if (retryCount < maxRetries) {
            setTimeout(() => {
                setCurrentSize(bannerSizes[nextSizeIndex]);
                setRetryCount(prev => prev + 1);
            }, 1000 * Math.pow(2, retryCount)); // Backoff exponencial en segundos
        } else {
            setAdError(true);
        }
    };

    return (
        <View style={styles.container}>
            <BannerAd
                key={`${retryCount}-${currentSize}`}
                unitId={adUnitId}
                size={currentSize}
                requestOptions={{
                    requestNonPersonalizedAdsOnly: true,
                }}
                onAdLoaded={() => {
                    console.log('Ad loaded successfully with size:', currentSize);
                    setRetryCount(0);
                    setAdError(false);
                }}
                onAdFailedToLoad={handleAdFailed}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        alignItems: 'center',
        position: 'relative',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'transparent',
        zIndex: 999,
        minHeight: 50, // Altura mínima para el banner
    },
});
