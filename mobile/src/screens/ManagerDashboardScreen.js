import { useContext, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Alert, Modal, TextInput, ScrollView } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

const ManagerDashboardScreen = () => {
    const { logout, userInfo } = useContext(AuthContext);
    const [tasks, setTasks] = useState([]);
    const [requisitions, setRequisitions] = useState([]);
    const [view, setView] = useState('tasks'); // tasks | materials

    // Create Task State
    const [modalVisible, setModalVisible] = useState(false);
    const [taskTitle, setTaskTitle] = useState('');
    const [taskDesc, setTaskDesc] = useState('');
    const [assigneeId, setAssigneeId] = useState(''); // Ideally a dropdown of workers

    useEffect(() => {
        fetchTasks();
        fetchRequisitions();
    }, []);

    const fetchTasks = async () => {
        try {
            const res = await api.get('/tasks');
            setTasks(res.data);
        } catch (error) { console.log(error); }
    };

    const fetchRequisitions = async () => {
        try {
            const res = await api.get('/materials');
            setRequisitions(res.data);
        } catch (error) { console.log(error); }
    };

    const createTask = async () => {
        try {
            // Hardcoding assignee for demo if not selected, or just leave null
            // For full implementation, we need a list of workers. 
            // I'll assume the manager enters a Worker ID or Name for now to keep it simple but functional
            // user needs to know ID. In real app, we fetch /users/workers.
            await api.post('/tasks', {
                title: taskTitle,
                description: taskDesc,
                // assignedTo: assigneeId 
            });
            Alert.alert('Success', 'Task Created');
            setModalVisible(false);
            setTaskTitle('');
            setTaskDesc('');
            fetchTasks();
        } catch (error) { Alert.alert('Error', 'Failed to create task'); }
    };

    const updateMaterialStatus = async (id, status) => {
        try {
            await api.put(`/materials/${id}/status`, { status });
            Alert.alert('Success', `Request ${status}`);
            fetchRequisitions();
        } catch (error) { Alert.alert('Error', 'Failed to update status'); }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Manager {userInfo?.name}</Text>
                <TouchableOpacity onPress={logout}><Text style={styles.logout}>Logout</Text></TouchableOpacity>
            </View>

            <View style={styles.tabs}>
                <TouchableOpacity onPress={() => setView('tasks')} style={[styles.tab, view === 'tasks' && styles.activeTab]}>
                    <Text style={styles.tabText}>Tasks</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setView('materials')} style={[styles.tab, view === 'materials' && styles.activeTab]}>
                    <Text style={styles.tabText}>Materials</Text>
                </TouchableOpacity>
            </View>

            {view === 'tasks' ? (
                <>
                    <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
                        <Text style={styles.btnText}>+ New Task</Text>
                    </TouchableOpacity>
                    <FlatList
                        data={tasks}
                        keyExtractor={(item) => item._id}
                        renderItem={({ item }) => (
                            <View style={styles.card}>
                                <Text style={styles.cardTitle}>{item.title}</Text>
                                <Text>{item.description}</Text>
                                <Text style={styles.status}>{item.status}</Text>
                            </View>
                        )}
                    />
                </>
            ) : (
                <FlatList
                    data={requisitions}
                    keyExtractor={(item) => item._id}
                    renderItem={({ item }) => (
                        <View style={styles.card}>
                            <Text style={styles.cardTitle}>{item.items[0]?.name} - {item.items[0]?.quantity} {item.items[0]?.unit}</Text>
                            <Text>Requested By: {item.requestedBy?.name}</Text>
                            <Text style={{marginBottom: 10}}>Status: {item.status}</Text>
                            {item.status === 'Requested' && (
                                <View style={styles.row}>
                                    <TouchableOpacity style={[styles.actionBtn, {backgroundColor: 'green'}]} onPress={() => updateMaterialStatus(item._id, 'Approved')}>
                                        <Text style={styles.whiteText}>Approve</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={[styles.actionBtn, {backgroundColor: 'red'}]} onPress={() => updateMaterialStatus(item._id, 'Rejected')}>
                                        <Text style={styles.whiteText}>Reject</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                    )}
                />
            )}

            <Modal visible={modalVisible} animationType="slide">
                <View style={styles.modal}>
                    <Text style={styles.heading}>Create Task</Text>
                    <TextInput style={styles.input} placeholder="Title" value={taskTitle} onChangeText={setTaskTitle} />
                    <TextInput style={styles.input} placeholder="Description" value={taskDesc} onChangeText={setTaskDesc} />
                    {/* Worker Selection would go here */}
                    <TouchableOpacity style={styles.btn} onPress={createTask}><Text style={styles.btnText}>Create</Text></TouchableOpacity>
                    <TouchableOpacity style={[styles.btn, {backgroundColor: 'red', marginTop: 10}]} onPress={() => setModalVisible(false)}><Text style={styles.btnText}>Cancel</Text></TouchableOpacity>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, paddingTop: 50 },
    header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
    title: { fontSize: 20, fontWeight: 'bold' },
    logout: { color: 'red' },
    heading: { fontSize: 28, fontWeight: 'bold', marginBottom: 20 },
    card: { backgroundColor: 'white', padding: 15, borderRadius: 10, marginBottom: 10, elevation: 1 },
    cardTitle: { fontSize: 16, fontWeight: 'bold' },
    status: { color: 'blue', marginTop: 5 },
    tabs: { flexDirection: 'row', marginBottom: 15 },
    tab: { flex: 1, padding: 10, alignItems: 'center', borderBottomWidth: 2, borderColor: '#ddd' },
    activeTab: { borderColor: '#007AFF' },
    tabText: { fontWeight: 'bold' },
    addBtn: { backgroundColor: '#007AFF', padding: 15, borderRadius: 10, alignItems: 'center', marginBottom: 10 },
    btnText: { color: 'white', fontWeight: 'bold' },
    modal: { flex: 1, padding: 20, paddingTop: 50 },
    input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 5, padding: 10, marginBottom: 10 },
    btn: { backgroundColor: '#007AFF', padding: 15, borderRadius: 10, alignItems: 'center' },
    row: { flexDirection: 'row', justifyContent: 'space-end', gap: 10 },
    actionBtn: { padding: 8, borderRadius: 5 },
    whiteText: { color: 'white', fontSize: 12 }
});

export default ManagerDashboardScreen;
