import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons"
import Modal from 'react-native-modal'
import { niveles } from '../Niveles/niveles'
import { useState } from 'react'


const { width, height } = Dimensions.get('screen')

export const InsigniasComponent = ({ userInfo }) => {
    const [selectedInsignia, setSelectedInsignia] = useState(null)
    const [isModalVisible, setIsModalVisible] = useState(false)

    const openModal = (insignia) => {
        setSelectedInsignia(insignia)
        setIsModalVisible(true)
    }

    const closeModal = () => {
        setIsModalVisible(false)
        setSelectedInsignia(null)
    }

    const getInsigniaDescription = (insigniaName) => {
        // Buscar la descripción en el objeto de niveles
        for (let i = 1; i <= 29; i++) {
            if (niveles(i * 400).insignia === insigniaName) {
                return niveles(i * 400).description
            }
        }
        return "Descripción no disponible"
    }
    
    return (
        <View>
            <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.badgesScroll}
            >
                {userInfo.map((insignia, index) => (
                    <TouchableOpacity 
                        key={index} 
                        style={styles.badgeContainer}
                        onPress={() => openModal(insignia)}
                    >
                        {/* Borde dorado con efecto 3D */}
                        <LinearGradient
                            colors={['#FFD700', '#D4AF37', '#C88A32', '#FFD700']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.badgeBorder}
                        >
                            {/* Tarjeta principal */}
                            <LinearGradient
                                colors={['#2a1a07', '#1a1003']}
                                style={styles.badgeCard}
                            >
                                {/* Brillo interno */}
                                <LinearGradient
                                    colors={['rgba(255,215,0,0.15)', 'transparent']}
                                    style={styles.goldShine}
                                    start={{ x: 0.8, y: 0.2 }}
                                    end={{ x: 0, y: 1 }}
                                />
                                
                                {/* Partículas de brillo */}
                                <View style={styles.sparkle1}></View>
                                <View style={styles.sparkle2}></View>
                                <View style={styles.sparkle3}></View>

                                {/* Icono con relieve */}
                                <MaterialCommunityIcons 
                                    name="crown" 
                                    size={48} 
                                    color="#FFD700" 
                                    style={styles.badgeIcon}
                                />
                                
                                {/* Cinta dorada */}
                                <LinearGradient
                                    colors={['#FFD70080', '#D4AF3780']}
                                    style={styles.badgeRibbon}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                >
                                    <Text style={styles.badgeText}>{insignia}</Text>
                                    {/* Brillo en la cinta */}
                                    <LinearGradient
                                        colors={['#ffffff20', '#ffffff00']}
                                        style={styles.ribbonShine}
                                    />
                                </LinearGradient>
                                
                                {/* Detalle de joya */}
                                <View style={styles.jewelAccent}></View>
                            </LinearGradient>
                        </LinearGradient>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Modal para mostrar la descripción de la insignia */}
            <Modal
                isVisible={isModalVisible}
                onBackdropPress={closeModal}
                backdropOpacity={0.7}
                animationIn="zoomIn"
                animationOut="zoomOut"
                backdropTransitionOutTiming={0}
            >
                <LinearGradient
                    colors={['#5a1a08', '#5a1003']} 
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.modalContent}
                >
                    <TouchableOpacity 
                        style={styles.closeButton} 
                        onPress={closeModal}
                        activeOpacity={0.7}
                    >
                        <FontAwesome5 name="times" size={24} color="white" />
                    </TouchableOpacity>

                    <View style={styles.modalHeader}>
                        <MaterialCommunityIcons name="crown" size={40} color="#FFD700" />
                        <Text style={styles.modalTitle}>{selectedInsignia}</Text>
                    </View>

                    <Text style={styles.modalDescription}>
                        {selectedInsignia ? getInsigniaDescription(selectedInsignia) : ''}
                    </Text>
                </LinearGradient>
            </Modal>
        </View>
    )
}

const styles = StyleSheet.create({
    badgesScroll: {
       // paddingVertical: 5,
        //paddingHorizontal: 15
    },
    badgeContainer: {
        marginRight: 10,
        shadowColor: '#FFD700',
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 15,
        shadowOpacity: 0.4
    },
    badgeBorder: {
        padding: 3,
        borderRadius: 20,
       // transform: [{ rotateZ: '-5deg' }]
    },
    badgeCard: {
        width: width * 0.40,
        height: height * 0.21,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: '#1a1003'
    },
    goldShine: {
        position: 'absolute',
        width: '200%',
        height: '200%',
        opacity: 0.8,
    },
    badgeIcon: {
        marginBottom: 20,
        textShadowColor: 'rgba(255,215,0,0.8)',
        textShadowRadius: 15,
        transform: [{ rotateZ: '5deg' }]
    },
    badgeRibbon: {
        width: '100%',
       // height: 70,
        position: 'absolute',
        bottom: 0,
        width: '100%',
        paddingVertical: 12,
        alignItems: 'center',
        borderTopWidth: 2,
        borderTopColor: '#FFD70050',
        paddingHorizontal: 10,
    },
    badgeText: {
        textAlign: 'center',
        color: '#FFD700',
        fontFamily: 'Arial',
        fontWeight: 'bold',
        fontSize: 15,
        letterSpacing: 1.2,
        textTransform: 'uppercase',
        textShadowColor: 'rgba(0,0,0,0.8)',
        textShadowRadius: 2,
        transform: [{ skewX: '-8deg' }]
    },
    sparkle1: {
        position: 'absolute',
        width: 8,
        height: 8,
        backgroundColor: '#FFFFFF',
        borderRadius: 4,
        top: 15,
        left: 20,
        opacity: 0.8,
        transform: [{ rotate: '45deg' }]
    },
    sparkle2: {
        position: 'absolute',
        width: 6,
        height: 6,
        backgroundColor: '#FFD700',
        borderRadius: 3,
        bottom: 30,
        right: 15,
        opacity: 0.6
    },
    sparkle3: {
        position: 'absolute',
        width: 4,
        height: 4,
        backgroundColor: '#FFFFFF',
        borderRadius: 2,
        top: 40,
        right: 25,
        opacity: 0.5
    },
    ribbonShine: {
        position: 'absolute',
        width: '40%',
        height: '100%',
        right: 0,
        transform: [{ skewX: '-30deg' }]
    },
    jewelAccent: {
        position: 'absolute',
        top: 10,
        right: 10,
        width: 12,
        height: 12,
        borderRadius: 4,
        backgroundColor: '#FF355E',
        transform: [{ rotate: '45deg' }],
        shadowColor: '#FF355E',
        shadowRadius: 8,
        shadowOpacity: 0.6
    },
    modalContent: {
        padding: 20,
        borderRadius: 20,
        alignItems: 'center',
        position: 'relative',
    },
    closeButton: {
        position: 'absolute',
        top: -30,
        right: -15,
        width: 40,
        height: 40,
        backgroundColor: 'red',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        gap: 5,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFD700',
        textAlign: 'center',
    },
    modalDescription: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
        lineHeight: 24,
        textAlign: 'center',
        marginTop: 5,
    },
});