import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Modal, Alert, TextInput, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { colors } from '../constants/colors';
import QRCode from 'react-native-qrcode-svg';

const ToolsScreen = ({ navigation }) => {
    const { userInfo } = useContext(AuthContext);
    const [tools, setTools] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // QR Modal State
    const [qrModalVisible, setQrModalVisible] = useState(false);
    const [selectedTool, setSelectedTool] = useState(null);

    // Add Tool State
    const [addModalVisible, setAddModalVisible] = useState(false);
    const [newTool, setNewTool] = useState({ name: '', uniqueId: '', description: '', condition: 'Good' });

    useEffect(() => {
        fetchTools();
    }, []);

    const fetchTools = async () => {
        try {
            const res = await api.get('/tools');
            setTools(res.data);
            setLoading(false);
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to fetch tools');
            setLoading(false);
        }
    };

    const handleToolPress = (tool) => {
        setSelectedTool(tool);
        setQrModalVisible(true);
    };

    const handleCreateTool = async () => {
        if (!newTool.name || !newTool.uniqueId) {
            Alert.alert('Error', 'Name and Unique ID are required');
            return;
        }

        try {
            await api.post('/tools', newTool);
            Alert.alert('Success', 'Tool added successfully');
            setAddModalVisible(false);
            setNewTool({ name: '', uniqueId: '', description: '', condition: 'Good' });
            fetchTools();
        } catch (error) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to create tool');
        }
    };

    // Calculate time remaining
    const getTimeRemaining = (dueDate) => {
        if (!dueDate) return null;
        const now = new Date();
        const due = new Date(dueDate);
        const diff = due - now;
        
        if (diff <= 0) return 'Overdue';
        
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        return `${hours}h ${minutes}m remaining`;
    };

    const renderToolItem = ({ item }) => (
        <TouchableOpacity 
            style={styles.card} 
            onPress={() => handleToolPress(item)}
        >
            <View style={styles.cardHeader}>
                <Text style={styles.toolName}>{item.name}</Text>
                <View style={[
                    styles.statusBadge, 
                    item.status === 'Available' ? styles.statusAvailable : 
                    item.status === 'In-Use' ? styles.statusInUse : styles.statusMaintenance
                ]}>
                    <Text style={styles.statusText}>{item.status}</Text>
                </View>
            </View>
            <Text style={styles.toolId}>{item.uniqueId}</Text>
            
            {item.status === 'In-Use' && item.currentHolder ? (
                <View style={styles.holderInfo}>
                    <Text style={styles.holderText}><Ionicons name="person" /> {item.currentHolder.name}</Text>
                    {item.dueDate && (
                        <Text style={[styles.dueText, new Date(item.dueDate) < new Date() ? styles.overdue : null]}>
                            <Ionicons name="time" /> {getTimeRemaining(item.dueDate)}
                        </Text>
                    )}
                </View>
            ) : (
                <Text style={styles.tapToGen}>Tap to show QR for Worker</Text>
            )}
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.title}>Tool Library (Engineer)</Text>
                <View style={{flexDirection: 'row', gap: 15}}>
                    <TouchableOpacity onPress={() => setAddModalVisible(true)}>
                        <Ionicons name="add-circle" size={28} color={colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={fetchTools}>
                        <Ionicons name="refresh" size={24} color={colors.primary} />
                    </TouchableOpacity>
                </View>
            </View>

            <FlatList
                data={tools}
                renderItem={renderToolItem}
                keyExtractor={item => item._id}
                contentContainerStyle={styles.list}
                refreshing={loading}
                onRefresh={fetchTools}
            />

            {/* QR Code / Info Modal */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={qrModalVisible}
                onRequestClose={() => setQrModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        {selectedTool && (
                            <>
                                <View style={styles.modalHeader}>
                                    <View>
                                        <Text style={styles.modalTitle}>{selectedTool.name}</Text>
                                        <Text style={styles.modalSubtitle}>{selectedTool.uniqueId}</Text>
                                    </View>
                                    <TouchableOpacity onPress={() => setQrModalVisible(false)}>
                                        <Ionicons name="close" size={24} color={colors.text} />
                                    </TouchableOpacity>
                                </View>
                                <View style={styles.divider} />

                                {selectedTool.status === 'Available' ? (
                                    <View style={styles.qrContainer}>
                                        <Text style={styles.qrInstructions}>
                                            Ask Worker to scan this QR code to borrow the tool for 24 hours.
                                        </Text>
                                        <View style={styles.qrWrapper}>
                                            <QRCode 
                                                value={selectedTool._id}
                                                size={200}
                                            />
                                        </View>
                                    </View>
                                ) : (
                                    <View style={styles.infoContainer}>
                                        <View style={styles.infoRow}>
                                            <Text style={styles.infoLabel}>Status:</Text>
                                            <Text style={[styles.infoValue, {color: colors.primary}]}>{selectedTool.status}</Text>
                                        </View>
                                        <View style={styles.infoRow}>
                                            <Text style={styles.infoLabel}>Holder:</Text>
                                            <Text style={styles.infoValue}>{selectedTool.currentHolder?.name || 'Unknown'}</Text>
                                        </View>
                                        {selectedTool.dueDate && (
                                            <View style={styles.infoRow}>
                                                <Text style={styles.infoLabel}>Due:</Text>
                                                <Text style={styles.infoValue}>
                                                    {new Date(selectedTool.dueDate).toLocaleString()}
                                                </Text>
                                            </View>
                                        )}
                                        
                                        <Text style={styles.noQrText}>
                                            QR Code is hidden because this tool is currently in use.
                                        </Text>

                                        {/* Engineer can Force Return */}
                                        <TouchableOpacity 
                                            style={styles.forceReturnBtn}
                                            onPress={async () => {
                                                try {
                                                    await api.post(`/tools/${selectedTool._id}/checkin`, { 
                                                        notes: 'Force returned by Engineer',
                                                        location: null
                                                    });
                                                    Alert.alert('Success', 'Tool marked as Returned');
                                                    setQrModalVisible(false);
                                                    fetchTools();
                                                } catch (e) {
                                                    Alert.alert('Error', 'Failed to return tool');
                                                }
                                            }}
                                        >
                                            <Text style={styles.forceReturnText}>Mark as Returned</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </>
                        )}
                    </View>
                </View>
            </Modal>

            {/* Add Tool Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={addModalVisible}
                onRequestClose={() => setAddModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Add New Tool</Text>
                            <TouchableOpacity onPress={() => setAddModalVisible(false)}>
                                <Ionicons name="close" size={24} color={colors.text} />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.divider} />
                        
                        <ScrollView>
                            <Text style={styles.label}>Tool Name *</Text>
                            <TextInput 
                                style={styles.input}
                                value={newTool.name}
                                onChangeText={(t) => setNewTool({...newTool, name: t})}
                                placeholder="e.g. Drill Machine"
                            />

                            <Text style={styles.label}>Unique ID *</Text>
                            <TextInput 
                                style={styles.input}
                                value={newTool.uniqueId}
                                onChangeText={(t) => setNewTool({...newTool, uniqueId: t})}
                                placeholder="e.g. DR-01"
                            />

                            <Text style={styles.label}>Description</Text>
                            <TextInput 
                                style={[styles.input, {height: 80}]}
                                value={newTool.description}
                                onChangeText={(t) => setNewTool({...newTool, description: t})}
                                placeholder="Details about the tool"
                                multiline
                            />

                            <Text style={styles.label}>Condition</Text>
                            <View style={styles.conditionRow}>
                                {['New', 'Good', 'Fair', 'Poor'].map((c) => (
                                    <TouchableOpacity 
                                        key={c}
                                        style={[styles.conditionChip, newTool.condition === c && styles.conditionActive]}
                                        onPress={() => setNewTool({...newTool, condition: c})}
                                    >
                                        <Text style={[styles.conditionText, newTool.condition === c && styles.conditionTextActive]}>{c}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <TouchableOpacity style={styles.createBtn} onPress={handleCreateTool}>
                                <Text style={styles.createBtnText}>Create Tool</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background, padding: 20, paddingTop: 50 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    title: { fontSize: 20, fontWeight: 'bold', color: colors.text },
    list: { paddingBottom: 20 },
    card: { backgroundColor: colors.surface, padding: 15, borderRadius: 10, marginBottom: 10, borderWidth: 1, borderColor: colors.border },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    toolName: { fontSize: 18, fontWeight: 'bold', color: colors.text },
    toolId: { fontSize: 14, color: '#666', marginTop: 2, marginBottom: 5 },
    tapToGen: { fontSize: 12, color: colors.primary, fontStyle: 'italic', marginTop: 5 },
    
    statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
    statusAvailable: { backgroundColor: 'rgba(76, 175, 80, 0.1)' },
    statusInUse: { backgroundColor: 'rgba(33, 150, 243, 0.1)' },
    statusMaintenance: { backgroundColor: 'rgba(244, 67, 54, 0.1)' },
    statusText: { fontSize: 10, fontWeight: 'bold', color: colors.text },

    holderInfo: { marginTop: 10, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 10 },
    holderText: { fontSize: 14, fontWeight: '600', color: colors.text },
    dueText: { fontSize: 12, color: '#666', marginTop: 2 },
    overdue: { color: colors.danger, fontWeight: 'bold' },

    // Modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
    modalContent: { width: '85%', backgroundColor: colors.surface, borderRadius: 20, padding: 20, elevation: 5 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    modalTitle: { fontSize: 20, fontWeight: 'bold', color: colors.text },
    modalSubtitle: { fontSize: 14, color: '#666' },
    divider: { height: 1, backgroundColor: colors.border, marginVertical: 15 },
    
    qrContainer: { alignItems: 'center', padding: 10 },
    qrInstructions: { textAlign: 'center', marginBottom: 20, color: colors.text, fontSize: 16 },
    qrWrapper: { padding: 10, backgroundColor: 'white', borderRadius: 10 },

    infoContainer: { padding: 10 },
    infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
    infoLabel: { fontWeight: 'bold', color: '#666' },
    infoValue: { fontWeight: 'bold', color: colors.text },
    noQrText: { textAlign: 'center', color: '#888', fontStyle: 'italic', marginTop: 20, marginBottom: 20 },
    
    forceReturnBtn: { backgroundColor: colors.surfaceHighlight, padding: 15, borderRadius: 10, alignItems: 'center' },
    forceReturnText: { color: colors.danger, fontWeight: 'bold' },

    // Add Modal Styles
    label: { fontWeight: 'bold', marginBottom: 5, color: colors.text },
    input: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: 10, marginBottom: 15, color: colors.text },
    conditionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
    conditionChip: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border },
    conditionActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    conditionText: { color: colors.text },
    conditionTextActive: { color: 'white', fontWeight: 'bold' },
    createBtn: { backgroundColor: colors.primary, padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 10 },
    createBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});

export default ToolsScreen;
