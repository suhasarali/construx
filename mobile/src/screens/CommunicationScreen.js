import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { colors } from '../constants/colors';
import api from '../services/api';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';


const CommunicationScreen = () => {
    const navigation = useNavigation();
    const { userInfo } = useContext(AuthContext);
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
                    color={item.type === 'Query' ? colors.primary : (item.priority === 'Urgent' ? colors.danger : colors.info)} 
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
            <View style={styles.leftHeader}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="chevron-back" size={26} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.screenTitle}>Messages</Text>
            </View>

            {userInfo?.role !== 'Worker' && (
                <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
                    <Ionicons name="add" size={24} color="white" />
                </TouchableOpacity>
            )}
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
    container: { flex: 1, padding: 24, paddingTop: 60, backgroundColor: colors.background },
    topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
    screenTitle: { fontSize: 32, fontWeight: '900', marginLeft: 16, color: colors.text, letterSpacing: 1 },
    addBtn: { backgroundColor: colors.primary, padding: 12, borderRadius: 30, shadowColor: colors.primary, shadowOpacity: 0.4, shadowRadius: 8, elevation: 5 },
    card: { 
        backgroundColor: colors.surface, 
        padding: 24, 
        borderRadius: 24, 
        marginBottom: 16, 
        borderWidth: 1,
        borderColor: colors.border
    },
    queryCard: { borderLeftWidth: 4, borderLeftColor: colors.primary },
    header: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    title: { fontSize: 18, fontWeight: 'bold', marginLeft: 12, flex: 1, color: colors.text },
    content: { fontSize: 16, color: colors.textSecondary, marginBottom: 16, lineHeight: 24 },
    footer: { fontSize: 12, color: colors.textTertiary, fontWeight: '600' },
    empty: { textAlign: 'center', marginTop: 50, color: colors.textSecondary },
    modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', padding: 24 },
    modalContent: { backgroundColor: colors.surface, padding: 24, borderRadius: 30, borderWidth: 1, borderColor: colors.border },
    modalHeader: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: colors.text },
    input: { 
        borderWidth: 1, 
        borderColor: colors.border, 
        borderRadius: 16, 
        padding: 16, 
        marginBottom: 16, 
        fontSize: 16,
        backgroundColor: colors.inputBg,
        color: colors.text
    },
    textArea: { height: 120, textAlignVertical: 'top' },
    modalBtns: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
    cancelBtn: { padding: 16, alignItems: 'center', width: '45%', borderRadius: 16, backgroundColor: colors.surfaceHighlight },
    sendBtn: { backgroundColor: colors.primary, padding: 16, borderRadius: 16, alignItems: 'center', width: '45%' },
    btnText: { fontWeight: 'bold', color: colors.textInverted },
    leftHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    backBtn: {
        marginRight: 0,
        padding: 8,
        backgroundColor: colors.surfaceHighlight,
        borderRadius: 12
    },
});

export default CommunicationScreen;
