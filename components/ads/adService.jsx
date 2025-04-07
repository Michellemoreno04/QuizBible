import { MobileAds, InterstitialAd, RewardedAd, TestIds, AdEventType, RewardedAdEventType, BannerAdSize, } from 'react-native-google-mobile-ads';
import { Platform } from 'react-native';

// IDs de anuncios
const AD_UNITS = {
  BANNER: __DEV__ 
    ? TestIds.BANNER 
    : Platform.OS === 'ios' 
    ? process.env.EXPO_PUBLIC_BANNER_ID_IOS 
    : process.env.EXPO_PUBLIC_BANNER_ID_ANDROID,
  
  INTERSTITIAL: __DEV__ 
    ? TestIds.INTERSTITIAL 
    : Platform.OS === 'ios' 
    ? process.env.EXPO_PUBLIC_INTERSTITIAL_ID_IOS 
    : process.env.EXPO_PUBLIC_INTERSTITIAL_ID_ANDROID,
  
  REWARDED: __DEV__ 
    ? TestIds.REWARDED 
    : Platform.OS === 'ios' 
    ? process.env.EXPO_PUBLIC_REWARDED_ID_IOS 
    : process.env.EXPO_PUBLIC_REWARDED_ID_ANDROID
};

// Configuración común para todos los anuncios
const AD_CONFIG = {
  keywords: ['religion', 'bible'],
  requestNonPersonalizedAdsOnly: true
};

class AdService {
  static instance = null;
  interstitialAd = null;
  rewardedAd = null;
  bannerAd = null;
  isPreloading = false;
  
  static getInstance() {
    if (!AdService.instance) {
      AdService.instance = new AdService();
    }
    return AdService.instance;
  }

  async initialize() {
    try {
      await MobileAds().initialize();
      console.log('Mobile Ads initialized successfully');
    } catch (error) {
      console.error('Error initializing Mobile Ads:', error);
      // No lanzamos el error para que la app continúe funcionando
    }
  }

  async preloadAllAds() {
    if (this.isPreloading) return;
    this.isPreloading = true;
    
    try {
      // Inicializar MobileAds si no se ha hecho
      await this.initialize();
      
      // Cargar anuncio intersticial
      const interstitialLoaded = await this.loadInterstitial();
      
      // Cargar anuncio recompensado
      const rewardedLoaded = await this.loadRewarded();
      
      console.log('Precarga de anuncios completada:', {
        interstitial: interstitialLoaded,
        rewarded: rewardedLoaded
      });
    } catch (error) {
      console.error('Error en precarga de anuncios:', error);
    } finally {
      this.isPreloading = false;
    }
  }

  async retryLoad(loadFunction, maxRetries = 3, delay = 2000) {
    let attempts = 0;
    
    while (attempts < maxRetries) {
      const success = await loadFunction();
      if (success) return true;
      
      attempts++;
      if (attempts < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, attempts - 1))); // Backoff exponencial
      }
    }
    
    return false;
  }

  // Método para cargar anuncios intersticiales
  async loadInterstitial() {
    return this.retryLoad(() => {
      try {
        if (this.interstitialAd) {
          return true; // Ya hay un anuncio cargado
        }
        
        this.interstitialAd = InterstitialAd.createForAdRequest(AD_UNITS.INTERSTITIAL, AD_CONFIG);
        
        return new Promise((resolve) => {
          const unsubscribeLoaded = this.interstitialAd.addAdEventListener(AdEventType.LOADED, () => {
            unsubscribeLoaded();
            resolve(true);
          });

          const unsubscribeError = this.interstitialAd.addAdEventListener(AdEventType.ERROR, (error) => {
            console.error('Error loading interstitial:', error);
            unsubscribeError();
            this.interstitialAd = null; // Limpiar referencia en caso de error
            resolve(false);
          });

          const unsubscribeClosed = this.interstitialAd.addAdEventListener(AdEventType.CLOSED, () => {
            unsubscribeClosed();
            this.interstitialAd = null;
            this.loadInterstitial(); // Recargar automáticamente después de cerrar
          });

          this.interstitialAd.load();
        });
      } catch (error) {
        console.error('Error en loadInterstitial:', error);
        return false;
      }
    });
  }

  // Método para mostrar anuncios intersticiales
  async showInterstitial() {
    try {
      if (!this.interstitialAd) {
        const loaded = await this.loadInterstitial();
        if (!loaded) return false;
      }
      await this.interstitialAd.show();
      return true;
    } catch (error) {
      console.error('Error showing interstitial:', error);
      return false; // Retornamos false en lugar de lanzar error
    }
  }

  // Método para cargar anuncios recompensados
  async loadRewarded(navigationCallback) {
    try {
      if (this.rewardedAd) {
        return true;
      }
      
      this.rewardedAd = RewardedAd.createForAdRequest(AD_UNITS.REWARDED, AD_CONFIG);
      
      return new Promise((resolve) => {
        const unsubscribeLoaded = this.rewardedAd.addAdEventListener(RewardedAdEventType.LOADED, () => {
          unsubscribeLoaded();
          resolve(true);
        });

        const unsubscribeEarned = this.rewardedAd.addAdEventListener(RewardedAdEventType.EARNED_REWARD, (reward) => {
          console.log('Recompensa obtenida:', reward);
          if (navigationCallback) {
            navigationCallback();
          }
          unsubscribeEarned();
        });

        const unsubscribeClosed = this.rewardedAd.addAdEventListener(AdEventType.CLOSED, () => {
          if (navigationCallback) {
            navigationCallback();
          }
          this.rewardedAd = null;
          unsubscribeClosed();
          this.loadRewarded(); // Precargar el siguiente anuncio
        });

        this.rewardedAd.load();
      });
    } catch (error) {
      console.error('Error en loadRewarded:', error);
      return false;
    }
  }

  // Método para mostrar anuncios recompensados
  async showRewarded() {
    try {
      if (!this.rewardedAd) {
        console.log('No hay anuncio cargado, cargando uno nuevo...');
        const loaded = await this.loadRewarded();
        if (!loaded) {
          console.log('No se pudo cargar el anuncio');
          return false;
        }
      }
      
      await this.rewardedAd.show();
      return true;
    } catch (error) {
      console.error('Error showing rewarded ad:', error);
      return false;
    }
  }

  // Método para obtener un banner
  getBanner() {
    return {
      unitId: AD_UNITS.BANNER,
      size: BannerAdSize.ANCHORED_ADAPTIVE_BANNER,
      requestOptions: AD_CONFIG
    };
  }
}

export default AdService; 