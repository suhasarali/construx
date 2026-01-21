import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert, ScrollView } from 'react-native';
import { useLanguage } from '../context/LanguageContext';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

const EngineerDashboardScreen = () => {
    const { t } = useLanguage();
    const { logout, userInfo } = useContext(AuthContext);
    const [myRequisitions, setMyRequisitions] = useState([]);
    
    // New Request State
    const [itemName, setItemName] = useState('');
    const [quantity, setQuantity] = useState('');
    const [unit, setUnit] = useState('');
    const [siteLocation, setSiteLocation] = useState('Site A'); // Default or dynamic

    useEffect(() => {
        fetchRequisitions();
    }, []);

    const fetchRequisitions = async () => {
        try {
            const res = await api.get('/materials');
            setMyRequisitions(res.data);
        } catch (error) {
            console.log(error);
        }
    };

    const submitRequest = async () => {
        if (!itemName || !quantity || !unit) {
            Alert.alert('Error', 'Fill all fields');
            return;
        }

        try {
            await api.post('/materials', {
                items: [{ name: itemName, quantity: Number(quantity), unit }],
                siteLocation,
                comments: 'Urgent',
            });
            Alert.alert('Success', 'Request Sent');
            setItemName('');
            setQuantity('');
            setUnit('');
            fetchRequisitions();
        } catch (error) {
            Alert.alert('Error', 'Failed to request material');
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>{t('welcome')}, {userInfo?.name}</Text>
                <TouchableOpacity onPress={logout}><Text style={styles.logout}>{t('logout')}</Text></TouchableOpacity>
            </View>

            <Text style={styles.heading}>{t('requestMaterial')}</Text>
            <View style={styles.form}>
                <TextInput style={styles.input} placeholder="Item Name (e.g. Cement)" value={itemName} onChangeText={setItemName} />
                <View style={styles.row}>
                    <TextInput style={[styles.input, {flex: 2, marginRight: 10}]} placeholder="Quantity" keyboardType="numeric" value={quantity} onChangeText={setQuantity} />
                    <TextInput style={[styles.input, {flex: 1}]} placeholder="Unit (kg/bag)" value={unit} onChangeText={setUnit} />
                </View>
                <TouchableOpacity style={styles.btn} onPress={submitRequest}>
                    <Text style={styles.btnText}>{t('submit')}</Text>
                </TouchableOpacity>
            </View>

            <Text style={[styles.heading, {marginTop: 20}]}>My Requests</Text>
            <FlatList
                data={myRequisitions}
                keyExtractor={item => item._id}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>{item.items[0].name} ({item.items[0].quantity} {item.items[0].unit})</Text>
                        <Text>Status: <Text style={{fontWeight: 'bold', color: item.status === 'Approved' ? 'green' : 'orange'}}>{item.status}</Text></Text>
                        <Text style={{fontSize: 12, color: '#666'}}>{new Date(item.createdAt).toLocaleDateString()}</Text>
                    </View>
                )}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, paddingTop: 50, backgroundColor: '#f5f5f5' },
    header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
    title: { fontSize: 20, fontWeight: 'bold' },
    logout: { color: 'red' },
    heading: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
    form: { backgroundColor: 'white', padding: 15, borderRadius: 10 },
    input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 5, padding: 10, marginBottom: 10 },
    row: { flexDirection: 'row' },
    btn: { backgroundColor: '#007AFF', padding: 12, borderRadius: 5, alignItems: 'center' },
    btnText: { color: 'white', fontWeight: 'bold' },
    card: { backgroundColor: 'white', padding: 15, borderRadius: 10, marginBottom: 10, marginTop: 5 },
    cardTitle: { fontSize: 16, fontWeight: 'bold' },
});

export default EngineerDashboardScreen;
