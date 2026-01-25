import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';

const FaceScreen = () => {
    const navigation = useNavigation();

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Ionicons name="scan-circle-outline" size={60} color={colors.primary} />
                <Text style={styles.title}>Face ID</Text>
                <Text style={styles.subtitle}>Secure Biometric Access</Text>
            </View>

            <View style={styles.content}>
                <TouchableOpacity style={[styles.card, styles.enrollCard]} onPress={() => navigation.navigate('FaceEnrollment')}>
                    <View style={styles.cardIcon}>
                        <Ionicons name="add-circle-outline" size={32} color="white" />
                    </View>
                    <View style={styles.cardText}>
                        <Text style={styles.cardTitle}>Enroll Face</Text>
                        <Text style={styles.cardDesc}>Register your biometric data securely.</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={24} color="rgba(255,255,255,0.5)" />
                </TouchableOpacity>

                <TouchableOpacity style={[styles.card, styles.attendCard]} onPress={() => navigation.navigate('BiometricAttendance')}>
                    <View style={styles.cardIcon}>
                        <Ionicons name="finger-print-outline" size={32} color="white" />
                    </View>
                    <View style={styles.cardText}>
                        <Text style={styles.cardTitle}>Face Attendance</Text>
                        <Text style={styles.cardDesc}>Quick check-in using facial recognition.</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={24} color="rgba(255,255,255,0.5)" />
                </TouchableOpacity>

                <View style={styles.infoBox}>
                    <Ionicons name="information-circle-outline" size={24} color={colors.textSecondary} />
                    <Text style={styles.infoText}>Position your face clearly within the frame for best results.</Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { alignItems: 'center', paddingTop: 60, paddingBottom: 40, backgroundColor: colors.surface },
    title: { fontSize: 32, fontWeight: '900', color: colors.text, marginTop: 10 },
    subtitle: { fontSize: 16, color: colors.textSecondary, letterSpacing: 1 },
    content: { padding: 24, gap: 20 },
    card: {
        borderRadius: 20,
        padding: 24,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    enrollCard: { backgroundColor: colors.info }, // Blueish
    attendCard: { backgroundColor: colors.success }, // Greenish
    cardIcon: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16
    },
    cardText: { flex: 1 },
    cardTitle: { fontSize: 20, fontWeight: 'bold', color: 'white' },
    cardDesc: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
    infoBox: {
        flexDirection: 'row',
        backgroundColor: colors.surfaceHighlight,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 20
    },
    infoText: { marginLeft: 12, color: colors.textSecondary, flex: 1, lineHeight: 20 }
});

export default FaceScreen;
