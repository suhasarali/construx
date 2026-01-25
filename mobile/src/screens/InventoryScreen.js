import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, Alert, ScrollView } from 'react-native';
import { colors } from '../constants/colors';
import api from '../services/api';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';

const InventoryScreen = () => {
    const { userInfo } = useContext(AuthContext);
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [transactionMode, setTransactionMode] = useState('IN'); // IN or OUT
    const [selectedItem, setSelectedItem] = useState(null);
    const [qty, setQty] = useState('');
    const [reason, setReason] = useState('Usage');
    const [notes, setNotes] = useState('');

    // New Item Form
    const [newItemModal, setNewItemModal] = useState(false);
    const [newItemName, setNewItemName] = useState('');
    const [newItemUnit, setNewItemUnit] = useState('');
    const [newItemQty, setNewItemQty] = useState('');

    useEffect(() => {
        fetchInventory();
    }, []);

    const fetchInventory = async () => {
        try {
            const res = await api.get('/inventory');
            setInventory(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleTransaction = (item, mode) => {
        setSelectedItem(item);
        setTransactionMode(mode);
        setQty('');
        setReason(mode === 'IN' ? 'Purchase' : 'Usage');
        setNotes('');
        setModalVisible(true);
    };

    const submitTransaction = async () => {
        if (!qty || isNaN(qty) || Number(qty) <= 0) {
            Alert.alert('Error', 'Invalid Quantity');
            return;
        }

        try {
            await api.post('/inventory/transaction', {
                inventoryId: selectedItem._id,
                type: transactionMode,
                quantity: Number(qty),
                reason,
                notes
            });
            Alert.alert('Success', 'Stock Updated');
            setModalVisible(false);
            fetchInventory();
        } catch (error) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to update stock');
        }
    };

    const addNewItem = async () => {
        if (!newItemName || !newItemUnit) {
            Alert.alert('Error', 'Name and Unit are required');
            return;
        }
        try {
            await api.post('/inventory', {
                name: newItemName,
                unit: newItemUnit,
                quantity: Number(newItemQty) || 0
            });
            Alert.alert('Success', 'Item Added');
            setNewItemModal(false);
            setNewItemName('');
            setNewItemUnit('');
            setNewItemQty('');
            fetchInventory();
        } catch (error) {
            Alert.alert('Error', 'Failed to add item');
        }
    };

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.header}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={[styles.qty, item.quantity <= item.lowStockThreshold && styles.lowStock]}>
                    {item.quantity} {item.unit}
                </Text>
            </View>
            <View style={styles.actions}>
                {userInfo.role !== 'Site_Engineer' && (
                    <TouchableOpacity style={[styles.actionBtn, styles.inBtn]} onPress={() => handleTransaction(item, 'IN')}>
                        <Ionicons name="add-circle" size={20} color="white" />
                        <Text style={styles.btnText}>Add (In)</Text>
                    </TouchableOpacity>
                )}
                <TouchableOpacity style={[styles.actionBtn, styles.outBtn]} onPress={() => handleTransaction(item, 'OUT')}>
                    <Ionicons name="remove-circle" size={20} color="white" />
                    <Text style={styles.btnText}>Use (Out)</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.topRow}>
                <Text style={styles.title}>Inventory</Text>
                {userInfo.role !== 'Site_Engineer' && (
                    <TouchableOpacity style={styles.addBtn} onPress={() => setNewItemModal(true)}>
                        <Ionicons name="add" size={24} color="white" />
                    </TouchableOpacity>
                )}
            </View>

            <FlatList
                data={inventory}
                renderItem={renderItem}
                keyExtractor={item => item._id}
                refreshing={loading}
                onRefresh={fetchInventory}
            />

            {/* Transaction Modal */}
            <Modal visible={modalVisible} transparent animationType="slide">
                <View style={styles.modalBg}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>
                            {transactionMode === 'IN' ? 'Add Stock' : 'Remove Stock'} - {selectedItem?.name}
                        </Text>
                        
                        <TextInput
                            style={styles.input}
                            placeholder="Quantity"
                            placeholderTextColor="#ccc" 
                            keyboardType="numeric"
                            value={qty}
                            onChangeText={setQty}
                        />

                        {transactionMode === 'OUT' && (
                            <View style={styles.reasonContainer}>
                                <Text style={styles.label}>Reason:</Text>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginBottom: 10}}>
                                    {['Usage', 'Wastage', 'Theft', 'Damaged', 'Other'].map(r => (
                                        <TouchableOpacity 
                                            key={r} 
                                            style={[styles.chip, reason === r && styles.activeChip]}
                                            onPress={() => setReason(r)}
                                        >
                                            <Text style={[styles.chipText, reason === r && styles.activeChipText]}>{r}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </View>
                        )}

                        <TextInput
                            style={[styles.input, { height: 80 }]}
                            placeholder="Notes (Optional)"
                            placeholderTextColor="#ccc" 
                            multiline
                            value={notes}
                            onChangeText={setNotes}
                        />

                        <View style={styles.modalBtns}>
                            <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                                <Text style={styles.cancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.saveBtn} onPress={submitTransaction}>
                                <Text style={styles.saveText}>Confirm</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* New Item Modal */}
            <Modal visible={newItemModal} transparent animationType="slide">
                 <View style={styles.modalBg}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>New Inventory Item</Text>
                        <TextInput style={styles.input} placeholder="Item Name" placeholderTextColor="#ccc" value={newItemName} onChangeText={setNewItemName} />
                        <TextInput style={styles.input} placeholder="Unit (e.g. kg, bags)" placeholderTextColor="#ccc" value={newItemUnit} onChangeText={setNewItemUnit} />
                        <TextInput style={styles.input} placeholder="Initial Qty" placeholderTextColor="#ccc" keyboardType="numeric" value={newItemQty} onChangeText={setNewItemQty} />
                        
                        <View style={styles.modalBtns}>
                            <TouchableOpacity style={styles.cancelBtn} onPress={() => setNewItemModal(false)}>
                                <Text style={styles.cancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.saveBtn} onPress={addNewItem}>
                                <Text style={styles.saveText}>Create</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background, padding: 20, paddingTop: 60 },
    topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    title: { fontSize: 28, fontWeight: 'bold', color: colors.text },
    addBtn: { backgroundColor: colors.primary, padding: 10, borderRadius: 25 },
    card: { backgroundColor: colors.surface, padding: 16, borderRadius: 16, marginBottom: 16, borderWidth: 1, borderColor: colors.border },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    itemName: { fontSize: 18, fontWeight: 'bold', color: colors.text },
    qty: { fontSize: 18, fontWeight: 'bold', color: colors.primary },
    lowStock: { color: colors.danger },
    actions: { flexDirection: 'row', justifyContent: 'space-between' },
    actionBtn: { flexDirection: 'row', alignItems: 'center', padding: 10, borderRadius: 12, flex: 0.48, justifyContent: 'center' },
    inBtn: { backgroundColor: colors.success },
    outBtn: { backgroundColor: colors.danger },
    btnText: { color: 'white', fontWeight: 'bold', marginLeft: 8 },
    
    // Modal
    modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', padding: 20 },
    modalContent: { backgroundColor: colors.surface, padding: 20, borderRadius: 20, borderWidth:1, borderColor: colors.border },
    modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, color: colors.text, textAlign: 'center' },
    input: { backgroundColor: colors.inputBg, padding: 15, borderRadius: 12, color: colors.text, marginBottom: 15, borderWidth: 1, borderColor: colors.border },
    modalBtns: { flexDirection: 'row', justifyContent: 'space-between' },
    cancelBtn: { padding: 15, flex: 0.45, alignItems: 'center', backgroundColor: colors.surfaceHighlight, borderRadius: 12 },
    saveBtn: { padding: 15, flex: 0.45, alignItems: 'center', backgroundColor: colors.primary, borderRadius: 12 },
    cancelText: { color: colors.danger, fontWeight: 'bold' },
    saveText: { color: 'white', fontWeight: 'bold' },
    
    // Chips
    reasonContainer: { marginBottom: 15 },
    label: { color: colors.textSecondary, marginBottom: 8, fontWeight: 'bold' },
    chip: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, backgroundColor: colors.surfaceHighlight, marginRight: 8, borderWidth: 1, borderColor: colors.border },
    activeChip: { backgroundColor: colors.danger, borderColor: colors.danger },
    chipText: { color: colors.text },
    activeChipText: { color: 'white', fontWeight: 'bold' }
});

export default InventoryScreen;
