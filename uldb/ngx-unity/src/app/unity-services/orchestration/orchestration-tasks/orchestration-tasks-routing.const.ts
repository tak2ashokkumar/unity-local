import { Routes } from "@angular/router";
import { OrchestrationTasksComponent } from "./orchestration-tasks.component";
import { OrchestrationTasksCrudComponent } from "./orchestration-tasks-crud/orchestration-tasks-crud.component";
import { OrchestrationTasksScheduleComponent } from "./orchestration-tasks-schedule/orchestration-tasks-schedule.component";
import { OrchestrationTaskExecuteComponent } from "./orchestration-task-execute/orchestration-task-execute.component";

export const ORCHESTRATION_TASKS_ROUTES: Routes = [
    {
        path: 'tasks',
        component: OrchestrationTasksComponent,
        data: {
            breadcrumb: {
                title: 'Tasks',
                stepbackCount: 0
            }
        }
    },
    {
        path: 'tasks/:categoryId',
        component: OrchestrationTasksComponent,
        data: {
            breadcrumb: {
                title: 'Tasks',
                stepbackCount: 0
            }
        }
    },
    {
        path: 'tasks/category/create',
        component: OrchestrationTasksCrudComponent,
        data: {
            breadcrumb: {
                title: 'Add',
                stepbackCount: 0
            }
        },
    },
    {
        path: 'tasks/:categoryId/category/create',
        component: OrchestrationTasksCrudComponent,
        data: {
            breadcrumb: {
                title: 'Add',
                stepbackCount: 0
            }
        },
    },
    {
        path: 'tasks/:categoryId/category/:taskId/edit',
        component: OrchestrationTasksCrudComponent,
        data: {
            breadcrumb: {
                title: 'Edit',
                stepbackCount: 0
            }
        }
    },
    {
        path: 'tasks/:taskId/edit',
        component: OrchestrationTasksCrudComponent,
        data: {
            breadcrumb: {
                title: 'Edit',
                stepbackCount: 0
            }
        }
    },
    {
        path: 'tasks/:taskId/:targetType/scheduleTasks',
        component: OrchestrationTasksScheduleComponent,
        data: {
            breadcrumb: {
                title: 'Schedule',
                stepbackCount: 0
            }
        }
    },
    {
        path: 'tasks/:categoryId/category/:taskId/:targetType/scheduleTasks',
        component: OrchestrationTasksScheduleComponent,
        data: {
            breadcrumb: {
                title: 'Schedule',
                stepbackCount: 0
            }
        }
    },
    {
        path: 'tasks/:taskId/:targetType/execute',
        component: OrchestrationTaskExecuteComponent,
        data: {
            breadcrumb: {
                title: 'Execute',
                stepbackCount: 0
            }
        }
    },
    {
        path: 'tasks/:categoryId/category/:taskId/:targetType/execute',
        component: OrchestrationTaskExecuteComponent,
        data: {
            breadcrumb: {
                title: 'Execute',
                stepbackCount: 0
            }
        }
    },
    {
        path: 'tasks/:categoryId/category/integration/:repoId/history/:taskId/execute',
        component: OrchestrationTaskExecuteComponent,
        data: {
            breadcrumb: {
                title: 'Execute',
                stepbackCount: 0
            }
        }
    },
]
