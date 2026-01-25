import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Ionicons } from '@expo/vector-icons';

import { colors } from '../constants/colors';

const EngineerDashboardScreen = () => {
    const { logout, userInfo } = useContext(AuthContext);
    const { t, switchLanguage, language } = useLanguage();
    const navigation = useNavigation();
    const [langModalVisible, setLangModalVisible] = useState(false);

    const menuItems = [
        { title: t('attendanceManagement'), icon: 'people', screen: 'AttendanceManagement' },
        { title: t('taskManagement'), icon: 'clipboard', screen: 'TaskManagement' },
        { title: t('materialRequests'), icon: 'cube', screen: 'Requests' },
        { title: 'Inventory', icon: 'list', screen: 'Inventory' },
        { title: t('dailyProgressReport'), icon: 'stats-chart', screen: 'DPR' },
        { title: t('teamCommunication'), icon: 'chatbubbles', screen: 'Communication' },
    ];

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                   <TouchableOpacity onPress={() => setLangModalVisible(true)} style={styles.langBtn}>
                        <Ionicons name="globe-outline" size={24} color={colors.primary} />
                   </TouchableOpacity>
                   <View style={styles.greetingContainer}>
                        <Text style={styles.name}>{userInfo?.name}</Text>
                         <Text style={styles.greeting}>{t('welcome')} {t('siteEngineer')}</Text>
                   </View>
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
    container: { padding: 24, paddingTop: 60, flex: 1, backgroundColor: colors.background },
    header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30, alignItems: 'center' },
    headerLeft: { flexDirection: 'row', alignItems: 'center' },
    langBtn: { padding: 10, marginRight: 15, backgroundColor: colors.surfaceHighlight, borderRadius: 50 },
    greetingContainer: { justifyContent: 'center' },
    name: { fontSize: 24, fontWeight: '900', color: colors.text},
    greeting: { fontSize: 14, color: colors.primary, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginTop: 4 },
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
    },

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

export default EngineerDashboardScreen;
