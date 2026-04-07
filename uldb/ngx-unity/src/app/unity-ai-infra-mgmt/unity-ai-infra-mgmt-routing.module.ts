import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GpuOrchestrationCrudComponent } from './gpu-orchestration/gpu-orchestration-crud/gpu-orchestration-crud.component';
import { GpuOrchestrationComponent } from './gpu-orchestration/gpu-orchestration.component';
import { LifecycleManagementComponent } from './lifecycle-management/lifecycle-management.component';
import { PreconfiguredAiStackComponent } from './preconfigured-ai-stack/preconfigured-ai-stack.component';
import { UnityAiInfraMgmtStorageComponent } from './unity-ai-infra-mgmt-storage/unity-ai-infra-mgmt-storage.component';
import { WorkloadManagementComponent } from './workload-management/workload-management.component';

const routes: Routes = [
  {
    path: 'lifecycle-management',
    component: LifecycleManagementComponent,
    data: {
      breadcrumb: {
        title: 'Lifecycle Management',
        stepbackCount: 0
      }
    }
  },
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
    component: UnityAiInfraMgmtStorageComponent,
    data: {
      breadcrumb: {
        title: 'Storage',
        stepbackCount: 0
      }
    }
  },
  {
    path: 'ai-stack',
    component: PreconfiguredAiStackComponent,
    data: {
      breadcrumb: {
        title: 'AI Stack',
        stepbackCount: 0
      }
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UnityAiInfraMgmtRoutingModule { }
