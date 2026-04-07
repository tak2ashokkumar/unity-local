import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EchartsxModule } from 'echarts-for-angular';
import { SharedModule } from '../shared/shared.module';
import { GpuOrchestrationCrudComponent } from './gpu-orchestration/gpu-orchestration-crud/gpu-orchestration-crud.component';
import { GpuOrchestrationComponent } from './gpu-orchestration/gpu-orchestration.component';
import { LifecycleManagementComponent } from './lifecycle-management/lifecycle-management.component';
import { PreconfiguredAiStackComponent } from './preconfigured-ai-stack/preconfigured-ai-stack.component';
import { UnityAiInfraMgmtRoutingModule } from './unity-ai-infra-mgmt-routing.module';
import { UnityAiInfraMgmtStorageComponent } from './unity-ai-infra-mgmt-storage/unity-ai-infra-mgmt-storage.component';
import { WorkloadManagementComponent } from './workload-management/workload-management.component';


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
