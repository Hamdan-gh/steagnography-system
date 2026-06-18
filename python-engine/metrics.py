import numpy as np
from skimage.metrics import structural_similarity as ssim
from skimage.metrics import peak_signal_noise_ratio as psnr

def calculate_psnr(original, stego):
    """
    Calculate Peak Signal-to-Noise Ratio
    Higher PSNR = better quality (less distortion)
    """
    try:
        return psnr(original, stego, data_range=255)
    except:
        # Fallback manual calculation
        mse = np.mean((original.astype(float) - stego.astype(float)) ** 2)
        if mse == 0:
            return 100  # Perfect match
        max_pixel = 255.0
        return 20 * np.log10(max_pixel / np.sqrt(mse))

def calculate_mse(original, stego):
    """
    Calculate Mean Squared Error
    Lower MSE = better quality
    """
    return np.mean((original.astype(float) - stego.astype(float)) ** 2)

def calculate_ssim(original, stego):
    """
    Calculate Structural Similarity Index
    Higher SSIM = better quality (closer to 1.0 is better)
    """
    try:
        return ssim(original, stego, multichannel=True, channel_axis=2, data_range=255)
    except:
        # Fallback for older versions
        return ssim(original, stego, multichannel=True, data_range=255)

def calculate_all_metrics(original, stego):
    """Calculate all quality metrics"""
    return {
        'psnr': float(calculate_psnr(original, stego)),
        'mse': float(calculate_mse(original, stego)),
        'ssim': float(calculate_ssim(original, stego))
    }

def calculate_capacity(image_shape):
    """
    Calculate embedding capacity (in bytes)
    Using LSB, we can embed 1 bit per color channel
    """
    height, width, channels = image_shape
    total_bits = height * width * channels
    total_bytes = total_bits // 8
    return total_bytes
