"""
Fast vectorized LSB steganography with 2-bit embedding.
Embeds data sequentially using 2 least significant bits per channel (4x capacity).
Only the 2 LSBs are modified (max ±3 change), preserving visual quality.
"""
import numpy as np

MAGIC = b'STGA'
HEADER_SIZE = 40  # 4 magic + 4 size + 16 nonce + 16 tag
BITS_PER_CHANNEL = 2  # Use 2 LSBs for 4x capacity


def build_payload(encrypted_data: bytes, nonce: bytes, tag: bytes) -> bytes:
    """Build self-contained payload with magic header for validation."""
    size_bytes = len(encrypted_data).to_bytes(4, 'big')
    return MAGIC + size_bytes + nonce + tag + encrypted_data


def embed_bits_lsb(image: np.ndarray, data_bits: np.ndarray) -> np.ndarray:
    """Embed bits into image using 2 LSBs per channel (vectorized)."""
    stego = image.copy()
    flat = stego.reshape(-1)
    n_bits = len(data_bits)
    
    # Calculate how many channels we need (2 bits per channel)
    n_channels_needed = (n_bits + 1) // 2  # Round up
    
    if n_channels_needed > len(flat):
        raise ValueError(
            f"Not enough capacity: need {n_channels_needed} channels "
            f"for {n_bits} bits, image has {len(flat)} channels"
        )
    
    # Pad data_bits to even length if necessary
    if n_bits % 2 == 1:
        data_bits = np.append(data_bits, 0)
    
    # Reshape data into pairs of bits
    data_pairs = data_bits.reshape(-1, 2)
    
    # Convert pairs to 2-bit values (0-3)
    data_values = (data_pairs[:, 0] << 1) | data_pairs[:, 1]
    
    # Clear 2 LSBs and embed new values
    flat[:len(data_values)] = (flat[:len(data_values)] & 0xFC) | data_values.astype(np.uint8)
    
    return stego


def embed_payload(image: np.ndarray, payload: bytes) -> np.ndarray:
    """Embed byte payload into image using 2-bit LSB."""
    bits = np.unpackbits(np.frombuffer(payload, dtype=np.uint8))
    return embed_bits_lsb(image, bits)


def extract_bits_lsb(image: np.ndarray, num_bits: int) -> np.ndarray:
    """Extract num_bits from image using 2 LSBs per channel."""
    flat = image.reshape(-1)
    n_channels_needed = (num_bits + 1) // 2
    
    if n_channels_needed > len(flat):
        raise ValueError("Image does not contain enough data")
    
    # Extract 2-bit values from each channel
    values = flat[:n_channels_needed] & 0x03  # Get 2 LSBs
    
    # Convert to individual bits
    bits = np.zeros(n_channels_needed * 2, dtype=np.uint8)
    bits[::2] = (values >> 1) & 1  # High bit
    bits[1::2] = values & 1         # Low bit
    
    return bits[:num_bits]


def bits_to_bytes(bits: np.ndarray) -> bytes:
    """Convert bit array to bytes (length must be a multiple of 8)."""
    if len(bits) % 8 != 0:
        raise ValueError("Bit length must be a multiple of 8")
    return np.packbits(bits).tobytes()


def extract_payload(image: np.ndarray) -> bytes:
    """
    Extract embedded payload from stego image without external metadata.
    Reads header first to determine total payload size.
    """
    header_bits = extract_bits_lsb(image, HEADER_SIZE * 8)
    header = bits_to_bytes(header_bits)

    if len(header) < HEADER_SIZE:
        raise ValueError("Invalid stego image: insufficient embedded data")

    if header[:4] != MAGIC:
        raise ValueError(
            "No embedded audio found in this image. "
            "Ensure you are using a PNG file created by this tool."
        )

    encrypted_size = int.from_bytes(header[4:8], 'big')
    total_bytes = HEADER_SIZE + encrypted_size
    total_bits = total_bytes * 8

    # With 2 bits per channel, we can store 2 bits per channel
    max_bits = image.size * BITS_PER_CHANNEL
    if total_bits > max_bits or encrypted_size <= 0:
        raise ValueError("Corrupted stego image: invalid payload size")

    all_bits = extract_bits_lsb(image, total_bits)
    return bits_to_bytes(all_bits)


def parse_payload(payload: bytes) -> tuple:
    """Parse payload into encrypted_data, nonce, and tag."""
    if len(payload) < HEADER_SIZE:
        raise ValueError("Payload too short")

    if payload[:4] != MAGIC:
        raise ValueError("Invalid payload magic bytes")

    encrypted_size = int.from_bytes(payload[4:8], 'big')
    nonce = payload[8:24]
    tag = payload[24:40]
    encrypted_data = payload[40:40 + encrypted_size]

    if len(encrypted_data) != encrypted_size:
        raise ValueError("Truncated encrypted data in stego image")

    return encrypted_data, nonce, tag
