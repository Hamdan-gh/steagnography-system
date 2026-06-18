"""
Fast vectorized LSB steganography.
Embeds data sequentially from the first pixel — no external metadata required.
Only the least significant bit of each color channel is modified (±1 max),
preserving the visual appearance of the cover image.
"""
import numpy as np

MAGIC = b'STGA'
HEADER_SIZE = 40  # 4 magic + 4 size + 16 nonce + 16 tag


def build_payload(encrypted_data: bytes, nonce: bytes, tag: bytes) -> bytes:
    """Build self-contained payload with magic header for validation."""
    size_bytes = len(encrypted_data).to_bytes(4, 'big')
    return MAGIC + size_bytes + nonce + tag + encrypted_data


def embed_bits_lsb(image: np.ndarray, data_bits: np.ndarray) -> np.ndarray:
    """Embed bits into image LSBs using vectorized numpy operations."""
    stego = image.copy()
    flat = stego.reshape(-1)
    n_bits = len(data_bits)

    if n_bits > len(flat):
        raise ValueError(
            f"Not enough capacity: need {n_bits} bits, image has {len(flat)}"
        )

    flat[:n_bits] = (flat[:n_bits] & 0xFE) | data_bits.astype(np.uint8)
    return stego


def embed_payload(image: np.ndarray, payload: bytes) -> np.ndarray:
    """Embed byte payload into image using sequential LSB."""
    bits = np.unpackbits(np.frombuffer(payload, dtype=np.uint8))
    return embed_bits_lsb(image, bits)


def extract_bits_lsb(image: np.ndarray, num_bits: int) -> np.ndarray:
    """Extract num_bits LSBs from image sequentially."""
    flat = image.reshape(-1)
    if num_bits > len(flat):
        raise ValueError("Image does not contain enough data")
    return (flat[:num_bits] & 1).astype(np.uint8)


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

    max_bits = image.size
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
