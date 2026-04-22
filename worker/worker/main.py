import asyncio
import os
from bullmq import Worker, Job
from .config import config
from .transcriber import Transcriber
from .progress import ProgressManager
from .callback import CallbackManager

async def process_job(job: Job, token: str):
    print(f"Processing job {job.id}")
    data = job.data
    transcription_id = data.get("transcriptionId")
    
    progress = ProgressManager(transcription_id)
    transcriber = Transcriber()
    
    try:
        # Update status to processing
        progress.update("processing", 0, "Initializing...")
        
        # Run transcription
        result = transcriber.process(
            audio_url=data.get("audioUrl"),
            model_size=data.get("model", "medium"),
            language=data.get("language", "en"),
            is_diarized=data.get("isSpeakerDiarized", False),
            num_speakers=data.get("numberOfSpeaker"),
            progress_cb=progress.update
        )
        
        # Send callback
        callback_payload = {
            "transcriptionId": transcription_id,
            "status": "completed",
            "segments": result["segments"],
            "metadata": result["metadata"]
        }
        
        if CallbackManager.send_callback(callback_payload):
            progress.complete()
            print(f"Job {job.id} completed successfully")
        else:
            raise Exception("Failed to send callback to backend")

    except Exception as e:
        print(f"Error processing job {job.id}: {e}")
        progress.error(str(e))
        
        # Send failure callback
        CallbackManager.send_callback({
            "transcriptionId": transcription_id,
            "status": "failed"
        })

async def main():
    config.validate()
    print("Starting Skriptor Worker...")
    
    # Initialize BullMQ Worker
    # Note: BullMQ connection usually expects redis URL or dict
    worker = Worker(
        "transcription", 
        process_job, 
        {
            "connection": config.REDIS_URL,
            "concurrency": 1
        }
    )
    
    print(f"Worker listening on queue 'transcription' (Redis: {config.REDIS_URL})")
    
    try:
        # Keep the worker running
        while True:
            await asyncio.sleep(1)
    except asyncio.CancelledError:
        print("Worker stopping...")
    finally:
        await worker.close()

if __name__ == "__main__":
    asyncio.run(main())
