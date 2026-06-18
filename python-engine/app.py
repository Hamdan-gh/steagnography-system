from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
from werkzeug.utils import secure_filename
import traceback
import sys

from embed_audio import embed_audio_in_image
from extract_audio import extract_audio_from_image
from metrics import calculate_all_metrics
from image_processing import analyze_image_capacity

app = Flask(__name__)

# Configure CORS to allow Vercel frontend
CORS(app, resources={
    r"/api/*": {
        "origins": [
            "http://localhost:3000",
            "http://localhost:5173",
            "https://steagnography-system.vercel.app",
            "https://*.vercel.app"
        ],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "expose_headers": ["Content-Type"],
        "supports_credentials": True,
        "max_age": 3600
    }
})

# Force stdout to be unbuffered for real-time logging
sys.stdout.reconfigure(line_buffering=True)

# Configuration
UPLOAD_FOLDER = 'uploads'
OUTPUT_FOLDER = 'outputs'
ALLOWED_IMAGE_EXTENSIONS = {'png', 'jpg', 'jpeg'}
ALLOWED_AUDIO_EXTENSIONS = {'wav', 'mp3'}

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(OUTPUT_FOLDER, exist_ok=True)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['OUTPUT_FOLDER'] = OUTPUT_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 200 * 1024 * 1024  # 200MB (increased to handle large files)

def allowed_file(filename, allowed_extensions):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in allowed_extensions

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'version': '1.0.0',
        'service': 'StegaGen Processing Engine'
    }), 200

@app.route('/api/analyze', methods=['POST'])
def analyze_capacity():
    """Analyze cover image capacity"""
    try:
        if 'image' not in request.files:
            return jsonify({'error': 'No image file provided'}), 400

        image_file = request.files['image']
        
        if image_file.filename == '':
            return jsonify({'error': 'Empty filename'}), 400

        if not allowed_file(image_file.filename, ALLOWED_IMAGE_EXTENSIONS):
            return jsonify({'error': 'Invalid image format'}), 400

        # Save temporarily
        filename = secure_filename(image_file.filename)
        temp_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        image_file.save(temp_path)

        # Analyze capacity
        result = analyze_image_capacity(temp_path)
        
        # Cleanup
        os.remove(temp_path)

        return jsonify(result), 200

    except Exception as e:
        print(f"Error in analyze_capacity: {str(e)}")
        print(traceback.format_exc())
        return jsonify({'error': str(e)}), 500

@app.route('/api/embed', methods=['POST'])
def embed_audio():
    """Embed audio into cover image"""
    try:
        print("=" * 60)
        print("STARTING EMBED REQUEST")
        print("=" * 60)
        
        # Validate files
        if 'cover_image' not in request.files or 'audio_file' not in request.files:
            return jsonify({'error': 'Missing required files'}), 400

        cover_image = request.files['cover_image']
        audio_file = request.files['audio_file']
        encryption_key = request.form.get('encryption_key')

        if not encryption_key:
            return jsonify({'error': 'Encryption key required'}), 400

        # Fast LSB embedding — GA params kept for API compatibility
        ga_generations = int(request.form.get('ga_generations', 20))
        ga_population_size = int(request.form.get('ga_population_size', 15))
        
        print(f"Using fast LSB steganography (generations/population params ignored)")

        # Validate filenames
        if cover_image.filename == '' or audio_file.filename == '':
            return jsonify({'error': 'Empty filename'}), 400

        # Validate extensions
        if not allowed_file(cover_image.filename, ALLOWED_IMAGE_EXTENSIONS):
            return jsonify({'error': 'Invalid image format'}), 400

        if not allowed_file(audio_file.filename, ALLOWED_AUDIO_EXTENSIONS):
            return jsonify({'error': 'Invalid audio format'}), 400

        # Save files
        cover_filename = secure_filename(cover_image.filename)
        audio_filename = secure_filename(audio_file.filename)
        
        cover_path = os.path.join(app.config['UPLOAD_FOLDER'], cover_filename)
        audio_path = os.path.join(app.config['UPLOAD_FOLDER'], audio_filename)
        
        print(f"Saving files: {cover_filename}, {audio_filename}")
        cover_image.save(cover_path)
        audio_file.save(audio_path)
        
        # Check file sizes
        cover_size = os.path.getsize(cover_path) / (1024 * 1024)  # MB
        audio_size = os.path.getsize(audio_path) / (1024 * 1024)  # MB
        print(f"File sizes: Image={cover_size:.2f}MB, Audio={audio_size:.2f}MB")
        
        print("Files saved successfully, starting embedding process...")

        # Process embedding with timeout handling
        import sys
        sys.stdout.flush()  # Ensure all print statements are flushed
        
        result = embed_audio_in_image(
            cover_path,
            audio_path,
            encryption_key,
            ga_generations=ga_generations,
            ga_population_size=ga_population_size
        )
        
        print("Embedding completed successfully!")

        # Cleanup input files
        try:
            os.remove(cover_path)
            os.remove(audio_path)
            print("Cleaned up input files")
        except Exception as cleanup_error:
            print(f"Warning: Could not cleanup files: {cleanup_error}")

        print("=" * 60)
        print("EMBED REQUEST COMPLETED")
        print("=" * 60)
        
        return jsonify(result), 200

    except Exception as e:
        print(f"ERROR in embed_audio: {str(e)}")
        print(traceback.format_exc())
        return jsonify({'error': str(e)}), 500

