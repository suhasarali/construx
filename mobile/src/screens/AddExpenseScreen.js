import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, Image, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera'; // Using latest Expo Camera
import * as ImagePicker from 'expo-image-picker';
import api from '../services/api';
import { colors } from '../constants/colors';

const categories = ['Material', 'Transport', 'Food', 'Tools', 'Repair', 'Other'];

const AddExpenseScreen = () => {
    const navigation = useNavigation();
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('Material');
    const [description, setDescription] = useState('');
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);

    // Pick Image from Gallery
    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.5,
            base64: true,
        });

        if (!result.canceled) {
            setImage(result.assets[0]);
        }
    };

    // Submit Expense
    const handleSubmit = async () => {
        if (!amount || !description) {
            Alert.alert('Missing Fields', 'Please fill amount and description');
            return;
        }

        setLoading(true);
        try {
            const payload = {
                amount: parseFloat(amount),
                category,
                description,
                receiptUrl: image ? `data:image/jpeg;base64,${image.base64}` : null
            };

            await api.post('/expenses/add', payload);

            Alert.alert('Success', 'Expense Logged!', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);

        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to save expense');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="close" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Add Expense</Text>
                <View style={{ width: 40 }} />
            </View>

            {/* Form */}
            <View style={styles.form}>

                {/* Amount */}
                <Text style={styles.label}>Amount (₹)</Text>
                <TextInput
                    style={styles.inputAmount}
                    placeholder="0"
                    placeholderTextColor={colors.textSecondary}
                    keyboardType="numeric"
                    value={amount}
                    onChangeText={setAmount}
                    autoFocus
                />

                {/* Category Grid */}
                <Text style={styles.label}>Category</Text>
                <View style={styles.categoryGrid}>
                    {categories.map((cat) => (
                        <TouchableOpacity
                            key={cat}
                            style={[
                                styles.categoryChip,
                                category === cat && styles.categoryChipSelected
                            ]}
                            onPress={() => setCategory(cat)}
                        >
                            <Text style={[
                                styles.categoryText,
                                category === cat && styles.categoryTextSelected
                            ]}>{cat}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Description */}
                <Text style={styles.label}>Description</Text>
                <TextInput
                    style={styles.input}
                    placeholder="What was this for?"
                    placeholderTextColor={colors.textSecondary}
                    value={description}
                    onChangeText={setDescription}
                    multiline
                />

                {/* Receipt Photo */}
                <Text style={styles.label}>Receipt Photo</Text>
                <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
                    {image ? (
                        <Image source={{ uri: image.uri }} style={styles.previewImage} />
                    ) : (
                        <View style={styles.uploadPlaceholder}>
                            <Ionicons name="camera-outline" size={32} color={colors.primary} />
                            <Text style={styles.uploadText}>Upload Bill / Receipt</Text>
                        </View>
                    )}
                </TouchableOpacity>
                {image && (
                    <TouchableOpacity onPress={() => setImage(null)} style={styles.removeImgBtn}>
                        <Text style={styles.removeImgText}>Remove Photo</Text>
                    </TouchableOpacity>
                )}

                {/* Submit Button */}
                <TouchableOpacity
                    style={[styles.submitBtn, loading && { opacity: 0.7 }]}
                    onPress={handleSubmit}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.submitBtnText}>Save Entry</Text>
                    )}
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flexGrow: 1, backgroundColor: colors.background, padding: 20, paddingTop: 50 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 30 },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: colors.text },
    backBtn: { padding: 8, backgroundColor: colors.surfaceHighlight, borderRadius: 50 },

    form: { gap: 20 },
    label: { fontSize: 14, fontWeight: '600', color: colors.textSecondary, marginBottom: 8 },

    inputAmount: {
        fontSize: 40, fontWeight: 'bold', color: colors.primary,
        borderBottomWidth: 1, borderBottomColor: colors.border, paddingBottom: 10, marginBottom: 10
    },

    input: {
        backgroundColor: colors.surface, borderRadius: 12, padding: 15, fontSize: 16, color: colors.text,
        borderWidth: 1, borderColor: colors.border
    },

    categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    categoryChip: {
        paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20,
        backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border
    },
    categoryChipSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
    categoryText: { color: colors.text, fontSize: 14 },
    categoryTextSelected: { color: '#fff', fontWeight: 'bold' },

    imagePicker: {
        height: 150, borderRadius: 16, borderWidth: 2, borderColor: colors.border, borderStyle: 'dashed',
        overflow: 'hidden', backgroundColor: colors.surfaceHighlight
    },
    uploadPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
    uploadText: { color: colors.primary, fontWeight: '600' },
    previewImage: { width: '100%', height: '100%', resizeMode: 'cover' },

    removeImgBtn: { alignSelf: 'center', marginTop: -10, padding: 10 },
    removeImgText: { color: colors.danger, fontSize: 12 },

    submitBtn: {
        backgroundColor: colors.primary, padding: 18, borderRadius: 16, alignItems: 'center', marginTop: 20,
        shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5
    },
    submitBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});

export default AddExpenseScreen;
