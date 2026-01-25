import axios from 'axios';

// URL of the Python Microservice
// In production (Render), this will be the URL of your deployed Python app.
// Locally, it's localhost:5001
let ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://127.0.0.1:5001';

// Remove trailing slash if present
if (ML_SERVICE_URL.endsWith('/')) {
    ML_SERVICE_URL = ML_SERVICE_URL.slice(0, -1);
}

class FaceService {
    constructor() {
        this.ready = false;
        // Check health on start
        this.checkHealth();
    }

    async checkHealth() {
        try {
            await axios.get(`${ML_SERVICE_URL}/health`);
            console.log(`Connected to AI Service at ${ML_SERVICE_URL}`);
            this.ready = true;
        } catch (error) {
            console.warn(`Warning: AI Service not reachable at ${ML_SERVICE_URL}. Make sure to run 'python ml_service/app.py'`);
        }
    }

    start() {
        // No-op now, but keeping method for compatibility
        this.checkHealth();
    }

    async register(imageBase64) {
        try {
            const response = await axios.post(`${ML_SERVICE_URL}/register`, {
                image: imageBase64
            });
            return response.data;
        } catch (error) {
            console.error('FaceService Register Error:', {
                message: error.message,
                status: error.response?.status,
                data: error.response?.data
            });
            throw new Error(error.response?.data?.message || `Failed to register face via AI Service (${error.message})`);
        }
    }

    async verify(imageBase64, storedEmbedding) {
        try {
            const response = await axios.post(`${ML_SERVICE_URL}/verify`, {
                image: imageBase64,
                embedding: storedEmbedding
            });
            return response.data;
        } catch (error) {
            console.error('FaceService Verify Error:', error.response?.data || error.message);
            throw new Error(error.response?.data?.message || 'Failed to verify face via AI Service');
        }
    }
}

export default new FaceService();
