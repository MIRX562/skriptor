import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
    BACKEND_CALLBACK_URL = os.getenv("BACKEND_CALLBACK_URL", "http://localhost:3000/api/transcribe-upload/worker-callback")
    WORKER_SHARED_SECRET = os.getenv("WORKER_SHARED_SECRET")
    HUGGING_FACE_TOKEN = os.getenv("HUGGING_FACE_TOKEN")
    DEVICE = os.getenv("DEVICE", "cuda") # cuda or cpu

    @classmethod
    def validate(cls):
        required = ["WORKER_SHARED_SECRET", "HUGGING_FACE_TOKEN"]
        missing = [var for var in required if not getattr(cls, var)]
        if missing:
            raise ValueError(f"Missing required environment variables: {', '.join(missing)}")

config = Config
