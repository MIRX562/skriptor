import hmac
import hashlib
import time
import json
import requests
from .config import config

class CallbackManager:
    @staticmethod
    def send_callback(payload: dict):
        timestamp = str(int(time.time()))
        body = json.dumps(payload)
        
        # Calculate HMAC signature
        message = f"{timestamp}.{body}".encode("utf-8")
        signature = hmac.new(
            config.WORKER_SHARED_SECRET.encode("utf-8"),
            message,
            hashlib.sha256
        ).hexdigest()
        
        headers = {
            "Content-Type": "application/json",
            "x-worker-timestamp": timestamp,
            "x-worker-signature": f"sha256={signature}"
        }
        
        print(f"Sending callback to {config.BACKEND_CALLBACK_URL}")
        try:
            response = requests.post(
                config.BACKEND_CALLBACK_URL,
                data=body,
                headers=headers,
                timeout=30
            )
            response.raise_for_status()
            print("Callback successful")
            return True
        except Exception as e:
            print(f"Callback failed: {e}")
            return False
