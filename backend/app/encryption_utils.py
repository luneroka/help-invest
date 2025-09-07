from cryptography.fernet import Fernet
import os
import base64

class MonetaryEncryption:
    def __init__(self):
        # Use environment variable or generate key (store securely!)
        key = os.environ.get('MONETARY_ENCRYPTION_KEY')
        if not key:
            key = Fernet.generate_key()
            print(f"Generated new encryption key: {key.decode()}")
        else:
            key = key.encode() if isinstance(key, str) else key
        self.cipher = Fernet(key)
    
    def encrypt_amount(self, amount: float) -> str:
        """Encrypt a monetary amount"""
        amount_str = str(amount)
        encrypted = self.cipher.encrypt(amount_str.encode())
        return base64.b64encode(encrypted).decode()
    
    def decrypt_amount(self, encrypted_amount: str) -> float:
        """Decrypt a monetary amount"""
        try:
            encrypted_bytes = base64.b64decode(encrypted_amount.encode())
            decrypted = self.cipher.decrypt(encrypted_bytes)
            return float(decrypted.decode())
        except Exception:
            raise ValueError("Invalid encrypted amount")

# Singleton instance
monetary_crypto = MonetaryEncryption()