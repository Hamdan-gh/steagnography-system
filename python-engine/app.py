from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
import re
from werkzeug.utils import secure_filename
import traceback
import sys

from embed_audio import embed_audio_in_image
from extract_audio import extract_audio_from_image
from image_processing import analyze_image_capacity

app = Flask(__name__)

# ---------------------------------------------------------------------------
# CORS — allow Vercel frontend + local dev
# Flask-CORS does NOT support wildcard strings like "https://*.vercel.app"
# ---------------------------------------------------------------------------
DEFAULT_ORIGINS = [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://steagnography-system.vercel.app',
]

VERCEL_ORIGIN_RE = re.compile(r'^https://[\w-]+\.vercel\.app$')


def _build_allowed_origins():
    origins = list(DEFAULT_ORIGINS)
    extra = os.environ.get('ALLOWED_ORIGINS', '')
    for origin in extra.split(','):
        origin = origin.strip()
        if origin and origin not in origins:
            origins.append(origin)
    return origins


def is_origin_allowed(origin: str | None) -> bool:
    if not origin:
        return True
    if origin in _build_allowed_origins():
        return True
    if VERCEL_ORIGIN_RE.match(origin):
        return True
    return False


CORS(
    app,
    resources={r'/*': {'origins': is_origin_allowed}},
    methods=['GET', 'POST', 'OPTIONS'],
    allow_headers=['Content-Type', 'Authorization'],
    expose_headers=['Content-Type'],
    supports_credentials=True,
    max_age=3600,
)


@app.after_request
def apply_cors_headers(response):
    """Fallback CORS headers when upstream proxy strips them."""
    origin = request.headers.get('Origin')
    if origin and is_origin_allowed(origin):
        response.headers['Access-Control-Allow-Origin'] = origin
        response.headers['Access-Control-Allow-Credentials'] = 'true'
        response.headers['Vary'] = 'Origin'
    return response


try:
    sys.stdout.reconfigure(line_buffering=True)
except Exception:
    pass

UPLOAD_FOLDER = 'uploads'
OUTPUT_FOLDER = 'outputs'
ALLOWED_IMAGE_EXTENSIONS = {'png', 'jpg', 'jpeg'}
ALLOWED_AUDIO_EXTENSIONS = {'wav', 'mp3'}

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(OUTPUT_FOLDER, exist_ok=True)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['OUTPUT_FOLDER'] = OUTPUT_FOLDER
app.config['MAX_CONTENT_LENGTH'] = int(os.environ.get('MAX_CONTENT_LENGTH', 200 * 1024 * 1024))


def allowed_file(filename, allowed_extensions):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in allowed_extensions


@app.route('/', methods=['GET'])
def root():
    return jsonify({
        'service': 'StegaGen Processing Engine',
        'status': 'running',
        'health': '/api/health',
    }), 200


@app.route('/api/health', methods=['GET', 'OPTIONS'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'version': '1.0.0',
        'service': 'StegaGen Processing Engine',
    }), 200


@app.route('/api/analyze', methods=['POST', 'OPTIONS'])
def analyze_capacity():
    try:
        if 'image' not in request.files:
            return jsonify({'error': 'No image file provided'}), 400

        image_file = request.files['image']

        if image_file.filename == '':
            return jsonify({'error': 'Empty filename'}), 400

        if not allowed_file(image_file.filename, ALLOWED_IMAGE_EXTENSIONS):
            return jsonify({'error': 'Invalid image format'}), 400

        filename = secure_filename(image_file.filename)
        temp_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        image_file.save(temp_path)

        result = analyze_image_capacity(temp_path)
        os.remove(temp_path)

        return jsonify(result), 200

    except Exception as e:
        print(f'Error in analyze_capacity: {str(e)}')
        print(traceback.format_exc())
        return jsonify({'error': str(e)}), 500


