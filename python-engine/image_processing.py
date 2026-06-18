from PIL import Image
import numpy as np

def load_image(image_path):
    """Load image and convert to numpy array"""
    img = Image.open(image_path)
    
    # Convert to RGB if needed
    if img.mode != 'RGB':
        img = img.convert('RGB')
    
    return np.array(img)

def save_image(image_array, output_path):
    """Save numpy array as image with maximum quality preservation"""
    # Ensure the array is in the correct format
    image_array = np.clip(image_array, 0, 255).astype('uint8')
    
    img = Image.fromarray(image_array, 'RGB')
    
    # Save as PNG with no compression (best quality)
    # PNG is lossless, so the embedded data will be preserved perfectly
    img.save(output_path, 'PNG', optimize=False, compress_level=0)
    
    return output_path

def analyze_image_capacity(image_path):
    """Analyze cover image and return capacity information (using 2-bit LSB)"""
    img = load_image(image_path)
    height, width, channels = img.shape
    
    # Calculate capacity (2 bits per channel for 4x capacity)
    BITS_PER_CHANNEL = 2
    total_bits = height * width * channels * BITS_PER_CHANNEL
    total_bytes = total_bits // 8
    
    # Reserve bytes for payload header (magic + size + nonce + tag)
    usable_bytes = total_bytes - 40
    
    return {
        'max_capacity': int(usable_bytes),
        'dimensions': {
            'width': int(width),
            'height': int(height),
            'channels': int(channels)
        },
        'total_pixels': int(height * width),
        'bits_per_channel': BITS_PER_CHANNEL
    }

def validate_image_dimensions(image_path, min_width=512, min_height=512):
    """Validate image meets minimum dimension requirements"""
    img = Image.open(image_path)
    width, height = img.size
    
    if width < min_width or height < min_height:
        raise ValueError(f"Image dimensions too small. Minimum: {min_width}x{min_height}, Got: {width}x{height}")
    
    return True
