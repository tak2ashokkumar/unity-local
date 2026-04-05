import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WorkloadManagementComponent } from './workload-management/workload-management.component';
import { UnityAiLifecycleStorageComponent } from './unity-ai-lifecycle-storage/unity-ai-lifecycle-storage.component';
import { GpuOrchestrationComponent } from './gpu-orchestration/gpu-orchestration.component';
import { GpuOrchestrationCrudComponent } from './gpu-orchestration/gpu-orchestration-crud/gpu-orchestration-crud.component';

const routes: Routes = [
  {
    path: 'gpu-orchestration',
    component: GpuOrchestrationComponent,
    data: {
      breadcrumb: {
        title: 'GPU Orchestration',
        stepbackCount: 0
      }
    }
  },
  {
    path: 'gpu-orchestration/create',
    component: GpuOrchestrationCrudComponent,
    data: {
      breadcrumb: {
        title: 'Create GPU Container',
        stepbackCount: 1
      }
    }
  },
  {
    path: 'gpu-orchestration/:id/edit',
    component: GpuOrchestrationCrudComponent,
    data: {
      breadcrumb: {
        title: 'Update GPU Container',
        stepbackCount: 1
      }
    }
  },
  {
    path: 'workload-management',
    component: WorkloadManagementComponent,
    data: {
      breadcrumb: {
        title: 'Workload Management',
        stepbackCount: 0
      }
    }
  },
  {
    path: 'storage',
    component: UnityAiLifecycleStorageComponent,
    data: {
      breadcrumb: {
        title: 'Storage',
        stepbackCount: 0
      }
    }
  },
  // {
  //   path: 'preconfigured-ai-stack',
  //   component: PreconfiguredAiStackComponent,
  //   data: {
  //     breadcrumb: {
  //       title: 'Preconfigured AI Stack',
  //       stepbackCount: 0
  //     }
  //   }
  // }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UnityAiLifecycleRoutingModule { }
