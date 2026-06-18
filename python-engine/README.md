# StegaGen Processing Engine

Python Flask backend for audio steganography with genetic algorithm optimization.

## Features

- LSB-based audio-in-image steganography
- Genetic Algorithm optimization for pixel position selection
- AES-256 encryption
- Quality metrics calculation (PSNR, MSE, SSIM)
- RESTful API

## Installation

1. Create virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Run the server:
```bash
python app.py
```

Server runs on `http://localhost:5000`

## API Endpoints

### Health Check
```
GET /api/health
```

### Analyze Image Capacity
```
POST /api/analyze
Body: FormData with 'image' file
```

### Embed Audio
```
POST /api/embed
Body: FormData
- cover_image: Image file
- audio_file: Audio file
- encryption_key: String
- ga_generations: Integer (optional, default 100)
- ga_population_size: Integer (optional, default 50)
```

### Extract Audio
```
POST /api/extract
Body: FormData
- stego_image: Stego image file
- encryption_key: String
```

### Download File
```
GET /api/download/<filename>
```

## Genetic Algorithm

The GA optimizes pixel positions for embedding to maximize:
- PSNR (Peak Signal-to-Noise Ratio)
- SSIM (Structural Similarity Index)

While minimizing:
- MSE (Mean Squared Error)

## Architecture

```
audio_processing.py    - Audio file handling
image_processing.py    - Image file handling
aes_encryption.py      - AES-256 encryption
genetic_algorithm.py   - GA optimization
metrics.py            - Quality metrics
embed_audio.py        - Embedding logic
extract_audio.py      - Extraction logic
app.py               - Flask API server
```
