import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Image, ActivityIndicator } from 'react-native';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import api from '../services/api';
import { Ionicons } from '@expo/vector-icons';

const AttendanceScreen = () => {
    const [location, setLocation] = useState(null);
    const [status, setStatus] = useState('Loading...');
    const [loading, setLoading] = useState(false);
    const [photo, setPhoto] = useState(null);

    const fetchStatus = async () => {
        try {
            const res = await api.get('/attendance');
            if (res.data.length > 0) {
                 const today = new Date().toDateString();
                 const lastRecord = res.data[0];
                 const recordDate = new Date(lastRecord.date).toDateString();
                 if (today === recordDate) {
                     setStatus(lastRecord.checkOutTime ? 'Checked Out' : 'Checked In');
                 } else {
                     setStatus('Not Checked In');
                 }
            } else {
                setStatus('Not Checked In');
            }
        } catch (error) {
            console.error(error);
            setStatus('Error');
        }
    };

    const refreshLocation = async () => {
        setLoading(true);
        try {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission denied', 'Allow location access to check in.');
                setLoading(false);
                return;
            }

            // Try last known first
            let lastKnown = await Location.getLastKnownPositionAsync({});
            if (lastKnown) {
                setLocation(lastKnown);
                setLoading(false);
                return;
            }

            // Watch for updates (better for emulator)
            const subscription = await Location.watchPositionAsync(
                { accuracy: Location.Accuracy.Balanced, timeInterval: 1000, distanceInterval: 1 },
                (newLoc) => {
                    setLocation(newLoc);
                    setLoading(false);
                    subscription.remove(); // Stop watching after first fix
                }
            );

            // Timeout fallback
            setTimeout(() => {
                if (!location) {
                    // subscription.remove(); // Can't easily remove from here without ref logic, but it's fine
                     setLoading(false);
                }
            }, 10000);

        } catch (error) {
            console.log('Loc Error:', error);
            Alert.alert('Location Error', 'Ensure GPS is enabled in Emulator settings.');
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshLocation();
        fetchStatus();
    }, []);

    const takePhoto = async () => {
        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            items: [4, 3],
            quality: 0.5,
        });

        if (!result.canceled) {
            setPhoto(result.assets[0].uri);
        }
    };

    const handleAction = async (type) => { // type = 'CheckIn' or 'CheckOut'
        if (!location) {
            Alert.alert('Wait', 'Fetching location...');
            return;
        }
        if (!photo) {
            Alert.alert('Photo Required', 'Please take a selfie to verify attendance.');
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('lat', location.coords.latitude);
            formData.append('lng', location.coords.longitude);
            // formData.append('address', 'Unknown'); // We could reverse geocode if needed
            
            let filename = photo.split('/').pop();
            let match = /\.(\w+)$/.exec(filename);
            let imgType = match ? `image/${match[1]}` : `image`;
            formData.append('photo', { uri: photo, name: filename, type: imgType });

            const endpoint = type === 'CheckIn' ? '/attendance/checkin' : '/attendance/checkout';
            
            await api.post(endpoint, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            Alert.alert('Success', `${type} Successful`);
            setPhoto(null);
            fetchStatus();
        } catch (error) {
            Alert.alert('Error', error.response?.data?.message || 'Action failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Attendance</Text>
            
            {!location && (
                <TouchableOpacity onPress={refreshLocation} style={{marginBottom: 20, alignSelf:'flex-start'}}>
                    <Text style={{color: '#007AFF', fontSize: 16}}>📍 Retry Location {loading ? '(Fetching...)' : ''}</Text>
                </TouchableOpacity>
            )}
            
            <View style={styles.statusCard}>
                <Text style={styles.label}>Current Status</Text>
                <Text style={styles.value}>{status}</Text>
            </View>

            <View style={styles.actionArea}>
                {photo ? (
                    <View style={styles.photoContainer}>
                        <Image source={{ uri: photo }} style={styles.preview} />
                        <TouchableOpacity onPress={() => setPhoto(null)} style={styles.retakeBtn}>
                            <Text style={{color:'white'}}>Retake</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <TouchableOpacity style={styles.cameraBtn} onPress={takePhoto}>
                        <Ionicons name="camera" size={40} color="white" />
                        <Text style={styles.cameraText}>Take Selfie</Text>
                    </TouchableOpacity>
                )}

                <View style={styles.buttons}>
                    <TouchableOpacity 
                        style={[styles.btn, styles.inBtn, (status === 'Checked In' || status === 'Checked Out') && styles.disabled]}
                        onPress={() => handleAction('CheckIn')}
                        disabled={status === 'Checked In' || status === 'Checked Out' || loading}
                    >
                        {loading ? <ActivityIndicator color="white" /> : <Text style={styles.btnText}>Check In</Text>}
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={[styles.btn, styles.outBtn, status !== 'Checked In' && styles.disabled]}
                        onPress={() => handleAction('CheckOut')}
                        disabled={status !== 'Checked In' || loading}
                    >
                         {loading ? <ActivityIndicator color="white" /> : <Text style={styles.btnText}>Check Out</Text>}
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, paddingTop: 60, backgroundColor: '#F2F2F7' },
    header: { fontSize: 28, fontWeight: 'bold', marginBottom: 30 },
    statusCard: { backgroundColor: 'white', padding: 20, borderRadius: 12, alignItems: 'center', marginBottom: 30 },
    label: { color: '#8E8E93', marginBottom: 5 },
    value: { fontSize: 24, fontWeight: 'bold', color: '#007AFF' },
    actionArea: { flex: 1, justifyContent: 'center' },
    cameraBtn: { backgroundColor: '#3A3A3C', padding: 30, borderRadius: 20, alignItems: 'center', marginBottom: 30 },
    cameraText: { color: 'white', marginTop: 10, fontWeight: 'bold' },
    photoContainer: { alignItems: 'center', marginBottom: 30 },
    preview: { width: 200, height: 200, borderRadius: 100, marginBottom: 10 },
    retakeBtn: { backgroundColor: 'red', padding: 8, borderRadius: 5 },
    buttons: { flexDirection: 'row', justifyContent: 'space-between' },
    btn: { width: '48%', padding: 20, borderRadius: 15, alignItems: 'center' },
    inBtn: { backgroundColor: '#34C759' },
    outBtn: { backgroundColor: '#FF3B30' },
    disabled: { opacity: 0.3 },
    btnText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});

export default AttendanceScreen;
