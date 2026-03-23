import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { NutanixStoragePoolType } from 'src/app/shared/SharedEntityTypes/nutanix.type';

@Injectable()
export class NutanixStoragePoolsDetailsService {

  constructor(private http: HttpClient,
    private builder: FormBuilder) { }

  getDeviceDetails(pcID: string, spId: string, ): Observable<NutanixStoragePoolType> {
    return this.http.get<NutanixStoragePoolType>(`customer/nutanix/${pcID}/storage_pools/${spId}/`);
  }

  buildForm(data: NutanixStoragePoolType): FormGroup {
    return this.builder.group({
      'name': [data.name, [Validators.required]],
      'uuid': [data.uuid, [Validators.required]],
      'disks': [data.disks, [Validators.required]],
      'total_storage': [data.total_storage, [Validators.required]],
      'used_storage': [data.used_storage, [Validators.required]],
      'free_storage': [data.free_space, [Validators.required]],
      'free_storage_pct': [data.free_storage_pct, [Validators.required]],
      'controller_iops': [data.controller_iops, [Validators.required]],
      'controller_latency': [data.controller_latency, [Validators.required]],
      'controller_bandwidth': [data.controller_bw, [Validators.required]]
    });
  }

  resetDetailFormErrors(): any {
    return {
      'name': '',
      'disks': '',
      'total_storage': '',
      'used_storage': '',
      'free_storage': '',
      'free_storage_pct': '',
      'controller_iops': '',
      'controller_latency': '',
      'controller_bandwidth': ''
    };
  }

  detailFormValidationMessages = {
    'name': {
      'required': 'Name is required'
    },
    'disks': {
      'required': 'Disk is required'
    },
    'total_storage': {
      'required': 'Total Storage is required'
    },
    'used_storage': {
      'required': 'Used Storage is required'
    },
    'free_storage': {
      'required': 'Storage is required'
    },
    'free_storage_pct': {
      'required': 'Storage Percentage is required'
    },
    'controller_iops': {
      'required': 'Controller IOPS is required'
    },
    'controller_bandwidth': {
      'required': 'Controller Bandwidth is required'
    },
    'controller_latency': {
      'required': 'Controller Latency is required'
    }
  };
}