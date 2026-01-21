import { useState, useEffect, useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, Image, TextInput } from 'react-native';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import NetInfo from '@react-native-community/netinfo';
import { AuthContext } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import api from '../services/api';
import OfflineStorage from '../utils/offline';

const WorkerDashboardScreen = () => {
    const { t } = useLanguage();
    const { logout, userInfo } = useContext(AuthContext);
    const [location, setLocation] = useState(null);
    const [attendanceStatus, setAttendanceStatus] = useState('Unknown');
    const [logDescription, setLogDescription] = useState('');
    const [image, setImage] = useState(null);
    const [isConnected, setIsConnected] = useState(true);

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener(state => {
            setIsConnected(state.isConnected);
            if (state.isConnected) {
                syncOfflineLogs();
            }
        });

        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission to access location was denied');
                return;
            }

            let location = await Location.getCurrentPositionAsync({});
            setLocation(location);
        })();

        if (isConnected) fetchAttendance();

        return () => unsubscribe();
    }, [isConnected]);

    const syncOfflineLogs = async () => {
        const logs = await OfflineStorage.getLogs();
        if (logs.length === 0) return;

        console.log('Syncing offline logs...', logs.length);
        
        for (const log of logs) {
            try {
                // Determine if photo was a URI string or something else
                // Re-creating FormData might be tricky if image path is invalid now, but giving it a try
                const formData = new FormData();
                formData.append('description', log.description);
                if (log.lat) formData.append('lat', log.lat);
                if (log.lng) formData.append('lng', log.lng);
                formData.append('date', log.date);

                if (log.imageUri) {
                    let filename = log.imageUri.split('/').pop();
                    let match = /\.(\w+)$/.exec(filename);
                    let type = match ? `image/${match[1]}` : `image`;
                    formData.append('photo', { uri: log.imageUri, name: filename, type });
                }

                await api.post('/logs', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
            } catch (e) {
                console.error('Failed to sync log', e);
            }
        }
        await OfflineStorage.clearLogs();
        Alert.alert('Sync Complete', 'Offline logs have been uploaded.');
    };

    const fetchAttendance = async () => {
        try {
            const res = await api.get('/attendance');
            if (res.data.length > 0) {
                const today = new Date().toDateString();
                const lastRecord = res.data[0];
                const recordDate = new Date(lastRecord.date).toDateString();
                
                if (today === recordDate) {
                    setAttendanceStatus(lastRecord.checkOutTime ? 'Checked Out' : 'Checked In');
                } else {
                    setAttendanceStatus('Not Checked In');
                }
            } else {
                setAttendanceStatus('Not Checked In');
            }
        } catch (error) {
            console.log(error);
        }
    };

    const handleCheckIn = async () => {
        if (!isConnected) {
            Alert.alert('Offline', 'You need internet to Check In/Out for Geo-verification.');
            return;
        }
        if (!location) {
            Alert.alert('Wait', 'Fetching location...');
            return;
        }
        try {
            await api.post('/attendance/checkin', {
                lat: location.coords.latitude,
                lng: location.coords.longitude,
            });
            setAttendanceStatus('Checked In');
            Alert.alert('Success', 'Checked In Successfully');
        } catch (error) {
            Alert.alert('Error', error.response?.data?.message || 'Check-in failed');
        }
    };

    const handleCheckOut = async () => {
        if (!isConnected) {
            Alert.alert('Offline', 'You need internet to Check In/Out.');
            return;
        }
        try {
            await api.post('/attendance/checkout');
            setAttendanceStatus('Checked Out');
            Alert.alert('Success', 'Checked Out Successfully');
        } catch (error) {
            Alert.alert('Error', 'Check-out failed');
        }
    };

    const pickImage = async () => {
        let result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.5,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const submitLog = async () => {
        if (!logDescription) {
            Alert.alert('Error', 'Please provide description');
            return;
        }
        
        if (!isConnected) {
            // Save Offline
            const logData = {
                description: logDescription,
                lat: location?.coords?.latitude,
                lng: location?.coords?.longitude,
                imageUri: image,
                date: new Date().toISOString()
            };
            await OfflineStorage.saveLog(logData);
            Alert.alert('Offline', 'Log saved locally. Will sync when online.');
            setLogDescription('');
            setImage(null);
            return;
        }

        const formData = new FormData();
        formData.append('description', logDescription);
        if (location) {
            formData.append('lat', location.coords.latitude);
            formData.append('lng', location.coords.longitude);
        }
        
        if (image) {
            let filename = image.split('/').pop();
            let match = /\.(\w+)$/.exec(filename);
            let type = match ? `image/${match[1]}` : `image`;
            formData.append('photo', { uri: image, name: filename, type });
        }

        try {
            await api.post('/logs', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            Alert.alert('Success', 'Daily Log Submitted');
            setLogDescription('');
            setImage(null);
        } catch (error) {
            Alert.alert('Error', 'Log submission failed');
            console.log(error);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>{t('welcome')}, {userInfo?.name}</Text>
                <TouchableOpacity onPress={logout}><Text style={styles.logout}>{t('logout')}</Text></TouchableOpacity>
            </View>
            
            {!isConnected && <View style={styles.offlineBanner}><Text style={styles.bannerText}>You are Offline</Text></View>}

            <View style={styles.card}>
                <Text style={styles.heading}>{t('attendance')}</Text>
                <Text style={styles.status}>Status: {attendanceStatus}</Text>
                <View style={styles.row}>
                    <TouchableOpacity 
                        style={[styles.btn, attendanceStatus === 'Checked In' && styles.disabled]} 
                        onPress={handleCheckIn}
                        disabled={attendanceStatus === 'Checked In'}
                    >
                        <Text style={styles.btnText}>{t('checkIn')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.btn, attendanceStatus !== 'Checked In' && styles.disabled]} 
                        onPress={handleCheckOut}
                        disabled={attendanceStatus !== 'Checked In'}
                    >
                        <Text style={styles.btnText}>{t('checkOut')}</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.card}>
                <Text style={styles.heading}>{t('dailyLog')}</Text>
                <TextInput
                    style={styles.input}
                    placeholder={t('description')}
                    multiline
                    value={logDescription}
                    onChangeText={setLogDescription}
                />
                <TouchableOpacity style={styles.imgBtn} onPress={pickImage}>
                    <Text style={styles.btnText}>{t('photo')}</Text>
                </TouchableOpacity>
                {image && <Image source={{ uri: image }} style={styles.preview} />}
                
                <TouchableOpacity style={styles.submitBtn} onPress={submitLog}>
                    <Text style={styles.btnText}>{t('submit')}</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { padding: 20, paddingTop: 50 },
    header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
    title: { fontSize: 20, fontWeight: 'bold' },
    logout: { color: 'red' },
    card: { backgroundColor: 'white', padding: 15, borderRadius: 10, marginBottom: 20, elevation: 2 },
    heading: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
    status: { marginBottom: 10, color: '#555' },
    row: { flexDirection: 'row', justifyContent: 'space-between' },
    btn: { backgroundColor: 'green', padding: 10, borderRadius: 5, width: '45%', alignItems: 'center' },
    disabled: { backgroundColor: '#ccc' },
    btnText: { color: 'white', fontWeight: 'bold' },
    input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 5, padding: 10, height: 80, textAlignVertical: 'top', marginBottom: 10 },
    imgBtn: { backgroundColor: '#007AFF', padding: 10, borderRadius: 5, alignItems: 'center', marginBottom: 10 },
    preview: { width: '100%', height: 200, borderRadius: 10, marginBottom: 10 },
    submitBtn: { backgroundColor: '#000', padding: 15, borderRadius: 5, alignItems: 'center' },
    offlineBanner: { backgroundColor: 'red', padding: 10, alignItems: 'center', marginBottom: 10, borderRadius: 5 },
    bannerText: { color: 'white', fontWeight: 'bold' }
});

export default WorkerDashboardScreen;
