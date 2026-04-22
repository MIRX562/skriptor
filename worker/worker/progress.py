import json
import redis
from .config import config

class ProgressManager:
    def __init__(self, transcription_id: str):
        self.transcription_id = transcription_id
        self.redis_client = redis.from_url(config.REDIS_URL)
        self.channel = f"transcription:progress:{transcription_id}"
        self.last_key = f"transcription:progress:{transcription_id}:last"

    def update(self, status: str, progress: int, message: str):
        event = {
            "id": self.transcription_id,
            "status": status,
            "progress": progress,
            "message": message
        }
        data = json.dumps(event)
        
        # Publish to Pub/Sub channel
        self.redis_client.publish(self.channel, data)
        
        # Store as last event for SSE reconnect support
        self.redis_client.set(self.last_key, data, ex=3600) # 1 hour expiry

    def complete(self):
        self.update("completed", 100, "Processing complete")
        # The callback handler on the server will delete the progress keys

    def error(self, message: str):
        self.update("error", 0, message)
