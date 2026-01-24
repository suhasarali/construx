import React, { useState, useEffect, useRef, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import FaceRecognitionService from '../services/FaceRecognitionService';
import * as Location from 'expo-location';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

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

                // 3. Generate Embedding (Mock for now)
                const liveEmbedding = Array(128).fill(0).map(() => Math.random());

                // 4. Match against stored embedding (Mock)
                // In real app: const storedEmbedding = await AsyncStorage.getItem('userEmbedding');
                const storedEmbedding = liveEmbedding; // Simulate match

                const isMatch = FaceRecognitionService.isMatch(liveEmbedding, storedEmbedding);

                if (isMatch) {
                    setStatusMessage('Verified! Marking Attendance...');

                    // 5. Call Backend
                    const response = await api.post('/face-auth/verify', {
                        userId: userInfo.id,
                        confidence: 0.95, // Mock confidence
                        location: {
                            lat: location.coords.latitude,
                            lng: location.coords.longitude,
                            address: 'Unknown' // Ideally reverse geocode here
                        },
                        deviceId: 'Mobile-App'
                    });

                    Alert.alert('Success', `Attendance Marked: ${response.data.type}`);
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
                    <View style={[styles.guideFrame, isVerifying ? styles.scanning : null]} />
                    <Text style={styles.statusText}>{statusMessage}</Text>
                </View>
                <View style={styles.controls}>
                    <TouchableOpacity
                        style={styles.verifyButton}
                        onPress={handleVerify}
                        disabled={isVerifying}
                    >
                        {isVerifying ? <ActivityIndicator color="#000" /> : <Text style={styles.verifyText}>Verify & Mark</Text>}
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
        backgroundColor: 'transparent',
    },
    guideFrame: {
        width: 280,
        height: 280,
        borderWidth: 3,
        borderColor: '#fff',
        borderRadius: 140,
        marginBottom: 20,
    },
    scanning: {
        borderColor: '#00FF00',
    },
    statusText: {
        fontSize: 20,
        color: 'white',
        fontWeight: 'bold',
        backgroundColor: 'rgba(0,0,0,0.6)',
        padding: 10,
        borderRadius: 8,
    },
    controls: {
        position: 'absolute',
        bottom: 50,
        alignSelf: 'center',
        width: '100%',
        alignItems: 'center',
    },
    verifyButton: {
        backgroundColor: '#fff',
        paddingVertical: 15,
        paddingHorizontal: 50,
        borderRadius: 30,
        elevation: 5,
    },
    verifyText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
    },
    text: { textAlign: 'center', marginTop: 50 },
    button: { backgroundColor: '#007AFF', padding: 10, marginTop: 10, alignSelf: 'center' },
    buttonText: { color: '#fff' }
});

export default BiometricAttendanceScreen;
