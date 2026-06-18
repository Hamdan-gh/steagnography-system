import os
import time
import base64
from image_processing import load_image
from audio_processing import save_audio
from aes_encryption import AESEncryption
from lsb_steganography import extract_payload, parse_payload


def extract_audio_from_image(stego_image_path, encryption_key):
    """
    Extract audio from stego image.
    All position data is read directly from the image — no external metadata needed.
    """
    start_time = time.time()

    print("Step 1: Loading stego image...")
    stego_image = load_image(stego_image_path)

    print("Step 2: Extracting embedded payload from image...")
    payload = extract_payload(stego_image)

    print("Step 3: Parsing encrypted data...")
    encrypted_data, nonce, tag = parse_payload(payload)

    print("Step 4: Decrypting audio data...")
    try:
        decryptor = AESEncryption(encryption_key)
        audio_bytes = decryptor.decrypt(encrypted_data, nonce, tag)
    except Exception as e:
        raise ValueError(
            f"Decryption failed. Invalid encryption key or corrupted data: {str(e)}"
        )

    print("Step 5: Saving extracted audio...")
    output_filename = f"extracted_{int(time.time())}.wav"
    output_path = os.path.join('outputs', output_filename)
    save_audio(audio_bytes, output_path)

    execution_time = time.time() - start_time
    print(f"Extraction completed in {execution_time:.2f} seconds")

    audio_base64 = base64.b64encode(audio_bytes).decode('utf-8')

    return {
        'audio_url': f'/api/download/{output_filename}',
        'audio_base64': audio_base64,
        'audio_name': output_filename,
        'audio_size': len(audio_bytes),
        'execution_time': execution_time,
        'success': True
    }
