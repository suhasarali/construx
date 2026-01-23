import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

const EngineerDashboardScreen = () => {
    const { logout, userInfo } = useContext(AuthContext);
    const navigation = useNavigation();

    const menuItems = [
        { title: 'Attendance Management', icon: 'people', screen: 'AttendanceManagement', color: '#FF9500' },
        { title: 'Task Management', icon: 'clipboard', screen: 'TaskManagement', color: '#007AFF' },
        { title: 'Material Requests', icon: 'cube', screen: 'Requests', color: '#5856D6' },
        { title: 'Daily Progress Report', icon: 'stats-chart', screen: 'DPR', color: '#34C759' },
        { title: 'Team Communication', icon: 'chatbubbles', screen: 'Communication', color: '#AF52DE' },
    ];

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.header}>
                <View>
                     <Text style={styles.greeting}>Welcome,</Text>
                     <Text style={styles.name}>{userInfo?.name}</Text>
                     <Text style={styles.role}>Site Engineer</Text>
                </View>
                <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
                    <Ionicons name="log-out-outline" size={24} color="#FF3B30" />
                </TouchableOpacity>
            </View>

            <View style={styles.grid}>
                {menuItems.map((item, index) => (
                    <TouchableOpacity 
                        key={index} 
                        style={styles.card} 
                        onPress={() => navigation.navigate(item.screen)}
                    >
                        <View style={[styles.iconContainer, { backgroundColor: item.color + '20' }]}>
                             <Ionicons name={item.icon} size={32} color={item.color} />
                        </View>
                        <Text style={styles.cardTitle}>{item.title}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { padding: 20, paddingTop: 60, flex: 1, backgroundColor: '#F2F2F7' },
    header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
    greeting: { fontSize: 16, color: '#8E8E93' },
    name: { fontSize: 24, fontWeight: 'bold' },
    role: { color: '#007AFF', marginTop: 2 },
    grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    card: { backgroundColor: 'white', width: '48%', padding: 20, borderRadius: 15, marginBottom: 15, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
    iconContainer: { padding: 15, borderRadius: 50, marginBottom: 15 },
    cardTitle: { fontWeight: '600', textAlign: 'center' }
});

export default EngineerDashboardScreen;
