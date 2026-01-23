import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import api from '../services/api';
import { Ionicons } from '@expo/vector-icons';

const DPRScreen = () => {
    const [workSummary, setWorkSummary] = useState('');
    const [laborCount, setLaborCount] = useState('');
    const [issues, setIssues] = useState('');
    const [remarks, setRemarks] = useState('');
    const [photos, setPhotos] = useState([]);

    const pickImage = async () => {
        let result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.5,
        });

        if (!result.canceled) {
            setPhotos([...photos, result.assets[0].uri]);
        }
    };

    const submitDPR = async () => {
        if (!workSummary || !laborCount) {
            Alert.alert('Error', 'Work Summary and Labor Count are required');
            return;
        }

        const formData = new FormData();
        formData.append('workSummary', workSummary);
        formData.append('laborCount', laborCount);
        formData.append('issuesRaised', issues);
        formData.append('remarks', remarks);
        formData.append('date', new Date().toISOString());
        formData.append('type', 'DPR');

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
            Alert.alert('Success', 'DPR Submitted Successfully');
            // Reset form
            setWorkSummary('');
            setLaborCount('');
            setIssues('');
            setRemarks('');
            setPhotos([]);
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to submit DPR');
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Daily Progress Report</Text>

            <View style={styles.section}>
                <Text style={styles.label}>Labor Count</Text>
                <TextInput 
                    style={styles.input} 
                    keyboardType="numeric" 
                    placeholder="Number of workers"
                    value={laborCount} 
                    onChangeText={setLaborCount} 
                />
            </View>

            <View style={styles.section}>
                <Text style={styles.label}>Work Summary</Text>
                <TextInput 
                    style={[styles.input, styles.textArea]} 
                    multiline 
                    placeholder="Describe work done today..."
                    value={workSummary} 
                    onChangeText={setWorkSummary} 
                />
            </View>

            <View style={styles.section}>
                <Text style={styles.label}>Issues / Obstacles</Text>
                <TextInput 
                    style={[styles.input, styles.textArea]} 
                    multiline 
                    placeholder="Any blockers?"
                    value={issues} 
                    onChangeText={setIssues} 
                />
            </View>

            <View style={styles.section}>
                <Text style={styles.label}>Photos</Text>
                <ScrollView horizontal style={styles.photoRow}>
                    {photos.map((uri, index) => (
                        <Image key={index} source={{ uri }} style={styles.thumb} />
                    ))}
                    <TouchableOpacity style={styles.addPhoto} onPress={pickImage}>
                        <Ionicons name="camera" size={30} color="#007AFF" />
                    </TouchableOpacity>
                </ScrollView>
            </View>

            <TouchableOpacity style={styles.submitBtn} onPress={submitDPR}>
                <Text style={styles.btnText}>Submit Report</Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { padding: 20, paddingTop: 60, backgroundColor: '#fff', flexGrow: 1 },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 30 },
    section: { marginBottom: 20 },
    label: { fontSize: 16, fontWeight: '600', marginBottom: 10, color: '#333' },
    input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, fontSize: 16, backgroundColor: '#F9F9F9' },
    textArea: { height: 100, textAlignVertical: 'top' },
    photoRow: { flexDirection: 'row' },
    thumb: { width: 80, height: 80, borderRadius: 10, marginRight: 10 },
    addPhoto: { width: 80, height: 80, borderRadius: 10, borderWidth: 1, borderColor: '#007AFF', justifyContent: 'center', alignItems: 'center',borderStyle: 'dashed' },
    submitBtn: { backgroundColor: '#000', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 20, marginBottom: 40 },
    btnText: { color: 'white', fontWeight: 'bold', fontSize: 18 }
});

export default DPRScreen;
