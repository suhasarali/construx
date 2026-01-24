import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, Image } from 'react-native';
import { colors } from '../constants/colors';
import * as ImagePicker from 'expo-image-picker';
import api from '../services/api';
import { Ionicons } from '@expo/vector-icons';

const DPRScreen = () => {
    const [workSummary, setWorkSummary] = useState('');
    // const [laborCount, setLaborCount] = useState(''); // Removed per request
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
        if (!workSummary) {
            Alert.alert('Error', 'Work Summary is required');
            return;
        }

        const formData = new FormData();
        formData.append('workSummary', workSummary);
        formData.append('laborCount', 0); // Default to 0 as it's removed from UI
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
            setWorkSummary('');
            // setLaborCount('');
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
                {/* Labor Count Removed */}
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
    container: { padding: 24, paddingTop: 60, paddingBottom: 100, backgroundColor: colors.background, flexGrow: 1 },
    title: { fontSize: 32, fontWeight: '900', marginBottom: 30, color: colors.text, letterSpacing: 1 },
    section: { marginBottom: 24 },
    label: { fontSize: 16, fontWeight: '700', marginBottom: 12, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1 },
    input: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 16,
        padding: 16,
        fontSize: 16,
        backgroundColor: colors.inputBg,
        color: colors.text
    },
    textArea: { height: 120, textAlignVertical: 'top' },
    photoRow: { flexDirection: 'row' },
    thumb: { width: 90, height: 90, borderRadius: 16, marginRight: 12, borderWidth: 1, borderColor: colors.border },
    addPhoto: {
        width: 90,
        height: 90,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        borderStyle: 'dashed',
        backgroundColor: colors.surfaceHighlight
    },
    submitBtn: {
        backgroundColor: colors.primary,
        padding: 20,
        borderRadius: 20,
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 40,
        shadowColor: colors.primary,
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 5
    },
    btnText: { color: colors.textInverted, fontWeight: 'bold', fontSize: 18, textTransform: 'uppercase' }
});

export default DPRScreen;
