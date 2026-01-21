import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

// We use SecureStore for Tokens (small sensitive data)
// We use AsyncStorage for larger non-sensitive data (logs, content)

const OfflineStorage = {
    saveLog: async (log) => {
        try {
            const existingLogs = await AsyncStorage.getItem('offline_logs');
            const logs = existingLogs ? JSON.parse(existingLogs) : [];
            logs.push(log);
            await AsyncStorage.setItem('offline_logs', JSON.stringify(logs));
        } catch (e) {
            console.error('Failed to save log offline', e);
        }
    },

    getLogs: async () => {
        try {
            const logs = await AsyncStorage.getItem('offline_logs');
            return logs ? JSON.parse(logs) : [];
        } catch (e) {
            return [];
        }
    },

    clearLogs: async () => {
        await AsyncStorage.removeItem('offline_logs');
    }
};

export default OfflineStorage;
