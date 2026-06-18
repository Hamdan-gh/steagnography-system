import librosa
import soundfile as sf
import numpy as np
import os

def load_audio(audio_path):
    """Load audio file and return as bytes"""
    # Read audio file
    audio_data, sample_rate = librosa.load(audio_path, sr=None, mono=False)
    
    # Convert to bytes
    with open(audio_path, 'rb') as f:
        audio_bytes = f.read()
    
    # Get duration
    duration = librosa.get_duration(y=audio_data, sr=sample_rate)
    
    return {
        'data': audio_bytes,
        'size': len(audio_bytes),
        'duration': duration,
        'sample_rate': sample_rate
    }

def save_audio(audio_bytes, output_path, format='wav'):
    """Save audio bytes to file"""
    with open(output_path, 'wb') as f:
        f.write(audio_bytes)
    return output_path

def bytes_to_bits(data):
    """Convert bytes to bit array"""
    bits = []
    for byte in data:
        for i in range(8):
            bits.append((byte >> (7 - i)) & 1)
    return bits

def bits_to_bytes(bits):
    """Convert bit array to bytes"""
    # Pad to multiple of 8
    while len(bits) % 8 != 0:
        bits.append(0)
    
    bytes_list = []
    for i in range(0, len(bits), 8):
        byte = 0
        for j in range(8):
            byte = (byte << 1) | bits[i + j]
        bytes_list.append(byte)
    
    return bytes(bytes_list)

def get_audio_format(filename):
    """Get audio format from filename"""
    ext = os.path.splitext(filename)[1].lower()
    format_map = {
        '.wav': 'wav',
        '.mp3': 'mp3',
        '.ogg': 'ogg',
        '.flac': 'flac'
    }
    return format_map.get(ext, 'wav')
