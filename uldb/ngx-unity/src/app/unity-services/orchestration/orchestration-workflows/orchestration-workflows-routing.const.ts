import { Routes } from "@angular/router";
import { OrchestrationWorkflowCrudPocComponent } from "./orchestration-workflow-crud-poc/orchestration-workflow-crud-poc.component";
import { OrchestrationWorkflowCrudComponent } from "./orchestration-workflow-crud/orchestration-workflow-crud.component";
import { OrchestrationWorkflowExecutionComponent } from "./orchestration-workflow-execution/orchestration-workflow-execution.component";
import { OrchestrationWorkflowsComponent } from "./orchestration-workflows.component";
import { OrchestrationWorkflowScheduleComponent } from "./orchestration-workflow-schedule/orchestration-workflow-schedule.component";
import { OrchestrationWorkflowPocComponent } from "./orchestration-workflow-poc/orchestration-workflow-poc.component";
import { OrchestrationAgenticWorkflowContainerComponent } from "./orchestration-agentic-workflow-container/orchestration-agentic-workflow-container.component";
import { OrchestrationAgenticWorkflowManualTriggerComponent } from "./orchestration-agentic-workflow-manual-trigger/orchestration-agentic-workflow-manual-trigger.component";
import { OrchestrationAgenticWorkflowScheduleTriggerComponent } from "./orchestration-agentic-workflow-schedule-trigger/orchestration-agentic-workflow-schedule-trigger.component";
import { OrchestrationWorkflowsOnChatComponent } from "./orchestration-workflows-on-chat/orchestration-workflows-on-chat.component";
import { OrchestrationAgenticWorkflowWebhookTriggerComponent } from "./orchestration-agentic-workflow-webhook-trigger/orchestration-agentic-workflow-webhook-trigger.component";
import { OrchestrationAgenticWorkflowItsmTriggerComponent } from "./orchestration-agentic-workflow-itsm-trigger/orchestration-agentic-workflow-itsm-trigger.component";
import { OrchestrationAgenticWorkflowAimlTriggerComponent } from "./orchestration-agentic-workflow-aiml-trigger/orchestration-agentic-workflow-aiml-trigger.component";

export const ORCHESTRATION_WORKFLOW_ROUTES: Routes = [
    {
        path: 'workflows',
        component: OrchestrationWorkflowsComponent,
        data: {
            breadcrumb: {
                title: 'Workflows',
                stepbackCount: 0
            }
        },
    },
    {
        path: 'workflows/:workflowId/execute',
        component: OrchestrationWorkflowExecutionComponent,
        data: {
            breadcrumb: {
                title: 'Execute',
                stepbackCount: 0
            }
        }
    },
    {
        path: 'workflows/:workflowId/:targetType/scheduleWorkflow',
        component: OrchestrationWorkflowScheduleComponent,
        data: {
            breadcrumb: {
                title: 'Schedule',
                stepbackCount: 0
            }
        }
    },
    {
        path: 'workflows/:id/manual-trigger',
        component: OrchestrationAgenticWorkflowManualTriggerComponent,
        data: {
            breadcrumb: {
                title: 'Execute',
                stepbackCount: 0
            }
        }
    },
    {
        path: 'workflows/:id/schedule-trigger',
        component: OrchestrationAgenticWorkflowScheduleTriggerComponent,
        data: {
            breadcrumb: {
                title: 'Execute',
                stepbackCount: 0
            }
        }
    },
    {
        path: 'workflows/:workflowId/on-chat',
        component: OrchestrationWorkflowsOnChatComponent,
        data: {
            breadcrumb: {
                title: 'On Chat',
            },
        },
    },
    {
        path: 'workflows/:id/webhook-trigger',
        component: OrchestrationAgenticWorkflowWebhookTriggerComponent,
        data: {
            breadcrumb: {
                title: 'Execute',
            },
        },
    },
    {
        path: 'workflows/:id/itsm-trigger',
        component: OrchestrationAgenticWorkflowItsmTriggerComponent,
        data: {
            breadcrumb: {
                title: 'Execute',
            },
        },
    },
    {
        path: 'workflows/:id/aiml-trigger',
        component: OrchestrationAgenticWorkflowAimlTriggerComponent,
        data: {
            breadcrumb: {
                title: 'Execute',
            },
        },
    },
]

export const ORCHESTRATION_WORKFLOW_CRUD_ROUTES: Routes = [

    // Added at orchestartion level to remove tabs and make these as indvidual tabs
    {
        path: 'orchestration/workflows/create',
        component: OrchestrationWorkflowCrudComponent,
        data: {
            breadcrumb: {
                title: 'Workflow',
            },
        },
    },
    {
        path: 'orchestration/workflows/new-workflow',
        component: OrchestrationWorkflowPocComponent,
        data: {
            breadcrumb: {
                title: 'Workflow',
            },
        },
    },
    {
        path: 'orchestration/workflows/:id/edit',
        component: OrchestrationWorkflowCrudComponent,
        data: {
            breadcrumb: {
                title: 'Workflow',
            },
        },
    },
    {
        path: 'orchestration/workflows/new-workflow/:id/edit',
        component: OrchestrationWorkflowPocComponent,
        data: {
            breadcrumb: {
                title: 'Workflow',
            },
        },
    },
    {
        path: 'orchestration/workflows/crud',
        component: OrchestrationWorkflowCrudPocComponent,
        data: {
            breadcrumb: {
                title: 'Workflow',
            },
        },
    },
    {
        path: 'orchestration/workflows/agentic-workflow',
        component: OrchestrationAgenticWorkflowContainerComponent,
        data: {
            breadcrumb: {
                title: 'Workflow',
            },
        },
    },
    {
        path: 'orchestration/workflows/agentic-workflow/:id/edit',
        component: OrchestrationAgenticWorkflowContainerComponent,
        data: {
            breadcrumb: {
                title: 'Workflow',
            },
        },
    }
]

// export const ORCHESTRATION_WORKFLOW_ON_CHAT: Routes = [
//     {
//         path: 'orchestration/workflows/:workflowId/on-chat',
//         component: OrchestrationWorkflowsOnChatComponent,
//         data: {
//             breadcrumb: {
//                 title: 'On Chat',
//             },
//         },
//     },
// ]