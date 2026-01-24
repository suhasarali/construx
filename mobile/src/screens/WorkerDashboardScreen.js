import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import api from '../services/api';
import { Ionicons } from '@expo/vector-icons';

import { colors } from '../constants/colors';

const WorkerDashboardScreen = () => {
    const { userInfo, logout } = useContext(AuthContext);
    const navigation = useNavigation();
    const [refreshing, setRefreshing] = useState(false);
    const [stats, setStats] = useState({
        attendance: 'Not Checked In',
        pendingTasks: 0
    });

    const fetchDashboardData = async () => {
        try {
            // Get today's attendance
            const attRes = await api.get('/attendance');
            let status = 'Not Checked In';
            if (attRes.data.length > 0) {
                 const today = new Date().toDateString();
                 const lastRecord = attRes.data[0];
                 const recordDate = new Date(lastRecord.date).toDateString();
                 if (today === recordDate) {
                     status = lastRecord.checkOutTime ? 'Checked Out' : 'Checked In';
                 }
            }

            // Get pending tasks count
            const taskRes = await api.get('/tasks');
            const pending = taskRes.data.filter(t => t.status === 'Pending' || t.status === 'In Progress').length;

            setStats({
                attendance: status,
                pendingTasks: pending
            });
        } catch (error) {
            console.error(error);
        }
    };



    const onRefresh = async () => {
        setRefreshing(true);
        await fetchDashboardData();
        setRefreshing(false);
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    return (
        <ScrollView 
            contentContainerStyle={styles.container}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
            <View style={styles.header}>
                <View>
                    <Text style={styles.greeting}>Hello,</Text>
                    <Text style={styles.name}>{userInfo?.name}</Text>
                    <Text style={styles.role}>{userInfo?.role}</Text>
                </View>
                <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
                    <Ionicons name="log-out-outline" size={24} color={colors.danger} />
                </TouchableOpacity>
            </View>

            <View style={styles.statusCard}>
                <Text style={styles.cardTitle}>Today's Status</Text>
                <View style={styles.statusRow}>
                    <Ionicons 
                        name={stats.attendance === 'Checked In' ? "checkmark-circle" : "time-outline"} 
                        size={32} 
                        color={stats.attendance === 'Checked In' ? colors.success : colors.warning} 
                    />
                    <Text style={styles.statusText}>{stats.attendance}</Text>
                </View>
                {stats.attendance === 'Not Checked In' && (
                    <TouchableOpacity 
                        style={styles.actionBtn}
                        onPress={() => navigation.navigate('Attendance')} 
                    >
                        <Text style={styles.btnText}>Check In Now</Text>
                    </TouchableOpacity>
                )}
            </View>

            <View style={styles.grid}>
                <TouchableOpacity style={styles.gridItem} onPress={() => navigation.navigate('Tasks')}>
                    <Ionicons name="clipboard-outline" size={32} color={colors.primary} />
                    <Text style={styles.gridValue}>{stats.pendingTasks}</Text>
                    <Text style={styles.gridLabel}>Pending Tasks</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.gridItem}>
                    <Ionicons name="warning-outline" size={32} color={colors.warning} />
                    <Text style={styles.gridValue}>0</Text>
                    <Text style={styles.gridLabel}>Issues</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.gridItem} onPress={() => navigation.navigate('Communication')}>
                    <Ionicons name="chatbubbles-outline" size={32} color={colors.primary} />
                    <Text style={styles.gridValue}>Msg</Text>
                    <Text style={styles.gridLabel}>Messages</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.gridItem} onPress={() => navigation.navigate('DailyWork')}>
                    <Ionicons name="cloud-upload-outline" size={32} color={colors.success} />
                    <Text style={styles.gridValue}>+</Text>
                    <Text style={styles.gridLabel}>Daily Work</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { padding: 24, paddingTop: 60, flex: 1, backgroundColor: colors.background },
    header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30, alignItems: 'center' },
    greeting: { fontSize: 16, color: colors.textSecondary, letterSpacing: 1 },
    name: { fontSize: 32, fontWeight: '900', color: colors.text, marginVertical: 4 },
    role: { fontSize: 14, color: colors.primary, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
    logoutBtn: { padding: 10, backgroundColor: colors.surfaceHighlight, borderRadius: 12 },
    statusCard: { 
        backgroundColor: colors.surface, 
        padding: 24, 
        borderRadius: 24, 
        marginBottom: 24, 
        borderWidth: 1,
        borderColor: colors.border,
        // Removed heavy shadow for cleaner dark look
    },
    cardTitle: { fontSize: 16, fontWeight: '600', marginBottom: 20, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1 },
    statusRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
    statusText: { fontSize: 24, fontWeight: 'bold', marginLeft: 16, color: colors.text },
    actionBtn: { 
        backgroundColor: colors.primary, 
        padding: 16, 
        borderRadius: 16, 
        alignItems: 'center',
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8, 
    },
    btnText: { color: colors.textInverted, fontWeight: 'bold', fontSize: 16 },
    grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    gridItem: { 
        backgroundColor: colors.surface, 
        padding: 20, 
        borderRadius: 24, 
        width: '48%', 
        alignItems: 'center', 
        marginBottom: 16,
        borderWidth: 1,
        borderColor: colors.border,
    },
    gridValue: { fontSize: 32, fontWeight: '900', marginVertical: 8, color: colors.text },
    gridLabel: { color: colors.textSecondary, fontSize: 12, fontWeight: '600', textTransform: 'uppercase' }
});

export default WorkerDashboardScreen;