@app.route('/api/embed', methods=['POST', 'OPTIONS'])
def embed_audio():
    try:
        print('=' * 60)
        print('STARTING EMBED REQUEST')
        print('=' * 60)

        if 'cover_image' not in request.files or 'audio_file' not in request.files:
            return jsonify({'error': 'Missing required files'}), 400

        cover_image = request.files['cover_image']
        audio_file = request.files['audio_file']
        encryption_key = request.form.get('encryption_key')

        if not encryption_key:
            return jsonify({'error': 'Encryption key required'}), 400

        ga_generations = int(request.form.get('ga_generations', 20))
        ga_population_size = int(request.form.get('ga_population_size', 15))

        print('Using fast LSB steganography')

        if cover_image.filename == '' or audio_file.filename == '':
            return jsonify({'error': 'Empty filename'}), 400

        if not allowed_file(cover_image.filename, ALLOWED_IMAGE_EXTENSIONS):
            return jsonify({'error': 'Invalid image format'}), 400

        if not allowed_file(audio_file.filename, ALLOWED_AUDIO_EXTENSIONS):
            return jsonify({'error': 'Invalid audio format'}), 400

        cover_filename = secure_filename(cover_image.filename)
        audio_filename = secure_filename(audio_file.filename)

        cover_path = os.path.join(app.config['UPLOAD_FOLDER'], cover_filename)
        audio_path = os.path.join(app.config['UPLOAD_FOLDER'], audio_filename)

        print(f'Saving files: {cover_filename}, {audio_filename}')
        cover_image.save(cover_path)
        audio_file.save(audio_path)

        cover_size = os.path.getsize(cover_path) / (1024 * 1024)
        audio_size = os.path.getsize(audio_path) / (1024 * 1024)
        print(f'File sizes: Image={cover_size:.2f}MB, Audio={audio_size:.2f}MB')

        result = embed_audio_in_image(
            cover_path,
            audio_path,
            encryption_key,
            ga_generations=ga_generations,
            ga_population_size=ga_population_size,
        )

        try:
            os.remove(cover_path)
            os.remove(audio_path)
        except Exception as cleanup_error:
            print(f'Warning: Could not cleanup files: {cleanup_error}')

        print('EMBED REQUEST COMPLETED')
        return jsonify(result), 200

    except Exception as e:
        print(f'ERROR in embed_audio: {str(e)}')
        print(traceback.format_exc())
        return jsonify({'error': str(e)}), 500


@app.route('/api/extract', methods=['POST', 'OPTIONS'])
def extract_audio():
    stego_path = None
    try:
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

        stego_filename = secure_filename(stego_image.filename)
        stego_path = os.path.join(app.config['UPLOAD_FOLDER'], stego_filename)
        stego_image.save(stego_path)

        result = extract_audio_from_image(stego_path, encryption_key)

        if stego_path and os.path.exists(stego_path):
            os.remove(stego_path)

        return jsonify(result), 200

    except ValueError as ve:
        error_msg = str(ve)
        if 'Invalid stego image' in error_msg or 'No embedded audio found' in error_msg:
            return jsonify({'error': 'This image does not contain hidden audio or was not created by this tool.'}), 400
        if 'Invalid encryption key' in error_msg or 'Decryption failed' in error_msg:
            return jsonify({'error': 'Incorrect encryption key. Please use the same key used during embedding.'}), 400
        if 'Corrupted' in error_msg:
            return jsonify({'error': 'The stego image appears to be corrupted or modified.'}), 400
        return jsonify({'error': error_msg}), 400

    except Exception as e:
        print(f'Error in extract_audio: {str(e)}')
        print(traceback.format_exc())
        if stego_path and os.path.exists(stego_path):
            try:
                os.remove(stego_path)
            except Exception:
                pass
        return jsonify({'error': f'Extraction failed: {str(e)}'}), 500


@app.route('/api/download/<filename>', methods=['GET', 'OPTIONS'])
def download_file(filename):
    try:
        file_path = os.path.join(app.config['OUTPUT_FOLDER'], filename)
        if os.path.exists(file_path):
            return send_file(file_path, as_attachment=True)
        return jsonify({'error': 'File not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print('=' * 60)
    print('Starting StegaGen Processing Engine')
    print(f'Server: http://0.0.0.0:{port}')
    print('=' * 60)
    app.run(host='0.0.0.0', port=port, debug=False, threaded=True)
