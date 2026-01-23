import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import api from '../services/api';
import { Ionicons } from '@expo/vector-icons';

const CommunicationScreen = () => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [queryTitle, setQueryTitle] = useState('');
    const [queryContent, setQueryContent] = useState('');

    const fetchMessages = async () => {
        try {
            const res = await api.get('/messages');
            setMessages(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMessages();
    }, []);

    const sendQuery = async () => {
        if (!queryTitle || !queryContent) {
            Alert.alert('Error', 'Please fill all fields');
            return;
        }

        try {
            await api.post('/messages', {
                type: 'Query',
                title: queryTitle,
                content: queryContent,
                targetRoles: ['Manager', 'Site_Engineer'], // Send to admins
                priority: 'Normal'
            });
            Alert.alert('Success', 'Query sent successfully');
            setModalVisible(false);
            setQueryTitle('');
            setQueryContent('');
            fetchMessages(); // Refresh to show sent query if we display them
        } catch (error) {
            Alert.alert('Error', 'Failed to send query');
        }
    };

    const renderItem = ({ item }) => (
        <View style={[styles.card, item.type === 'Query' && styles.queryCard]}>
            <View style={styles.header}>
                <Ionicons 
                    name={item.type === 'Query' ? "help-circle" : (item.priority === 'Urgent' ? "alert-circle" : "information-circle")} 
                    size={24} 
                    color={item.type === 'Query' ? "#5856D6" : (item.priority === 'Urgent' ? "red" : "#007AFF")} 
                />
                <Text style={styles.title}>{item.title} {item.type === 'Query' && '(My Query)'}</Text>
            </View>
            <Text style={styles.content}>{item.content}</Text>
            <Text style={styles.footer}>{item.type === 'Query' ? 'To: Management' : `From: ${item.sender?.name}`} • {new Date(item.createdAt).toLocaleDateString()}</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.topRow}>
                <Text style={styles.screenTitle}>Messages</Text>
                <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
                    <Ionicons name="add" size={24} color="white" />
                </TouchableOpacity>
            </View>
            
            <FlatList 
                data={messages}
                renderItem={renderItem}
                keyExtractor={item => item._id}
                refreshing={loading}
                onRefresh={fetchMessages}
                ListEmptyComponent={<Text style={styles.empty}>No messages found</Text>}
            />

            <Modal visible={modalVisible} animationType="slide" transparent>
                <View style={styles.modalBg}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalHeader}>Raise a Query</Text>
                        <TextInput 
                            style={styles.input} 
                            placeholder="Title / Subject" 
                            value={queryTitle}
                            onChangeText={setQueryTitle}
                        />
                        <TextInput 
                            style={[styles.input, styles.textArea]} 
                            placeholder="Describe your issue..." 
                            multiline 
                            value={queryContent}
                            onChangeText={setQueryContent}
                        />
                        <View style={styles.modalBtns}>
                            <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                                <Text style={styles.btnText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.sendBtn} onPress={sendQuery}>
                                <Text style={[styles.btnText, {color:'white'}]}>Send</Text>
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
    card: { backgroundColor: 'white', padding: 15, borderRadius: 12, marginBottom: 15, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5 },
    queryCard: { borderLeftWidth: 4, borderLeftColor: '#5856D6' },
    header: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    title: { fontSize: 18, fontWeight: 'bold', marginLeft: 10, flex: 1 },
    content: { fontSize: 16, color: '#333', marginBottom: 15, lineHeight: 22 },
    footer: { fontSize: 12, color: '#8E8E93' },
    empty: { textAlign: 'center', marginTop: 50, color: '#8E8E93' },
    modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
    modalContent: { backgroundColor: 'white', padding: 20, borderRadius: 15 },
    modalHeader: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 15, fontSize: 16 },
    textArea: { height: 100, textAlignVertical: 'top' },
    modalBtns: { flexDirection: 'row', justifyContent: 'space-between' },
    cancelBtn: { padding: 15, alignItems: 'center', width: '48%' },
    sendBtn: { backgroundColor: '#007AFF', padding: 15, borderRadius: 8, alignItems: 'center', width: '48%' },
    btnText: { fontWeight: 'bold' }
});

export default CommunicationScreen;
