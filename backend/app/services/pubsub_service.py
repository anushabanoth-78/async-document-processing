from redis.asyncio import Redis
from app.core.config import settings
import json

redis_client = Redis.from_url(settings.REDIS_URL, decode_responses=True)

class PubSubService:
    @staticmethod
    async def publish_job_progress(job_id: int, status: str, progress: int, stage: str):
        payload = {
            "job_id": job_id,
            "status": status,
            "progress_percentage": progress,
            "current_stage": stage
        }
        await redis_client.publish(f"job_{job_id}", json.dumps(payload))

    @staticmethod
    async def subscribe_job(job_id: int):
        pubsub = redis_client.pubsub()
        await pubsub.subscribe(f"job_{job_id}")
        return pubsub
