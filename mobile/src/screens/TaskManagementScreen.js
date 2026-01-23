import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, Alert, Modal, ScrollView } from 'react-native';
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
                <View style={[styles.badge, { backgroundColor: item.status === 'Completed' ? '#34C759' : '#FF9500' }]}>
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
                        
                        <ScrollView style={{maxHeight: 400}}>
                            <TextInput style={styles.input} placeholder="Task Title" value={title} onChangeText={setTitle} />
                            <TextInput style={[styles.input, styles.textArea]} placeholder="Description" multiline value={description} onChangeText={setDescription} />
                            
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
                                 <TouchableOpacity style={[styles.prioBtn, priority==='High' && styles.activePrio]} onPress={() => setPriority('High')}>
                                    <Text style={priority==='High' ? styles.activeText : styles.text}>High</Text>
                                 </TouchableOpacity>
                                 <TouchableOpacity style={[styles.prioBtn, priority==='Medium' && styles.activePrio]} onPress={() => setPriority('Medium')}>
                                    <Text style={priority==='Medium' ? styles.activeText : styles.text}>Medium</Text>
                                 </TouchableOpacity>
                                 <TouchableOpacity style={[styles.prioBtn, priority==='Low' && styles.activePrio]} onPress={() => setPriority('Low')}>
                                    <Text style={priority==='Low' ? styles.activeText : styles.text}>Low</Text>
                                 </TouchableOpacity>
                            </View>
                        </ScrollView>

                        <View style={styles.modalBtns}>
                            <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                                <Text style={styles.btnText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.saveBtn} onPress={createTask}>
                                <Text style={[styles.btnText, {color:'white'}]}>Create Task</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, paddingTop: 60, backgroundColor: '#F2F2F7' },
    topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    screenTitle: { fontSize: 28, fontWeight: 'bold' },
    addBtn: { backgroundColor: '#007AFF', padding: 10, borderRadius: 20 },
    card: { backgroundColor: 'white', padding: 15, borderRadius: 12, marginBottom: 15 },
    header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
    cardTitle: { fontSize: 18, fontWeight: 'bold' },
    badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 5 },
    badgeText: { color: 'white', fontSize: 12, fontWeight: 'bold' },
    desc: { color: '#666', marginBottom: 10 },
    meta: { fontSize: 12, color: '#999' },
    modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
    modalContent: { backgroundColor: 'white', padding: 20, borderRadius: 15, maxHeight: '80%' },
    modalHeader: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 15 },
    textArea: { height: 80, textAlignVertical: 'top' },
    row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
    prioBtn: { padding: 10, borderWidth: 1, borderColor: '#ddd', borderRadius: 5, width: '30%', alignItems: 'center' },
    activePrio: { backgroundColor: '#007AFF', borderColor: '#007AFF' },
    text: { color: '#333' },
    activeText: { color: 'white', fontWeight: 'bold' },
    modalBtns: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
    cancelBtn: { padding: 15, width: '45%', alignItems: 'center' },
    saveBtn: { backgroundColor: '#34C759', padding: 15, borderRadius: 10, width: '45%', alignItems: 'center' },
    btnText: { fontWeight: 'bold' },
    label: { fontSize: 14, fontWeight: '600', marginBottom: 10, marginTop: 10 },
    assignRow: { flexDirection: 'row', marginBottom: 10 },
    assignBtn: { paddingVertical: 8, paddingHorizontal: 15, borderWidth: 1, borderColor: '#ddd', borderRadius: 20, marginRight: 10 },
    activeAssign: { backgroundColor: '#FF9500', borderColor: '#FF9500' },
    workerList: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 15 },
    workerChip: { paddingVertical: 6, paddingHorizontal: 12, backgroundColor: '#f0f0f0', borderRadius: 15, marginRight: 8, marginBottom: 8 },
    activeWorker: { backgroundColor: '#007AFF' },
    workerText: { color: '#333' },
    activeWorkerText: { color: 'white' }
});

export default TaskManagementScreen;
