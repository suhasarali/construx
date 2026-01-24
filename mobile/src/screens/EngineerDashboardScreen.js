import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

import { colors } from '../constants/colors';

const EngineerDashboardScreen = () => {
    const { logout, userInfo } = useContext(AuthContext);
    const navigation = useNavigation();

    const menuItems = [
        { title: 'Attendance Management', icon: 'people', screen: 'AttendanceManagement' },
        { title: 'Task Management', icon: 'clipboard', screen: 'TaskManagement' },
        { title: 'Material Requests', icon: 'cube', screen: 'Requests' },
        { title: 'Daily Progress Report', icon: 'stats-chart', screen: 'DPR' },
        { title: 'Team Communication', icon: 'chatbubbles', screen: 'Communication' },
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
                    <Ionicons name="log-out-outline" size={24} color={colors.danger} />
                </TouchableOpacity>
            </View>

            <View style={styles.grid}>
                {menuItems.map((item, index) => (
                    <TouchableOpacity 
                        key={index} 
                        style={styles.card} 
                        onPress={() => navigation.navigate(item.screen)}
                    >
                        <View style={styles.iconContainer}>
                             <Ionicons name={item.icon} size={32} color={colors.primary} />
                        </View>
                        <Text style={styles.cardTitle}>{item.title}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { padding: 24, paddingTop: 60, flex: 1, backgroundColor: colors.background },
    header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30, alignItems: 'center' },
    greeting: { fontSize: 16, color: colors.textSecondary, letterSpacing: 1 },
    name: { fontSize: 32, fontWeight: '900', color: colors.text, marginVertical: 4 },
    role: { fontSize: 14, color: colors.primary, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
    logoutBtn: { padding: 10, backgroundColor: colors.surfaceHighlight, borderRadius: 12 },
    grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    card: { 
        backgroundColor: colors.surface, 
        width: '48%', 
        padding: 24, 
        borderRadius: 24, 
        marginBottom: 16, 
        alignItems: 'center', 
        borderWidth: 1,
        borderColor: colors.border,
    },
    iconContainer: { 
        padding: 16, 
        borderRadius: 50, 
        marginBottom: 16, 
        backgroundColor: colors.surfaceHighlight,
        borderWidth: 1,
        borderColor: colors.border
    },
    cardTitle: { 
        fontWeight: '700', 
        textAlign: 'center', 
        color: colors.text, 
        fontSize: 14,
        lineHeight: 20
    }
});

export default EngineerDashboardScreen;
