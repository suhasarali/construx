import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Modal } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { colors } from '../constants/colors';

const WorkerToolsScreen = ({ navigation }) => {
    const { userInfo } = useContext(AuthContext);
    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);
    const [scanning, setScanning] = useState(true);

    const handleBarCodeScanned = async ({ type, data }) => {
        if (scanned) return;
        setScanned(true);

        try {
            // "data" is the Tool ID
            // Automatically Check-Out the tool
            await api.post(`/tools/${data}/checkout`, {
                notes: 'Scanned via Worker App',
                location: null // Could add geo-location here later
            });

            Alert.alert(
                'Success', 
                'Tool successfully borrowed! You have it for 24 hours.',
                [{ text: 'OK', onPress: () => {
                    setScanned(false);
                    navigation.goBack(); 
                }}]
            );
        } catch (error) {
            Alert.alert(
                'Error', 
                error.response?.data?.message || 'Failed to borrow tool'
            );
            setTimeout(() => setScanned(false), 2000); // Allow rescan after error
        }
    };

    if (!permission) return <View />;
    if (!permission.granted) {
        return (
            <View style={styles.container}>
                <Text style={styles.text}>Camera access is needed to scan QR codes.</Text>
                <TouchableOpacity onPress={requestPermission} style={styles.btn}>
                    <Text style={styles.btnText}>Grant Permission</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.title}>Scan to Borrow</Text>
                <View style={{width: 24}} /> 
            </View>

            <View style={styles.cameraContainer}>
                <CameraView
                    style={StyleSheet.absoluteFillObject}
                    onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                    barcodeScannerSettings={{
                        barcodeTypes: ["qr"],
                    }}
                />
                <View style={styles.overlay}>
                    <Text style={styles.scanText}>San Engineer's QR Code</Text>
                    <View style={styles.scanFrame} />
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background, paddingTop: 50 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 20 },
    title: { fontSize: 20, fontWeight: 'bold', color: colors.text },
    text: { color: colors.text, textAlign: 'center', marginTop: 50 },
    btn: { backgroundColor: colors.primary, padding: 15, borderRadius: 10, margin: 20 },
    btnText: { color: 'white', fontWeight: 'bold', textAlign: 'center' },
    
    cameraContainer: { flex: 1, overflow: 'hidden', borderTopLeftRadius: 30, borderTopRightRadius: 30 },
    overlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center' },
    scanText: { color: 'white', fontSize: 18, fontWeight: 'bold', marginBottom: 50, backgroundColor: 'rgba(0,0,0,0.5)', padding: 10, borderRadius: 10 },
    scanFrame: { width: 250, height: 250, borderWidth: 2, borderColor: colors.primary, borderRadius: 20 }
});

export default WorkerToolsScreen;
