from celery import Celery
from app.config import settings

celery_app = Celery("quantarena", broker=settings.redis_url, backend=settings.redis_url)
celery_app.conf.task_routes = {"app.worker.tasks.*": {"queue": "backtest"}}
