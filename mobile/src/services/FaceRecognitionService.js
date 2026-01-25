import { loadTensorflowModel } from 'react-native-fast-tflite';
import * as FileSystem from 'expo-file-system';

class FaceRecognitionService {
    constructor() {
        this.model = null;
        this.isModelLoaded = false;
    }

    async loadModel() {
        try {
            // Load the FaceNet model from assets or remote URL
            // For this implementation, we assume the model file 'facenet.tflite' is in the assets folder
            // In a real app, you might download this from the server on first launch
            const modelUri = 'https://github.com/shubham0204/FaceRecognition_With_FaceNet_Android/raw/master/app/src/main/assets/facenet.tflite';
            const localPath = `${FileSystem.documentDirectory}facenet.tflite`;

            const fileInfo = await FileSystem.getInfoAsync(localPath);
            if (!fileInfo.exists) {
                await FileSystem.downloadAsync(modelUri, localPath);
            }

            this.model = await loadTensorflowModel(localPath);
            this.isModelLoaded = true;
            console.log('FaceNet model loaded successfully');
        } catch (error) {
            console.error('Error loading FaceNet model:', error);
            throw error;
        }
    }

    async generateEmbedding(imageTensor) {
        if (!this.isModelLoaded) {
            await this.loadModel();
        }

        try {
            // Run inference
            // Note: react-native-fast-tflite expects specific input format
            // This is a simplified representation. In production, you'd use a frame processor
            // from react-native-vision-camera to convert the frame to a tensor.

            const output = await this.model.run(imageTensor);
            return output; // Returns the 128-d embedding
        } catch (error) {
            console.error('Error generating embedding:', error);
            throw error;
        }
    }

    calculateEuclideanDistance(embedding1, embedding2) {
        if (embedding1.length !== embedding2.length) {
            throw new Error('Embeddings must have the same length');
        }

        let sum = 0;
        for (let i = 0; i < embedding1.length; i++) {
            const diff = embedding1[i] - embedding2[i];
            sum += diff * diff;
        }
        return Math.sqrt(sum);
    }

    calculateCosineSimilarity(embedding1, embedding2) {
        let dotProduct = 0;
        let normA = 0;
        let normB = 0;

        for (let i = 0; i < embedding1.length; i++) {
            dotProduct += embedding1[i] * embedding2[i];
            normA += embedding1[i] * embedding1[i];
            normB += embedding2[i] * embedding2[i];
        }

        if (normA === 0 || normB === 0) return 0;
        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }

    isMatch(embedding1, embedding2, threshold = 0.8) {
        // Using Cosine Similarity (1.0 is identical, -1.0 is opposite)
        // Threshold of 0.8 is generally good for FaceNet
        const similarity = this.calculateCosineSimilarity(embedding1, embedding2);
        return similarity > threshold;
    }
}

export default new FaceRecognitionService();
