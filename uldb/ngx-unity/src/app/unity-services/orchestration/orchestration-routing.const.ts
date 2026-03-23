import { Routes } from "@angular/router";
import { ORCHESTRATION_EXECUTION_ROUTES } from "./orchestration-executions/orchestration-executions-routing.const";
import { ORCHESTRATION_INTEGRATION_ROUTES } from "./orchestration-integration/orchestration-integration-routing.const";
import { ORCHESTRATION_TASKS_ROUTES } from "./orchestration-tasks/orchestration-tasks-routing.const";
import { ORCHESTRATION_WORKFLOW_CRUD_ROUTES, ORCHESTRATION_WORKFLOW_ROUTES } from "./orchestration-workflows/orchestration-workflows-routing.const";
import { OrchestrationComponent } from "./orchestration.component";
import { ORCHESTRATION_INPUT_TEMPLATE_ROUTES } from "./orchestration-input-template/orchestration-input-template-routing.const";
import { IMAGE_MAPPINNG_ROUTES } from "./image-mapping/image-mapping-routing.const";
import { OrchestrationSummaryComponent } from "./orchestration-summary/orchestration-summary.component";

export const ORCHESTRATION_ROUTES: Routes = [
    {
        path: 'orchestration',
        component: OrchestrationComponent,
        data: {
            breadcrumb: {
                title: 'Devops Automation',
            },
        },
        children: [
            {
                path: 'summary',
                component: OrchestrationSummaryComponent,
                data: {
                    breadcrumb: {
                        title: 'Summary',
                        stepbackCount: 0
                    }
                }
            },
            ...ORCHESTRATION_TASKS_ROUTES,
            ...ORCHESTRATION_WORKFLOW_ROUTES,
            ...ORCHESTRATION_INTEGRATION_ROUTES,
            ...ORCHESTRATION_EXECUTION_ROUTES,
            ...ORCHESTRATION_INPUT_TEMPLATE_ROUTES,
            ...IMAGE_MAPPINNG_ROUTES
        ]
    },
    ...ORCHESTRATION_WORKFLOW_CRUD_ROUTES,
    // ...ORCHESTRATION_WORKFLOW_ON_CHAT
]