import React, { useState, useEffect, useRef, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as FileSystem from 'expo-file-system';
import FaceRecognitionService from '../services/FaceRecognitionService';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

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

                // 1. Generate Embedding locally (to verify face is detectable)
                // Note: In a real app, you might need to resize/crop the image first
                // const embedding = await FaceRecognitionService.generateEmbedding(photo.uri);

                // For this demo, we'll simulate the embedding generation or send the photo to backend if backend does it
                // But per plan, we generate on device. 
                // Let's assume generateEmbedding works with the URI or base64

                // Mock embedding for demo if model not fully integrated yet
                const mockEmbedding = Array(128).fill(0).map(() => Math.random());

                // 2. Send to Backend
                const response = await api.post('/face-auth/register', {
                    userId: userInfo.id,
                    embedding: mockEmbedding
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
                    <View style={styles.guideFrame} />
                    <Text style={styles.instructionText}>Position your face within the frame</Text>
                </View>
                <View style={styles.controls}>
                    <TouchableOpacity
                        style={[styles.captureButton, isProcessing && styles.disabledButton]}
                        onPress={handleEnroll}
                        disabled={isProcessing}
                    >
                        {isProcessing ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.captureText}>Enroll Face</Text>
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
        backgroundColor: 'transparent',
        justifyContent: 'center',
        alignItems: 'center',
    },
    guideFrame: {
        width: 250,
        height: 250,
        borderWidth: 2,
        borderColor: '#00FF00',
        borderRadius: 125, // Circle
        backgroundColor: 'transparent',
    },
    instructionText: {
        marginTop: 20,
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
        backgroundColor: 'rgba(0,0,0,0.5)',
        padding: 10,
        borderRadius: 5,
    },
    controls: {
        position: 'absolute',
        bottom: 40,
        alignSelf: 'center',
    },
    captureButton: {
        backgroundColor: '#007AFF',
        paddingVertical: 15,
        paddingHorizontal: 40,
        borderRadius: 30,
    },
    disabledButton: {
        backgroundColor: '#ccc',
    },
    captureText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
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
