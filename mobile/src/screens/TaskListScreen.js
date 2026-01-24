import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Modal, Image } from 'react-native';
import api from '../services/api';
import { colors } from '../constants/colors';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useLanguage } from '../context/LanguageContext';

const TaskListScreen = () => {
    const { t } = useLanguage();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTask, setSelectedTask] = useState(null);
    const [proofImage, setProofImage] = useState(null);

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

    useEffect(() => {
        fetchTasks();
    }, []);

    const pickImage = async () => {
        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.5,
        });

        if (!result.canceled) {
            setProofImage(result.assets[0].uri);
        }
    };

    const claimTask = async () => {
        if (!selectedTask) return;
        try {
            await api.put(`/tasks/${selectedTask._id}/claim`);
            Alert.alert('Success', 'You have started this task');
            setSelectedTask(null);
            fetchTasks();
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to start task');
        }
    };

    const completeTask = async () => {
        if (!selectedTask) return;
        try {
            await api.put(`/tasks/${selectedTask._id}`, {
                status: 'Completed',
            });
            Alert.alert('Success', 'Task marked as completed');
            setSelectedTask(null);
            fetchTasks();
        } catch (error) {
            Alert.alert('Error', 'Failed to update task');
        }
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity style={styles.card} onPress={() => setSelectedTask(item)}>
            <View style={styles.cardHeader}>
                <Text style={styles.title}>{item.title}</Text>
                <View style={[styles.badge, 
                    { backgroundColor: item.status === 'Completed' ? colors.success : colors.warning }
                ]}>
                    <Text style={styles.badgeText}>{item.status}</Text>
                </View>
            </View>
            <Text style={styles.desc}>{item.description}</Text>
            <Text style={styles.date}>{t('due')}: {new Date(item.deadline).toLocaleDateString()}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.header}>{t('myTasks')}</Text>
            <FlatList 
                data={tasks}
                renderItem={renderItem}
                keyExtractor={item => item._id}
                refreshing={loading}
                onRefresh={fetchTasks}
            />

            <Modal visible={!!selectedTask} animationType="slide" transparent>
                <View style={styles.modalBg}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>{selectedTask?.title}</Text>
                        <Text style={styles.modalDesc}>{selectedTask?.description}</Text>
                        <Text style={styles.modalLabel}>{t('priority')}: <Text style={{fontWeight:'bold'}}>{selectedTask?.priority}</Text></Text>
                        
                        <View style={styles.modalBtns}>
                            <TouchableOpacity style={styles.cancelBtn} onPress={() => setSelectedTask(null)}>
                                <Text style={styles.btnText}>{t('close')}</Text>
                            </TouchableOpacity>
                            {selectedTask?.status !== 'Completed' && (
                                !selectedTask?.assignedTo ? (
                                    <TouchableOpacity style={[styles.completeBtn, {backgroundColor: colors.info}]} onPress={claimTask}>
                                        <Text style={[styles.btnText, {color: 'white'}]}>{t('startTask')}</Text>
                                    </TouchableOpacity>
                                ) : (
                                    <TouchableOpacity style={styles.completeBtn} onPress={completeTask}>
                                        <Text style={styles.btnText}>{t('markDone')}</Text>
                                    </TouchableOpacity>
                                )
                            )}
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 24, paddingTop: 60, backgroundColor: colors.background },
    header: { fontSize: 32, fontWeight: '900', marginBottom: 24, color: colors.text, letterSpacing: 1 },
    card: { 
        backgroundColor: colors.surface, 
        padding: 20, 
        borderRadius: 24, 
        marginBottom: 16, 
        borderWidth: 1,
        borderColor: colors.border 
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
    title: { fontSize: 18, fontWeight: 'bold', flex: 1, color: colors.text },
    badge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
    badgeText: { color: colors.textInverted, fontSize: 12, fontWeight: 'bold' },
    desc: { color: colors.textSecondary, marginBottom: 12 },
    date: { fontSize: 12, color: colors.textTertiary, fontWeight: '600' },
    modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: colors.surface, padding: 30, borderTopLeftRadius: 30, borderTopRightRadius: 30 },
    modalTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 10, color: colors.text },
    modalDesc: { fontSize: 16, color: colors.textSecondary, marginBottom: 20 },
    modalLabel: { fontSize: 14, color: colors.textTertiary, marginBottom: 30 },
    modalBtns: { flexDirection: 'row', justifyContent: 'space-between' },
    cancelBtn: { padding: 16, borderRadius: 16, backgroundColor: colors.surfaceHighlight, width: '45%', alignItems: 'center' },
    completeBtn: { padding: 16, borderRadius: 16, backgroundColor: colors.success, width: '45%', alignItems: 'center' },
    btnText: { fontWeight: 'bold', color: colors.text }
});

export default TaskListScreen;
