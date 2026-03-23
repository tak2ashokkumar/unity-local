import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { NutanixStorageContainerDetailsType } from 'src/app/shared/SharedEntityTypes/nutanix.type';

@Injectable()
export class NutanixStorageContainersDetailsService {
  
  constructor(private http: HttpClient,
    private builder: FormBuilder) { }

  getDeviceDetails(vmId: string, pcID: string): Observable<NutanixStorageContainerDetailsType> {
    return this.http.get<NutanixStorageContainerDetailsType>(`customer/nutanix/${pcID}/storage_containers/${vmId}/`);   
  }

  buildForm(data: NutanixStorageContainerDetailsType): FormGroup {
    return this.builder.group({
      'name': [data.name, [Validators.required]],
      'uuid': [data.uuid, [Validators.required]],
      'replication_factor': [data.replication_factor, [Validators.required]],
      'compression': [data.compression, [Validators.required]],
      'erasure_code': [data.erasure_code, [Validators.required]],
      'cache_deduplication': [data.erasure_code, [Validators.required]],
      'free_space': [data.free_space, [Validators.required]],
      'used_space': [data.used_space, [Validators.required]],
      'max_capacity': [data.max_capacity, [Validators.required]],
      'reserved_capacity': [data.reserved_capacity, [Validators.required]],
      'controller_iops': [data.controller_iops, [Validators.required]],
      'controller_bw': [data.controller_bw, [Validators.required]],
      'controller_latency': [data.controller_latency, [Validators.required]],
      'data_reduction_ratio': [data.data_reduction_ratio, [Validators.required]],
      'overall_efficiency': [data.overall_efficiency, [Validators.required]],
      'data_reduction_savings': [data.data_reduction_savings, [Validators.required]],
      'effective_free': [data.effective_free, [Validators.required]],
      'filesystem_whitelists': [data.filesystem_whitelists, [Validators.required]],
    });
  }

  resetDetailFormErrors(): any {
    return {
      'name':'',
      'uuid':'',
      'replication_factor':'',
      'compression':'',
      'erasure_code':'',
      'cache_deduplication':'',
      'free_space':'',
      'used_space':'',
      'max_capacity':'',
      'reserved_capacity':'',
      'controller_iops':'',
      'controller_bw':'',
      'controller_latency':'',
      'data_reduction_ratio':'',
      'overall_efficiency':'',
      'data_reduction_savings':'',
      'effective_free':'',
      'filesystem_whitelists':''
    };
  }

  detailFormValidationMessages = {
    'name': {
      'required': 'Name is required'
    },
    'replication_factor': {
      'required': 'Replication Factor is required'
    },
    'compression': {
      'required': 'Compression is required'
    },
    'erasure_code': {
      'required': 'Erasure Code is required'
    },
    'cache_deduplication': {
      'required': 'Cache Deduplication is required'
    },
    'free_space': {
      'required': 'Free Space is required'
    },
    'used_space': {
      'required': 'Used Spaceis required'
    },
    'max_capacity': {
      'required': 'Max Capacity is required'
    },
    'reserved_capacity': {
      'required': 'Reserved Capacity is required'
    },
    'controller_iops': {
      'required': 'Controller Iops is required'
    },
    'controller_bw': {
      'required': 'Controller Bandwidth is required'
    },
    'controller_latency': {
      'required': 'Controller Latency is required'
    },
    'data_reduction_ratio': {
      'required': 'Data Reduction Ratio is required'
    },
    'overall_efficiency': {
      'required': 'Overall Efficiency is required'
    },
    'effective_free': {
      'required': 'Effective Free is required'
    },
    'filesystem_whitelists': {
      'required': 'Filesystem Whitelists is required'
    },
  };
}