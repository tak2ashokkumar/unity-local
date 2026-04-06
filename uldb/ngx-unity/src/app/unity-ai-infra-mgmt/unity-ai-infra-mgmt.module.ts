import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UnityAiInfraMgmtRoutingModule } from './unity-ai-infra-mgmt-routing.module';
import { WorkloadManagementComponent } from './workload-management/workload-management.component';
import { UnityAiInfraMgmtStorageComponent } from './unity-ai-infra-mgmt-storage/unity-ai-infra-mgmt-storage.component';
import { SharedModule } from '../shared/shared.module';
import { EchartsxModule } from 'echarts-for-angular';
import { GpuOrchestrationComponent } from './gpu-orchestration/gpu-orchestration.component';
import { GpuOrchestrationCrudComponent } from './gpu-orchestration/gpu-orchestration-crud/gpu-orchestration-crud.component';
import { LifecycleManagementComponent } from './lifecycle-management/lifecycle-management.component';
import { PreconfiguredAiStackComponent } from './preconfigured-ai-stack/preconfigured-ai-stack.component';


@NgModule({
  declarations: [
    WorkloadManagementComponent,
    UnityAiInfraMgmtStorageComponent,
    GpuOrchestrationComponent,
    GpuOrchestrationCrudComponent,
    LifecycleManagementComponent,
    PreconfiguredAiStackComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    EchartsxModule,
    FormsModule,
    ReactiveFormsModule,
    UnityAiInfraMgmtRoutingModule
  ]
})
export class UnityAiInfraMgmtModule { }
