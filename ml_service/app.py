import os
import io
import base64
import numpy as np
import tempfile
from flask import Flask, request, jsonify
from flask_cors import CORS
from deepface import DeepFace

# Suppress TF logs
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

app = Flask(__name__)
CORS(app)

def base64_to_tempfile(base64_string):
    if ',' in base64_string:
        base64_string = base64_string.split(',')[1]
    
    # Fix padding
    missing_padding = len(base64_string) % 4
    if missing_padding:
        base64_string += '=' * (4 - missing_padding)

    img_data = base64.b64decode(base64_string)
    
    # Create a temp file
    fd, path = tempfile.mkstemp(suffix='.jpg')
    with os.fdopen(fd, 'wb') as tmp:
        tmp.write(img_data)
    return path

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'model': 'Facenet'}), 200

@app.route('/register', methods=['POST'])
def register():
    temp_path = None
    try:
        data = request.json
        if not data or 'image' not in data:
            return jsonify({'status': 'error', 'message': 'No image provided'}), 400

        temp_path = base64_to_tempfile(data['image'])
        
        # Generate Embedding
        embedding_objs = DeepFace.represent(img_path=temp_path, model_name="Facenet", enforce_detection=False)
        embedding = embedding_objs[0]["embedding"]
        
        return jsonify({'status': 'success', 'embedding': embedding})
    
    except Exception as e:
        print(f"Error in register: {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500
    finally:
        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)

@app.route('/verify', methods=['POST'])
def verify():
    temp_path = None
    try:
        data = request.json
        if not data or 'image' not in data or 'embedding' not in data:
            return jsonify({'status': 'error', 'message': 'Image and embedding required'}), 400

        temp_path = base64_to_tempfile(data['image'])
        stored_embedding = data['embedding']

        # Generate Live Embedding
        live_objs = DeepFace.represent(img_path=temp_path, model_name="Facenet", enforce_detection=False)
        live_embedding = live_objs[0]["embedding"]
        
        # Calculate Cosine Similarity
        a = np.array(live_embedding)
        b = np.array(stored_embedding)
        
        cos_sim = np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))
        
        # Threshold for Facenet
        match = cos_sim > 0.40
        
        return jsonify({
            'status': 'success', 
            'match': bool(match), 
            'similarity': float(cos_sim)
        })

    except Exception as e:
        print(f"Error in verify: {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500
    finally:
        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    app.run(host='0.0.0.0', port=port)
