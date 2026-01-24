import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, Alert, Modal, ScrollView } from 'react-native';
import { colors } from '../constants/colors';
import api from '../services/api';
import { Ionicons } from '@expo/vector-icons';

const RequestScreen = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    
    // Form
    const [cart, setCart] = useState([]);
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

    const addItemToCart = () => {
        if (!itemName || !quantity || !unit) {
            Alert.alert('Error', 'Please select material and quantity');
            return;
        }
        setCart([...cart, { name: itemName, quantity: Number(quantity), unit }]);
        setItemName('');
        setQuantity('');
        setUnit('');
    };

    const removeFromCart = (index) => {
        const newCart = [...cart];
        newCart.splice(index, 1);
        setCart(newCart);
    };

    const submitRequest = async () => {
        if (cart.length === 0) {
            Alert.alert('Error', 'Add at least one item');
            return;
        }

        try {
            await api.post('/requests', {
                items: cart,
                urgency,
                siteLocation: { lat: 0, lng: 0, address: 'Site A' },
                type: 'Material' 
            });
            Alert.alert('Success', 'Request Sent');
            setModalVisible(false);
            setCart([]); // Clear cart
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
                <Text style={[styles.status, {color: item.status === 'Approved' ? colors.success : colors.warning}]}>{item.status}</Text>
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

                                <TouchableOpacity style={styles.addItemBtn} onPress={addItemToCart}>
                                    <Text style={styles.addItemText}>+ Add Item to List</Text>
                                </TouchableOpacity>

                                {cart.length > 0 && (
                                    <View style={styles.cartContainer}>
                                        <Text style={styles.label}>Items in Request:</Text>
                                        <ScrollView style={{maxHeight: 100}}>
                                            {cart.map((item, index) => (
                                                <View key={index} style={styles.cartItem}>
                                                    <Text style={{flex: 1}}>{item.name} ({item.quantity} {item.unit})</Text>
                                                    <TouchableOpacity onPress={() => removeFromCart(index)}>
                                                        <Ionicons name="trash" size={18} color="red" />
                                                    </TouchableOpacity>
                                                </View>
                                            ))}
                                        </ScrollView>
                                    </View>
                                )}
                                
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
                                        <Text style={[styles.btnText, {color:'white'}]}>Submit Request ({cart.length})</Text>
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
    header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
    cardTitle: { fontSize: 18, fontWeight: 'bold', color: colors.text },
    status: { fontWeight: 'bold', fontSize: 14 },
    itemText: { fontSize: 16, marginBottom: 6, color: colors.textSecondary },
    meta: { fontSize: 12, color: colors.textTertiary, marginTop: 8, fontWeight: '600' },
    modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', padding: 24 },
    modalContent: { backgroundColor: colors.surface, padding: 24, borderRadius: 30, borderWidth: 1, borderColor: colors.border },
    modalHeader: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: colors.text },
    input: { 
        borderWidth: 1, 
        borderColor: colors.border, 
        borderRadius: 16, 
        padding: 16, 
        marginBottom: 16, 
        backgroundColor: colors.inputBg,
        color: colors.text
    },
    row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
    prioBtn: { padding: 12, borderWidth: 1, borderColor: colors.border, borderRadius: 12, width: '48%', alignItems: 'center', backgroundColor: colors.surfaceHighlight },
    activePrio: { backgroundColor: colors.danger, borderColor: colors.danger },
    text: { color: colors.textSecondary, fontWeight: '600' },
    activeText: { color: colors.textInverted, fontWeight: 'bold' },
    modalBtns: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
    cancelBtn: { padding: 16, width: '45%', alignItems: 'center', borderRadius: 16, backgroundColor: colors.surfaceHighlight },
    saveBtn: { backgroundColor: colors.info, padding: 16, borderRadius: 16, width: '45%', alignItems: 'center' },
    btnText: { fontWeight: 'bold', color: colors.textInverted },
    label: { marginBottom: 8, fontWeight: '700', color: colors.textSecondary, textTransform: 'uppercase', fontSize: 12 },
    presetList: { maxHeight: 200, borderWidth: 1, borderColor: colors.border, borderRadius: 16, marginBottom: 16, backgroundColor: colors.surfaceHighlight },
    presetItem: { padding: 16, borderBottomWidth: 1, borderBottomColor: colors.border },
    addItemBtn: { backgroundColor: colors.success, padding: 12, borderRadius: 12, alignItems: 'center', marginVertical: 12 },
    addItemText: { color: colors.textInverted, fontWeight: 'bold' },
    cartContainer: { maxHeight: 150, marginBottom: 16, borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: 12, backgroundColor: colors.surfaceHighlight },
    cartItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border }
});

export default RequestScreen;