@app.route('/api/extract', methods=['POST'])
def extract_audio():
    """Extract audio from stego image"""
    stego_path = None
    try:
        print("=" * 60)
        print("STARTING EXTRACTION REQUEST")
        print("=" * 60)
        
        if 'stego_image' not in request.files:
            return jsonify({'error': 'No stego image provided'}), 400

        stego_image = request.files['stego_image']
        encryption_key = request.form.get('encryption_key')

        if not encryption_key:
            return jsonify({'error': 'Encryption key required'}), 400

        if stego_image.filename == '':
            return jsonify({'error': 'Empty filename'}), 400

        if not allowed_file(stego_image.filename, ALLOWED_IMAGE_EXTENSIONS):
            return jsonify({'error': 'Invalid image format. Please use PNG, JPG, or JPEG.'}), 400

        # Save stego image
        stego_filename = secure_filename(stego_image.filename)
        stego_path = os.path.join(app.config['UPLOAD_FOLDER'], stego_filename)
        
        print(f"Saving uploaded image: {stego_filename}")
        stego_image.save(stego_path)
        
        file_size = os.path.getsize(stego_path) / (1024 * 1024)  # MB
        print(f"File size: {file_size:.2f}MB")
        print(f"Encryption key length: {len(encryption_key)} characters")

        # Extract audio
        print("Starting extraction process...")
        result = extract_audio_from_image(stego_path, encryption_key)
        print("Extraction completed successfully!")

        # Cleanup
        if stego_path and os.path.exists(stego_path):
            os.remove(stego_path)
            print("Cleaned up uploaded file")

        print("=" * 60)
        print("EXTRACTION REQUEST COMPLETED")
        print("=" * 60)
        
        return jsonify(result), 200

    except ValueError as ve:
        # Handle specific validation/decryption errors
        error_msg = str(ve)
        print(f"Validation Error: {error_msg}")
        
        if "Invalid stego image" in error_msg or "No embedded audio found" in error_msg:
            return jsonify({'error': 'This image does not contain hidden audio or was not created by this tool.'}), 400
        elif "Invalid encryption key" in error_msg or "Decryption failed" in error_msg:
            return jsonify({'error': 'Incorrect encryption key. Please use the same key used during embedding.'}), 400
        elif "Corrupted" in error_msg:
            return jsonify({'error': 'The stego image appears to be corrupted or modified.'}), 400
        else:
            return jsonify({'error': error_msg}), 400
            
    except Exception as e:
        print(f"Error in extract_audio: {str(e)}")
        print(traceback.format_exc())
        
        # Cleanup on error
        if stego_path and os.path.exists(stego_path):
            try:
                os.remove(stego_path)
            except:
                pass
                
        return jsonify({'error': f'Extraction failed: {str(e)}'}), 500

@app.route('/api/download/<filename>', methods=['GET'])
def download_file(filename):
    """Download generated files"""
    try:
        file_path = os.path.join(app.config['OUTPUT_FOLDER'], filename)
        if os.path.exists(file_path):
            return send_file(file_path, as_attachment=True)
        return jsonify({'error': 'File not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("=" * 60)
    print("Starting StegaGen Processing Engine")
    print("Server: http://localhost:5000")
    print("=" * 60)
    app.run(host='0.0.0.0', port=5000, debug=True, threaded=True)
