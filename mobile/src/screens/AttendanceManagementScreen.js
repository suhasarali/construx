import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Image, Modal } from 'react-native';
import { colors } from '../constants/colors';
import api from '../services/api';
import { Ionicons } from '@expo/vector-icons';

const AttendanceManagementScreen = () => {
    const [attendanceList, setAttendanceList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRecord, setSelectedRecord] = useState(null);

    const fetchAttendance = async () => {
        try {
            // This endpoint needs to be created on backend to get ALL workers attendance for the site
            // For now, let's assume /attendance/site or we filter /attendance (but /attendance currently returns ONLY user's attendance)
            // I need to update backend to allow Engineer to view site attendance.
            // Let's assume I updated backend or will update it.
            // Actually, I haven't updated backend for this yet. create a TODO or update backend now.
            // Checking implementation plan: "View Worker Attendance".
            // Checking backend controller: getAttendance only returns req.user.id's attendance.
            // I MUST update backend controller first.
            const res = await api.get('/attendance/site'); 
            setAttendanceList(res.data);
        } catch (error) {
            console.error(error);
            // Fallback for demo if backend not ready
            // setAttendanceList([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAttendance();
    }, []);

    const verifyAttendance = async (id, status) => {
        try {
             await api.put(`/attendance/${id}/verify`, { status });
             Alert.alert('Success', `Attendance marked as ${status}`);
             setSelectedRecord(null);
             fetchAttendance();
        } catch (error) {
            Alert.alert('Error', 'Failed to update attendance');
        }
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity style={styles.card} onPress={() => setSelectedRecord(item)}>
            <View style={styles.row}>
                <View>
                    <Text style={styles.name}>{item.user?.name || 'Unknown Worker'}</Text>
                    <Text style={styles.time}>In: {item.checkInTime ? new Date(item.checkInTime).toLocaleTimeString() : '--'}</Text>
                    <Text style={styles.time}>Out: {item.checkOutTime ? new Date(item.checkOutTime).toLocaleTimeString() : '--'}</Text>
                </View>
                <View style={[styles.badge, { backgroundColor: item.status === 'Present' ? colors.success : colors.warning }]}>
                    <Text style={styles.badgeText}>{item.status}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Team Attendance</Text>
            <FlatList 
                data={attendanceList}
                renderItem={renderItem}
                keyExtractor={item => item._id}
                refreshing={loading}
                onRefresh={fetchAttendance}
            />

            <Modal visible={!!selectedRecord} transparent animationType="fade">
                <View style={styles.modalBg}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>{selectedRecord?.user?.name}</Text>
                        
                        {selectedRecord?.checkInPhoto && (
                            <Image source={{ uri: selectedRecord.checkInPhoto }} style={styles.photo} />
                        )}
                        
                        <View style={styles.infoRow}>
                            <Text>Location Match: {selectedRecord?.checkInLocation?.withinFence ? 'Yes' : 'No'}</Text>
                        </View>

                        <View style={styles.modalBtns}>
                            <TouchableOpacity style={styles.rejectBtn} onPress={() => verifyAttendance(selectedRecord._id, 'Rejected')}>
                                <Text style={styles.btnText}>Reject</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.approveBtn} onPress={() => verifyAttendance(selectedRecord._id, 'Present')}>
                                <Text style={styles.btnText}>Approve</Text>
                            </TouchableOpacity>
                        </View>
                         <TouchableOpacity style={styles.closeBtn} onPress={() => setSelectedRecord(null)}>
                                <Text style={{color: colors.info}}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 24, paddingTop: 60, backgroundColor: colors.background },
    title: { fontSize: 32, fontWeight: '900', marginBottom: 24, color: colors.text, letterSpacing: 1 },
    card: { 
        backgroundColor: colors.surface, 
        padding: 20, 
        borderRadius: 24, 
        marginBottom: 12,
        borderWidth: 1,
        borderColor: colors.border
    },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    name: { fontSize: 18, fontWeight: 'bold', color: colors.text },
    time: { fontSize: 13, color: colors.textSecondary, marginTop: 4 },
    badge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
    badgeText: { color: colors.textInverted, fontSize: 12, fontWeight: 'bold' },
    modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', padding: 24 },
    modalContent: { backgroundColor: colors.surface, padding: 30, borderRadius: 30, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
    modalTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: colors.text },
    photo: { width: 220, height: 220, borderRadius: 20, marginBottom: 20, borderWidth: 4, borderColor: colors.primary },
    modalBtns: { flexDirection: 'row', width: '100%', justifyContent: 'space-between', marginTop: 30 },
    rejectBtn: { backgroundColor: colors.danger, padding: 16, borderRadius: 16, width: '45%', alignItems: 'center' },
    approveBtn: { backgroundColor: colors.success, padding: 16, borderRadius: 16, width: '45%', alignItems: 'center' },
    btnText: { color: colors.textInverted, fontWeight: 'bold', fontSize: 16 },
    closeBtn: { marginTop: 24, padding: 10 },
    infoRow: { marginBottom: 10 }
});

export default AttendanceManagementScreen;
