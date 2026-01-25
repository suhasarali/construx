import React, { useState, useEffect, useRef, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';

import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { colors } from '../constants/colors';
import { Ionicons } from '@expo/vector-icons';

const FaceEnrollmentScreen = ({ navigation }) => {
    const [permission, requestPermission] = useCameraPermissions();
    const [isProcessing, setIsProcessing] = useState(false);
    const cameraRef = useRef(null);
    const { userInfo } = useContext(AuthContext);

    if (!permission) {
        return <View />;
    }

    if (!permission.granted) {
        return (
            <View style={styles.container}>
                <Text style={styles.text}>We need your permission to show the camera</Text>
                <TouchableOpacity onPress={requestPermission} style={styles.button}>
                    <Text style={styles.buttonText}>Grant Permission</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const handleEnroll = async () => {
        if (cameraRef.current && !isProcessing) {
            setIsProcessing(true);
            try {
                const photo = await cameraRef.current.takePictureAsync({ quality: 0.5, base64: true });

                // 2. Send Image to Backend (Server-Side AI)
                await api.post('/face-auth/register', {
                    image: `data:image/jpeg;base64,${photo.base64}`
                });

                Alert.alert('Success', 'Face enrolled successfully!');
                navigation.goBack();

            } catch (error) {
                console.error(error);
                Alert.alert('Error', 'Failed to enroll face. Please try again.');
            } finally {
                setIsProcessing(false);
            }
        }
    };



    return (
        <View style={styles.container}>
            <CameraView style={styles.camera} facing="front" ref={cameraRef}>
                <View style={styles.overlay}>
                    <View style={styles.guideFrame}>
                        {/* Corner markers could go here for "tech" feel, keeping it simple for now */}
                    </View>
                    <Text style={styles.instructionText}>Position your face within the frame</Text>
                </View>
                <View style={styles.controls}>
                    <TouchableOpacity
                        style={[styles.captureButton, isProcessing && styles.disabledButton]}
                        onPress={handleEnroll}
                        disabled={isProcessing}
                    >
                        {isProcessing ? (
                            <ActivityIndicator size="large" color="#fff" />
                        ) : (
                            <Ionicons name="camera" size={40} color="white" />
                        )}
                    </TouchableOpacity>
                </View>
            </CameraView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
    },
    camera: {
        flex: 1,
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.3)', // Darker overlay for focus
        justifyContent: 'center',
        alignItems: 'center',
    },
    guideFrame: {
        width: 280,
        height: 350,
        borderWidth: 2,
        borderColor: colors.info,
        borderRadius: 30, // More like a face frame
        backgroundColor: 'transparent',
    },
    instructionText: {
        marginTop: 40,
        color: '#fff',
        fontSize: 20,
        fontWeight: '600',
        textAlign: 'center',
        paddingHorizontal: 20
    },
    controls: {
        position: 'absolute',
        bottom: 50,
        width: '100%',
        alignItems: 'center',
    },
    captureButton: {
        backgroundColor: colors.info,
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 4,
        borderColor: 'rgba(255,255,255,0.3)'
    },
    disabledButton: {
        backgroundColor: '#666',
        borderColor: '#999'
    },
    captureText: {
        // Not used anymore if using Icon
        display: 'none'
    },
    text: {
        textAlign: 'center',
        marginBottom: 20,
        fontSize: 16
    },
    button: {
        backgroundColor: '#007AFF',
        padding: 10,
        borderRadius: 5,
        alignSelf: 'center'
    },
    buttonText: {
        color: 'white'
    }
});

export default FaceEnrollmentScreen;
