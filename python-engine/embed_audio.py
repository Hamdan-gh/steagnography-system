import os
import time
import base64
from image_processing import load_image, save_image, analyze_image_capacity
from audio_processing import load_audio
from aes_encryption import AESEncryption
from lsb_steganography import build_payload, embed_payload, HEADER_SIZE
from metrics import calculate_all_metrics


def embed_audio_in_image(cover_image_path, audio_path, encryption_key,
                         ga_generations=20, ga_population_size=15):
    """
    Embed audio in image using fast vectorized LSB steganography.
    GA parameters are kept for API compatibility but fast LSB is always used.
    """
    start_time = time.time()

    print("Step 1: Loading cover image...")
    cover_image = load_image(cover_image_path)

    print("Step 2: Loading audio file...")
    audio_info = load_audio(audio_path)
    audio_bytes = audio_info['data']
    print(f"Audio size: {len(audio_bytes)} bytes")

    capacity_info = analyze_image_capacity(cover_image_path)
    max_payload = capacity_info['max_capacity'] - HEADER_SIZE
    if len(audio_bytes) > max_payload:
        raise ValueError(
            f"Audio file too large. Max capacity: {max_payload} bytes, "
            f"Audio size: {len(audio_bytes)} bytes"
        )

    print("Step 3: Encrypting audio data with AES-256...")
    encryptor = AESEncryption(encryption_key)
    encrypted_data, nonce, tag = encryptor.encrypt(audio_bytes)

    payload = build_payload(encrypted_data, nonce, tag)
    payload_bits = len(payload) * 8
    print(f"Payload size: {len(payload)} bytes ({payload_bits} bits)")

    print("Step 4: Embedding data using fast LSB steganography...")
    stego_image = embed_payload(cover_image, payload)

    print("Step 5: Calculating quality metrics...")
    metrics = calculate_all_metrics(cover_image, stego_image)

    output_filename = f"stego_{int(time.time())}.png"
    output_path = os.path.join('outputs', output_filename)
    save_image(stego_image, output_path)

    execution_time = time.time() - start_time

    print(f"Embedding completed in {execution_time:.2f} seconds")
    print(f"PSNR: {metrics['psnr']:.2f} dB")
    print(f"SSIM: {metrics['ssim']:.4f}")

    with open(output_path, 'rb') as f:
        image_base64 = base64.b64encode(f.read()).decode('utf-8')

    fitness = 0.6 * metrics['psnr'] + 0.4 * (metrics['ssim'] * 100)

    return {
        'stego_image_url': f'/api/download/{output_filename}',
        'stego_image_base64': image_base64,
        'metrics': {
            'psnr': metrics['psnr'],
            'mse': metrics['mse'],
            'ssim': metrics['ssim'],
            'capacity_used': len(payload),
            'capacity_total': capacity_info['max_capacity']
        },
        'ga_results': {
            'best_fitness': fitness,
            'generations': 1,
            'population_size': 1,
            'convergence_data': [fitness],
            'optimized_positions': list(range(min(100, payload_bits))),
            'mode': 'fast_lsb'
        },
        'execution_time': execution_time
    }
