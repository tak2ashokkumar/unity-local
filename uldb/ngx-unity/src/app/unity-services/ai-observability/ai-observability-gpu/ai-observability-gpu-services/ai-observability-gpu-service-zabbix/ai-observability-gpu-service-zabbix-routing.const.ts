import { Routes } from "@angular/router";
import { AiObservabilityGpuServiceDetailsComponent } from "./ai-observability-gpu-service-details/ai-observability-gpu-service-details.component";
import { AiObservabilityGpuServiceGraphsComponent } from "./ai-observability-gpu-service-graphs/ai-observability-gpu-service-graphs.component";
import { AiObservabilityGpuServiceGraphsCrudComponent } from "./ai-observability-gpu-service-graphs-crud/ai-observability-gpu-service-graphs-crud.component";
import { AiObservabilityGpuServiceMetricesComponent } from "./ai-observability-gpu-service-metrices/ai-observability-gpu-service-metrices.component";



export const GPU_SERVICE_ZABBIX_ROUTES: Routes = [
  {
    path: 'details',
    component: AiObservabilityGpuServiceDetailsComponent,
    data: {
      breadcrumb: {
        title: 'Details',
        stepbackCount: 0
      }
    }
  },
  {
    path: 'monitoring-graphs',
    component: AiObservabilityGpuServiceGraphsComponent,
    data: {
      breadcrumb: {
        title: 'Graphs',
        stepbackCount: 0
      }
    }
  },
  {
    path: 'manage-graphs',
    component: AiObservabilityGpuServiceGraphsCrudComponent,
    data: {
      breadcrumb: {
        title: 'Create Graph',
        stepbackCount: 0
      }
    }
  },
  {
    path: 'metrics',
    component: AiObservabilityGpuServiceMetricesComponent,
    data: {
      breadcrumb: {
        title: 'Metrices',
        stepbackCount: 0
      }
    }
  },
];