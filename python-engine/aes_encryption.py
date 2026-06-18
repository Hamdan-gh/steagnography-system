from Crypto.Cipher import AES
from Crypto.Protocol.KDF import PBKDF2
from Crypto.Random import get_random_bytes
import hashlib

class AESEncryption:
    """AES-256 encryption for audio data"""
    
    def __init__(self, key: str):
        # Derive a 32-byte key from the password
        self.key = PBKDF2(key, b'StegaGenSecure', dkLen=32, count=100000)
    
    def encrypt(self, data: bytes) -> tuple:
        """
        Encrypt data using AES-256
        Returns: (encrypted_data, nonce, tag)
        """
        cipher = AES.new(self.key, AES.MODE_EAX)
        nonce = cipher.nonce
        ciphertext, tag = cipher.encrypt_and_digest(data)
        return ciphertext, nonce, tag
    
    def decrypt(self, ciphertext: bytes, nonce: bytes, tag: bytes) -> bytes:
        """
        Decrypt data using AES-256
        """
        cipher = AES.new(self.key, AES.MODE_EAX, nonce=nonce)
        plaintext = cipher.decrypt(ciphertext)
        cipher.verify(tag)
        return plaintext

def hash_key(key: str) -> str:
    """Generate SHA-256 hash of encryption key"""
    return hashlib.sha256(key.encode()).hexdigest()
