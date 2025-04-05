import { Text, View, StyleSheet } from 'react-native'
import React, { useState, useEffect } from 'react'
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import AdService from './adService';

export const AdBanner = () => {
    const [adError, setAdError] = useState(false);
    const [retryCount, setRetryCount] = useState(0);
    const [currentSize, setCurrentSize] = useState(BannerAdSize.ANCHORED_ADAPTIVE_BANNER);
    const maxRetries = 2;

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

    const bannerConfig = AdService.getInstance().getBanner();

    return (
        <View style={styles.container}>
            <BannerAd
                key={`${retryCount}-${currentSize}`}
                unitId={bannerConfig.unitId}
                size={currentSize}
                requestOptions={bannerConfig.requestOptions}
                onAdLoaded={() => {
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
        minHeight: 50,
    },
});
