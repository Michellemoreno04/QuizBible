// hooks/usePurchases.tsx
import React from "react";
import PurchasesContext, {
  PurchasesContextProps,
} from "../components/reveneucatContext/purchasesContext";

/**
 * Custom hook for managing purchases with RevenueCat.
 * @returns An object containing the following properties:
 *  - currentOffering - The current offering
 *  - purchasePackage - Purchase a package
 *  - customerInfo - The customer info
 *  - isSubscribed - Flag that indicates if the user is subscribed to any offering
 *  - getNonSubscriptionPurchase - Get the non-subscription purchase by identifier
 */
export const usePurchases = () =>
  React.useContext(PurchasesContext as React.Context<PurchasesContextProps>);
