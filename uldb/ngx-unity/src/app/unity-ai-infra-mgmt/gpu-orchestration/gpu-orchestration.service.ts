import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { GpuContainer, GPU_CONTAINERS_DATA } from './gpu-orchestration.constants';

@Injectable()
export class GpuOrchestrationService {

    getContainers(): Observable<GpuContainer[]> {
        return of(GPU_CONTAINERS_DATA);
    }
}
