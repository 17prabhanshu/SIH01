from celery.schedules import crontab
from .tasks import celery_app

celery_app.conf.beat_schedule = {
    'ingest-rainfall-every-30-minutes': {
        'task': 'services.workers.tasks.ingest_rainfall_task',
        'schedule': crontab(minute='*/30'),
    },
    'satellite-metadata-every-1-hour': {
        'task': 'services.workers.tasks.ingest_satellite_metadata_task',
        'schedule': crontab(minute='0', hour='*'),
    },
    'rainfall-trigger-every-1-hour': {
        'task': 'services.workers.tasks.run_rainfall_trigger_task',
        'schedule': crontab(minute='15', hour='*'),
        'args': ('REGION_ALL',)
    },
    'fusion-pipeline-every-2-hours': {
        'task': 'services.workers.tasks.run_fusion_pipeline_task',
        'schedule': crontab(minute='30', hour='*/2'),
        'args': (27.0, 88.0) # Example args, normally would iterate over regions
    },
    'alert-evaluation-every-30-minutes': {
        'task': 'services.workers.tasks.evaluate_alerts_task',
        'schedule': crontab(minute='*/30'),
    },
    'cleanup-stale-data-daily': {
        'task': 'services.workers.tasks.cleanup_stale_data_task',
        'schedule': crontab(minute='0', hour='1'), # 1 AM UTC
    },
    'monitor-model-drift-daily': {
        'task': 'services.workers.tasks.monitor_model_drift_task',
        'schedule': crontab(minute='0', hour='2'), # 2 AM UTC
    },
}
