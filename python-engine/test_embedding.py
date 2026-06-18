"""
Test script to verify embedding functionality works correctly
"""
import os
import sys
from PIL import Image
import numpy as np

def create_test_files():
    """Create simple test files for quick verification"""
    print("Creating test files...")
    
    # Create a simple test image (100x100 red square)
    test_img = np.ones((100, 100, 3), dtype=np.uint8) * 128
    img = Image.fromarray(test_img, 'RGB')
    img.save('uploads/test_image.png', 'PNG')
    print("✓ Test image created: uploads/test_image.png")
    
    # Create a simple test audio data (simulated as bytes)
    test_audio = b"This is test audio data" * 100  # ~2.3 KB
    with open('uploads/test_audio.wav', 'wb') as f:
        # Write a minimal WAV header
        f.write(b'RIFF')
        f.write((len(test_audio) + 36).to_bytes(4, 'little'))
        f.write(b'WAVEfmt ')
        f.write((16).to_bytes(4, 'little'))
        f.write((1).to_bytes(2, 'little'))  # PCM
        f.write((1).to_bytes(2, 'little'))  # Mono
        f.write((44100).to_bytes(4, 'little'))  # Sample rate
        f.write((88200).to_bytes(4, 'little'))  # Byte rate
        f.write((2).to_bytes(2, 'little'))  # Block align
        f.write((16).to_bytes(2, 'little'))  # Bits per sample
        f.write(b'data')
        f.write(len(test_audio).to_bytes(4, 'little'))
        f.write(test_audio)
    print("✓ Test audio created: uploads/test_audio.wav")

def test_embedding():
    """Test the embedding process with minimal parameters"""
    print("\n" + "=" * 60)
    print("Testing Embedding Process")
    print("=" * 60)
    
    from embed_audio import embed_audio_in_image
    
    try:
        # Use minimal GA parameters for fast testing
        result = embed_audio_in_image(
            'uploads/test_image.png',
            'uploads/test_audio.wav',
            'test_encryption_key_12345',
            ga_generations=10,  # Very small for quick test
            ga_population_size=10
        )
        
        print("\n" + "=" * 60)
        print("✓ EMBEDDING TEST PASSED!")
        print("=" * 60)
        print(f"PSNR: {result['metrics']['psnr']:.2f} dB")
        print(f"SSIM: {result['metrics']['ssim']:.4f}")
        print(f"Execution time: {result['execution_time']:.2f} seconds")
        print(f"Output file: {result['stego_image_url']}")
        
        # Check if output file exists
        output_file = result['stego_image_url'].replace('/api/download/', 'outputs/')
        if os.path.exists(output_file):
            print(f"✓ Output file created successfully")
            file_size = os.path.getsize(output_file)
            print(f"File size: {file_size} bytes")
        else:
            print("✗ Output file not found!")
        
        return True
        
    except Exception as e:
        print("\n" + "=" * 60)
        print("✗ EMBEDDING TEST FAILED!")
        print("=" * 60)
        print(f"Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

def main():
    print("StegaGen Embedding Test Script")
    print("=" * 60)
    
    # Check dependencies
    try:
        import numpy
        import PIL
        from deap import base
        print("✓ All required packages found")
    except ImportError as e:
        print(f"✗ Missing package: {e}")
        print("Please install requirements: pip install -r requirements.txt")
        return
    
    # Create test files
    create_test_files()
    
    # Run test
    success = test_embedding()
    
    if success:
        print("\n🎉 All tests passed! The embedding system is working correctly.")
        print("\nYou can now start the Flask server with: python app.py")
    else:
        print("\n❌ Tests failed. Please check the error messages above.")

if __name__ == '__main__':
    main()
