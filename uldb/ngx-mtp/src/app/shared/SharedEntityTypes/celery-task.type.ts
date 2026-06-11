export interface CeleryTask {
    task_id: string;
}

export interface CeleryTaskV2 {
    celery_task: CeleryTask
}