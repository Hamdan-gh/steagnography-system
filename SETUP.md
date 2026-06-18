# StegaGen Secure - Setup Guide

Complete setup guide for the Audio Steganography System with Genetic Algorithm Optimization.

## Prerequisites

- Node.js 18+ and npm
- Python 3.9+
- Supabase account
- Git

## Part 1: Frontend Setup

### 1. Clone and Install Dependencies

```bash
# Navigate to project directory
cd NAPARI

# Install Node.js dependencies
npm install

# Install additional required packages
npm install tailwindcss-animate
```

### 2. Environment Configuration

```bash
# Copy environment template
cp .env.example .env
```

Edit `.env` with your configuration:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_PROCESSING_ENGINE_URL=http://localhost:5000
VITE_APP_NAME=StegaGen Secure
VITE_APP_VERSION=1.0.0
```

### 3. Get Supabase Credentials

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Settings → API
4. Copy:
   - Project URL → `VITE_SUPABASE_URL`
   - Anon/Public Key → `VITE_SUPABASE_ANON_KEY`

## Part 2: Database Setup

### 1. Create Database Schema

1. Open your Supabase project
2. Go to SQL Editor
3. Copy contents from `supabase-schema.sql`
4. Execute the SQL

### 2. Create Storage Buckets

Go to Storage in Supabase Dashboard and create three buckets:

1. **images** (Public bucket)
   - Click "New Bucket"
   - Name: `images`
   - Public: Yes

2. **audio** (Private bucket)
   - Name: `audio`
   - Public: No

3. **stego-images** (Private bucket)
   - Name: `stego-images`
   - Public: No

### 3. Configure Storage Policies

For each bucket, add these policies in the Storage Policies section:

**images bucket:**
```sql
-- Upload policy
CREATE POLICY "Users can upload own images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'images' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- View policy
CREATE POLICY "Public access to images" ON storage.objects
FOR SELECT USING (bucket_id = 'images');
```

**audio bucket:**
```sql
-- Upload and view policies (replace 'images' with 'audio')
-- Same structure as above
```

**stego-images bucket:**
```sql
-- Upload and view policies (replace 'images' with 'stego-images')
-- Same structure as above
```

## Part 3: Python Processing Engine Setup

### 1. Navigate to Python Engine

```bash
cd python-engine
```

### 2. Create Virtual Environment

**Windows:**
```bash
python -m venv venv
venv\Scripts\activate
```

**macOS/Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

### 3. Install Python Dependencies

```bash
pip install -r requirements.txt
```

If you encounter any errors, install packages individually:
```bash
pip install Flask Flask-CORS numpy scipy Pillow librosa soundfile pycryptodome deap scikit-image python-dotenv werkzeug
```

### 4. Create Required Directories

```bash
mkdir uploads
mkdir outputs
```

### 5. Environment Configuration

```bash
cp .env.example .env
```

Edit Python `.env`:
```env
FLASK_ENV=development
FLASK_DEBUG=True
SECRET_KEY=your_secret_key_here
MAX_CONTENT_LENGTH=52428800
UPLOAD_FOLDER=uploads
OUTPUT_FOLDER=outputs
```

## Part 4: Running the Application

### Terminal 1: Start Python Processing Engine

```bash
cd python-engine
venv\Scripts\activate  # Windows
# source venv/bin/activate  # macOS/Linux
python app.py
```

You should see:
```
 * Running on http://0.0.0.0:5000
```

### Terminal 2: Start React Frontend

```bash
# From project root
npm run dev
```

You should see:
```
  VITE ready in X ms

  ➜  Local:   http://localhost:3000/
```

### 3. Open Browser

Navigate to: `http://localhost:3000`

## Part 5: Testing the System

### 1. Create Test Account

1. Click "Sign Up"
2. Enter your details
3. Check email for verification (if required)
4. Login

### 2. Test Audio Embedding

1. Go to "Embed Audio" page
2. Upload a cover image (PNG/JPEG, >512x512px)
3. Upload an audio file (WAV/MP3, <5MB)
4. Enter encryption key (16-32 characters)
5. Adjust GA parameters if needed
6. Click "Start Embedding"
7. Wait for processing
8. Download stego image

### 3. Test Audio Extraction

1. Go to "Extract Audio" page
2. Upload the stego image
3. Enter the SAME encryption key
4. Click "Extract Audio"
5. Download extracted audio
6. Verify it matches original

## Part 6: Troubleshooting

### Python Engine Issues

**Port 5000 already in use:**
```bash
# Change port in app.py
app.run(host='0.0.0.0', port=5001, debug=True)

# Update .env in frontend
VITE_PROCESSING_ENGINE_URL=http://localhost:5001
```

**Module not found errors:**
```bash
pip install --upgrade pip
pip install -r requirements.txt --force-reinstall
```

### Frontend Issues

**Supabase connection errors:**
- Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Check if database schema is properly created
- Verify RLS policies are enabled

**CORS errors:**
- Ensure Flask-CORS is installed
- Check Python engine is running
- Verify `VITE_PROCESSING_ENGINE_URL` is correct

### Database Issues

**RLS policies blocking access:**
- Make sure you're logged in
- Verify user exists in `public.users` table
- Check policy conditions match your user

**Storage upload fails:**
- Verify storage buckets exist
- Check storage policies are configured
- Ensure file sizes are within limits

## Part 7: Production Deployment

### Frontend (Vercel)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

### Backend (Railway/Heroku)

1. Create `Procfile`:
```
web: cd python-engine && gunicorn app:app
```

2. Add `gunicorn` to `requirements.txt`:
```bash
echo "gunicorn==21.2.0" >> python-engine/requirements.txt
```

3. Deploy to Railway or Heroku

### Environment Variables

Set all environment variables in your deployment platform:
- Frontend: VITE_* variables
- Backend: FLASK_*, UPLOAD_FOLDER, etc.

## System Requirements

### Minimum:
- 4GB RAM
- 2 CPU cores
- 10GB disk space

### Recommended:
- 8GB RAM
- 4 CPU cores
- 20GB disk space
- SSD for faster processing

## Security Notes

1. **Never commit `.env` files**
2. Use strong encryption keys (32 characters recommended)
3. Regularly update dependencies
4. Enable Supabase RLS policies
5. Use HTTPS in production
6. Implement rate limiting for API endpoints

## Support

For issues or questions:
1. Check console logs (browser & Python)
2. Review error messages carefully
3. Verify all environment variables
4. Test with smaller files first

## Success Indicators

✅ Python engine running on port 5000
✅ Frontend running on port 3000
✅ Can create account and login
✅ Can upload files without errors
✅ Audio embedding produces stego image
✅ Audio extraction recovers original audio
✅ Quality metrics display correctly (PSNR, MSE, SSIM)
✅ GA convergence chart shows improvement

---

**Congratulations!** You now have a fully functional audio steganography system with genetic algorithm optimization.
