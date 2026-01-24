import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { colors } from '../constants/colors';
import api from '../services/api';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const ReportIssueScreen = () => {
    const navigation = useNavigation();
    const [issue, setIssue] = useState('');
    const [loading, setLoading] = useState(false);

    const submitIssue = async () => {
        if (!issue.trim()) {
            Alert.alert('Error', 'Please describe the issue.');
            return;
        }

        setLoading(true);
        try {
            // We use 'WorkerLog' type but primarily for the issue
            // We'll send dummy workSummary as it's required by schema usually, or backend might handle it.
            // Let's check schema: workSummary is required.
            // We will send "Issue Report" as workSummary.

            const payload = {
                workSummary: 'Issue Report',
                issuesRaised: issue,
                date: new Date().toISOString(),
                type: 'WorkerLog',
                laborCount: 0
            };

            await api.post('/reports', payload);

            Alert.alert('Success', 'Issue Reported Successfully', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to report issue.');
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
                <Text style={styles.title}>Report an Issue</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.label}>Describe the Issue</Text>
                <TextInput
                    style={[styles.input, styles.textArea]}
                    multiline
                    placeholder="What is blocking your work?"
                    value={issue}
                    onChangeText={setIssue}
                    autoFocus
                />
            </View>

            <View style={styles.infoBox}>
                <Ionicons name="information-circle-outline" size={24} color={colors.primary} />
                <Text style={styles.infoText}>
                    Reporting an issue will notify the Site Engineer and Manager immediately.
                </Text>
            </View>

            <TouchableOpacity
                style={[styles.submitBtn, loading && styles.disabledBtn]}
                onPress={submitIssue}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.btnText}>Submit Issue</Text>
                )}
            </TouchableOpacity>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { padding: 24, paddingTop: 60, paddingBottom: 100, backgroundColor: colors.background, flexGrow: 1 },
    header: { flexDirection: 'row', alignItems: 'center', marginBottom: 30 },
    backBtn: { marginRight: 15, padding: 8, backgroundColor: colors.surfaceHighlight, borderRadius: 12 },
    title: { fontSize: 24, fontWeight: '900', color: colors.text },
    section: { marginBottom: 24 },
    label: { fontSize: 16, fontWeight: '700', marginBottom: 12, color: colors.textSecondary, textTransform: 'uppercase' },
    input: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 16,
        padding: 16,
        fontSize: 16,
        backgroundColor: colors.inputBg,
        color: colors.text
    },
    textArea: { height: 150, textAlignVertical: 'top' },
    submitBtn: {
        backgroundColor: colors.danger,
        padding: 20,
        borderRadius: 20,
        alignItems: 'center',
        marginTop: 20,
        shadowColor: colors.danger,
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 5
    },
    disabledBtn: { opacity: 0.7 },
    btnText: { color: 'white', fontWeight: 'bold', fontSize: 18, textTransform: 'uppercase' },
    infoBox: { flexDirection: 'row', padding: 16, backgroundColor: colors.surfaceHighlight, borderRadius: 16, alignItems: 'center', marginBottom: 20 },
    infoText: { marginLeft: 10, color: colors.textSecondary, flex: 1 }
});

export default ReportIssueScreen;
