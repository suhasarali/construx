import React, { useState, useEffect, useRef, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';

import * as Location from 'expo-location';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { colors } from '../constants/colors';
import { Ionicons } from '@expo/vector-icons';

const BiometricAttendanceScreen = ({ navigation }) => {
    const [permission, requestPermission] = useCameraPermissions();
    const [isVerifying, setIsVerifying] = useState(false);
    const cameraRef = useRef(null);
    const [statusMessage, setStatusMessage] = useState('Align face to mark attendance');
    const { userInfo } = useContext(AuthContext);

    if (!permission) return <View />;
    if (!permission.granted) {
        return (
            <View style={styles.container}>
                <Text style={styles.text}>Camera permission required</Text>
                <TouchableOpacity onPress={requestPermission} style={styles.button}>
                    <Text style={styles.buttonText}>Grant</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const handleVerify = async () => {
        if (cameraRef.current && !isVerifying) {
            setIsVerifying(true);
            setStatusMessage('Verifying...');

            try {
                // 1. Capture Image
                const photo = await cameraRef.current.takePictureAsync({ quality: 0.5, base64: true });

                // 2. Get Location
                const location = await Location.getCurrentPositionAsync({});

                // 3. Send to Backend for Verification (Server-Side AI)
                // The backend will compare this image with the enrolled one.
                const response = await api.post('/face-auth/verify', {
                    image: `data:image/jpeg;base64,${photo.base64}`,
                    location: location.coords,
                    deviceId: 'mobile-app'
                });

                if (response.data) {
                    setStatusMessage('Verified! Marking Attendance...');

                    // Success handling
                    Alert.alert('Success', `Attendance Marked: ${response.data.type || 'Success'}`);
                    navigation.goBack();
                } else {
                    setStatusMessage('Face not recognized. Try again.');
                    Alert.alert('Failed', 'Face not recognized.');
                }

            } catch (error) {
                console.error(error);
                setStatusMessage('Error during verification');
                Alert.alert('Error', 'Failed to mark attendance. Please try again.');
            } finally {
                setIsVerifying(false);
            }
        }
    };

    return (
        <View style={styles.container}>
            <CameraView style={styles.camera} facing="front" ref={cameraRef}>
                <View style={styles.overlay}>
                    <View style={[styles.guideFrame, isVerifying ? styles.scanning : null]}>
                        {/* Optional: Add a subtle icon inside frame if not scanning */}
                        {!isVerifying && <Ionicons name="scan-outline" size={100} color="rgba(255,255,255,0.3)" />}
                    </View>
                    <Text style={styles.statusText}>{statusMessage}</Text>
                </View>
                <View style={styles.controls}>
                    <TouchableOpacity
                        style={styles.verifyButton}
                        onPress={handleVerify}
                        disabled={isVerifying}
                    >
                        {isVerifying ? (
                            <ActivityIndicator size="large" color={colors.primary} />
                        ) : (
                            <Ionicons name="finger-print" size={40} color={colors.primary} />
                        )}
                    </TouchableOpacity>
                </View>
            </CameraView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    camera: { flex: 1 },
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.2)',
    },
    guideFrame: {
        width: 300,
        height: 300,
        borderWidth: 2,
        borderColor: '#fff',
        borderRadius: 150,
        marginBottom: 40,
        justifyContent: 'center',
        alignItems: 'center'
    },
    scanning: {
        borderColor: colors.success,
        borderWidth: 4,
    },
    statusText: {
        fontSize: 22,
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: -1, height: 1 },
        textShadowRadius: 10
    },
    controls: {
        position: 'absolute',
        bottom: 60,
        width: '100%',
        alignItems: 'center',
    },
    verifyButton: {
        backgroundColor: 'white',
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 10,
    },
    verifyText: {
        // Hidden, using icon
        display: 'none'
    },
    text: { textAlign: 'center', marginTop: 50 },
    button: { backgroundColor: colors.primary, padding: 10, marginTop: 10, alignSelf: 'center' },
    buttonText: { color: '#fff' }
});

export default BiometricAttendanceScreen;
