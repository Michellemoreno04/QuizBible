import { MobileAds, InterstitialAd, RewardedAd, BannerAd, TestIds, AdEventType, RewardedAdEventType, BannerAdSize } from 'react-native-google-mobile-ads';
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
    }
  }

  // Método para cargar anuncios intersticiales
  async loadInterstitial() {
    try {
      this.interstitialAd = InterstitialAd.createForAdRequest(AD_UNITS.INTERSTITIAL, AD_CONFIG);
      
      return new Promise((resolve, reject) => {
        const unsubscribeLoaded = this.interstitialAd.addAdEventListener(AdEventType.LOADED, () => {
          unsubscribeLoaded();
          resolve(true);
        });

        const unsubscribeError = this.interstitialAd.addAdEventListener(AdEventType.ERROR, (error) => {
          unsubscribeError();
          reject(error);
        });

        this.interstitialAd.load();
      });
    } catch (error) {
      console.error('Error loading interstitial:', error);
      throw error;
    }
  }

  // Método para mostrar anuncios intersticiales
  async showInterstitial() {
    try {
      if (!this.interstitialAd) {
        await this.loadInterstitial();
      }
      await this.interstitialAd.show();
    } catch (error) {
      console.error('Error showing interstitial:', error);
      throw error;
    }
  }

  // Método para cargar anuncios recompensados
  async loadRewarded() {
    try {
      this.rewardedAd = RewardedAd.createForAdRequest(AD_UNITS.REWARDED, AD_CONFIG);
      
      return new Promise((resolve, reject) => {
        const unsubscribeLoaded = this.rewardedAd.addAdEventListener('loaded', () => {
          unsubscribeLoaded();
          resolve(true);
        });

        const unsubscribeError = this.rewardedAd.addAdEventListener('error', (error) => {
          unsubscribeError();
          reject(error);
        });

        const unsubscribeEarned = this.rewardedAd.addAdEventListener('earned_reward', () => {
          unsubscribeEarned();
        });

        this.rewardedAd.load();
      });
    } catch (error) {
      console.error('Error loading rewarded ad:', error);
      throw error;
    }
  }

  // Método para mostrar anuncios recompensados
  async showRewarded() {
    try {
      if (!this.rewardedAd) {
        await this.loadRewarded();
      }
      await this.rewardedAd.show();
    } catch (error) {
      console.error('Error showing rewarded ad:', error);
      throw error;
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