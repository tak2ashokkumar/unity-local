import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { forkJoin, Observable, of } from 'rxjs';
import {
    GPU_ACCOUNTS,
    GPU_CONTAINER_FORM_VALIDATION_MESSAGES,
    GPU_COUNTS,
    GPU_ENVIRONMENTS,
    GPU_OS_IMAGES,
    GPU_REGIONS,
    GPU_STORAGE_SIZES,
    GPU_TYPES,
    GPU_VCPUS,
    GPU_VRAM_OPTIONS,
    MOCK_GPU_CONTAINER_DETAIL
} from './gpu-orchestration-crud.constants';

@Injectable()
export class GpuOrchestrationCrudService {

    constructor(private builder: FormBuilder) { }

    getGpuContainerDetails(_id: string): Observable<any> {
        // Stubbed: Replace with actual endpoint
        return of(MOCK_GPU_CONTAINER_DETAIL);
    }

    getDropdownData(): Observable<any> {
        return forkJoin({
            environments: of(GPU_ENVIRONMENTS),
            accounts:     of(GPU_ACCOUNTS),
            regions:      of(GPU_REGIONS),
            gpuTypes:     of(GPU_TYPES),
            gpuCounts:    of(GPU_COUNTS),
            vcpus:        of(GPU_VCPUS),
            vramOptions:  of(GPU_VRAM_OPTIONS),
            osImages:     of(GPU_OS_IMAGES),
            storageSizes: of(GPU_STORAGE_SIZES),
        });
    }

    buildForm(data: any): FormGroup {
        return this.builder.group({
            vm_name:        [data ? data.vm_name        : '', [Validators.required]],
            environment:    [data ? data.environment    : '', [Validators.required]],
            account:        [data ? data.account        : '', [Validators.required]],
            account_region: [data ? data.account_region : '', [Validators.required]],
            gpu_type:       [data ? data.gpu_type       : '', [Validators.required]],
            gpu_count:      [data ? data.gpu_count      : '', [Validators.required]],
            vcpus:          [data ? data.vcpus          : '', [Validators.required]],
            vram:           [data ? data.vram           : '', [Validators.required]],
            os_image:       [data ? data.os_image       : '', [Validators.required]],
            storage_size:   [data ? data.storage_size   : '', [Validators.required]],
        });
    }

    resetFormErrors() {
        return {
            vm_name:        '',
            environment:    '',
            account:        '',
            account_region: '',
            gpu_type:       '',
            gpu_count:      '',
            vcpus:          '',
            vram:           '',
            os_image:       '',
            storage_size:   '',
        };
    }

    formValidationMessages = GPU_CONTAINER_FORM_VALIDATION_MESSAGES;

    createGpuContainer(data: any): Observable<any> {
        // Stubbed
        return of(data);
    }

    updateGpuContainer(_id: string, data: any): Observable<any> {
        // Stubbed
        return of(data);
    }
}
