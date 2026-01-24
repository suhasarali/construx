import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../context/LanguageContext';
import { colors } from '../constants/colors';

const LanguageSelector = ({ visible, onClose }) => {
    const { t, switchLanguage, language } = useLanguage();

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>{t('selectLanguage')}</Text>
                    
                    <TouchableOpacity 
                        style={[styles.langOption, language === 'en' && styles.selectedLang]}
                        onPress={() => {
                            switchLanguage('en');
                            onClose();
                        }}
                    >
                        <Text style={[styles.langText, language === 'en' && styles.selectedLangText]}>English</Text>
                        {language === 'en' && <Ionicons name="checkmark" size={24} color={colors.primary} />}
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={[styles.langOption, language === 'hi' && styles.selectedLang]}
                        onPress={() => {
                            switchLanguage('hi');
                            onClose();
                        }}
                    >
                        <Text style={[styles.langText, language === 'hi' && styles.selectedLangText]}>हिंदी (Hindi)</Text>
                        {language === 'hi' && <Ionicons name="checkmark" size={24} color={colors.primary} />}
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={styles.cancelBtn} 
                        onPress={onClose}
                    >
                        <Text style={styles.cancelText}>{t('cancel')}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
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

export default LanguageSelector;
