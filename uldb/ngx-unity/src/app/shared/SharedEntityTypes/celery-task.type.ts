export interface CeleryTask {
    task_id: string;
}

export interface CeleryTaskV2 {
    celery_task: CeleryTask
}

export interface EntityTaskRelation {
    entityId: string;
    entityName: string;
    taskId: string;
}