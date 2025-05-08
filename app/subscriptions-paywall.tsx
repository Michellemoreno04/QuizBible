//app/subscriptions-paywall.tsx

import { usePurchases } from "../hooks/usesPurchases";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Dimensions,
  Platform,
  View,
  Image,
  ScrollView,
  Text,
  Button,
  Pressable,
  FlatList,
} from "react-native";
import { PRODUCT_CATEGORY, PurchasesPackage } from "react-native-purchases";

const screenHeight = Dimensions.get("window").height;
const screenWidth = Dimensions.get("window").width;

const SubscriptionsPaywall = () => {
  const { currentOffering, purchasePackage } = usePurchases();

  console.log('Current Offering:', currentOffering);

  // Filter out non-subscription products from RevenueCat
  const filteredPackages = currentOffering?.availablePackages.filter(
    (item) => item.product.productCategory === PRODUCT_CATEGORY.SUBSCRIPTION
  );

  const [selectedPackage, setSelectedPackage] =
    useState<PurchasesPackage | null>(filteredPackages?.[0] || null);

  const [isLoading, setIsLoading] = useState(false);

  // Verificar si tenemos los datos necesarios
  if (!currentOffering || !filteredPackages || filteredPackages.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text>Cargando ofertas disponibles...</Text>
      </View>
    );
  }

  const handleContinue = async () => {
    if (!selectedPackage) return;

    try {
      setIsLoading(true);
      await purchasePackage(selectedPackage);
      router.back();
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={{ gap: 16, flex: 1, backgroundColor: "white" }}>
      <Image
        source={{
          uri: "https://i.imgur.com/qUZLBVT.jpg",
        }}
        height={screenHeight * 0.3}
        alt="Background image showing food"
        resizeMode="cover"
      ></Image>

      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={{ flex: 1, alignItems: "center", gap: 24, padding: 24 }}>
          <Text style={{ textAlign: "center" }}>
            {`Get access to our premium features`}
          </Text>
          <PackagesCarousel
            packages={filteredPackages}
            onSelectPackage={(packageToSelect) =>
              setSelectedPackage(packageToSelect)
            }
            selectedPackage={selectedPackage}
            metadata={currentOffering?.metadata as PackageMetadata}
          ></PackagesCarousel>
        </View>
        <View style={{ padding: 24, gap: 8, marginBottom: 24 }}>
          <Text style={{ textAlign: "center" }}>
            {`All Subscriptions include a 7-Day Free Trial`}
          </Text>
          <Text style={{ textAlign: "center" }}>
            {`You can cancel at any time before the 7 day trial ends, and you won't be changed any amount`}
          </Text>
          <Button
            disabled={isLoading}
            title={isLoading ? "Processing..." : "Try it free for 7 days"}
            onPress={handleContinue}
          />
        </View>
      </ScrollView>
    </View>
  );
};

type Subscription = {
  identifier: string;
  cycles: number;
  discount?: string;
};

type PackageMetadata = {
  subscriptions: {
    ios: Subscription[];
    android: Subscription[];
  };
};

type PackagesCarouselProps = {
  onSelectPackage: (packageToSelect: PurchasesPackage) => void;
  packages?: PurchasesPackage[];
  metadata: PackageMetadata;
  selectedPackage: PurchasesPackage | null;
};

const PackagesCarousel: React.FC<PackagesCarouselProps> = (props) => {
  const { packages, onSelectPackage, selectedPackage, metadata } = props;
  
  // Verificar si metadata y subscriptions existen
  if (!metadata || !metadata.subscriptions) {
    console.log('Metadata o subscriptions no están disponibles:', metadata);
    return null;
  }

  const subscriptions =
    metadata.subscriptions[Platform.OS === "ios" ? "ios" : "android"];

  console.log("subscriptions", subscriptions);

  const RenderItem = (item: PurchasesPackage) => {
    if (!selectedPackage) return null;
    const isSelected = selectedPackage.identifier === item.identifier;
    const packageMetadata = subscriptions.find(
      (s) => s.identifier === item.product.identifier
    );

    console.log("packageMetadata", packageMetadata);

    if (!packageMetadata) return null;
    const discount = packageMetadata.discount;
    const amountOfMonths = packageMetadata.cycles;

    return (
      <Pressable
        onPress={() => {
          onSelectPackage(item);
        }}
      >
        <View
          style={{
            marginRight: 16,
            borderColor: isSelected ? "red" : "black",
            borderWidth: 3,
            borderRadius: 6,
            overflow: "hidden",
            minWidth: screenWidth * 0.4,
          }}
        >
          {discount && (
            <Text
              style={{
                position: "absolute",
                width: "100%",
                color: "black",
                textAlign: "center",
                padding: 4,
                backgroundColor: "yellow",
              }}
            >
              {discount}
            </Text>
          )}
          <View
            style={{
              marginTop: 16,
              padding: 16,
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontSize: 70,
              }}
            >
              {amountOfMonths}
            </Text>
            <Text>{amountOfMonths > 1 ? "months" : "month"}</Text>
            <Text>{item.product.priceString}</Text>
          </View>
        </View>
      </Pressable>
    );
  };

  if (!packages) return null;

  return (
    <FlatList
      contentContainerStyle={{
        paddingBottom: 4,
        marginRight: -16,
        overflow: "hidden",
      }}
      horizontal={true}
      data={packages}
      pagingEnabled={false}
      keyExtractor={(item) => item.identifier}
      renderItem={({ item }) => <RenderItem {...item}></RenderItem>}
    ></FlatList>
  );
};

export default SubscriptionsPaywall;
