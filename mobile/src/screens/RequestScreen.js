import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, Alert, Modal, ScrollView } from 'react-native';
import api from '../services/api';
import { Ionicons } from '@expo/vector-icons';

const RequestScreen = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    
    // Form
    const [itemName, setItemName] = useState('');
    const [quantity, setQuantity] = useState('');
    const [unit, setUnit] = useState('');
    const [urgency, setUrgency] = useState('Medium');

    // Presets
    const [presets, setPresets] = useState([]);
    const [showPresets, setShowPresets] = useState(false);

    useEffect(() => {
        fetchRequests();
        fetchPresets();
    }, []);

    const fetchRequests = async () => {
        try {
            const res = await api.get('/requests');
            setRequests(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchPresets = async () => {
        try {
            const res = await api.get('/requests/presets');
            setPresets(res.data);
        } catch (error) {
            console.error("Failed to fetch presets", error);
        }
    };

    const submitRequest = async () => {
        if (!itemName || !quantity || !unit) {
            Alert.alert('Error', 'Fill all fields');
            return;
        }

        try {
            await api.post('/requests', {
                items: [{ name: itemName, quantity: Number(quantity), unit }],
                urgency,
                siteLocation: { lat: 0, lng: 0, address: 'Site A' },
                type: 'Material' 
            });
            Alert.alert('Success', 'Request Sent');
            setModalVisible(false);
            setItemName('');
            setQuantity('');
            setUnit('');
            setUrgency('Medium');
            fetchRequests();
        } catch (error) {
            Alert.alert('Error', 'Failed to submit request');
        }
    };

    const selectPreset = (preset) => {
        setItemName(preset.name);
        setUnit(preset.unit);
        setShowPresets(false);
    };

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.header}>
                <Text style={styles.cardTitle}>{item.type} Request</Text>
                <Text style={[styles.status, {color: item.status === 'Approved' ? 'green' : 'orange'}]}>{item.status}</Text>
            </View>
            {item.items.map((i, index) => (
                <Text key={index} style={styles.itemText}>• {i.name}: {i.quantity} {i.unit}</Text>
            ))}
            <View style={{flexDirection: 'row', justifyContent: 'space-between', marginTop: 5}}>
                <Text style={styles.meta}>Urgency: {item.urgency}</Text>
                {item.payment?.status === 'Paid' && <Text style={{color: 'green', fontWeight: 'bold'}}>Paid</Text>}
            </View>
            <Text style={styles.meta}>Date: {new Date(item.createdAt).toLocaleDateString()}</Text>
        </View>
    );

    return (
        <View style={styles.container}>
             <View style={styles.topRow}>
                <Text style={styles.screenTitle}>Material Requests</Text>
                <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
                    <Ionicons name="add" size={24} color="white" />
                </TouchableOpacity>
            </View>

            <FlatList 
                data={requests}
                renderItem={renderItem}
                keyExtractor={item => item._id}
                refreshing={loading}
                onRefresh={fetchRequests}
            />

            <Modal visible={modalVisible} animationType="slide" transparent>
                 <View style={styles.modalBg}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalHeader}>New Request</Text>
                        
                        <Text style={styles.label}>Select Material:</Text>
                        <TouchableOpacity style={styles.input} onPress={() => setShowPresets(!showPresets)}>
                            <Text style={{color: itemName ? 'black' : '#999'}}>{itemName || "Select Material..."}</Text>
                        </TouchableOpacity>

                        {showPresets && (
                            <View style={styles.presetList}>
                                <ScrollView nestedScrollEnabled style={{maxHeight: 150}}>
                                    {presets.map((p) => (
                                        <TouchableOpacity key={p._id} style={styles.presetItem} onPress={() => selectPreset(p)}>
                                            <Text>{p.name} ({p.unit})</Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </View>
                        )}

                        {!showPresets && (
                            <>
                                <View style={{flexDirection:'row', justifyContent:'space-between'}}>
                                     <TextInput style={[styles.input, {width:'48%'}]} placeholder="Qty" keyboardType="numeric" value={quantity} onChangeText={setQuantity} />
                                     <TextInput style={[styles.input, {width:'48%', backgroundColor: '#f0f0f0'}]} placeholder="Unit" value={unit} editable={false} />
                                </View>
                                
                                <Text style={styles.label}>Urgency:</Text>
                                <View style={styles.row}>
                                     <TouchableOpacity style={[styles.prioBtn, urgency==='High' && styles.activePrio]} onPress={() => setUrgency('High')}>
                                        <Text style={urgency==='High' ? styles.activeText : styles.text}>High</Text>
                                     </TouchableOpacity>
                                     <TouchableOpacity style={[styles.prioBtn, urgency==='Medium' && styles.activePrio]} onPress={() => setUrgency('Medium')}>
                                        <Text style={urgency==='Medium' ? styles.activeText : styles.text}>Medium</Text>
                                     </TouchableOpacity>
                                </View>

                                <View style={styles.modalBtns}>
                                    <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                                        <Text style={styles.btnText}>Cancel</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.saveBtn} onPress={submitRequest}>
                                        <Text style={[styles.btnText, {color:'white'}]}>Submit</Text>
                                    </TouchableOpacity>
                                </View>
                            </>
                        )}
                        {showPresets && (
                             <TouchableOpacity style={[styles.cancelBtn, {width: '100%', marginTop: 10}]} onPress={() => setShowPresets(false)}>
                                <Text style={styles.btnText}>Close List</Text>
                             </TouchableOpacity>
                        )}
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, paddingTop: 60, backgroundColor: '#F2F2F7' },
    topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    screenTitle: { fontSize: 24, fontWeight: 'bold' },
    addBtn: { backgroundColor: '#007AFF', padding: 10, borderRadius: 20 },
    card: { backgroundColor: 'white', padding: 15, borderRadius: 12, marginBottom: 15 },
    header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
    cardTitle: { fontSize: 16, fontWeight: 'bold' },
    status: { fontWeight: 'bold' },
    itemText: { fontSize: 16, marginBottom: 5 },
    meta: { fontSize: 12, color: '#999', marginTop: 5 },
    modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
    modalContent: { backgroundColor: 'white', padding: 20, borderRadius: 15 },
    modalHeader: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 15 },
    row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
    prioBtn: { padding: 10, borderWidth: 1, borderColor: '#ddd', borderRadius: 5, width: '48%', alignItems: 'center' },
    activePrio: { backgroundColor: '#FF3B30', borderColor: '#FF3B30' },
    text: { color: '#333' },
    activeText: { color: 'white', fontWeight: 'bold' },
    modalBtns: { flexDirection: 'row', justifyContent: 'space-between' },
    cancelBtn: { padding: 15, width: '45%', alignItems: 'center' },
    saveBtn: { backgroundColor: '#007AFF', padding: 15, borderRadius: 10, width: '45%', alignItems: 'center' },
    btnText: { fontWeight: 'bold' },
    label: { marginBottom: 5, fontWeight: '600', color: '#333' },
    presetList: { maxHeight: 200, borderWidth: 1, borderColor: '#eee', borderRadius: 8, marginBottom: 15 },
    presetItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: '#eee' }
});

export default RequestScreen;
