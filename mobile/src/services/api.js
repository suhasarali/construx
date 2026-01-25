import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// CHANGE THIS TO YOUR LOCAL IP IF TESTING ON PHYSICAL DEVICE
// For Android Emulator, use 10.0.2.2 or 10.0.3.2
// For Genymotion is 10.0.3.2, AVD is 10.0.2.2
// For iOS Simulator, localhost is fine
const BASE_URL = 'https://fb-quasar.vercel.app';

const api = axios.create({
    baseURL: `${BASE_URL}/api`,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    async (config) => {
        const token = await SecureStore.getItemAsync('userToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
