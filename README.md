# 🔐 StegaGen Secure

**Design and Optimization of an Audio Steganography System Using Genetic Algorithms for Secure Data Hiding**

A professional, enterprise-grade web application that hides audio files inside images using advanced steganography techniques and Genetic Algorithms for optimal embedding.

## 🚀 Features

### Core Functionality
- **Audio Steganography**: Hide audio files within cover images using LSB (Least Significant Bit) embedding
- **Genetic Algorithm Optimization**: Optimize pixel positions for maximum imperceptibility and security
- **AES-256 Encryption**: Secure audio data before embedding
- **Quality Metrics**: Evaluate stego images using PSNR, MSE, and SSIM
- **Audio Extraction**: Retrieve and decrypt hidden audio from stego images

### User Features
- 🔒 Secure authentication with role-based access
- 📊 Interactive dashboards with real-time analytics
- 📁 Drag-and-drop file uploads
- 📈 Visual charts and statistics
- 🌓 Dark/Light mode support
- 📱 Fully responsive design
- 🔔 Real-time notifications
- 📜 Complete operation history

### Admin Features
- 👥 User management
- 📊 System analytics
- 🔍 Audit logs
- 📈 Usage statistics

## 🛠️ Technology Stack

### Frontend
- **React 18** + **TypeScript**
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Shadcn UI** - Component library
- **Framer Motion** - Animations
- **Recharts** - Data visualization
- **React Router** - Navigation
- **Zustand** - State management

### Backend
- **Supabase** - PostgreSQL database, authentication, storage
- **Python Flask** - Processing engine
- **Node.js** - API layer

### Processing Engine
- **NumPy** - Numerical computations
- **SciPy** - Scientific computing
- **Pillow (PIL)** - Image processing
- **librosa** - Audio processing
- **DEAP/PyGAD** - Genetic algorithms
- **PyCrypto** - Encryption

## 📁 Project Structure

```
stegagen-secure/
├── src/
│   ├── components/      # React components
│   ├── pages/          # Page components
│   ├── layouts/        # Layout components
│   ├── hooks/          # Custom hooks
│   ├── lib/            # Core utilities
│   ├── services/       # API services
│   ├── contexts/       # React contexts
│   ├── utils/          # Helper functions
│   ├── types/          # TypeScript types
│   └── constants/      # Constants
├── python-engine/      # Python processing engine
│   ├── app.py
│   ├── embed_audio.py
│   ├── extract_audio.py
│   ├── genetic_algorithm.py
│   ├── metrics.py
│   └── requirements.txt
└── public/             # Static assets
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn
- Python 3.9+
- Supabase account

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/stegagen-secure.git
cd stegagen-secure
```

2. **Install frontend dependencies**
```bash
npm install
```

3. **Setup environment variables**
```bash
cp .env.example .env
# Edit .env with your Supabase credentials
```

4. **Setup Python engine**
```bash
cd python-engine
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

5. **Start development servers**

Terminal 1 (Frontend):
```bash
npm run dev
```

Terminal 2 (Python Engine):
```bash
cd python-engine
python app.py
```

6. **Open browser**
```
http://localhost:3000
```

## 📊 Database Schema

The system uses Supabase PostgreSQL with the following tables:
- `users` - User accounts and roles
- `images` - Uploaded cover images
- `audio_files` - Audio files to hide
- `stego_images` - Generated stego images with metrics
- `extraction_logs` - Extraction operation logs
- `audit_logs` - System audit trail

## 🔒 Security Features

- AES-256 encryption for audio data
- Row-level security in Supabase
- Secure authentication with JWT
- Input validation and sanitization
- HTTPS-only in production
- Encrypted storage buckets

## 🧬 Genetic Algorithm

The GA optimizes pixel positions for embedding with:
- **Chromosome**: Array of pixel positions
- **Fitness Function**: `α(PSNR) + β(SSIM) - γ(MSE)`
- **Selection**: Tournament selection
- **Crossover**: Single-point crossover
- **Mutation**: Random pixel mutation
- **Population**: 50-100 chromosomes
- **Generations**: 100-200 iterations

## 📈 Quality Metrics

- **PSNR** (Peak Signal-to-Noise Ratio): Measures quality
- **MSE** (Mean Squared Error): Measures distortion
- **SSIM** (Structural Similarity Index): Measures perceptual quality

## 🎨 UI/UX Design

- Modern cybersecurity-inspired interface
- Glassmorphism effects
- Smooth animations with Framer Motion
- Responsive layouts for all devices
- Accessibility compliant (WCAG 2.1)

## 📝 License

This project is licensed under the MIT License.

## 👨‍💻 Author

Computer Science Final Year Project

## 🙏 Acknowledgments

- Research based on advanced steganography techniques
- Inspired by professional cybersecurity platforms
- Built with modern web technologies

---

**StegaGen Secure** - Secure Data Hiding with AI Optimization 🔐
