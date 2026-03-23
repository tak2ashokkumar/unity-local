import { Routes } from "@angular/router";
import { OrchestrationInputTemplateComponent } from "./orchestration-input-template.component";
import { OrchestrationInputCrudComponent } from "./orchestration-input-crud/orchestration-input-crud.component";

export const ORCHESTRATION_INPUT_TEMPLATE_ROUTES: Routes = [
    {
        path: 'input-template',
        component: OrchestrationInputTemplateComponent,
        data: {
            breadcrumb: {
                title: 'Input Template',
                stepbackCount: 0
            }
        }
    },
    {
        path: 'input-template/crud',
        component: OrchestrationInputCrudComponent,
        data: {
            breadcrumb: {
                title: 'Create Input Template'
            }
        }
    },
    {
        path: 'input-template/:templateId/edit',
        component: OrchestrationInputCrudComponent,
        data: {
            breadcrumb: {
                title: 'Update Input Template'
            }
        }
    },
]