// context/PurchasesProvider.tsx
import React, { useEffect, useState } from "react";
import PurchasesContext from "./purchasesContext";
import Purchases, {
  CustomerInfo,
  LOG_LEVEL,
  PurchasesOffering,
  PurchasesPackage,
} from "react-native-purchases";
import { ActivityIndicator, Platform, Text, View } from "react-native";

type PurchasesProviderProps = {
  children: JSX.Element | JSX.Element[];
};

const androidApiKey = process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID;

const PurchasesProvider: React.FC<PurchasesProviderProps> = ({ children }) => {
  const [initialized, setInitialized] = useState(false);
  const [offering, setOffering] = useState<PurchasesOffering | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>();
  const [error, setError] = useState<string | null>(null);

  const init = async () => {
    try {
      if (!androidApiKey) {
        throw new Error('La clave API de RevenueCat para Android no está configurada');
      }

      console.log('Iniciando configuración de RevenueCat con API Key:', androidApiKey);

      Purchases.configure({
        apiKey: androidApiKey,
      });

      if (__DEV__) {
        Purchases.setLogLevel(LOG_LEVEL.DEBUG);
      }

      try {
        await getOfferings();
      } catch (offeringsError: any) {
        console.error('Error obteniendo ofertas:', offeringsError);
        throw new Error(`Error obteniendo ofertas: ${offeringsError.message}`);
      }

      Purchases.addCustomerInfoUpdateListener((customerInfo) => {
        setCustomerInfo(customerInfo);
      });

      setInitialized(true);
    } catch (err) {
      console.error('Error detallado de RevenueCat:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    }
  };

  /**
   * Fetch the current offerings from RevenueCat
   */
  const getOfferings = async () => {
    console.log('getOfferings iniciando');
    try {
      const offerings = await Purchases.getOfferings();
      console.log('Ofertas obtenidas:', offerings);
      
      // Intentar obtener la oferta específica primero
      const specificOffering = offerings.all['ofrng8df2c141cd'];
      const currentOffering = specificOffering || offerings.current;
      
      if (!currentOffering) {
        throw new Error('No hay ofertas disponibles en RevenueCat');
      }
      
      console.log('Oferta seleccionada:', currentOffering);
      setOffering(currentOffering);
    } catch (error) {
      console.error('Error en getOfferings:', error);
      throw error;
    }
  };

  /**
   *
   * @param purchasedPackage The package to purchase
   * @returns The result of the purchase
   */
  const purchasePackage = async (purchasedPackage: PurchasesPackage) => {
    const result = await Purchases.purchasePackage(purchasedPackage);
    return result;
  };

  /**
   * Fetch the customer info from RevenueCat
   */
  const getCustomerInfo = async () => {
    const customerInfo = await Purchases.getCustomerInfo();
    setCustomerInfo(customerInfo);
  };

  /**
   * Check if the user is subscribed to any offering
   * @returns True if the user is subscribed to any offering
   */
  const checkIfUserIsSubscribed = async () => {
    if (!initialized || !customerInfo) return;
    const isPro = customerInfo.activeSubscriptions.length > 0;
    setIsSubscribed(isPro);
  };

  /**
   * Get the non-subscription purchase with the given identifier
   * @param identifier The identifier of the product to fetch
   * @returns The non-subscription purchase with the given identifier
   */
  const getNonSubscriptionPurchase = async (identifier: string) => {
    if (!initialized || !customerInfo) return null;

    const item = customerInfo.nonSubscriptionTransactions.find(
      (t) => t.productIdentifier === identifier
    );

    return item;
  };

  useEffect(() => {
    init();
    getCustomerInfo();
  }, []);

  useEffect(() => {
    // Check if the user is subscribed to any offering after the customer info changes
    checkIfUserIsSubscribed();
  }, [initialized, customerInfo]);

  // If the Purchases SDK is not initialized, show loading or error state
  

  return (
    <PurchasesContext.Provider
      value={{
        currentOffering: offering,
        purchasePackage,
        customerInfo,
        isSubscribed,
        getNonSubscriptionPurchase,
      }}
    >
      {children}
    </PurchasesContext.Provider>
  );
};

export default PurchasesProvider;

