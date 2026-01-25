import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, RefreshControl, ActivityIndicator, Alert } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';
import { colors } from '../constants/colors';

const PettyCashScreen = () => {
    const navigation = useNavigation();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [summary, setSummary] = useState({ todaySpent: 0, balance: 0, recent: [] });

    const fetchSummary = async () => {
        try {
            const response = await api.get('/expenses/summary');
            setSummary(response.data);
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to fetch petty cash summary');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchSummary();
        }, [])
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchSummary();
    };

    const renderExpenseItem = ({ item }) => (
        <View style={styles.expenseCard}>
            <View style={styles.iconContainer}>
                <Ionicons
                    name={getCategoryIcon(item.category)}
                    size={24}
                    color={colors.primary}
                />
            </View>
            <View style={styles.expenseDetails}>
                <Text style={styles.expenseCategory}>{item.category}</Text>
                <Text style={styles.expenseDesc} numberOfLines={1}>{item.description}</Text>
                <Text style={styles.expenseDate}>
                    {new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
            </View>
            <View style={styles.amountContainer}>
                <Text style={[
                    styles.amountText,
                    item.type === 'Credit' ? styles.creditText : styles.debitText
                ]}>
                    {item.type === 'Credit' ? '+' : '-'}₹{item.amount}
                </Text>
                <View style={[styles.statusBadge, getStatusStyle(item.status)]}>
                    <Text style={getStatusTextStyle(item.status)}>{item.status}</Text>
                </View>
            </View>
        </View>
    );

    const getCategoryIcon = (cat) => {
        switch (cat) {
            case 'Transport': return 'car';
            case 'Food': return 'restaurant';
            case 'Tools': return 'hammer';
            case 'Repair': return 'build';
            default: return 'pricetag';
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Approved': return { backgroundColor: 'rgba(16, 185, 129, 0.1)' };
            case 'Rejected': return { backgroundColor: 'rgba(239, 68, 68, 0.1)' };
            default: return { backgroundColor: 'rgba(245, 158, 11, 0.1)' };
        }
    };

    const getStatusTextStyle = (status) => {
        switch (status) {
            case 'Approved': return { color: '#10B981', fontSize: 10, fontWeight: 'bold' };
            case 'Rejected': return { color: '#EF4444', fontSize: 10, fontWeight: 'bold' };
            default: return { color: '#F59E0B', fontSize: 10, fontWeight: 'bold' };
        }
    };


    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Petty Cash</Text>
                <TouchableOpacity style={styles.historyBtn}>
                    <Ionicons name="calendar-outline" size={24} color={colors.text} />
                </TouchableOpacity>
            </View>

            {/* Balance Cards */}
            <View style={styles.statsContainer}>
                <View style={[styles.statCard, { backgroundColor: colors.primary }]}>
                    <View>
                        <Text style={styles.statLabel}>Wallet Balance</Text>
                        <Text style={styles.statValue}>₹{summary.balance.toLocaleString()}</Text>
                    </View>
                    <Ionicons name="wallet-outline" size={32} color="rgba(255,255,255,0.8)" />
                </View>
                <View style={[styles.statCard, { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }]}>
                    <View>
                        <Text style={[styles.statLabel, { color: colors.text }]}>Today's Spent</Text>
                        <Text style={[styles.statValue, { color: colors.danger }]}>₹{summary.todaySpent.toLocaleString()}</Text>
                    </View>
                    <Ionicons name="trending-down-outline" size={32} color={colors.danger} />
                </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionRow}>
                <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: colors.primary }]}
                    onPress={() => navigation.navigate('AddExpense')}
                >
                    <Ionicons name="add-circle-outline" size={24} color="#fff" />
                    <Text style={styles.actionBtnText}>Add Expense</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: colors.surfaceHighlight }]}
                    onPress={() => Alert.alert('Request Funds', 'Feature coming to RequestFundsScreen')}
                >
                    <Ionicons name="cash-outline" size={24} color={colors.text} />
                    <Text style={[styles.actionBtnText, { color: colors.text }]}>Request Funds</Text>
                </TouchableOpacity>
            </View>

            {/* Recent Transactions */}
            <View style={styles.listContainer}>
                <Text style={styles.sectionTitle}>Recent Transactions</Text>
                {loading ? (
                    <ActivityIndicator color={colors.primary} style={{ marginTop: 20 }} />
                ) : (
                    <FlatList
                        data={summary.recent}
                        renderItem={renderExpenseItem}
                        keyExtractor={item => item._id}
                        refreshControl={
                            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                        }
                        ListEmptyComponent={
                            <View style={styles.emptyState}>
                                <Text style={styles.emptyText}>No recent expenses</Text>
                            </View>
                        }
                        contentContainerStyle={{ paddingBottom: 20 }}
                    />
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, paddingTop: 50 },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: colors.text },
    backBtn: { padding: 8 },
    historyBtn: { padding: 8 },

    statsContainer: { flexDirection: 'row', gap: 15, paddingHorizontal: 20, marginBottom: 20 },
    statCard: { flex: 1, padding: 20, borderRadius: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3.84, elevation: 5 },
    statLabel: { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginBottom: 4 },
    statValue: { fontSize: 24, fontWeight: 'bold', color: '#fff' },

    actionRow: { flexDirection: 'row', gap: 15, paddingHorizontal: 20, marginBottom: 25 },
    actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, borderRadius: 12, gap: 8 },
    actionBtnText: { fontWeight: '600', fontSize: 16, color: '#fff' },

    listContainer: { flex: 1, backgroundColor: colors.surface, borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 20 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: colors.text, marginBottom: 15 },

    expenseCard: { flexDirection: 'row', alignItems: 'center', padding: 16, marginBottom: 12, backgroundColor: colors.background, borderRadius: 12, borderWidth: 1, borderColor: colors.border },
    iconContainer: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surfaceHighlight, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    expenseDetails: { flex: 1 },
    expenseCategory: { fontSize: 16, fontWeight: '600', color: colors.text },
    expenseDesc: { fontSize: 12, color: colors.textSecondary },
    expenseDate: { fontSize: 10, color: colors.textSecondary, marginTop: 2 },

    amountContainer: { alignItems: 'flex-end' },
    amountText: { fontSize: 16, fontWeight: 'bold' },
    debitText: { color: colors.danger },
    creditText: { color: colors.success },
    statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, marginTop: 4 },

    emptyState: { alignItems: 'center', marginTop: 40 },
    emptyText: { color: colors.textSecondary }
});

export default PettyCashScreen;
