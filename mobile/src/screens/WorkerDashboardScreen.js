import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import api from '../services/api';
import { Ionicons } from '@expo/vector-icons';

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

    // New function for submitting daily work log
    const submitDailyWorkLog = async () => {
        const formData = new FormData();

        if (image) {
            let filename = image.split('/').pop();
            let match = /\.(\w+)$/.exec(filename);
            let type = match ? `image/${match[1]}` : `image`;
            formData.append('photos', { uri: image, name: filename, type });
        }
        
        formData.append('type', 'WorkerLog');
        formData.append('date', new Date().toISOString());
        formData.append('workSummary', logDescription);

        try {
            await api.post('/reports', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            Alert.alert('Success', 'Daily Work Log Submitted');
            setLogDescription('');
            setImage(null);
        } catch (error) {
            console.error('Error submitting daily work log:', error);
            Alert.alert('Error', 'Failed to submit daily work log.');
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
                    <Ionicons name="log-out-outline" size={24} color="#FF3B30" />
                </TouchableOpacity>
            </View>

            <View style={styles.statusCard}>
                <Text style={styles.cardTitle}>Today's Status</Text>
                <View style={styles.statusRow}>
                    <Ionicons 
                        name={stats.attendance === 'Checked In' ? "checkmark-circle" : "time-outline"} 
                        size={32} 
                        color={stats.attendance === 'Checked In' ? "#34C759" : "#FF9500"} 
                    />
                    <Text style={styles.statusText}>{stats.attendance}</Text>
                </View>
                {stats.attendance === 'Not Checked In' && (
                    <TouchableOpacity 
                        style={styles.actionBtn}
                        onPress={() => navigation.navigate('Attendance')} // This will be in the tab bar, maybe navigate to tab?
                        // Or better, just use the Attendance components here or navigate to a dedicated CheckIn screen
                    >
                        <Text style={styles.btnText}>Go to Check In</Text>
                    </TouchableOpacity>
                )}
            </View>

            <View style={styles.grid}>
                <TouchableOpacity style={styles.gridItem} onPress={() => navigation.navigate('Tasks')}>
                    <Ionicons name="clipboard-outline" size={32} color="#007AFF" />
                    <Text style={styles.gridValue}>{stats.pendingTasks}</Text>
                    <Text style={styles.gridLabel}>Pending Tasks</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.gridItem}>
                    <Ionicons name="warning-outline" size={32} color="#FF9500" />
                    <Text style={styles.gridValue}>0</Text>
                    <Text style={styles.gridLabel}>Issues</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { padding: 20, paddingTop: 60, flex: 1, backgroundColor: '#F2F2F7' },
    header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 },
    greeting: { fontSize: 16, color: '#8E8E93' },
    name: { fontSize: 24, fontWeight: 'bold', color: '#000' },
    role: { fontSize: 14, color: '#007AFF', marginTop: 2 },
    logoutBtn: { padding: 5 },
    statusCard: { backgroundColor: 'white', padding: 20, borderRadius: 15, marginBottom: 20, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
    cardTitle: { fontSize: 16, fontWeight: '600', marginBottom: 15, color: '#3A3A3C' },
    statusRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
    statusText: { fontSize: 20, fontWeight: 'bold', marginLeft: 10, color: '#000' },
    actionBtn: { backgroundColor: '#007AFF', padding: 12, borderRadius: 10, alignItems: 'center' },
    btnText: { color: 'white', fontWeight: '600' },
    grid: { flexDirection: 'row', justifyContent: 'space-between' },
    gridItem: { backgroundColor: 'white', padding: 20, borderRadius: 15, width: '48%', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
    gridValue: { fontSize: 28, fontWeight: 'bold', marginVertical: 5 },
    gridLabel: { color: '#8E8E93' }
});

export default WorkerDashboardScreen;
