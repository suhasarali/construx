import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, Image, ActivityIndicator } from 'react-native';
import { colors } from '../constants/colors';
import * as ImagePicker from 'expo-image-picker';
import api from '../services/api';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const DailyWorkScreen = () => {
    const navigation = useNavigation();
    const [workSummary, setWorkSummary] = useState('');
    const [issues, setIssues] = useState(''); // New state for issues
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
        formData.append('issuesRaised', issues); // Append issues
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
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
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
                <Text style={styles.label}>Issues / Obstacles</Text>
                <TextInput
                    style={[styles.input, styles.textArea]}
                    multiline
                    placeholder="Any blockers or issues?"
                    value={issues}
                    onChangeText={setIssues}
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
    container: { padding: 24, paddingTop: 60, paddingBottom: 120, backgroundColor: colors.background, flexGrow: 1 },
    header: { flexDirection: 'row', alignItems: 'center', marginBottom: 30 },
    backBtn: { marginRight: 15, padding: 8, backgroundColor: colors.surfaceHighlight, borderRadius: 12 },
    title: { fontSize: 28, fontWeight: '900', color: colors.text, letterSpacing: 1 },
    section: { marginBottom: 24, backgroundColor: colors.surface, padding: 24, borderRadius: 24, borderWidth: 1, borderColor: colors.border },
    label: { fontSize: 16, fontWeight: '700', marginBottom: 16, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1 },
    input: { fontSize: 16, color: colors.text, backgroundColor: colors.inputBg, borderRadius: 12, padding: 16 },
    textArea: { height: 140, textAlignVertical: 'top' },
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
        marginTop: 10,
        shadowColor: colors.primary,
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 5
    },
    disabledBtn: { backgroundColor: colors.surfaceHighlight, opacity: 0.5 },
    btnText: { color: colors.textInverted, fontWeight: 'bold', fontSize: 18, textTransform: 'uppercase' }
});

export default DailyWorkScreen;
