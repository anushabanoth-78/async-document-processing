from fastapi import APIRouter
from app.services.pubsub_service import redis_client
from app.workers.celery_app import celery_app

router = APIRouter(tags=["health"])

@router.get("/health")
async def health_check():
    health = {"status": "healthy", "redis": "unknown", "celery": "unknown"}
    
    # Check Redis
    try:
        await redis_client.ping()
        health["redis"] = "connected"
    except Exception as e:
        health["redis"] = f"error: {str(e)}"
        health["status"] = "unhealthy"

    # Check Celery
    try:
        insp = celery_app.control.inspect()
        stats = insp.stats()
        if stats:
            health["celery"] = "connected"
        else:
            health["celery"] = "no workers found"
    except Exception as e:
        health["celery"] = f"error: {str(e)}"

    return health
