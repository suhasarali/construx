import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Ionicons } from '@expo/vector-icons';

const ProfileScreen = () => {
    const { userInfo, logout } = useContext(AuthContext);
    const { t } = useLanguage();

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.avatar}>
                    <Text style={styles.initials}>{userInfo?.name?.charAt(0)}</Text>
                </View>
                <Text style={styles.name}>{userInfo?.name}</Text>
                <Text style={styles.role}>{userInfo?.role}</Text>
            </View>

            <View style={styles.section}>
                <View style={styles.row}>
                    <Ionicons name="call-outline" size={24} color="#666" />
                    <Text style={styles.rowText}>{userInfo?.phone}</Text>
                </View>
                {/* Add more profile fields here */}
            </View>

            <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
                <Text style={styles.logoutText}>{t('logout')}</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, paddingTop: 60, backgroundColor: '#fff' },
    header: { alignItems: 'center', marginBottom: 40 },
    avatar: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#007AFF', justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
    initials: { color: 'white', fontSize: 40, fontWeight: 'bold' },
    name: { fontSize: 24, fontWeight: 'bold' },
    role: { fontSize: 16, color: '#666', marginTop: 5 },
    section: { marginBottom: 30 },
    row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#eee' },
    rowText: { fontSize: 18, marginLeft: 15, color: '#333' },
    logoutBtn: { backgroundColor: '#FF3B30', padding: 15, borderRadius: 10, alignItems: 'center' },
    logoutText: { color: 'white', fontSize: 16, fontWeight: 'bold' }
});

export default ProfileScreen;
