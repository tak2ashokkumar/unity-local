import { Routes } from "@angular/router";
import { OrchestrationIntegrationComponent } from "./orchestration-integration.component";
import { OrchestrationIntegrationDetailsComponent } from "./orchestration-integration-details/orchestration-integration-details.component";
import { OrchestrationIntegrationDetailsPlaybookComponent } from "./orchestration-integration-details/orchestration-integration-details-playbook/orchestration-integration-details-playbook.component";
import { OrchestrationIntegrationDetailsHistoryComponent } from "./orchestration-integration-details/orchestration-integration-details-history/orchestration-integration-details-history.component";
import { OrchestrationIntegrationDetailsCrudComponent } from "./orchestration-integration-details/orchestration-integration-details-crud/orchestration-integration-details-crud.component";
import { OrchestrationIntegrationDetailsActivitylogsComponent } from "./orchestration-integration-details/orchestration-integration-details-activitylogs/orchestration-integration-details-activitylogs.component";
import { UnityCodeEditorComponent } from "src/app/shared/unity-code-editor/unity-code-editor.component";
import { PyodideEditorComponent } from "src/app/shared/pyodide-editor/pyodide-editor.component";
import { AceEditorComponent } from "src/app/shared/ace-editor/ace-editor.component";

export const ORCHESTRATION_INTEGRATION_ROUTES: Routes = [
    {
        path: 'integration',
        component: OrchestrationIntegrationComponent,
        data: {
            breadcrumb: {
                title: 'Integration',
                stepbackCount: 0
            }
        }
    },
    {
        path: 'integration/:repoId/details',
        component: OrchestrationIntegrationDetailsComponent,
        data: {
            breadcrumb: {
                title: 'View Details'
            }
        },
    },
    {
        path: 'integration/:repoId/details/load-scripts',
        component: UnityCodeEditorComponent,
        data: {
            breadcrumb: {
                title: 'Load Script',
                stepbackCount: 0
            }
        }
    },
    {
        path: 'integration/editor/ace',
        component: AceEditorComponent,
        data: {
            breadcrumb: {
                title: 'Ace Editor',
                stepbackCount: 0
            }
        }
    },
    {
        path: 'integration/editor/pyodide',
        component: PyodideEditorComponent,
        data: {
            breadcrumb: {
                title: 'Pyodide Editor',
                stepbackCount: 0
            }
        }
    },
    {
        path: 'integration/:repoId/details/create',
        component: OrchestrationIntegrationDetailsCrudComponent,
        data: {
            breadcrumb: {
                title: 'Create Script',
                stepbackCount: 0
            }
        }
    },
    {
        path: 'integration/:repoId/details/edit/:scriptId',
        component: OrchestrationIntegrationDetailsCrudComponent,
        data: {
            breadcrumb: {
                title: 'Edit Script',
                stepbackCount: 0
            }
        }
    },
    {
        path: 'integration/:repoId/details/activitylog/:scriptId',
        component: OrchestrationIntegrationDetailsActivitylogsComponent,
        data: {
            breadcrumb: {
                title: 'Activity Logs',
                stepbackCount: 0
            }
        }
    },
]