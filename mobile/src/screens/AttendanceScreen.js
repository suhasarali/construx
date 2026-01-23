import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';

const logLocationInfo = (loc, source) => {
  const now = Date.now();
  const ageSeconds = ((now - loc.timestamp) / 1000).toFixed(1);

  console.log('📍 GPS DEBUG');
  console.log('Source:', source);
  console.log('Latitude:', loc.coords.latitude);
  console.log('Longitude:', loc.coords.longitude);
  console.log('Accuracy (meters):', loc.coords.accuracy);
  console.log('Location Age (seconds):', ageSeconds);

  if (ageSeconds > 10) {
    console.warn('⚠️ Location is OLD (cached)');
  }

  if (loc.coords.accuracy > 100) {
    console.warn('⚠️ GPS accuracy is POOR');
  }

  if (ageSeconds <= 5 && loc.coords.accuracy <= 50) {
    console.log('✅ REAL-TIME GPS CONFIRMED');
  }

  console.log('-------------------------');
};


const AttendanceScreen = () => {
  const [location, setLocation] = useState(null);
  const [status, setStatus] = useState('Loading...');
  const [loading, setLoading] = useState(false);
  const [photo, setPhoto] = useState(null);

  const locationSub = useRef(null);
  const timeoutRef = useRef(null);

  /* -------------------- FETCH ATTENDANCE STATUS -------------------- */
  const fetchStatus = async () => {
    try {
      const res = await api.get('/attendance');

      if (res.data.length > 0) {
        const today = new Date().toDateString();

        const lastRecord = res.data.sort(
          (a, b) => new Date(b.date) - new Date(a.date)
        )[0];

        const recordDate = new Date(lastRecord.date).toDateString();

        if (today === recordDate) {
          setStatus(lastRecord.checkOutTime ? 'Checked Out' : 'Checked In');
        } else {
          setStatus('Not Checked In');
        }
      } else {
        setStatus('Not Checked In');
      }
    } catch (err) {
      console.error(err);
      setStatus('Error');
    }
  };

  /* -------------------- LOCATION HANDLING -------------------- */
  const refreshLocation = async () => {
    setLoading(true);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location access is required.');
        setLoading(false);
        return;
      }

      // 1️⃣ Try last known location (fast)
      const lastKnown = await Location.getLastKnownPositionAsync({});
      if (lastKnown) {
        logLocationInfo(lastKnown, 'getLastKnownPositionAsync');
        setLocation(lastKnown);
        setLoading(false);
        return;
      }

      // 2️⃣ Watch location (emulator friendly)
      locationSub.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 1000,
          distanceInterval: 1,
        },
        (location) => {
        logLocationInfo(location, 'REALTIME (watchPosition)');
        setLocation(location);
        setLoading(false);
        locationSub.current?.remove();
        locationSub.current = null;
        }

      );

      // 3️⃣ Timeout fallback
      timeoutRef.current = setTimeout(() => {
        if (!location) {
          locationSub.current?.remove();
          locationSub.current = null;
          setLoading(false);
          Alert.alert('Timeout', 'Unable to fetch location');
        }
      }, 10000);
    } catch (err) {
      console.log('Location Error:', err);
      Alert.alert('Location Error', 'Enable GPS and try again.');
      setLoading(false);
    }
  };

  /* -------------------- CAMERA -------------------- */
  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Camera access is needed.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      aspect: [4, 3],
      quality: 0.5,
    });

    if (!result.canceled) {
      setPhoto(result.assets[0].uri);
    }
  };

  /* -------------------- CHECK IN / CHECK OUT -------------------- */
  const handleAction = async (type) => {
    if (!location) {
      Alert.alert('Wait', 'Fetching location...');
      return;
    }

    if (!photo) {
      Alert.alert('Photo Required', 'Please take a selfie.');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('lat', location.coords.latitude);
      formData.append('lng', location.coords.longitude);

      const filename = photo.split('/').pop();
      const ext = filename.split('.').pop();

      formData.append('photo', {
        uri: photo,
        name: filename,
        type: `image/${ext}`,
      });

      const endpoint =
        type === 'CheckIn'
          ? '/attendance/checkin'
          : '/attendance/checkout';

      await api.post(endpoint, formData);

      Alert.alert('Success', `${type} successful`);
      setPhoto(null);
      fetchStatus();
    } catch (err) {
      Alert.alert(
        'Error',
        err.response?.data?.message || 'Action failed'
      );
    } finally {
      setLoading(false);
    }
  };

  /* -------------------- EFFECTS -------------------- */
  useEffect(() => {
    refreshLocation();
    fetchStatus();

    return () => {
      locationSub.current?.remove();
      clearTimeout(timeoutRef.current);
    };
  }, []);

  /* -------------------- UI -------------------- */
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Attendance</Text>

      {!location && (
        <TouchableOpacity onPress={refreshLocation} style={styles.retry}>
          <Text style={styles.retryText}>
            📍 Retry Location {loading ? '(Fetching...)' : ''}
          </Text>
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
            <TouchableOpacity
              onPress={() => setPhoto(null)}
              style={styles.retakeBtn}
            >
              <Text style={{ color: 'white' }}>Retake</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.cameraBtn}
            onPress={takePhoto}
            disabled={loading}
          >
            <Ionicons name="camera" size={40} color="white" />
            <Text style={styles.cameraText}>Take Selfie</Text>
          </TouchableOpacity>
        )}

        <View style={styles.buttons}>
          <TouchableOpacity
            style={[
              styles.btn,
              styles.inBtn,
              (status === 'Checked In' || status === 'Checked Out') &&
                styles.disabled,
            ]}
            disabled={
              status === 'Checked In' ||
              status === 'Checked Out' ||
              loading
            }
            onPress={() => handleAction('CheckIn')}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.btnText}>Check In</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.btn,
              styles.outBtn,
              status !== 'Checked In' && styles.disabled,
            ]}
            disabled={status !== 'Checked In' || loading}
            onPress={() => handleAction('CheckOut')}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.btnText}>Check Out</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

/* -------------------- STYLES -------------------- */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#F2F2F7',
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  retry: {
    marginBottom: 20,
    alignSelf: 'flex-start',
  },
  retryText: {
    color: '#007AFF',
    fontSize: 16,
  },
  statusCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 30,
  },
  label: { color: '#8E8E93', marginBottom: 5 },
  value: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  actionArea: { flex: 1, justifyContent: 'center' },
  cameraBtn: {
    backgroundColor: '#3A3A3C',
    padding: 30,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 30,
  },
  cameraText: {
    color: 'white',
    marginTop: 10,
    fontWeight: 'bold',
  },
  photoContainer: { alignItems: 'center', marginBottom: 30 },
  preview: { width: 200, height: 200, borderRadius: 100 },
  retakeBtn: {
    backgroundColor: 'red',
    padding: 8,
    borderRadius: 5,
    marginTop: 10,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  btn: {
    width: '48%',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
  },
  inBtn: { backgroundColor: '#34C759' },
  outBtn: { backgroundColor: '#FF3B30' },
  disabled: { opacity: 0.3 },
  btnText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default AttendanceScreen;
