import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { colors } from '../constants/colors';
import api from '../services/api';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native'; // Import useFocusEffect
import { useCallback } from 'react';

const IssuesListScreen = ({ navigation }) => {
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);



    useFocusEffect(
        useCallback(() => {
            fetchIssues();
        }, [])
    );

    const fetchIssues = async () => {
        try {
            const res = await api.get('/reports');
            // Filter reports that have issuesRaised content
            const issuesOnly = res.data.filter(r => r.issuesRaised && r.issuesRaised.trim().length > 0);
            setIssues(issuesOnly);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const resolveIssue = async (id) => {
        try {
            await api.put(`/reports/${id}`, { status: 'Resolved' });
            fetchIssues(); // Refresh list
        } catch (error) {
            console.error(error);
        }
    };

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <Ionicons name="warning" size={24} color={colors.warning} />
                <Text style={styles.date}>{new Date(item.date).toDateString()}</Text>
            </View>
            <Text style={styles.issueText}>{item.issuesRaised}</Text>
            <View style={styles.metaRow}>
                <Text style={styles.meta}>Submitted By: {item.submittedBy?.name || 'Unknown'}</Text>

                {/* Resolve Tick Option */}
                <TouchableOpacity
                    style={[styles.resolveBtn, item.status === 'Resolved' ? styles.resolved : styles.unresolved]}
                    onPress={() => item.status !== 'Resolved' && resolveIssue(item._id)}
                >
                    <Ionicons name="checkmark" size={16} color="white" />
                    <Text style={styles.resolveText}>{item.status}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.headerRow}>
                <Text style={styles.title}>Reported Issues</Text>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => navigation.navigate('ReportIssue')}
                >
                    <Ionicons name="add" size={24} color="white" />
                </TouchableOpacity>
            </View>

            {issues.length === 0 ? (
                <View style={styles.center}>
                    <Ionicons name="checkmark-circle-outline" size={64} color={colors.success} />
                    <Text style={styles.emptyText}>No Outstanding Issues</Text>
                </View>
            ) : (
                <FlatList
                    data={issues}
                    renderItem={renderItem}
                    keyExtractor={item => item._id}
                    contentContainerStyle={styles.list}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background, padding: 20, paddingTop: 50 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    title: { fontSize: 24, fontWeight: 'bold', color: colors.text },
    list: { paddingBottom: 100 },
    addButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.danger,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 2
    },
    card: {
        backgroundColor: colors.surface,
        padding: 16,
        borderRadius: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: colors.border
    },
    cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    date: { marginLeft: 10, color: colors.textSecondary, fontWeight: '600' },
    issueText: { fontSize: 16, color: colors.text, marginBottom: 12, lineHeight: 22 },
    metaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 8 },
    meta: { color: colors.textTertiary, fontSize: 12 },
    badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
    badgeText: { color: 'white', fontSize: 10, fontWeight: 'bold' },
    resolveBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 },
    resolved: { backgroundColor: colors.success },
    unresolved: { backgroundColor: colors.warning },
    resolveText: { color: 'white', fontSize: 12, fontWeight: 'bold', marginLeft: 4, textTransform: 'uppercase' },
    emptyText: { marginTop: 16, fontSize: 18, color: colors.textSecondary }
});

export default IssuesListScreen;
