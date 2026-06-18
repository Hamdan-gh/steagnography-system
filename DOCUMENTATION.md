# StegaGen Secure - Complete Documentation

## Table of Contents
1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [Technology Stack](#technology-stack)
4. [Core Modules](#core-modules)
5. [API Reference](#api-reference)
6. [Database Schema](#database-schema)
7. [Security](#security)
8. [Algorithms](#algorithms)

## System Overview

**StegaGen Secure** is an enterprise-grade audio steganography system that uses Least Significant Bit (LSB) embedding optimized by Genetic Algorithms to hide audio files within cover images.

### Key Features

- **LSB Steganography**: Hide audio in image pixels
- **AES-256 Encryption**: Secure audio data before embedding
- **Genetic Algorithm**: Optimize embedding positions for maximum quality
- **Quality Metrics**: PSNR, MSE, SSIM evaluation
- **User Management**: Role-based access control
- **Operation History**: Track all embedding/extraction operations
- **Real-time Analytics**: Dashboard with charts and statistics

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────┐
│           Frontend (React + TS)             │
│  - User Interface                           │
│  - State Management                         │
│  - API Communication                        │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│         Supabase Backend                    │
│  - PostgreSQL Database                      │
│  - Authentication (JWT)                     │
│  - Storage (Images, Audio, Stego)          │
│  - Row Level Security                       │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│    Python Processing Engine (Flask)         │
│  - Audio Processing                         │
│  - Image Processing                         │
│  - AES Encryption/Decryption               │
│  - Genetic Algorithm                        │
│  - LSB Embedding/Extraction                │
│  - Quality Metrics Calculation             │
└─────────────────────────────────────────────┘
```

## Technology Stack

### Frontend
- **React 18**: UI library
- **TypeScript**: Type safety
- **Vite**: Build tool
- **Tailwind CSS**: Styling
- **Shadcn UI**: Component library
- **Framer Motion**: Animations
- **Recharts**: Data visualization
- **Zustand**: State management
- **React Router**: Navigation
- **Axios**: HTTP client

### Backend
- **Supabase**: Backend-as-a-Service
  - PostgreSQL database
  - Authentication
  - Storage
  - Real-time subscriptions
- **Python Flask**: API server
- **NumPy**: Numerical computing
- **SciPy**: Scientific algorithms
- **Pillow**: Image processing
- **librosa**: Audio processing
- **PyCrypto**: Encryption
- **DEAP**: Genetic algorithms
- **scikit-image**: Image metrics

## Core Modules

### 1. Authentication Module

**Location**: `src/lib/supabase.ts`

**Features**:
- Email/Password authentication
- JWT token management
- Session persistence
- Auto token refresh

**Usage**:
```typescript
import { supabase } from '@/lib/supabase';

// Sign up
await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123',
});

// Sign in
await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123',
});

// Sign out
await supabase.auth.signOut();
```

### 2. Audio Embedding Module

**Location**: `python-engine/embed_audio.py`

**Process**:
1. Load cover image
2. Load audio file
3. Encrypt audio with AES-256
4. Convert encrypted data to bits
5. Run Genetic Algorithm to find optimal positions
6. Embed bits at optimized positions using LSB
7. Calculate quality metrics
8. Save stego image

**API Endpoint**: `POST /api/embed`

**Request**:
```javascript
const formData = new FormData();
formData.append('cover_image', imageFile);
formData.append('audio_file', audioFile);
formData.append('encryption_key', 'mySecretKey123456');
formData.append('ga_generations', '100');
formData.append('ga_population_size', '50');
```

**Response**:
```json
{
  "stego_image_url": "/api/download/stego_1234567890.png",
  "stego_image_base64": "base64_encoded_image",
  "metrics": {
    "psnr": 42.5,
    "mse": 0.023,
    "ssim": 0.982,
    "capacity_used": 125000,
    "capacity_total": 1500000
  },
  "ga_results": {
    "best_fitness": 45.2,
    "generations": 100,
    "population_size": 50,
    "convergence_data": [...]
  },
  "execution_time": 15.3
}
```

### 3. Audio Extraction Module

**Location**: `python-engine/extract_audio.py`

**Process**:
1. Load stego image
2. Load metadata (pixel positions)
3. Extract bits from LSB at stored positions
4. Convert bits to bytes
5. Parse metadata (size, nonce, tag)
6. Decrypt with AES-256
7. Reconstruct audio file

**API Endpoint**: `POST /api/extract`

**Request**:
```javascript
const formData = new FormData();
formData.append('stego_image', stegoImageFile);
formData.append('encryption_key', 'mySecretKey123456');
```

**Response**:
```json
{
  "audio_url": "/api/download/extracted_1234567890.wav",
  "audio_base64": "base64_encoded_audio",
  "audio_name": "extracted_audio.wav",
  "audio_size": 125000,
  "execution_time": 5.2,
  "success": true
}
```

### 4. Genetic Algorithm Module

**Location**: `python-engine/genetic_algorithm.py`

**Components**:

**Chromosome**: Array of pixel positions
```python
[101, 400, 752, 1120, 2400, ...]  # Pixel indices
```

**Fitness Function**:
```python
fitness = 0.6 * PSNR + 0.4 * (SSIM * 100)
```

**Operators**:
- **Selection**: Tournament selection (size=3)
- **Crossover**: Two-point crossover (rate=0.8)
- **Mutation**: Random position mutation (rate=0.1)

**Parameters**:
- Population size: 50-100
- Generations: 100-200
- Convergence criterion: Fitness improvement < 0.1%

## API Reference

### Health Check
```
GET /api/health
Response: { "status": "healthy", "version": "1.0.0" }
```

### Analyze Image Capacity
```
POST /api/analyze
Body: FormData { image: File }
Response: { 
  "max_capacity": 1500000, 
  "dimensions": { "width": 1920, "height": 1080 } 
}
```

### Embed Audio
```
POST /api/embed
Body: FormData {
  cover_image: File,
  audio_file: File,
  encryption_key: string,
  ga_generations?: number,
  ga_population_size?: number
}
Response: EmbeddingResponse (see above)
```

### Extract Audio
```
POST /api/extract
Body: FormData {
  stego_image: File,
  encryption_key: string
}
Response: ExtractionResponse (see above)
```

### Download File
```
GET /api/download/:filename
Response: File (image or audio)
```

## Database Schema

### Users
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Stego Images
```sql
CREATE TABLE stego_images (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  stego_url TEXT NOT NULL,
  psnr FLOAT NOT NULL,
  mse FLOAT NOT NULL,
  ssim FLOAT NOT NULL,
  capacity_used INTEGER,
  encryption_key_hash TEXT,
  ga_generations INTEGER,
  ga_population_size INTEGER,
  status TEXT DEFAULT 'completed',
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Extraction Logs
```sql
CREATE TABLE extraction_logs (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  stego_id UUID REFERENCES stego_images(id),
  status TEXT NOT NULL,
  execution_time FLOAT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Security

### Encryption
- **Algorithm**: AES-256-EAX
- **Key Derivation**: PBKDF2 with 100,000 iterations
- **Salt**: 'StegaGenSecure' (constant)
- **Output**: ciphertext + nonce + authentication tag

### Authentication
- **Method**: JWT (JSON Web Tokens)
- **Provider**: Supabase Auth
- **Session Duration**: 7 days (configurable)
- **Refresh**: Automatic token refresh

### Row Level Security (RLS)
- Users can only access their own data
- Admins have elevated privileges for audit logs
- All database operations are filtered by user_id

### Input Validation
- File type validation
- File size limits
- Encryption key strength requirements
- SQL injection prevention (parameterized queries)
- XSS prevention (sanitized outputs)

## Algorithms

### LSB Steganography

**Embedding**:
```python
pixel_value = image[row, col, channel]
new_value = (pixel_value & 0xFE) | data_bit
image[row, col, channel] = new_value
```

**Extraction**:
```python
pixel_value = image[row, col, channel]
data_bit = pixel_value & 1
```

### Quality Metrics

**PSNR (Peak Signal-to-Noise Ratio)**:
```python
MSE = mean((original - stego)^2)
PSNR = 20 * log10(255 / sqrt(MSE))
```
- Higher is better
- Excellent: >40 dB
- Good: 35-40 dB
- Acceptable: 30-35 dB

**MSE (Mean Squared Error)**:
```python
MSE = mean((original - stego)^2)
```
- Lower is better
- Close to 0 indicates minimal distortion

**SSIM (Structural Similarity Index)**:
```python
SSIM = (2*μx*μy + C1)(2*σxy + C2) / 
       ((μx^2 + μy^2 + C1)(σx^2 + σy^2 + C2))
```
- Range: 0 to 1
- 1 = identical images
- Excellent: >0.95

### Genetic Algorithm Pseudocode

```
Initialize population of random pixel positions
For each generation:
  1. Evaluate fitness for each individual
  2. Select parents using tournament selection
  3. Create offspring through crossover
  4. Apply mutation to offspring
  5. Replace population with offspring
  6. Track best fitness
Return best individual (optimal positions)
```

## Performance

### Typical Processing Times

| Operation | Small (512x512, 1MB audio) | Large (1920x1080, 5MB audio) |
|-----------|----------------------------|------------------------------|
| Embedding | 10-15 seconds | 30-45 seconds |
| Extraction | 3-5 seconds | 10-15 seconds |
| GA Optimization | 8-12 seconds | 20-30 seconds |

### Capacity

| Image Size | Max Audio Size |
|------------|----------------|
| 512x512 | ~0.8 MB |
| 1024x1024 | ~3.1 MB |
| 1920x1080 | ~6.2 MB |
| 4096x4096 | ~50 MB |

---

For more information, see the README.md and SETUP.md files.
