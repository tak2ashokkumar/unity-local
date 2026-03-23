import { Routes } from "@angular/router";
import { OrchestrationExecutionsTaskLogsComponent } from "./orchestration-executions-task-logs/orchestration-executions-task-logs.component";
import { OrchestrationExecutionsWorkflowLogsComponent } from "./orchestration-executions-workflow-logs/orchestration-executions-workflow-logs.component";
import { OrchestrationExecutionsComponent } from "./orchestration-executions.component";

export const ORCHESTRATION_EXECUTION_ROUTES: Routes = [
    {
        path: 'executions',
        component: OrchestrationExecutionsComponent,
        data: {
            breadcrumb: {
                title: 'Executions',
                stepbackCount: 0
            }
        }
    },
    {
        path: 'executions/:taskId/:id/tasklogs',
        component: OrchestrationExecutionsTaskLogsComponent,
        data: {
            breadcrumb: {
                title: 'Task Execution Logs',
                stepbackCount: 0
            }
        },
    },
    {
        path: 'executions/:workflowId/workflow-logs',
        component: OrchestrationExecutionsWorkflowLogsComponent,
        data: {
            breadcrumb: {
                title: 'Workflow Execution Logs',
                stepbackCount: 0
            }
        },
    }
]