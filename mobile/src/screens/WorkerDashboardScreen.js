import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Modal } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useNavigation } from '@react-navigation/native';
import api from '../services/api';
import { Ionicons } from '@expo/vector-icons';

import { colors } from '../constants/colors';

const WorkerDashboardScreen = () => {
    const { userInfo, logout } = useContext(AuthContext);
    const { t, switchLanguage, language, convertNumber } = useLanguage();
    const navigation = useNavigation();
    const [refreshing, setRefreshing] = useState(false);
    const [stats, setStats] = useState({
        attendance: 'Not Checked In',
        pendingTasks: 0
    });
    const [langModalVisible, setLangModalVisible] = useState(false);

    const fetchDashboardData = async () => {
        try {
            // Get today's attendance
            const attRes = await api.get('/attendance');
            let status = 'Not Checked In';
            if (attRes.data.length > 0) {
                const today = new Date().toDateString();
                const lastRecord = attRes.data[0];
                const recordDate = new Date(lastRecord.date).toDateString();
                if (today === recordDate) {
                    status = lastRecord.checkOutTime ? 'Checked Out' : 'Checked In';
                }
            }

            // Get pending tasks count
            const taskRes = await api.get('/tasks');
            const pending = taskRes.data.filter(t => t.status === 'Pending' || t.status === 'In Progress').length;

            // Get issues count
            const reportRes = await api.get('/reports');
            const issuesCount = reportRes.data.filter(r => r.issuesRaised && r.issuesRaised.trim().length > 0).length;

            setStats({
                attendance: status,
                pendingTasks: pending,
                issues: issuesCount
            });
        } catch (error) {
            console.error(error);
        }
    };



    const onRefresh = async () => {
        setRefreshing(true);
        await fetchDashboardData();
        setRefreshing(false);
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const getStatusText = (status) => {
        switch(status) {
            case 'Checked In': return t('checkedIn');
            case 'Checked Out': return t('checkedOut');
            default: return t('notCheckedIn');
        }
    };

    return (
        <ScrollView
            contentContainerStyle={styles.container}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                   <TouchableOpacity onPress={() => setLangModalVisible(true)} style={styles.langBtn}>
                        <Ionicons name="globe-outline" size={24} color={colors.primary} />
                   </TouchableOpacity>
                   <View style={styles.greetingContainer}>
                        <Text style={styles.name}>{userInfo?.name}</Text>
                        <Text style={styles.greeting}>{t('greeting')} {t('worker')}</Text>
                   </View>
                </View>
                <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
                    <Ionicons name="log-out-outline" size={24} color={colors.danger} />
                </TouchableOpacity>
            </View>

            <View style={styles.statusCard}>
                <Text style={styles.cardTitle}>{t('todayStatus')}</Text>
                <View style={styles.statusRow}>
                    <Ionicons
                        name={stats.attendance === 'Checked In' ? "checkmark-circle" : "time-outline"}
                        size={32}
                        color={stats.attendance === 'Checked In' ? colors.success : colors.warning}
                    />
                    <Text style={styles.statusText}>{getStatusText(stats.attendance)}</Text>
                </View>
                {stats.attendance === 'Not Checked In' && (
                    <TouchableOpacity
                        style={styles.actionBtn}
                        onPress={() => navigation.navigate('Attendance')}
                    >
                        <Text style={styles.btnText}>{t('checkInNow')}</Text>
                    </TouchableOpacity>
                )}
            </View>

            <View style={styles.grid}>
                <TouchableOpacity style={styles.gridItem} onPress={() => navigation.navigate('Tasks')}>
                    <Ionicons name="clipboard-outline" size={32} color={colors.primary} />
                    <Text style={styles.gridValue}>{convertNumber(stats.pendingTasks)}</Text>
                    <Text style={styles.gridLabel}>{t('pendingTasks')}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.gridItem} onPress={() => navigation.navigate('Issues')}>
                    <Ionicons name="warning-outline" size={32} color={colors.warning} />
                    <Text style={styles.gridValue}>{convertNumber(stats.issues || 0)}</Text>
                    <Text style={styles.gridLabel}>{t('issues')}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.gridItem} onPress={() => navigation.navigate('Communication')}>
                    <View style={{flex: 1, justifyContent: 'center'}}>
                         <Ionicons name="chatbubbles-outline" size={40} color={colors.primary} />
                    </View>
                    <Text style={styles.gridLabel}>{t('messages')}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.gridItem} onPress={() => navigation.navigate('DailyWork')}>
                    <View style={{flex: 1, justifyContent: 'center'}}>
                        <Ionicons name="cloud-upload-outline" size={40} color={colors.success} />
                    </View>
                    <Text style={styles.gridLabel}>{t('dailyWork')}</Text>
                </TouchableOpacity>
            </View>

            {/* Language Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={langModalVisible}
                onRequestClose={() => setLangModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>{t('selectLanguage')}</Text>
                        
                        <TouchableOpacity 
                            style={[styles.langOption, language === 'en' && styles.selectedLang]}
                            onPress={() => {
                                switchLanguage('en');
                                setLangModalVisible(false);
                            }}
                        >
                            <Text style={[styles.langText, language === 'en' && styles.selectedLangText]}>English</Text>
                            {language === 'en' && <Ionicons name="checkmark" size={24} color={colors.primary} />}
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={[styles.langOption, language === 'hi' && styles.selectedLang]}
                            onPress={() => {
                                switchLanguage('hi');
                                setLangModalVisible(false);
                            }}
                        >
                            <Text style={[styles.langText, language === 'hi' && styles.selectedLangText]}>हिंदी (Hindi)</Text>
                            {language === 'hi' && <Ionicons name="checkmark" size={24} color={colors.primary} />}
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={[styles.langOption, language === 'mr' && styles.selectedLang]}
                            onPress={() => {
                                switchLanguage('mr');
                                setLangModalVisible(false);
                            }}
                        >
                            <Text style={[styles.langText, language === 'mr' && styles.selectedLangText]}>मराठी (Marathi)</Text>
                            {language === 'mr' && <Ionicons name="checkmark" size={24} color={colors.primary} />}
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={[styles.langOption, language === 'kn' && styles.selectedLang]}
                            onPress={() => {
                                switchLanguage('kn');
                                setLangModalVisible(false);
                            }}
                        >
                            <Text style={[styles.langText, language === 'kn' && styles.selectedLangText]}>ಕನ್ನಡ (Kannada)</Text>
                            {language === 'kn' && <Ionicons name="checkmark" size={24} color={colors.primary} />}
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={[styles.langOption, language === 'bn' && styles.selectedLang]}
                            onPress={() => {
                                switchLanguage('bn');
                                setLangModalVisible(false);
                            }}
                        >
                            <Text style={[styles.langText, language === 'bn' && styles.selectedLangText]}>বাংলা (Bengali)</Text>
                            {language === 'bn' && <Ionicons name="checkmark" size={24} color={colors.primary} />}
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={styles.cancelBtn} 
                            onPress={() => setLangModalVisible(false)}
                        >
                            <Text style={styles.cancelText}>{t('cancel')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { padding: 24, paddingTop: 60, paddingBottom: 100, flexGrow: 1, backgroundColor: colors.background },
    header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30, alignItems: 'center' },
    headerLeft: { flexDirection: 'row', alignItems: 'center' },
    langBtn: { padding: 10, marginRight: 15, backgroundColor: colors.surfaceHighlight, borderRadius: 50 },
    greetingContainer: { justifyContent: 'center' },
    // Swapped greeting and name styles roughly, but tweaked for new layout
    name: { fontSize: 24, fontWeight: '900', color: colors.text},
    greeting: { fontSize: 14, color: colors.primary, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginTop: 4 },
    // role style removed/merged
    logoutBtn: { padding: 10, backgroundColor: colors.surfaceHighlight, borderRadius: 12 },
    statusCard: {
        backgroundColor: colors.surface,
        padding: 24,
        borderRadius: 24,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: colors.border,
        // Removed heavy shadow for cleaner dark look
    },
    cardTitle: { fontSize: 16, fontWeight: '600', marginBottom: 20, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1 },
    statusRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
    statusText: { fontSize: 24, fontWeight: 'bold', marginLeft: 16, color: colors.text },
    actionBtn: {
        backgroundColor: colors.primary,
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    btnText: { color: colors.textInverted, fontWeight: 'bold', fontSize: 16 },
    grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    gridItem: {
        backgroundColor: colors.surface,
        padding: 20,
        borderRadius: 24,
        width: '48%',
        aspectRatio: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
        borderWidth: 1,
        borderColor: colors.border,
    },
    gridValue: { fontSize: 32, fontWeight: '900', marginVertical: 8, color: colors.text },
    gridLabel: { color: colors.textSecondary, fontSize: 12, fontWeight: '600', textTransform: 'uppercase' },
    
    // Modal Styles
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
    modalContent: { width: '80%', backgroundColor: colors.surface, borderRadius: 20, padding: 20, elevation: 5 },
    modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: colors.text },
    langOption: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, borderRadius: 10, marginBottom: 10, borderWidth: 1, borderColor: colors.border },
    selectedLang: { backgroundColor: colors.surfaceHighlight, borderColor: colors.primary },
    langText: { fontSize: 16, color: colors.text },
    selectedLangText: { color: colors.primary, fontWeight: 'bold' },
    cancelBtn: { marginTop: 10, padding: 15, alignItems: 'center' },
    cancelText: { color: colors.danger, fontSize: 16, fontWeight: 'bold' }
});

export default WorkerDashboardScreen;
