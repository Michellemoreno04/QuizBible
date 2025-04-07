import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, Feather, FontAwesome5, MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import useAuth from '../../components/authContext/authContext';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../../components/firebase/firebaseConfig';
import { niveles } from '@/components/Niveles/niveles';
import { Avatar, Icon } from '@rneui/themed';
import {InsigniasComponent} from '@/components/insigniasComponents/insigniasComponents';
import { BannerAd, TestIds } from 'react-native-google-mobile-ads';

const bannerAdUnitId = __DEV__ 
  ? TestIds.BANNER 
  : Platform.OS === 'ios' 
  ? process.env.EXPO_PUBLIC_BANNER_ID_IOS 
  : process.env.EXPO_PUBLIC_BANNER_ID_ANDROID;

export default function Profile() {
  const navigation = useNavigation();
  const { user, logout } = useAuth();
  const userId = user?.uid;
  const [userInfo, setUserInfo] = useState({});

  useEffect(() => {
    if (!user) return;
    const userRef = doc(db, 'users', userId);
    const unsubscribe = onSnapshot(userRef, (doc) => {
      setUserInfo(doc.data());
    });
    return () => unsubscribe();
  }, [user]);

  return (
    <LinearGradient
      colors={['#1E3A5F', '#3C6E9F']}
      style={styles.gradientContainer}
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Perfil</Text>
          <Pressable 
            onPress={() => navigation.navigate('menuScreen')}
            style={styles.menuButton}
          >
            <Feather name="menu" size={28} color="white" />
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          {/* Profile Card */}
          <LinearGradient
            colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)']}
            style={styles.profileCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.avatarContainer}>
              {userInfo?.FotoPerfil ? (
                <Avatar
                  size={120}
                  rounded
                  source={{ uri: userInfo.FotoPerfil }}
                  containerStyle={styles.avatar}
                />
              ) : (
                <Avatar
                  size={120}
                  rounded
                  title={userInfo?.Name?.charAt(0)}
                  containerStyle={styles.avatar}
                  titleStyle={styles.avatarText}
                />
              )}
              
            </View>

            <Text style={styles.userName}>{userInfo?.Name || 'Usuario'}</Text>
            <Text style={styles.userHandle}>@{userInfo?.username || 'usuario123'}</Text>

            {/* Stats */}
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <MaterialCommunityIcons name="lightning-bolt" size={28} color="#FFD700" />
                <Text style={styles.statValue}>{userInfo?.RachaMaxima || 0}</Text>
                <Text style={styles.statLabel}>Racha Máxima</Text>
              </View>

              <View style={styles.statItem}>
                <LinearGradient
                  colors={['#4CAF50', '#8BC34A']}
                  style={styles.levelBadge}
                >
                  <Text style={styles.levelText}>Nv. {userInfo?.Nivel || 1}</Text>
                </LinearGradient>
                <Text style={styles.statLabel}>{niveles(userInfo?.Exp)?.insignia}</Text>
              </View>

              <View style={styles.statItem}>
              <FontAwesome5 name="coins" size={24} color="yellow" />
                <Text style={styles.statValue}>{userInfo?.Monedas || 0}</Text>
                <Text style={styles.statLabel}>Monedas</Text>
              </View>
            </View>
          </LinearGradient>

          {/* Insignias Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Insignias Destacadas</Text>
              <MaterialCommunityIcons name="medal" size={24} color="white" />
            </View>
            
            {userInfo?.Insignias?.length > 0 ? (
              

                <InsigniasComponent userInfo={userInfo.Insignias} />
            ) : (
              <View style={styles.emptyBadges}>
                <MaterialCommunityIcons name="medal-outline" size={40} color="rgba(255,255,255,0.5)" />
                <Text style={styles.emptyBadgesText}>Aún no tienes insignias</Text>
              </View>
            )}
          </View>

          {/* Bio Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Descripción</Text>
            <View style={styles.bioCard}>
              <Text style={styles.bioText}>
                {userInfo?.Description || '¡Completa tu perfil para que otros te conozcan mejor!'}
              </Text>
            </View>
          </View>
          <View style={styles.bannerContainer}>
            <BannerAd
              unitId={bannerAdUnitId}
              size="BANNER"
              requestOptions={{
                keywords: ['religion', 'bible'],
              }}
              onAdLoaded={() => console.log('Banner cargado')}
              onAdFailedToLoad={(error) => console.log('Error cargando banner:', error)}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: 'white',
    fontFamily: 'Inter_700Bold',
  },
  menuButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  content: {
    paddingBottom: 40,
  },
  profileCard: {
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  avatarContainer: {
    marginBottom: 20,
    position: 'relative',
  },
  avatar: {
    borderWidth: 3,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  avatarText: {
    fontSize: 48,
    fontWeight: '600',
    color: 'white',
  },

  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
    marginBottom: 4,
  },
  userHandle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    alignContent: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
    marginVertical: 8,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  levelBadge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginBottom: 8,
  },
  badgeRibbon: {
    padding: 5,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  levelText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
  },
 
  emptyBadges: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyBadgesText: {
    color: 'rgba(255,255,255,0.7)',
    marginTop: 12,
    textAlign: 'center',
  },
  bioCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 16,
  },
  bioText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    lineHeight: 22,
  },
  bannerContainer: {
   
    alignItems: 'center',
   
  },
});