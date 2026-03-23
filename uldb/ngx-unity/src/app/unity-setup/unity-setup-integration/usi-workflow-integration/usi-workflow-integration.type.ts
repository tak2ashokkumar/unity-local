export interface workflowIntegration {
    uuid: string;
    name: string;
    category: string;
    task_type: string;
    enabled: boolean;
    task: string;
    workflow?: any;
    webhook_url: string;
}