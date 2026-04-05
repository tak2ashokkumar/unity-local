import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UnityAiLifecycleRoutingModule } from './unity-ai-lifecycle-routing.module';
import { WorkloadManagementComponent } from './workload-management/workload-management.component';
import { UnityAiLifecycleStorageComponent } from './unity-ai-lifecycle-storage/unity-ai-lifecycle-storage.component';
import { SharedModule } from '../shared/shared.module';
import { EchartsxModule } from 'echarts-for-angular';
import { GpuOrchestrationComponent } from './gpu-orchestration/gpu-orchestration.component';
import { GpuOrchestrationCrudComponent } from './gpu-orchestration/gpu-orchestration-crud/gpu-orchestration-crud.component';


@NgModule({
  declarations: [
    WorkloadManagementComponent,
    UnityAiLifecycleStorageComponent,
    GpuOrchestrationComponent,
    GpuOrchestrationCrudComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    EchartsxModule,
    UnityAiLifecycleRoutingModule
  ]
})
export class UnityAiLifecycleModule { }
