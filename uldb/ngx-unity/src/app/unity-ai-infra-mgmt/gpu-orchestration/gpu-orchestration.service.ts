import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { GPU_CONTAINERS_DATA, GpuContainer } from './gpu-orchestration.constants';

@Injectable()
export class GpuOrchestrationService {

  constructor() { }

  getContainers(): Observable<GpuContainer[]> {
    return of(GPU_CONTAINERS_DATA);
  }
}
