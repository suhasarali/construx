import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, Alert, Modal, ScrollView } from 'react-native';
import { colors } from '../constants/colors';
import api from '../services/api';
import { Ionicons } from '@expo/vector-icons';

const TaskManagementScreen = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);

    // New Task Form
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [assignedTo, setAssignedTo] = useState(''); // User ID or 'Anyone' or 'Everyone'
    const [deadline, setDeadline] = useState('');
    const [priority, setPriority] = useState('Medium');
    const [workers, setWorkers] = useState([]);

    useEffect(() => {
        fetchTasks();
        fetchWorkers();
    }, []);

    const fetchTasks = async () => {
        try {
            const res = await api.get('/tasks');
            setTasks(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchWorkers = async () => {
        try {
            const res = await api.get('/users/workers');
            setWorkers(res.data);
        } catch (e) { console.error(e) }
    };

    const createTask = async () => {
        if (!title || !description || !assignedTo) {
            Alert.alert('Error', 'Fill required fields');
            return;
        }

        const payload = {
            title,
            description,
            deadline: deadline || new Date(Date.now() + 86400000).toISOString(),
            priority,
            siteLocation: { lat: 0, lng: 0, address: 'Site A' }
        };

        if (assignedTo === 'Everyone') {
            payload.assignToAll = true;
        } else if (assignedTo === 'Anyone') {
            payload.assignedTo = null;
        } else {
            payload.assignedTo = assignedTo;
        }

        try {
            await api.post('/tasks', payload);
            Alert.alert('Success', 'Task Created');
            setModalVisible(false);
            fetchTasks(); // Refresh
            // Reset form
            setTitle('');
            setDescription('');
            setAssignedTo('');
        } catch (error) {
            Alert.alert('Error', 'Failed to create task');
            console.log(error);
        }
    };

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.header}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <View style={[styles.badge, { backgroundColor: item.status === 'Completed' ? colors.success : colors.warning }]}>
                    <Text style={styles.badgeText}>{item.status}</Text>
                </View>
            </View>
            <Text style={styles.desc}>{item.description}</Text>
            <Text style={styles.meta}>Assigned To: {item.assignedTo ? item.assignedTo.name : 'Anyone (Open Task)'}</Text>
            <Text style={styles.meta}>Priority: {item.priority}</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.topRow}>
                <Text style={styles.screenTitle}>Task Management</Text>
                <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
                    <Ionicons name="add" size={24} color="white" />
                </TouchableOpacity>
            </View>

            <FlatList
                data={tasks}
                renderItem={renderItem}
                keyExtractor={item => item._id}
                refreshing={loading}
                onRefresh={fetchTasks}
            />

            <Modal visible={modalVisible} animationType="slide" transparent>
                <View style={styles.modalBg}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalHeader}>Create New Task</Text>

                        <ScrollView style={{ maxHeight: 400 }}>
                            <TextInput style={styles.input} placeholder="Task Title" placeholderTextColor="#ccc" value={title} onChangeText={setTitle} />
                            <TextInput style={[styles.input, styles.textArea]} placeholder="Description" placeholderTextColor="#ccc" multiline value={description} onChangeText={setDescription} />

                            <Text style={styles.label}>Assign To:</Text>
                            <View style={styles.assignRow}>
                                <TouchableOpacity
                                    style={[styles.assignBtn, assignedTo === 'Anyone' && styles.activeAssign]}
                                    onPress={() => setAssignedTo('Anyone')}
                                >
                                    <Text style={assignedTo === 'Anyone' ? styles.activeText : styles.text}>Anyone</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.assignBtn, assignedTo === 'Everyone' && styles.activeAssign]}
                                    onPress={() => setAssignedTo('Everyone')}
                                >
                                    <Text style={assignedTo === 'Everyone' ? styles.activeText : styles.text}>Everyone</Text>
                                </TouchableOpacity>
                            </View>

                            <Text style={styles.label}>Or Pick Worker:</Text>
                            <View style={styles.workerList}>
                                {workers.map(worker => (
                                    <TouchableOpacity
                                        key={worker._id}
                                        style={[styles.workerChip, assignedTo === worker._id && styles.activeWorker]}
                                        onPress={() => setAssignedTo(worker._id)}
                                    >
                                        <Text style={assignedTo === worker._id ? styles.activeWorkerText : styles.workerText}>{worker.name}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <View style={styles.row}>
                                <TouchableOpacity style={[styles.prioBtn, priority === 'High' && styles.activePrio]} onPress={() => setPriority('High')}>
                                    <Text style={priority === 'High' ? styles.activeText : styles.text}>High</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.prioBtn, priority === 'Medium' && styles.activePrio]} onPress={() => setPriority('Medium')}>
                                    <Text style={priority === 'Medium' ? styles.activeText : styles.text}>Medium</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.prioBtn, priority === 'Low' && styles.activePrio]} onPress={() => setPriority('Low')}>
                                    <Text style={priority === 'Low' ? styles.activeText : styles.text}>Low</Text>
                                </TouchableOpacity>
                            </View>
                        </ScrollView>

                        <View style={styles.modalBtns}>
                            <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                                <Text style={styles.btnText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.saveBtn} onPress={createTask}>
                                <Text style={[styles.btnText, { color: 'white' }]}>Create Task</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 24, paddingTop: 60, backgroundColor: colors.background },
    topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    screenTitle: { fontSize: 32, fontWeight: '900', color: colors.text, letterSpacing: 1 },
    addBtn: { backgroundColor: colors.primary, padding: 12, borderRadius: 30, shadowColor: colors.primary, shadowOpacity: 0.4, shadowRadius: 8, elevation: 5 },
    card: {
        backgroundColor: colors.surface,
        padding: 20,
        borderRadius: 24,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: colors.border
    },
    header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    cardTitle: { fontSize: 18, fontWeight: 'bold', color: colors.text },
    badge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
    badgeText: { color: colors.textInverted, fontSize: 12, fontWeight: 'bold' },
    desc: { color: colors.textSecondary, marginBottom: 12 },
    meta: { fontSize: 12, color: colors.textTertiary, fontWeight: '600' },
    modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', padding: 24 },
    modalContent: { backgroundColor: colors.surface, padding: 24, borderRadius: 30, maxHeight: '80%', borderWidth: 1, borderColor: colors.border },
    modalHeader: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: colors.text },
    input: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        color: colors.text,
        backgroundColor: colors.inputBg
    },
    textArea: { height: 100, textAlignVertical: 'top' },
    row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
    prioBtn: { padding: 12, borderWidth: 1, borderColor: colors.border, borderRadius: 12, width: '30%', alignItems: 'center', backgroundColor: colors.surfaceHighlight },
    activePrio: { backgroundColor: colors.info, borderColor: colors.info },
    text: { color: colors.textSecondary, fontWeight: '600' },
    activeText: { color: colors.textInverted, fontWeight: 'bold' },
    modalBtns: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
    cancelBtn: { padding: 16, width: '45%', alignItems: 'center', borderRadius: 16, backgroundColor: colors.surfaceHighlight },
    saveBtn: { backgroundColor: colors.success, padding: 16, borderRadius: 16, width: '45%', alignItems: 'center' },
    btnText: { fontWeight: 'bold', color: colors.textInverted },
    label: { fontSize: 14, fontWeight: '700', marginBottom: 12, marginTop: 12, color: colors.textSecondary, textTransform: 'uppercase' },
    assignRow: { flexDirection: 'row', marginBottom: 16 },
    assignBtn: { paddingVertical: 10, paddingHorizontal: 16, borderWidth: 1, borderColor: colors.border, borderRadius: 20, marginRight: 10, backgroundColor: colors.surfaceHighlight },
    activeAssign: { backgroundColor: colors.warning, borderColor: colors.warning },
    workerList: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16 },
    workerChip: { paddingVertical: 8, paddingHorizontal: 14, backgroundColor: colors.surfaceHighlight, borderRadius: 20, marginRight: 8, marginBottom: 8, borderWidth: 1, borderColor: colors.border },
    activeWorker: { backgroundColor: colors.info, borderColor: colors.info },
    workerText: { color: colors.textSecondary },
    activeWorkerText: { color: colors.textInverted, fontWeight: 'bold' }
});

export default TaskManagementScreen;
