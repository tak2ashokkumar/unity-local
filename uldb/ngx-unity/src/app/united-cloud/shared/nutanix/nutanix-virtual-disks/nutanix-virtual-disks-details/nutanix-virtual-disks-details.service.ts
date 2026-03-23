import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { NutanixVirtualDiskDetailsType } from 'src/app/shared/SharedEntityTypes/nutanix.type';

@Injectable()
export class NutanixVirtualDisksDetailsService {

  constructor(private http: HttpClient,
    private builder: FormBuilder) { }
  getDeviceDetails(vmId: string, pcID: string): Observable<NutanixVirtualDiskDetailsType> {
    return this.http.get<NutanixVirtualDiskDetailsType>(`customer/nutanix/${pcID}/virtual_disks/${vmId}/`);
  }

  buildForm(data: NutanixVirtualDiskDetailsType): FormGroup {
    return this.builder.group({
      'name': [data.name, [Validators.required]],
      'uuid': [data.uuid, [Validators.required]],
      'flash_mode': [data.flash_mode, [Validators.required]],
      'total_capacity': [data.total_capacity, [Validators.required]],
      'read_iops': [data.read_iops, [Validators.required]],
      'read_latency': [data.read_latency, [Validators.required]],
      'write_iops': [data.write_iops, [Validators.required]],
      'write_latency': [data.write_latency, [Validators.required]],
      'write_bw': [data.write_bw, [Validators.required]],
      'read_source_ssd': [data.read_source_ssd, [Validators.required]],
      'random_io': [data.random_io, [Validators.required]],
      'total_iops': [data.total_iops, [Validators.required]],
      'read_source_cache': [data.read_source_cache, [Validators.required]],
      'read_source_hdd': [data.read_source_hdd, [Validators.required]],
      'read_working_set_size': [data.read_working_set_size, [Validators.required]],
      'write_working_set_size': [data.write_working_set_size, [Validators.required]],
      'union_working_set_size': [data.union_working_set_size, [Validators.required]],
    });
  }

  resetDetailFormErrors(): any {
    return {
      'name': '',
      'uuid': '',
      'power_state': '',
      'cluster': '',
      'host_name': '',
      'host_uuid': '',
      'cores': '',
      'memory_capacity': '',
      'total_storage': '',
      'used_storage': '',
      'cpu_usage': '',
      'memory_usage': '',
      'controller_write_iops': '',
      'controller_bandwidth': '',
      'controller_avg_latency': '',
      'flash_mode': '',
      'description': '',
      'virtual_disks': '',
      'ngt_enabled': '',
      'ngt_mounted': '',
      'vm_id': '',
      'protection_status': '',
      'network_adapters': '',
      'cluster_uuid': '',
      'ip_address': '',
      'controller_read_iops': '',
    };
  }

  detailFormValidationMessages = {
    'name': {
      'required': 'Name is required'
    },
    'uuid': {
      'required': 'UUID is required'
    },
    'power_state': {
      'required': 'Power State is required'
    },
    'host_name': {
      'required': 'Host Name is required'
    },
    'host_uuid': {
      'required': 'Host UUID is required'
    },
    'cores': {
      'required': 'Cores is required'
    },
    'memory_capacity': {
      'required': 'Memory Capacity is required'
    },
    'total_storage': {
      'required': 'Total Storage is required'
    },
    'used_storage': {
      'required': 'Used Storage is required'
    },
    'cpu_usage': {
      'required': 'CPU Usage is required'
    },
    'memory_usage': {
      'required': 'Memory Usage is required'
    },
    'controller_write_iops': {
      'required': 'Controller Write IOPS is required'
    },
    'controller_bandwidth': {
      'required': 'Controller Bandwidth is required'
    },
    'controller_avg_latency': {
      'required': 'Controller Avg Latency is required'
    },
    'flash_mode': {
      'required': 'Flash Mode is required'
    },
    'description': {
      'required': 'Description is required'
    },
    'virtual_disks': {
      'required': 'Virtual Disks is required'
    },
    'ngt_enabled': {
      'required': 'NGT Enabled is required'
    },
    'ngt_mounted': {
      'required': 'NGT Mounted is required'
    },
    'vm_id': {
      'required': 'VM ID is required'
    },
    'protection_status': {
      'required': 'Protection Status is required'
    },
    'network_adapters': {
      'required': 'Network Adapters is required'
    },
    'cluster_uuid': {
      'required': 'Cluster UUID is required'
    }
  };
}