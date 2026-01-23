import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, Image, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import api from '../services/api';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const DailyWorkScreen = () => {
    const navigation = useNavigation();
    const [workSummary, setWorkSummary] = useState('');
    const [photos, setPhotos] = useState([]);
    const [loading, setLoading] = useState(false);

    const pickImage = async () => {
        let result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.5,
        });

        if (!result.canceled) {
            setPhotos([...photos, result.assets[0].uri]);
        }
    };

    const submitDailyWork = async () => {
        if (!workSummary) {
            Alert.alert('Error', 'Please describe your work today.');
            return;
        }

        setLoading(true);
        const formData = new FormData();
        formData.append('workSummary', workSummary);
        formData.append('date', new Date().toISOString());
        formData.append('type', 'WorkerLog');

        photos.forEach((photo, index) => {
            let filename = photo.split('/').pop();
            let match = /\.(\w+)$/.exec(filename);
            let type = match ? `image/${match[1]}` : `image`;
            formData.append('photos', { uri: photo, name: filename, type });
        });

        try {
            await api.post('/reports', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            Alert.alert('Success', 'Daily Work Submitted', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to submit daily work.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.title}>Daily Work Upload</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.label}>What did you do today?</Text>
                <TextInput 
                    style={[styles.input, styles.textArea]} 
                    multiline 
                    placeholder="Describe your work..."
                    value={workSummary} 
                    onChangeText={setWorkSummary} 
                />
            </View>

            <View style={styles.section}>
                <Text style={styles.label}>Photos (Optional)</Text>
                <ScrollView horizontal style={styles.photoRow}>
                    {photos.map((uri, index) => (
                        <Image key={index} source={{ uri }} style={styles.thumb} />
                    ))}
                    <TouchableOpacity style={styles.addPhoto} onPress={pickImage}>
                        <Ionicons name="camera" size={30} color="#007AFF" />
                    </TouchableOpacity>
                </ScrollView>
            </View>

            <TouchableOpacity 
                style={[styles.submitBtn, loading && styles.disabledBtn]} 
                onPress={submitDailyWork}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.btnText}>Submit Daily Work</Text>
                )}
            </TouchableOpacity>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { padding: 20, paddingTop: 50, backgroundColor: '#f5f5f5', flexGrow: 1 },
    header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
    backBtn: { marginRight: 15 },
    title: { fontSize: 24, fontWeight: 'bold' },
    section: { marginBottom: 20, backgroundColor: '#fff', padding: 15, borderRadius: 10 },
    label: { fontSize: 16, fontWeight: '600', marginBottom: 10, color: '#333' },
    input: { fontSize: 16, color: '#333' },
    textArea: { height: 120, textAlignVertical: 'top' },
    photoRow: { flexDirection: 'row' },
    thumb: { width: 80, height: 80, borderRadius: 10, marginRight: 10 },
    addPhoto: { width: 80, height: 80, borderRadius: 10, borderWidth: 1, borderColor: '#007AFF', justifyContent: 'center', alignItems: 'center', borderStyle: 'dashed' },
    submitBtn: { backgroundColor: '#007AFF', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 10 },
    disabledBtn: { backgroundColor: '#ccc' },
    btnText: { color: 'white', fontWeight: 'bold', fontSize: 18 }
});

export default DailyWorkScreen;
