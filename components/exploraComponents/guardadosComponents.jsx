import {
    Text,
    View,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Dimensions,
    Platform,
  } from "react-native";
  import { LinearGradient } from "expo-linear-gradient";
  import { AntDesign, FontAwesome5 } from "@expo/vector-icons";
  import { useNavigation } from "expo-router";
      
  // Helpers para dimensiones responsivas
  const { width, height } = Dimensions.get("window");
  const normalizeText = (size) => Math.round(size * (width / 375));
  
  export default function GuardadosComponents() {
    const navigation = useNavigation();
    const cardWidth = width * 0.43;
    const cardPadding = width * 0.05;
  
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Guardados</Text>
        
        <ScrollView 
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.cardsContainer}
        >
          <TouchableOpacity
            onPress={() => navigation.navigate("versiculosFavoritos")}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={["#FF7E1F", "#FEB27B"]}
              style={[
                styles.card, 
                
              ]}
            >
              <View style={styles.iconContainer}>
                <FontAwesome5 
                  name="book" 
                  size={normalizeText(24)} 
                  color="white" 
                />
              </View>
              <Text style={styles.cardTitle}>Versículos Guardados</Text>
              <AntDesign
                name="arrowright"
                size={normalizeText(20)}
                color="white"
                style={styles.arrow}
              />
            </LinearGradient>
          </TouchableOpacity>
  
          <TouchableOpacity
            onPress={() => navigation.navigate("lecturasVistas")}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={["#6A65FB", "#8C9EFF"]}
              style={styles.card}>
              <View style={styles.iconContainer}>
                <FontAwesome5 
                  name="book-open" 
                  size={normalizeText(24)} 
                  color="white" 
                />
              </View>
              <Text style={styles.cardTitle}>Lecturas Recientes</Text>
              <AntDesign
                name="arrowright"
                size={normalizeText(20)}
                color="white"
                style={styles.arrow}
              />
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }
  
  const styles = StyleSheet.create({
    container: {
     // marginVertical: height * 0.02,
      //paddingHorizontal: width * 0.04,
    },
    title: {
      color: "white",
      fontSize: normalizeText(24),
      fontWeight: Platform.OS === 'ios' ? '700' : 'bold',
      marginBottom: height * 0.02,
      fontFamily: "Inter-Bold",
      includeFontPadding: false,
    },
    cardsContainer: {
      flexDirection: "row",
      gap: width * 0.04,
      paddingBottom: width * 0.02,
    },
    card: {
      borderRadius: normalizeText(20),
      borderWidth: 2,
      borderColor: "rgba(255, 255, 255, 0.5)",
      justifyContent: "space-between",
      width: width * 0.43,
      padding: width * 0.03,
      minWidth: 160,
    },
    iconContainer: {
      backgroundColor: "rgba(255, 255, 255, 0.2)",
      width: normalizeText(48),
      height: normalizeText(48),
      borderRadius: normalizeText(24),
      justifyContent: "center",
      alignItems: "center",
      marginBottom: height * 0.01,
    },
    cardTitle: {
      color: "white",
      fontSize: normalizeText(16),
      fontWeight: "600",
      lineHeight: normalizeText(24),
      fontFamily: "Inter-SemiBold",
      position:'relative',
      top: height * 0.03
    },
    arrow: {
      alignSelf: "flex-end",
     
    },
  });